import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { createPostMediaUploadTarget } from "@/lib/services/media-upload.service";
import { mediaUploadRequestSchema } from "@/lib/validations/media.schema";
import { handleApiError } from "@/lib/api/handle-error";

/**
 * Step 1 of the media upload flow. Authenticated clients call this before
 * uploading each image to find out where the bytes should go:
 *  - S3 configured: a short-lived presigned PUT URL the browser uploads
 *    straight to (bytes never touch our server).
 *  - Not configured (dev): a pointer at /api/posts/media/local-upload,
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
    const input = mediaUploadRequestSchema.parse(json);

    const target = await createPostMediaUploadTarget(user.id, input);

    return NextResponse.json({ success: true, ...target }, { status: 200 });
  } catch (error) {
    return handleApiError(error, "Failed to prepare media upload.");
  }
}
