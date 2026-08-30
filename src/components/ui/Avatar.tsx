"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils/cn";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
}

export function Avatar({
  src,
  alt,
  name = "User",
  size = "md",
  className,
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-2xl",
    "2xl": "h-28 w-28 text-3xl sm:h-36 sm:w-36 sm:text-4xl",
  };

  const initial = name.trim().charAt(0).toUpperCase() || "U";

  return (
    <div
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-bold select-none p-[2px] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400",
        sizes[size],
        className
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-full bg-neutral-900 flex items-center justify-center text-white">
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="font-semibold">{initial}</span>
        )}
      </div>
    </div>
  );
}
