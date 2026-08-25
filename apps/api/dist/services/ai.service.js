"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeReviewWithAI = analyzeReviewWithAI;
const axios_1 = __importDefault(require("axios"));
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";
async function analyzeReviewWithAI(payload) {
    try {
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/api/reviews/analyze`, payload, {
            timeout: 60000,
            headers: {
                "Content-Type": "application/json",
            },
        });
        return response.data;
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            const message = error.response?.data?.detail ||
                error.response?.data?.message ||
                error.message ||
                "AI service request failed";
            throw new Error(`AI service error: ${message}`);
        }
        throw new Error("Failed to connect to AI service");
    }
}
