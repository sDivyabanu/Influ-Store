"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { FollowButton } from "@/components/users/FollowButton";
import { HashtagText } from "@/components/posts/HashtagText";
import { useToast } from "@/features/toast/toast-context";
import { ReelItem } from "@/types/reel";
import { POST_CAPTION_MAX_LENGTH } from "@/lib/constants/post";
import { ProductTagList } from "@/components/products/ProductTagList";
import { ReelVideo } from "./ReelVideo";
import { ReelActions } from "./ReelActions";
import { ReelMenu } from "./ReelMenu";
import { ReelCommentsSheet } from "./ReelCommentsSheet";

interface ReelCardProps {
  reel: ReelItem;
  isActive: boolean;
  muted: boolean;
  onToggleMute: () => void;
  /** Called after this reel is deleted, so the parent feed can remove it. */
  onDeleted?: (reelId: string) => void;
}

/** One reel's full-viewport card: video, author identity + follow, caption, action rail, options menu, and a comments sheet. */
export function ReelCard({ reel, isActive, muted, onToggleMute, onDeleted }: ReelCardProps) {
  const { showToast } = useToast();

  const [caption, setCaption] = useState(reel.caption);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(reel.caption || "");
  const [saving, setSaving] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);

  async function saveCaption() {
    setSaving(true);
    try {
      const res = await fetch(`/api/reels/${reel.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft.trim() || null }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to update reel.");
      }
      setCaption(data.reel.caption);
      setEditing(false);
      showToast("Reel updated");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update reel.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="relative mx-auto h-[calc(100dvh-5rem)] w-full max-w-md overflow-hidden bg-black sm:rounded-3xl">
      <ReelVideo
        src={reel.mediaUrl}
        posterUrl={reel.thumbnailUrl}
        isActive={isActive}
        muted={muted}
        onToggleMute={onToggleMute}
      />

      {/* OPTIONS MENU */}
      <div className="absolute right-4 top-4 z-10">
        <ReelMenu
          reelId={reel.id}
          isOwner={reel.isOwner}
          onEdit={() => {
            setDraft(caption || "");
            setEditing(true);
          }}
          onDeleted={() => onDeleted?.(reel.id)}
        />
      </div>

      {/* ACTION RAIL */}
      <div className="pointer-events-auto absolute bottom-24 right-3 z-10 sm:bottom-8">
        <ReelActions
          reelId={reel.id}
          likeCount={reel.likeCount}
          commentCount={reel.commentCount}
          likedByMe={reel.likedByMe}
          savedByMe={reel.savedByMe}
          onCommentClick={() => setCommentsOpen(true)}
        />
      </div>

      {/* AUTHOR + CAPTION OVERLAY */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 pb-6 pr-16">
        <div className="pointer-events-auto flex items-center gap-2.5">
          <Link href={`/profile/${reel.author.username}`}>
            <Avatar
              src={reel.author.avatarUrl}
              name={reel.author.displayName}
              size="sm"
              className="ring-2 ring-white/70"
            />
          </Link>
          <Link href={`/profile/${reel.author.username}`} className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{reel.author.displayName}</p>
            <p className="truncate text-xs text-white/70">@{reel.author.username}</p>
          </Link>
          <FollowButton
            targetUsername={reel.author.username}
            initialIsFollowing={reel.isFollowingAuthor}
            size="sm"
            variant="outline"
            className="shrink-0 border-white/40 bg-black/30 text-white hover:bg-black/50"
          />
        </div>

        {editing ? (
          <div className="pointer-events-auto mt-2 space-y-2 rounded-2xl bg-black/60 p-3 backdrop-blur-sm">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, POST_CAPTION_MAX_LENGTH))}
              charCount={draft.length}
              maxCharCount={POST_CAPTION_MAX_LENGTH}
              rows={3}
              aria-label="Edit caption"
              className="border-white/20 bg-black/40 text-white placeholder:text-white/40"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
                Cancel
              </Button>
              <Button type="button" size="sm" isLoading={saving} onClick={saveCaption}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            {caption && (
              <p className="pointer-events-auto mt-2 line-clamp-3 text-sm text-white/90">
                <HashtagText text={caption} hashtagClassName="text-fuchsia-300 hover:text-fuchsia-200" />
              </p>
            )}
            {reel.productTags.length > 0 && (
              <div className="pointer-events-auto mt-2">
                <ProductTagList tags={reel.productTags} variant="overlay" />
              </div>
            )}
          </>
        )}
      </div>

      <ReelCommentsSheet
        reelId={reel.id}
        isReelOwner={reel.isOwner}
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
      />
    </div>
  );
}
