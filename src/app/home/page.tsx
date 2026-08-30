"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useAuth } from "@/features/auth/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Heart, MessageCircle, Share2, ShoppingBag } from "lucide-react";

const stories = [
  {
    name: "Maya",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Sofia",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Alex",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Daniel",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Emma",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
];

const samplePosts = [
  {
    id: 1,
    name: "Maya Carter",
    username: "mayacarter",
    time: "12 min ago",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
    caption: "Found the perfect pieces for a minimal weekend look. What do you think? ✨",
    likes: 24800,
    comments: 428,
    product: "Aura Sneakers",
  },
  {
    id: 2,
    name: "Sofia Lane",
    username: "sofialane",
    time: "1 hour ago",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    caption: "Neutral tones, clean silhouettes and a little sunshine. My current mood. 🤎",
    likes: 18200,
    comments: 312,
    product: "Essential Hoodie",
  },
];

const suggestedCreators = [
  {
    name: "Emma Wilson",
    username: "emmawilson",
    followers: "84K",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Daniel Kim",
    username: "danielkim",
    followers: "96K",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts((curr) =>
      curr.includes(id) ? curr.filter((p) => p !== id) : [...curr, id]
    );
  };

  const toggleFollow = (username: string) => {
    setFollowing((curr) =>
      curr.includes(username) ? curr.filter((u) => u !== username) : [...curr, username]
    );
  };

  const displayName = user?.profile?.displayName || user?.username || "there";

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto grid max-w-7xl gap-10 px-6 py-10 pt-28 lg:grid-cols-[minmax(0,680px)_320px] lg:px-10">
        {/* MAIN FEED */}
        <section>
          {/* WELCOME */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
              Your Daily Feed
            </p>
            <h1 className="mt-1 text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Good to see you, {displayName}.
            </h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              Discover what the community and creators are sharing today.
            </p>
          </div>

          {/* STORIES PREVIEW */}
          <Card className="mb-8 p-5">
            <div className="flex gap-5 overflow-x-auto pb-1">
              <button className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 text-xl font-light text-neutral-500">
                  +
                </div>
                <span className="text-xs text-neutral-500">Your story</span>
              </button>

              {stories.map((story) => (
                <div key={story.name} className="flex shrink-0 flex-col items-center gap-2">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 p-[2px]">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="h-full w-full rounded-full border-2 border-white dark:border-black object-cover"
                    />
                  </div>
                  <span className="max-w-16 truncate text-xs text-neutral-600 dark:text-neutral-400">
                    {story.name}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* POSTS */}
          <div className="space-y-8">
            {samplePosts.map((post) => {
              const isLiked = likedPosts.includes(post.id);
              return (
                <Card key={post.id} className="p-0 overflow-hidden">
                  {/* POST HEADER */}
                  <div className="flex items-center justify-between p-4 sm:p-5">
                    <Link
                      href={`/profile/${post.username}`}
                      className="flex items-center gap-3 group"
                    >
                      <Avatar src={post.avatar} name={post.name} size="md" />
                      <div>
                        <p className="text-sm font-semibold text-neutral-900 dark:text-white group-hover:text-fuchsia-500 transition">
                          {post.name}
                        </p>
                        <p className="text-xs text-neutral-500">
                          @{post.username} · {post.time}
                        </p>
                      </div>
                    </Link>
                  </div>

                  {/* POST IMAGE */}
                  <div className="aspect-[4/5] overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="h-full w-full object-cover transition duration-500 hover:scale-[1.01]"
                    />
                  </div>

                  {/* POST ACTIONS & CAPTION */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-center gap-5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`flex items-center gap-1.5 text-sm transition ${
                          isLiked ? "text-fuchsia-500 font-semibold" : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? "fill-fuchsia-500" : ""}`} />
                        <span>{(post.likes + (isLiked ? 1 : 0)).toLocaleString()}</span>
                      </button>

                      <div className="flex items-center gap-1.5 text-sm text-neutral-500">
                        <MessageCircle className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </div>

                      <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition ml-auto">
                        <Share2 className="h-5 w-5" />
                      </button>
                    </div>

                    <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                      <span className="font-semibold text-neutral-900 dark:text-white">
                        {post.username}
                      </span>{" "}
                      {post.caption}
                    </p>

                    {/* FEATURED PRODUCT */}
                    <div className="flex items-center justify-between rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/50 dark:bg-neutral-900/50 p-3.5">
                      <div className="flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-fuchsia-500" />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                            Tagged Product (Phase 2 Preview)
                          </p>
                          <p className="text-xs font-semibold text-neutral-900 dark:text-white">
                            {post.product}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-fuchsia-500">
                        Explore →
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* SIDEBAR */}
        <aside className="hidden lg:block space-y-6">
          {/* PROFILE SUMMARY CARD */}
          {user && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                <Avatar
                  src={user.profile?.avatarUrl}
                  name={user.profile?.displayName || user.username}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-neutral-900 dark:text-white truncate">
                    {user.profile?.displayName || user.username}
                  </h3>
                  <p className="text-xs text-neutral-500 truncate">
                    @{user.username}
                  </p>
                </div>
              </div>

              <Link href={`/profile/${user.username}`} className="mt-5 block">
                <Button variant="outline" size="sm" className="w-full text-xs">
                  View Profile
                </Button>
              </Link>
            </Card>
          )}

          {/* SUGGESTED CREATORS */}
          <Card className="p-6">
            <h3 className="font-bold text-sm text-neutral-900 dark:text-white mb-4">
              Suggested Creators
            </h3>

            <div className="space-y-4">
              {suggestedCreators.map((creator) => {
                const isFollowing = following.includes(creator.username);
                return (
                  <div key={creator.username} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={creator.image} name={creator.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                          {creator.name}
                        </p>
                        <p className="text-[10px] text-neutral-500 truncate">
                          @{creator.username}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant={isFollowing ? "outline" : "primary"}
                      size="sm"
                      onClick={() => toggleFollow(creator.username)}
                      className="h-7 px-2.5 text-xs rounded-xl"
                    >
                      {isFollowing ? "Following" : "Follow"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        </aside>
      </div>

      <Footer />
    </main>
  );
}