import { promises as fs } from "fs";
import path from "path";
import {
  IStorageService,
  PresignedUploadResult,
  UploadOptions,
  UploadResult,
} from "./storage-service.interface";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");

function buildObjectKey(filename: string, folder?: string): string {
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder ? `${folder}/` : ""}${unique}-${cleanName}`;
}

/**
 * Development-only fallback storage backend. Writes files to disk under
 * public/uploads/ so Next.js serves them statically, keeping the app
 * fully working while AWS S3 credentials are pending activation.
 *
 * Implements the exact same IStorageService contract as S3StorageService,
 * so switching to S3 requires no UI or business-logic changes — only
 * setting the AWS_* environment variables (see storage/index.ts).
 *
 * Not suitable for production: local disk storage doesn't survive
 * redeploys or scale across multiple instances.
 */
export class LocalStorageService implements IStorageService {
  isConfigured(): boolean {
    return true;
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    const key = buildObjectKey(filename, options?.folder);
    const destination = path.join(UPLOADS_ROOT, key);

    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, fileBuffer);

    return { key, url: this.getPublicUrl(key) };
  }

  // Browsers can't write directly to the local filesystem, so there is no
  // presigned-URL equivalent here. Callers fall back to uploading through
  // a server route that calls uploadFile() instead.
  async createPresignedUploadUrl(): Promise<PresignedUploadResult | null> {
    return null;
  }

  getPublicUrl(key: string): string {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    return `/uploads/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) return;
    const target = path.join(UPLOADS_ROOT, key);
    try {
      await fs.unlink(target);
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        console.warn(`[LocalStorageService] Failed to delete ${key}:`, err.message);
      }
    }
  }
}
