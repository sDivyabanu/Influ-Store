import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { EditProfileForm } from "@/components/profile/EditProfileForm";
import Link from "next/link";
import { User, Bell, Shield, Palette, Lock, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Edit Profile | Influ-Store Settings",
  description: "Update your profile details, avatar, bio, and username.",
};

export default function EditProfilePage() {
  const sidebarLinks = [
    { href: "/settings/profile", label: "Edit Profile", icon: User, active: true },
    { href: "/settings", label: "General & Account", icon: Lock, active: false },
    { href: "/settings#notifications", label: "Notifications", icon: Bell, active: false },
    { href: "/settings#privacy", label: "Privacy & Security", icon: Shield, active: false },
    { href: "/settings#appearance", label: "Appearance", icon: Palette, active: false },
  ];

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-10 pt-28 lg:px-10">
        {/* HEADER */}
        <div className="mb-8">
          <Link
            href="/settings"
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-white mb-3 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Settings</span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Edit Profile
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Customize how your public profile appears to other users and shoppers.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* SETTINGS NAVIGATION SIDEBAR */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-1.5">
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition ${
                      item.active
                        ? "bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 font-semibold"
                        : "text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>

          {/* EDIT PROFILE FORM CONTENT */}
          <div>
            <EditProfileForm />
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
