import { Clapperboard } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { ReelFeed } from "@/components/reels/ReelFeed";
import { getCurrentUser } from "@/lib/auth/session";
import { getReelFeed } from "@/lib/services/reel-feed.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reels | Influ-Store",
  description: "Watch short-form vertical video from the Influ-Store community.",
};

export default async function ReelsPage() {
  const user = await getCurrentUser();
  const feed = await getReelFeed(user?.id ?? null);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      {/* No Footer here on purpose — Reels is a full-viewport immersive
          experience (like Home/Explore's feeds, just vertical and dark). */}
      <div className="pt-20">
        <ReelFeed
          initialReels={feed.items}
          initialCursor={feed.nextCursor}
          fetchUrl="/api/reels"
          emptyState={
            <div className="flex h-[calc(100dvh-5rem)] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20 text-white/50">
                <Clapperboard className="h-7 w-7" />
              </div>
              <h2 className="text-lg font-semibold text-white">No reels yet</h2>
              <p className="max-w-sm text-sm text-white/50">
                Be the first to share a short video with the community.
              </p>
            </div>
          }
        />
      </div>
    </main>
  );
}
