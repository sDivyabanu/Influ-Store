import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { HashtagTabs } from "@/components/hashtag/HashtagTabs";
import { getCurrentUser } from "@/lib/auth/session";
import { getHashtagPosts, getHashtagReels } from "@/lib/services/hashtag.service";
import { Hash, ArrowLeft } from "lucide-react";

interface HashtagPageProps {
  params: Promise<{ tag: string }>;
}

export async function generateMetadata({ params }: HashtagPageProps) {
  const { tag } = await params;
  const cleanTag = tag.replace(/^#/, "");
  return {
    title: `#${cleanTag} posts | Influ-Store`,
    description: `Discover top posts and reels tagged with #${cleanTag} on Influ-Store.`,
  };
}

export default async function HashtagPage({ params }: HashtagPageProps) {
  const { tag } = await params;
  const cleanTag = tag.replace(/^#/, "").toLowerCase();

  const user = await getCurrentUser();
  const [postsResult, reelsResult] = await Promise.all([
    getHashtagPosts(cleanTag, user?.id ?? null, null, 24),
    getHashtagReels(cleanTag, user?.id ?? null, null, 24),
  ]);

  const postCount = postsResult.hashtag?.postCount ?? postsResult.posts.items.length;
  const reelCount = reelsResult.hashtag?.reelCount ?? reelsResult.reels.items.length;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 pt-28 lg:px-10">
        {/* HASHTAG HEADER */}
        <div className="mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-8">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Explore Discovery</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-fuchsia-500/20 via-pink-500/20 to-orange-400/20 border border-fuchsia-500/30 text-fuchsia-600 dark:text-fuchsia-400">
              <Hash className="h-10 w-10" />
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                #{cleanTag}
              </h1>
              <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {postCount.toLocaleString()}
                </span>{" "}
                post{postCount === 1 ? "" : "s"}
                {" · "}
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {reelCount.toLocaleString()}
                </span>{" "}
                reel{reelCount === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        {/* POSTS / REELS TABS */}
        <HashtagTabs
          tag={cleanTag}
          initialPosts={postsResult.posts.items}
          initialPostsCursor={postsResult.posts.nextCursor}
          initialReels={reelsResult.reels.items}
          initialReelsCursor={reelsResult.reels.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
