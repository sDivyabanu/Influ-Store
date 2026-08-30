/**
 * Central limits for the social post system. Shared between client-side
 * forms and server-side validation so the two never drift apart.
 */

export const POST_CAPTION_MAX_LENGTH = 2200;
export const COMMENT_MAX_LENGTH = 1000;

export const MAX_POST_MEDIA_COUNT = 10;
export const MIN_POST_MEDIA_COUNT = 1;

export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB per image

export const FEED_PAGE_SIZE = 10;
export const PROFILE_GRID_PAGE_SIZE = 24;
export const COMMENTS_PAGE_SIZE = 20;
export const REPLIES_PAGE_SIZE = 10;

export const HASHTAG_REGEX = /#([a-zA-Z0-9_]+)/g;
