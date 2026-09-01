import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getFeed } from "@/lib/services/feed.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const page = await getFeed(user?.id ?? null, cursor, limit);
    return NextResponse.json(
      { success: true, posts: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load feed.");
  }
}
