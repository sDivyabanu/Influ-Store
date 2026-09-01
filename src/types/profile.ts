import { AccountType, Role } from "@prisma/client";

export interface PublicUserProfile {
  id: string;
  username: string;
  role: Role;
  createdAt: string | Date;
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    website: string | null;
    accountType: AccountType;
  } | null;
  counts: {
    posts: number;
    followers: number;
    following: number;
  };
}

export interface ProfileUpdateInput {
  displayName?: string;
  username?: string;
  bio?: string | null;
  website?: string | null;
  avatarUrl?: string | null;
}
