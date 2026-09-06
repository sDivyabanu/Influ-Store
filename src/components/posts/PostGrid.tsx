"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MessageCircle, Images, Grid } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedPost } from "@/types/post";

interface PostGridProps {
  username: string;
  initialPosts: FeedPost[];
  initialCursor: string | null;
  emptyMessage: string;
}

export function PostGrid({ username, initialPosts, initialCursor, emptyMessage }: PostGridProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);

  async function loadMore() {
    if (!cursor || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${username}/posts?cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      setPosts((current) => [...current, ...data.posts]);
      setCursor(data.nextCursor);
    } catch {
      // Button stays visible so the user can simply retry.
    } finally {
      setLoading(false);
    }
  }

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-sm space-y-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
          <Grid className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No posts yet</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 sm:gap-1.5">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/post/${post.id}`}
            className="group relative aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-900"
          >
            {post.media[0] && (
              <img
                src={post.media[0].mediaUrl}
                alt={post.caption || `Post by @${username}`}
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            )}
            {post.media.length > 1 && (
              <Images className="absolute right-2 top-2 h-4 w-4 text-white drop-shadow" aria-label="Multiple photos" />
            )}
            <div className="absolute inset-0 flex items-center justify-center gap-5 bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <Heart className="h-4 w-4 fill-white" /> {post.likeCount}
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-white">
                <MessageCircle className="h-4 w-4 fill-white" /> {post.commentCount}
              </span>
            </div>
          </Link>
        ))}
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
