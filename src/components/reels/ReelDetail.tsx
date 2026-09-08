"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FollowButton } from "@/components/users/FollowButton";
import { HashtagText } from "@/components/posts/HashtagText";
import { useToast } from "@/features/toast/toast-context";
import { useAuth } from "@/features/auth/auth-context";
import { CommentItem } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { ProductTagSelector } from "@/components/products/ProductTagSelector";
import { ProductTagList } from "@/components/products/ProductTagList";
import { ReelVideo } from "./ReelVideo";
import { ReelActions } from "./ReelActions";
import { ReelMenu } from "./ReelMenu";
import { ReelCommentSection } from "./ReelCommentSection";

interface ReelDetailProps {
  reel: ReelItem;
  initialComments: CommentItem[];
  initialCommentsCursor: string | null;
}

/** Shareable reel detail: desktop split (video | author/caption/comments), mobile stacked. Mirrors PostDetail.tsx. */
export function ReelDetail({ reel, initialComments, initialCommentsCursor }: ReelDetailProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [caption, setCaption] = useState(reel.caption);
  const [productTags, setProductTags] = useState(reel.productTags);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reel.caption || "");
  const [draftProductIds, setDraftProductIds] = useState<string[]>(reel.productTags.map((t) => t.id));
  const [saving, setSaving] = useState(false);
  // The detail page's video autoplays muted on load — there's no scroll-based
  // activation here the way there is in the feed, just a single reel.
  const [muted, setMuted] = useState(true);

  async function saveEdits() {
    setSaving(true);
    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft.trim() || null, productIds: draftProductIds }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update reel.");
      }
      setCaption(data.reel.caption);
      setProductTags(data.reel.productTags);
      setEditing(false);
      showToast("Reel updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update reel.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid overflow-hidden rounded-none bg-white dark:bg-neutral-900 sm:rounded-3xl lg:grid-cols-2">
      <div className="relative aspect-[9/16] bg-black lg:aspect-auto lg:h-[calc(100vh-160px)]">
        <ReelVideo
          src={reel.mediaUrl}
          posterUrl={reel.thumbnailUrl}
          isActive
          muted={muted}
          onToggleMute={() => setMuted((m) => !m)}
        />
      </div>

      <div className="flex flex-col lg:max-h-[calc(100vh-160px)]">
        <div className="flex items-center justify-between p-4 sm:p-5">
          <Link href={`/profile/${reel.author.username}`} className="group flex min-w-0 items-center gap-3">
            <Avatar src={reel.author.avatarUrl} name={reel.author.displayName} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-neutral-900 transition group-hover:text-fuchsia-500 dark:text-white">
                {reel.author.displayName}
              </p>
              <p className="truncate text-xs text-neutral-500">@{reel.author.username}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <FollowButton targetUsername={reel.author.username} initialIsFollowing={reel.isFollowingAuthor} size="sm" />
            <ReelMenu
              reelId={reel.id}
              isOwner={reel.isOwner}
              onEdit={() => {
                setDraft(caption || "");
                setDraftProductIds(productTags.map((t) => t.id));
                setEditing(true);
              }}
              onDeleted={() => {
                showToast("Reel deleted");
                router.push("/reels");
                router.refresh();
              }}
            />
          </div>
        </div>

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
                {caption && (
                  <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    <Link
                      href={`/profile/${reel.author.username}`}
                      className="font-semibold text-neutral-900 dark:text-white hover:underline"
                    >
                      {reel.author.username}
                    </Link>{" "}
                    <HashtagText text={caption} />
                  </p>
                )}
                <ProductTagList tags={productTags} />
              </>
            )}
          </div>

          <div className="border-t border-neutral-200 px-5 py-3 dark:border-neutral-800">
            <ReelActions
              reelId={reel.id}
              likeCount={reel.likeCount}
              commentCount={reel.commentCount}
              likedByMe={reel.likedByMe}
              savedByMe={reel.savedByMe}
              variant="row"
              onCommentClick={() => {
                document.getElementById(`reel-${reel.id}-comments`)?.scrollIntoView({ behavior: "smooth" });
              }}
            />
          </div>

          <div id={`reel-${reel.id}-comments`} className="border-t border-neutral-200 px-5 py-4 dark:border-neutral-800">
            <ReelCommentSection
              reelId={reel.id}
              isReelOwner={reel.isOwner}
              initialComments={initialComments}
              initialCursor={initialCommentsCursor}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
