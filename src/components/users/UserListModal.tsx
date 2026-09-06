"use client";

import React, { useEffect, useState } from "react";
import { UserCard } from "@/components/users/UserCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { UserCardItem } from "@/types/follow";
import { X, Users, Loader2 } from "lucide-react";

export interface UserListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  username: string;
  type: "followers" | "following";
}

export function UserListModal({
  isOpen,
  onClose,
  title,
  username,
  type,
}: UserListModalProps) {
  const [users, setUsers] = useState<UserCardItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    async function loadInitial() {
      if (!isOpen) return;

      setIsLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams({ limit: "15" });
        const res = await fetch(`/api/users/${username}/${type}?${queryParams.toString()}`);
        const data = await res.json();

        if (!ignore) {
          if (res.ok && data.success) {
            setUsers(data.items);
            setNextCursor(data.nextCursor);
          } else {
            setError(data.message || `Failed to load ${type}.`);
          }
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Something went wrong.");
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    loadInitial();

    return () => {
      ignore = true;
    };
  }, [isOpen, username, type]);

  const handleLoadMore = async () => {
    if (!nextCursor || isLoadingMore) return;
    setIsLoadingMore(true);

    try {
      const queryParams = new URLSearchParams({ limit: "15", cursor: nextCursor });
      const res = await fetch(`/api/users/${username}/${type}?${queryParams.toString()}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setUsers((prev) => [...prev, ...data.items]);
        setNextCursor(data.nextCursor);
      }
    } catch {
      // Handled
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* MODAL DIALOG */}
      <div className="relative w-full max-w-lg rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-fuchsia-500" />
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3 p-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="py-12 text-center text-sm text-red-500">
              <p>{error}</p>
              <Button size="sm" variant="outline" className="mt-3" onClick={() => {}}>
                Try Again
              </Button>
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center text-neutral-500 dark:text-neutral-400 space-y-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
                <Users className="h-6 w-6" />
              </div>
              <p className="font-semibold text-neutral-900 dark:text-white">
                {type === "followers" ? "No followers yet" : "Not following anyone yet"}
              </p>
              <p className="text-xs max-w-xs mx-auto">
                {type === "followers"
                  ? `@${username} doesn't have any followers yet.`
                  : `@${username} isn't following any accounts yet.`}
              </p>
            </div>
          ) : (
            <>
              {users.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  showBio={false}
                  showCounts={false}
                  onFollowChange={(isFollowing) => {
                    setUsers((prev) =>
                      prev.map((u) => (u.id === user.id ? { ...u, isFollowing } : u))
                    );
                  }}
                />
              ))}

              {nextCursor && (
                <div className="pt-2 text-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLoadMore}
                    disabled={isLoadingMore}
                    className="w-full"
                  >
                    {isLoadingMore ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
