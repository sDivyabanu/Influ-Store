import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { PROFILE_GRID_PAGE_SIZE } from "@/lib/constants/post";
import { CreatePostInput } from "@/lib/validations/post.schema";
import { CursorPage, FeedPost } from "@/types/post";
import { postInclude, serializePost } from "./post-shared";
import { assertMediaKeysOwnedByUser } from "./media-upload.service";
import { syncPostHashtags } from "./hashtag.service";

export async function getPostById(
  postId: string,
  currentUserId: string | null
): Promise<FeedPost | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: postInclude(currentUserId),
  });
  if (!post) return null;
  return serializePost(post, currentUserId);
}

export async function createPost(
  authorId: string,
  input: CreatePostInput
): Promise<FeedPost> {
  // Never trust the browser's claim that a media key belongs to it —
  // every key must live under this author's own upload folder.
  assertMediaKeysOwnedByUser(
    input.media.map((m) => m.key),
    authorId
  );

  const storage = getStorageService();

  const postId = await prisma.$transaction(async (tx) => {
    const created = await tx.post.create({
      data: {
        authorId,
        caption: input.caption?.trim() || null,
      },
    });

    await tx.postMedia.createMany({
      data: input.media.map((m, index) => ({
        postId: created.id,
        mediaKey: m.key,
        mediaUrl: storage.getPublicUrl(m.key),
        order: index,
        width: m.width ?? null,
        height: m.height ?? null,
      })),
    });

    // Sync hashtags within transaction
    await syncPostHashtags(tx, created.id, input.caption?.trim() || null);

    return created.id;
  });

  const post = await getPostById(postId, authorId);
  if (!post) throw new NotFoundError("Post not found after creation.");
  return post;
}

export async function updatePostCaption(
  postId: string,
  userId: string,
  caption: string | null
): Promise<FeedPost> {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });
  if (!existing) throw new NotFoundError("Post not found.");
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You can only edit your own posts.");
  }

  const trimmedCaption = caption?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: { id: postId },
      data: { caption: trimmedCaption },
    });

    // Synchronize hashtags with new caption
    await syncPostHashtags(tx, postId, trimmedCaption);
  });

  const post = await getPostById(postId, userId);
  if (!post) throw new NotFoundError("Post not found.");
  return post;
}

export async function deletePost(postId: string, userId: string): Promise<void> {
  const existing = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true, media: { select: { mediaKey: true } } },
  });
  if (!existing) throw new NotFoundError("Post not found.");
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You can only delete your own posts.");
  }

  // Cascade deletes PostMedia/Like/Comment/CommentLike/SavedPost/PostHashtag rows via FKs.
  await prisma.post.delete({ where: { id: postId } });

  const storage = getStorageService();
  await Promise.allSettled(
    existing.media.map((m) => storage.deleteFile(m.mediaKey))
  );
}

export async function listUserPosts(
  authorId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = PROFILE_GRID_PAGE_SIZE
): Promise<CursorPage<FeedPost>> {
  const posts = await prisma.post.findMany({
    where: { authorId },
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
