import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { createStoreMediaUploadTarget } from "@/lib/services/store-media-upload.service";
import { storeMediaUploadRequestSchema } from "@/lib/validations/store-media.schema";
import { handleApiError } from "@/lib/api/handle-error";

/** Step 1 of the store logo/banner upload flow — mirrors /api/posts/media/presign, gated to approved sellers. */
export async function POST(request: Request) {
  try {
    const user = await requireSeller();

    const json = await request.json();
    const input = storeMediaUploadRequestSchema.parse(json);

    const target = await createStoreMediaUploadTarget(user.id, input);
    return NextResponse.json({ success: true, ...target }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to prepare image upload.");
  }
}
