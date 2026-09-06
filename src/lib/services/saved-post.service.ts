import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import { FEED_PAGE_SIZE } from "@/lib/constants/post";
import { CursorPage, FeedPost } from "@/types/post";
import { postInclude, serializePost } from "./post-shared";

export async function savePost(postId: string, userId: string): Promise<{ savedByMe: boolean }> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) throw new NotFoundError("Post not found.");

  await prisma.savedPost.upsert({
    where: { userId_postId: { userId, postId } },
    create: { userId, postId },
    update: {},
  });

  return { savedByMe: true };
}

export async function unsavePost(postId: string, userId: string): Promise<{ savedByMe: boolean }> {
  await prisma.savedPost.deleteMany({ where: { userId, postId } });
  return { savedByMe: false };
}

/**
 * Saved posts are private: only ever call this with the session owner's
 * own userId. Never expose another user's saved list.
 */
export async function listSavedPosts(
  userId: string,
  cursor?: string | null,
  limit: number = FEED_PAGE_SIZE
): Promise<CursorPage<FeedPost>> {
  const saved = await prisma.savedPost.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { post: { include: postInclude(userId) } },
  });

  const hasMore = saved.length > limit;
  const page = hasMore ? saved.slice(0, limit) : saved;

  return {
    items: page.map((s) => serializePost(s.post, userId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
