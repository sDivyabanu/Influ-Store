import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ProductForm } from "@/components/seller/ProductForm";
import { requireSeller } from "@/lib/auth/seller";
import { requireMyStoreId } from "@/lib/services/seller-profile.service";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "New Product | Influ-Store",
  description: "Add a new product to your storefront.",
};

export default async function NewProductPage() {
  try {
    const user = await requireSeller();
    await requireMyStoreId(user.id);
  } catch (error) {
    if (error instanceof AppError && error.status === 401) {
      redirect("/login?callbackUrl=/seller/products/new");
    }
    if (error instanceof AppError && error.status === 404) {
      redirect("/seller/store");
    }
    redirect("/seller/apply");
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-5xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Seller
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            New Product
          </h1>
        </div>

        <ProductForm />
      </div>

      <Footer />
    </main>
  );
}
