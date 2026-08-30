import { NextResponse } from "next/server";
import { deleteSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await deleteSessionCookie();
    return NextResponse.json(
      {
        success: true,
        message: "Successfully logged out.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Logout API Error]:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to log out. Please try again.",
      },
      { status: 500 }
    );
  }
}
