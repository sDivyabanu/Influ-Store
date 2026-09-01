import { prisma } from "@/lib/db/prisma";
import { FEED_PAGE_SIZE } from "@/lib/constants/post";
import { CursorPage, FeedPost } from "@/types/post";
import { postInclude, serializePost } from "./post-shared";

/**
 * Phase 2 feed strategy: recent public posts, newest first. This is
 * intentionally a plain "recent posts" query rather than a personalized
 * following feed — Follow/Unfollow ships in Phase 3. Callers (the /home
 * page, /api/feed) only depend on this function's { items, nextCursor }
 * shape, so Phase 3 can swap in following-based ranking here without
 * touching the UI or API contract.
 */
export async function getFeed(
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE
): Promise<CursorPage<FeedPost>> {
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
  };
}
