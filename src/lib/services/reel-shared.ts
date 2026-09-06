import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ReelItem } from "@/types/reel";
import { toPostAuthor } from "./post-shared";
import { getStorageService } from "@/lib/storage";

/**
 * Shared Prisma include shape + serializer for reels, mirroring
 * post-shared.ts so like/save/comment counts and the current viewer's
 * like/save/follow state are always computed the same (single-query,
 * no N+1) way.
 */
export function reelInclude(currentUserId: string | null) {
  return {
    author: {
      select: {
        id: true,
        username: true,
        profile: { select: { displayName: true, avatarUrl: true } },
      },
    },
    _count: { select: { likes: true, comments: true } },
    likes: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
    savedBy: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
  } satisfies Prisma.ReelInclude;
}

export type ReelWithRelations = Prisma.ReelGetPayload<{
  include: ReturnType<typeof reelInclude>;
}>;

/**
 * The bucket denies public reads, so the mediaUrl/thumbnailUrl stored at
 * upload time are not browser-accessible — every read path must re-sign
 * them here rather than trusting the persisted value (mirrors
 * post-shared.ts's serializePost).
 */
export async function serializeReel(
  reel: ReelWithRelations,
  currentUserId: string | null,
  followingAuthorIds?: Set<string>
): Promise<ReelItem> {
  const storage = getStorageService();
  const [mediaUrl, thumbnailUrl] = await Promise.all([
    storage.getSignedReadUrl(reel.mediaKey),
    reel.thumbnailKey ? storage.getSignedReadUrl(reel.thumbnailKey) : Promise.resolve(reel.thumbnailUrl),
  ]);

  return {
    id: reel.id,
    caption: reel.caption,
    mediaUrl,
    thumbnailUrl,
    duration: reel.duration,
    width: reel.width,
    height: reel.height,
    createdAt: reel.createdAt,
    updatedAt: reel.updatedAt,
    author: toPostAuthor(reel.author),
    likeCount: reel._count.likes,
    commentCount: reel._count.comments,
    likedByMe: currentUserId ? reel.likes.length > 0 : false,
    savedByMe: currentUserId ? reel.savedBy.length > 0 : false,
    isOwner: currentUserId === reel.authorId,
    isFollowingAuthor: followingAuthorIds ? followingAuthorIds.has(reel.authorId) : false,
  };
}

/**
 * Batch-queries which of the given reels' authors the viewer follows,
 * avoiding an N+1 (mirrors follow.service.ts's viewer-following batching).
 */
export async function getFollowingAuthorIds(
  currentUserId: string | null,
  authorIds: string[]
): Promise<Set<string>> {
  if (!currentUserId || authorIds.length === 0) return new Set();
  const rows = await prisma.follow.findMany({
    where: { followerId: currentUserId, followingId: { in: authorIds } },
    select: { followingId: true },
  });
  return new Set(rows.map((r) => r.followingId));
}
