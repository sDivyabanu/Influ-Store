import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductsDashboard } from "@/components/seller/ProductsDashboard";
import { requireSeller } from "@/lib/auth/seller";
import { requireMyStoreId } from "@/lib/services/seller-profile.service";
import { listMyProducts } from "@/lib/services/seller-product.service";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Products | Influ-Store",
  description: "Manage your product catalog.",
};

export default async function SellerProductsPage() {
  let sellerProfileId: string;
  try {
    const user = await requireSeller();
    sellerProfileId = await requireMyStoreId(user.id);
  } catch (error) {
    if (error instanceof AppError && error.status === 401) {
      redirect("/login?callbackUrl=/seller/products");
    }
    if (error instanceof AppError && error.status === 404) {
      redirect("/seller/store");
    }
    redirect("/seller/apply");
  }

  const page = await listMyProducts(sellerProfileId);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-4xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Seller
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            My Products
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Create and manage the products in your storefront.
          </p>
        </div>

        <ProductsDashboard initialProducts={page.items} initialCursor={page.nextCursor} />
      </div>

      <Footer />
    </main>
  );
}
