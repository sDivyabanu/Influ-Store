import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { requireMyStoreId } from "@/lib/services/seller-profile.service";
import { deleteProduct, getMyProductById, updateProduct } from "@/lib/services/seller-product.service";
import { updateProductSchema } from "@/lib/validations/product.schema";
import { handleApiError } from "@/lib/api/handle-error";
import { NotFoundError } from "@/lib/errors";

interface RouteParams {
  params: Promise<{ productId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const user = await requireSeller();
    const sellerProfileId = await requireMyStoreId(user.id);
    const { productId } = await params;

    const product = await getMyProductById(productId, sellerProfileId);
    if (!product) throw new NotFoundError("Product not found.");

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load product.");
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const user = await requireSeller();
    const sellerProfileId = await requireMyStoreId(user.id);
    const { productId } = await params;

    const json = await request.json();
    const input = updateProductSchema.parse(json);

    const product = await updateProduct(productId, sellerProfileId, input);

    return NextResponse.json({ success: true, product }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update product.");
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const user = await requireSeller();
    const sellerProfileId = await requireMyStoreId(user.id);
    const { productId } = await params;

    await deleteProduct(productId, sellerProfileId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to delete product.");
  }
}
