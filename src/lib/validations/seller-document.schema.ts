import { z } from "zod";
import { SUPPORTED_DOCUMENT_MIME_TYPES, MAX_DOCUMENT_SIZE_BYTES } from "@/lib/constants/seller";

const documentTypeEnum = z.enum(["IDENTITY_PROOF", "BUSINESS_PROOF", "ADDRESS_PROOF", "OTHER"]);

export const documentUploadRequestSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required").max(255),
  contentType: z.enum(
    SUPPORTED_DOCUMENT_MIME_TYPES as unknown as [string, ...string[]],
    {
      message: `Unsupported file type. Allowed: ${SUPPORTED_DOCUMENT_MIME_TYPES.join(", ")}`,
    }
  ),
  fileSize: z
    .number()
    .int()
    .positive()
    .max(MAX_DOCUMENT_SIZE_BYTES, `File must be ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB or smaller`),
});
export type DocumentUploadRequestInput = z.infer<typeof documentUploadRequestSchema>;

export const registerSellerDocumentSchema = z.object({
  type: documentTypeEnum,
  storageKey: z.string().trim().min(1).max(512),
  originalFilename: z.string().trim().min(1).max(255),
  mimeType: z.enum(SUPPORTED_DOCUMENT_MIME_TYPES as unknown as [string, ...string[]]),
  fileSize: z.number().int().positive().max(MAX_DOCUMENT_SIZE_BYTES),
});
export type RegisterSellerDocumentInput = z.infer<typeof registerSellerDocumentSchema>;
