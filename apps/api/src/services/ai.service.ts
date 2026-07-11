import axios from "axios";

type AnalyzeReviewPayload = {
  fileName: string;
  codeType: string;
  reviewMode: string;
  code: string;
};

type AiReviewIssue = {
  title: string;
  category:
    | "Bug"
    | "Security"
    | "Performance"
    | "Best Practice"
    | "Maintainability"
    | "Accessibility";
  severity: "Critical" | "High" | "Medium" | "Low" | "Suggestion";
  lineNumber?: number | null;
  explanation: string;
  recommendation: string;
  codeExample?: string;
};

export type AnalyzeReviewResult = {
  score: number;
  summary: string;
  issues: AiReviewIssue[];
  improvedCode: string;
  learningNotes: string[];
  recommendedTopics: string[];
  aiProvider: string;
};

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function analyzeReviewWithAI(
  payload: AnalyzeReviewPayload
): Promise<AnalyzeReviewResult> {
  try {
    const response = await axios.post<AnalyzeReviewResult>(
      `${AI_SERVICE_URL}/api/reviews/analyze`,
      payload,
      {
        timeout: 60000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        error.message ||
        "AI service request failed";

      throw new Error(`AI service error: ${message}`);
    }

    throw new Error("Failed to connect to AI service");
  }
}