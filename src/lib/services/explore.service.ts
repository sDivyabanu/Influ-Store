import { prisma } from "@/lib/db/prisma";
import { CursorPage, FeedPost } from "@/types/post";
import { postInclude, serializePost } from "./post-shared";

/**
 * Retrieves explore posts with engagement-aware ranking and optional category filtering.
 * In Phase 3, explore ranks posts by a combination of recent engagement:
 * likes * 1 + comments * 2, falling back to chronological recency.
 */
export async function getExplorePosts(
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20,
  category?: string
): Promise<CursorPage<FeedPost>> {
  // Normalize category if provided and not "All"
  const isCategoryFilter = category && category.toLowerCase() !== "all";
  const normalizedCategory = isCategoryFilter ? category.toLowerCase().replace(/^#/, "") : null;

  const whereClause = normalizedCategory
    ? {
        OR: [
          {
            hashtags: {
              some: {
                hashtag: {
                  name: normalizedCategory,
                },
              },
            },
          },
          {
            caption: {
              contains: normalizedCategory,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {};

  const posts = await prisma.post.findMany({
    where: whereClause,
    orderBy: [
      { likes: { _count: "desc" } },
      { comments: { _count: "desc" } },
      { createdAt: "desc" },
    ],
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
