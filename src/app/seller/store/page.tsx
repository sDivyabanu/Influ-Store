import { redirect } from "next/navigation";
import Link from "next/link";
import { Store } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StoreSettingsForm } from "@/components/seller/StoreSettingsForm";
import { requireSeller } from "@/lib/auth/seller";
import { getMyStore } from "@/lib/services/seller-profile.service";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "My Store | Influ-Store",
  description: "Set up and manage your storefront.",
};

export default async function SellerStorePage() {
  let user;
  try {
    user = await requireSeller();
  } catch (error) {
    redirect(
      error instanceof AppError && error.status === 401
        ? "/login?callbackUrl=/seller/store"
        : "/seller/apply"
    );
  }

  const store = await getMyStore(user.id);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
              Seller
            </p>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
              My Store
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
              {store
                ? "Update your storefront details, logo, and banner."
                : "Set up your storefront before you can list products."}
            </p>
          </div>
          {store && (
            <Link
              href="/seller/products"
              className="flex items-center gap-2 rounded-full border border-neutral-300 dark:border-neutral-800 bg-white/60 dark:bg-neutral-900/60 px-4 py-2.5 text-sm font-semibold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
            >
              <Store className="h-4 w-4" />
              My Products
            </Link>
          )}
        </div>

        <StoreSettingsForm initialStore={store} />
      </div>

      <Footer />
    </main>
  );
}
