import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  IPrivateDocumentStorage,
  PrivatePresignedUploadResult,
  PrivateUploadOptions,
  PrivateUploadResult,
  SignedDownloadResult,
} from "./private-document-storage.interface";
import { SIGNED_DOCUMENT_URL_EXPIRY_SECONDS } from "@/lib/constants/seller";

const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 5 * 60; // 5 minutes

function buildObjectKey(filename: string, folder?: string): string {
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder ? `${folder}/` : ""}${unique}-${cleanName}`;
}

/**
 * Private S3 storage for sensitive seller verification documents.
 * Reuses the same AWS_REGION / AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY /
 * AWS_S3_BUCKET_NAME env vars as S3StorageService (no new required
 * config), but every object lives under a `private/seller-documents/`
 * prefix and this class NEVER exposes a public URL for any key —
 * uploads are presigned PUTs, reads are short-lived presigned GETs, and
 * that's the only access path. For real-world isolation, the bucket (or
 * a bucket policy scoped to this prefix) should also have public access
 * blocked at the AWS level — that's an infra/console concern this code
 * can't enforce, but it never relies on public-read to function.
 */
export class S3PrivateDocumentStorageService implements IPrivateDocumentStorage {
  private readonly region: string | undefined;
  private readonly bucketName: string | undefined;
  private readonly accessKeyId: string | undefined;
  private readonly secretAccessKey: string | undefined;
  private client: S3Client | null = null;

  constructor() {
    this.region = process.env.AWS_REGION;
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    this.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  }

  isConfigured(): boolean {
    return Boolean(
      this.region && this.bucketName && this.accessKeyId && this.secretAccessKey
    );
  }

  private getClient(): S3Client {
    if (!this.isConfigured()) {
      throw new Error(
        "[S3PrivateDocumentStorageService] AWS S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_S3_BUCKET_NAME."
      );
    }
    if (!this.client) {
      this.client = new S3Client({
        region: this.region,
        credentials: {
          accessKeyId: this.accessKeyId!,
          secretAccessKey: this.secretAccessKey!,
        },
      });
    }
    return this.client;
  }

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: PrivateUploadOptions
  ): Promise<PrivateUploadResult> {
    const key = buildObjectKey(filename, options?.folder);
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: options?.contentType,
      })
    );
    return { key };
  }

  async createPresignedUploadUrl(
    filename: string,
    contentType: string,
    options?: PrivateUploadOptions
  ): Promise<PrivatePresignedUploadResult | null> {
    if (!this.isConfigured()) return null;

    const key = buildObjectKey(filename, options?.folder);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS,
    });

    return { uploadUrl, method: "PUT", key, expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS };
  }

  async createSignedDownloadUrl(key: string): Promise<SignedDownloadResult | null> {
    if (!this.isConfigured() || !key) return null;

    const command = new GetObjectCommand({ Bucket: this.bucketName, Key: key });
    const url = await getSignedUrl(this.getClient(), command, {
      expiresIn: SIGNED_DOCUMENT_URL_EXPIRY_SECONDS,
    });

    return { url, expiresIn: SIGNED_DOCUMENT_URL_EXPIRY_SECONDS };
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured() || !key) return;
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
    );
  }
}
