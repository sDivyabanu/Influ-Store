import React from "react";
import { cn } from "@/lib/utils/cn";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800", className)}
      {...props}
    />
  );
}
