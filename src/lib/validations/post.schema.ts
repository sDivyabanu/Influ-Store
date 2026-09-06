import { z } from "zod";
import {
  MAX_POST_MEDIA_COUNT,
  MIN_POST_MEDIA_COUNT,
  POST_CAPTION_MAX_LENGTH,
} from "@/lib/constants/post";

export const postMediaInputSchema = z.object({
  key: z.string().trim().min(1, "Media key is required").max(512),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
});

export const captionSchema = z
  .string()
  .trim()
  .max(
    POST_CAPTION_MAX_LENGTH,
    `Caption cannot exceed ${POST_CAPTION_MAX_LENGTH} characters`
  );

export const createPostSchema = z.object({
  caption: captionSchema.optional().or(z.literal("")),
  media: z
    .array(postMediaInputSchema)
    .min(MIN_POST_MEDIA_COUNT, "Add at least one image")
    .max(
      MAX_POST_MEDIA_COUNT,
      `You can add up to ${MAX_POST_MEDIA_COUNT} images per post`
    ),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  caption: captionSchema.nullable(),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
