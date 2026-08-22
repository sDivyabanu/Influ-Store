"use client";

import Link from "next/link";
import { useState } from "react";

const stories = [
  {
    name: "Maya",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Sofia",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Alex",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Daniel",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Emma",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  },
];

const posts = [
  {
    id: 1,
    name: "Maya Carter",
    username: "@mayacarter",
    time: "12 min ago",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85",
    caption:
      "Found the perfect pieces for a minimal weekend look. What do you think? ✨",
    likes: 24800,
    comments: 428,
    product: "Aura Sneakers",
  },
  {
    id: 2,
    name: "Sofia Lane",
    username: "@sofialane",
    time: "1 hour ago",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1000&q=85",
    caption:
      "Neutral tones, clean silhouettes and a little sunshine. My current mood. 🤎",
    likes: 18200,
    comments: 312,
    product: "Essential Hoodie",
  },
  {
    id: 3,
    name: "Alex Morgan",
    username: "@alexmorgan",
    time: "3 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
    caption:
      "My current desk setup. Simple, clean and exactly what I needed.",
    likes: 15600,
    comments: 196,
    product: "Studio Headphones",
  },
];

const suggestedCreators = [
  {
    name: "Emma Wilson",
    username: "@emmawilson",
    followers: "84K",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Daniel Kim",
    username: "@danielkim",
    followers: "96K",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    name: "Lena Brooks",
    username: "@lenabrooks",
    followers: "71K",
    image:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=200&q=80",
  },
];

const trendingProducts = [
  {
    name: "Aura Sneakers",
    price: "$89",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Minimal Watch",
    price: "$129",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Essential Hoodie",
    price: "$64",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80",
  },
];

