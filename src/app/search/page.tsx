"use client";

import React, { useState, useEffect, useCallback, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserCard } from "@/components/users/UserCard";
import { ExploreGrid } from "@/components/explore/ExploreGrid";
import { ReelGrid } from "@/components/reels/ReelGrid";
import { ProductGrid } from "@/components/products/ProductGrid";
import { Skeleton } from "@/components/ui/Skeleton";
import { SearchResults, SearchType } from "@/types/search";
import { Search, Hash, Users, Sparkles, X, ArrowRight, TrendingUp, Clapperboard, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [, startTransition] = useTransition();

  const initialQuery = searchParams.get("q") || "";
  const initialType = (searchParams.get("type") as SearchType) || "all";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchType>(initialType);
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [trendingTags, setTrendingTags] = useState<{ id: string; name: string; postCount: number }[]>([]);

  // Load trending hashtags on mount
  useEffect(() => {
    async function loadTrending() {
      try {
        const res = await fetch("/api/hashtags/trending?limit=6");
        const data = await res.json();
        if (res.ok && data.success) {
          setTrendingTags(data.hashtags);
        }
      } catch {
        // Fallback
      }
    }
    loadTrending();
  }, []);

  // Perform search
  const performSearch = useCallback(async (q: string, type: SearchType) => {
    if (!q.trim()) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), type });
      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setResults(data.results);
      } else {
        setResults(null);
      }
    } catch {
      setResults(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search trigger
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        performSearch(query, activeTab);
        startTransition(() => {
          const url = new URL(window.location.href);
          url.searchParams.set("q", query.trim());
          url.searchParams.set("type", activeTab);
          router.replace(url.pathname + url.search);
        });
      } else {
        setResults(null);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query, activeTab, performSearch, router]);

  const handleClear = () => {
    setQuery("");
    setResults(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("q");
    router.replace(url.pathname);
  };

  const handleTrendingClick = (tag: string) => {
    setQuery(tag);
    setActiveTab("all");
  };

  const tabs: { type: SearchType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { type: "all", label: "All", icon: Sparkles },
    { type: "users", label: "People", icon: Users },
    { type: "posts", label: "Posts", icon: Search },
    { type: "reels", label: "Reels", icon: Clapperboard },
    { type: "products", label: "Products", icon: ShoppingBag },
    { type: "hashtags", label: "Tags", icon: Hash },
  ];

  const hasResults =
    results &&
    ((results.users?.items.length ?? 0) > 0 ||
      (results.posts?.items.length ?? 0) > 0 ||
      (results.reels?.items.length ?? 0) > 0 ||
      (results.hashtags?.items.length ?? 0) > 0 ||
      (results.products?.items.length ?? 0) > 0);

  return (
    <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 pt-28 lg:px-10">
      {/* SEARCH HEADER */}
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Discover Influ-Store
        </h1>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          Find creators, explore trending styles, or discover topics by hashtag.
        </p>

        {/* SEARCH INPUT BAR */}
        <div className="relative mt-6">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-neutral-400">
            <Search className="h-5 w-5" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search creators, hashtags, captions..."
            className="w-full rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900/80 py-4 pl-12 pr-12 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:border-fuchsia-500 focus:outline-none focus:ring-4 focus:ring-fuchsia-500/10 shadow-sm transition"
            autoFocus
          />

          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 right-0 flex items-center pr-4 text-neutral-400 hover:text-neutral-600 dark:hover:text-white"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* CATEGORY TABS */}
        {query.trim() && (
          <div className="flex justify-center gap-2 mt-6 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.type;
              return (
                <button
                  key={tab.type}
                  type="button"
                  onClick={() => setActiveTab(tab.type)}
                  className={cn(
                    "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition shrink-0",
                    isActive
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-black shadow-sm"
                      : "border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* BODY CONTENT */}
      {isLoading ? (
        <div className="space-y-6 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : !query.trim() ? (
        /* TRENDING DISCOVERY EXPLORER WHEN NO QUERY */
        <div className="max-w-3xl mx-auto space-y-10 pt-6">
          {trendingTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4 text-fuchsia-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-500">
                  Trending Hashtags
                </h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {trendingTags.map((tag) => (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleTrendingClick(`#${tag.name}`)}
                    className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition text-left group"
                  >
                    <div>
                      <span className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                        #{tag.name}
                      </span>
                      <p className="text-xs text-neutral-500 mt-0.5">
                        {tag.postCount} post{tag.postCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-fuchsia-500 group-hover:translate-x-1 transition" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* QUICK LINKS */}
          <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 bg-gradient-to-br from-fuchsia-500/5 to-transparent text-center space-y-3">
            <h3 className="font-bold text-neutral-900 dark:text-white text-lg">
              Explore the full discovery feed
            </h3>
            <p className="text-sm text-neutral-500 max-w-md mx-auto">
              Browse top trending visual posts and discover inspiring creators from our global community.
            </p>
            <div className="pt-2">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 rounded-full bg-neutral-900 dark:bg-white px-6 py-2.5 text-xs font-semibold text-white dark:text-black hover:scale-105 transition"
              >
                <span>Go to Explore</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      ) : !hasResults ? (
        /* NO RESULTS EMPTY STATE */
        <div className="py-20 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
            <Search className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
            No results found
          </h3>
          <p className="text-sm text-neutral-500 max-w-sm mx-auto">
            We couldn&apos;t find any {activeTab === "all" ? "matches" : activeTab} for &quot;{query}&quot;. Try checking for typos or searching with different keywords.
          </p>
        </div>
      ) : (
        /* RESULTS RENDERING */
        <div className="space-y-12 pt-4">
          {/* USERS / PEOPLE RESULTS */}
          {(activeTab === "all" || activeTab === "users") &&
            results?.users &&
            results.users.items.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-fuchsia-500" />
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      People
                    </h2>
                  </div>

                  {activeTab === "all" && results.users.items.length >= 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("users")}
                      className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                    >
                      See all people →
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {results.users.items.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </section>
            )}

          {/* HASHTAG RESULTS */}
          {(activeTab === "all" || activeTab === "hashtags") &&
            results?.hashtags &&
            results.hashtags.items.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-fuchsia-500" />
                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                      Hashtags
                    </h2>
                  </div>

                  {activeTab === "all" && results.hashtags.items.length >= 5 && (
                    <button
                      type="button"
                      onClick={() => setActiveTab("hashtags")}
                      className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                    >
                      See all hashtags →
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {results.hashtags.items.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/hashtag/${tag.name}`}
                      className="flex items-center justify-between p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 hover:border-fuchsia-500/50 hover:bg-fuchsia-500/5 transition text-left group"
                    >
                      <div>
                        <span className="font-bold text-sm text-neutral-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                          #{tag.name}
                        </span>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {tag.postCount} post{tag.postCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-neutral-400 group-hover:text-fuchsia-500 group-hover:translate-x-1 transition" />
                    </Link>
                  ))}
                </div>
              </section>
            )}

          {/* POSTS RESULTS */}
          {(activeTab === "all" || activeTab === "posts") &&
            results?.posts &&
            results.posts.items.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Search className="h-4 w-4 text-fuchsia-500" />
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Posts
                  </h2>
                </div>

                <ExploreGrid
                  initialPosts={results.posts.items}
                  initialCursor={results.posts.nextCursor}
                />
              </section>
            )}

          {/* REELS RESULTS */}
          {(activeTab === "all" || activeTab === "reels") &&
            results?.reels &&
            results.reels.items.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Clapperboard className="h-4 w-4 text-fuchsia-500" />
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Reels
                  </h2>
                </div>

                <ReelGrid
                  fetchBaseUrl={`/api/search?q=${encodeURIComponent(query)}&type=reels`}
                  initialReels={results.reels.items}
                  initialCursor={results.reels.nextCursor}
                  emptyMessage="No reels found."
                  extractResponse={(data) => {
                    const typed = data as { results?: { reels?: { items?: typeof results.reels.items; nextCursor?: string | null } } };
                    return {
                      reels: typed.results?.reels?.items ?? [],
                      nextCursor: typed.results?.reels?.nextCursor ?? null,
                    };
                  }}
                />
              </section>
            )}

          {/* PRODUCTS RESULTS */}
          {(activeTab === "all" || activeTab === "products") &&
            results?.products &&
            results.products.items.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <ShoppingBag className="h-4 w-4 text-fuchsia-500" />
                  <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                    Products
                  </h2>
                </div>

                <ProductGrid
                  fetchBaseUrl={`/api/search?q=${encodeURIComponent(query)}&type=products`}
                  initialProducts={results.products.items}
                  initialCursor={results.products.nextCursor}
                  emptyMessage="No products found."
                  extractResponse={(data) => {
                    const typed = data as {
                      results?: { products?: { items?: typeof results.products.items; nextCursor?: string | null } };
                    };
                    return {
                      products: typed.results?.products?.items ?? [],
                      nextCursor: typed.results?.products?.nextCursor ?? null,
                    };
                  }}
                />
              </section>
            )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />
      <Suspense fallback={<div className="flex-1 max-w-5xl mx-auto w-full px-6 py-28 text-center text-sm text-neutral-500">Loading search...</div>}>
        <SearchContent />
      </Suspense>
      <Footer />
    </main>
  );
}
