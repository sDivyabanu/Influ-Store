"use client";

import React from "react";
import { Users, Compass } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface FeedModeTabsProps {
  mode: "following" | "discover";
  onModeChange: (mode: "following" | "discover") => void;
  className?: string;
}

export function FeedModeTabs({
  mode,
  onModeChange,
  className,
}: FeedModeTabsProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 p-1 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80 backdrop-blur-md",
        className
      )}
    >
      <button
        type="button"
        onClick={() => onModeChange("following")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition",
          mode === "following"
            ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        )}
      >
        <Users className="h-3.5 w-3.5" />
        <span>Following</span>
      </button>

      <button
        type="button"
        onClick={() => onModeChange("discover")}
        className={cn(
          "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition",
          mode === "discover"
            ? "bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm"
            : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
        )}
      >
        <Compass className="h-3.5 w-3.5" />
        <span>Discover</span>
      </button>
    </div>
  );
}
