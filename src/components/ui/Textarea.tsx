"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  charCount?: number;
  maxCharCount?: number;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      charCount,
      maxCharCount,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400"
            >
              {label}
            </label>
          )}

          {maxCharCount !== undefined && charCount !== undefined && (
            <span
              className={cn(
                "text-xs text-neutral-400 dark:text-neutral-500",
                charCount > maxCharCount && "text-red-500 font-semibold"
              )}
            >
              {charCount}/{maxCharCount}
            </span>
          )}
        </div>

        <textarea
          id={inputId}
          ref={ref}
          className={cn(
            "w-full min-h-[100px] rounded-2xl border border-neutral-300 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/80 p-4 text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 outline-none transition duration-200 backdrop-blur-sm focus:border-fuchsia-500/80 focus:ring-2 focus:ring-fuchsia-500/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error &&
              "border-red-500 dark:border-red-500/80 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />

        {error && (
          <p className="text-xs text-red-500 dark:text-red-400">{error}</p>
        )}
        {!error && helperText && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
