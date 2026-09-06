import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getStorageService } from "@/lib/storage";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return {
    title: `@${username} | Influ-Store Profile`,
    description: `View @${username}'s profile on Influ-Store.`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // Query user from Prisma
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: {
      id: true,
      username: true,
      role: true,
      createdAt: true,
      profile: {
        select: {
          id: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          website: true,
          accountType: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === user.id;

  const rawPosts = await prisma.post.findMany({
    where: { authorId: user.id },
    include: { media: { orderBy: { order: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  const storage = getStorageService();
  const posts = await Promise.all(
    rawPosts.map(async (post) => ({
      ...post,
      media: await Promise.all(
        post.media.map(async (m) => ({
          ...m,
          mediaUrl: await storage.getSignedReadUrl(m.mediaKey),
        }))
      ),
    }))
  );

  const publicProfile = {
    ...user,
    counts: {
      posts: posts.length,
      followers: 0,
      following: 0,
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-20">
        <ProfileHeader userProfile={publicProfile} />
        <ProfileTabs isOwnProfile={isOwnProfile} posts={posts} />
      </div>

      <Footer />
    </main>
  );
}
