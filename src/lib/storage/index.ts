import { IStorageService } from "./storage-service.interface";
import { S3StorageService } from "./s3-storage.service";

let storageInstance: IStorageService | null = null;

export function getStorageService(): IStorageService {
  if (!storageInstance) {
    storageInstance = new S3StorageService();
  }
  return storageInstance;
}

export * from "./storage-service.interface";
export * from "./s3-storage.service";
