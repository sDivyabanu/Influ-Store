import { IStorageService } from "./storage-service.interface";
import { S3StorageService } from "./s3-storage.service";
import { LocalStorageService } from "./local-storage.service";
import { IPrivateDocumentStorage } from "./private-document-storage.interface";
import { S3PrivateDocumentStorageService } from "./s3-private-document-storage.service";
import { LocalPrivateDocumentStorageService } from "./local-private-document-storage.service";

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

let privateDocumentStorageInstance: IPrivateDocumentStorage | null = null;

/**
 * Returns the active PRIVATE document storage backend (seller
 * verification documents). Same S3-preferred / local-fallback selection
 * as getStorageService(), but this backend never produces public URLs —
 * see private-document-storage.interface.ts.
 */
export function getPrivateDocumentStorageService(): IPrivateDocumentStorage {
  if (!privateDocumentStorageInstance) {
    const s3 = new S3PrivateDocumentStorageService();
    privateDocumentStorageInstance = s3.isConfigured()
      ? s3
      : new LocalPrivateDocumentStorageService();
  }
  return privateDocumentStorageInstance;
}

export * from "./storage-service.interface";
export * from "./s3-storage.service";
export * from "./local-storage.service";
export * from "./private-document-storage.interface";
export * from "./s3-private-document-storage.service";
export * from "./local-private-document-storage.service";
