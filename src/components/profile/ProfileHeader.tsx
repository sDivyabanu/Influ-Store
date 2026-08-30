"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "@/components/users/FollowButton";
import { UserListModal } from "@/components/users/UserListModal";
import { PublicUserProfile } from "@/types/profile";
import { useAuth } from "@/features/auth/auth-context";
import { Globe, Calendar, Settings, Sparkles } from "lucide-react";

export function ProfileHeader({ userProfile }: { userProfile: PublicUserProfile }) {
  const { user: currentUser } = useAuth();
  const [followerCount, setFollowerCount] = useState(userProfile.counts.followers);
  const [followingCount, setFollowingCount] = useState(userProfile.counts.following);
  const [modalState, setModalState] = useState<"followers" | "following" | null>(null);

  const isOwnProfile =
    currentUser?.id === userProfile.id || currentUser?.username?.toLowerCase() === userProfile.username.toLowerCase();
  const displayName = userProfile.profile?.displayName || userProfile.username;
  const bio = userProfile.profile?.bio;
  const website = userProfile.profile?.website;
  const avatarUrl = userProfile.profile?.avatarUrl;
  const accountType = userProfile.profile?.accountType;

  const formattedJoinDate = new Date(userProfile.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/40 dark:bg-black/40 px-6 py-12 lg:px-10 transition-colors">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start">
          {/* AVATAR */}
          <div className="shrink-0 flex justify-center sm:justify-start">
            <Avatar
              src={avatarUrl}
              name={displayName}
              size="2xl"
              className="ring-4 ring-neutral-200 dark:ring-neutral-800/80"
            />
          </div>

          {/* USER INFO & ACTIONS */}
          <div className="flex-1 space-y-4 text-center sm:text-left">
            {/* NAME & BADGES & ACTIONS */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {displayName}
                  </h1>
                  {accountType === "INFLUENCER" && (
                    <Badge variant="primary" className="gap-1">
                      <Sparkles className="h-3 w-3" /> Creator
                    </Badge>
                  )}
                  {userProfile.role === "ADMIN" && (
                    <Badge variant="warning">Admin</Badge>
                  )}
                </div>
                <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  @{userProfile.username}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex items-center justify-center sm:justify-end gap-3 pt-2 sm:pt-0">
                {isOwnProfile ? (
                  <Link href="/settings/profile">
                    <Button variant="outline" size="sm" className="gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Edit Profile</span>
                    </Button>
                  </Link>
                ) : (
                  <FollowButton
                    targetUsername={userProfile.username}
                    initialIsFollowing={userProfile.isFollowing}
                    onFollowChange={(_, newFollowerCount, newFollowingCount) => {
                      setFollowerCount(newFollowerCount);
                      setFollowingCount(newFollowingCount);
                    }}
                    size="md"
                  />
                )}

              </div>
            </div>

            {/* BIO */}
            {bio ? (
              <p className="max-w-xl text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                {bio}
              </p>
            ) : (
              <p className="text-sm italic text-neutral-400 dark:text-neutral-500">
                No bio provided yet.
              </p>
            )}

            {/* METADATA: WEBSITE & JOIN DATE */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-xs text-neutral-500 dark:text-neutral-400 pt-1">
              {website && (
                <a
                  href={website.startsWith("http") ? website : `https://${website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-fuchsia-600 dark:text-fuchsia-400 hover:underline"
                >
                  <Globe className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}

              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                <span>Joined {formattedJoinDate}</span>
              </div>
            </div>

            {/* STATS (REAL SOCIAL GRAPH DATA) */}
            <div className="flex justify-center sm:justify-start gap-8 pt-4 border-t border-neutral-200 dark:border-neutral-800/80">
              <div>
                <span className="font-bold text-neutral-900 dark:text-white">
                  {userProfile.counts.posts}
                </span>{" "}
                <span className="text-xs text-neutral-500">Posts</span>
              </div>

              {/* FOLLOWERS BUTTON */}
              <button
                type="button"
                onClick={() => setModalState("followers")}
                className="group text-left transition hover:opacity-80"
              >
                <span className="font-bold text-neutral-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition">
                  {followerCount.toLocaleString()}
                </span>{" "}
                <span className="text-xs text-neutral-500">Followers</span>
              </button>

              {/* FOLLOWING BUTTON */}
              <button
                type="button"
                onClick={() => setModalState("following")}
                className="group text-left transition hover:opacity-80"
              >
                <span className="font-bold text-neutral-900 dark:text-white group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 transition">
                  {followingCount.toLocaleString()}
                </span>{" "}
                <span className="text-xs text-neutral-500">Following</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* FOLLOWERS / FOLLOWING MODAL */}
      {modalState && (
        <UserListModal
          isOpen={!!modalState}
          onClose={() => setModalState(null)}
          title={modalState === "followers" ? "Followers" : "Following"}
          username={userProfile.username}
          type={modalState}
        />
      )}
    </div>
  );
}
