"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/features/auth/auth-context";
import { useTheme } from "next-themes";
import { User, Bell, Palette, Lock, Sun, Moon, Monitor, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export default function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSavePreferences = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-50 dark:bg-black text-neutral-900 dark:text-white transition-colors">
      <Navbar />

      <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 pt-28 lg:px-10">
        {/* HEADER */}
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-fuchsia-500">
            Account Management
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Manage your account preferences, appearance, and privacy settings.
          </p>
        </div>

        {saved && (
          <div className="mb-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-300">
            ✓ Preferences saved successfully.
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block">
            <nav className="sticky top-28 space-y-1.5">
              <Link
                href="/settings/profile"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 hover:text-neutral-900 dark:hover:text-white transition"
              >
                <User className="h-4 w-4" />
                <span>Edit Profile</span>
              </Link>
              <button
                type="button"
                className="w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 text-left"
              >
                <Lock className="h-4 w-4" />
                <span>General & Account</span>
              </button>
              <a
                href="#notifications"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition"
              >
                <Bell className="h-4 w-4" />
                <span>Notifications</span>
              </a>
              <a
                href="#appearance"
                className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-white/5 transition"
              >
                <Palette className="h-4 w-4" />
                <span>Appearance</span>
              </a>
            </nav>
          </aside>

          {/* SETTINGS SECTIONS */}
          <div className="space-y-8">
            {/* PROFILE QUICK LINK */}
            <Card className="p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-fuchsia-500/20 bg-fuchsia-500/[0.03]">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Public Profile
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Signed in as <span className="font-semibold text-neutral-800 dark:text-neutral-200">@{user?.username}</span> ({user?.email})
                </p>
              </div>

              <Link href="/settings/profile">
                <Button variant="primary" size="sm" className="gap-2 shrink-0">
                  <span>Edit Profile</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </Card>

            {/* APPEARANCE SECTION */}
            <Card id="appearance" className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Appearance & Theme
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Choose how Influ-Store looks across your devices.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition",
                    theme === "light"
                      ? "border-fuchsia-500 bg-fuchsia-500/10 text-neutral-900 dark:text-white font-semibold"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Sun className="h-5 w-5 text-amber-500" />
                  <span className="text-xs">Light</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition",
                    theme === "dark"
                      ? "border-fuchsia-500 bg-fuchsia-500/10 text-neutral-900 dark:text-white font-semibold"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Moon className="h-5 w-5 text-fuchsia-400" />
                  <span className="text-xs">Dark</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition",
                    theme === "system"
                      ? "border-fuchsia-500 bg-fuchsia-500/10 text-neutral-900 dark:text-white font-semibold"
                      : "border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  )}
                >
                  <Monitor className="h-5 w-5 text-neutral-400" />
                  <span className="text-xs">System</span>
                </button>
              </div>
            </Card>

            {/* NOTIFICATIONS SECTION */}
            <Card id="notifications" className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Notification Preferences
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Manage how you receive activity and discovery alerts.
                </p>
              </div>

              <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      In-App Notifications
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Receive alerts when someone interacts with your posts or profile.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={(e) => setPushNotifications(e.target.checked)}
                    className="h-5 w-5 rounded accent-fuchsia-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between py-4">
                  <div>
                    <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                      Email Updates
                    </p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      Weekly roundups of trending styles and products.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailUpdates}
                    onChange={(e) => setEmailUpdates(e.target.checked)}
                    className="h-5 w-5 rounded accent-fuchsia-500 cursor-pointer"
                  />
                </div>
              </div>
            </Card>

            {/* PRIVACY & SECURITY SECTION */}
            <Card className="p-6 sm:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
                  Privacy & Security
                </h2>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Account security and visibility settings.
                </p>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold text-sm text-neutral-900 dark:text-white">
                    Private Profile
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Only approved followers will be able to view your activity.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privateAccount}
                  onChange={(e) => setPrivateAccount(e.target.checked)}
                  className="h-5 w-5 rounded accent-fuchsia-500 cursor-pointer"
                />
              </div>
            </Card>

            {/* SAVE ACTION */}
            <div className="flex justify-end gap-3">
              <Button type="button" onClick={handleSavePreferences}>
                Save Preferences
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}