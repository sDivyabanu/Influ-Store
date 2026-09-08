import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { removeDocument } from "@/lib/services/seller-application.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ documentId: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { documentId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await removeDocument(user.id, documentId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to remove document.");
  }
}
