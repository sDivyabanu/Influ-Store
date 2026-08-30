import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    if (!username) {
      return NextResponse.json(
        {
          success: false,
          message: "Username parameter is required.",
        },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            website: true,
            accountType: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          ...user,
          counts: {
            posts: 0,
            followers: 0,
            following: 0,
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Get Public User Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user profile.",
      },
      { status: 500 }
    );
  }
}
