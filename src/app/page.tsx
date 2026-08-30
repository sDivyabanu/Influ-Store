import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const trendingProducts = [
  {
    name: "Aura Sneakers",
    category: "Footwear",
    price: "$89",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Minimal Watch",
    category: "Accessories",
    price: "$129",
    image:
      "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Essential Hoodie",
    category: "Fashion",
    price: "$64",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=800&q=80",
  },
];

const features = [
  {
    number: "01",
    title: "Discover",
    description:
      "Find products and trends through creators whose style matches yours.",
  },
  {
    number: "02",
    title: "Connect",
    description:
      "Follow creators, share inspiration and become part of the community.",
  },
  {
    number: "03",
    title: "Shop",
    description:
      "Turn inspiration into purchases without leaving the experience.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      {/* HERO */}
      <section className="relative flex min-h-screen items-center overflow-hidden px-6 pt-20 lg:px-10">
        {/* Background glow */}
        <div className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-fuchsia-500/20 blur-[140px] pointer-events-none" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          {/* Hero text */}
          <div>
            <div className="mb-7 inline-flex rounded-full border border-neutral-300 dark:border-white/10 bg-neutral-200/50 dark:bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 backdrop-blur">
              The future of social commerce
            </div>

            <h1 className="max-w-4xl text-6xl font-bold leading-[0.95] tracking-tight sm:text-7xl lg:text-8xl">
              Discover.
              <br />
              <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 bg-clip-text text-transparent">
                Influence.
              </span>
              <br />
              Shop.
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-8 text-neutral-600 dark:text-neutral-400">
              Influstore brings creators, trends and shopping together in one
              immersive social-commerce experience.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/explore"
                className="rounded-full bg-neutral-900 dark:bg-white px-7 py-4 font-semibold text-white dark:text-black transition hover:scale-105 shadow-md"
              >
                Explore Trends →
              </Link>

              <Link
                href="/register"
                className="rounded-full border border-neutral-300 dark:border-white/15 bg-white/60 dark:bg-white/5 px-7 py-4 font-semibold text-neutral-900 dark:text-white backdrop-blur transition hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                Join Influstore
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="relative hidden lg:block">
            <div className="relative mx-auto h-[560px] max-w-[430px] rotate-3 overflow-hidden rounded-[40px] border border-neutral-200 dark:border-white/10 bg-white/40 dark:bg-white/5 p-3 shadow-2xl">
              <div className="relative h-full overflow-hidden rounded-[32px]">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1000&q=85"
                  alt="Fashion inspiration"
                  className="h-full w-full object-cover"
                />

                <div className="absolute inset-x-5 bottom-5 rounded-3xl border border-white/20 bg-black/60 p-5 backdrop-blur-xl text-white">
                  <p className="text-xs text-neutral-300">Trending creator</p>
                  <div className="mt-1 flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Maya Carter</h3>
                    <span className="text-pink-400 font-semibold">♥ 24.8K</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -left-12 bottom-24 rounded-2xl border border-neutral-200 dark:border-white/10 bg-white/90 dark:bg-neutral-900/90 p-4 shadow-xl backdrop-blur-xl text-neutral-900 dark:text-white">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">Trending now</p>
              <p className="mt-1 font-semibold">Aura Sneakers</p>
              <p className="mt-1 text-sm font-bold text-fuchsia-500">$89.00</p>
            </div>
          </div>
        </div>
      </section>

      {/* TRENDING */}
      <section className="px-6 py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-500">
                Trending
              </p>

              <h2 className="text-4xl font-bold sm:text-5xl">
                What everyone&apos;s loving.
              </h2>
            </div>

            <Link
              href="/products"
              className="hidden text-sm text-neutral-500 dark:text-neutral-400 transition hover:text-neutral-900 dark:hover:text-white sm:block"
            >
              View all →
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {trendingProducts.map((product) => (
              <Link
                href="/products"
                key={product.name}
                className="group"
              >
                <div className="overflow-hidden rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 shadow-sm transition">
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                  </div>

                  <div className="p-6">
                    <p className="text-xs text-neutral-500">{product.category}</p>

                    <div className="mt-2 flex items-center justify-between">
                      <h3 className="text-lg font-semibold">
                        {product.name}
                      </h3>

                      <span className="font-bold text-neutral-900 dark:text-white">{product.price}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="border-y border-neutral-200 dark:border-neutral-800 px-6 py-32 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-500">
              One platform
            </p>

            <h2 className="text-4xl font-bold sm:text-6xl">
              From inspiration to checkout.
            </h2>
          </div>

          <div className="mt-20 grid gap-12 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="border-t border-neutral-200 dark:border-neutral-800 pt-6"
              >
                <span className="text-xs font-mono text-neutral-400 dark:text-neutral-500">
                  {feature.number}
                </span>

                <h3 className="mt-8 text-2xl font-semibold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-neutral-600 dark:text-neutral-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[40px] bg-gradient-to-br from-fuchsia-500/20 via-purple-500/10 to-orange-400/15 p-10 text-center sm:p-20 border border-fuchsia-500/20">
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-neutral-600 dark:text-neutral-300">
              Your next discovery is waiting
            </p>

            <h2 className="mx-auto mt-6 max-w-3xl text-4xl font-bold sm:text-6xl">
              Ready to find your next obsession?
            </h2>

            <Link
              href="/register"
              className="mt-10 inline-block rounded-full bg-neutral-900 dark:bg-white px-8 py-4 font-semibold text-white dark:text-black transition hover:scale-105 shadow-lg"
            >
              Get Started →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}