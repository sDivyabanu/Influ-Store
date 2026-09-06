"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useAuth } from "@/features/auth/auth-context";
import { useToast } from "@/features/toast/toast-context";
import { formatRelativeTime } from "@/lib/utils/format-time";
import { cn } from "@/lib/utils/cn";
import { CommentItem as CommentItemType } from "@/types/post";
import { HashtagText } from "./HashtagText";

interface CommentItemProps {
  comment: CommentItemType;
  /** True when the current user owns the post this comment belongs to. */
  canModerate: boolean;
  onDeleted: (commentId: string) => void;
  onReplyClick?: () => void;
}

export function CommentItem({ comment, canModerate, onDeleted, onReplyClick }: CommentItemProps) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [liked, setLiked] = useState(comment.likedByMe);
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [likeBusy, setLikeBusy] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const canDelete = comment.isOwner || canModerate;

  async function toggleLike() {
    if (!isAuthenticated) {
      showToast("Log in to like comments.", "error");
      return;
    }
    if (likeBusy) return;

    setLikeBusy(true);
    const prevLiked = liked;
    const prevCount = likeCount;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((count) => count + (nextLiked ? 1 : -1));

    try {
      const res = await fetch(`/api/comments/${comment.id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setLiked(data.likedByMe);
      setLikeCount(data.likeCount);
    } catch {
      setLiked(prevLiked);
      setLikeCount(prevCount);
      showToast("Couldn't update like.", "error");
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete comment.");
      }
      onDeleted(comment.id);
      showToast("Comment deleted");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete comment.", "error");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  }

  return (
    <div className="flex items-start gap-3">
      <Link href={`/profile/${comment.author.username}`} className="shrink-0">
        <Avatar src={comment.author.avatarUrl} name={comment.author.displayName} size="sm" />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          <Link
            href={`/profile/${comment.author.username}`}
            className="font-semibold text-neutral-900 dark:text-white hover:underline"
          >
            {comment.author.username}
          </Link>{" "}
          <HashtagText text={comment.content} />
        </p>

        <div className="mt-1.5 flex items-center gap-4 text-xs text-neutral-500">
          <span>{formatRelativeTime(comment.createdAt)}</span>
          {likeCount > 0 && (
            <span>
              {likeCount} {likeCount === 1 ? "like" : "likes"}
            </span>
          )}
          {onReplyClick && (
            <button
              type="button"
              onClick={onReplyClick}
              className="font-semibold transition hover:text-neutral-900 dark:hover:text-white"
            >
              Reply
            </button>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="font-semibold transition hover:text-red-600 dark:hover:text-red-400"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={toggleLike}
        aria-pressed={liked}
        aria-label={liked ? "Unlike comment" : "Like comment"}
        className={cn(
          "mt-1 shrink-0",
          liked ? "text-fuchsia-500" : "text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
        )}
      >
        <Heart className={cn("h-3.5 w-3.5", liked && "fill-fuchsia-500")} />
      </button>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this comment?"
        description="This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
