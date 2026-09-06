"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FeedList } from "@/components/posts/FeedList";
import { FeedModeTabs } from "@/components/home/FeedModeTabs";
import { UserCard } from "@/components/users/UserCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeedPost } from "@/types/post";
import { UserCardItem } from "@/types/follow";
import { FeedMode } from "@/lib/services/feed.service";
import { Users, Compass, PlusSquare, Sparkles } from "lucide-react";

export interface HomeFeedContainerProps {
  initialPosts: FeedPost[];
  initialCursor: string | null;
  initialMode: FeedMode;
  isFollowingEmpty?: boolean;
  suggestedUsers: UserCardItem[];
  isAuthenticated: boolean;
}

export function HomeFeedContainer({
  initialPosts,
  initialCursor,
  initialMode,
  isFollowingEmpty = false,
  suggestedUsers,
  isAuthenticated,
}: HomeFeedContainerProps) {
  const [mode, setMode] = useState<FeedMode>(initialMode);

  return (
    <div className="space-y-6">
      {/* FEED MODE TABS (FOLLOWING / DISCOVER) */}
      {isAuthenticated && (
        <div className="flex items-center justify-between">
          <FeedModeTabs mode={mode} onModeChange={setMode} />
        </div>
      )}

      {/* FEED STREAM */}
      <FeedList
        key={mode}
        initialPosts={mode === initialMode ? initialPosts : []}
        initialCursor={mode === initialMode ? initialCursor : null}
        fetchUrl={`/api/feed?mode=${mode}`}
        emptyState={
          mode === "following" ? (
            /* FOLLOWING EMPTY STATE ONBOARDING */
            <div className="space-y-6">
              <Card className="flex flex-col items-center gap-4 p-8 sm:p-10 text-center border-fuchsia-500/20 bg-gradient-to-b from-fuchsia-500/[0.03] to-transparent">
                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-fuchsia-500/10 text-fuchsia-500">
                  <Users className="h-8 w-8" />
                </div>

                <div className="space-y-1 max-w-md">
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white">
                    {isFollowingEmpty
                      ? "Follow people to personalize your feed"
                      : "No new posts from creators you follow"}
                  </h3>
                  <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400">
                    When you follow creators, their latest fashion, lifestyle, and aesthetic posts will appear right here.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setMode("discover")}
                    className="gap-1.5"
                  >
                    <Compass className="h-4 w-4" />
                    <span>Switch to Discover</span>
                  </Button>

                  <Link href="/explore">
                    <Button variant="outline" size="sm">
                      Explore Creators
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* INLINE SUGGESTIONS */}
              {suggestedUsers.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles className="h-4 w-4 text-fuchsia-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      Suggested Creators for You
                    </h4>
                  </div>

                  <div className="space-y-2.5">
                    {suggestedUsers.map((user) => (
                      <UserCard key={user.id} user={user} showBio={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* DISCOVER EMPTY STATE */
            <Card className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                <Compass className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                No posts found
              </h3>
              <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                Be the first to share something with the community!
              </p>
              <Link href="/create-post">
                <Button size="sm" className="gap-1.5">
                  <PlusSquare className="h-4 w-4" />
                  <span>Create a post</span>
                </Button>
              </Link>
            </Card>
          )
        }
      />
    </div>
  );
}
