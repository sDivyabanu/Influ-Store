import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SellerApplicationPageClient } from "@/components/seller/SellerApplicationPageClient";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyApplication } from "@/lib/services/seller-application.service";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Become a Seller | Influ-Store",
  description: "Apply to become a verified seller on Influ-Store.",
};

export default async function SellerApplyPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?callbackUrl=/seller/apply");
  }

  const application = await getMyApplication(user.id);

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Become a Seller
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Sell on Influ-Store
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Complete a short application and upload verification documents. Our team will review your
            application and let you know the outcome.
          </p>
        </div>

        <SellerApplicationPageClient initialApplication={application} />
      </div>

      <Footer />
    </main>
  );
}
