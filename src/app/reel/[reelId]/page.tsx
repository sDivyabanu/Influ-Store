import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ReelDetail } from "@/components/reels/ReelDetail";
import { getCurrentUser } from "@/lib/auth/session";
import { getReelById } from "@/lib/services/reel.service";
import { listReelComments } from "@/lib/services/reel-comment.service";

export const dynamic = "force-dynamic";

interface ReelDetailPageProps {
  params: Promise<{ reelId: string }>;
}

export async function generateMetadata({ params }: ReelDetailPageProps) {
  const { reelId } = await params;
  const reel = await getReelById(reelId, null);

  if (!reel) {
    return { title: "Reel not found | Influ-Store" };
  }

  return {
    title: `${reel.author.displayName} on Influ-Store`,
    description: reel.caption || `A reel by @${reel.author.username} on Influ-Store.`,
  };
}

export default async function ReelDetailPage({ params }: ReelDetailPageProps) {
  const { reelId } = await params;
  const currentUser = await getCurrentUser();

  const reel = await getReelById(reelId, currentUser?.id ?? null);
  if (!reel) {
    notFound();
  }

  const commentsPage = await listReelComments(reelId, currentUser?.id ?? null);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-5xl px-0 py-0 pt-20 sm:px-6 sm:py-10 sm:pt-28 lg:px-10">
        <ReelDetail
          reel={reel}
          initialComments={commentsPage.items}
          initialCommentsCursor={commentsPage.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
