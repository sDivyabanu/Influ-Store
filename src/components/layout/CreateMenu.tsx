"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ImagePlus, Video } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/** Desktop nav "Create" dropdown: choose between a post or a reel. */
export function CreateMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = pathname === "/create-post" || pathname === "/create-reel";

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={cn(
          "flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-medium transition duration-150",
          isActive
            ? "text-neutral-900 dark:text-white font-semibold bg-neutral-100 dark:bg-white/10"
            : "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100/60 dark:hover:bg-white/5"
        )}
      >
        <span>Create</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 w-52 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          <Link
            href="/create-post"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
          >
            <ImagePlus className="h-4 w-4 text-neutral-500" /> Create Post
          </Link>
          <Link
            href="/create-reel"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
          >
            <Video className="h-4 w-4 text-neutral-500" /> Create Reel
          </Link>
        </div>
      )}
    </div>
  );
}
