import { ForbiddenError } from "@/lib/errors";

/**
 * Every reel video a user uploads lives under this folder prefix — used
 * to verify, at reel creation time, that a submitted media key actually
 * belongs to the authenticated author (never trust the browser's word
 * for it). Mirrors buildPostMediaFolder in media-upload.service.ts.
 *
 * The presigned-upload/local-fallback target generation for reels lives
 * here too, added alongside the upload routes (see /api/reels/media/*).
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
