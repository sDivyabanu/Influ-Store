import { prisma } from "@/lib/db/prisma";
import { CursorPage, FeedPost } from "@/types/post";
import { UserCardItem } from "@/types/follow";
import { HashtagItem, SearchResults, SearchType } from "@/types/search";
import { postInclude, serializePost } from "./post-shared";

/**
 * Searches users by username or displayName using case-insensitive partial match.
 */
export async function searchUsers(
  query: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20
): Promise<CursorPage<UserCardItem>> {
  const cleanQuery = query.trim().replace(/^@/, "");
  if (!cleanQuery) {
    return { items: [], nextCursor: null };
  }

  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { contains: cleanQuery, mode: "insensitive" } },
        { profile: { displayName: { contains: cleanQuery, mode: "insensitive" } } },
      ],
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: [
      { followers: { _count: "desc" } },
      { username: "asc" },
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

  const hasMore = users.length > limit;
  const page = hasMore ? users.slice(0, limit) : users;
  const userIds = page.map((u) => u.id);

  // Batch query viewer's following state
  const viewerFollowingIds = new Set<string>();
  if (currentUserId && userIds.length > 0) {
    const viewerFollows = await prisma.follow.findMany({
      where: {
        followerId: currentUserId,
        followingId: { in: userIds },
      },
      select: { followingId: true },
    });
    viewerFollows.forEach((vf) => viewerFollowingIds.add(vf.followingId));
  }

  const items: UserCardItem[] = page.map((u) => ({
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
    isFollowing: viewerFollowingIds.has(u.id),
    isSelf: currentUserId === u.id,
  }));

  return {
    items,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/**
 * Searches posts by caption text with case-insensitive partial match.
 */
export async function searchPosts(
  query: string,
  currentUserId: string | null,
  cursor?: string | null,
  limit: number = 20
): Promise<CursorPage<FeedPost>> {
  const cleanQuery = query.trim();
  if (!cleanQuery) {
    return { items: [], nextCursor: null };
  }

  const posts = await prisma.post.findMany({
    where: {
      caption: { contains: cleanQuery, mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: postInclude(currentUserId),
  });

  const hasMore = posts.length > limit;
  const page = hasMore ? posts.slice(0, limit) : posts;

  return {
    items: page.map((p) => serializePost(p, currentUserId)),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/**
 * Searches hashtags by name with case-insensitive partial match.
 */
export async function searchHashtags(
  query: string,
  cursor?: string | null,
  limit: number = 20
): Promise<CursorPage<HashtagItem>> {
  const cleanTag = query.trim().replace(/^#/, "").toLowerCase();
  if (!cleanTag) {
    return { items: [], nextCursor: null };
  }

  const hashtags = await prisma.hashtag.findMany({
    where: {
      name: { contains: cleanTag, mode: "insensitive" },
    },
    orderBy: {
      posts: { _count: "desc" },
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      _count: { select: { posts: true } },
    },
  });

  const hasMore = hashtags.length > limit;
  const page = hasMore ? hashtags.slice(0, limit) : hashtags;

  return {
    items: page.map((h) => ({
      id: h.id,
      name: h.name,
      postCount: h._count.posts,
    })),
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
}

/**
 * Executes a unified global search across users, posts, and hashtags.
 */
export async function globalSearch(
  query: string,
  currentUserId: string | null,
  type: SearchType = "all",
  cursor?: string | null,
  limit: number = 20
): Promise<SearchResults> {
  if (type === "users") {
    const users = await searchUsers(query, currentUserId, cursor, limit);
    return {
      users,
      posts: { items: [], nextCursor: null },
      hashtags: { items: [], nextCursor: null },
    };
  }

  if (type === "posts") {
    const posts = await searchPosts(query, currentUserId, cursor, limit);
    return {
      users: { items: [], nextCursor: null },
      posts,
      hashtags: { items: [], nextCursor: null },
    };
  }

  if (type === "hashtags") {
    const hashtags = await searchHashtags(query, cursor, limit);
    return {
      users: { items: [], nextCursor: null },
      posts: { items: [], nextCursor: null },
      hashtags,
    };
  }

  // Type "all": Fetch top matches for all categories in parallel
  const [users, posts, hashtags] = await Promise.all([
    searchUsers(query, currentUserId, undefined, 5),
    searchPosts(query, currentUserId, undefined, 10),
    searchHashtags(query, undefined, 5),
  ]);

  return {
    users,
    posts,
    hashtags,
  };
}
