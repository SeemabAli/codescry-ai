import { NextRequest, NextResponse } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { isValidObjectId, Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { ReviewModel } from "@/models/Review";

interface DecodedToken extends JwtPayload {
  userId?: string;
  id?: string;
}

function getUserIdFromToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = process.env.JWT_SECRET || "your_super_secret_jwt_key_change_this_later";

  try {
    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    return decoded.userId || decoded.id || null;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    const review = await ReviewModel.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    }).lean();

    if (!review) {
      return NextResponse.json(
        { success: false, message: "Review record not found in ledger." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("GET /api/reviews/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to fetch review record.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Not authorized" },
        { status: 401 }
      );
    }

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID format" },
        { status: 400 }
      );
    }

    await connectDB();

    const deleted = await ReviewModel.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId(userId),
    });

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Review not found or already deleted." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Review record expunged from ledger.",
    });
  } catch (error) {
    console.error("DELETE /api/reviews/[id] error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete review record.",
      },
      { status: 500 }
    );
  }
}
