import { NextRequest, NextResponse } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectDB } from "@/lib/db";
import { UserModel } from "@/models/User";

interface DecodedToken extends JwtPayload {
  userId?: string;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          success: false,
          message: "No token provided.",
        },
        { status: 401 }
      );
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return NextResponse.json(
        {
          success: false,
          message: "JWT_SECRET is not configured.",
        },
        { status: 500 }
      );
    }

    let decoded: DecodedToken;
    try {
      decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid or expired token.",
        },
        { status: 401 }
      );
    }

    if (!decoded.userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid token payload.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await UserModel.findById(decoded.userId).select(
      "_id name email role avatar"
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || "",
      },
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to verify session.",
      },
      { status: 500 }
    );
  }
}
