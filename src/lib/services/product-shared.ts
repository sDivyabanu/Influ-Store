import { Prisma } from "@prisma/client";
import { toMoney } from "@/lib/utils/money";
import { ProductDetailItem, ProductListItem, ProductOptionItem, ProductVariantItem } from "@/types/product";

/**
 * Shared Prisma include shapes + serializers used by product.service.ts
 * (public marketplace reads) and seller-product.service.ts (seller
 * management), so a product's shape is computed identically everywhere.
 */

export function productListInclude() {
  return {
    media: { where: { order: 0 }, take: 1, select: { mediaUrl: true } },
    sellerProfile: { select: { storeName: true, slug: true, logoUrl: true } },
  } satisfies Prisma.ProductInclude;
}

export function productDetailInclude() {
  return {
    media: { orderBy: { order: "asc" } },
    sellerProfile: { select: { storeName: true, slug: true, logoUrl: true } },
    options: {
      orderBy: { order: "asc" },
      include: { values: { orderBy: { order: "asc" } } },
    },
    variants: {
      orderBy: { createdAt: "asc" },
      include: {
        optionValues: { include: { optionValue: { include: { option: true } } } },
      },
    },
  } satisfies Prisma.ProductInclude;
}

export type ProductWithListRelations = Prisma.ProductGetPayload<{
  include: ReturnType<typeof productListInclude>;
}>;

export type ProductWithDetailRelations = Prisma.ProductGetPayload<{
  include: ReturnType<typeof productDetailInclude>;
}>;

export function serializeProductListItem(product: ProductWithListRelations): ProductListItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    status: product.status,
    basePrice: toMoney(product.basePrice, product.currency),
    compareAtPrice: product.compareAtPrice ? toMoney(product.compareAtPrice, product.currency) : null,
    totalStock: product.totalStock,
    coverImageUrl: product.media[0]?.mediaUrl ?? null,
    createdAt: product.createdAt,
    seller: {
      storeName: product.sellerProfile.storeName,
      slug: product.sellerProfile.slug,
      logoUrl: product.sellerProfile.logoUrl,
    },
  };
}

function serializeOptions(options: ProductWithDetailRelations["options"]): ProductOptionItem[] {
  return options.map((option) => ({
    id: option.id,
    name: option.name,
    order: option.order,
    values: option.values.map((value) => ({ id: value.id, value: value.value, order: value.order })),
  }));
}

function serializeVariants(
  variants: ProductWithDetailRelations["variants"],
  currency: string
): ProductVariantItem[] {
  return variants.map((variant) => ({
    id: variant.id,
    sku: variant.sku,
    price: toMoney(variant.price, currency),
    stock: variant.stock,
    isActive: variant.isActive,
    isDefault: variant.isDefault,
    optionValues: variant.optionValues.reduce<Record<string, string>>((acc, vov) => {
      acc[vov.optionValue.option.name] = vov.optionValue.value;
      return acc;
    }, {}),
  }));
}

export function serializeProductDetail(product: ProductWithDetailRelations): ProductDetailItem {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: product.category,
    status: product.status,
    description: product.description,
    currency: product.currency,
    basePrice: toMoney(product.basePrice, product.currency),
    compareAtPrice: product.compareAtPrice ? toMoney(product.compareAtPrice, product.currency) : null,
    totalStock: product.totalStock,
    coverImageUrl: product.media[0]?.mediaUrl ?? null,
    createdAt: product.createdAt,
    updatedAt: product.updatedAt,
    publishedAt: product.publishedAt,
    seller: {
      storeName: product.sellerProfile.storeName,
      slug: product.sellerProfile.slug,
      logoUrl: product.sellerProfile.logoUrl,
    },
    media: product.media.map((m) => ({
      id: m.id,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      order: m.order,
      altText: m.altText,
    })),
    options: serializeOptions(product.options),
    variants: serializeVariants(product.variants, product.currency),
  };
}

/**
 * Product.basePrice/totalStock are a denormalized read cache recomputed
 * transactionally whenever a product's variants change — see the schema
 * comment on Product.basePrice for why. basePrice falls back to all
 * variants (not just active ones) when every variant is paused, so a
 * temporarily-unavailable product doesn't show as free in listings;
 * totalStock only ever counts stock that's actually purchasable.
 */
export function computeProductAggregates(
  variants: { price: Prisma.Decimal | number | string; stock: number; isActive: boolean }[]
): { basePrice: Prisma.Decimal; totalStock: number } {
  const activeVariants = variants.filter((v) => v.isActive);
  const pricePool = activeVariants.length > 0 ? activeVariants : variants;
  const prices = pricePool.map((v) => new Prisma.Decimal(v.price));
  const basePrice = prices.reduce((min, p) => (p.lessThan(min) ? p : min), prices[0]);
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stock, 0);
  return { basePrice, totalStock };
}
