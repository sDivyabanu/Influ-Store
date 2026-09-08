import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { deleteReel, getReelById, updateReel } from "@/lib/services/reel.service";
import { updateReelSchema } from "@/lib/validations/reel.schema";
import { handleApiError } from "@/lib/api/handle-error";

interface RouteParams {
  params: Promise<{ reelId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();

    const reel = await getReelById(reelId, user?.id ?? null);
    if (!reel) {
      return NextResponse.json(
        { success: false, message: "Reel not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, reel }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to load reel.");
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { reelId } = await params;
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const input = updateReelSchema.parse(json);

    const reel = await updateReel(reelId, user.id, input);

    return NextResponse.json({ success: true, reel }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to update reel.");
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

    await deleteReel(reelId, user.id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to delete reel.");
  }
}
