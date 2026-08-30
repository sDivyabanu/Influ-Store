import { prisma } from "@/lib/db/prisma";
import { NotFoundError, BadRequestError } from "@/lib/errors";
import { CursorPage } from "@/types/post";
import { UserCardItem, FollowToggleResponse, FollowCounts } from "@/types/follow";

/**
 * Toggles the follow state between the current user and the target user.
 * Self-following is rejected with a BadRequestError.
 */
export async function toggleFollow(
  followerId: string,
  targetUsername: string
): Promise<FollowToggleResponse> {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername.toLowerCase() },
    select: { id: true, username: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found.");
  }

  if (followerId === targetUser.id) {
    throw new BadRequestError("You cannot follow yourself.");
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUser.id,
      },
    },
  });

  let isFollowing: boolean;

  if (existingFollow) {
    await prisma.follow.delete({
      where: { id: existingFollow.id },
    });
    isFollowing = false;
  } else {
    await prisma.follow.create({
      data: {
        followerId,
        followingId: targetUser.id,
      },
    });
    isFollowing = true;
  }

  const [followerCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: targetUser.id } }),
    prisma.follow.count({ where: { followerId: targetUser.id } }),
  ]);

  return {
    success: true,
    isFollowing,
    followerCount,
    followingCount,
  };
}

/**
 * Checks if a user is following another user.
 */
export async function isUserFollowing(
  followerId: string | null,
  targetUserId: string
): Promise<boolean> {
  if (!followerId) return false;
  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId: targetUserId,
      },
    },
    select: { id: true },
  });
  return !!follow;
}

/**
 * Retrieves the follower and following counts for a user.
 */
export async function getFollowCounts(userId: string): Promise<FollowCounts> {
  const [followers, following] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);
  return { followers, following };
}

/**
 * Retrieves a paginated list of users who follow the target user.
 */
export async function getFollowers(
  targetUsername: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20
): Promise<CursorPage<UserCardItem>> {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername.toLowerCase() },
    select: { id: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found.");
  }

  const follows = await prisma.follow.findMany({
    where: { followingId: targetUser.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      follower: {
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
      },
    },
  });

  const hasMore = follows.length > limit;
  const page = hasMore ? follows.slice(0, limit) : follows;
  const followerUserIds = page.map((f) => f.follower.id);

  // Batch query viewer's following state
  const viewerFollowingIds = new Set<string>();
  if (currentUserId && followerUserIds.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followerUserIds },
      },
      select: { followingId: true },
    });
    viewerFollows.forEach((vf) => viewerFollowingIds.add(vf.followingId));
  }

  const items: UserCardItem[] = page.map((f) => ({
    id: f.follower.id,
    username: f.follower.username,
    role: f.follower.role,
    createdAt: f.follower.createdAt,
    profile: f.follower.profile,
    counts: {
      posts: f.follower._count.posts,
      followers: f.follower._count.followers,
      following: f.follower._count.following,
    },
    isFollowing: viewerFollowingIds.has(f.follower.id),
    isSelf: currentUserId === f.follower.id,
  }));

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/**
 * Retrieves a paginated list of users that the target user is following.
 */
export async function getFollowing(
  targetUsername: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20
): Promise<CursorPage<UserCardItem>> {
  const targetUser = await prisma.user.findUnique({
    where: { username: targetUsername.toLowerCase() },
    select: { id: true },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found.");
  }

  const follows = await prisma.follow.findMany({
    where: { followerId: targetUser.id },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      following: {
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
      },
    },
  });

  const hasMore = follows.length > limit;
  const page = hasMore ? follows.slice(0, limit) : follows;
  const followingUserIds = page.map((f) => f.following.id);

  // Batch query viewer's following state
  const viewerFollowingIds = new Set<string>();
  if (currentUserId && followingUserIds.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: followingUserIds },
      },
      select: { followingId: true },
    });
    viewerFollows.forEach((vf) => viewerFollowingIds.add(vf.followingId));
  }

  const items: UserCardItem[] = page.map((f) => ({
    id: f.following.id,
    username: f.following.username,
    role: f.following.role,
    createdAt: f.following.createdAt,
    profile: f.following.profile,
    counts: {
      posts: f.following._count.posts,
      followers: f.following._count.followers,
      following: f.following._count.following,
    },
    isFollowing: viewerFollowingIds.has(f.following.id),
    isSelf: currentUserId === f.following.id,
  }));

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}
