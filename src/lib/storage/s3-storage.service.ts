import {
  IStorageService,
  UploadOptions,
  UploadResult,
} from "./storage-service.interface";

export class S3StorageService implements IStorageService {
  private readonly region: string | undefined;
  private readonly bucketName: string | undefined;
  private readonly accessKeyId: string | undefined;
  private readonly secretAccessKey: string | undefined;

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

  async uploadFile(
    fileBuffer: Buffer | Uint8Array,
    filename: string,
    options?: UploadOptions
  ): Promise<UploadResult> {
    if (!this.isConfigured()) {
      console.warn(
        "[StorageService] AWS S3 credentials are not configured. AWS account activation pending."
      );
      // Fallback: Generate mock key and URL for local dev environment
      const cleanName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
      const key = `${options?.folder ? `${options.folder}/` : "avatars/"}${Date.now()}-${cleanName}`;
      return {
        key,
        url: `https://placeholder-storage.influstore.local/${key}`,
      };
    }

    // When AWS is active in Phase 2+, AWS S3 PutObjectCommand will be executed here.
    const key = `${options?.folder ? `${options.folder}/` : ""}${Date.now()}-${filename}`;
    const url = `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;

    return {
      key,
      url,
    };
  }

  getPublicUrl(key: string): string {
    if (!key) return "";
    if (key.startsWith("http://") || key.startsWith("https://")) {
      return key;
    }
    if (!this.isConfigured()) {
      return `https://placeholder-storage.influstore.local/${key}`;
    }
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  async deleteFile(key: string): Promise<void> {
    if (!this.isConfigured()) {
      console.warn(
        `[StorageService] AWS S3 not configured. Skipped deleting key: ${key}`
      );
      return;
    }
    // Phase 2+: S3 DeleteObjectCommand
  }
}
