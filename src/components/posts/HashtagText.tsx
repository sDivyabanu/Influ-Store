import React from "react";
import Link from "next/link";
import { parseHashtagSegments } from "@/lib/utils/hashtags";

/**
 * Renders caption/comment text with clickable hashtag links.
 * Clicking a hashtag navigates to `/hashtag/[tag]`.
 */
export function HashtagText({ text, className }: { text: string; className?: string }) {
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
              className="font-medium text-fuchsia-600 dark:text-fuchsia-400 hover:underline transition hover:text-fuchsia-700 dark:hover:text-fuchsia-300"
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
