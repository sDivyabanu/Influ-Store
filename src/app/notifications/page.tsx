"use client";

import Link from "next/link";
import { useState } from "react";

type Notification = {
  id: number;
  type: "like" | "comment" | "follow" | "purchase" | "system";
  user: string;
  message: string;
  time: string;
  read: boolean;
  image?: string;
};

const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "like",
    user: "Maya Carter",
    message: "liked your post",
    time: "5 min ago",
    read: false,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 2,
    type: "comment",
    user: "Alex Morgan",
    message: 'commented: "This looks amazing! ✨"',
    time: "18 min ago",
    read: false,
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 3,
    type: "follow",
    user: "Sofia Lane",
    message: "started following you",
    time: "42 min ago",
    read: false,
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 4,
    type: "purchase",
    user: "Order #IS28491",
    message: "Your order has been confirmed",
    time: "2 hours ago",
    read: true,
  },
  {
    id: 5,
    type: "like",
    user: "Daniel Kim",
    message: "liked your post",
    time: "3 hours ago",
    read: true,
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 6,
    type: "comment",
    user: "Emma Wilson",
    message: "commented on your post",
    time: "5 hours ago",
    read: true,
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 7,
    type: "follow",
    user: "Noah Williams",
    message: "started following you",
    time: "Yesterday",
    read: true,
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    id: 8,
    type: "system",
    user: "Influstore",
    message: "Welcome to the Influstore community!",
    time: "Yesterday",
    read: true,
  },
];

const tabs = ["All", "Likes", "Comments", "Follows", "Orders"];

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications);

  const [activeTab, setActiveTab] = useState("All");

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "All") return true;
    if (activeTab === "Likes") return notification.type === "like";
    if (activeTab === "Comments") return notification.type === "comment";
    if (activeTab === "Follows") return notification.type === "follow";
    if (activeTab === "Orders") return notification.type === "purchase";

    return true;
  });

  const markAsRead = (id: number) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        read: true,
      }))
    );
  };

  const removeNotification = (id: number) => {
    setNotifications((current) =>
      current.filter((notification) => notification.id !== id)
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/85 px-6 py-5 backdrop-blur-xl lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">

          {/* LOGO */}
          <Link href="/" className="text-2xl font-bold">
            Influ<span className="text-fuchsia-400">store</span>
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden items-center gap-8 text-sm md:flex">

            <Link
              href="/home"
              className="text-gray-500 transition hover:text-white"
            >
              Home
            </Link>

            <Link
              href="/explore"
              className="text-gray-500 transition hover:text-white"
            >
              Explore
            </Link>

            <Link
              href="/products"
              className="text-gray-500 transition hover:text-white"
            >
              Shop
            </Link>

            <Link
              href="/notifications"
              className="font-medium text-white"
            >
              Notifications
            </Link>

          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">

            <Link
              href="/cart"
              className="hidden rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm transition hover:bg-white/10 sm:block"
            >
              🛒 Cart
            </Link>

            <Link
              href="/profile"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-orange-400 font-semibold"
            >
              P
            </Link>

          </div>

        </div>
      </nav>

      {/* PAGE */}
      <section className="px-6 py-12 lg:px-10 lg:py-16">

        <div className="mx-auto max-w-4xl">

          {/* HEADER */}
          <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>

              <p className="mb-3 text-sm uppercase tracking-[0.3em] text-fuchsia-400">
                Activity
              </p>

              <div className="flex items-center gap-4">

                <h1 className="text-4xl font-bold sm:text-5xl">
                  Notifications
                </h1>

                {unreadCount > 0 && (
                  <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-fuchsia-500 px-2 text-sm font-bold">
                    {unreadCount}
                  </span>
                )}

              </div>

              <p className="mt-4 text-gray-500">
                Stay updated with everything happening around your account.
              </p>

            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm font-medium text-fuchsia-400 transition hover:text-fuchsia-300"
              >
                Mark all as read
              </button>
            )}

          </div>

          {/* TABS */}
          <div className="mt-10 flex gap-2 overflow-x-auto border-b border-white/10 pb-px">

            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`shrink-0 border-b-2 px-5 py-4 text-sm font-medium transition ${
                  activeTab === tab
                    ? "border-fuchsia-400 text-white"
                    : "border-transparent text-gray-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}

          </div>

          {/* NOTIFICATIONS */}
          <div className="mt-5 space-y-2">

            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (

                <div
                  key={notification.id}
                  onClick={() => markAsRead(notification.id)}
                  className={`group relative flex cursor-pointer gap-4 rounded-2xl border p-5 transition ${
                    notification.read
                      ? "border-transparent bg-white/[0.02] hover:bg-white/[0.05]"
                      : "border-fuchsia-500/10 bg-fuchsia-500/[0.06] hover:bg-fuchsia-500/[0.09]"
                  }`}
                >

                  {/* UNREAD INDICATOR */}
                  {!notification.read && (
                    <div className="absolute left-2 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-fuchsia-400" />
                  )}

                  {/* AVATAR / ICON */}
                  {notification.image ? (
                    <img
                      src={notification.image}
                      alt={notification.user}
                      className="h-12 w-12 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg ${
                        notification.type === "purchase"
                          ? "bg-green-500/10 text-green-400"
                          : "bg-fuchsia-500/10 text-fuchsia-400"
                      }`}
                    >
                      {notification.type === "purchase"
                        ? "✓"
                        : "✦"}
                    </div>
                  )}

                  {/* CONTENT */}
                  <div className="min-w-0 flex-1">

                    <p className="text-sm leading-6 text-gray-300">

                      <span className="font-semibold text-white">
                        {notification.user}
                      </span>{" "}

                      {notification.message}

                    </p>

                    <p className="mt-1 text-xs text-gray-600">
                      {notification.time}
                    </p>

                  </div>

                  {/* REMOVE */}
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      removeNotification(notification.id);
                    }}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-700 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:opacity-100"
                    aria-label="Remove notification"
                  >
                    ×
                  </button>

                </div>

              ))
            ) : (

              /* EMPTY STATE */
              <div className="rounded-3xl border border-white/10 py-24 text-center">

                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-2xl">
                  ✦
                </div>

                <h2 className="mt-6 text-xl font-semibold">
                  Nothing here yet
                </h2>

                <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                  You don't have any notifications in this category.
                  Check back later for new activity.
                </p>

              </div>

            )}

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 px-6 py-10 lg:px-10">

        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-gray-600 sm:flex-row">

          <p>
            Influ<span className="text-fuchsia-400">store</span>
          </p>

          <p>
            Discover. Influence. Shop.
          </p>

          <p>
            © 2026 Influstore
          </p>

        </div>

      </footer>

    </main>
  );
}