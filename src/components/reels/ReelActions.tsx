"use client";

import React, { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { cn } from "@/lib/utils/cn";

interface ReelActionsProps {
  reelId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  onCommentClick: () => void;
  /**
   * "overlay" (default): vertical white-icon rail for the dark video card.
   * "row": horizontal, theme-aware bar for the detail page's light panel.
   */
  variant?: "overlay" | "row";
}

/** Engagement actions for a reel — mirrors PostActions' logic (optimistic + rollback). */
export function ReelActions({
  reelId,
  likeCount,
  commentCount,
  likedByMe,
  savedByMe,
  onCommentClick,
  variant = "overlay",
}: ReelActionsProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(likedByMe);
  const [likes, setLikes] = useState(likeCount);
  const [saved, setSaved] = useState(savedByMe);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated) {
      showToast("Log in to like reels.", "error");
      return;
    }
    if (likeBusy) return;

    setLikeBusy(true);
    const prevLiked = liked;
    const prevLikes = likes;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikes((count) => count + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/reels/${reelId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setLiked(data.likedByMe);
      setLikes(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikes(prevLikes);
      showToast("Couldn't update like. Try again.", "error");
    } finally {
      setLikeBusy(false);
    }
  }

  async function toggleSave() {
    if (!isAuthenticated) {
      showToast("Log in to save reels.", "error");
      return;
    }
    if (saveBusy) return;

    setSaveBusy(true);
    const prevSaved = saved;
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const res = await fetch(`/api/reels/${reelId}/save`, {
        method: nextSaved ? "POST" : "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setSaved(data.savedByMe);
      showToast(data.savedByMe ? "Saved" : "Removed from saved");
    } catch {
      setSaved(prevSaved);
      showToast("Couldn't update save. Try again.", "error");
    } finally {
      setSaveBusy(false);
    }
  }

  async function share() {
    const url = `${window.location.origin}/reel/${reelId}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ url });
        return;
      } catch {
        // User cancelled the native share sheet, or it's unsupported — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy link.", "error");
    }
  }

  if (variant === "row") {
    return (
      <div className="flex items-center gap-5">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          aria-label={liked ? "Unlike reel" : "Like reel"}
          className={cn(
            "flex items-center gap-1.5 text-sm transition",
            liked
              ? "font-semibold text-fuchsia-500"
              : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          )}
        >
          <Heart className={cn("h-5 w-5", liked && "fill-fuchsia-500")} />
          <span>{likes.toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={onCommentClick}
          aria-label="View comments"
          className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentCount.toLocaleString()}</span>
        </button>

        <button
          type="button"
          onClick={share}
          aria-label="Share reel"
          className="text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          <Share2 className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={toggleSave}
          aria-pressed={saved}
          aria-label={saved ? "Remove from saved" : "Save reel"}
          className={cn(
            "ml-auto transition",
            saved ? "text-fuchsia-500" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
          )}
        >
          <Bookmark className={cn("h-5 w-5", saved && "fill-fuchsia-500")} />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "Unlike reel" : "Like reel"}
        className="flex flex-col items-center gap-1"
      >
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition",
            liked ? "text-fuchsia-400" : "text-white"
          )}
        >
          <Heart className={cn("h-6 w-6", liked && "fill-fuchsia-400")} />
        </span>
        <span className="text-xs font-semibold text-white drop-shadow">{likes.toLocaleString()}</span>
      </button>

      <button
        type="button"
        onClick={onCommentClick}
        aria-label="View comments"
        className="flex flex-col items-center gap-1"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
          <MessageCircle className="h-6 w-6" />
        </span>
        <span className="text-xs font-semibold text-white drop-shadow">{commentCount.toLocaleString()}</span>
      </button>

      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save reel"}
        className="flex flex-col items-center gap-1"
      >
        <span
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition",
            saved ? "text-fuchsia-400" : "text-white"
          )}
        >
          <Bookmark className={cn("h-6 w-6", saved && "fill-fuchsia-400")} />
        </span>
      </button>

      <button type="button" onClick={share} aria-label="Share reel" className="flex flex-col items-center gap-1">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm">
          <Share2 className="h-6 w-6" />
        </span>
      </button>
    </div>
  );
}
