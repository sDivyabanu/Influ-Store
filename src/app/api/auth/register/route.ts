import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { name, username, email, password } = body;

    // Validate input
    if (!name || !username || !email || !password) {
      return NextResponse.json(
        {
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        {
          message: "Password must contain at least 6 characters",
        },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // Connect to MongoDB
    const client = await clientPromise;

    const db = client.db("influstore");
    const users = db.collection("users");

    // Check email
    const existingEmail = await users.findOne({
      email: normalizedEmail,
    });

    if (existingEmail) {
      return NextResponse.json(
        {
          message: "An account with this email already exists",
        },
        { status: 409 }
      );
    }

    // Check username
    const existingUsername = await users.findOne({
      username: normalizedUsername,
    });

    if (existingUsername) {
      return NextResponse.json(
        {
          message: "This username is already taken",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const newUser = {
      name: name.trim(),
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,

      avatar: "",
      bio: "",

      followers: [],
      following: [],
      favorites: [],

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Insert user
    const result = await users.insertOne(newUser);

    console.log("USER CREATED:", result.insertedId.toString());

    return NextResponse.json(
      {
        message: "Account created successfully",

        user: {
          id: result.insertedId.toString(),
          name: newUser.name,
          username: newUser.username,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return NextResponse.json(
      {
        message: "Something went wrong while creating your account",
      },
      { status: 500 }
    );
  }
}