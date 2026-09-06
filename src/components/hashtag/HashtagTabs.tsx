"use client";

import React, { useState } from "react";
import { Grid, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { FeedPost } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { ExploreGrid } from "@/components/explore/ExploreGrid";
import { ReelGrid } from "@/components/reels/ReelGrid";

interface HashtagTabsProps {
  tag: string;
  initialPosts: FeedPost[];
  initialPostsCursor: string | null;
  initialReels: ReelItem[];
  initialReelsCursor: string | null;
}

export function HashtagTabs({
  tag,
  initialPosts,
  initialPostsCursor,
  initialReels,
  initialReelsCursor,
}: HashtagTabsProps) {
  const [activeTab, setActiveTab] = useState<"posts" | "reels">("posts");

  return (
    <div>
      <div className="mb-8 flex gap-8 border-b border-neutral-200 dark:border-neutral-800">
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
          <Grid className="h-4 w-4" />
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
        <ExploreGrid initialPosts={initialPosts} initialCursor={initialPostsCursor} category={`#${tag}`} />
      ) : (
        <ReelGrid
          fetchBaseUrl={`/api/hashtags/${tag}?type=reels`}
          initialReels={initialReels}
          initialCursor={initialReelsCursor}
          emptyMessage={`No reels tagged #${tag} yet.`}
        />
      )}
    </div>
  );
}
