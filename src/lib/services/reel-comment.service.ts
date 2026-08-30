import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { COMMENTS_PAGE_SIZE, REPLIES_PAGE_SIZE } from "@/lib/constants/post";
import { CreateCommentInput } from "@/lib/validations/comment.schema";
import { CommentItem, CursorPage } from "@/types/post";
import { toPostAuthor } from "./post-shared";

function reelCommentInclude(currentUserId: string | null) {
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
  } satisfies Prisma.ReelCommentInclude;
}

type ReelCommentWithRelations = Prisma.ReelCommentGetPayload<{
  include: ReturnType<typeof reelCommentInclude>;
}>;

function serializeReelComment(
  comment: ReelCommentWithRelations,
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

export async function createReelComment(
  reelId: string,
  authorId: string,
  input: CreateCommentInput
): Promise<CommentItem> {
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { id: true },
  });
  if (!reel) throw new NotFoundError("Reel not found.");

  let parentId: string | null = null;
  if (input.parentId) {
    const parent = await prisma.reelComment.findUnique({
      where: { id: input.parentId },
      select: { id: true, reelId: true, parentId: true },
    });
    if (!parent || parent.reelId !== reelId) {
      throw new NotFoundError("The comment you're replying to no longer exists.");
    }
    // Replies only ever thread one level deep: a reply to a reply is
    // re-parented onto the original top-level comment.
    parentId = parent.parentId ?? parent.id;
  }

  const comment = await prisma.reelComment.create({
    data: { reelId, authorId, parentId, content: input.content },
    include: reelCommentInclude(authorId),
  });

  return serializeReelComment(comment, authorId);
}

export async function deleteReelComment(commentId: string, userId: string): Promise<void> {
  const comment = await prisma.reelComment.findUnique({
    where: { id: commentId },
    select: { authorId: true, reel: { select: { authorId: true } } },
  });
  if (!comment) throw new NotFoundError("Comment not found.");

  // Same policy as post comments: the comment's own author can always
  // remove it; the reel's owner may also remove comments on their reel.
  const isCommentAuthor = comment.authorId === userId;
  const isReelOwner = comment.reel.authorId === userId;
  if (!isCommentAuthor && !isReelOwner) {
    throw new ForbiddenError("You can only delete your own comments.");
  }

  // Cascades to replies and comment likes via FKs.
  await prisma.reelComment.delete({ where: { id: commentId } });
}

export async function listReelComments(
  reelId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = COMMENTS_PAGE_SIZE
): Promise<CursorPage<CommentItem>> {
  const comments = await prisma.reelComment.findMany({
    where: { reelId, parentId: null },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: reelCommentInclude(currentUserId),
  });

  const hasMore = comments.length > limit;
  const page = hasMore ? comments.slice(0, limit) : comments;

  return {
    items: page.map((c) => serializeReelComment(c, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

export async function listReelCommentReplies(
  parentId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = REPLIES_PAGE_SIZE
): Promise<CursorPage<CommentItem>> {
  const replies = await prisma.reelComment.findMany({
    where: { parentId },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: reelCommentInclude(currentUserId),
  });

  const hasMore = replies.length > limit;
  const page = hasMore ? replies.slice(0, limit) : replies;

  return {
    items: page.map((c) => serializeReelComment(c, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

interface CommentLikeState {
  likeCount: number;
  likedByMe: boolean;
}

async function getReelCommentLikeState(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  const [likeCount, liked] = await Promise.all([
    prisma.reelCommentLike.count({ where: { reelCommentId: commentId } }),
    prisma.reelCommentLike.findUnique({
      where: { reelCommentId_userId: { reelCommentId: commentId, userId } },
      select: { id: true },
    }),
  ]);
  return { likeCount, likedByMe: Boolean(liked) };
}

export async function likeReelComment(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  const comment = await prisma.reelComment.findUnique({
    where: { id: commentId },
    select: { id: true },
  });
  if (!comment) throw new NotFoundError("Comment not found.");

  await prisma.reelCommentLike.upsert({
    where: { reelCommentId_userId: { reelCommentId: commentId, userId } },
    create: { reelCommentId: commentId, userId },
    update: {},
  });

  return getReelCommentLikeState(commentId, userId);
}

export async function unlikeReelComment(
  commentId: string,
  userId: string
): Promise<CommentLikeState> {
  await prisma.reelCommentLike.deleteMany({ where: { reelCommentId: commentId, userId } });
  return getReelCommentLikeState(commentId, userId);
}
