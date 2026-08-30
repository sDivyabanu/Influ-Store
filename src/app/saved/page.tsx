import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SavedTabs } from "@/components/saved/SavedTabs";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedPosts } from "@/lib/services/saved-post.service";
import { listSavedReels } from "@/lib/services/saved-reel.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Saved | Influ-Store",
  description: "Posts and reels you've saved. Only visible to you.",
};

export default async function SavedPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/saved");
  }

  const [savedPosts, savedReels] = await Promise.all([
    listSavedPosts(user.id),
    listSavedReels(user.id),
  ]);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Private
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Saved
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Only you can see what you&apos;ve saved.
          </p>
        </div>

        <SavedTabs
          initialPosts={savedPosts.items}
          initialPostsCursor={savedPosts.nextCursor}
          initialReels={savedReels.items}
          initialReelsCursor={savedReels.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
