import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { globalSearch } from "@/lib/services/search.service";
import { searchQuerySchema } from "@/lib/validations/search.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser();

    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.parse({
      q: searchParams.get("q") ?? "",
      type: searchParams.get("type") ?? "all",
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const results = await globalSearch(
      parsed.q,
      user?.id ?? null,
      parsed.type,
      parsed.cursor,
      parsed.limit
    );

    return NextResponse.json(
      {
        success: true,
        query: parsed.q,
        type: parsed.type,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to perform search.");
  }
}
