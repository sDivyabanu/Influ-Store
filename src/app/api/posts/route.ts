import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPost } from "@/lib/services/post.service";
import { createPostSchema } from "@/lib/validations/post.schema";
import { handleApiError } from "@/lib/api/handle-error";

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
    const input = createPostSchema.parse(json);

    const post = await createPost(user.id, input);

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create post.");
  }
}
