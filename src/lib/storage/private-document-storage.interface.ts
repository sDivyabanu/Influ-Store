export interface PrivateUploadOptions {
  contentType?: string;
  folder?: string;
}

export interface PrivateUploadResult {
  key: string;
}

export interface PrivatePresignedUploadResult {
  /** URL the browser should upload the raw file bytes to. */
  uploadUrl: string;
  method: "PUT";
  /** Object key the resulting file will be stored under. */
  key: string;
  expiresIn: number;
}

export interface SignedDownloadResult {
  url: string;
  expiresIn: number;
}

/**
 * Storage contract for SENSITIVE, private objects (seller verification
 * documents). Deliberately separate from IStorageService (post/reel
 * media, which is public by design): notice there is no getPublicUrl()
 * or `publicUrl` field anywhere on this interface — a private object's
 * URL must never be constructible from its key alone. The only way to
 * read a private object back is createSignedDownloadUrl(), which is
 * short-lived and must only ever be called after the caller has
 * verified the requester is an authorized admin (see lib/auth/admin.ts).
 */
export interface IPrivateDocumentStorage {
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: PrivateUploadOptions
  ): Promise<PrivateUploadResult>;

  /**
   * Short-lived presigned PUT URL the browser can upload directly to.
   * Returns null when the backend doesn't support direct browser
   * uploads (local dev fallback) — callers fall back to uploadFile()
   * through a server route instead.
   */
  createPresignedUploadUrl(
    filename: string,
    contentType: string,
    options?: PrivateUploadOptions
  ): Promise<PrivatePresignedUploadResult | null>;

  /**
   * Short-lived signed URL to read a private object back. Returns null
   * when the backend can't produce a real signed URL (local dev
   * fallback) — callers fall back to an authenticated streaming route
   * that re-verifies the admin session on every request instead.
   */
  createSignedDownloadUrl(key: string): Promise<SignedDownloadResult | null>;

  deleteFile(key: string): Promise<void>;

  isConfigured(): boolean;
}
