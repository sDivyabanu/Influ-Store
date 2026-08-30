import { ForbiddenError } from "@/lib/errors";
import { MediaUploadRequestInput } from "@/lib/validations/media.schema";
import { createMediaUploadTarget, MediaUploadTarget } from "./media-upload-shared";

/**
 * Every post-media object a user uploads lives under this folder prefix.
 * Used both to ask S3 to place new uploads there and to verify, at post
 * creation time, that a submitted media key actually belongs to the
 * authenticated author (never trust the browser's word for it).
 */
export function buildPostMediaFolder(userId: string): string {
  return `posts/${userId}`;
}

export function assertMediaKeysOwnedByUser(keys: string[], userId: string): void {
  const expectedPrefix = `${buildPostMediaFolder(userId)}/`;
  const invalid = keys.find((key) => !key.startsWith(expectedPrefix));
  if (invalid) {
    throw new ForbiddenError("One or more media items do not belong to you.");
  }
}

export type { MediaUploadTarget };

/**
 * Decides how the browser should get a file's bytes into storage:
 *  - "direct": S3 is configured — browser PUTs straight to a presigned URL.
 *  - "server": local dev fallback — browser POSTs the file through our own
 *    upload route, which writes it to disk via the same storage interface.
 * The UI branches on `strategy`; no other business logic needs to know
 * which backend is active. Shared with reel-media-upload.service.ts.
 */
export async function createPostMediaUploadTarget(
  userId: string,
  input: MediaUploadRequestInput
): Promise<MediaUploadTarget> {
  return createMediaUploadTarget(
    buildPostMediaFolder(userId),
    input.fileName,
    input.contentType,
    "/api/posts/media/local-upload"
  );
}
