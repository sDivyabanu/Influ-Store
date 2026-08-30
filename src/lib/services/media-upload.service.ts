import { getStorageService } from "@/lib/storage";
import { ForbiddenError } from "@/lib/errors";
import { MediaUploadRequestInput } from "@/lib/validations/media.schema";

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

export type MediaUploadTarget =
  | {
      strategy: "direct";
      uploadUrl: string;
      method: "PUT";
      key: string;
      publicUrl: string;
    }
  | {
      strategy: "server";
      uploadUrl: string;
      method: "POST";
    };

/**
 * Decides how the browser should get a file's bytes into storage:
 *  - "direct": S3 is configured — browser PUTs straight to a presigned URL.
 *  - "server": local dev fallback — browser POSTs the file through our own
 *    upload route, which writes it to disk via the same storage interface.
 * The UI branches on `strategy`; no other business logic needs to know
 * which backend is active.
 */
export async function createPostMediaUploadTarget(
  userId: string,
  input: MediaUploadRequestInput
): Promise<MediaUploadTarget> {
  const storage = getStorageService();
  const folder = buildPostMediaFolder(userId);

  const presigned = await storage.createPresignedUploadUrl(
    input.fileName,
    input.contentType,
    { folder, contentType: input.contentType }
  );

  if (presigned) {
    return {
      strategy: "direct",
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      key: presigned.key,
      publicUrl: presigned.publicUrl,
    };
  }

  return {
    strategy: "server",
    uploadUrl: "/api/posts/media/local-upload",
    method: "POST",
  };
}
