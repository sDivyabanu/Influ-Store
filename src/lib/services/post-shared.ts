import { Prisma } from "@prisma/client";
import { FeedPost, PostAuthor } from "@/types/post";
import { getStorageService } from "@/lib/storage";

/**
 * Shared Prisma include shapes + serializers used by feed.service.ts,
 * post.service.ts and saved-post.service.ts so like/save/comment counts
 * and the current viewer's like/save state are always computed the same
 * (single-query, no N+1) way.
 */
export function postInclude(currentUserId: string | null) {
  return {
    author: {
      select: {
        id: true,
        username: true,
        profile: { select: { displayName: true, avatarUrl: true } },
      },
    },
    media: { orderBy: { order: "asc" } },
    _count: { select: { likes: true, comments: true } },
    likes: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
    savedBy: currentUserId
      ? { where: { userId: currentUserId }, select: { id: true } }
      : false,
  } satisfies Prisma.PostInclude;
}

export type PostWithRelations = Prisma.PostGetPayload<{
  include: ReturnType<typeof postInclude>;
}>;

export function toPostAuthor(user: {
  id: string;
  username: string;
  profile: { displayName: string; avatarUrl: string | null } | null;
}): PostAuthor {
  return {
    id: user.id,
    username: user.username,
    displayName: user.profile?.displayName || user.username,
    avatarUrl: user.profile?.avatarUrl ?? null,
  };
}

/**
 * The bucket denies public reads, so the mediaUrl stored at upload time is
 * not browser-accessible — every read path must re-sign it here rather
 * than trusting the persisted value.
 */
export async function serializePost(
  post: PostWithRelations,
  currentUserId: string | null
): Promise<FeedPost> {
  const storage = getStorageService();
  const media = await Promise.all(
    post.media.map(async (m) => ({
      id: m.id,
      mediaUrl: await storage.getSignedReadUrl(m.mediaKey),
      mediaType: m.mediaType,
      order: m.order,
      width: m.width,
      height: m.height,
    }))
  );

  return {
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: toPostAuthor(post.author),
    media,
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: currentUserId ? post.likes.length > 0 : false,
    savedByMe: currentUserId ? post.savedBy.length > 0 : false,
    isOwner: currentUserId === post.authorId,
  };
}