export default function HomePage() {
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  const toggleLike = (id: number) => {
    setLikedPosts((current) =>
      current.includes(id)
        ? current.filter((postId) => postId !== id)
        : [...current, id]
    );
  };

  const toggleFollow = (username: string) => {
    setFollowing((current) =>
      current.includes(username)
        ? current.filter((item) => item !== username)
        : [...current, username]
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm md:flex">
            <Link
              href="/home"
              className="font-medium text-white"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="text-gray-500 transition hover:text-white"
            >
              Explore
            </Link>

            <Link
              href="/products"
              className="text-gray-500 transition hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/notifications"
              className="text-gray-500 transition hover:text-white"
            >
              Notifications
            </Link>
          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/cart"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 sm:block"
            >
              🛒 Cart
            </Link>

            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 font-semibold"
            >
              P
            </Link>

          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[minmax(0,680px)_320px] lg:px-10">

        {/* FEED */}
        <section>

          {/* WELCOME */}
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.25em] text-fuchsia-400">
              Your feed
            </p>

            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Good to see you, Priya.
            </h1>

            <p className="mt-3 text-gray-500">
              Here's what's happening in your world.
            </p>
          </div>

          {/* STORIES */}
          <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex gap-5 overflow-x-auto">

              {/* ADD STORY */}
              <button className="flex shrink-0 flex-col items-center gap-2">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-white/20 bg-white/5 text-2xl text-gray-500">
                  +
                </div>

                <span className="text-xs text-gray-500">
                  Your story
                </span>
              </button>

              {stories.map((story) => (
                <button
                  key={story.name}
                  className="flex shrink-0 flex-col items-center gap-2"
                >
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 p-[2px]">
                    <img
                      src={story.image}
                      alt={story.name}
                      className="h-full w-full rounded-full border-2 border-black object-cover"
                    />
                  </div>

                  <span className="max-w-16 truncate text-xs text-gray-400">
                    {story.name}
                  </span>
                </button>
              ))}

            </div>
          </div>

          {/* CREATE POST */}
          <div className="mb-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">

            <div className="flex items-center gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 font-semibold">
                P
              </div>

              <Link
                href="/create-post"
                className="flex-1 rounded-2xl bg-white/5 px-5 py-3 text-sm text-gray-600 transition hover:bg-white/10"
              >
                Share something with the community...
              </Link>

            </div>

            <div className="mt-4 flex gap-3 border-t border-white/10 pt-4">

              <Link
                href="/create-post"
                className="flex-1 rounded-xl py-2 text-center text-sm text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                📷 Photo
              </Link>

              <Link
                href="/create-post"
                className="flex-1 rounded-xl py-2 text-center text-sm text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                ✨ Inspiration
              </Link>

              <Link
                href="/create-post"
                className="flex-1 rounded-xl py-2 text-center text-sm text-gray-500 transition hover:bg-white/5 hover:text-white"
              >
                🛍️ Product
              </Link>

            </div>
          </div>

          {/* POSTS */}
          <div className="space-y-8">

            {posts.map((post) => {
              const liked = likedPosts.includes(post.id);

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]"
                >

                  {/* POST HEADER */}
                  <div className="flex items-center justify-between p-5">

                    <div className="flex items-center gap-3">

                      <img
                        src={post.avatar}
                        alt={post.name}
                        className="h-11 w-11 rounded-full object-cover"
                      />

                      <div>
                        <p className="text-sm font-semibold">
                          {post.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-600">
                          {post.username} · {post.time}
                        </p>
                      </div>

                    </div>

                    <button className="text-xl text-gray-600 hover:text-white">
                      ···
                    </button>

                  </div>

                  {/* IMAGE */}
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="h-full w-full object-cover transition duration-700 hover:scale-[1.01]"
                    />
                  </div>

                  {/* ACTIONS */}
                  <div className="p-5">

                    <div className="flex items-center gap-5">

                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`text-sm transition ${
                          liked
                            ? "text-fuchsia-400"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        {liked ? "♥" : "♡"}{" "}
                        {liked
                          ? `${(post.likes + 1).toLocaleString()}`
                          : post.likes.toLocaleString()}
                      </button>

                      <button className="text-sm text-gray-400 hover:text-white">
                        ♡ {post.comments}
                      </button>

                      <button className="text-sm text-gray-400 hover:text-white">
                        ↗ Share
                      </button>

                      <button className="ml-auto text-gray-400 hover:text-white">
                        ♧
                      </button>

                    </div>

                    {/* CAPTION */}
                    <p className="mt-4 text-sm leading-6 text-gray-300">
                      <span className="font-semibold text-white">
                        {post.username}
                      </span>{" "}
                      {post.caption}
                    </p>

                    {/* PRODUCT */}
                    <Link
                      href="/products"
                      className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/40 p-4 transition hover:bg-white/5"
                    >
                      <div>
                        <p className="text-xs uppercase tracking-wider text-gray-600">
                          Featured product
                        </p>

                        <p className="mt-1 text-sm font-medium">
                          {post.product}
                        </p>
                      </div>

                      <span className="text-sm text-fuchsia-400">
                        Shop →
                      </span>
                    </Link>

                  </div>

                </article>
              );
            })}

          </div>

        </section>

        {/* RIGHT SIDEBAR */}
        <aside className="hidden lg:block">

          <div className="sticky top-28 space-y-6">

            {/* PROFILE CARD */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="flex items-center gap-4">

                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-xl font-bold">
                  P
                </div>

                <div>
                  <h3 className="font-semibold">
                    Priya
                  </h3>

                  <p className="text-sm text-gray-600">
                    @priya
                  </p>
                </div>

              </div>

              <div className="mt-6 grid grid-cols-3 text-center">

                <div>
                  <p className="font-semibold">48</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Posts
                  </p>
                </div>

                <div>
                  <p className="font-semibold">12.4K</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Followers
                  </p>
                </div>

                <div>
                  <p className="font-semibold">486</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Following
                  </p>
                </div>

              </div>

              <Link
                href="/profile"
                className="mt-6 block rounded-xl border border-white/10 bg-white/5 py-3 text-center text-sm font-medium transition hover:bg-white/10"
              >
                View profile
              </Link>

            </div>

            {/* SUGGESTED CREATORS */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="flex items-center justify-between">

                <h2 className="font-semibold">
                  Suggested creators
                </h2>

                <Link
                  href="/explore"
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300"
                >
                  See all
                </Link>

              </div>

              <div className="mt-5 space-y-5">

                {suggestedCreators.map((creator) => {
                  const isFollowing = following.includes(
                    creator.username
                  );

                  return (
                    <div
                      key={creator.username}
                      className="flex items-center gap-3"
                    >

                      <img
                        src={creator.image}
                        alt={creator.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />

                      <div className="min-w-0 flex-1">

                        <p className="truncate text-sm font-medium">
                          {creator.name}
                        </p>

                        <p className="text-xs text-gray-600">
                          {creator.followers} followers
                        </p>

                      </div>

                      <button
                        onClick={() =>
                          toggleFollow(creator.username)
                        }
                        className={`text-xs font-medium ${
                          isFollowing
                            ? "text-gray-500"
                            : "text-fuchsia-400"
                        }`}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>

                    </div>
                  );
                })}

              </div>

            </div>

            {/* TRENDING PRODUCTS */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="flex items-center justify-between">

                <h2 className="font-semibold">
                  Trending products
                </h2>

                <Link
                  href="/products"
                  className="text-xs text-fuchsia-400 hover:text-fuchsia-300"
                >
                  Shop all
                </Link>

              </div>

              <div className="mt-5 space-y-4">

                {trendingProducts.map((product) => (

                  <Link
                    href="/products"
                    key={product.name}
                    className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-white/5"
                  >

                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-14 w-14 rounded-xl object-cover"
                    />

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-sm font-medium">
                        {product.name}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        {product.price}
                      </p>

                    </div>

                    <span className="text-gray-600">
                      →
                    </span>

                  </Link>

                ))}

              </div>

            </div>

            {/* FOOTER LINKS */}
            <div className="px-2 text-xs leading-6 text-gray-700">
              <span>About</span>
              {" · "}
              <span>Privacy</span>
              {" · "}
              <span>Terms</span>
              {" · "}
              <span>Help</span>

              <p className="mt-2">
                © 2026 Influstore
              </p>
            </div>

          </div>

        </aside>

      </div>

    </main>
  );
}