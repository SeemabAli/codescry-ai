import type {
  AgentPRReviewApiResponse,
  CodeReviewRequestPayload,
  CodeReviewStructuredResponse,
  CreateReviewPayload,
  CreateReviewResponse,
  GetReviewResponse,
  GetReviewsResponse,
  ResumeAgentPRReviewPayload,
  StartAgentPRReviewPayload,
} from "@/types/review";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "/api";

const AI_SERVICE_BASE_URL =
  process.env.NEXT_PUBLIC_AI_SERVICE_URL || "/api/ai";

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  detail?: string;
  errors?: Record<string, string[]>;
};

async function extractErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ApiErrorBody;
    return data.detail || data.message || `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

/**
 * Resilient fetch that attempts primary URL first (e.g. external microservice),
 * and transparently falls back to local Next.js /api handler if a network
 * error occurs (e.g. server offline / Failed to fetch).
 */
async function resilientFetch(
  primaryUrl: string,
  fallbackUrl: string,
  init?: RequestInit
): Promise<Response> {
  try {
    const res = await fetch(primaryUrl, init);
    // If external service is unavailable (502/503/504) or missing route (404), attempt fallback
    if (!res.ok && (res.status === 404 || res.status >= 502) && primaryUrl !== fallbackUrl) {
      try {
        const fallbackRes = await fetch(fallbackUrl, init);
        if (fallbackRes.ok) return fallbackRes;
      } catch {
        // Keep primary response
      }
    }
    return res;
  } catch (err) {
    // Network failure (e.g. Failed to fetch / ECONNREFUSED on port 5000 or 8000)
    if (primaryUrl !== fallbackUrl) {
      return await fetch(fallbackUrl, init);
    }
    throw err;
  }
}

// ============================================================================
// AI Review & Agentic Endpoints
// ============================================================================

/**
 * Calls /api/review-code for Gemini structured code analysis.
 */
export async function reviewCodeStructured(
  payload: CodeReviewRequestPayload
): Promise<CodeReviewStructuredResponse> {
  const primaryUrl = `${AI_SERVICE_BASE_URL}/api/review-code`;
  const fallbackUrl = `/api/ai/review-code`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      file_name: payload.file_name || "code_snippet.ts",
      code_type: payload.code_type || "typescript",
      review_mode: payload.review_mode || "deep-review",
      code: payload.code,
    }),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as CodeReviewStructuredResponse;
}

/**
 * Initiates an autonomous agent PR review via LangGraph.
 * Pauses at the human-in-the-loop checkpoint.
 */
export async function startAgentPRReview(
  payload: StartAgentPRReviewPayload
): Promise<AgentPRReviewApiResponse> {
  const primaryUrl = `${AI_SERVICE_BASE_URL}/api/agent/review-pr`;
  const fallbackUrl = `/api/ai/agent/review-pr`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as AgentPRReviewApiResponse;
}

/**
 * Retrieves live state for an agent PR review.
 */
export async function getAgentPRReviewState(
  threadId: string
): Promise<AgentPRReviewApiResponse> {
  const primaryUrl = `${AI_SERVICE_BASE_URL}/api/agent/review-pr/${encodeURIComponent(threadId)}/state`;
  const fallbackUrl = `/api/ai/agent/review-pr/${encodeURIComponent(threadId)}/state`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as AgentPRReviewApiResponse;
}

/**
 * Submits the human operator approval/rejection decision and resumes the agent graph.
 */
export async function resumeAgentPRReview(
  threadId: string,
  payload: ResumeAgentPRReviewPayload
): Promise<AgentPRReviewApiResponse> {
  const primaryUrl = `${AI_SERVICE_BASE_URL}/api/agent/review-pr/${encodeURIComponent(threadId)}/resume`;
  const fallbackUrl = `/api/ai/agent/review-pr/${encodeURIComponent(threadId)}/resume`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as AgentPRReviewApiResponse;
}

// ============================================================================
// Review Database Persistence Methods
// ============================================================================

export async function createReview(
  payload: CreateReviewPayload,
  token: string
) {
  const primaryUrl = `${API_BASE_URL}/reviews`;
  const fallbackUrl = `/api/reviews`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as CreateReviewResponse;
}

export async function getReviews(token: string) {
  const primaryUrl = `${API_BASE_URL}/reviews`;
  const fallbackUrl = `/api/reviews`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as GetReviewsResponse;
}

export async function getReviewById(reviewId: string, token: string) {
  const primaryUrl = `${API_BASE_URL}/reviews/${reviewId}`;
  const fallbackUrl = `/api/reviews/${reviewId}`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as GetReviewResponse;
}

export async function deleteReview(reviewId: string, token: string) {
  const primaryUrl = `${API_BASE_URL}/reviews/${reviewId}`;
  const fallbackUrl = `/api/reviews/${reviewId}`;

  const response = await resilientFetch(primaryUrl, fallbackUrl, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await extractErrorMessage(response));
  }

  return (await response.json()) as {
    success: boolean;
    message: string;
  };
}