import { z } from "zod";
import {
  MAX_POST_MEDIA_COUNT,
  MIN_POST_MEDIA_COUNT,
  POST_CAPTION_MAX_LENGTH,
} from "@/lib/constants/post";
import { MAX_PRODUCT_TAGS_PER_CONTENT } from "@/lib/constants/product";

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

export const productTagIdsSchema = z
  .array(z.string().trim().min(1))
  .max(MAX_PRODUCT_TAGS_PER_CONTENT, `You can tag up to ${MAX_PRODUCT_TAGS_PER_CONTENT} products`);

export const createPostSchema = z.object({
  caption: captionSchema.optional().or(z.literal("")),
  media: z
    .array(postMediaInputSchema)
    .min(MIN_POST_MEDIA_COUNT, "Add at least one image")
    .max(
      MAX_POST_MEDIA_COUNT,
      `You can add up to ${MAX_POST_MEDIA_COUNT} images per post`
    ),
  productIds: productTagIdsSchema.optional(),
});
export type CreatePostInput = z.infer<typeof createPostSchema>;

export const updatePostSchema = z.object({
  caption: captionSchema.nullable().optional(),
  productIds: productTagIdsSchema.optional(),
});
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
