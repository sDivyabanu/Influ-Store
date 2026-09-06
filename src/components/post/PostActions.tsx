"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

export function PostActions({
  postId,
  authorUsername,
  initialCaption,
}: {
  postId: string;
  authorUsername: string;
  initialCaption: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [caption, setCaption] = useState(initialCaption);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
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

  async function handleSaveEdit() {
    setError("");
    setIsSaving(true);
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to update post.");
        return;
      }

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Failed to update post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete this post? This cannot be undone.");
    if (!confirmed) return;

    setIsDeleting(true);
    setError("");
    try {
      const response = await fetch(`/api/posts/${postId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || "Failed to delete post.");
        setIsDeleting(false);
        return;
      }

      router.push(`/profile/${authorUsername}`);
      router.refresh();
    } catch {
      setError("Failed to delete post. Please try again.");
      setIsDeleting(false);
    }
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          maxLength={500}
          rows={4}
          className="w-full resize-none rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-4 py-3 text-sm text-neutral-900 dark:text-white outline-none focus:border-fuchsia-400"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleSaveEdit}
            disabled={isSaving}
            className="rounded-full bg-neutral-900 dark:bg-white px-4 py-2 text-sm font-semibold text-white dark:text-black transition disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsEditing(false);
              setCaption(initialCaption);
              setError("");
            }}
            disabled={isSaving}
            className="rounded-full border border-neutral-300 dark:border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Post options"
        aria-expanded={isOpen}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 transition hover:bg-neutral-100 dark:hover:bg-white/10"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 shadow-xl z-10">
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              setIsEditing(true);
            }}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
          >
            <Pencil className="h-4 w-4" />
            <span>Edit post</span>
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            <span>{isDeleting ? "Deleting..." : "Delete post"}</span>
          </button>
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
