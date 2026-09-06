import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deletePost, getPostById, updatePostCaption } from "@/lib/services/post.service";
import { updatePostSchema } from "@/lib/validations/post.schema";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ postId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const user = await getCurrentUser();

    const post = await getPostById(postId, user?.id ?? null);
    if (!post) {
      return NextResponse.json(
        { success: false, message: "Post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, post }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load post.");
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { postId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const { caption } = updatePostSchema.parse(json);

    const post = await updatePostCaption(postId, user.id, caption);

    return NextResponse.json({ success: true, post }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update post.");
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

    await deletePost(postId, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to delete post.");
  }
}
