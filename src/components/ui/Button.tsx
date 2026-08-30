"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500/50 disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer";

    const variants = {
      primary:
        "bg-white text-black hover:bg-neutral-200 dark:bg-white dark:text-black dark:hover:bg-neutral-200 shadow-sm active:scale-[0.98]",
      secondary:
        "bg-neutral-800 text-white hover:bg-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700 border border-neutral-700/50",
      outline:
        "border border-neutral-300 dark:border-neutral-800 bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/80 text-neutral-900 dark:text-neutral-100",
      ghost:
        "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white",
      danger:
        "bg-red-600 text-white hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 focus-visible:ring-red-500",
    };

    const sizes = {
      sm: "h-9 px-3.5 text-xs rounded-xl gap-1.5",
      md: "h-11 px-5 text-sm rounded-2xl gap-2",
      lg: "h-13 px-7 text-base rounded-2xl gap-2.5",
      icon: "h-10 w-10 rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
