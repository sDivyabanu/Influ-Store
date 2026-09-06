"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FeedPost } from "@/types/post";
import { PostCard } from "./PostCard";
import { PostCardSkeleton } from "./PostCardSkeleton";

interface FeedListProps {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  /** Cursor-paginated GET endpoint returning { posts, nextCursor } — e.g. "/api/feed" or "/api/saved". */
  fetchUrl: string;
  emptyState: React.ReactNode;
}

export function FeedList({ initialPosts, initialCursor, fetchUrl, emptyState }: FeedListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [cursor, setCursor] = useState(initialCursor);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const loadMore = useCallback(async () => {
    if (loading || !cursor) return;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${fetchUrl}?cursor=${encodeURIComponent(cursor)}`);
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Failed to load posts.");
      setPosts((current) => [...current, ...data.posts]);
      setCursor(data.nextCursor);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [cursor, fetchUrl, loading]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  function removePost(postId: string) {
    setPosts((current) => current.filter((p) => p.id !== postId));
  }

  if (posts.length === 0 && !loading) {
    return <>{emptyState}</>;
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDeleted={removePost} />
      ))}

      {loading && <PostCardSkeleton />}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center">
          <AlertCircle className="h-6 w-6 text-red-500" />
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Couldn&apos;t load more posts.</p>
          <Button type="button" variant="outline" size="sm" onClick={loadMore}>
            Retry
          </Button>
        </div>
      )}

      {!cursor && posts.length > 0 && !error && (
        <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-600">
          You&apos;re all caught up.
        </p>
      )}

      <div ref={sentinelRef} aria-hidden="true" className="h-1" />
    </div>
  );
}
