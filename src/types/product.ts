import { MediaType, ProductCategory, ProductStatus } from "@prisma/client";
import { Money } from "@/lib/utils/money";

export interface ProductOptionValueItem {
  id: string;
  value: string;
  order: number;
}

export interface ProductOptionItem {
  id: string;
  name: string;
  order: number;
  values: ProductOptionValueItem[];
}

/** Option name -> chosen value, e.g. { Size: "M", Color: "Black" }. */
export type VariantOptionValueMap = Record<string, string>;

export interface ProductVariantItem {
  id: string;
  sku: string;
  price: Money;
  stock: number;
  isActive: boolean;
  isDefault: boolean;
  optionValues: VariantOptionValueMap;
}

export interface ProductMediaItem {
  id: string;
  mediaUrl: string;
  mediaType: MediaType;
  order: number;
  altText: string | null;
}

export interface ProductSellerSummary {
  storeName: string;
  slug: string;
  logoUrl: string | null;
}

/** Lightweight card for marketplace/storefront grids. */
export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  status: ProductStatus;
  basePrice: Money;
  compareAtPrice: Money | null;
  totalStock: number;
  coverImageUrl: string | null;
  createdAt: string | Date;
  seller: ProductSellerSummary;
}

/** Full detail — the public product page and the seller edit page both build on this. */
export interface ProductDetailItem extends ProductListItem {
  description: string | null;
  currency: string;
  media: ProductMediaItem[];
  options: ProductOptionItem[];
  variants: ProductVariantItem[];
  publishedAt: string | Date | null;
  updatedAt: string | Date;
}
