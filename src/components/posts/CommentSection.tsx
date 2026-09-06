"use client";

import React, { useState } from "react";
import { CommentItem as CommentItemType } from "@/types/post";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants/post";
import { CommentThread } from "./CommentThread";
import { CommentForm } from "./CommentForm";

interface CommentSectionProps {
  postId: string;
  isPostOwner: boolean;
  initialComments: CommentItemType[];
  initialCursor: string | null;
}

export function CommentSection({ postId, isPostOwner, initialComments, initialCursor }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/posts/${postId}/comments?cursor=${encodeURIComponent(cursor)}&limit=${COMMENTS_PAGE_SIZE}`
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
    const res = await fetch(`/api/posts/${postId}/comments`, {
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
            <CommentThread
              key={comment.id}
              comment={comment}
              postId={postId}
              isPostOwner={isPostOwner}
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
