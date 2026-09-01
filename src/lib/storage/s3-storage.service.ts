import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {
  IStorageService,
  PresignedUploadResult,
  UploadOptions,
  UploadResult,
} from "./storage-service.interface";

const PRESIGNED_UPLOAD_EXPIRY_SECONDS = 5 * 60; // 5 minutes

function buildObjectKey(filename: string, folder?: string): string {
  const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const unique = `${Date.now()}-${crypto.randomUUID()}`;
  return `${folder ? `${folder}/` : ""}${unique}-${cleanName}`;
}

/**
 * Production storage backend. Fully inert until AWS_REGION,
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_S3_BUCKET_NAME are set —
 * see isConfigured(). Never invents credentials or makes network calls
 * when unconfigured; callers should prefer the local storage fallback
 * (see storage/index.ts) until this is active.
 */
export class S3StorageService implements IStorageService {
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
      this.region &&
        this.bucketName &&
        this.accessKeyId &&
        this.secretAccessKey
    );
  }

  private getClient(): S3Client {
    if (!this.isConfigured()) {
      throw new Error(
        "[S3StorageService] AWS S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY and AWS_S3_BUCKET_NAME."
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
    options?: UploadOptions
  ): Promise<UploadResult> {
    const key = buildObjectKey(filename, options?.folder);
    await this.getClient().send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: options?.contentType,
      })
    );

    return { key, url: this.getPublicUrl(key) };
  }

  async createPresignedUploadUrl(
    filename: string,
    contentType: string,
    options?: UploadOptions
  ): Promise<PresignedUploadResult | null> {
    if (!this.isConfigured()) {
      return null;
    }

    const key = buildObjectKey(filename, options?.folder);
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(this.getClient(), command, {
      expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS,
    });

    return {
      uploadUrl,
      method: "PUT",
      key,
      publicUrl: this.getPublicUrl(key),
      expiresIn: PRESIGNED_UPLOAD_EXPIRY_SECONDS,
    };
  }

  getPublicUrl(key: string): string {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured() || !key) return;
    await this.getClient().send(
      new DeleteObjectCommand({ Bucket: this.bucketName, Key: key })
    );
  }
}
