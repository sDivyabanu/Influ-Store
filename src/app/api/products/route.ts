import { NextResponse } from "next/server";
import { listProducts } from "@/lib/services/product.service";
import { listProductsQuerySchema } from "@/lib/validations/product.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const parsed = listProductsQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      sellerSlug: searchParams.get("sellerSlug") ?? undefined,
      search: searchParams.get("search") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      sort: searchParams.get("sort") ?? undefined,
    });

    const page = await listProducts(
      {
        category: parsed.category,
        sellerSlug: parsed.sellerSlug,
        search: parsed.search,
        minPrice: parsed.minPrice,
        maxPrice: parsed.maxPrice,
        sort: parsed.sort,
      },
      parsed.cursor,
      parsed.limit
    );

    return NextResponse.json(
      { success: true, products: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load products.");
  }
}
