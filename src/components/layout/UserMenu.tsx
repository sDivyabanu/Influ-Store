"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/features/auth/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { User, Settings, LogOut, Moon, Sun, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export function UserMenu() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const displayName = user.profile?.displayName || user.username;
  const avatarUrl = user.profile?.avatarUrl;

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:ring-2 hover:ring-fuchsia-500/40 focus:outline-none"
        aria-expanded={isOpen}
        aria-label="User menu"
      >
        <Avatar
          src={avatarUrl}
          name={displayName}
          size="sm"
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-64 rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 p-2 shadow-2xl backdrop-blur-xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* USER INFO HEADER */}
          <div className="border-b border-neutral-200 dark:border-neutral-800 px-4 py-3">
            <p className="font-semibold text-neutral-900 dark:text-white truncate">
              {displayName}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
              @{user.username}
            </p>
            {user.profile?.accountType === "INFLUENCER" && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-fuchsia-500 dark:text-fuchsia-400">
                <Sparkles className="h-3 w-3" /> Creator Account
              </span>
            )}
          </div>

          {/* MENU ITEMS */}
          <div className="py-2 space-y-1">
            <Link
              href={`/profile/${user.username}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
            >
              <User className="h-4 w-4 text-neutral-500" />
              <span>Profile</span>
            </Link>

            <Link
              href="/settings/profile"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
            >
              <Settings className="h-4 w-4 text-neutral-500" />
              <span>Edit Profile</span>
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center justify-between rounded-2xl px-4 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition text-left"
            >
              <div className="flex items-center gap-3">
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 text-neutral-500" />
                ) : (
                  <Sun className="h-4 w-4 text-neutral-500" />
                )}
                <span>Appearance</span>
              </div>
              <span className="text-xs text-neutral-400 capitalize">
                {theme || "system"}
              </span>
            </button>
          </div>

          {/* LOGOUT */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 pt-1">
            <button
              type="button"
              onClick={logout}
              className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
