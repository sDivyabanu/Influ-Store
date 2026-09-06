"use client";

import React, { useState } from "react";
import { Grid, Bookmark, ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface ProfilePost {
  id: string;
  caption: string | null;
  media: { id: string; mediaUrl: string }[];
}

export function ProfileTabs({
  isOwnProfile = false,
  posts = [],
}: {
  isOwnProfile?: boolean;
  posts?: ProfilePost[];
}) {
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "shop">("posts");

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 lg:px-10">
      {/* TAB NAVIGATION */}
      <div className="flex justify-center border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex gap-8">
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

          {isOwnProfile && (
            <button
              type="button"
              onClick={() => setActiveTab("saved")}
              className={cn(
                "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
                activeTab === "saved"
                  ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                  : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              )}
            >
              <Bookmark className="h-4 w-4" />
              <span>Saved</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("shop")}
            className={cn(
              "flex items-center gap-2 border-b-2 py-4 text-xs font-semibold uppercase tracking-wider transition-colors",
              activeTab === "shop"
                ? "border-fuchsia-500 text-neutral-900 dark:text-white"
                : "border-transparent text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
            )}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Store</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="py-16 text-center">
        {activeTab === "posts" && (
          posts.length > 0 ? (
            <div className="grid grid-cols-2 gap-1 text-left sm:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900"
                >
                  {post.media[0] && (
                    <img
                      src={post.media[0].mediaUrl}
                      alt={post.caption || "Post"}
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mx-auto max-w-sm space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                <Grid className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                No posts yet
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {isOwnProfile
                  ? "Share your first photo to get started."
                  : "This creator hasn't published any posts yet."}
              </p>
            </div>
          )
        )}

        {activeTab === "saved" && (
          <div className="mx-auto max-w-sm space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
              <Bookmark className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              No saved items
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Saved posts and bookmarked products will appear here.
            </p>
          </div>
        )}

        {activeTab === "shop" && (
          <div className="mx-auto max-w-sm space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
              Influ-Store Marketplace
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Creator product showcases and tagged affiliate items will be launched in upcoming phases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
