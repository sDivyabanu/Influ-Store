import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getHashtagPosts } from "@/lib/services/hashtag.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ tag: string }> }
) {
  try {
    const { tag } = await params;
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const result = await getHashtagPosts(
      tag,
      user?.id ?? null,
      cursor,
      limit
    );

    return NextResponse.json(
      {
        success: true,
        hashtag: result.hashtag,
        posts: result.posts.items,
        nextCursor: result.posts.nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load hashtag posts.");
  }
}
