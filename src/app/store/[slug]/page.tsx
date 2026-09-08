import { notFound } from "next/navigation";
import Link from "next/link";
import { ExternalLink, Store as StoreIcon } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductGrid } from "@/components/products/ProductGrid";
import { getStoreBySlug } from "@/lib/services/seller-profile.service";
import { listProducts } from "@/lib/services/product.service";

export const dynamic = "force-dynamic";

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) {
    return { title: "Store not found | Influ-Store" };
  }
  return {
    title: `${store.storeName} | Influ-Store`,
    description: store.description || `Shop ${store.storeName} on Influ-Store.`,
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const store = await getStoreBySlug(slug);
  if (!store) notFound();

  const productsPage = await listProducts({ sellerSlug: slug });

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 pt-20">
        {/* BANNER */}
        <div className="relative h-48 w-full overflow-hidden bg-neutral-200 dark:bg-neutral-900 sm:h-64">
          {store.bannerUrl && (
            <img src={store.bannerUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="mx-auto max-w-6xl px-6 lg:px-10">
          {/* HEADER */}
          <div className="-mt-12 flex flex-col items-start gap-5 sm:flex-row sm:items-end sm:gap-6">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl border-4 border-neutral-50 dark:border-black bg-neutral-100 dark:bg-neutral-900 shadow-lg">
              {store.logoUrl ? (
                <img src={store.logoUrl} alt={store.storeName} className="h-full w-full object-cover" />
              ) : (
                <StoreIcon className="h-8 w-8 text-neutral-400" />
              )}
            </div>

            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                {store.storeName}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-neutral-500 dark:text-neutral-400">
                <span>by @{store.seller.username}</span>
                <span>
                  {store.productCount} product{store.productCount === 1 ? "" : "s"}
                </span>
                {store.website && (
                  <a
                    href={store.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-fuchsia-500 hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Website
                  </a>
                )}
              </div>
            </div>

            <Link
              href={`/profile/${store.seller.username}`}
              className="rounded-full border border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              View profile
            </Link>
          </div>

          {store.description && (
            <p className="mt-6 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {store.description}
            </p>
          )}

          {/* PRODUCTS */}
          <div className="py-10">
            <ProductGrid
              fetchBaseUrl={`/api/products?sellerSlug=${encodeURIComponent(slug)}`}
              initialProducts={productsPage.items}
              initialCursor={productsPage.nextCursor}
              emptyMessage="This store hasn't listed any products yet."
            />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
