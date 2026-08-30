import { IStorageService } from "./storage-service.interface";
import { S3StorageService } from "./s3-storage.service";
import { LocalStorageService } from "./local-storage.service";

let storageInstance: IStorageService | null = null;

/**
 * Returns the active storage backend. Prefers S3 whenever AWS_REGION,
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_S3_BUCKET_NAME are all
 * set; otherwise falls back to local-disk storage for development so the
 * app keeps working with real (non-fake) file uploads. All call sites use
 * the same IStorageService contract, so enabling S3 in production requires
 * no code changes — only setting those environment variables.
 */
export function getStorageService(): IStorageService {
  if (!storageInstance) {
    const s3 = new S3StorageService();
    storageInstance = s3.isConfigured() ? s3 : new LocalStorageService();
  }
  return storageInstance;
}

export * from "./storage-service.interface";
export * from "./s3-storage.service";
export * from "./local-storage.service";
