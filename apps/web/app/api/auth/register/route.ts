import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { generateToken } from "@/lib/jwt";
import { UserModel } from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Name, email, and password are required.",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const normalizedEmail = String(email).toLowerCase().trim();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User with this email already exists.",
        },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "user",
    });

    const token = generateToken(String(user._id));

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: String(user._id),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to register user.",
      },
      { status: 500 }
    );
  }
}
