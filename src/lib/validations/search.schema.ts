import { z } from "zod";
import { cursorPaginationSchema } from "./pagination.schema";

export const searchQuerySchema = cursorPaginationSchema.extend({
  q: z
    .string()
    .trim()
    .min(1, "Search query cannot be empty")
    .max(100, "Search query is too long"),
  type: z.enum(["all", "users", "posts", "reels", "hashtags"]).default("all"),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export const hashtagParamSchema = z.object({
  tag: z
    .string()
    .trim()
    .min(1, "Hashtag cannot be empty")
    .max(50, "Hashtag is too long")
    .transform((val) => val.replace(/^#/, "").toLowerCase()),
});

export const exploreQuerySchema = cursorPaginationSchema.extend({
  category: z.string().trim().max(50).optional(),
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;
export type ExploreQueryInput = z.infer<typeof exploreQuerySchema>;
