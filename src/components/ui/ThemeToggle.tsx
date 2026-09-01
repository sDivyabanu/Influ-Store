"use client";

import React, { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils/cn";

function subscribe() {
  return () => {};
}

function getSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isMounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isMounted) {
    return (
      <div
        className={cn(
          "h-10 w-10 rounded-full border border-neutral-300 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/60",
          className
        )}
      />
    );
  }

  const cycleTheme = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  return (
    <button
      type="button"
      onClick={cycleTheme}
      title={`Current theme: ${theme || "system"}. Click to toggle.`}
      aria-label="Toggle theme"
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-neutral-300 dark:border-neutral-800/80 bg-neutral-100/80 dark:bg-neutral-900/80 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition hover:scale-105 active:scale-95 cursor-pointer",
        className
      )}
    >
      {theme === "dark" ? (
        <Moon className="h-4 w-4 text-fuchsia-400" />
      ) : theme === "light" ? (
        <Sun className="h-4 w-4 text-amber-500" />
      ) : (
        <Monitor className="h-4 w-4 text-neutral-400" />
      )}
    </button>
  );
}
