import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getDocumentForAdmin } from "@/lib/services/admin-seller-application.service";
import { getPrivateDocumentStorageService, LocalPrivateDocumentStorageService } from "@/lib/storage";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string; documentId: string }>;
}

/**
 * Local-development-only fallback for viewing a private document when
 * S3 (and its real presigned GET URLs) isn't configured. Every request
 * re-verifies the caller is an authenticated admin before streaming a
 * single byte — there is no signature or token to leak, because the
 * session cookie check happens fresh, every time, same-origin.
 */
export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id, documentId } = await params;

    const doc = await getDocumentForAdmin(id, documentId);
    if (!doc) {
      return NextResponse.json(
        { success: false, message: "Document not found." },
        { status: 404 }
      );
    }

    const storage = getPrivateDocumentStorageService();
    if (!(storage instanceof LocalPrivateDocumentStorageService)) {
      // S3 is configured — callers should have used the signed URL from
      // /signed-url instead, never this route.
      return NextResponse.json(
        { success: false, message: "Direct streaming is unavailable when S3 storage is configured." },
        { status: 400 }
      );
    }

    const buffer = await storage.readFile(doc.storageKey);
    if (!buffer) {
      return NextResponse.json(
        { success: false, message: "Document file could not be found in storage." },
        { status: 404 }
      );
    }

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": doc.mimeType,
        "Content-Disposition": `inline; filename="${encodeURIComponent(doc.originalFilename)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    return handleApiError(error, "Failed to load document.");
  }
}
