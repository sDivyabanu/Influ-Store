import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createSellerDocumentUploadTarget } from "@/lib/services/seller-document-upload.service";
import { documentUploadRequestSchema } from "@/lib/validations/seller-document.schema";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 1 of the verification document upload flow — mirrors
 * /api/posts/media/presign, but targets PRIVATE storage: the presigned
 * URL (when S3 is configured) never resolves to a public object, and
 * the response never includes a public URL of any kind.
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

    const json = await request.json();
    const input = documentUploadRequestSchema.parse(json);

    const target = await createSellerDocumentUploadTarget(user.id, input);

    return NextResponse.json({ success: true, ...target }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to prepare document upload.");
  }
}
