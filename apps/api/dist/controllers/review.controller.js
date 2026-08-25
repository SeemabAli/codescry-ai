"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewController = createReviewController;
exports.getReviewsController = getReviewsController;
exports.getReviewByIdController = getReviewByIdController;
exports.deleteReviewController = deleteReviewController;
const mongoose_1 = require("mongoose");
const Review_model_1 = require("../models/Review.model");
const ai_service_1 = require("../services/ai.service");
const review_validation_1 = require("../validations/review.validation");
async function createReviewController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const validation = review_validation_1.createReviewSchema.safeParse(req.body);
        if (!validation.success) {
            res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors,
            });
            return;
        }
        const { title, fileName, codeType, reviewMode, code } = validation.data;
        const reviewTitle = title || `${fileName} - ${reviewMode.replaceAll("-", " ")}`;
        const review = await Review_model_1.ReviewModel.create({
            userId: new mongoose_1.Types.ObjectId(userId),
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
            const aiResult = await (0, ai_service_1.analyzeReviewWithAI)({
                fileName,
                codeType,
                reviewMode,
                code,
            });
            const completedReview = await Review_model_1.ReviewModel.findByIdAndUpdate(review.id, {
                status: "completed",
                score: aiResult.score,
                summary: aiResult.summary,
                issues: aiResult.issues,
                improvedCode: aiResult.improvedCode,
                learningNotes: aiResult.learningNotes,
                recommendedTopics: aiResult.recommendedTopics,
                aiProvider: aiResult.aiProvider,
                errorMessage: "",
            }, {
                new: true,
            });
            res.status(201).json({
                success: true,
                message: "Review analyzed successfully",
                review: completedReview,
            });
            return;
        }
        catch (aiError) {
            const errorMessage = aiError instanceof Error ? aiError.message : "AI analysis failed";
            const failedReview = await Review_model_1.ReviewModel.findByIdAndUpdate(review.id, {
                status: "failed",
                errorMessage,
            }, {
                new: true,
            });
            res.status(502).json({
                success: false,
                message: "Review was saved, but AI analysis failed. Please check AI service.",
                review: failedReview,
            });
            return;
        }
    }
    catch (error) {
        console.error("Create review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create review",
        });
        return;
    }
}
async function getReviewsController(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({
                success: false,
                message: "Not authorized",
            });
            return;
        }
        const reviews = await Review_model_1.ReviewModel.find({
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
    }
    catch (error) {
        console.error("Get reviews error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get reviews",
        });
        return;
    }
}
async function getReviewByIdController(req, res) {
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
        if (!(0, mongoose_1.isValidObjectId)(reviewId)) {
            res.status(400).json({
                success: false,
                message: "Invalid review id",
            });
            return;
        }
        const review = await Review_model_1.ReviewModel.findOne({
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
    }
    catch (error) {
        console.error("Get review by id error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get review",
        });
        return;
    }
}
async function deleteReviewController(req, res) {
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
        if (!(0, mongoose_1.isValidObjectId)(reviewId)) {
            res.status(400).json({
                success: false,
                message: "Invalid review id",
            });
            return;
        }
        const review = await Review_model_1.ReviewModel.findOneAndDelete({
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
    }
    catch (error) {
        console.error("Delete review error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete review",
        });
        return;
    }
}
