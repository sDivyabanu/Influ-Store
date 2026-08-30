import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { requireMyStoreId } from "@/lib/services/seller-profile.service";
import { createProduct, listMyProducts } from "@/lib/services/seller-product.service";
import { createProductSchema, myProductsQuerySchema } from "@/lib/validations/product.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET(request: Request) {
  try {
    const user = await requireSeller();
    const sellerProfileId = await requireMyStoreId(user.id);

    const { searchParams } = new URL(request.url);
    const parsed = myProductsQuerySchema.parse({
      cursor: searchParams.get("cursor") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
      status: searchParams.get("status") ?? undefined,
    });

    const page = await listMyProducts(sellerProfileId, parsed.cursor, parsed.limit, parsed.status);

    return NextResponse.json(
      { success: true, products: page.items, nextCursor: page.nextCursor },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error, "Failed to load your products.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSeller();
    const sellerProfileId = await requireMyStoreId(user.id);

    const json = await request.json();
    const input = createProductSchema.parse(json);

    const product = await createProduct(sellerProfileId, input);

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create product.");
  }
}
