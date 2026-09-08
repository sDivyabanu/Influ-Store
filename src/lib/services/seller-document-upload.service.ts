import { getPrivateDocumentStorageService } from "@/lib/storage";
import { ForbiddenError } from "@/lib/errors";
import { DocumentUploadRequestInput } from "@/lib/validations/seller-document.schema";

/**
 * Every verification document a user uploads lives under this private
 * folder prefix — used to verify, when the document is registered, that
 * a submitted key actually belongs to the authenticated applicant.
 * Mirrors buildPostMediaFolder/buildReelMediaFolder, but rooted under
 * the PRIVATE document storage backend, never the public one.
 */
export function buildSellerDocumentFolder(userId: string): string {
  return `seller-documents/${userId}`;
}

export function assertSellerDocumentKeyOwnedByUser(key: string, userId: string): void {
  const expectedPrefix = `${buildSellerDocumentFolder(userId)}/`;
  if (!key.startsWith(expectedPrefix)) {
    throw new ForbiddenError("This document does not belong to you.");
  }
}

export type SellerDocumentUploadTarget =
  | {
      strategy: "direct";
      uploadUrl: string;
      method: "PUT";
      key: string;
    }
  | {
      strategy: "server";
      uploadUrl: string;
      method: "POST";
    };

/**
 * Decides how the browser should get a document's bytes into PRIVATE
 * storage. Intentionally NOT reusing media-upload-shared.ts: that
 * helper's result type includes a publicUrl, which must never exist for
 * a private document — this mirrors its shape/logic but for the private
 * storage backend, with no public-URL field anywhere in the type.
 */
export async function createSellerDocumentUploadTarget(
  userId: string,
  input: DocumentUploadRequestInput
): Promise<SellerDocumentUploadTarget> {
  const storage = getPrivateDocumentStorageService();
  const folder = buildSellerDocumentFolder(userId);

  const presigned = await storage.createPresignedUploadUrl(input.fileName, input.contentType, {
    folder,
    contentType: input.contentType,
  });

  if (presigned) {
    return {
      strategy: "direct",
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      key: presigned.key,
    };
  }

  return {
    strategy: "server",
    uploadUrl: "/api/seller/documents/local-upload",
    method: "POST",
  };
}
