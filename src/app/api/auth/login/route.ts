import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Email and password are required",
        },
        {
          status: 400,
        }
      );
    }

    const normalizedEmail = email
      .toLowerCase()
      .trim();

    // Connect to MongoDB
    const client = await clientPromise;

    const db = client.db("influstore");

    const users = db.collection("users");

    // Find user
    const user = await users.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Compare password
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          message: "Invalid email or password",
        },
        {
          status: 401,
        }
      );
    }

    // Successful login
    return NextResponse.json(
      {
        success: true,
        message: "Login successful",

        user: {
          id: user._id.toString(),
          name: user.name,
          username: user.username || "",
          email: user.email,
          accountType: user.accountType || "customer",
        },
      },
      {
        status: 200,
      }
    );

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while logging in",
      },
      {
        status: 500,
      }
    );
  }
}