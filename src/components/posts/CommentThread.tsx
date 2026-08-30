"use client";

import React, { useState } from "react";
import { CommentItem as CommentItemType } from "@/types/post";
import { REPLIES_PAGE_SIZE } from "@/lib/constants/post";
import { CommentItem } from "./CommentItem";
import { CommentForm } from "./CommentForm";

interface CommentThreadProps {
  comment: CommentItemType;
  postId: string;
  isPostOwner: boolean;
  onDeleted: (commentId: string) => void;
}

/** A top-level comment plus its (one-level-deep) replies. */
export function CommentThread({ comment, postId, isPostOwner, onDeleted }: CommentThreadProps) {
  const [replies, setReplies] = useState<CommentItemType[]>([]);
  const [repliesLoaded, setRepliesLoaded] = useState(false);
  const [repliesVisible, setRepliesVisible] = useState(false);
  const [repliesCursor, setRepliesCursor] = useState<string | null>(null);
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [replyCount, setReplyCount] = useState(comment.replyCount);
  const [replying, setReplying] = useState(false);

  async function loadReplies() {
    setLoadingReplies(true);
    try {
      const res = await fetch(`/api/comments/${comment.id}/replies?limit=${REPLIES_PAGE_SIZE}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setReplies(data.items);
      setRepliesCursor(data.nextCursor);
      setRepliesLoaded(true);
      setRepliesVisible(true);
    } catch {
      // "View replies" stays clickable so the user can retry.
    } finally {
      setLoadingReplies(false);
    }
  }

  async function loadMoreReplies() {
    if (!repliesCursor || loadingReplies) return;
    setLoadingReplies(true);
    try {
      const res = await fetch(
        `/api/comments/${comment.id}/replies?cursor=${encodeURIComponent(repliesCursor)}&limit=${REPLIES_PAGE_SIZE}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setReplies((current) => [...current, ...data.items]);
      setRepliesCursor(data.nextCursor);
    } catch {
      // "View more replies" stays clickable so the user can retry.
    } finally {
      setLoadingReplies(false);
    }
  }

  function toggleReplies() {
    if (!repliesLoaded) {
      loadReplies();
      return;
    }
    setRepliesVisible((visible) => !visible);
  }

  async function submitReply(content: string) {
    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content, parentId: comment.id }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || "Failed to post reply.");
    }
    setReplies((current) => [...current, data.comment]);
    setReplyCount((count) => count + 1);
    setRepliesLoaded(true);
    setRepliesVisible(true);
    setReplying(false);
  }

  function removeReply(id: string) {
    setReplies((current) => current.filter((reply) => reply.id !== id));
    setReplyCount((count) => Math.max(0, count - 1));
  }

  return (
    <div>
      <CommentItem
        comment={comment}
        canModerate={isPostOwner}
        onDeleted={onDeleted}
        onReplyClick={() => setReplying((v) => !v)}
      />

      <div className="ml-11 mt-2 space-y-3">
        {replying && (
          <CommentForm
            onSubmit={submitReply}
            placeholder={`Reply to ${comment.author.username}...`}
            submitLabel="Reply"
            autoFocus
            onCancel={() => setReplying(false)}
          />
        )}

        {replyCount > 0 && !repliesVisible && (
          <button
            type="button"
            onClick={toggleReplies}
            disabled={loadingReplies}
            className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
          >
            {loadingReplies ? "Loading..." : `View ${replyCount} ${replyCount === 1 ? "reply" : "replies"}`}
          </button>
        )}

        {repliesVisible && (
          <div className="space-y-3">
            {replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                canModerate={isPostOwner}
                onDeleted={removeReply}
              />
            ))}

            {repliesCursor && (
              <button
                type="button"
                onClick={loadMoreReplies}
                disabled={loadingReplies}
                className="text-xs font-semibold text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
              >
                {loadingReplies ? "Loading..." : "View more replies"}
              </button>
            )}

            <button
              type="button"
              onClick={() => setRepliesVisible(false)}
              className="block text-xs font-semibold text-neutral-500 transition hover:text-neutral-900 dark:hover:text-white"
            >
              Hide replies
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
