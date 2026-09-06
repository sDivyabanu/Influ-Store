"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { cn } from "@/lib/utils/cn";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";

export interface FollowButtonProps {
  targetUsername: string;
  initialIsFollowing?: boolean;
  onFollowChange?: (isFollowing: boolean, followerCount: number, followingCount: number) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
}

export function FollowButton({
  targetUsername,
  initialIsFollowing = false,
  onFollowChange,
  size = "sm",
  className,
}: FollowButtonProps) {

  const { isAuthenticated, user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // If viewing own account, do not render a follow button
  if (user?.username?.toLowerCase() === targetUsername.toLowerCase()) {
    return null;
  }

  const handleToggleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast("Please log in to follow creators.", "error");
      router.push(`/login?callbackUrl=/profile/${targetUsername}`);
      return;
    }

    if (isLoading) return;

    // Optimistic update
    const previousState = isFollowing;
    const nextState = !isFollowing;
    setIsFollowing(nextState);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/users/${targetUsername}/follow`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update follow status.");
      }

      setIsFollowing(data.isFollowing);
      if (onFollowChange) {
        onFollowChange(data.isFollowing, data.followerCount, data.followingCount);
      }
    } catch (err) {
      // Rollback on error
      setIsFollowing(previousState);
      const errorMessage = err instanceof Error ? err.message : "Something went wrong.";
      showToast(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      size={size}
      variant={isFollowing ? "outline" : "primary"}
      onClick={handleToggleFollow}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "transition-all shrink-0 min-w-[96px] select-none",
        isFollowing && isHovered && "border-red-500/50 text-red-500 dark:text-red-400 hover:bg-red-500/10",
        className
      )}
      aria-label={isFollowing ? `Unfollow ${targetUsername}` : `Follow ${targetUsername}`}
    >
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isFollowing ? (
        isHovered ? (
          "Unfollow"
        ) : (
          <span className="inline-flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-fuchsia-500" />
            Following
          </span>
        )
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </span>
      )}
    </Button>
  );
}
