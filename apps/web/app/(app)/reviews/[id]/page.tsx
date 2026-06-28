"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/types/review";
import { getReviewById } from "@/services/review.service";
import { getAuthToken } from "@/utils/auth-storage";

export default function ReviewDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const reviewId = params.id;

  useEffect(() => {
    async function loadReview() {
      const token = getAuthToken();

      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        const response = await getReviewById(reviewId, token);
        setReview(response.review);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load review");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadReview();
  }, [reviewId, router]);

  const statusLabel = useMemo(() => {
    if (!review) return "";

    if (review.status === "pending") return "Pending AI Processing";
    if (review.status === "completed") return "Completed";
    return "Failed";
  }, [review]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-5 text-sm text-slate-400">Loading review...</p>
        </div>
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="rounded-3xl border border-red-400/30 bg-red-400/10 p-6">
        <h1 className="text-xl font-semibold text-red-300">
          Failed to load review
        </h1>

        <p className="mt-3 text-sm text-red-200">
          {error || "Review not found"}
        </p>

        <Link
          href="/reviews"
          className="mt-5 inline-flex rounded-xl bg-red-300 px-4 py-2 text-sm font-semibold text-slate-950"
        >
          Back to reviews
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-300">Review Details</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {review.title}
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Review for{" "}
            <span className="text-slate-200">{review.fileName}</span>
          </p>
        </div>

        <Link
          href="/reviews/new"
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          New Review
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-4">
        <StatCard
          label="Status"
          value={statusLabel}
          description="Current state"
        />

        <StatCard
          label="Score"
          value={review.score === null ? "--" : `${review.score}/100`}
          description="Code quality"
        />

        <StatCard
          label="Issues"
          value={String(review.issues.length)}
          description="Detected problems"
        />

        <StatCard
          label="Mode"
          value={review.reviewMode}
          description="Review type"
        />
      </div>

      {review.status === "pending" ? (
        <section className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-6">
          <h2 className="text-xl font-semibold text-yellow-300">
            AI processing not connected yet
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-yellow-100/80">
            This review was saved successfully in MongoDB. In the next step, we
            will connect this flow to the FastAPI AI service so CodeScry AI can
            generate score, issues, summary, and improved code automatically.
          </p>
        </section>
      ) : null}

      <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <h2 className="text-xl font-semibold">Submitted Code</h2>

        <pre className="mt-5 max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-slate-950 p-5 text-sm leading-6 text-slate-200">
          <code>{review.originalCode}</code>
        </pre>
      </section>
    </>
  );
}

function StatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-3 break-words text-2xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}