import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserPosts } from "@/lib/services/post.service";

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

  const [postCount, postsPage] = await Promise.all([
    prisma.post.count({ where: { authorId: user.id } }),
    listUserPosts(user.id, currentUser?.id ?? null),
  ]);

  const publicProfile = {
    ...user,
    counts: {
      posts: postCount,
      followers: 0,
      following: 0,
    },
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-20">
        <ProfileHeader userProfile={publicProfile} />
        <ProfileTabs
          username={user.username}
          isOwnProfile={isOwnProfile}
          initialPosts={postsPage.items}
          initialCursor={postsPage.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
