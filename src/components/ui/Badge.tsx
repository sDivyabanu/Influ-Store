import React from "react";
import { cn } from "@/lib/utils/cn";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "warning";
}

export function Badge({
  className,
  variant = "primary",
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary:
      "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-300",
    secondary:
      "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    outline:
      "border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 bg-transparent",
    success:
      "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-300",
    warning:
      "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-300",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
