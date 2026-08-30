import { z } from "zod";
import { cursorPaginationSchema } from "./pagination.schema";

export const followUsernameParamSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
});

export const followListQuerySchema = cursorPaginationSchema.extend({
  limit: z.coerce.number().int().positive().max(50).default(20),
});

export type FollowListQuery = z.infer<typeof followListQuerySchema>;
