import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { addDocument } from "@/lib/services/seller-application.service";
import { registerSellerDocumentSchema } from "@/lib/validations/seller-document.schema";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 3 of the verification document upload flow: after the bytes are
 * uploaded (direct-to-S3 or through /local-upload), the client registers
 * the resulting key against the application. This is a standalone
 * action (not bundled into application submission) so a document can be
 * uploaded and removed independently while the application is a draft.
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
    const input = registerSellerDocumentSchema.parse(json);

    const document = await addDocument(user.id, input);
    return NextResponse.json({ success: true, document }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to save document.");
  }
}
