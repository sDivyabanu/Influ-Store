import { Prisma, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from "@/lib/errors";
import { slugify, withUniqueSuffix } from "@/lib/utils/slug";
import { DEFAULT_PRODUCT_CURRENCY, MY_PRODUCTS_PAGE_SIZE, SKU_MAX_LENGTH } from "@/lib/constants/product";
import {
  CreateProductInput,
  ProductOptionInput,
  ProductVariantInput,
  UpdateProductInput,
} from "@/lib/validations/product.schema";
import { CursorPage } from "@/types/post";
import { ProductDetailItem, ProductListItem } from "@/types/product";
import {
  computeProductAggregates,
  productDetailInclude,
  productListInclude,
  serializeProductDetail,
  serializeProductListItem,
} from "./product-shared";

type NormalizedVariant = {
  sku: string;
  price: number;
  stock: number;
  isActive: boolean;
  optionValues: Record<string, string>;
};

/**
 * Validates the option/variant tree as a whole (not just per-field shape,
 * which zod already covers) and normalizes it into a form ready to
 * persist: every variant's option-value combination is checked against
 * the declared options, duplicate combinations are rejected, and SKUs are
 * de-duplicated within the request (auto-generating one where omitted).
 */
function normalizeAndValidateCatalog(
  productName: string,
  options: ProductOptionInput[],
  variants: ProductVariantInput[]
): { options: ProductOptionInput[]; variants: NormalizedVariant[] } {
  const optionNames = options.map((o) => o.name.trim());
  const lowerNames = optionNames.map((n) => n.toLowerCase());
  if (new Set(lowerNames).size !== lowerNames.length) {
    throw new BadRequestError("Option names must be unique.");
  }
  for (const option of options) {
    const lowerValues = option.values.map((v) => v.trim().toLowerCase());
    if (new Set(lowerValues).size !== lowerValues.length) {
      throw new BadRequestError(`Values for option "${option.name}" must be unique.`);
    }
  }

  if (options.length === 0) {
    // A product without options is the sanctioned "simple product"
    // pattern — exactly one default variant, with no option values.
    if (variants.length !== 1) {
      throw new BadRequestError("A product without options must have exactly one variant.");
    }
    if (variants[0].optionValues && Object.keys(variants[0].optionValues).length > 0) {
      throw new BadRequestError("This product has no options; the variant cannot specify option values.");
    }
  } else {
    const optionValueSets = new Map(options.map((o) => [o.name.trim(), new Set(o.values.map((v) => v.trim()))]));
    const seenCombos = new Set<string>();

    for (const variant of variants) {
      const chosen = variant.optionValues ?? {};
      const chosenKeys = Object.keys(chosen);
      if (chosenKeys.length !== optionNames.length || !optionNames.every((name) => name in chosen)) {
        throw new BadRequestError("Every variant must specify a value for each product option.");
      }
      for (const [name, value] of Object.entries(chosen)) {
        const allowed = optionValueSets.get(name);
        if (!allowed || !allowed.has(value)) {
          throw new BadRequestError(`"${value}" is not a declared value for option "${name}".`);
        }
      }
      const comboKey = optionNames.map((name) => chosen[name]).join("::");
      if (seenCombos.has(comboKey)) {
        throw new BadRequestError("Two variants cannot share the same option combination.");
      }
      seenCombos.add(comboKey);
    }
  }

  const seenSkus = new Set<string>();
  const normalizedVariants: NormalizedVariant[] = variants.map((variant) => {
    let sku = variant.sku?.trim();
    if (!sku) {
      sku = withUniqueSuffix(slugify(productName, 20)).toUpperCase().slice(0, SKU_MAX_LENGTH);
    }
    const key = sku.toLowerCase();
    if (seenSkus.has(key)) {
      throw new BadRequestError(`Duplicate SKU "${sku}" in this request.`);
    }
    seenSkus.add(key);

    return {
      sku,
      price: variant.price,
      stock: variant.stock,
      isActive: variant.isActive ?? true,
      optionValues: variant.optionValues ?? {},
    };
  });

  return { options, variants: normalizedVariants };
}

async function persistCatalog(
  tx: Prisma.TransactionClient,
  productId: string,
  sellerProfileId: string,
  options: ProductOptionInput[],
  variants: NormalizedVariant[]
): Promise<void> {
  const optionValueIdByKey = new Map<string, string>();

  for (const [index, option] of options.entries()) {
    const createdOption = await tx.productOption.create({
      data: { productId, name: option.name.trim(), order: index },
    });
    for (const [valueIndex, value] of option.values.entries()) {
      const createdValue = await tx.productOptionValue.create({
        data: { optionId: createdOption.id, value: value.trim(), order: valueIndex },
      });
      optionValueIdByKey.set(`${option.name.trim()}::${value.trim()}`, createdValue.id);
    }
  }

  for (const variant of variants) {
    const createdVariant = await tx.productVariant.create({
      data: {
        productId,
        sellerProfileId,
        sku: variant.sku,
        price: variant.price,
        stock: variant.stock,
        isActive: variant.isActive,
        isDefault: options.length === 0,
      },
    });
    for (const [optionName, value] of Object.entries(variant.optionValues)) {
      const optionValueId = optionValueIdByKey.get(`${optionName}::${value}`);
      if (!optionValueId) continue; // already validated to exist
      await tx.variantOptionValue.create({ data: { variantId: createdVariant.id, optionValueId } });
    }
  }
}

function translateUniqueConstraintError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    const target = Array.isArray(error.meta?.target)
      ? (error.meta.target as string[]).join(",")
      : String(error.meta?.target ?? "");
    if (target.includes("sku")) {
      throw new ConflictError("One of these SKUs is already in use in your store.");
    }
    throw new ConflictError("A product conflict occurred. Please try again.");
  }
  throw error;
}

