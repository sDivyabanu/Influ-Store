import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { StoreIcon } from "lucide-react";

export default function StoreNotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-6 py-24 pt-32">
        <div className="mx-auto max-w-md text-center space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-900 text-neutral-400">
            <StoreIcon className="h-10 w-10" />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Store not found
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              This storefront doesn&apos;t exist or may no longer be available.
            </p>
          </div>

          <div className="flex justify-center gap-3 pt-2">
            <Link href="/products">
              <Button variant="primary">Browse the shop</Button>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
