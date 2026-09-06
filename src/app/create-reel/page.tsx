import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CreateReelForm } from "@/components/reels/CreateReelForm";

export const metadata = {
  title: "Create Reel | Influ-Store",
  description: "Share short-form video with the Influ-Store community.",
};

export default function CreateReelPage() {
  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 pt-28 lg:px-10">
        <div className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-fuchsia-500">
            Creator Studio
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Create a reel
          </h1>
          <p className="mt-2 max-w-xl text-sm text-neutral-500 dark:text-neutral-400">
            Share short-form video with the Influ-Store community.
          </p>
        </div>

        <CreateReelForm />
      </div>

      <Footer />
    </main>
  );
}
