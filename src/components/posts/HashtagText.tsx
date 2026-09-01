import React from "react";
import { parseHashtagSegments } from "@/lib/utils/hashtags";

/**
 * Renders caption/comment text with hashtags visually distinguished.
 * Hashtags aren't links yet — full hashtag search/navigation is Phase 3 —
 * but they're already parsed as discrete segments so Phase 3 can wrap
 * them in a Link without touching this component's callers.
 */
export function HashtagText({ text, className }: { text: string; className?: string }) {
  const segments = parseHashtagSegments(text);

  return (
    <span className={className}>
      {segments.map((segment, index) =>
        segment.type === "hashtag" ? (
          <span key={index} className="font-medium text-fuchsia-600 dark:text-fuchsia-400">
            {segment.value}
          </span>
        ) : (
          <React.Fragment key={index}>{segment.value}</React.Fragment>
        )
      )}
    </span>
  );
}
