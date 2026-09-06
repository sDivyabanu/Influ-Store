import { z } from "zod";

export const createPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .max(500, "Caption cannot exceed 500 characters")
    .optional()
    .nullable(),
});

export type CreatePostFormData = z.infer<typeof createPostSchema>;
