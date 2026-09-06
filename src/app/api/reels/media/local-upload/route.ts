import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStorageService } from "@/lib/storage";
import { buildReelMediaFolder } from "@/lib/services/reel-media-upload.service";
import {
  SUPPORTED_REEL_MIME_TYPES,
  MAX_REEL_SIZE_BYTES,
} from "@/lib/constants/reel";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 2 of the reel video upload flow for the local development fallback
 * only (see media-upload-shared.ts) — mirrors /api/posts/media/local-upload.
 * A browser can't write to disk directly the way it can PUT to a
 * presigned S3 URL, so the file is streamed through this route instead
 * and written via the same IStorageService.uploadFile() contract S3
 * would use.
 *
 * File type/size are re-validated here from the real upload — the
 * fileName/contentType/fileSize declared to /presign are never trusted
 * as the final word. Note: this reads the whole video into memory before
 * writing it, which is fine for local development at these size limits
 * but is exactly the kind of thing S3 presigned uploads exist to avoid
 * in production.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, message: "No file provided." },
        { status: 400 }
      );
    }

    if (!SUPPORTED_REEL_MIME_TYPES.includes(file.type as never)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported video type. Allowed: ${SUPPORTED_REEL_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_REEL_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `Video must be ${MAX_REEL_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageService();
    const result = await storage.uploadFile(buffer, file.name, {
      folder: buildReelMediaFolder(user.id),
      contentType: file.type,
    });

    return NextResponse.json(
      { success: true, key: result.key, publicUrl: result.url },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload video.");
  }
}
