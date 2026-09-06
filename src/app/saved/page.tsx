import { redirect } from "next/navigation";
import { Bookmark } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { FeedList } from "@/components/posts/FeedList";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedPosts } from "@/lib/services/saved-post.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved | Influ-Store",
  description: "Posts you've saved. Only visible to you.",
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/saved");
  }

  const savedPage = await listSavedPosts(user.id);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-2xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Private
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Saved posts
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Only you can see what you&apos;ve saved.
          </p>
        </div>

        <FeedList
          initialPosts={savedPage.items}
          initialCursor={savedPage.nextCursor}
          fetchUrl="/api/saved"
          emptyState={
            <Card className="flex flex-col items-center gap-4 p-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400">
                <Bookmark className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                No saved posts yet
              </h3>
              <p className="max-w-sm text-sm text-neutral-500 dark:text-neutral-400">
                Tap the bookmark icon on any post to save it here.
              </p>
            </Card>
          }
        />
      </div>

      <Footer />
    </main>
  );
}
