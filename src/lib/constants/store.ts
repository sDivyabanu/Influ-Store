/**
 * Central limits for the seller storefront (SellerProfile). Shared
 * between client-side forms and server-side validation.
 */

export const STORE_NAME_MAX_LENGTH = 80;
export const STORE_SLUG_MIN_LENGTH = 3;
export const STORE_SLUG_MAX_LENGTH = 40;
export const STORE_DESCRIPTION_MAX_LENGTH = 1000;

export const ALLOWED_STORE_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export type AllowedStoreImageMimeType = (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number];

export const MAX_STORE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
