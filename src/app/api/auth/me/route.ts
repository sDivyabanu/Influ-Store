import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Me API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to retrieve user information.",
      },
      { status: 500 }
    );
  }
}
