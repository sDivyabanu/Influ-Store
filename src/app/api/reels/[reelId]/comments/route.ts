import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createReelComment, listReelComments } from "@/lib/services/reel-comment.service";
import { createCommentSchema } from "@/lib/validations/comment.schema";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ reelId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const page = await listReelComments(reelId, user?.id ?? null, cursor, limit);
    return NextResponse.json({ success: true, ...page }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load comments.");
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const input = createCommentSchema.parse(json);

    const comment = await createReelComment(reelId, user.id, input);
    return NextResponse.json({ success: true, comment }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to post comment.");
  }
}
