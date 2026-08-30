"use client";

import Link from "next/link";
import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const categories = [
  "All",
  "Fashion",
  "Beauty",
  "Lifestyle",
  "Tech",
  "Fitness",
  "Home",
];

const creators = [
  {
    name: "Maya Carter",
    username: "@mayacarter",
    followers: "248K",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Alex Morgan",
    username: "@alexmorgan",
    followers: "184K",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Sofia Lane",
    username: "@sofialane",
    followers: "312K",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80",
  },
  {
    name: "Daniel Kim",
    username: "@danielkim",
    followers: "96K",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80",
  },
];

const posts = [
  {
    id: 1,
    creator: "Maya Carter",
    username: "@mayacarter",
    caption: "Weekend essentials ✨",
    category: "Fashion",
    likes: "24.8K",
    comments: "428",
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    creator: "Sofia Lane",
    username: "@sofialane",
    caption: "Simple things, better spaces.",
    category: "Lifestyle",
    likes: "18.2K",
    comments: "312",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    creator: "Alex Morgan",
    username: "@alexmorgan",
    caption: "The everyday setup.",
    category: "Tech",
    likes: "15.6K",
    comments: "196",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    creator: "Daniel Kim",
    username: "@danielkim",
    caption: "New week. New goals.",
    category: "Fitness",
    likes: "12.9K",
    comments: "174",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    creator: "Maya Carter",
    username: "@mayacarter",
    caption: "Neutral tones are always a good idea.",
    category: "Fashion",
    likes: "21.3K",
    comments: "284",
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    creator: "Sofia Lane",
    username: "@sofialane",
    caption: "A little self-care goes a long way.",
    category: "Beauty",
    likes: "19.7K",
    comments: "351",
    image:
      "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=900&q=85",
  },
];

const products = [
  {
    name: "Aura Sneakers",
    price: "$89",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Minimal Watch",
    price: "$129",
    category: "Accessories",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=700&q=80",
  },
  {
    name: "Essential Hoodie",
    price: "$64",
    category: "Fashion",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=700&q=80",
  },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [following, setFollowing] = useState<string[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const filteredPosts =
    activeCategory === "All"
      ? posts
      : posts.filter((post) => post.category === activeCategory);

  const toggleFollow = (creator: string) => {
    setFollowing((current) =>
      current.includes(creator)
        ? current.filter((name) => name !== creator)
        : [...current, creator]
    );
  };

  const toggleLike = (id: number) => {
    setLikedPosts((current) =>
      current.includes(id)
        ? current.filter((postId) => postId !== id)
        : [...current, id]
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-12">

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-16 pt-16 lg:px-10 lg:pt-24">
        <div className="absolute left-1/2 top-0 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
            Explore
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            Find what
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
              inspires you.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Discover creators, ideas, trends and products curated by the
            Influstore community.
          </p>

          {/* SEARCH */}
          <div className="mt-10 max-w-2xl">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-xl">
              <span className="mr-3 text-gray-500">⌕</span>

              <input
                type="text"
                placeholder="Search creators, trends, products..."
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="border-y border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* TRENDING CREATORS */}
      <section className="px-6 py-16 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-fuchsia-400">
                Creators
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                People to discover
              </h2>
            </div>

            <button className="hidden text-sm text-gray-500 transition hover:text-white sm:block">
              View all →
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {creators.map((creator) => {
              const isFollowing = following.includes(creator.name);

              return (
                <div
                  key={creator.name}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 transition hover:bg-white/[0.06]"
                >
                  <div className="flex items-center gap-4">

                    <img
                      src={creator.image}
                      alt={creator.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {creator.name}
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {creator.username}
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        {creator.followers} followers
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(creator.name)}
                    className={`mt-5 w-full rounded-xl py-2.5 text-sm font-medium transition ${
                      isFollowing
                        ? "border border-white/10 bg-white/5 text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* COMMUNITY POSTS */}
      <section className="px-6 pb-20 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10">
            <p className="mb-2 text-sm uppercase tracking-[0.25em] text-fuchsia-400">
              Community
            </p>

            <h2 className="text-3xl font-bold sm:text-4xl">
              Trending right now
            </h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const liked = likedPosts.includes(post.id);

              return (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-zinc-950"
                >

                  {/* POST IMAGE */}
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.caption}
                      className="h-full w-full object-cover transition duration-700 hover:scale-105"
                    />

                    <div className="absolute left-4 top-4 rounded-full bg-black/60 px-3 py-1.5 text-xs backdrop-blur">
                      {post.category}
                    </div>
                  </div>

                  {/* POST CONTENT */}
                  <div className="p-5">

                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-xs font-bold">
                        {post.creator.charAt(0)}
                      </div>

                      <div>
                        <p className="text-sm font-medium">
                          {post.creator}
                        </p>

                        <p className="text-xs text-gray-600">
                          {post.username}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-gray-300">
                      {post.caption}
                    </p>

                    <div className="mt-5 flex items-center gap-5">
                      <button
                        onClick={() => toggleLike(post.id)}
                        className={`text-sm transition ${
                          liked
                            ? "text-fuchsia-400"
                            : "text-gray-500 hover:text-white"
                        }`}
                      >
                        {liked ? "♥" : "♡"}{" "}
                        {liked ? "Liked" : post.likes}
                      </button>

                      <button className="text-sm text-gray-500 transition hover:text-white">
                        ♡ {post.comments}
                      </button>

                      <button className="ml-auto text-sm text-gray-500 transition hover:text-white">
                        Share
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="rounded-3xl border border-white/10 py-20 text-center">
              <p className="text-gray-500">
                No posts found in this category.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="border-t border-white/10 px-6 py-20 lg:px-10">
        <div className="mx-auto max-w-7xl">

          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.25em] text-orange-300">
                Shop the trend
              </p>

              <h2 className="text-3xl font-bold sm:text-4xl">
                Products people love
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden text-sm text-gray-500 transition hover:text-white sm:block"
            >
              View shop →
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
            {products.map((product) => (
              <Link
                href="/products"
                key={product.name}
                className="group overflow-hidden rounded-3xl bg-zinc-900"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                </div>

                <div className="flex items-center justify-between p-5">
                  <div>
                    <p className="text-xs text-gray-600">
                      {product.category}
                    </p>

                    <h3 className="mt-1 font-semibold">
                      {product.name}
                    </h3>
                  </div>

                  <span className="font-medium">
                    {product.price}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      </div>
      <Footer />
    </main>
  );
}