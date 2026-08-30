"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Play, Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReelItem } from "@/types/reel";

interface ReelGridProps {
  /** Cursor-paginated GET endpoint returning { reels, nextCursor } — e.g. "/api/users/{username}/reels" or "/api/saved/reels". */
  fetchBaseUrl: string;
  initialReels: ReelItem[];
  initialCursor: string | null;
  emptyMessage: string;
}

function formatDuration(seconds: number | null): string | null {
  if (!seconds) return null;
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;
  return `${minutes}:${remaining.toString().padStart(2, "0")}`;
}

/**
 * Responsive video grid — used on profile Reels tabs and the Saved Reels
 * tab. Renders each tile as a muted, preload="metadata" <video> rather
 * than a static thumbnail: there's no server-side thumbnail generation
 * yet (see reel.service.ts), so this is the "clean video preview frame"
 * fallback the Phase 4 spec calls for instead of a heavy processing
 * pipeline — cheap on bandwidth since metadata-only preload never
 * downloads the full video.
 */
export function ReelGrid({ fetchBaseUrl, initialReels, initialCursor, emptyMessage }: ReelGridProps) {
  const [reels, setReels] = useState(initialReels);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const separator = fetchBaseUrl.includes("?") ? "&" : "?";
      const res = await fetch(`${fetchBaseUrl}${separator}cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setReels((current) => [...current, ...data.reels]);
      setCursor(data.nextCursor);
    } catch {
      // Button stays visible so the user can retry.
    } finally {
      setLoading(false);
    }
  }

  if (reels.length === 0) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
          <Play className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No reels yet</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5">
        {reels.map((reel) => {
          const duration = formatDuration(reel.duration);
          return (
            <Link
              key={reel.id}
              href={`/reel/${reel.id}`}
              className="group relative aspect-[9/16] overflow-hidden bg-neutral-900"
            >
              <video
                src={reel.mediaUrl}
                poster={reel.thumbnailUrl ?? undefined}
                muted
                playsInline
                preload="metadata"
                aria-label={reel.caption || `Reel by @${reel.author.username}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                <Play className="h-2.5 w-2.5 fill-white" />
              </div>
              {duration && (
                <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                  {duration}
                </span>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-5 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <Heart className="h-4 w-4 fill-white" /> {reel.likeCount}
                </span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                  <MessageCircle className="h-4 w-4 fill-white" /> {reel.commentCount}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {cursor && (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" size="sm" isLoading={loading} onClick={loadMore}>
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
