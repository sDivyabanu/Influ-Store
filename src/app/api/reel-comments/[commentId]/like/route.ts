import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { likeReelComment, unlikeReelComment } from "@/lib/services/reel-comment.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const state = await likeReelComment(commentId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to like comment.");
  }
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

    const state = await unlikeReelComment(commentId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to unlike comment.");
  }
}
