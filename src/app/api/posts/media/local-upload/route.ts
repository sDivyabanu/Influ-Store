import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getStorageService } from "@/lib/storage";
import { buildPostMediaFolder } from "@/lib/services/media-upload.service";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "@/lib/constants/post";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 2 of the media upload flow for the local development fallback
 * only (see media-upload.service.ts). A browser can't write to disk
 * directly the way it can PUT to a presigned S3 URL, so the file is
 * streamed through this route instead and written via the same
 * IStorageService.uploadFile() contract S3 would use.
 *
 * File type/size are re-validated here from the real upload — the
 * fileName/contentType/fileSize declared to /presign are never trusted
 * as the final word.
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

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as never)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported image type. Allowed: ${ALLOWED_IMAGE_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `Image must be ${MAX_IMAGE_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getStorageService();
    const result = await storage.uploadFile(buffer, file.name, {
      folder: buildPostMediaFolder(user.id),
      contentType: file.type,
    });

    return NextResponse.json(
      { success: true, key: result.key, publicUrl: result.url },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to upload image.");
  }
}
