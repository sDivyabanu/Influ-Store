import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getSuggestedUsers } from "@/lib/services/suggestion.service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 5, 20);

    const suggestions = await getSuggestedUsers(user?.id ?? null, limit);
    return NextResponse.json({ success: true, users: suggestions }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load suggested creators.");
  }
}
