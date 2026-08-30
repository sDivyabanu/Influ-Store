import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/admin";
import { getApplicationDetail } from "@/lib/services/admin-seller-application.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;

    const application = await getApplicationDetail(id);
    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load application.");
  }
}
