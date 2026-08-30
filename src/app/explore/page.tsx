"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ExploreGrid } from "@/components/explore/ExploreGrid";
import { UserCard } from "@/components/users/UserCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { FeedPost } from "@/types/post";
import { ReelItem } from "@/types/reel";
import { UserCardItem } from "@/types/follow";
import { HashtagItem } from "@/types/search";
import { Search, Sparkles, TrendingUp, Compass, ArrowRight, Clapperboard, Play } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const categories = [
  "All",
  "Fashion",
  "Minimal",
  "Beauty",
  "Lifestyle",
  "Tech",
  "Fitness",
  "Home",
  "OOTD",
];

export default function ExplorePage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [trendingTags, setTrendingTags] = useState<HashtagItem[]>([]);
  const [suggestedCreators, setSuggestedCreators] = useState<UserCardItem[]>([]);
  const [trendingReels, setTrendingReels] = useState<ReelItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load: explore posts, trending hashtags, suggested creators, and trending reels
  useEffect(() => {
    async function loadExploreData() {
      setIsLoading(true);
      try {
        const [postsRes, tagsRes, creatorsRes, reelsRes] = await Promise.all([
          fetch("/api/explore?limit=16"),
          fetch("/api/hashtags/trending?limit=6"),
          fetch("/api/suggestions?limit=4"),
          fetch("/api/explore/reels?limit=8"),
        ]);

        const [postsData, tagsData, creatorsData, reelsData] = await Promise.all([
          postsRes.json(),
          tagsRes.json(),
          creatorsRes.json(),
          reelsRes.json(),
        ]);

        if (postsRes.ok && postsData.success) {
          setPosts(postsData.posts);
          setNextCursor(postsData.nextCursor);
        }
        if (tagsRes.ok && tagsData.success) {
          setTrendingTags(tagsData.hashtags);
        }
        if (creatorsRes.ok && creatorsData.success) {
          setSuggestedCreators(creatorsData.users);
        }
        if (reelsRes.ok && reelsData.success) {
          setTrendingReels(reelsData.reels);
        }
      } catch {
        // Fallback gracefully
      } finally {
        setIsLoading(false);
      }
    }

    loadExploreData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };


  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-20">
        {/* HERO EXPLORE HEADER */}
        <section className="relative overflow-hidden px-6 pb-12 pt-12 lg:px-10 lg:pt-16">
          <div className="absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-fuchsia-500/10 blur-[130px] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl">
            <div className="flex items-center gap-2 mb-3">
              <Compass className="h-4 w-4 text-fuchsia-500" />
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
                Explore Discovery
              </p>
            </div>

            <h1 className="max-w-4xl text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Find what{" "}
              <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                inspires you.
              </span>
            </h1>

            <p className="mt-4 max-w-2xl text-base sm:text-lg text-neutral-600 dark:text-neutral-400">
              Discover creators, trending styles, curated aesthetics, and real products from the Influstore community.
            </p>

            {/* QUICK SEARCH BAR */}
            <form onSubmit={handleSearchSubmit} className="mt-8 max-w-2xl">
              <div className="relative flex items-center rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 p-2 shadow-sm focus-within:border-fuchsia-500 focus-within:ring-4 focus-within:ring-fuchsia-500/10 transition">
                <span className="pl-3 text-neutral-400">
                  <Search className="h-5 w-5" />
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators, hashtags, keywords..."
                  className="w-full bg-transparent px-3 py-2 text-sm text-neutral-900 dark:text-white outline-none placeholder:text-neutral-400"
                />

                <Link
                  href={searchQuery.trim() ? `/search?q=${encodeURIComponent(searchQuery.trim())}` : "/search"}
                  className="rounded-xl bg-neutral-900 dark:bg-white px-5 py-2 text-xs font-semibold text-white dark:text-black hover:scale-105 transition"
                >
                  Search
                </Link>
              </div>
            </form>
          </div>
        </section>

        {/* CATEGORY FILTER TABS */}
        <section className="border-y border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-neutral-950/40 px-6 py-4 lg:px-10 sticky top-20 z-30 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl gap-2.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "shrink-0 rounded-full px-5 py-2 text-xs font-semibold transition",
                  activeCategory === category
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
                    : "border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* TRENDING REELS ROW */}
        {trendingReels.length > 0 && (
          <section className="px-6 pt-10 lg:px-10">
            <div className="mx-auto max-w-7xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clapperboard className="h-4 w-4 text-fuchsia-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                    Trending Reels
                  </h2>
                </div>

                <Link
                  href="/reels"
                  className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                >
                  Watch all →
                </Link>
              </div>

              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {trendingReels.map((reel) => (
                  <Link
                    key={reel.id}
                    href={`/reel/${reel.id}`}
                    className="group relative aspect-[9/16] w-32 shrink-0 overflow-hidden rounded-2xl bg-neutral-900 sm:w-36"
                  >
                    <video
                      src={reel.mediaUrl}
                      poster={reel.thumbnailUrl ?? undefined}
                      muted
                      playsInline
                      preload="metadata"
                      aria-label={reel.caption || `Reel by @${reel.author.username}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute left-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white">
                      <Play className="h-2.5 w-2.5 fill-white" />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="truncate text-[11px] font-semibold text-white">
                        @{reel.author.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* TRENDING HASHTAGS & CREATORS ROW */}
        {(trendingTags.length > 0 || suggestedCreators.length > 0) && (
          <section className="px-6 py-10 lg:px-10">
            <div className="mx-auto max-w-7xl grid gap-8 lg:grid-cols-[1fr_360px]">
              {/* TRENDING HASHTAGS */}
              {trendingTags.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-fuchsia-500" />
                      <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                        Trending Hashtags
                      </h2>
                    </div>

                    <Link
                      href="/search?type=hashtags&q=all"
                      className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                    >
                      View all →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {trendingTags.map((tag) => (
                      <Link
                        key={tag.id}
                        href={`/hashtag/${tag.name}`}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition text-left group"
                      >
                        <div className="min-w-0 pr-2">
                          <span className="font-bold text-xs sm:text-sm text-neutral-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 truncate block">
                            #{tag.name}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            {tag.postCount} post{tag.postCount === 1 ? "" : "s"}
                          </span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-neutral-400 group-hover:text-fuchsia-500 shrink-0" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* SUGGESTED CREATORS */}
              {suggestedCreators.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-fuchsia-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                      Featured Creators
                    </h2>
                  </div>

                  <div className="space-y-2.5">
                    {suggestedCreators.map((creator) => (
                      <UserCard
                        key={creator.id}
                        user={creator}
                        showBio={false}
                        showCounts={true}
                        className="p-3"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* EXPLORE DISCOVERY GRID */}
        <section className="px-6 pb-24 pt-4 lg:px-10">
          <div className="mx-auto max-w-7xl space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {activeCategory === "All" ? "Popular on Influ-Store" : `${activeCategory} Posts`}
                </h2>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Ranked by community engagement and recent activity
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 sm:gap-5">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-2xl sm:rounded-3xl" />
                ))}
              </div>
            ) : (
              <ExploreGrid
                initialPosts={posts}
                initialCursor={nextCursor}
                category={activeCategory}
              />
            )}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}