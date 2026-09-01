export interface UploadOptions {
  contentType?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface PresignedUploadResult {
  /** URL the browser should upload the raw file bytes to. */
  uploadUrl: string;
  /** HTTP method the browser must use against uploadUrl. */
  method: "PUT";
  /** Object key the resulting file will be stored under. */
  key: string;
  /** Public URL the object will be reachable at once uploaded. */
  publicUrl: string;
  /** Seconds until uploadUrl expires. */
  expiresIn: number;
}

export interface IStorageService {
  /**
   * Uploads a file buffer or stream and returns the public URL and key.
   * Used for server-side uploads (dev fallback, or when a browser can't
   * upload directly to the backing store).
   */
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult>;

  /**
   * Generates a short-lived URL the browser can upload directly to,
   * bypassing our server for the file bytes themselves. Returns null
   * when the backing store doesn't support direct browser uploads
   * (e.g. the local development fallback), in which case callers should
   * fall back to uploadFile() through a server route instead.
   */
  createPresignedUploadUrl(
    filename: string,
    contentType: string,
    options?: UploadOptions
  ): Promise<PresignedUploadResult | null>;

  /**
   * Generates or retrieves the public URL for an avatar or asset key
   */
  getPublicUrl(key: string): string;

  /**
   * Deletes a file from storage by key
   */
  deleteFile(key: string): Promise<void>;

  /**
   * Returns whether storage is currently configured and active
   */
  isConfigured(): boolean;
}
