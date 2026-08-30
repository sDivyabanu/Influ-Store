import { ForbiddenError } from "@/lib/errors";
import { ProductMediaUploadRequestInput } from "@/lib/validations/product-media.schema";
import { createMediaUploadTarget, MediaUploadTarget } from "./media-upload-shared";

/**
 * Every product-image object a seller uploads lives under this folder
 * prefix, keyed by their user id (not the seller profile id, which may
 * not exist yet on the first-ever upload of a session) — mirrors
 * media-upload.service.ts / store-media-upload.service.ts.
 */
export function buildProductMediaFolder(userId: string): string {
  return `products/${userId}`;
}

export function assertProductMediaKeysOwnedByUser(keys: string[], userId: string): void {
  const expectedPrefix = `${buildProductMediaFolder(userId)}/`;
  const invalid = keys.find((key) => !key.startsWith(expectedPrefix));
  if (invalid) {
    throw new ForbiddenError("One or more images do not belong to you.");
  }
}

export type { MediaUploadTarget };

export async function createProductMediaUploadTarget(
  userId: string,
  input: ProductMediaUploadRequestInput
): Promise<MediaUploadTarget> {
  return createMediaUploadTarget(
    buildProductMediaFolder(userId),
    input.fileName,
    input.contentType,
    "/api/seller/products/media/local-upload"
  );
}
