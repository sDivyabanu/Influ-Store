import Link from "next/link";
import { ImageIcon, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FeedList } from "@/components/posts/FeedList";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeed } from "@/lib/services/feed.service";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const feed = await getFeed(user?.id ?? null);

  const displayName = user?.profile?.displayName || user?.username || "there";

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto grid max-w-7xl gap-10 px-6 py-10 pt-28 lg:grid-cols-[minmax(0,680px)_320px] lg:px-10">
        {/* MAIN FEED */}
        <section>
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
              Your Daily Feed
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Good to see you, {displayName}.
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Discover what the community is sharing today.
            </p>
          </div>

          <FeedList
            initialPosts={feed.items}
            initialCursor={feed.nextCursor}
            fetchUrl="/api/feed"
            emptyState={
              <Card className="flex flex-col items-center gap-4 p-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                  No posts yet
                </h3>
                <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                  Be the first to share something with the community.
                </p>
                <Link href="/create-post">
                  <Button size="sm">Create a post</Button>
                </Link>
              </Card>
            }
          />
        </section>

        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-6">
          {user && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={user.profile?.avatarUrl}
                  name={user.profile?.displayName || user.username}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                    {user.profile?.displayName || user.username}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">@{user.username}</p>
                </div>
              </div>

              <Link href={`/profile/${user.username}`} className="mt-5 block">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Profile
                </Button>
              </Link>
            </Card>
          )}

          <Card className="p-6">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              <h3 className="text-sm font-bold text-neutral-900 dark:text-white">
                Suggested Creators
              </h3>
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Personalized creator recommendations are coming in a future update.
            </p>
          </Card>
        </aside>
      </div>

      <Footer />
    </main>
  );
}
