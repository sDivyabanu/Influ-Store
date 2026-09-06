"use client";

import React, { useState } from "react";
import { Bookmark, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FeedPost } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { FeedList } from "@/components/posts/FeedList";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { Card } from "@/components/ui/Card";

interface SavedTabsProps {
  initialPosts: FeedPost[];
  initialPostsCursor: string | null;
  initialReels: ReelItem[];
  initialReelsCursor: string | null;
}

export function SavedTabs({
  initialPosts,
  initialPostsCursor,
  initialReels,
  initialReelsCursor,
}: SavedTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  return (
    <div>
      <div className="mb-8 flex justify-center gap-8 border-b border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
            activeTab === "posts"
              ? "border-fuchsia-500 text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          )}
        >
          <Bookmark className="h-4 w-4" />
          <span>Posts</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reels")}
          className={cn(
            "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
            activeTab === "reels"
              ? "border-fuchsia-500 text-neutral-900 dark:text-white"
              : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
          )}
        >
          <Clapperboard className="h-4 w-4" />
          <span>Reels</span>
        </button>
      </div>

      {activeTab === "posts" ? (
        <FeedList
          initialPosts={initialPosts}
          initialCursor={initialPostsCursor}
          fetchUrl="/api/saved"
          emptyState={
            <Card className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                <Bookmark className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No saved posts yet</h3>
              <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                Tap the bookmark icon on any post to save it here.
              </p>
            </Card>
          }
        />
      ) : (
        <ReelGrid
          fetchBaseUrl="/api/saved/reels"
          initialReels={initialReels}
          initialCursor={initialReelsCursor}
          emptyMessage="Tap the bookmark icon on any reel to save it here."
        />
      )}
    </div>
  );
}
