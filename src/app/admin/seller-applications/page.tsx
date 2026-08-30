import { redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SellerApplicationsList } from "@/components/admin/SellerApplicationsList";
import { requireAdmin } from "@/lib/auth/admin";
import { listApplications } from "@/lib/services/admin-seller-application.service";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Seller Applications | Admin | Influ-Store",
  description: "Review and verify pending seller applications.",
};

export default async function AdminSellerApplicationsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    redirect(error instanceof AppError && error.status === 401 ? "/login?callbackUrl=/admin/seller-applications" : "/home");
  }

  const page = await listApplications("PENDING");

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-4xl px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Admin
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Seller Applications
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Review verification documents and approve or reject seller applications.
          </p>
        </div>

        <SellerApplicationsList initialApplications={page.items} initialCursor={page.nextCursor} />
      </div>

      <Footer />
    </main>
  );
}
