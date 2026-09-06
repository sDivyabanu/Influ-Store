import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { COMMENTS_PAGE_SIZE, REPLIES_PAGE_SIZE } from "@/lib/constants/post";
import { CreateCommentInput } from "@/lib/validations/comment.schema";
import { CommentItem, CursorPage } from "@/types/post";
import { toPostAuthor } from "./post-shared";

function commentInclude(currentUserId: string | null) {
  return {
    author: {
      select: {
        id: true,
        username: true,
        profile: { select: { displayName: true, avatarUrl: true } },
      },
    },
    _count: { select: { replies: true, likes: true } },
    likes: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
  } satisfies Prisma.CommentInclude;
}

type CommentWithRelations = Prisma.CommentGetPayload<{
  include: ReturnType<typeof commentInclude>;
}>;

function serializeComment(
  comment: CommentWithRelations,
  currentUserId: string | null
): CommentItem {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    parentId: comment.parentId,
    author: toPostAuthor(comment.author),
    likeCount: comment._count.likes,
    likedByMe: currentUserId ? comment.likes.length > 0 : false,
    replyCount: comment._count.replies,
    isOwner: currentUserId === comment.authorId,
  };
}

export async function createComment(
  postId: string,
  authorId: string,
  input: CreateCommentInput
): Promise<CommentItem> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) throw new NotFoundError("Post not found.");

  let parentId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: input.parentId },
      select: { id: true, postId: true, parentId: true },
    });
    if (!parent || parent.postId !== postId) {
      throw new NotFoundError("The comment you're replying to no longer exists.");
    }
    // Replies only ever thread one level deep: a reply to a reply is
    // re-parented onto the original top-level comment.
    parentId = parent.parentId ?? parent.id;
  }

  const comment = await prisma.comment.create({
    data: { postId, authorId, parentId, content: input.content },
    include: commentInclude(authorId),
  });

  return serializeComment(comment, authorId);
}

export async function deleteComment(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, post: { select: { authorId: true } } },
  });
  if (!comment) throw new NotFoundError("Comment not found.");

  // Policy: a comment's own author can always remove it. The post's owner
  // may also remove comments left on their post (lightweight, self-serve
  // moderation) — full moderation tooling lands in Phase 9.
  const isCommentAuthor = comment.authorId === userId;
  const isPostOwner = comment.post.authorId === userId;
  if (!isCommentAuthor && !isPostOwner) {
    throw new ForbiddenError("You can only delete your own comments.");
  }

  // Cascades to replies and comment likes via FKs.
  await prisma.comment.delete({ where: { id: commentId } });
}

export async function listComments(
  postId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = COMMENTS_PAGE_SIZE
): Promise<CursorPage<CommentItem>> {
  const comments = await prisma.comment.findMany({
    where: { postId, parentId: null },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: commentInclude(currentUserId),
  });

  const hasMore = comments.length > limit;
  const page = hasMore ? comments.slice(0, limit) : comments;

  return {
    items: page.map((c) => serializeComment(c, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function listReplies(
  parentId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = REPLIES_PAGE_SIZE
): Promise<CursorPage<CommentItem>> {
  const replies = await prisma.comment.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: commentInclude(currentUserId),
  });

  const hasMore = replies.length > limit;
  const page = hasMore ? replies.slice(0, limit) : replies;

  return {
    items: page.map((c) => serializeComment(c, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

interface CommentLikeState {
  likeCount: number;
  likedByMe: boolean;
}

async function getCommentLikeState(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  const [likeCount, liked] = await Promise.all([
    prisma.commentLike.count({ where: { commentId } }),
    prisma.commentLike.findUnique({
      where: { commentId_userId: { commentId, userId } },
      select: { id: true },
    }),
  ]);
  return { likeCount, likedByMe: Boolean(liked) };
}

export async function likeComment(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  if (!comment) throw new NotFoundError("Comment not found.");

  await prisma.commentLike.upsert({
    where: { commentId_userId: { commentId, userId } },
    create: { commentId, userId },
    update: {},
  });

  return getCommentLikeState(commentId, userId);
}

export async function unlikeComment(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  await prisma.commentLike.deleteMany({ where: { commentId, userId } });
  return getCommentLikeState(commentId, userId);
}
