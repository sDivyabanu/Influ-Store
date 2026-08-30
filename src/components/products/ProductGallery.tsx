"use client";

import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { ProductMediaItem } from "@/types/product";

const SWIPE_THRESHOLD_PX = 50;

export function ProductGallery({ media, alt }: { media: ProductMediaItem[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);

  if (media.length === 0) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
        <Package className="h-10 w-10" />
      </div>
    );
  }

  function goTo(next: number) {
    setIndex(Math.max(0, Math.min(media.length - 1, next)));
  }

  function handleTouchStart(event: React.TouchEvent) {
    touchStartX.current = event.touches[0].clientX;
  }

  function handleTouchEnd(event: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (delta > SWIPE_THRESHOLD_PX) goTo(index - 1);
    else if (delta < -SWIPE_THRESHOLD_PX) goTo(index + 1);
    touchStartX.current = null;
  }

  return (
    <div className="space-y-3">
      <div
        className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-neutral-100 dark:bg-neutral-900 select-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          {media.map((item, i) => (
            <img
              key={item.id}
              src={item.mediaUrl}
              alt={`${alt} — image ${i + 1} of ${media.length}`}
              className="h-full w-full shrink-0 object-cover"
              draggable={false}
            />
          ))}
        </div>

        {media.length > 1 && (
          <>
            {index > 0 && (
              <button
                type="button"
                onClick={() => goTo(index - 1)}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
            )}
            {index < media.length - 1 && (
              <button
                type="button"
                onClick={() => goTo(index + 1)}
                aria-label="Next image"
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {media.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to image ${i + 1}`}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 transition",
                i === index ? "border-fuchsia-500" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <img src={item.mediaUrl} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
