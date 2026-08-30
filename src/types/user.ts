import { Role, AccountType } from "@prisma/client";

export type { Role, AccountType };

export interface UserSummary {
  id: string;
  email: string;
  username: string;
  role: Role;
  createdAt: string | Date;
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  username: string;
  role: Role;
  profile: {
    id: string;
    displayName: string;
    bio: string | null;
    avatarUrl: string | null;
    website: string | null;
    accountType: AccountType;
  } | null;
}
