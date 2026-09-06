import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getExplorePosts } from "@/lib/services/explore.service";
import { exploreQuerySchema } from "@/lib/validations/search.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const parsed = exploreQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
    });

    const page = await getExplorePosts(
      user?.id ?? null,
      parsed.cursor,
      parsed.limit,
      parsed.category
    );

    return NextResponse.json(
      {
        success: true,
        posts: page.items,
        nextCursor: page.nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load explore posts.");
  }
}
