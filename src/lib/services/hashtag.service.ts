import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { extractHashtags } from "@/lib/utils/hashtags";
import { CursorPage, FeedPost } from "@/types/post";
import { HashtagItem } from "@/types/search";
import { postInclude, serializePost } from "./post-shared";

/**
 * Synchronizes a post's hashtags inside a database transaction.
 * Creates new Hashtag records if they don't exist and updates PostHashtag relations.
 */
export async function syncPostHashtags(
  tx: Prisma.TransactionClient,
  postId: string,
  caption: string | null
): Promise<void> {
  const extractedTags = extractHashtags(caption);

  if (extractedTags.length === 0) {
    await tx.postHashtag.deleteMany({ where: { postId } });
    return;
  }

  // Find or create each hashtag
  const hashtagRecords = await Promise.all(
    extractedTags.map((tag) =>
      tx.hashtag.upsert({
        where: { name: tag },
        create: { name: tag },
        update: {},
      })
    )
  );

  const hashtagIds = hashtagRecords.map((h) => h.id);

  // Remove relationships that are no longer present
  await tx.postHashtag.deleteMany({
    where: {
      postId,
      hashtagId: { notIn: hashtagIds },
    },
  });

  // Upsert/create new relationships
  for (const hashtagId of hashtagIds) {
    await tx.postHashtag.upsert({
      where: {
        postId_hashtagId: {
          postId,
          hashtagId,
        },
      },
      create: {
        postId,
        hashtagId,
      },
      update: {},
    });
  }
}

/**
 * Retrieves posts tagged with a specific hashtag with cursor pagination.
 */
export async function getHashtagPosts(
  tagName: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20
): Promise<{
  hashtag: { id: string; name: string; postCount: number } | null;
  posts: CursorPage<FeedPost>;
}> {
  const normalizedTag = tagName.replace(/^#/, "").toLowerCase();

  const hashtag = await prisma.hashtag.findUnique({
    where: { name: normalizedTag },
    include: {
      _count: { select: { posts: true } },
    },
  });

  if (!hashtag) {
    return {
      hashtag: null,
      posts: { items: [], nextCursor: null },
    };
  }

  const postHashtags = await prisma.postHashtag.findMany({
    where: { hashtagId: hashtag.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { postId_hashtagId: { postId: cursor, hashtagId: hashtag.id } }, skip: 1 } : {}),
    include: {
      post: {
        include: postInclude(currentUserId),
      },
    },
  });

  const hasMore = postHashtags.length > limit;
  const page = hasMore ? postHashtags.slice(0, limit) : postHashtags;

  return {
    hashtag: {
      id: hashtag.id,
      name: hashtag.name,
      postCount: hashtag._count.posts,
    },
    posts: {
      items: page.map((ph) => serializePost(ph.post, currentUserId)),
      nextCursor: hasMore ? page[page.length - 1].postId : null,
    },
  };
}

/**
 * Retrieves trending hashtags ordered by total post count.
 */
export async function getTrendingHashtags(limit: number = 10): Promise<HashtagItem[]> {
  const hashtags = await prisma.hashtag.findMany({
    take: limit,
    orderBy: {
      posts: {
        _count: "desc",
      },
    },
    include: {
      _count: {
        select: { posts: true },
      },
    },
    where: {
      posts: {
        some: {},
      },
    },
  });

  return hashtags.map((h) => ({
    id: h.id,
    name: h.name,
    postCount: h._count.posts,
  }));
}
