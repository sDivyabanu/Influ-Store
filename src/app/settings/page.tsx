"use client";

import Link from "next/link";
import { useState } from "react";

export default function SettingsPage() {
  const [notifications, setNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [privateAccount, setPrivateAccount] = useState(false);
  const [showActivity, setShowActivity] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm text-gray-400 md:flex">
            <Link
              href="/home"
              className="transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="transition hover:text-white"
            >
              Explore
            </Link>

            <Link
              href="/products"
              className="transition hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/create-post"
              className="transition hover:text-white"
            >
              Create
            </Link>

            <Link
              href="/profile"
              className="transition hover:text-white"
            >
              Profile
            </Link>
          </div>

          <Link
            href="/profile"
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10"
          >
            My Profile
          </Link>

        </div>
      </nav>

      {/* CONTENT */}
      <section className="px-6 py-12 lg:px-10">
        <div className="mx-auto max-w-5xl">

          {/* HEADER */}
          <div className="mb-10">
            <p className="mb-3 text-sm font-medium uppercase tracking-[0.3em] text-fuchsia-400">
              Account
            </p>

            <h1 className="text-4xl font-bold sm:text-5xl">
              Settings
            </h1>

            <p className="mt-3 text-gray-400">
              Manage your account, privacy and notification preferences.
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {saved && (
            <div className="mb-8 rounded-2xl border border-green-400/20 bg-green-400/10 px-5 py-4 text-sm text-green-300">
              ✓ Your settings have been saved successfully.
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[220px_1fr]">

            {/* SIDEBAR */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-2">

                <button className="w-full rounded-xl bg-fuchsia-400/10 px-4 py-3 text-left text-sm font-medium text-fuchsia-400">
                  General
                </button>

                <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-white/5 hover:text-white">
                  Notifications
                </button>

                <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-white/5 hover:text-white">
                  Privacy
                </button>

                <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-white/5 hover:text-white">
                  Appearance
                </button>

                <button className="w-full rounded-xl px-4 py-3 text-left text-sm text-gray-500 transition hover:bg-white/5 hover:text-white">
                  Security
                </button>

              </div>
            </aside>

            {/* SETTINGS */}
            <div className="space-y-8">

              {/* ACCOUNT */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Account
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Manage your basic account information.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Full name
                    </label>

                    <input
                      id="name"
                      type="text"
                      defaultValue="Priyadharshini"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="username"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Username
                    </label>

                    <input
                      id="username"
                      type="text"
                      defaultValue="@priya"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-medium text-gray-300"
                    >
                      Email address
                    </label>

                    <input
                      id="email"
                      type="email"
                      defaultValue="you@example.com"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-white outline-none placeholder:text-gray-600 focus:border-fuchsia-400/50"
                    />
                  </div>

                </div>

              </section>

              {/* NOTIFICATIONS */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Notifications
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Choose how Influstore keeps you updated.
                  </p>
                </div>

                <div className="divide-y divide-white/10">

                  <SettingToggle
                    title="Push notifications"
                    description="Receive notifications about likes, follows and activity."
                    enabled={notifications}
                    onChange={() => setNotifications(!notifications)}
                  />

                  <SettingToggle
                    title="Email notifications"
                    description="Receive important account and activity updates by email."
                    enabled={emailNotifications}
                    onChange={() =>
                      setEmailNotifications(!emailNotifications)
                    }
                  />

                  <SettingToggle
                    title="Marketing emails"
                    description="Receive product recommendations, offers and trends."
                    enabled={marketingEmails}
                    onChange={() =>
                      setMarketingEmails(!marketingEmails)
                    }
                  />

                </div>

              </section>

              {/* PRIVACY */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Privacy
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Control how other people interact with your profile.
                  </p>
                </div>

                <div className="divide-y divide-white/10">

                  <SettingToggle
                    title="Private account"
                    description="Only approved followers can see your posts."
                    enabled={privateAccount}
                    onChange={() =>
                      setPrivateAccount(!privateAccount)
                    }
                  />

                  <SettingToggle
                    title="Show activity status"
                    description="Allow others to see when you are active."
                    enabled={showActivity}
                    onChange={() =>
                      setShowActivity(!showActivity)
                    }
                  />

                </div>

              </section>

              {/* APPEARANCE */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Appearance
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Customize how Influstore looks for you.
                  </p>
                </div>

                <SettingToggle
                  title="Dark mode"
                  description="Use Influstore's dark interface."
                  enabled={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />

              </section>

              {/* SECURITY */}
              <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">

                <div className="mb-7">
                  <h2 className="text-xl font-semibold">
                    Security
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Protect your Influstore account.
                  </p>
                </div>

                <div className="space-y-4">

                  <button
                    type="button"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-left transition hover:bg-white/10"
                  >
                    <p className="font-medium">
                      Change password
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Update your account password.
                    </p>
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-2xl border border-red-400/10 bg-red-400/5 px-5 py-4 text-left transition hover:bg-red-400/10"
                  >
                    <p className="font-medium text-red-400">
                      Delete account
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Permanently delete your Influstore account and data.
                    </p>
                  </button>

                </div>

              </section>

              {/* SAVE */}
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  className="rounded-2xl border border-white/10 bg-white/5 px-7 py-4 font-medium transition hover:bg-white/10"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-2xl bg-white px-7 py-4 font-semibold text-black transition hover:scale-[1.01] hover:bg-gray-100"
                >
                  Save changes
                </button>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-5xl flex-col justify-between gap-3 text-sm text-gray-600 sm:flex-row">
          <p>© 2026 Influstore</p>

          <p>
            Discover. Influence. Shop.
          </p>
        </div>
      </footer>

    </main>
  );
}


/* TOGGLE COMPONENT */

function SettingToggle({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-5">

      <div>
        <p className="font-medium text-white">
          {title}
        </p>

        <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        aria-label={`Toggle ${title}`}
        aria-pressed={enabled}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          enabled
            ? "bg-fuchsia-500"
            : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>

    </div>
  );
}