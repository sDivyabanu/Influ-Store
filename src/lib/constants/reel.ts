/**
 * Central limits for the Reels video system. Caption length, comment
 * length, and pagination sizes are intentionally reused from
 * lib/constants/post.ts rather than duplicated — only genuinely
 * reel-specific limits live here.
 */

export const SUPPORTED_REEL_MIME_TYPES = ["video/mp4", "video/webm"] as const;
export type SupportedReelMimeType = (typeof SUPPORTED_REEL_MIME_TYPES)[number];

export const MAX_REEL_SIZE_BYTES = 100 * 1024 * 1024; // 100MB

/** Short-form limit, matching common vertical-video conventions. */
export const MAX_REEL_DURATION_SECONDS = 90;

/** Reels are heavier than image posts, so the feed page is smaller. */
export const REELS_FEED_PAGE_SIZE = 6;
export const REEL_GRID_PAGE_SIZE = 24;
