"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/features/toast/toast-context";
import { FeedPost } from "@/types/post";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { PostHeader } from "./PostHeader";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";

interface PostCardProps {
  post: FeedPost;
  /** Called after this post is deleted, so the parent list can remove it. */
  onDeleted?: (postId: string) => void;
}

/** Reusable feed post card — used in the home feed and (as PostGrid items open into PostDetail) elsewhere. */
export function PostCard({ post, onDeleted }: PostCardProps) {
  const { showToast } = useToast();
  const [caption, setCaption] = useState(post.caption);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.caption || "");
  const [saving, setSaving] = useState(false);

  async function saveCaption() {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update post.");
      }
      setCaption(data.post.caption);
      setEditing(false);
      showToast("Post updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update post.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="p-0 overflow-hidden">
      <PostHeader
        author={post.author}
        postId={post.id}
        createdAt={post.createdAt}
        isOwner={post.isOwner}
        onEdit={() => {
          setDraft(caption || "");
          setEditing(true);
        }}
        onDeleted={() => onDeleted?.(post.id)}
      />

      <PostMediaCarousel media={post.media} alt={caption || `Post by ${post.author.username}`} />

      <div className="space-y-3 p-5">
        <PostActions
          postId={post.id}
          likeCount={post.likeCount}
          commentCount={post.commentCount}
          likedByMe={post.likedByMe}
          savedByMe={post.savedByMe}
          commentHref={`/post/${post.id}`}
        />

        {editing ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, POST_CAPTION_MAX_LENGTH))}
              charCount={draft.length}
              maxCharCount={POST_CAPTION_MAX_LENGTH}
              rows={3}
              aria-label="Edit caption"
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" isLoading={saving} onClick={saveCaption}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <PostCaption username={post.author.username} caption={caption} />
        )}

        {post.commentCount > 0 && (
          <Link
            href={`/post/${post.id}`}
            className="block text-sm text-neutral-500 transition hover:text-neutral-700 dark:hover:text-neutral-300"
          >
            View all {post.commentCount.toLocaleString()} comments
          </Link>
        )}
      </div>
    </Card>
  );
}
