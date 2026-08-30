import { NextResponse } from "next/server";
import { getTrendingHashtags } from "@/lib/services/hashtag.service";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 10, 30);

    const hashtags = await getTrendingHashtags(limit);
    return NextResponse.json({ success: true, hashtags }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load trending hashtags.");
  }
}
