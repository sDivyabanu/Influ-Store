import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedPosts } from "@/lib/services/saved-post.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    // Always scoped to the current session user — saved posts are private
    // and must never be queryable for anyone else.
    const page = await listSavedPosts(user.id, cursor, limit);
    return NextResponse.json(
      { success: true, posts: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load saved posts.");
  }
}
