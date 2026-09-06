"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ReelItem } from "@/types/reel";
import { ReelCard } from "./ReelCard";
import { ReelFeedSkeleton } from "./ReelFeedSkeleton";

interface ReelFeedProps {
  initialReels: ReelItem[];
  initialCursor: string | null;
  /** Cursor-paginated GET endpoint returning { reels, nextCursor }. */
  fetchUrl: string;
  emptyState: React.ReactNode;
}

/**
 * Vertical, scroll-snapped reel feed. One reel fills the viewport at a
 * time (scroll-snap-type: y mandatory); an IntersectionObserver scoped to
 * this scroll container tracks which card is primarily visible and drives
 * autoplay/pause — never more than one video playing at once. A second
 * observer on a trailing sentinel drives infinite-scroll pagination.
 */
export function ReelFeed({ initialReels, initialCursor, fetchUrl, emptyState }: ReelFeedProps) {
  const [reels, setReels] = useState(initialReels);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(initialReels[0]?.id ?? null);
  // Muted-by-default so autoplay is never blocked by the browser; shared
  // across all cards so unmuting once carries forward as you scroll, and
  // only the active (playing) video ever has audio.
  const [muted, setMuted] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${fetchUrl}?cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load reels.");
      setReels((current) => [...current, ...data.reels]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, fetchUrl, loading]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const mostVisible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (mostVisible) {
          const id = mostVisible.target.getAttribute("data-reel-id");
          if (id) setActiveId(id);
        }
      },
      { root, threshold: [0.6] }
    );

    itemRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [reels]);

  useEffect(() => {
    const root = containerRef.current;
    const node = sentinelRef.current;
    if (!root || !node || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { root, rootMargin: "200% 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  function removeReel(reelId: string) {
    setReels((current) => current.filter((r) => r.id !== reelId));
  }

  if (reels.length === 0 && !loading) {
    return <>{emptyState}</>;
  }

  return (
    <div
      ref={containerRef}
      className="h-[calc(100dvh-5rem)] snap-y snap-mandatory overflow-y-scroll scroll-smooth"
    >
      {reels.map((reel) => (
        <div
          key={reel.id}
          data-reel-id={reel.id}
          ref={(node) => {
            if (node) itemRefs.current.set(reel.id, node);
            else itemRefs.current.delete(reel.id);
          }}
          className="snap-start snap-always"
        >
          <ReelCard
            reel={reel}
            isActive={activeId === reel.id}
            muted={muted}
            onToggleMute={() => setMuted((m) => !m)}
            onDeleted={removeReel}
          />
        </div>
      ))}

      {loading && <ReelFeedSkeleton />}

      {error && (
        <div className="flex h-[calc(100dvh-5rem)] snap-start flex-col items-center justify-center gap-3 bg-black text-center">
          <AlertCircle className="h-6 w-6 text-white/70" />
          <p className="text-sm text-white/70">Couldn&apos;t load more reels.</p>
          <Button type="button" variant="outline" size="sm" onClick={loadMore}>
            Retry
          </Button>
        </div>
      )}

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
    </div>
  );
}
