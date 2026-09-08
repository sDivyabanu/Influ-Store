import { notFound, redirect } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SellerApplicationReview } from "@/components/admin/SellerApplicationReview";
import { requireAdmin } from "@/lib/auth/admin";
import { getApplicationDetail } from "@/lib/services/admin-seller-application.service";
import { AppError } from "@/lib/errors";

export const dynamic = "force-dynamic";

interface AdminSellerApplicationPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata() {
  return { title: "Review Seller Application | Admin | Influ-Store" };
}

export default async function AdminSellerApplicationPage({ params }: AdminSellerApplicationPageProps) {
  try {
    await requireAdmin();
  } catch (error) {
    redirect(
      error instanceof AppError && error.status === 401
        ? "/login?callbackUrl=/admin/seller-applications"
        : "/home"
    );
  }

  const { id } = await params;
  const application = await getApplicationDetail(id);
  if (!application) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 mx-auto w-full max-w-4xl px-6 py-10 pt-28 lg:px-10">
        <SellerApplicationReview application={application} />
      </div>

      <Footer />
    </main>
  );
}
