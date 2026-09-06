import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getFollowers } from "@/lib/services/follow.service";
import { handleApiError } from "@/lib/api/handle-error";
import { followListQuerySchema } from "@/lib/validations/follow.schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const url = new URL(request.url);
    const parsed = followListQuerySchema.parse({
      cursor: url.searchParams.get("cursor") ?? undefined,
      limit: url.searchParams.get("limit") ?? undefined,
    });

    const user = await getCurrentUser();
    const result = await getFollowers(
      username,
      user?.id ?? null,
      parsed.cursor,
      parsed.limit
    );

    return NextResponse.json({ success: true, ...result }, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
