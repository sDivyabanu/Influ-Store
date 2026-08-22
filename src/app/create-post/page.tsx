"use client";

import Link from "next/link";
import { useState } from "react";

export default function CreatePostPage() {
  const [image, setImage] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [category, setCategory] = useState("Fashion");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(false);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
  };

  const handlePublish = (event: React.FormEvent) => {
    event.preventDefault();

    setPublished(true);

    setTimeout(() => {
      setPublished(false);
    }, 3000);
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

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

            <Link
              href="/create-post"
              className="text-white"
            >
              Create
            </Link>

            <Link href="/profile" className="transition hover:text-white">
              Profile
            </Link>
          </div>

          <Link
            href="/profile"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            My Profile
          </Link>
        </div>
      </nav>

      {/* PAGE */}
      <section className="px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-6xl">

          {/* HEADER */}
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Creator Studio
            </p>

            <h1 className="text-4xl font-bold sm:text-5xl">
              Create a post
            </h1>

            <p className="mt-3 max-w-2xl text-gray-400">
              Share your style, showcase products and inspire the
              Influstore community.
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {published && (
            <div className="mb-8 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-300">
              ✓ Your post has been published successfully!
            </div>
          )}

          <form
            onSubmit={handlePublish}
            className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
          >

            {/* LEFT - IMAGE */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-5">
                <h2 className="text-xl font-semibold">
                  Post image
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Upload an image that represents your post.
                </p>
              </div>

              {image ? (
                <div className="relative overflow-hidden rounded-3xl">

                  <img
                    src={image}
                    alt="Post preview"
                    className="aspect-[4/5] w-full object-cover"
                  />

                  <label className="absolute bottom-5 left-1/2 -translate-x-1/2 cursor-pointer rounded-full bg-black/70 px-5 py-3 text-sm font-medium backdrop-blur-xl transition hover:bg-black">
                    Change image

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>

                </div>
              ) : (
                <label className="flex aspect-[4/5] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-white/20 bg-white/[0.02] text-center transition hover:border-fuchsia-400/40 hover:bg-fuchsia-400/[0.03]">

                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-fuchsia-500/10 text-3xl">
                    +
                  </div>

                  <p className="font-semibold">
                    Upload an image
                  </p>

                  <p className="mt-2 max-w-xs text-sm text-gray-500">
                    PNG, JPG or WEBP. Choose a high-quality image
                    for better engagement.
                  </p>

                  <span className="mt-5 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black">
                    Choose image
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}

            </div>

            {/* RIGHT - DETAILS */}
            <div className="space-y-6">

              {/* CAPTION */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                <h2 className="text-xl font-semibold">
                  Post details
                </h2>

                <div className="mt-6 space-y-5">

                  <div>
                    <label
                      htmlFor="caption"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Caption
                    </label>

                    <textarea
                      id="caption"
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      placeholder="Tell your followers about this post..."
                      rows={5}
                      maxLength={500}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />

                    <p className="mt-2 text-right text-xs text-gray-600">
                      {caption.length}/500
                    </p>
                  </div>

                  {/* CATEGORY */}
                  <div>
                    <label
                      htmlFor="category"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Category
                    </label>

                    <select
                      id="category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 text-white outline-none focus:border-fuchsia-400/50"
                    >
                      <option>Fashion</option>
                      <option>Beauty</option>
                      <option>Technology</option>
                      <option>Lifestyle</option>
                      <option>Fitness</option>
                      <option>Travel</option>
                      <option>Food</option>
                      <option>Accessories</option>
                    </select>
                  </div>

                  {/* TAGS */}
                  <div>
                    <label
                      htmlFor="tags"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Tags
                    </label>

                    <input
                      id="tags"
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="#fashion #style #trending"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none transition placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                </div>
              </div>

              {/* PRODUCT */}
              <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">

                <div className="mb-5">
                  <h2 className="text-xl font-semibold">
                    Featured product
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Add a product to make your post shoppable.
                  </p>
                </div>

                <div className="space-y-5">

                  <div>
                    <label
                      htmlFor="productName"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Product name
                    </label>

                    <input
                      id="productName"
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="e.g. Aura Sneakers"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="productPrice"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Product price
                    </label>

                    <input
                      id="productPrice"
                      type="number"
                      min="0"
                      value={productPrice}
                      onChange={(e) => setProductPrice(e.target.value)}
                      placeholder="89.00"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 font-semibold text-white transition hover:bg-white/10"
                >
                  Save draft
                </button>

                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-white px-6 py-4 font-semibold text-black transition hover:scale-[1.01] hover:bg-gray-100"
                >
                  Publish post
                </button>

              </div>

            </div>
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-3 text-sm text-gray-600 sm:flex-row">
          <p>© 2026 Influstore</p>

          <p>
            Discover. Influence. Shop.
          </p>
        </div>
      </footer>

    </main>
  );
}