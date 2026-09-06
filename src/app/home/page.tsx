import Link from "next/link";
import { Sparkles, TrendingUp } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserCard } from "@/components/users/UserCard";
import { HomeFeedContainer } from "@/components/home/HomeFeedContainer";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeed } from "@/lib/services/feed.service";
import { getSuggestedUsers } from "@/lib/services/suggestion.service";
import { getTrendingHashtags } from "@/lib/services/hashtag.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [feed, suggestedUsers, trendingTags] = await Promise.all([
    getFeed(user?.id ?? null, null, 10, user ? "following" : "discover"),
    getSuggestedUsers(user?.id ?? null, 4),
    getTrendingHashtags(5),
  ]);

  const displayName = user?.profile?.displayName || user?.username || "there";

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto grid max-w-7xl gap-10 px-6 py-10 pt-28 lg:grid-cols-[minmax(0,680px)_340px] lg:px-10">
        {/* MAIN FEED STREAM */}
        <section className="min-w-0">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
              Social Commerce
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Good to see you, {displayName}.
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Discover style inspiration and curated posts from accounts you follow.
            </p>
          </div>

          <HomeFeedContainer
            initialPosts={feed.items}
            initialCursor={feed.nextCursor}
            initialMode={feed.mode}
            isFollowingEmpty={feed.isFollowingEmpty}
            suggestedUsers={suggestedUsers}
            isAuthenticated={!!user}
          />
        </section>

        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-6">
          {/* USER PROFILE SNIPPET */}
          {user && (
            <Card className="p-5">
              <div className="flex items-center gap-3.5">
                <Avatar
                  src={user.profile?.avatarUrl}
                  name={user.profile?.displayName || user.username}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-sm text-neutral-900 dark:text-white truncate">
                    {user.profile?.displayName || user.username}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">@{user.username}</p>
                </div>
              </div>

              <Link href={`/profile/${user.username}`} className="mt-4 block">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Profile
                </Button>
              </Link>
            </Card>
          )}

          {/* SUGGESTED CREATORS */}
          {suggestedUsers.length > 0 && (
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-fuchsia-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Suggested for You
                  </h3>
                </div>

                <Link
                  href="/explore"
                  className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                >
                  See all
                </Link>
              </div>

              <div className="space-y-2.5">
                {suggestedUsers.map((suggestedUser) => (
                  <UserCard
                    key={suggestedUser.id}
                    user={suggestedUser}
                    showBio={false}
                    showCounts={true}
                    className="p-3 bg-neutral-50/50 dark:bg-neutral-950/50"
                  />
                ))}
              </div>
            </Card>
          )}

          {/* TRENDING HASHTAGS */}
          {trendingTags.length > 0 && (
            <Card className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-fuchsia-500" />
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                    Trending Topics
                  </h3>
                </div>

                <Link
                  href="/search?type=hashtags&q=all"
                  className="text-xs font-semibold text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                >
                  Explore
                </Link>
              </div>

              <div className="space-y-1.5">
                {trendingTags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/hashtag/${tag.name}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2 text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800 transition group"
                  >
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">
                      #{tag.name}
                    </span>
                    <span className="text-neutral-400 text-[11px]">
                      {tag.postCount} post{tag.postCount === 1 ? "" : "s"}
                    </span>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          {/* FOOTER SNIPPET */}
          <div className="px-2 text-[11px] text-neutral-400 dark:text-neutral-500 space-y-1">
            <p>© 2026 Influ-Store · Phase 3 Social Discovery</p>
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}
