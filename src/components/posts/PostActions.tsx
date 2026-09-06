"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { cn } from "@/lib/utils/cn";

interface PostActionsProps {
  postId: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  savedByMe: boolean;
  /** When provided, the comment icon links here instead of firing onCommentClick. */
  commentHref?: string;
  onCommentClick?: () => void;
}

export function PostActions({
  postId,
  likeCount,
  commentCount,
  likedByMe,
  savedByMe,
  commentHref,
  onCommentClick,
}: PostActionsProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(likedByMe);
  const [likes, setLikes] = useState(likeCount);
  const [saved, setSaved] = useState(savedByMe);
  const [likeBusy, setLikeBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);

  async function toggleLike() {
    if (!isAuthenticated) {
      showToast("Log in to like posts.", "error");
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
      const res = await fetch(`/api/posts/${postId}/like`, {
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
      showToast("Log in to save posts.", "error");
      return;
    }
    if (saveBusy) return;

    setSaveBusy(true);
    const prevSaved = saved;
    const nextSaved = !saved;
    setSaved(nextSaved);

    try {
      const res = await fetch(`/api/posts/${postId}/save`, {
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
    const url = `${window.location.origin}/post/${postId}`;
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

  return (
    <div className="flex items-center gap-5">
      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "Unlike post" : "Like post"}
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

      {commentHref ? (
        <Link
          href={commentHref}
          aria-label="View comments"
          className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentCount.toLocaleString()}</span>
        </Link>
      ) : (
        <button
          type="button"
          onClick={onCommentClick}
          aria-label="View comments"
          className="flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{commentCount.toLocaleString()}</span>
        </button>
      )}

      <button
        type="button"
        onClick={share}
        aria-label="Share post"
        className="text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
      >
        <Share2 className="h-5 w-5" />
      </button>

      <button
        type="button"
        onClick={toggleSave}
        aria-pressed={saved}
        aria-label={saved ? "Remove from saved" : "Save post"}
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
