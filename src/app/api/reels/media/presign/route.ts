import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createReelMediaUploadTarget } from "@/lib/services/reel-media-upload.service";
import { reelMediaUploadRequestSchema } from "@/lib/validations/reel-media.schema";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 1 of the reel video upload flow — mirrors /api/posts/media/presign.
 * Authenticated clients call this before uploading a video to find out
 * where the bytes should go:
 *  - S3 configured: a short-lived presigned PUT URL the browser uploads
 *    straight to (bytes never touch our server).
 *  - Not configured (dev): a pointer at /api/reels/media/local-upload,
 *    which the client then POSTs the file to instead.
 */
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
        { status: 401 }
      );
    }

    const json = await request.json();
    const input = reelMediaUploadRequestSchema.parse(json);

    const target = await createReelMediaUploadTarget(user.id, input);

    return NextResponse.json({ success: true, ...target }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to prepare video upload.");
  }
}
