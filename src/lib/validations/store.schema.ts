import { z } from "zod";
import { isValidSlug } from "@/lib/utils/slug";
import {
  STORE_NAME_MAX_LENGTH,
  STORE_SLUG_MIN_LENGTH,
  STORE_SLUG_MAX_LENGTH,
  STORE_DESCRIPTION_MAX_LENGTH,
} from "@/lib/constants/store";

const websiteSchema = z
  .string()
  .trim()
  .max(100, "Website URL cannot exceed 100 characters")
  .refine(
    (val) => {
      if (!val) return true;
      try {
        const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
        new URL(url);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Please enter a valid website URL" }
  )
  .optional()
  .nullable();

export const storeSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(STORE_SLUG_MIN_LENGTH, `Store URL must be at least ${STORE_SLUG_MIN_LENGTH} characters`)
  .max(STORE_SLUG_MAX_LENGTH, `Store URL cannot exceed ${STORE_SLUG_MAX_LENGTH} characters`)
  .refine(isValidSlug, {
    message: "Store URL can only contain lowercase letters, numbers, and hyphens",
  });

export const upsertStoreSchema = z.object({
  storeName: z.string().trim().min(2, "Store name is required").max(STORE_NAME_MAX_LENGTH),
  slug: storeSlugSchema,
  description: z.string().trim().max(STORE_DESCRIPTION_MAX_LENGTH).optional().nullable(),
  logoKey: z.string().trim().min(1).max(512).optional().nullable(),
  bannerKey: z.string().trim().min(1).max(512).optional().nullable(),
  website: websiteSchema,
});
export type UpsertStoreInput = z.infer<typeof upsertStoreSchema>;
