import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { approveApplication } from "@/lib/services/admin-seller-application.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;

    await approveApplication(id, admin.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to approve application.");
  }
}
