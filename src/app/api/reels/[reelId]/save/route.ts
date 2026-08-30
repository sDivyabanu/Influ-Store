import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { saveReel, unsaveReel } from "@/lib/services/saved-reel.service";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ reelId: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const state = await saveReel(reelId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to save reel.");
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const state = await unsaveReel(reelId, user.id);
    return NextResponse.json({ success: true, ...state }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to unsave reel.");
  }
}
