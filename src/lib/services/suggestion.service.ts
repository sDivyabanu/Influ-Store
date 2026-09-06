import { prisma } from "@/lib/db/prisma";
import { UserCardItem } from "@/types/follow";

/**
 * Suggests users for the current viewer to discover and follow.
 * Excludes the current user and users they already follow.
 * Prioritizes accounts with more followers and recent posts.
 */
export async function getSuggestedUsers(
  currentUserId: string | null,
  limit: number = 5
): Promise<UserCardItem[]> {
  const excludedUserIds = new Set<string>();

  if (currentUserId) {
    excludedUserIds.add(currentUserId);
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });
    following.forEach((f) => excludedUserIds.add(f.followingId));
  }

  const users = await prisma.user.findMany({
    where: {
      id: { notIn: Array.from(excludedUserIds) },
    },
    take: limit,
    orderBy: [
      { followers: { _count: "desc" } },
      { posts: { _count: "desc" } },
      { createdAt: "desc" },
    ],
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          displayName: true,
          bio: true,
          avatarUrl: true,
          website: true,
          accountType: true,
        },
      },
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    role: u.role,
    createdAt: u.createdAt,
    profile: u.profile,
    counts: {
      posts: u._count.posts,
      followers: u._count.followers,
      following: u._count.following,
    },
    isFollowing: false,
    isSelf: false,
  }));
}
