import { ForbiddenError } from "@/lib/errors";
import { ReelMediaUploadRequestInput } from "@/lib/validations/reel-media.schema";
import { createMediaUploadTarget, MediaUploadTarget } from "./media-upload-shared";

/**
 * Every reel video a user uploads lives under this folder prefix — used
 * to verify, at reel creation time, that a submitted media key actually
 * belongs to the authenticated author (never trust the browser's word
 * for it). Mirrors buildPostMediaFolder in media-upload.service.ts.
 */
export function buildReelMediaFolder(userId: string): string {
  return `reels/${userId}`;
}

export function assertReelMediaKeyOwnedByUser(key: string, userId: string): void {
  const expectedPrefix = `${buildReelMediaFolder(userId)}/`;
  if (!key.startsWith(expectedPrefix)) {
    throw new ForbiddenError("This video does not belong to you.");
  }
}

export type { MediaUploadTarget };

/**
 * Decides how the browser should get a video's bytes into storage —
 * identical strategy resolution to createPostMediaUploadTarget, just
 * pointed at the reel folder and reel local-upload fallback route.
 */
export async function createReelMediaUploadTarget(
  userId: string,
  input: ReelMediaUploadRequestInput
): Promise<MediaUploadTarget> {
  return createMediaUploadTarget(
    buildReelMediaFolder(userId),
    input.fileName,
    input.contentType,
    "/api/reels/media/local-upload"
  );
}
