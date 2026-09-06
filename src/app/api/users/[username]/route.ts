import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { isUserFollowing } from "@/lib/services/follow.service";

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
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
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

    const currentUser = await getCurrentUser();
    const isFollowing = await isUserFollowing(currentUser?.id ?? null, user.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          createdAt: user.createdAt,
          profile: user.profile,
          counts: {
            posts: user._count.posts,
            followers: user._count.followers,
            following: user._count.following,
          },
          isFollowing,
          isSelf: currentUser?.id === user.id,
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
