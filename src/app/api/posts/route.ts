import { NextResponse } from "next/server";
<<<<<<< HEAD
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { getStorageService } from "@/lib/storage";
import { createPostSchema } from "@/lib/validations/post.schema";
=======
import { getCurrentUser } from "@/lib/auth/session";
import { createPost } from "@/lib/services/post.service";
import { createPostSchema } from "@/lib/validations/post.schema";
import { handleApiError } from "@/lib/api/handle-error";
>>>>>>> 732ebb33b08dfcc1734f00f9df6a62197a6bbfe8

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
<<<<<<< HEAD

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
=======
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized. Please log in." },
>>>>>>> 732ebb33b08dfcc1734f00f9df6a62197a6bbfe8
        { status: 401 }
      );
    }

<<<<<<< HEAD
    const formData = await request.formData();
    const image = formData.get("image");
    const caption = formData.get("caption");

    if (!(image instanceof File) || image.size === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "A post image is required.",
          errors: { image: ["Please choose an image to publish."] },
        },
        { status: 400 }
      );
    }

    const validationResult = createPostSchema.safeParse({
      caption: typeof caption === "string" ? caption : null,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string[]> = {};
      validationResult.error.errors.forEach((err) => {
        const field = err.path.join(".");
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });

      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.errors[0]?.message || "Invalid input",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await image.arrayBuffer());
    const { key, url } = await getStorageService().uploadFile(
      fileBuffer,
      image.name,
      { folder: "posts", contentType: image.type }
    );

    const post = await prisma.post.create({
      data: {
        authorId: user.id,
        caption: validationResult.data.caption || null,
        media: {
          create: {
            mediaKey: key,
            mediaUrl: url,
            order: 0,
          },
        },
      },
      include: {
        media: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Your post has been published successfully.",
        post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Create Post API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to publish your post. Please try again.",
      },
      { status: 500 }
    );
=======
    const json = await request.json();
    const input = createPostSchema.parse(json);

    const post = await createPost(user.id, input);

    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    return handleApiError(error, "Failed to create post.");
>>>>>>> 732ebb33b08dfcc1734f00f9df6a62197a6bbfe8
  }
}
