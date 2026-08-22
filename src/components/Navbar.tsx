"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/70 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight text-white">
          Influ<span className="text-fuchsia-400">store</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-8 md:flex">
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
            href="/home"
            className="text-sm text-gray-300 transition hover:text-white"
          >
            Feed
          </Link>
        </div>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="rounded-full px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition hover:scale-105"
          >
            Register
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-white md:hidden"
          aria-label="Toggle menu"
        >
          ☰
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="border-t border-white/10 bg-black px-6 py-6 md:hidden">
          <div className="flex flex-col gap-5">
            <Link href="/explore" onClick={() => setMenuOpen(false)}>
              Explore
            </Link>

            <Link href="/products" onClick={() => setMenuOpen(false)}>
              Shop
            </Link>

            <Link href="/home" onClick={() => setMenuOpen(false)}>
              Feed
            </Link>

            <Link href="/login" onClick={() => setMenuOpen(false)}>
              Log in
            </Link>

            <Link
              href="/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-full bg-white px-5 py-3 text-center font-semibold text-black"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}