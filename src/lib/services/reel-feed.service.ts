import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { REELS_FEED_PAGE_SIZE } from "@/lib/constants/reel";
import { CursorPage } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { reelInclude, serializeReel, getFollowingAuthorIds } from "./reel-shared";

/**
 * Phase 4 reel feed: a single blended stream rather than a mode toggle
 * (the vertical scroll-snap UI doesn't have room for a following/discover
 * switch the way the post feed does). For a logged-in user who follows at
 * least one creator, the feed is their own + followed creators' reels;
 * otherwise (logged out, or following no one) it falls back to recent
 * public reels platform-wide. No engagement ranking or recommendations —
 * this is intentionally simple and isolated here so a real ranking
 * algorithm can replace the query later without touching callers.
 */
export async function getReelFeed(
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = REELS_FEED_PAGE_SIZE
): Promise<CursorPage<ReelItem> & { isPersonalized: boolean }> {
  let where: Prisma.ReelWhereInput = {};
  let isPersonalized = false;

  if (currentUserId) {
    const followingRows = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    const followingIds = followingRows.map((f) => f.followingId);

    if (followingIds.length > 0) {
      where = { authorId: { in: [currentUserId, ...followingIds] } };
      isPersonalized = true;
    }
  }

  const reels = await prisma.reel.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: reelInclude(currentUserId),
  });

  const hasMore = reels.length > limit;
  const page = hasMore ? reels.slice(0, limit) : reels;
  const authorIds = Array.from(new Set(page.map((r) => r.authorId)));
  const followingAuthorIds = await getFollowingAuthorIds(currentUserId, authorIds);

  return {
    items: page.map((r) => serializeReel(r, currentUserId, followingAuthorIds)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
    isPersonalized,
  };
}
