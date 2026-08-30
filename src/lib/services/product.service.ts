import { Prisma, ProductCategory, ProductStatus } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { PRODUCT_PAGE_SIZE } from "@/lib/constants/product";
import { CursorPage } from "@/types/post";
import { ProductDetailItem, ProductListItem } from "@/types/product";
import {
  productDetailInclude,
  productListInclude,
  serializeProductDetail,
  serializeProductListItem,
} from "./product-shared";

export type ProductSortOption = "newest" | "price_asc" | "price_desc";

export interface ListProductsFilters {
  category?: ProductCategory;
  sellerSlug?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSortOption;
}

/** Public marketplace listing — always scoped to ACTIVE products only. */
export async function listProducts(
  filters: ListProductsFilters,
  cursor?: string | null,
  limit: number = PRODUCT_PAGE_SIZE
): Promise<CursorPage<ProductListItem>> {
  const where: Prisma.ProductWhereInput = {
    status: ProductStatus.ACTIVE,
    ...(filters.category ? { category: filters.category } : {}),
    ...(filters.sellerSlug ? { sellerProfile: { slug: filters.sellerSlug } } : {}),
    ...(filters.search ? { name: { contains: filters.search, mode: "insensitive" } } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? {
          basePrice: {
            ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
            ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
          },
        }
      : {}),
  };

  // A secondary `id` tiebreaker keeps cursor pagination stable across
  // pages even when many products share the same basePrice/createdAt.
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "price_asc"
      ? [{ basePrice: "asc" }, { id: "asc" }]
      : filters.sort === "price_desc"
        ? [{ basePrice: "desc" }, { id: "asc" }]
        : [{ createdAt: "desc" }, { id: "asc" }];

  const products = await prisma.product.findMany({
    where,
    orderBy,
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

export async function getProductBySlug(slug: string): Promise<ProductDetailItem | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: productDetailInclude(),
  });
  if (!product || product.status !== ProductStatus.ACTIVE) return null;
  return serializeProductDetail(product);
}
