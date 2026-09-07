// ============================================================================
// Core Review Types matching Backend Pydantic v2 Schemas field-for-field
// ============================================================================

export type SeverityLevel = "low" | "medium" | "high" | "critical";

// Backward compatibility alias
export type Severity = "Critical" | "High" | "Medium" | "Low" | "Suggestion";

export type IssueCategory =
  | "Bug"
  | "Security"
  | "Performance"
  | "Best Practice"
  | "Maintainability"
  | "Accessibility"
  | "Architecture";

export interface ReviewIssueDetail {
  title: string;
  category: IssueCategory | string;
  severity_level: SeverityLevel;
  line_number?: number | null;
  explanation: string;
  recommendation: string;
  code_example?: string;
  // Backward compatibility alias
  severity?: Severity;
  lineNumber?: number | null;
  codeExample?: string;
}

// Backward compatibility alias
export type ReviewIssue = ReviewIssueDetail;

export interface CodeReviewStructuredResponse {
  code_score: number;
  detected_issues: ReviewIssueDetail[];
  severity_level: SeverityLevel;
  improved_code: string;
  learning_recommendations: string[];
  summary?: string;
  ai_provider?: string;
}

export interface CodeReviewRequestPayload {
  file_name?: string;
  code_type?: string;
  review_mode?: string;
  code: string;
}

// ============================================================================
// Agentic PR Review & LangGraph Human-In-The-Loop State Types
// ============================================================================

export type AgentReviewStatus =
  | "evaluating"
  | "pending_approval"
  | "approved"
  | "rejected"
  | "completed"
  | "revised";

export interface RetrievedBestPractice {
  id?: number;
  category: string;
  title: string;
  guideline: string;
  score?: number;
}

export interface GitHubActionResult {
  action: string;
  comment_count: number;
  summary_posted: string;
  pr_url: string;
  is_live_call?: boolean;
  status_message: string;
}

export interface AgentHumanDecision {
  decision: "approved" | "rejected" | "revise";
  feedback?: string;
}

export interface AgentPRReviewState {
  thread_id: string;
  owner: string;
  repo: string;
  pull_number: number;
  pr_title: string;
  pr_author: string;
  pr_url: string;
  diff_content: string;
  retrieved_rules: RetrievedBestPractice[];
  review_result: CodeReviewStructuredResponse | null;
  human_decision: AgentHumanDecision | null;
  status: AgentReviewStatus;
  revision_cycle_count?: number;
  github_action_result: GitHubActionResult | null;
  error?: string | null;
}

export interface StartAgentPRReviewPayload {
  owner: string;
  repo: string;
  pull_number: number;
  custom_diff?: string;
  thread_id?: string;
}

export interface ResumeAgentPRReviewPayload {
  decision: "approved" | "rejected" | "revise";
  feedback?: string;
}

export interface AgentPRReviewApiResponse {
  success: boolean;
  message: string;
  thread_id: string;
  status: AgentReviewStatus;
  state: AgentPRReviewState;
}

// ============================================================================
// Monorepo DB Review Entity (for dashboard history & persistence)
// ============================================================================

export type ReviewStatus = "pending" | "completed" | "failed" | "pending_approval" | "approved" | "rejected";

export type Review = {
  _id: string;
  userId?: string;
  title: string;
  fileName: string;
  codeType: string;
  reviewMode: string;
  status: ReviewStatus;
  originalCode: string;
  improvedCode: string;
  score: number | null;
  summary: string;
  issues: ReviewIssueDetail[];
  learningNotes: string[];
  recommendedTopics: string[];
  aiProvider: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt?: string;
  threadId?: string;
  agentState?: AgentPRReviewState;
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