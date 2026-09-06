"use client";

import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { CommentItem as CommentItemType } from "@/types/post";
import { COMMENTS_PAGE_SIZE } from "@/lib/constants/post";
import { ReelCommentSection } from "./ReelCommentSection";

interface ReelCommentsSheetProps {
  reelId: string;
  isReelOwner: boolean;
  open: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet overlay for viewing/adding comments without leaving the
 * immersive vertical feed. Fetches lazily on first open and caches for
 * the lifetime of the card, so reopening doesn't re-fetch.
 */
export function ReelCommentsSheet({ reelId, isReelOwner, open, onClose }: ReelCommentsSheetProps) {
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!open || loaded) return;
    let ignore = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/reels/${reelId}/comments?limit=${COMMENTS_PAGE_SIZE}`);
        const data = await res.json();
        if (!ignore && res.ok && data.success) {
          setComments(data.items);
          setCursor(data.nextCursor);
          setLoaded(true);
        }
      } catch {
        // Sheet stays empty; closing and reopening retries the fetch.
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();

    return () => {
      ignore = true;
    };
  }, [open, loaded, reelId]);

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Comments"
        onClick={(e) => e.stopPropagation()}
        className="flex h-[75dvh] w-full max-w-md flex-col rounded-t-3xl bg-white dark:bg-neutral-900 shadow-2xl animate-in slide-in-from-bottom duration-200 sm:h-[80dvh] sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-sm font-bold text-neutral-900 dark:text-white">Comments</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 dark:hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && !loaded ? (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading comments...</p>
          ) : (
            <ReelCommentSection
              reelId={reelId}
              isReelOwner={isReelOwner}
              initialComments={comments}
              initialCursor={cursor}
            />
          )}
        </div>
      </div>
    </div>
  );
}
