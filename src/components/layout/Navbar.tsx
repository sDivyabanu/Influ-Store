"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/features/auth/auth-context";
import { UserMenu } from "@/components/layout/UserMenu";
import { CreateMenu } from "@/components/layout/CreateMenu";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Menu, X, Home, Compass, Search, ShoppingBag, Bell, LogIn, UserPlus, ImagePlus, Video, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface NavLinkDef {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string | null;
}

function isNavLinkActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/home" && pathname.startsWith(href));
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // "Create" renders as a dropdown (CreateMenu) rather than a plain link —
  // spliced into this position when rendering the desktop nav below.
  const navLinks: NavLinkDef[] = [
    { href: "/home", label: "Feed", icon: Home, badge: null },
    { href: "/reels", label: "Reels", icon: Clapperboard, badge: null },
    { href: "/explore", label: "Explore", icon: Compass, badge: null },
    { href: "/search", label: "Search", icon: Search, badge: null },
    { href: "/products", label: "Shop", icon: ShoppingBag, badge: "Soon" },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: "Soon" },
  ];
  const createMenuIndex = 5; // after "Shop", before "Notifications"

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/80 dark:bg-black/80 backdrop-blur-xl transition-colors">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">
        {/* LOGO */}
        <Link
          href="/"
          className="flex items-center gap-1 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white"
        >
          Influ<span className="bg-gradient-to-r from-fuchsia-500 to-pink-500 bg-clip-text text-transparent">store</span>
        </Link>

        {/* DESKTOP NAVIGATION LINKS */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link, index) => {
            const isActive = isNavLinkActive(pathname, link.href);
            return (
              <React.Fragment key={link.href}>
                {index === createMenuIndex && <CreateMenu />}
                <Link
                  href={link.href}
                  className={cn(
                    "relative flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition duration-150",
                    isActive
                      ? "text-neutral-900 dark:text-white font-semibold bg-neutral-100 dark:bg-white/10"
                      : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/5"
                  )}
                >
                  <span>{link.label}</span>
                  {link.badge && (
                    <span className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-1.5 py-0.5 text-[10px] font-semibold text-neutral-500 dark:text-neutral-400">
                      {link.badge}
                    </span>
                  )}
                </Link>
              </React.Fragment>
            );
          })}
        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-800/80 bg-neutral-100/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition hover:scale-105"
          >
            <Search className="h-4 w-4" />
          </Link>

          <ThemeToggle />

          {isLoading ? (
            <div className="h-10 w-24 rounded-full bg-neutral-200 dark:bg-neutral-800 animate-pulse" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={`/profile/${user.username}`}
                className="flex items-center gap-2 rounded-full border border-neutral-300 dark:border-white/10 bg-neutral-100 dark:bg-white/5 px-4 py-2 text-sm font-medium text-neutral-900 dark:text-white transition hover:bg-neutral-200 dark:hover:bg-white/10"
              >
                <span className="truncate max-w-[120px]">
                  @{user.username}
                </span>
              </Link>

              <UserMenu />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-full px-4 py-2.5 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition hover:bg-neutral-100 dark:hover:bg-white/10"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-neutral-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-black transition hover:scale-105 active:scale-95 shadow-sm"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/search"
            aria-label="Search"
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300"
          >
            <Search className="h-4 w-4" />
          </Link>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white transition"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="border-t border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-950/95 px-6 py-6 backdrop-blur-2xl md:hidden animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between rounded-2xl px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-neutral-500" />
                    <span className="font-medium">{link.label}</span>
                  </div>
                  {link.badge && (
                    <span className="rounded-full bg-neutral-200 dark:bg-neutral-800 px-2 py-0.5 text-xs text-neutral-500">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}

            <Link
              href="/create-post"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <ImagePlus className="h-5 w-5 text-neutral-500" />
              <span className="font-medium">Create Post</span>
            </Link>
            <Link
              href="/create-reel"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10 hover:text-neutral-900 dark:hover:text-white transition"
            >
              <Video className="h-5 w-5 text-neutral-500" />
              <span className="font-medium">Create Reel</span>
            </Link>

            <div className="my-2 h-px bg-neutral-200 dark:bg-neutral-800" />

            {isAuthenticated && user ? (
              <>
                <Link
                  href={`/profile/${user.username}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-900 dark:text-white font-medium hover:bg-neutral-100 dark:hover:bg-white/10"
                >
                  <span>My Profile (@{user.username})</span>
                </Link>
                <Link
                  href="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10"
                >
                  <span>Saved Posts</span>
                </Link>
                <Link
                  href="/settings/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-4 py-3 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-white/10"
                >
                  <span>Settings</span>
                </Link>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-neutral-300 dark:border-neutral-800 px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white hover:bg-neutral-100 dark:hover:bg-white/5"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Log in</span>
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 dark:bg-white px-4 py-3 text-sm font-semibold text-white dark:text-black"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Create Account</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
