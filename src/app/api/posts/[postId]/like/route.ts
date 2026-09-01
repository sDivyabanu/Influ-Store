import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { likePost, unlikePost } from "@/lib/services/like.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const state = await likePost(postId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to like post.");
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const state = await unlikePost(postId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to unlike post.");
  }
}
