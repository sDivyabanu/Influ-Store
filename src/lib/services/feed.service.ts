import { prisma } from "@/lib/db/prisma";
import { FEED_PAGE_SIZE } from "@/lib/constants/post";
import { CursorPage, FeedPost } from "@/types/post";
import { postInclude, serializePost } from "./post-shared";

export type FeedMode = "following" | "discover";

/**
 * Phase 3 personalized feed service.
 * Supports:
 * - "following": Posts from users the current user follows + the current user's own posts.
 * - "discover": Recent public posts across the entire platform.
 */
export async function getFeed(
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE,
  mode: FeedMode = "following"
): Promise<CursorPage<FeedPost> & { mode: FeedMode; isFollowingEmpty?: boolean }> {
  // If user is unauthenticated or explicitly requested discovery mode
  if (!currentUserId || mode === "discover") {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: "desc" },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: postInclude(currentUserId),
    });

    const hasMore = posts.length > limit;
    const page = hasMore ? posts.slice(0, limit) : posts;

    return {
      items: page.map((p) => serializePost(p, currentUserId)),
      nextCursor: hasMore ? page[page.length - 1].id : null,
      mode: "discover",
    };
  }

  // Personalized Following feed
  // 1. Get the list of user IDs that current user follows
  const followingRows = await prisma.follow.findMany({
    where: { followerId: currentUserId },
    select: { followingId: true },
  });

  const followingIds = followingRows.map((f) => f.followingId);
  const authorIds = [currentUserId, ...followingIds];

  // If user follows no one and has no posts, flag isFollowingEmpty
  const isFollowingEmpty = followingIds.length === 0;

  const posts = await prisma.post.findMany({
    where: {
      authorId: { in: authorIds },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: postInclude(currentUserId),
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;

  return {
    items: page.map((p) => serializePost(p, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
    mode: "following",
    isFollowingEmpty,
  };
}
