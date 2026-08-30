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
  // Safe to expose — product media is always PUBLIC storage (never the
  // private seller-document architecture), so the key carries no more
  // sensitivity than the URL. The seller edit form uses it to resubmit
  // an unchanged image without re-uploading.
  key: string;
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

/**
 * Ultra-lightweight preview embedded in post/reel feed responses when a
 * product is tagged — never the full product object (Phase 6 spec
 * section 29). Deliberately excludes stock, variants, and description.
 */
export interface ProductTagPreview {
  id: string;
  name: string;
  slug: string;
  basePrice: Money;
  coverImageUrl: string | null;
}
