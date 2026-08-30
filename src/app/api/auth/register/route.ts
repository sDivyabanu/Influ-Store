import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie } from "@/lib/auth/session";
import { registerSchema } from "@/lib/validations/auth.schema";
import { AccountType, Role } from "@prisma/client";

export async function POST(request: Request) {
  try {
    const json = await request.json();

    // 1. Validate request body with Zod
    const validationResult = registerSchema.safeParse(json);
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

    const { name, username, email, password, accountType } = validationResult.data;

    // 2. Check for duplicate email or username
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email.toLowerCase() === email.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            message: "An account with this email address already exists.",
            errors: { email: ["Email address is already in use."] },
          },
          { status: 409 }
        );
      }

      if (existingUser.username.toLowerCase() === username.toLowerCase()) {
        return NextResponse.json(
          {
            success: false,
            message: "This username is already taken. Please choose another.",
            errors: { username: ["Username is already taken."] },
          },
          { status: 409 }
        );
      }
    }

    // 3. Hash password securely
    const passwordHash = await hashPassword(password);

    // 4. Create User and Profile in database transaction
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        passwordHash,
        role: Role.USER,
        profile: {
          create: {
            displayName: name,
            bio: null,
            avatarUrl: null,
            website: null,
            accountType:
              accountType === "INFLUENCER"
                ? AccountType.INFLUENCER
                : AccountType.CUSTOMER,
          },
        },
      },
      include: {
        profile: true,
      },
    });

    // 5. Create and set authenticated session cookie
    await setSessionCookie({
      userId: newUser.id,
      email: newUser.email,
      username: newUser.username,
      role: newUser.role,
    });

    // 6. Return response (never exposing passwordHash)
    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully.",
        user: {
          id: newUser.id,
          email: newUser.email,
          username: newUser.username,
          role: newUser.role,
          profile: newUser.profile
            ? {
                id: newUser.profile.id,
                displayName: newUser.profile.displayName,
                bio: newUser.profile.bio,
                avatarUrl: newUser.profile.avatarUrl,
                website: newUser.profile.website,
                accountType: newUser.profile.accountType,
              }
            : null,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Register API Error]:", error);

    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while creating your account. Please try again.",
      },
      { status: 500 }
    );
  }
}