export async function createProduct(sellerProfileId: string, input: CreateProductInput): Promise<ProductDetailItem> {
  const { options, variants } = normalizeAndValidateCatalog(input.name, input.options ?? [], input.variants);
  const currency = input.currency ?? DEFAULT_PRODUCT_CURRENCY;
  const { basePrice, totalStock } = computeProductAggregates(variants);
  const slug = withUniqueSuffix(slugify(input.name));

  let productId: string;
  try {
    productId = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          sellerProfileId,
          name: input.name.trim(),
          slug,
          description: input.description?.trim() || null,
          category: input.category,
          currency,
          compareAtPrice: input.compareAtPrice ?? null,
          basePrice,
          totalStock,
        },
      });

      await persistCatalog(tx, product.id, sellerProfileId, options, variants);

      return product.id;
    });
  } catch (error) {
    translateUniqueConstraintError(error);
  }

  const product = await getMyProductById(productId, sellerProfileId);
  if (!product) throw new NotFoundError("Product not found after creation.");
  return product;
}

export async function updateProduct(
  productId: string,
  sellerProfileId: string,
  input: UpdateProductInput
): Promise<ProductDetailItem> {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerProfileId: true, name: true },
  });
  if (!existing) throw new NotFoundError("Product not found.");
  if (existing.sellerProfileId !== sellerProfileId) {
    throw new ForbiddenError("You can only edit your own products.");
  }

  const replacingCatalog = input.variants !== undefined || input.options !== undefined;
  const normalized = replacingCatalog
    ? normalizeAndValidateCatalog(input.name ?? existing.name, input.options ?? [], input.variants ?? [])
    : null;

  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name.trim();
  if (input.description !== undefined) data.description = input.description?.trim() || null;
  if (input.category !== undefined) data.category = input.category;
  if (input.currency !== undefined) data.currency = input.currency;
  if (input.compareAtPrice !== undefined) data.compareAtPrice = input.compareAtPrice ?? null;
  if (input.status !== undefined) {
    data.status = input.status;
    if (input.status === ProductStatus.ACTIVE) data.publishedAt = new Date();
  }

  try {
    await prisma.$transaction(async (tx) => {
      if (normalized) {
        // Variant IDs aren't referenced anywhere outside this product
        // (product tags point at the product, not a specific variant),
        // so a full replace is safe and far simpler than diffing the
        // option/variant tree.
        await tx.productVariant.deleteMany({ where: { productId } });
        await tx.productOption.deleteMany({ where: { productId } }); // cascades to option values

        await persistCatalog(tx, productId, sellerProfileId, normalized.options, normalized.variants);

        const { basePrice, totalStock } = computeProductAggregates(normalized.variants);
        data.basePrice = basePrice;
        data.totalStock = totalStock;
      }

      await tx.product.update({ where: { id: productId }, data });
    });
  } catch (error) {
    translateUniqueConstraintError(error);
  }

  const product = await getMyProductById(productId, sellerProfileId);
  if (!product) throw new NotFoundError("Product not found.");
  return product;
}

export async function deleteProduct(productId: string, sellerProfileId: string): Promise<void> {
  const existing = await prisma.product.findUnique({
    where: { id: productId },
    select: { sellerProfileId: true, media: { select: { storageKey: true } } },
  });
  if (!existing) throw new NotFoundError("Product not found.");
  if (existing.sellerProfileId !== sellerProfileId) {
    throw new ForbiddenError("You can only delete your own products.");
  }

  // Cascade deletes ProductMedia/ProductOption/ProductVariant/tag rows via FKs.
  await prisma.product.delete({ where: { id: productId } });

  const storage = getStorageService();
  await Promise.allSettled(existing.media.map((m) => storage.deleteFile(m.storageKey)));
}

export async function listMyProducts(
  sellerProfileId: string,
  cursor?: string | null,
  limit: number = MY_PRODUCTS_PAGE_SIZE,
  status?: ProductStatus
): Promise<CursorPage<ProductListItem>> {
  const products = await prisma.product.findMany({
    where: { sellerProfileId, ...(status ? { status } : {}) },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: productListInclude(),
  });

  const hasMore = products.length > limit;
  const page = hasMore ? products.slice(0, limit) : products;

  return {
    items: page.map(serializeProductListItem),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/** Returns null (not an error) on a not-found-or-not-mine id, so callers can 404 without leaking existence. */
export async function getMyProductById(
  productId: string,
  sellerProfileId: string
): Promise<ProductDetailItem | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: productDetailInclude(),
  });
  if (!product || product.sellerProfileId !== sellerProfileId) return null;
  return serializeProductDetail(product);
}
