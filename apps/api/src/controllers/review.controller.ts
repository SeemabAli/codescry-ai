import { isValidObjectId, Types } from "mongoose";
import type { Response } from "express";
import type { AuthenticatedRequest } from "../middlewares/auth.middleware";
import { ReviewModel } from "../models/Review.model";
import { createReviewSchema } from "../validations/review.validation";

export async function createReviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const validation = createReviewSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors,
      });
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

      // AI fields will be filled later by FastAPI/LangChain service
      status: "pending",
      score: null,
      summary: "",
      improvedCode: "",
      issues: [],
      learningNotes: [],
      recommendedTopics: [],
    });

    return res.status(201).json({
      success: true,
      message: "Review submitted successfully. AI processing will be connected next.",
      review,
    });
  } catch (error) {
    console.error("Create review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create review",
    });
  }
}

export async function getReviewsController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    const reviews = await ReviewModel.find({
      userId,
    })
      .sort({ createdAt: -1 })
      .select("-originalCode -improvedCode")
      .lean();

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error("Get reviews error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get reviews",
    });
  }
}

export async function getReviewByIdController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;
    const reviewId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
    }

    const review = await ReviewModel.findOne({
      _id: reviewId,
      userId,
    }).lean();

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    console.error("Get review by id error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get review",
    });
  }
}

export async function deleteReviewController(
  req: AuthenticatedRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;
    const reviewId = req.params.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!isValidObjectId(reviewId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review id",
      });
    }

    const review = await ReviewModel.findOneAndDelete({
      _id: reviewId,
      userId,
    });

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete review",
    });
  }
}