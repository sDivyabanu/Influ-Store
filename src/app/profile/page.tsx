"use client";

import Link from "next/link";
import { useState } from "react";

const posts = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80",
    likes: "2.4K",
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80",
    likes: "1.8K",
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
    likes: "3.1K",
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    likes: "1.2K",
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80",
    likes: "2.7K",
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=800&q=80",
    likes: "984",
  },
];

const savedProducts = [
  {
    name: "Aura Sneakers",
    price: "$89",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Minimal Watch",
    price: "$129",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Essential Hoodie",
    price: "$64",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"posts" | "saved">("posts");
  const [following, setFollowing] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <Link href="/home" className="transition hover:text-white">
              Home
            </Link>

            <Link href="/explore" className="transition hover:text-white">
              Explore
            </Link>

            <Link href="/products" className="transition hover:text-white">
              Shop
            </Link>

            <Link href="/notifications" className="transition hover:text-white">
              Notifications
            </Link>
          </div>

          <Link
            href="/profile"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 font-semibold"
          >
            P
          </Link>
        </div>
      </nav>

      {/* PROFILE HEADER */}
      <section className="border-b border-white/10 px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-5xl">

          <div className="flex flex-col gap-8 sm:flex-row sm:items-center">

            {/* AVATAR */}
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-purple-500 to-orange-400 p-1">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-900 text-4xl font-bold">
                P
              </div>
            </div>

            {/* INFO */}
            <div className="flex-1">

              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-3xl font-bold">
                  Priya
                </h1>

                <span className="rounded-full border border-fuchsia-400/30 bg-fuchsia-400/10 px-3 py-1 text-xs font-medium text-fuchsia-300">
                  Creator
                </span>
              </div>

              <p className="mt-2 text-gray-500">
                @priya
              </p>

              <p className="mt-4 max-w-xl leading-7 text-gray-400">
                Fashion, lifestyle & everything in between.
                Discovering new trends and sharing things I love.
              </p>

              {/* STATS */}
              <div className="mt-6 flex gap-8">
                <div>
                  <p className="text-xl font-bold">48</p>
                  <p className="text-sm text-gray-500">Posts</p>
                </div>

                <div>
                  <p className="text-xl font-bold">12.4K</p>
                  <p className="text-sm text-gray-500">Followers</p>
                </div>

                <div>
                  <p className="text-xl font-bold">486</p>
                  <p className="text-sm text-gray-500">Following</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setFollowing(!following)}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold transition ${
                    following
                      ? "border border-white/10 bg-white/5 text-white"
                      : "bg-white text-black hover:bg-gray-100"
                  }`}
                >
                  {following ? "Following" : "Follow"}
                </button>

                <Link
                  href="/settings"
                  className="rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold transition hover:bg-white/10"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-6 py-10 lg:px-10">
        <div className="mx-auto max-w-5xl">

          {/* TABS */}
          <div className="mb-8 flex border-b border-white/10">
            <button
              onClick={() => setActiveTab("posts")}
              className={`border-b-2 px-6 py-4 text-sm font-medium transition ${
                activeTab === "posts"
                  ? "border-fuchsia-400 text-white"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              Posts
            </button>

            <button
              onClick={() => setActiveTab("saved")}
              className={`border-b-2 px-6 py-4 text-sm font-medium transition ${
                activeTab === "saved"
                  ? "border-fuchsia-400 text-white"
                  : "border-transparent text-gray-500 hover:text-white"
              }`}
            >
              Saved
            </button>
          </div>

          {/* POSTS */}
          {activeTab === "posts" && (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-zinc-900"
                >
                  <img
                    src={post.image}
                    alt="Post"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 via-transparent to-transparent p-4 opacity-0 transition group-hover:opacity-100">
                    <span className="text-sm font-medium">
                      ♥ {post.likes}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* SAVED PRODUCTS */}
          {activeTab === "saved" && (
            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {savedProducts.map((product) => (
                <Link
                  href="/products"
                  key={product.name}
                  className="group overflow-hidden rounded-2xl bg-zinc-900"
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <h3 className="font-medium">
                      {product.name}
                    </h3>

                    <span className="text-sm text-gray-400">
                      {product.price}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 text-sm text-gray-600 sm:flex-row">
          <p>Influstore</p>
          <p>Discover. Influence. Shop.</p>
        </div>
      </footer>
    </main>
  );
}