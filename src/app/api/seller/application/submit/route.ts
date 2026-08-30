import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { submitApplication } from "@/lib/services/seller-application.service";
import { handleApiError } from "@/lib/api/handle-error";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const application = await submitApplication(user.id);
    return NextResponse.json({ success: true, application }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to submit your seller application.");
  }
}
