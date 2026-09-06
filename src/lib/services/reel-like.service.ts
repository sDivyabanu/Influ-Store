import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";

interface LikeState {
  likeCount: number;
  likedByMe: boolean;
}

async function getLikeState(reelId: string, userId: string): Promise<LikeState> {
  const [likeCount, liked] = await Promise.all([
    prisma.reelLike.count({ where: { reelId } }),
    prisma.reelLike.findUnique({
      where: { reelId_userId: { reelId, userId } },
      select: { id: true },
    }),
  ]);
  return { likeCount, likedByMe: Boolean(liked) };
}

export async function likeReel(reelId: string, userId: string): Promise<LikeState> {
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { id: true },
  });
  if (!reel) throw new NotFoundError("Reel not found.");

  // Upsert makes rapid repeated clicks (or a duplicate request racing a
  // slow response) a no-op instead of a unique-constraint error.
  await prisma.reelLike.upsert({
    where: { reelId_userId: { reelId, userId } },
    create: { reelId, userId },
    update: {},
  });

  return getLikeState(reelId, userId);
}

export async function unlikeReel(reelId: string, userId: string): Promise<LikeState> {
  await prisma.reelLike.deleteMany({ where: { reelId, userId } });
  return getLikeState(reelId, userId);
}
