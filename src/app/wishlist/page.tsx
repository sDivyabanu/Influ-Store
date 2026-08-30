"use client";

import Link from "next/link";
import { useState } from "react";

const initialWishlist = [
  {
    id: 1,
    name: "Aura Sneakers",
    category: "Footwear",
    price: "$89.00",
    oldPrice: "$119.00",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 2,
    name: "Minimal Watch",
    category: "Accessories",
    price: "$129.00",
    oldPrice: "$159.00",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 3,
    name: "Essential Hoodie",
    category: "Fashion",
    price: "$64.00",
    oldPrice: "$89.00",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: 4,
    name: "Classic Sunglasses",
    category: "Accessories",
    price: "$45.00",
    oldPrice: "$65.00",
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=800&q=80",
  },
];

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState(initialWishlist);

  const removeItem = (id: number) => {
    setWishlist((items) => items.filter((item) => item.id !== id));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-black/80 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/home" className="text-2xl font-bold">
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

            <Link href="/wishlist" className="text-white">
              Wishlist
            </Link>

            <Link href="/orders" className="transition hover:text-white">
              Orders
            </Link>

            <Link href="/profile" className="transition hover:text-white">
              Profile
            </Link>
          </div>

          <Link
            href="/cart"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            🛒 Cart
          </Link>
        </div>
      </nav>

      {/* CONTENT */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">
        <div className="mx-auto max-w-7xl">
          {/* HEADER */}
          <div className="mb-12">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Saved for later
            </p>

            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                  My Wishlist
                </h1>

                <p className="mt-4 text-gray-400">
                  {wishlist.length}{" "}
                  {wishlist.length === 1 ? "item" : "items"} saved
                </p>
              </div>

              {wishlist.length > 0 && (
                <button
                  onClick={() => setWishlist([])}
                  className="text-sm text-gray-500 transition hover:text-red-400"
                >
                  Clear wishlist
                </button>
              )}
            </div>
          </div>

          {/* EMPTY STATE */}
          {wishlist.length === 0 ? (
            <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[32px] border border-white/10 bg-white/[0.03] px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-fuchsia-500/10 text-4xl">
                ♡
              </div>

              <h2 className="mt-7 text-2xl font-bold">
                Your wishlist is empty
              </h2>

              <p className="mt-3 max-w-md text-gray-500">
                Save products you love and come back to them whenever you&apos;re
                ready.
              </p>


              <Link
                href="/explore"
                className="mt-8 rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:scale-105"
              >
                Discover Products →
              </Link>
            </div>
          ) : (
            <>
              {/* WISHLIST GRID */}
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {wishlist.map((item) => (
                  <div key={item.id} className="group">
                    {/* IMAGE */}
                    <div className="relative overflow-hidden rounded-3xl bg-zinc-900">
                      <Link href="/products">
                        <div className="aspect-[4/5] overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />
                        </div>
                      </Link>

                      {/* DISCOUNT */}
                      <div className="absolute left-4 top-4 rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-semibold text-white">
                        Saved
                      </div>

                      {/* REMOVE */}
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/60 text-xl text-pink-400 backdrop-blur transition hover:bg-red-500 hover:text-white"
                      >
                        ♥
                      </button>
                    </div>

                    {/* DETAILS */}
                    <div className="px-1 pt-5">
                      <p className="text-sm text-gray-500">
                        {item.category}
                      </p>

                      <h2 className="mt-2 text-lg font-semibold">
                        {item.name}
                      </h2>

                      <div className="mt-2 flex items-center gap-3">
                        <span className="font-semibold">{item.price}</span>

                        <span className="text-sm text-gray-600 line-through">
                          {item.oldPrice}
                        </span>
                      </div>

                      {/* ADD TO CART */}
                      <button className="mt-5 w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-black transition hover:bg-gray-200">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DISCOVERY CTA */}
              <div className="mt-20 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-orange-400/10 p-10 text-center sm:p-16">
                <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                  Keep discovering
                </p>

                <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-bold sm:text-4xl">
                  Your next favorite product might be one scroll away.
                </h2>

                <p className="mx-auto mt-4 max-w-xl text-gray-400">
                  Explore creator recommendations and discover products
                  tailored to your style.
                </p>

                <Link
                  href="/explore"
                  className="mt-8 inline-block rounded-full bg-white px-8 py-4 font-semibold text-black transition hover:scale-105"
                >
                  Explore Trends →
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 sm:flex-row">
          <div>
            <span className="text-xl font-bold">
              Influ<span className="text-fuchsia-400">store</span>
            </span>

            <p className="mt-2 text-sm text-gray-500">
              Discover. Influence. Shop.
            </p>
          </div>

          <p className="text-sm text-gray-600">
            © 2026 Influstore. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}