import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { rejectApplication } from "@/lib/services/admin-seller-application.service";
import { adminRejectApplicationSchema } from "@/lib/validations/seller.schema";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    const json = await request.json();
    const { reason } = adminRejectApplicationSchema.parse(json);

    await rejectApplication(id, admin.id, reason);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to reject application.");
  }
}
