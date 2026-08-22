"use client";

import Link from "next/link";

const orders = [
  {
    id: "INF-2026-00124",
    date: "Aug 20, 2026",
    status: "Delivered",
    statusColor: "text-emerald-400",
    product: "Aura Sneakers",
    category: "Footwear",
    price: "$89.00",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "INF-2026-00118",
    date: "Aug 15, 2026",
    status: "Shipped",
    statusColor: "text-blue-400",
    product: "Minimal Watch",
    category: "Accessories",
    price: "$129.00",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=500&q=80",
  },
  {
    id: "INF-2026-00105",
    date: "Aug 08, 2026",
    status: "Processing",
    statusColor: "text-yellow-400",
    product: "Essential Hoodie",
    category: "Fashion",
    price: "$64.00",
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=500&q=80",
  },
];

export default function OrdersPage() {
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

            <Link href="/orders" className="text-white">
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
              Your purchases
            </p>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              My Orders
            </h1>

            <p className="mt-4 max-w-xl text-gray-400">
              Track your purchases, view order details and manage your
              Influstore orders.
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="mb-12 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-gray-500">Total orders</p>
              <p className="mt-3 text-3xl font-bold">3</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-gray-500">In progress</p>
              <p className="mt-3 text-3xl font-bold">2</p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm text-gray-500">Total spent</p>
              <p className="mt-3 text-3xl font-bold">$282</p>
            </div>
          </div>

          {/* ORDERS */}
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] transition hover:border-white/20"
              >
                {/* ORDER HEADER */}
                <div className="flex flex-col gap-4 border-b border-white/10 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Order ID</p>
                    <p className="mt-1 font-semibold">{order.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Placed on</p>
                    <p className="mt-1 text-sm text-gray-300">
                      {order.date}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <p
                      className={`mt-1 text-sm font-medium ${order.statusColor}`}
                    >
                      ● {order.status}
                    </p>
                  </div>
                </div>

                {/* ORDER PRODUCT */}
                <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
                  <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-zinc-900">
                    <img
                      src={order.image}
                      alt={order.product}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1">
                    <p className="text-sm text-gray-500">{order.category}</p>

                    <h2 className="mt-1 text-xl font-semibold">
                      {order.product}
                    </h2>

                    <p className="mt-2 text-sm text-gray-500">
                      Quantity: {order.quantity}
                    </p>

                    <p className="mt-3 text-lg font-semibold">
                      {order.price}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:min-w-[150px]">
                    <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-gray-200">
                      View Details
                    </button>

                    {order.status === "Delivered" && (
                      <button className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium transition hover:bg-white/10">
                        Buy Again
                      </button>
                    )}

                    {order.status === "Shipped" && (
                      <button className="rounded-xl border border-blue-400/20 bg-blue-400/10 px-5 py-3 text-sm font-medium text-blue-400 transition hover:bg-blue-400/20">
                        Track Order
                      </button>
                    )}
                  </div>
                </div>

                {/* DELIVERY PROGRESS */}
                <div className="border-t border-white/10 px-6 py-5">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span
                      className={
                        order.status !== "Processing"
                          ? "text-fuchsia-400"
                          : "text-white"
                      }
                    >
                      Ordered
                    </span>

                    <span
                      className={
                        order.status === "Shipped" ||
                        order.status === "Delivered"
                          ? "text-fuchsia-400"
                          : ""
                      }
                    >
                      Shipped
                    </span>

                    <span
                      className={
                        order.status === "Delivered"
                          ? "text-emerald-400"
                          : ""
                      }
                    >
                      Delivered
                    </span>
                  </div>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div
                      className={`h-full rounded-full ${
                        order.status === "Delivered"
                          ? "w-full"
                          : order.status === "Shipped"
                            ? "w-2/3"
                            : "w-1/3"
                      } bg-gradient-to-r from-fuchsia-500 to-pink-400`}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EMPTY / SHOP CTA */}
          <div className="mt-16 rounded-3xl border border-white/10 bg-gradient-to-br from-fuchsia-600/10 via-purple-600/5 to-orange-400/10 p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-2xl">
              ✨
            </div>

            <h2 className="mt-5 text-2xl font-bold">
              Looking for something new?
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-400">
              Discover products recommended by creators and find your next
              favorite item.
            </p>

            <Link
              href="/explore"
              className="mt-7 inline-block rounded-full bg-white px-7 py-3 font-semibold text-black transition hover:scale-105"
            >
              Explore Products →
            </Link>
          </div>
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