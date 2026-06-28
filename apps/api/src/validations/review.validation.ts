import { z } from "zod";

export const codeTypeValues = [
  "react-component",
  "express-route",
  "express-controller",
  "mongoose-model",
  "javascript-utility",
] as const;

export const reviewModeValues = [
  "quick-review",
  "deep-review",
  "security-focused",
  "performance-focused",
  "learning-mode",
] as const;

export const createReviewSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(120, "Title cannot be more than 120 characters")
    .optional(),

  fileName: z
    .string()
    .trim()
    .min(1, "File name is required")
    .max(120, "File name cannot be more than 120 characters"),

  codeType: z.enum(codeTypeValues, {
    message: "Invalid code type",
  }),

  reviewMode: z.enum(reviewModeValues, {
    message: "Invalid review mode",
  }),

  code: z
    .string()
    .min(10, "Code must be at least 10 characters")
    .max(50000, "Code cannot be more than 50,000 characters"),
});