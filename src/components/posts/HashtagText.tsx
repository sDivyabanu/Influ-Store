import React from "react";
import Link from "next/link";
import { parseHashtagSegments } from "@/lib/utils/hashtags";
import { cn } from "@/lib/utils/cn";

interface HashtagTextProps {
  text: string;
  className?: string;
  /** Overrides hashtag link color/hover — e.g. for the always-dark Reels
   * video overlay, where the default fuchsia-600/400 light/dark pairing
   * doesn't apply (it's not driven by the site theme there). */
  hashtagClassName?: string;
}

/**
 * Renders caption/comment text with clickable hashtag links.
 * Clicking a hashtag navigates to `/hashtag/[tag]`.
 */
export function HashtagText({ text, className, hashtagClassName }: HashtagTextProps) {
  const segments = parseHashtagSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) => {
        if (segment.type === "hashtag") {
          const rawTag = segment.value.replace(/^#/, "").toLowerCase();
          return (
            <Link
              key={index}
              href={`/hashtag/${rawTag}`}
              className={cn(
                "font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:underline transition hover:text-fuchsia-700 dark:hover:text-fuchsia-300",
                hashtagClassName
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {segment.value}
            </Link>
          );
        }
        return <React.Fragment key={index}>{segment.value}</React.Fragment>;
      })}
    </span>
  );
}
