import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { listUserReels } from "@/lib/services/reel.service";
import { cursorPaginationSchema } from "@/lib/validations/pagination.schema";
import { REEL_GRID_PAGE_SIZE } from "@/lib/constants/reel";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ username: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { username } = await params;
    const currentUser = await getCurrentUser();

    const author = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: { id: true },
    });
    if (!author) {
      return NextResponse.json(
        { success: false, message: "User not found." },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const { cursor, limit } = cursorPaginationSchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const page = await listUserReels(
      author.id,
      currentUser?.id ?? null,
      cursor,
      limit ?? REEL_GRID_PAGE_SIZE
    );

    return NextResponse.json(
      { success: true, reels: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load reels.");
  }
}
