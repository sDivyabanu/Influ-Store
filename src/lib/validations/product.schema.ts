import { z } from "zod";
import { ProductCategory, ProductStatus } from "@prisma/client";
import {
  MAX_OPTION_VALUES_PER_OPTION,
  MAX_PRICE,
  MAX_PRODUCT_MEDIA_COUNT,
  MAX_PRODUCT_OPTIONS,
  MAX_STOCK_PER_VARIANT,
  MAX_VARIANTS_PER_PRODUCT,
  OPTION_NAME_MAX_LENGTH,
  OPTION_VALUE_MAX_LENGTH,
  PRODUCT_DESCRIPTION_MAX_LENGTH,
  PRODUCT_NAME_MAX_LENGTH,
  SKU_MAX_LENGTH,
  SUPPORTED_CURRENCIES,
} from "@/lib/constants/product";
import { STORE_SLUG_MAX_LENGTH } from "@/lib/constants/store";

const priceSchema = z.number().positive().max(MAX_PRICE);
const stockSchema = z.number().int().min(0).max(MAX_STOCK_PER_VARIANT);

export const productOptionInputSchema = z.object({
  name: z.string().trim().min(1, "Option name is required").max(OPTION_NAME_MAX_LENGTH),
  values: z
    .array(z.string().trim().min(1).max(OPTION_VALUE_MAX_LENGTH))
    .min(1, "Add at least one value")
    .max(MAX_OPTION_VALUES_PER_OPTION),
});
export type ProductOptionInput = z.infer<typeof productOptionInputSchema>;

export const productVariantInputSchema = z.object({
  sku: z.string().trim().max(SKU_MAX_LENGTH).optional(),
  price: priceSchema,
  stock: stockSchema,
  isActive: z.boolean().optional(),
  optionValues: z.record(z.string(), z.string()).optional(),
});
export type ProductVariantInput = z.infer<typeof productVariantInputSchema>;

export const productMediaInputSchema = z.object({
  key: z.string().trim().min(1, "Media key is required").max(512),
  altText: z.string().trim().max(140).optional(),
});
export type ProductMediaInput = z.infer<typeof productMediaInputSchema>;

export const createProductSchema = z.object({
  name: z.string().trim().min(1, "Product name is required").max(PRODUCT_NAME_MAX_LENGTH),
  description: z
    .string()
    .trim()
    .max(PRODUCT_DESCRIPTION_MAX_LENGTH)
    .optional()
    .or(z.literal("")),
  category: z.nativeEnum(ProductCategory),
  currency: z.enum(SUPPORTED_CURRENCIES as unknown as [string, ...string[]]).optional(),
  compareAtPrice: priceSchema.optional(),
  options: z.array(productOptionInputSchema).max(MAX_PRODUCT_OPTIONS).optional().default([]),
  variants: z
    .array(productVariantInputSchema)
    .min(1, "Add at least one variant")
    .max(MAX_VARIANTS_PER_PRODUCT),
  media: z.array(productMediaInputSchema).max(MAX_PRODUCT_MEDIA_COUNT).optional().default([]),
  status: z.nativeEnum(ProductStatus).optional(),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = createProductSchema.partial();
export type UpdateProductInput = z.infer<typeof updateProductSchema>;

export const listProductsQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional().nullable(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  category: z.nativeEnum(ProductCategory).optional(),
  sellerSlug: z.string().trim().min(1).max(STORE_SLUG_MAX_LENGTH).optional(),
  search: z.string().trim().min(1).max(PRODUCT_NAME_MAX_LENGTH).optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc"]).optional(),
});
export type ListProductsQuery = z.infer<typeof listProductsQuerySchema>;

export const myProductsQuerySchema = z.object({
  cursor: z.string().trim().min(1).optional().nullable(),
  limit: z.coerce.number().int().positive().max(50).optional(),
  status: z.nativeEnum(ProductStatus).optional(),
});
export type MyProductsQuery = z.infer<typeof myProductsQuerySchema>;
