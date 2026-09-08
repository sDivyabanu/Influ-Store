import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ShopPageClient } from "@/components/products/ShopPageClient";
import { listProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Shop | Influ-Store",
  description: "Discover products recommended by creators and loved by the Influstore community.",
};

export default async function ShopPage() {
  const page = await listProducts({});

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-7xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Influstore Shop
          </p>
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
            Shop what inspires you.
          </h1>
          <p className="mt-4 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Discover products recommended by creators and loved by the Influstore community.
          </p>
        </div>

        <ShopPageClient initialProducts={page.items} initialCursor={page.nextCursor} />
      </div>

      <Footer />
    </main>
  );
}
