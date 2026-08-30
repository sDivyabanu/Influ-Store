export interface HashtagSegment {
  type: "text" | "hashtag";
  value: string;
}

const HASHTAG_PATTERN = /#([a-zA-Z0-9_]+)/g;

/**
 * Splits caption/comment text into plain-text and hashtag segments for
 * safe rendering (no dangerouslySetInnerHTML).
 */
export function parseHashtagSegments(text: string): HashtagSegment[] {
  const segments: HashtagSegment[] = [];
  let lastIndex = 0;
  const regex = new RegExp(HASHTAG_PATTERN);
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, match.index) });
    }
    segments.push({ type: "hashtag", value: match[0] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }

  return segments;
}

/**
 * Extracts normalized, unique lowercase hashtag names from text (without '#').
 * Example: "Hello #Fashion #summer #FASHION!" -> ["fashion", "summer"]
 */
export function extractHashtags(text: string | null | undefined): string[] {
  if (!text) return [];
  const regex = new RegExp(HASHTAG_PATTERN);
  const tags = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const rawTag = match[1];
    if (rawTag) {
      tags.add(rawTag.toLowerCase());
    }
  }

  return Array.from(tags);
}
