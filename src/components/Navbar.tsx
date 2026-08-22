"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* LOGO */}
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight text-white"
        >
          Influ<span className="text-fuchsia-400">store</span>
        </Link>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center gap-7 md:flex">

          <Link
            href="/home"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Feed
          </Link>

          <Link
            href="/explore"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Explore
          </Link>

          <Link
            href="/products"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Shop
          </Link>

          <Link
            href="/create-post"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Create
          </Link>

          <Link
            href="/notifications"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Notifications
          </Link>

        </div>

        {/* DESKTOP ACTIONS */}
        <div className="hidden items-center gap-3 md:flex">

          {/* PROFILE */}
          <Link
            href="/profile"
            className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 text-xs font-bold">
              P
            </span>

            Profile
          </Link>

          {/* SETTINGS */}
          <Link
            href="/settings"
            aria-label="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-lg text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            ⚙
          </Link>

          {/* LOGIN */}
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Log in
          </Link>

          {/* REGISTER */}
          <Link
            href="/register"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-105 hover:bg-gray-100"
          >
            Register
          </Link>

        </div>

        {/* MOBILE MENU BUTTON */}
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white transition hover:bg-white/10 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? "✕" : "☰"}
        </button>

      </div>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black/95 px-6 py-6 backdrop-blur-xl md:hidden">

          <div className="flex flex-col gap-2">

            {/* FEED */}
            <Link
              href="/home"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Feed
            </Link>

            {/* EXPLORE */}
            <Link
              href="/explore"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Explore
            </Link>

            {/* SHOP */}
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Shop
            </Link>

            {/* CREATE */}
            <Link
              href="/create-post"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Create Post
            </Link>

            {/* NOTIFICATIONS */}
            <Link
              href="/notifications"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Notifications
            </Link>

            {/* PROFILE */}
            <Link
              href="/profile"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Profile
            </Link>

            {/* SETTINGS */}
            <Link
              href="/settings"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              ⚙ Settings
            </Link>

            <div className="my-3 h-px bg-white/10" />

            {/* LOGIN */}
            <Link
              href="/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl px-4 py-3 text-gray-300 transition hover:bg-white/5 hover:text-white"
            >
              Log in
            </Link>

            {/* REGISTER */}
            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="mt-2 rounded-full bg-white px-5 py-3 text-center font-semibold text-black transition hover:bg-gray-100"
            >
              Get Started
            </Link>

          </div>

        </div>
      )}
    </nav>
  );
}