import { AccountType, Role } from "@prisma/client";

export interface UserCardItem {
  id: string;
  username: string;
  role: Role;
  createdAt: Date | string;
  profile: {
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    website: string | null;
    accountType: AccountType;
  } | null;
  counts?: {
    posts: number;
    followers: number;
    following: number;
  };
  isFollowing?: boolean;
  isSelf?: boolean;
  mutualCount?: number;
}

export interface FollowToggleResponse {
  success: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  message?: string;
}

export interface FollowCounts {
  followers: number;
  following: number;
}
