import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { getStorageService } from "@/lib/storage";
import { buildProductMediaFolder } from "@/lib/services/product-media-upload.service";
import { ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES } from "@/lib/constants/post";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 2 of the product image upload flow for the local development
 * fallback only — mirrors /api/posts/media/local-upload. File type/size
 * are re-validated here from the real upload; the client's declared
 * metadata is never trusted as the final word.
 */
export async function POST(request: Request) {
  try {
    const user = await requireSeller();

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, message: "No file provided." }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
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
      folder: buildProductMediaFolder(user.id),
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
