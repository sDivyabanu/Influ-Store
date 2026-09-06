import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteComment } from "@/lib/services/comment.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    await deleteComment(commentId, user.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to delete comment.");
  }
}
