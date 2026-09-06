import { notFound } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { UserCard } from "@/components/users/UserCard";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getFollowers } from "@/lib/services/follow.service";
import { ArrowLeft, Users } from "lucide-react";

interface FollowersPageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: FollowersPageProps) {
  const { username } = await params;
  return {
    title: `People following @${username} | Influ-Store`,
    description: `See everyone following @${username} on Influ-Store.`,
  };
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params;

  const targetUser = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
    select: { id: true, username: true, profile: { select: { displayName: true } } },
  });

  if (!targetUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const followersPage = await getFollowers(targetUser.username, currentUser?.id ?? null, null, 30);
  const displayName = targetUser.profile?.displayName || targetUser.username;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 max-w-2xl mx-auto w-full px-6 py-10 pt-28">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href={`/profile/${targetUser.username}`}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition mb-3"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to @{targetUser.username}&apos;s profile</span>
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Followers
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            People who follow {displayName} (@{targetUser.username})
          </p>
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {followersPage.items.length === 0 ? (
            <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 p-12 text-center text-neutral-500 space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white">
                No followers yet
              </p>
              <p className="text-xs max-w-sm mx-auto">
                @{targetUser.username} does not have any followers yet.
              </p>
            </div>
          ) : (
            followersPage.items.map((user) => (
              <UserCard key={user.id} user={user} />
            ))
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
