import { z } from "zod";
import { captionSchema, productTagIdsSchema } from "@/lib/validations/post.schema";
import { MAX_REEL_DURATION_SECONDS } from "@/lib/constants/reel";

export const createReelSchema = z.object({
  caption: captionSchema.optional().or(z.literal("")),
  mediaKey: z.string().trim().min(1, "A video is required").max(512),
  thumbnailKey: z.string().trim().min(1).max(512).optional().nullable(),
  // Client-reported; see reel.service.ts for why this isn't treated as
  // an authoritative security boundary until real media probing exists.
  duration: z.number().int().positive().max(MAX_REEL_DURATION_SECONDS).optional(),
  width: z.number().int().positive().max(20000).optional(),
  height: z.number().int().positive().max(20000).optional(),
  productIds: productTagIdsSchema.optional(),
});
export type CreateReelInput = z.infer<typeof createReelSchema>;

export const updateReelSchema = z.object({
  caption: captionSchema.nullable().optional(),
  productIds: productTagIdsSchema.optional(),
});
export type UpdateReelInput = z.infer<typeof updateReelSchema>;
