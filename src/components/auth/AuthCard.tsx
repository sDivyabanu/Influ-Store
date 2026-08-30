import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

export function AuthCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2 bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      {/* BRAND / HERO PROMO SECTION */}
      <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between p-12 bg-gradient-to-br from-neutral-900 via-black to-neutral-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/20 via-purple-600/10 to-orange-400/10" />
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 blur-[140px]" />

        {/* LOGO */}
        <Link href="/" className="relative text-2xl font-bold tracking-tight">
          Influ<span className="bg-gradient-to-r from-fuchsia-400 to-pink-400 bg-clip-text text-transparent">store</span>
        </Link>

        {/* PROMO CONTENT */}
        <div className="relative max-w-lg">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-400">
            Social Commerce Reimagined
          </p>
          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Discover creators.
            <br />
            <span className="bg-gradient-to-r from-fuchsia-400 via-pink-400 to-orange-300 bg-clip-text text-transparent">
              Share inspiration.
            </span>
            <br />
            Shop seamlessly.
          </h1>
          <p className="mt-6 max-w-md text-base leading-7 text-neutral-400">
            Influ-Store unites Instagram-style discovery with a powerful multi-vendor shopping experience.
          </p>

          <div className="mt-10 flex gap-8 border-t border-white/10 pt-8 text-sm">
            <div>
              <p className="text-2xl font-bold text-white">Phase 1</p>
              <p className="text-xs text-neutral-400 mt-0.5">Foundation & Auth</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Secure</p>
              <p className="text-xs text-neutral-400 mt-0.5">JWT & Password Hash</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Prisma</p>
              <p className="text-xs text-neutral-400 mt-0.5">PostgreSQL / RDS</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <p className="relative text-xs text-neutral-500">
          © 2026 Influstore. All rights reserved.
        </p>
      </section>

      {/* FORM SECTION */}
      <section className="flex items-center justify-center px-6 py-12 lg:px-12">
        <div className={cn("w-full max-w-md", className)}>
          {/* MOBILE LOGO */}
          <Link
            href="/"
            className="mb-8 block text-center text-2xl font-bold tracking-tight lg:hidden"
          >
            Influ<span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">store</span>
          </Link>

          {/* HEADER */}
          <div className="mb-8 text-center sm:text-left">
            <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {title}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {subtitle}
            </p>
          </div>

          {/* CHILDREN / FORM */}
          {children}
        </div>
      </section>
    </div>
  );
}
