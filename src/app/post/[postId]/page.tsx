import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Avatar } from "@/components/ui/Avatar";
import { prisma } from "@/lib/db/prisma";
import { getStorageService } from "@/lib/storage";

interface PostPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: PostPageProps) {
  const { postId } = await params;
  return {
    title: `Post | Influ-Store`,
    description: `View this post on Influ-Store.`,
    other: { postId },
  };
}

export default async function PostDetailPage({ params }: PostPageProps) {
  const { postId } = await params;

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      media: { orderBy: { order: "asc" } },
      author: {
        select: {
          username: true,
          profile: { select: { displayName: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const storage = getStorageService();
  const media = await Promise.all(
    post.media.map(async (m) => ({
      ...m,
      mediaUrl: await storage.getSignedReadUrl(m.mediaKey),
    }))
  );

  const displayName = post.author.profile?.displayName || post.author.username;
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-20">
        <div className="mx-auto max-w-4xl px-6 py-10 lg:px-10">
          <Link
            href={`/profile/${post.author.username}`}
            className="mb-6 flex items-center gap-3"
          >
            <Avatar
              src={post.author.profile?.avatarUrl}
              name={displayName}
              size="md"
            />
            <div>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {displayName}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                @{post.author.username}
              </p>
            </div>
          </Link>

          <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900">
              {media[0] && (
                <img
                  src={media[0].mediaUrl}
                  alt={post.caption || "Post"}
                  className="w-full object-cover"
                />
              )}
            </div>

            <div className="space-y-4">
              {post.caption && (
                <p className="leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {post.caption}
                </p>
              )}
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {formattedDate}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
