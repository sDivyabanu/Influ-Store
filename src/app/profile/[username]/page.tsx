import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserPosts } from "@/lib/services/post.service";
import { listUserReels } from "@/lib/services/reel.service";
import { isUserFollowing } from "@/lib/services/follow.service";

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
      _count: {
        select: {
          posts: true,
          followers: true,
          following: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isOwnProfile = currentUser?.id === user.id;

  const [postsPage, reelsPage, isFollowing] = await Promise.all([
    listUserPosts(user.id, currentUser?.id ?? null),
    listUserReels(user.id, currentUser?.id ?? null),
    isUserFollowing(currentUser?.id ?? null, user.id),
  ]);

  const publicProfile = {
    id: user.id,
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    profile: user.profile,
    counts: {
      posts: user._count.posts,
      followers: user._count.followers,
      following: user._count.following,
    },
    isFollowing,
    isSelf: isOwnProfile,
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
          initialReels={reelsPage.items}
          initialReelsCursor={reelsPage.nextCursor}
        />
      </div>

      <Footer />
    </main>
  );
}
