export interface UploadOptions {
  contentType?: string;
  folder?: string;
}

export interface UploadResult {
  url: string;
  key: string;
}

export interface IStorageService {
  /**
   * Uploads a file buffer or stream and returns the public URL and key
   */
  uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult>;

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
