import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getStorageService } from "@/lib/storage";
import { createPostSchema } from "@/lib/validations/post.schema";

async function getOwnedPost(postId: string, userId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: true },
  });

  if (!post) {
    return { error: NextResponse.json({ success: false, message: "Post not found." }, { status: 404 }) };
  }

  if (post.authorId !== userId) {
    return { error: NextResponse.json({ success: false, message: "You can only manage your own posts." }, { status: 403 }) };
  }

  return { post };
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { postId } = await params;
    const { error, post } = await getOwnedPost(postId, user.id);
    if (error) return error;

    const json = await request.json();
    const validationResult = createPostSchema.safeParse({ caption: json.caption });

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.errors[0]?.message || "Invalid input",
        },
        { status: 400 }
      );
    }

    const updated = await prisma.post.update({
      where: { id: post!.id },
      data: { caption: validationResult.data.caption || null },
      include: { media: true },
    });

    return NextResponse.json({ success: true, message: "Post updated successfully.", post: updated }, { status: 200 });
  } catch (error) {
    console.error("[Update Post API Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to update your post. Please try again." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, message: "Unauthorized. Please log in." }, { status: 401 });
    }

    const { postId } = await params;
    const { error, post } = await getOwnedPost(postId, user.id);
    if (error) return error;

    await prisma.post.delete({ where: { id: post!.id } });

    const storage = getStorageService();
    await Promise.all(post!.media.map((m) => storage.deleteFile(m.mediaKey)));

    return NextResponse.json({ success: true, message: "Post deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("[Delete Post API Error]:", error);
    return NextResponse.json({ success: false, message: "Failed to delete your post. Please try again." }, { status: 500 });
  }
}
