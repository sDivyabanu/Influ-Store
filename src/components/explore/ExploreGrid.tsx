"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FeedPost } from "@/types/post";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Heart, MessageCircle, Layers, Loader2, Compass } from "lucide-react";

export interface ExploreGridProps {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  category?: string;
}

export function ExploreGrid({
  initialPosts,
  initialCursor,
  category = "All",
}: ExploreGridProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(initialCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    let ignore = false;

    async function loadCategory() {
      if (category === "All") {
        setPosts(initialPosts);
        setNextCursor(initialCursor);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams({ limit: "18" });
        params.set("category", category);

        const res = await fetch(`/api/explore?${params.toString()}`);
        const data = await res.json();

        if (!ignore && res.ok && data.success) {
          setPosts(data.posts);
          setNextCursor(data.nextCursor);
        }
      } catch {
        // Keep existing posts on error
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadCategory();

    return () => {
      ignore = true;
    };
  }, [category, initialPosts, initialCursor]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const params = new URLSearchParams({ limit: "18", cursor: nextCursor });
      if (category && category !== "All") params.set("category", category);

      const res = await fetch(`/api/explore?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setPosts((prev) => [...prev, ...data.posts]);
        setNextCursor(data.nextCursor);
      }
    } catch {
      // Error handled gracefully
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-2xl sm:rounded-3xl" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-neutral-200 dark:border-neutral-800 p-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400 mb-4">
          <Compass className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          No posts found
        </h3>
        <p className="mt-1 text-sm text-neutral-500 max-w-sm">
          {category && category !== "All"
            ? `There are no posts tagged with "${category}" yet.`
            : "No explore posts are available at this time."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
        {posts.map((post) => {
          const firstMedia = post.media[0];
          const hasMultipleMedia = post.media.length > 1;

          return (
            <Link
              key={post.id}
              href={`/post/${post.id}`}
              className="group relative aspect-square overflow-hidden rounded-2xl sm:rounded-3xl bg-neutral-100 dark:bg-neutral-900 shadow-sm transition hover:shadow-md"
            >
              {/* IMAGE */}
              {firstMedia ? (
                <img
                  src={firstMedia.mediaUrl}
                  alt={post.caption || "Explore post"}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center bg-neutral-200 dark:bg-neutral-800 text-neutral-400 text-xs">
                  No media
                </div>
              )}

              {/* MULTI-MEDIA INDICATOR */}
              {hasMultipleMedia && (
                <div className="absolute top-3 right-3 rounded-full bg-black/60 p-1.5 text-white backdrop-blur-md">
                  <Layers className="h-3.5 w-3.5" />
                </div>
              )}

              {/* HOVER OVERLAY (LIKES + COMMENTS) */}
              <div className="absolute inset-0 flex items-center justify-center gap-6 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100 text-white font-semibold text-sm backdrop-blur-[2px]">
                <div className="flex items-center gap-1.5">
                  <Heart className="h-4 w-4 fill-white" />
                  <span>{post.likeCount}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 fill-white" />
                  <span>{post.commentCount}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* LOAD MORE BUTTON */}
      {nextCursor && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="min-w-[160px]"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </>
            ) : (
              "Load more"
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
