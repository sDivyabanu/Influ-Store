import { z } from "zod";
import { COMMENT_MAX_LENGTH } from "@/lib/constants/post";

export const createCommentSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(COMMENT_MAX_LENGTH, `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters`),
  parentId: z.string().trim().min(1).optional().nullable(),
});
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
