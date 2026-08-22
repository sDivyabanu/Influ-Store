"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const categories = [
  "All",
  "Fashion",
  "Footwear",
  "Accessories",
  "Beauty",
  "Tech",
  "Home",
];

const products = [
  {
    id: 1,
    name: "Aura Sneakers",
    category: "Footwear",
    price: 89,
    oldPrice: 119,
    rating: 4.8,
    reviews: 324,
    creator: "Maya Carter",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    name: "Minimal Watch",
    category: "Accessories",
    price: 129,
    oldPrice: 169,
    rating: 4.7,
    reviews: 218,
    creator: "Alex Morgan",
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    name: "Essential Hoodie",
    category: "Fashion",
    price: 64,
    oldPrice: 89,
    rating: 4.9,
    reviews: 492,
    creator: "Sofia Lane",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    name: "Classic Street Jacket",
    category: "Fashion",
    price: 118,
    oldPrice: 149,
    rating: 4.6,
    reviews: 187,
    creator: "Maya Carter",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    name: "Everyday Tote",
    category: "Accessories",
    price: 58,
    oldPrice: 79,
    rating: 4.7,
    reviews: 163,
    creator: "Sofia Lane",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    name: "Studio Headphones",
    category: "Tech",
    price: 149,
    oldPrice: 199,
    rating: 4.8,
    reviews: 271,
    creator: "Alex Morgan",
    badge: "Popular",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 7,
    name: "Daily Glow Set",
    category: "Beauty",
    price: 72,
    oldPrice: 95,
    rating: 4.9,
    reviews: 386,
    creator: "Sofia Lane",
    badge: "Best Seller",
    image:
      "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 8,
    name: "Modern Desk Lamp",
    category: "Home",
    price: 84,
    oldPrice: 110,
    rating: 4.5,
    reviews: 129,
    creator: "Daniel Kim",
    badge: "New",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 9,
    name: "Cloud Running Shoes",
    category: "Footwear",
    price: 105,
    oldPrice: 135,
    rating: 4.8,
    reviews: 241,
    creator: "Daniel Kim",
    badge: "Trending",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=85",
  },
];

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("featured");
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartCount, setCartCount] = useState(0);

  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      const matchesCategory =
        activeCategory === "All" ||
        product.category === activeCategory;

      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.category.toLowerCase().includes(search.toLowerCase()) ||
        product.creator.toLowerCase().includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });

    if (sort === "price-low") {
      result = [...result].sort((a, b) => a.price - b.price);
    }

    if (sort === "price-high") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    if (sort === "rating") {
      result = [...result].sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [activeCategory, search, sort]);

  const toggleWishlist = (id: number) => {
    setWishlist((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
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
              className="text-gray-500 hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="text-gray-500 hover:text-white"
            >
              Explore
            </Link>

            <Link
              href="/products"
              className="font-medium text-white"
            >
              Shop
            </Link>

            <Link
              href="/notifications"
              className="text-gray-500 hover:text-white"
            >
              Notifications
            </Link>
          </div>

          <div className="flex items-center gap-3">

            <Link
              href="/wishlist"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 sm:block"
            >
              ♡ Wishlist
            </Link>

            <Link
              href="/cart"
              className="relative rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              🛒 Cart

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-fuchsia-500 px-1 text-xs font-bold">
                  {cartCount}
                </span>
              )}
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

      {/* HEADER */}
      <section className="relative overflow-hidden px-6 pb-12 pt-16 lg:px-10 lg:pt-24">

        <div className="absolute left-1/2 top-0 h-[400px] w-[500px] -translate-x-1/2 rounded-full bg-fuchsia-600/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl">

          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
            Influstore Shop
          </p>

          <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-7xl">
            Shop what
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
              inspires you.
            </span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Discover products recommended by creators and loved by the
            Influstore community.
          </p>

          {/* SEARCH */}
          <div className="mt-10 max-w-3xl">
            <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
              <span className="mr-3 text-xl text-gray-500">
                ⌕
              </span>

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                type="text"
                placeholder="Search products, categories or creators..."
                className="w-full bg-transparent text-white outline-none placeholder:text-gray-600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <section className="border-y border-white/10 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto">

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

      {/* PRODUCTS */}
      <section className="px-6 py-14 lg:px-10">
        <div className="mx-auto max-w-7xl">

          {/* TOOLBAR */}
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

            <div>
              <h2 className="text-2xl font-bold">
                {activeCategory === "All"
                  ? "All products"
                  : activeCategory}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {filteredProducts.length} products
              </p>
            </div>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="featured">
                Sort: Featured
              </option>

              <option value="price-low">
                Price: Low to high
              </option>

              <option value="price-high">
                Price: High to low
              </option>

              <option value="rating">
                Highest rated
              </option>
            </select>
          </div>

          {/* PRODUCT GRID */}
          {filteredProducts.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">

              {filteredProducts.map((product) => {
                const saved = wishlist.includes(product.id);

                return (
                  <div
                    key={product.id}
                    className="group"
                  >

                    {/* IMAGE */}
                    <div className="relative overflow-hidden rounded-3xl bg-zinc-900">

                      <Link href={`/products/${product.id}`}>
                        <div className="aspect-[4/5] overflow-hidden">

                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                          />

                        </div>
                      </Link>

                      {/* BADGE */}
                      <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium backdrop-blur">
                        {product.badge}
                      </div>

                      {/* WISHLIST */}
                      <button
                        onClick={() =>
                          toggleWishlist(product.id)
                        }
                        className={`absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-xl transition ${
                          saved
                            ? "bg-fuchsia-500 text-white"
                            : "bg-black/60 text-white hover:bg-black/80"
                        }`}
                      >
                        {saved ? "♥" : "♡"}
                      </button>

                    </div>

                    {/* PRODUCT INFO */}
                    <div className="pt-4">

                      <div className="flex items-start justify-between gap-4">

                        <div>
                          <p className="text-xs uppercase tracking-wider text-gray-600">
                            {product.category}
                          </p>

                          <Link href={`/products/${product.id}`}>
                            <h3 className="mt-1 text-lg font-semibold transition hover:text-fuchsia-400">
                              {product.name}
                            </h3>
                          </Link>

                          <p className="mt-1 text-sm text-gray-600">
                            by {product.creator}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ${product.price}
                          </p>

                          <p className="text-sm text-gray-600 line-through">
                            ${product.oldPrice}
                          </p>
                        </div>

                      </div>

                      {/* RATING */}
                      <div className="mt-3 flex items-center gap-2 text-sm">
                        <span className="text-orange-300">
                          ★
                        </span>

                        <span>
                          {product.rating}
                        </span>

                        <span className="text-gray-600">
                          ({product.reviews})
                        </span>
                      </div>

                      {/* ADD TO CART */}
                      <button
                        onClick={() =>
                          setCartCount((count) => count + 1)
                        }
                        className="mt-4 w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium transition hover:bg-white hover:text-black"
                      >
                        Add to cart
                      </button>

                    </div>
                  </div>
                );
              })}

            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 py-24 text-center">

              <div className="text-4xl">
                ⌕
              </div>

              <h3 className="mt-5 text-xl font-semibold">
                No products found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try another search or category.
              </p>

              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("All");
                }}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black"
              >
                Clear filters
              </button>

            </div>
          )}
        </div>
      </section>

      {/* CREATOR SHOPPING CTA */}
      <section className="px-6 pb-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] border border-white/10 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-orange-400/10 p-10 sm:p-16">

          <div className="relative max-w-2xl">

            <p className="text-sm uppercase tracking-[0.3em] text-fuchsia-400">
              Shop through creators
            </p>

            <h2 className="mt-5 text-4xl font-bold sm:text-5xl">
              See something you love?
            </h2>

            <p className="mt-5 leading-7 text-gray-400">
              Discover products through the creators you follow and turn
              inspiration into your next purchase.
            </p>

            <Link
              href="/explore"
              className="mt-8 inline-block rounded-full bg-white px-7 py-4 font-semibold text-black transition hover:scale-105"
            >
              Explore creators →
            </Link>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-600 sm:flex-row">

          <p>
            Influ<span className="text-fuchsia-400">store</span>
          </p>

          <p>
            Discover. Influence. Shop.
          </p>

          <p>
            © 2026 Influstore
          </p>

        </div>
      </footer>

    </main>
  );
}