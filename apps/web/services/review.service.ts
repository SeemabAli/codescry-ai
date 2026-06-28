import type {
  CreateReviewPayload,
  CreateReviewResponse,
  GetReviewResponse,
  GetReviewsResponse,
} from "@/types/review";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

async function getErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as ApiErrorBody;

    if (data.message) {
      return data.message;
    }

    return "Something went wrong";
  } catch {
    return "Something went wrong";
  }
}

export async function createReview(
  payload: CreateReviewPayload,
  token: string
) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as CreateReviewResponse;
}

export async function getReviews(token: string) {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as GetReviewsResponse;
}

export async function getReviewById(reviewId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as GetReviewResponse;
}

export async function deleteReview(reviewId: string, token: string) {
  const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as {
    success: boolean;
    message: string;
  };
}