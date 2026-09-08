import { NextResponse } from "next/server";
import { requireSeller } from "@/lib/auth/seller";
import { getMyStore, upsertStore } from "@/lib/services/seller-profile.service";
import { upsertStoreSchema } from "@/lib/validations/store.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const user = await requireSeller();
    const store = await getMyStore(user.id);
    return NextResponse.json({ success: true, store }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load your storefront.");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSeller();

    const json = await request.json();
    const input = upsertStoreSchema.parse(json);

    const store = await upsertStore(user.id, input);
    return NextResponse.json({ success: true, store }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to save your storefront.");
  }
}
