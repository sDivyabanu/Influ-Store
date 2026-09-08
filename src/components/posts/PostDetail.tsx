"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/features/toast/toast-context";
import { useAuth } from "@/features/auth/auth-context";
import { CommentItem, FeedPost } from "@/types/post";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { ProductTagSelector } from "@/components/products/ProductTagSelector";
import { ProductTagList } from "@/components/products/ProductTagList";
import { PostHeader } from "./PostHeader";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { PostActions } from "./PostActions";
import { PostCaption } from "./PostCaption";
import { CommentSection } from "./CommentSection";

interface PostDetailProps {
  post: FeedPost;
  initialComments: CommentItem[];
  initialCommentsCursor: string | null;
}

export function PostDetail({ post, initialComments, initialCommentsCursor }: PostDetailProps) {
  const router = useRouter();
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
    <Card className="grid overflow-hidden p-0 lg:grid-cols-2">
      <div className="bg-black">
        <PostMediaCarousel media={post.media} alt={caption || `Post by ${post.author.username}`} />
      </div>

      <div className="flex flex-col lg:max-h-[calc(100vh-160px)]">
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
          onDeleted={() => {
            showToast("Post deleted");
            router.push("/home");
            router.refresh();
          }}
        />

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-3 border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
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
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
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
          </div>

          <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
            <PostActions
              postId={post.id}
              likeCount={post.likeCount}
              commentCount={post.commentCount}
              likedByMe={post.likedByMe}
              savedByMe={post.savedByMe}
            />
          </div>

          <div className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <CommentSection
              postId={post.id}
              isPostOwner={post.isOwner}
              initialComments={initialComments}
              initialCursor={initialCommentsCursor}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
