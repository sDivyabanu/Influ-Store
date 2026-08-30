import { NextResponse } from "next/server";
import { getStoreBySlug } from "@/lib/services/seller-profile.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    const store = await getStoreBySlug(slug);
    if (!store) {
      return NextResponse.json({ success: false, message: "Store not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, store }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load store.");
  }
}
