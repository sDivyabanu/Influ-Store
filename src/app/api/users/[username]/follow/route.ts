import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { toggleFollow } from "@/lib/services/follow.service";
import { handleApiError } from "@/lib/api/handle-error";
import { UnauthorizedError } from "@/lib/errors";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new UnauthorizedError("You must be logged in to follow users.");
    }

    const { username } = await params;
    const result = await toggleFollow(user.id, username);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return handleApiError(error);
  }
}
