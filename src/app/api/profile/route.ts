import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { profileUpdateSchema } from "@/lib/validations/profile.schema";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            createdAt: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Profile GET API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve profile data.",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const json = await request.json();

    // 1. Validate payload
    const validationResult = profileUpdateSchema.safeParse(json);
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
          message: validationResult.error.errors[0]?.message || "Validation failed",
          errors: fieldErrors,
        },
        { status: 400 }
      );
    }

    const { displayName, username, bio, website, avatarUrl } = validationResult.data;

    // 2. Check if username changed and is unique
    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const existingUser = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });

      if (existingUser && existingUser.id !== user.id) {
        return NextResponse.json(
          {
            success: false,
            message: "This username is already taken.",
            errors: { username: ["Username is already taken."] },
          },
          { status: 409 }
        );
      }
    }

    // 3. Update User and Profile in transaction
    const updatedUser = await prisma.$transaction(async (tx) => {
      if (username && username.toLowerCase() !== user.username.toLowerCase()) {
        await tx.user.update({
          where: { id: user.id },
          data: { username: username.toLowerCase() },
        });
      }

      await tx.profile.upsert({
        where: { userId: user.id },
        update: {
          displayName: displayName ?? user.profile?.displayName ?? "User",
          bio: bio !== undefined ? bio : undefined,
          website: website !== undefined ? website : undefined,
          avatarUrl: avatarUrl !== undefined ? avatarUrl : undefined,
        },
        create: {
          userId: user.id,
          displayName: displayName ?? "User",
          bio: bio ?? null,
          website: website ?? null,
          avatarUrl: avatarUrl ?? null,
        },
      });


      return tx.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          profile: true,
        },
      });
    });

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully.",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Profile PATCH API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An error occurred while updating your profile.",
      },
      { status: 500 }
    );
  }
}
