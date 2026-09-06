import { prisma } from "@/lib/db/prisma";
import { NotFoundError } from "@/lib/errors";
import { REELS_FEED_PAGE_SIZE } from "@/lib/constants/reel";
import { CursorPage } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { reelInclude, serializeReel, getFollowingAuthorIds } from "./reel-shared";

export async function saveReel(reelId: string, userId: string): Promise<{ savedByMe: boolean }> {
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { id: true },
  });
  if (!reel) throw new NotFoundError("Reel not found.");

  await prisma.savedReel.upsert({
    where: { userId_reelId: { userId, reelId } },
    create: { userId, reelId },
    update: {},
  });

  return { savedByMe: true };
}

export async function unsaveReel(reelId: string, userId: string): Promise<{ savedByMe: boolean }> {
  await prisma.savedReel.deleteMany({ where: { userId, reelId } });
  return { savedByMe: false };
}

/**
 * Saved reels are private: only ever call this with the session owner's
 * own userId. Never expose another user's saved list.
 */
export async function listSavedReels(
  userId: string,
  cursor?: string | null,
  limit: number = REELS_FEED_PAGE_SIZE
): Promise<CursorPage<ReelItem>> {
  const saved = await prisma.savedReel.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { reel: { include: reelInclude(userId) } },
  });

  const hasMore = saved.length > limit;
  const page = hasMore ? saved.slice(0, limit) : saved;
  const authorIds = Array.from(new Set(page.map((s) => s.reel.authorId)));
  const followingAuthorIds = await getFollowingAuthorIds(userId, authorIds);

  return {
    items: page.map((s) => serializeReel(s.reel, userId, followingAuthorIds)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
