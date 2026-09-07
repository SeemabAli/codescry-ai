import { NextRequest, NextResponse } from "next/server";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
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

export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized. Please log in.",
        },
        { status: 401 }
      );
    }

    await connectDB();

    const reviews = await ReviewModel.find({
      userId: new Types.ObjectId(userId),
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load reviews.",
        reviews: [],
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Not authorized. Please log in.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, fileName, codeType, reviewMode, code, improvedCode, score, summary, issues, learningNotes, recommendedTopics } = body;

    if (!code) {
      return NextResponse.json(
        {
          success: false,
          message: "Source code is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const newReview = await ReviewModel.create({
      userId: new Types.ObjectId(userId),
      title: title || `${fileName || "script"} - ${reviewMode || "review"}`,
      fileName: fileName || "code.ts",
      codeType: codeType || "typescript",
      reviewMode: reviewMode || "deep-review",
      status: "completed",
      originalCode: code,
      improvedCode: improvedCode || "",
      score: typeof score === "number" ? score : 85,
      summary: summary || "Automated review evaluation completed.",
      issues: Array.isArray(issues) ? issues : [],
      learningNotes: Array.isArray(learningNotes) ? learningNotes : [],
      recommendedTopics: Array.isArray(recommendedTopics) ? recommendedTopics : [],
      aiProvider: "Gemini 2.5",
    });

    return NextResponse.json(
      {
        success: true,
        message: "Review recorded in ledger.",
        review: newReview,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Failed to create review.",
      },
      { status: 500 }
    );
  }
}
