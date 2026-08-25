"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = exports.reviewModeValues = exports.codeTypeValues = void 0;
const zod_1 = require("zod");
exports.codeTypeValues = [
    "react-component",
    "express-route",
    "express-controller",
    "mongoose-model",
    "javascript-utility",
];
exports.reviewModeValues = [
    "quick-review",
    "deep-review",
    "security-focused",
    "performance-focused",
    "learning-mode",
];
exports.createReviewSchema = zod_1.z.object({
    title: zod_1.z
        .string()
        .trim()
        .min(2, "Title must be at least 2 characters")
        .max(120, "Title cannot be more than 120 characters")
        .optional(),
    fileName: zod_1.z
        .string()
        .trim()
        .min(1, "File name is required")
        .max(120, "File name cannot be more than 120 characters"),
    codeType: zod_1.z.enum(exports.codeTypeValues, {
        message: "Invalid code type",
    }),
    reviewMode: zod_1.z.enum(exports.reviewModeValues, {
        message: "Invalid review mode",
    }),
    code: zod_1.z
        .string()
        .min(10, "Code must be at least 10 characters")
        .max(50000, "Code cannot be more than 50,000 characters"),
});
