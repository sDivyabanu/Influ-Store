import { promises as fs } from "fs";
import path from "path";
import {
  IPrivateDocumentStorage,
  PrivatePresignedUploadResult,
  PrivateUploadOptions,
  PrivateUploadResult,
  SignedDownloadResult,
} from "./private-document-storage.interface";

// Deliberately OUTSIDE public/ — Next.js only serves public/ statically,
// so anything written here is unreachable by URL. This is the entire
// privacy guarantee for local development; see the admin document-view
// API routes for the authenticated-stream fallback this implies.
const PRIVATE_UPLOADS_ROOT = path.join(process.cwd(), "private-uploads");

function buildObjectKey(filename: string, folder?: string): string {
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder ? `${folder}/` : ""}${unique}-${cleanName}`;
}

/**
 * Development-only fallback for private document storage. Writes files
 * to disk under private-uploads/ (never public/), so the app works
 * end-to-end while AWS S3 credentials are pending. Implements the same
 * IPrivateDocumentStorage contract as S3PrivateDocumentStorageService,
 * so enabling S3 later requires no application code changes.
 *
 * Unlike the public LocalStorageService, this class has no getPublicUrl()
 * at all and createSignedDownloadUrl() always returns null — there is no
 * "signed URL" concept for a local file. Admin document viewing instead
 * goes through an API route that re-checks the admin session on every
 * request before streaming the bytes (see
 * /api/admin/seller-applications/[id]/documents/[documentId]/stream).
 */
export class LocalPrivateDocumentStorageService implements IPrivateDocumentStorage {
  isConfigured(): boolean {
    return true;
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: PrivateUploadOptions
  ): Promise<PrivateUploadResult> {
    const key = buildObjectKey(filename, options?.folder);
    const destination = path.join(PRIVATE_UPLOADS_ROOT, key);

    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, fileBuffer);

    return { key };
  }

  async createPresignedUploadUrl(): Promise<PrivatePresignedUploadResult | null> {
    return null;
  }

  async createSignedDownloadUrl(): Promise<SignedDownloadResult | null> {
    return null;
  }

  async readFile(key: string): Promise<Buffer | null> {
    try {
      return await fs.readFile(path.join(PRIVATE_UPLOADS_ROOT, key));
    } catch {
      return null;
    }
  }

  async deleteFile(key: string): Promise<void> {
    if (!key) return;
    try {
      await fs.unlink(path.join(PRIVATE_UPLOADS_ROOT, key));
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code !== "ENOENT") {
        console.warn(`[LocalPrivateDocumentStorageService] Failed to delete ${key}:`, err.message);
      }
    }
  }
}
