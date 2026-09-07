import mongoose, { Schema, type Model, Types } from "mongoose";

export interface IIssue {
  title: string;
  category: string;
  severity: "Critical" | "High" | "Medium" | "Low" | "Suggestion";
  severity_level?: "critical" | "high" | "medium" | "low";
  lineNumber?: number | null;
  explanation: string;
  recommendation: string;
  codeExample?: string;
}

export interface IReview {
  userId: Types.ObjectId;
  title: string;
  fileName: string;
  codeType: string;
  reviewMode: string;
  status: "pending" | "completed" | "failed" | "pending_approval" | "approved" | "rejected";
  originalCode: string;
  improvedCode?: string;
  score?: number | null;
  summary?: string;
  issues: IIssue[];
  learningNotes: string[];
  recommendedTopics: string[];
  aiProvider?: string;
  errorMessage?: string;
  threadId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const issueSchema = new Schema<IIssue>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    severity: {
      type: String,
      enum: ["Critical", "High", "Medium", "Low", "Suggestion"],
      default: "Medium",
    },
    severity_level: {
      type: String,
      enum: ["critical", "high", "medium", "low"],
      default: "medium",
    },
    lineNumber: { type: Number, default: null },
    explanation: { type: String, required: true },
    recommendation: { type: String, required: true },
    codeExample: { type: String, default: "" },
  },
  { _id: false }
);

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    codeType: {
      type: String,
      required: true,
      default: "typescript",
    },
    reviewMode: {
      type: String,
      required: true,
      default: "deep-review",
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "pending_approval", "approved", "rejected"],
      default: "completed",
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
      default: "Gemini 2.5",
    },
    errorMessage: {
      type: String,
      default: "",
    },
    threadId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.index({ userId: 1, createdAt: -1 });

export const ReviewModel: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>("Review", reviewSchema);
