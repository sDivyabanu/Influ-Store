import { z } from "zod";
import { ALLOWED_STORE_IMAGE_MIME_TYPES, MAX_STORE_IMAGE_SIZE_BYTES } from "@/lib/constants/store";

export const storeMediaUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(255),
  contentType: z.enum(
    ALLOWED_STORE_IMAGE_MIME_TYPES as unknown as [string, ...string[]],
    { message: `Unsupported image type. Allowed: ${ALLOWED_STORE_IMAGE_MIME_TYPES.join(", ")}` }
  ),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_STORE_IMAGE_SIZE_BYTES, `Image must be ${MAX_STORE_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller`),
});
export type StoreMediaUploadRequestInput = z.infer<typeof storeMediaUploadRequestSchema>;
