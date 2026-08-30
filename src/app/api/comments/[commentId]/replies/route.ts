import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listReplies } from "@/lib/services/comment.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ commentId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { commentId } = await params;
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const page = await listReplies(commentId, user?.id ?? null, cursor, limit);
    return NextResponse.json({ success: true, ...page }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load replies.");
  }
}
