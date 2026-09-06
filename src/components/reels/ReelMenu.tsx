"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Link2, Pencil, Trash2, Flag } from "lucide-react";
import { useToast } from "@/features/toast/toast-context";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

interface ReelMenuProps {
  reelId: string;
  isOwner: boolean;
  onEdit?: () => void;
  /** Called after a successful delete. If omitted, redirects to /reels. */
  onDeleted?: () => void;
}

/** Mirrors components/posts/PostMenu.tsx, styled for the dark video overlay. */
export function ReelMenu({ reelId, isOwner, onEdit, onDeleted }: ReelMenuProps) {
  const { showToast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function copyLink() {
    setOpen(false);
    const url = `${window.location.origin}/reel/${reelId}`;
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied");
    } catch {
      showToast("Couldn't copy link.", "error");
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/reels/${reelId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to delete reel.");
      }
      setConfirmOpen(false);
      showToast("Reel deleted");
      if (onDeleted) {
        onDeleted();
      } else {
        router.push("/reels");
        router.refresh();
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete reel.", "error");
    } finally {
      setDeleting(false);
    }
  }

  function handleReport() {
    setOpen(false);
    showToast("Reporting will be available in a future update.");
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Reel options"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-48 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-1.5 text-left shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {isOwner && onEdit && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
            >
              <Pencil className="h-4 w-4 text-neutral-500" /> Edit
            </button>
          )}

          <button
            type="button"
            role="menuitem"
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
          >
            <Link2 className="h-4 w-4 text-neutral-500" /> Copy Link
          </button>

          {isOwner ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirmOpen(true);
              }}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            >
              <Trash2 className="h-4 w-4" /> Delete
            </button>
          ) : (
            <button
              type="button"
              role="menuitem"
              onClick={handleReport}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-white/10 transition"
            >
              <Flag className="h-4 w-4 text-neutral-500" /> Report
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        title="Delete this reel?"
        description="This permanently removes the reel, its video, likes, and comments. This can't be undone."
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  );
}
