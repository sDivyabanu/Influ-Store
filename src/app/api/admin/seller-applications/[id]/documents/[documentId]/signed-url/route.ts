import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getDocumentForAdmin } from "@/lib/services/admin-seller-application.service";
import { getPrivateDocumentStorageService } from "@/lib/storage";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string; documentId: string }>;
}

/**
 * The only way a document's bytes are ever reachable: an authenticated
 * admin request generates a short-lived URL on demand. When S3 is
 * configured this is a real presigned GET (the browser then talks
 * directly to S3); otherwise it points at the same-origin /stream route
 * below, which re-verifies the admin session on every request instead
 * of relying on a signature.
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
    const signed = await storage.createSignedDownloadUrl(doc.storageKey);

    if (signed) {
      return NextResponse.json(
        { success: true, url: signed.url, expiresIn: signed.expiresIn },
        { status: 200 }
      );
    }

    // Local dev fallback: no real signed-URL mechanism for disk files.
    return NextResponse.json(
      {
        success: true,
        url: `/api/admin/seller-applications/${id}/documents/${documentId}/stream`,
        expiresIn: 0,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to generate document access link.");
  }
}
