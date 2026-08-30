"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/features/toast/toast-context";
import { useAuth } from "@/features/auth/auth-context";
import { FeedPost } from "@/types/post";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { ProductTagSelector } from "@/components/products/ProductTagSelector";
import { ProductTagList } from "@/components/products/ProductTagList";
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
  const { user } = useAuth();
  const [caption, setCaption] = useState(post.caption);
  const [productTags, setProductTags] = useState(post.productTags);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(post.caption || "");
  const [draftProductIds, setDraftProductIds] = useState<string[]>(post.productTags.map((t) => t.id));
  const [saving, setSaving] = useState(false);

  async function saveEdits() {
    setSaving(true);
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft.trim() || null, productIds: draftProductIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update post.");
      }
      setCaption(data.post.caption);
      setProductTags(data.post.productTags);
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
          setDraftProductIds(productTags.map((t) => t.id));
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
          <div className="space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, POST_CAPTION_MAX_LENGTH))}
              charCount={draft.length}
              maxCharCount={POST_CAPTION_MAX_LENGTH}
              rows={3}
              aria-label="Edit caption"
            />
            {user?.role === "SELLER" && (
              <ProductTagSelector selectedProductIds={draftProductIds} onChange={setDraftProductIds} />
            )}
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
              <Button type="button" size="sm" isLoading={saving} onClick={saveEdits}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <PostCaption username={post.author.username} caption={caption} />
            <ProductTagList tags={productTags} />
          </>
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
