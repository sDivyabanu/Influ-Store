import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toMoney } from "@/lib/utils/money";
import { ReelItem } from "@/types/reel";
import { ProductTagPreview } from "@/types/product";
import { toPostAuthor } from "./post-shared";

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
    // Only the lightweight preview fields a tag needs — never the full
    // product object (Phase 6 spec section 29).
    productTags: {
      orderBy: { createdAt: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            currency: true,
            media: { where: { order: 0 }, take: 1, select: { mediaUrl: true } },
          },
        },
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

function toProductTagPreviews(
  productTags: ReelWithRelations["productTags"]
): ProductTagPreview[] {
  return productTags.map((tag) => ({
    id: tag.product.id,
    name: tag.product.name,
    slug: tag.product.slug,
    basePrice: toMoney(tag.product.basePrice, tag.product.currency),
    coverImageUrl: tag.product.media[0]?.mediaUrl ?? null,
  }));
}

export function serializeReel(
  reel: ReelWithRelations,
  currentUserId: string | null,
  followingAuthorIds?: Set<string>
): ReelItem {
  return {
    id: reel.id,
    caption: reel.caption,
    mediaUrl: reel.mediaUrl,
    thumbnailUrl: reel.thumbnailUrl,
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
    productTags: toProductTagPreviews(reel.productTags),
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
