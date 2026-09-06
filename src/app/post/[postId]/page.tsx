import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostDetail } from "@/components/posts/PostDetail";
import { getCurrentUser } from "@/lib/auth/session";
import { getPostById } from "@/lib/services/post.service";
import { listComments } from "@/lib/services/comment.service";

export const dynamic = "force-dynamic";

interface PostDetailPageProps {
  params: Promise<{ postId: string }>;
}

export async function generateMetadata({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const post = await getPostById(postId, null);

  if (!post) {
    return { title: "Post not found | Influ-Store" };
  }

  return {
    title: `${post.author.displayName} on Influ-Store`,
    description: post.caption || `A post by @${post.author.username} on Influ-Store.`,
  };
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { postId } = await params;
  const currentUser = await getCurrentUser();

  const post = await getPostById(postId, currentUser?.id ?? null);
  if (!post) {
    notFound();
  }

  const commentsPage = await listComments(postId, currentUser?.id ?? null);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-5xl px-0 py-0 pt-20 sm:px-6 sm:py-10 sm:pt-28 lg:px-10">
        <PostDetail
          post={post}
          initialComments={commentsPage.items}
          initialCommentsCursor={commentsPage.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
