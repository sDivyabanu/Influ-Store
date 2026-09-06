import { getStorageService } from "@/lib/storage";

export type MediaUploadTarget =
  | {
      strategy: "direct";
      uploadUrl: string;
      method: "PUT";
      key: string;
      publicUrl: string;
    }
  | {
      strategy: "server";
      uploadUrl: string;
      method: "POST";
    };

/**
 * Shared by post-media and reel-media upload flows: asks the active
 * storage backend for a presigned direct-upload URL, falling back to a
 * server upload route when the backend doesn't support one (see
 * storage/index.ts). Callers just supply their own folder prefix and
 * server-fallback route; the strategy resolution logic lives here once.
 */
export async function createMediaUploadTarget(
  folder: string,
  fileName: string,
  contentType: string,
  serverUploadUrl: string
): Promise<MediaUploadTarget> {
  const storage = getStorageService();
  const presigned = await storage.createPresignedUploadUrl(fileName, contentType, {
    folder,
    contentType,
  });

  if (presigned) {
    return {
      strategy: "direct",
      uploadUrl: presigned.uploadUrl,
      method: presigned.method,
      key: presigned.key,
      publicUrl: presigned.publicUrl,
    };
  }

  return {
    strategy: "server",
    uploadUrl: serverUploadUrl,
    method: "POST",
  };
}
