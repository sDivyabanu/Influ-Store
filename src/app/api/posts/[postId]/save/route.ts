import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { savePost, unsavePost } from "@/lib/services/saved-post.service";
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

    const state = await savePost(postId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to save post.");
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

    const state = await unsavePost(postId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to unsave post.");
  }
}
