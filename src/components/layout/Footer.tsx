import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-neutral-200 dark:border-neutral-800/80 bg-white/40 dark:bg-black/40 px-6 py-10 lg:px-10 transition-colors">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div>
          <Link
            href="/"
            className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white"
          >
            Influ<span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">store</span>
          </Link>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Discover. Influence. Shop.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-6 text-sm text-neutral-500 dark:text-neutral-400">
          <span>Phase 1: Foundation & Auth</span>
          <span>·</span>
          <span>© 2026 Influstore. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
