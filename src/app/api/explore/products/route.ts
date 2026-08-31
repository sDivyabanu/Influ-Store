import { NextResponse } from "next/server";
import { getExploreProducts } from "@/lib/services/explore.service";
import { exploreQuerySchema } from "@/lib/validations/search.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = exploreQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const page = await getExploreProducts(parsed.cursor, parsed.limit);

    return NextResponse.json(
      {
        success: true,
        products: page.items,
        nextCursor: page.nextCursor,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load explore products.");
  }
}
