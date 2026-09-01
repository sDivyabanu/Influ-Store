import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ className, glass = false, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-neutral-200 dark:border-neutral-800/80 bg-white/80 dark:bg-neutral-900/40 p-6 shadow-sm transition-all duration-200",
        glass && "backdrop-blur-xl bg-white/60 dark:bg-black/60",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
