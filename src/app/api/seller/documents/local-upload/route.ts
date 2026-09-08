import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPrivateDocumentStorageService } from "@/lib/storage";
import { buildSellerDocumentFolder } from "@/lib/services/seller-document-upload.service";
import {
  SUPPORTED_DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
} from "@/lib/constants/seller";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 2 of the verification document upload flow for the local
 * development fallback only — mirrors /api/posts/media/local-upload,
 * but writes into PRIVATE storage (private-uploads/, never public/).
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

    if (!SUPPORTED_DOCUMENT_MIME_TYPES.includes(file.type as never)) {
      return NextResponse.json(
        {
          success: false,
          message: `Unsupported file type. Allowed: ${SUPPORTED_DOCUMENT_MIME_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      return NextResponse.json(
        {
          success: false,
          message: `File must be ${MAX_DOCUMENT_SIZE_BYTES / (1024 * 1024)}MB or smaller.`,
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const storage = getPrivateDocumentStorageService();
    const result = await storage.uploadFile(buffer, file.name, {
      folder: buildSellerDocumentFolder(user.id),
      contentType: file.type,
    });

    // Deliberately no publicUrl in this response — only the key, which
    // is meaningless without an authorized signed-URL request later.
    return NextResponse.json({ success: true, key: result.key }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to upload document.");
  }
}
