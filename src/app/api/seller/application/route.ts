import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getMyApplication, saveDraft } from "@/lib/services/seller-application.service";
import { sellerApplicationDraftSchema } from "@/lib/validations/seller.schema";
import { handleApiError } from "@/lib/api/handle-error";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const application = await getMyApplication(user.id);
    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load your seller application.");
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const input = sellerApplicationDraftSchema.parse(json);

    const application = await saveDraft(user.id, input);
    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to save your seller application.");
  }
}
