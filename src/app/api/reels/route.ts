import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createReel } from "@/lib/services/reel.service";
import { getReelFeed } from "@/lib/services/reel-feed.service";
import { createReelSchema } from "@/lib/validations/reel.schema";
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

    const page = await getReelFeed(user?.id ?? null, cursor, limit);
    return NextResponse.json(
      {
        success: true,
        reels: page.items,
        nextCursor: page.nextCursor,
        isPersonalized: page.isPersonalized,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load reels.");
  }
}

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
    const input = createReelSchema.parse(json);

    const reel = await createReel(user.id, input);

    return NextResponse.json({ success: true, reel }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create reel.");
  }
}
