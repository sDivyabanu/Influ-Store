"use client";

import React, { useState } from "react";
import { CommentItem as CommentItemType } from "@/types/post";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants/post";
import { ReelCommentThread } from "./ReelCommentThread";
import { CommentForm } from "@/components/posts/CommentForm";

interface ReelCommentSectionProps {
  reelId: string;
  isReelOwner: boolean;
  initialComments: CommentItemType[];
  initialCursor: string | null;
}

/**
 * Mirrors components/posts/CommentSection.tsx for reels. Used both in the
 * feed's comment sheet and on the /reel/[reelId] detail page.
 */
export function ReelCommentSection({ reelId, isReelOwner, initialComments, initialCursor }: ReelCommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/reels/${reelId}/comments?cursor=${encodeURIComponent(cursor)}&limit=${COMMENTS_PAGE_SIZE}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setComments((current) => [...current, ...data.items]);
      setCursor(data.nextCursor);
    } catch {
      // "Load more comments" stays visible so the user can retry.
    } finally {
      setLoading(false);
    }
  }

  async function submitComment(content: string) {
    const res = await fetch(`/api/reels/${reelId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to post comment.");
    }
    setComments((current) => [...current, data.comment]);
  }

  function removeComment(id: string) {
    setComments((current) => current.filter((comment) => comment.id !== id));
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex-1 space-y-6">
        {comments.length === 0 ? (
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            No comments yet. Be the first to comment.
          </p>
        ) : (
          comments.map((comment) => (
            <ReelCommentThread
              key={comment.id}
              comment={comment}
              reelId={reelId}
              isReelOwner={isReelOwner}
              onDeleted={removeComment}
            />
          ))
        )}

        {cursor && (
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
          >
            {loading ? "Loading..." : "Load more comments"}
          </button>
        )}
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <CommentForm onSubmit={submitComment} />
      </div>
    </div>
  );
}
