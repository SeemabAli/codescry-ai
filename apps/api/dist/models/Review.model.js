"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewModel = void 0;
const mongoose_1 = require("mongoose");
const issueSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        enum: [
            "Bug",
            "Security",
            "Performance",
            "Best Practice",
            "Maintainability",
            "Accessibility",
        ],
        required: true,
    },
    severity: {
        type: String,
        enum: ["Critical", "High", "Medium", "Low", "Suggestion"],
        required: true,
    },
    lineNumber: {
        type: Number,
        default: null,
    },
    explanation: {
        type: String,
        required: true,
    },
    recommendation: {
        type: String,
        required: true,
    },
    codeExample: {
        type: String,
        default: "",
    },
}, {
    _id: false,
});
const reviewSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    fileName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 120,
    },
    codeType: {
        type: String,
        required: true,
        enum: [
            "react-component",
            "express-route",
            "express-controller",
            "mongoose-model",
            "javascript-utility",
        ],
    },
    reviewMode: {
        type: String,
        required: true,
        enum: [
            "quick-review",
            "deep-review",
            "security-focused",
            "performance-focused",
            "learning-mode",
        ],
    },
    status: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending",
        index: true,
    },
    originalCode: {
        type: String,
        required: true,
    },
    improvedCode: {
        type: String,
        default: "",
    },
    score: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
    },
    summary: {
        type: String,
        default: "",
    },
    issues: {
        type: [issueSchema],
        default: [],
    },
    learningNotes: {
        type: [String],
        default: [],
    },
    recommendedTopics: {
        type: [String],
        default: [],
    },
    aiProvider: {
        type: String,
        default: "",
    },
    errorMessage: {
        type: String,
        default: "",
    },
}, {
    timestamps: true,
});
reviewSchema.index({ userId: 1, createdAt: -1 });
exports.ReviewModel = (0, mongoose_1.model)("Review", reviewSchema);
