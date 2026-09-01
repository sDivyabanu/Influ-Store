import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

interface LikeState {
  likeCount: number;
  likedByMe: boolean;
}

async function getLikeState(postId: string, userId: string): Promise<LikeState> {
  const [likeCount, liked] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    prisma.like.findUnique({
      where: { postId_userId: { postId, userId } },
      select: { id: true },
    }),
  ]);
  return { likeCount, likedByMe: Boolean(liked) };
}

export async function likePost(postId: string, userId: string): Promise<LikeState> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true },
  });
  if (!post) throw new NotFoundError("Post not found.");

  // Upsert makes rapid repeated clicks (or a duplicate request racing a
  // slow response) a no-op instead of a unique-constraint error.
  await prisma.like.upsert({
    where: { postId_userId: { postId, userId } },
    create: { postId, userId },
    update: {},
  });

  return getLikeState(postId, userId);
}

export async function unlikePost(postId: string, userId: string): Promise<LikeState> {
  await prisma.like.deleteMany({ where: { postId, userId } });
  return getLikeState(postId, userId);
}
