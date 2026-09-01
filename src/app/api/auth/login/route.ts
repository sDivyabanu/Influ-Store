import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { loginSchema } from "@/lib/validations/auth.schema";

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // 1. Validate request body
    const validationResult = loginSchema.safeParse(json);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: validationResult.error.errors[0]?.message || "Invalid credentials format",
        },
        { status: 400 }
      );
    }

    const { identifier, password } = validationResult.data;
    const normalizedIdentifier = identifier.toLowerCase().trim();

    // 2. Find user by email OR username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normalizedIdentifier },
          { username: normalizedIdentifier },
        ],
      },
      include: {
        profile: true,
      },
    });

    // 3. Constant-time/safe failure check
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email/username or password.",
        },
        { status: 401 }
      );
    }

    // 4. Verify password against bcrypt hash
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email/username or password.",
        },
        { status: 401 }
      );
    }

    // 5. Create and set session cookie
    await setSessionCookie({
      userId: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    });

    // 6. Return response (never exposing passwordHash)
    return NextResponse.json(
      {
        success: true,
        message: "Login successful.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          profile: user.profile
            ? {
                id: user.profile.id,
                displayName: user.profile.displayName,
                bio: user.profile.bio,
                avatarUrl: user.profile.avatarUrl,
                website: user.profile.website,
                accountType: user.profile.accountType,
              }
            : null,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[Login API Error]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to sign in at this time. Please try again.",
      },
      { status: 500 }
    );
  }
}