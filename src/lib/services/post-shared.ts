import { Prisma } from "@prisma/client";
import { toMoney } from "@/lib/utils/money";
import { FeedPost, PostAuthor } from "@/types/post";
import { ProductTagPreview } from "@/types/product";

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
    // Only the lightweight preview fields a tag needs — never the full
    // product object (Phase 6 spec section 29).
    productTags: {
      orderBy: { createdAt: "asc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            currency: true,
            media: { where: { order: 0 }, take: 1, select: { mediaUrl: true } },
          },
        },
      },
    },
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

function toProductTagPreviews(
  productTags: PostWithRelations["productTags"]
): ProductTagPreview[] {
  return productTags.map((tag) => ({
    id: tag.product.id,
    name: tag.product.name,
    slug: tag.product.slug,
    basePrice: toMoney(tag.product.basePrice, tag.product.currency),
    coverImageUrl: tag.product.media[0]?.mediaUrl ?? null,
  }));
}

export function serializePost(
  post: PostWithRelations,
  currentUserId: string | null
): FeedPost {
  return {
    id: post.id,
    caption: post.caption,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    author: toPostAuthor(post.author),
    media: post.media.map((m) => ({
      id: m.id,
      mediaUrl: m.mediaUrl,
      mediaType: m.mediaType,
      order: m.order,
      width: m.width,
      height: m.height,
    })),
    likeCount: post._count.likes,
    commentCount: post._count.comments,
    likedByMe: currentUserId ? post.likes.length > 0 : false,
    savedByMe: currentUserId ? post.savedBy.length > 0 : false,
    isOwner: currentUserId === post.authorId,
    productTags: toProductTagPreviews(post.productTags),
  };
}
