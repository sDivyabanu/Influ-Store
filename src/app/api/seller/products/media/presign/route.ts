import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { createProductMediaUploadTarget } from "@/lib/services/product-media-upload.service";
import { productMediaUploadRequestSchema } from "@/lib/validations/product-media.schema";
import { handleApiError } from "@/lib/api/handle-error";

/** Step 1 of the product image upload flow — mirrors /api/posts/media/presign, gated to approved sellers. */
export async function POST(request: Request) {
  try {
    const user = await requireSeller();

    const json = await request.json();
    const input = productMediaUploadRequestSchema.parse(json);

    const target = await createProductMediaUploadTarget(user.id, input);
    return NextResponse.json({ success: true, ...target }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to prepare image upload.");
  }
}
