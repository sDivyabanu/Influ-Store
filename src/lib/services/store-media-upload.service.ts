import { ForbiddenError } from "@/lib/errors";
import { StoreMediaUploadRequestInput } from "@/lib/validations/store-media.schema";
import { createMediaUploadTarget, MediaUploadTarget } from "./media-upload-shared";

/**
 * Every store logo/banner a seller uploads lives under this folder
 * prefix — keyed by userId (not sellerProfileId) since the very first
 * logo upload can happen before the SellerProfile row exists yet, during
 * initial store setup. Mirrors buildPostMediaFolder/buildReelMediaFolder.
 */
export function buildStoreMediaFolder(userId: string): string {
  return `stores/${userId}`;
}

export function assertStoreMediaKeyOwnedByUser(key: string, userId: string): void {
  const expectedPrefix = `${buildStoreMediaFolder(userId)}/`;
  if (!key.startsWith(expectedPrefix)) {
    throw new ForbiddenError("This image does not belong to you.");
  }
}

export type { MediaUploadTarget };

export async function createStoreMediaUploadTarget(
  userId: string,
  input: StoreMediaUploadRequestInput
): Promise<MediaUploadTarget> {
  return createMediaUploadTarget(
    buildStoreMediaFolder(userId),
    input.fileName,
    input.contentType,
    "/api/seller/store/media/local-upload"
  );
}
