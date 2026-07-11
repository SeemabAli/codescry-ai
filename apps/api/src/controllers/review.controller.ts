import { isValidObjectId, Types } from "mongoose";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ReviewModel } from "../models/Review.model";
import { analyzeReviewWithAI } from "../services/ai.service";
import { createReviewSchema } from "../validations/review.validation";

export async function createReviewController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const validation = createReviewSchema.safeParse(req.body);

    if (!validation.success) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
      return;
    }

    const { title, fileName, codeType, reviewMode, code } = validation.data;

    const reviewTitle =
      title || `${fileName} - ${reviewMode.replaceAll("-", " ")}`;

    const review = await ReviewModel.create({
      userId: new Types.ObjectId(userId),
      title: reviewTitle,
      fileName,
      codeType,
      reviewMode,
      originalCode: code,
      status: "pending",
      score: null,
      summary: "",
      improvedCode: "",
      issues: [],
      learningNotes: [],
      recommendedTopics: [],
      aiProvider: "",
      errorMessage: "",
    });

    try {
      const aiResult = await analyzeReviewWithAI({
        fileName,
        codeType,
        reviewMode,
        code,
      });

      const completedReview = await ReviewModel.findByIdAndUpdate(
        review.id,
        {
          status: "completed",
          score: aiResult.score,
          summary: aiResult.summary,
          issues: aiResult.issues,
          improvedCode: aiResult.improvedCode,
          learningNotes: aiResult.learningNotes,
          recommendedTopics: aiResult.recommendedTopics,
          aiProvider: aiResult.aiProvider,
          errorMessage: "",
        },
        {
          new: true,
        }
      );

      res.status(201).json({
        success: true,
        message: "Review analyzed successfully",
        review: completedReview,
      });
      return;
    } catch (aiError) {
      const errorMessage =
        aiError instanceof Error ? aiError.message : "AI analysis failed";

      const failedReview = await ReviewModel.findByIdAndUpdate(
        review.id,
        {
          status: "failed",
          errorMessage,
        },
        {
          new: true,
        }
      );

      res.status(502).json({
        success: false,
        message:
          "Review was saved, but AI analysis failed. Please check AI service.",
        review: failedReview,
      });
      return;
    }
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
    return;
  }
}

export async function getReviewsController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const reviews = await ReviewModel.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .select("-originalCode -improvedCode")
      .lean();

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
    return;
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
    return;
  }
}

export async function getReviewByIdController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    const reviewId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    if (!isValidObjectId(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
      return;
    }

    const review = await ReviewModel.findOne({
      _id: reviewId,
      userId,
    }).lean();

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      review,
    });
    return;
  } catch (error) {
    console.error("Get review by id error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get review",
    });
    return;
  }
}

export async function deleteReviewController(
  req: AuthenticatedRequest,
  res: Response
): Promise<void> {
  try {
    const userId = req.user?.id;
    const reviewId = req.params.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    if (!isValidObjectId(reviewId)) {
      res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
      return;
    }

    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      userId,
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
    return;
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
    return;
  }
}