import { z } from "zod";
import { SUPPORTED_REEL_MIME_TYPES, MAX_REEL_SIZE_BYTES } from "@/lib/constants/reel";

export const reelMediaUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(255),
  contentType: z.enum(
    SUPPORTED_REEL_MIME_TYPES as unknown as [string, ...string[]],
    {
      message: `Unsupported video type. Allowed: ${SUPPORTED_REEL_MIME_TYPES.join(", ")}`,
    }
  ),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_REEL_SIZE_BYTES, `Video must be ${MAX_REEL_SIZE_BYTES / (1024 * 1024)}MB or smaller`),
});
export type ReelMediaUploadRequestInput = z.infer<typeof reelMediaUploadRequestSchema>;
