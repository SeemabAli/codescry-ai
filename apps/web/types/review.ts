export type ReviewStatus = "pending" | "completed" | "failed";

export type Severity = "Critical" | "High" | "Medium" | "Low" | "Suggestion";

export type IssueCategory =
  | "Bug"
  | "Security"
  | "Performance"
  | "Best Practice"
  | "Maintainability"
  | "Accessibility";

export type ReviewIssue = {
  title: string;
  category: IssueCategory;
  severity: Severity;
  lineNumber?: number | null;
  explanation: string;
  recommendation: string;
  codeExample?: string;
};

export type Review = {
  _id: string;
  userId: string;
  title: string;
  fileName: string;
  codeType: string;
  reviewMode: string;
  status: ReviewStatus;
  originalCode: string;
  improvedCode: string;
  score: number | null;
  summary: string;
  issues: ReviewIssue[];
  learningNotes: string[];
  recommendedTopics: string[];
  aiProvider: string;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateReviewPayload = {
  title?: string;
  fileName: string;
  codeType: string;
  reviewMode: string;
  code: string;
};

export type CreateReviewResponse = {
  success: boolean;
  message: string;
  review: Review;
};

export type GetReviewsResponse = {
  success: boolean;
  count: number;
  reviews: Review[];
};

export type GetReviewResponse = {
  success: boolean;
  review: Review;
};