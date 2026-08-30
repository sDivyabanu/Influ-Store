import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";
import { NotFoundError, ForbiddenError } from "@/lib/errors";
import { REEL_GRID_PAGE_SIZE } from "@/lib/constants/reel";
import { CreateReelInput } from "@/lib/validations/reel.schema";
import { CursorPage } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { reelInclude, serializeReel, getFollowingAuthorIds } from "./reel-shared";
import { assertReelMediaKeyOwnedByUser } from "./reel-media-upload.service";
import { syncReelHashtags } from "./hashtag.service";

export async function getReelById(
  reelId: string,
  currentUserId: string | null
): Promise<ReelItem | null> {
  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    include: reelInclude(currentUserId),
  });
  if (!reel) return null;

  const followingAuthorIds = await getFollowingAuthorIds(currentUserId, [reel.authorId]);
  return serializeReel(reel, currentUserId, followingAuthorIds);
}

export async function createReel(
  authorId: string,
  input: CreateReelInput
): Promise<ReelItem> {
  // Never trust the browser's claim that a media key belongs to it —
  // the key must live under this author's own upload folder.
  assertReelMediaKeyOwnedByUser(input.mediaKey, authorId);
  if (input.thumbnailKey) {
    assertReelMediaKeyOwnedByUser(input.thumbnailKey, authorId);
  }

  const storage = getStorageService();
  const caption = input.caption?.trim() || null;

  const reelId = await prisma.$transaction(async (tx) => {
    const created = await tx.reel.create({
      data: {
        authorId,
        caption,
        mediaKey: input.mediaKey,
        mediaUrl: storage.getPublicUrl(input.mediaKey),
        thumbnailKey: input.thumbnailKey ?? null,
        thumbnailUrl: input.thumbnailKey ? storage.getPublicUrl(input.thumbnailKey) : null,
        duration: input.duration ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
      },
    });

    await syncReelHashtags(tx, created.id, caption);

    return created.id;
  });

  const reel = await getReelById(reelId, authorId);
  if (!reel) throw new NotFoundError("Reel not found after creation.");
  return reel;
}

export async function updateReelCaption(
  reelId: string,
  userId: string,
  caption: string | null
): Promise<ReelItem> {
  const existing = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { authorId: true },
  });
  if (!existing) throw new NotFoundError("Reel not found.");
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You can only edit your own reels.");
  }

  const trimmedCaption = caption?.trim() || null;

  await prisma.$transaction(async (tx) => {
    await tx.reel.update({
      where: { id: reelId },
      data: { caption: trimmedCaption },
    });
    await syncReelHashtags(tx, reelId, trimmedCaption);
  });

  const reel = await getReelById(reelId, userId);
  if (!reel) throw new NotFoundError("Reel not found.");
  return reel;
}

export async function deleteReel(reelId: string, userId: string): Promise<void> {
  const existing = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { authorId: true, mediaKey: true, thumbnailKey: true },
  });
  if (!existing) throw new NotFoundError("Reel not found.");
  if (existing.authorId !== userId) {
    throw new ForbiddenError("You can only delete your own reels.");
  }

  // Cascade deletes ReelLike/ReelComment/ReelCommentLike/SavedReel/ReelHashtag rows via FKs.
  await prisma.reel.delete({ where: { id: reelId } });

  const storage = getStorageService();
  await Promise.allSettled(
    [existing.mediaKey, existing.thumbnailKey]
      .filter((key): key is string => Boolean(key))
      .map((key) => storage.deleteFile(key))
  );
}

export async function listUserReels(
  authorId: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = REEL_GRID_PAGE_SIZE
): Promise<CursorPage<ReelItem>> {
  const reels = await prisma.reel.findMany({
    where: { authorId },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: reelInclude(currentUserId),
  });

  const hasMore = reels.length > limit;
  const page = hasMore ? reels.slice(0, limit) : reels;
  const followingAuthorIds = await getFollowingAuthorIds(currentUserId, [authorId]);

  return {
    items: page.map((r) => serializeReel(r, currentUserId, followingAuthorIds)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
