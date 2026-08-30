import React from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/users/FollowButton";
import { UserCardItem } from "@/types/follow";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface UserCardProps {
  user: UserCardItem;
  className?: string;
  showBio?: boolean;
  showCounts?: boolean;
  onFollowChange?: (isFollowing: boolean) => void;
}

export function UserCard({
  user,
  className,
  showBio = true,
  showCounts = true,
  onFollowChange,
}: UserCardProps) {
  const displayName = user.profile?.displayName || user.username;
  const avatarUrl = user.profile?.avatarUrl;
  const bio = user.profile?.bio;
  const isInfluencer = user.profile?.accountType === "INFLUENCER";

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 p-4 rounded-2xl border border-neutral-200/80 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm transition hover:border-neutral-300 dark:hover:border-neutral-700",
        className
      )}
    >
      {/* USER INFO */}
      <Link
        href={`/profile/${user.username}`}
        className="flex items-center gap-3.5 min-w-0 flex-1 group"
      >
        <Avatar
          src={avatarUrl}
          name={displayName}
          size="md"
          className="shrink-0 ring-2 ring-transparent group-hover:ring-fuchsia-500/30 transition"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-semibold text-sm text-neutral-900 dark:text-white truncate group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition">
              {displayName}
            </span>
            {isInfluencer && (
              <Badge variant="primary" className="py-0 px-1.5 text-[10px] gap-0.5">
                <Sparkles className="h-2.5 w-2.5" />
                <span>Creator</span>
              </Badge>
            )}
          </div>

          <p className="text-xs text-neutral-500 truncate">@{user.username}</p>

          {showBio && bio && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1 mt-0.5">
              {bio}
            </p>
          )}

          {showCounts && user.counts && (
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1">
              {user.counts.followers.toLocaleString()} follower{user.counts.followers === 1 ? "" : "s"} · {user.counts.posts} post{user.counts.posts === 1 ? "" : "s"}
            </p>
          )}
        </div>
      </Link>

      {/* FOLLOW ACTION */}
      {!user.isSelf && (
        <div className="shrink-0">
          <FollowButton
            targetUsername={user.username}
            initialIsFollowing={user.isFollowing}
            onFollowChange={(isFollowing) => onFollowChange?.(isFollowing)}
          />
        </div>
      )}
    </div>
  );
}
