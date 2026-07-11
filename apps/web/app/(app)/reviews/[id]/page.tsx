"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CodeBlock } from "@/components/reviews/CodeBlock";
import { IssueCard } from "@/components/reviews/IssueCard";
import { deleteReview, getReviewById } from "@/services/review.service";
import type { Review } from "@/types/review";
import { getAuthToken } from "@/utils/auth-storage";

export default function ReviewDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [review, setReview] = useState<Review | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

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

  async function handleDeleteReview() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this review?",
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    setIsDeleting(true);

    try {
      await deleteReview(reviewId, token);
      router.push("/reviews");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete review");
      }
    } finally {
      setIsDeleting(false);
    }
  }

  const highPriorityIssues = useMemo(() => {
    if (!review) return [];

    return review.issues.filter(
      (issue) => issue.severity === "Critical" || issue.severity === "High",
    );
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
            Review for <span className="text-slate-200">{review.fileName}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            href="/reviews"
            className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            History
          </Link>

          <Link
            href="/reviews/new"
            className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            New Review
          </Link>
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleDeleteReview}
            className={
              isDeleting
                ? "cursor-not-allowed rounded-xl bg-slate-700 px-5 py-3 text-sm font-semibold text-slate-400"
                : "rounded-xl border border-red-400/20 bg-red-400/10 px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/20"
            }
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {/* Stats */}
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
          label="High Priority"
          value={String(highPriorityIssues.length)}
          description="Critical or high"
        />
      </div>

      {/* Failed State */}
      {review.status === "failed" ? (
        <section className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-6">
          <h2 className="text-xl font-semibold text-red-300">
            AI Analysis Failed
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-red-100/80">
            {review.errorMessage ||
              "The review was saved, but AI analysis could not be completed."}
          </p>
        </section>
      ) : null}

      {/* Pending State */}
      {review.status === "pending" ? (
        <section className="mt-8 rounded-3xl border border-yellow-400/30 bg-yellow-400/10 p-6">
          <h2 className="text-xl font-semibold text-yellow-300">
            AI Processing Pending
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-yellow-100/80">
            This review is waiting for AI analysis. If this stays pending for a
            long time, check the backend and AI service.
          </p>
        </section>
      ) : null}

      {/* Summary */}
      {review.summary ? (
        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-xl font-semibold">Summary</h2>

          <p className="mt-4 leading-7 text-slate-400">{review.summary}</p>

          <div className="mt-5 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-slate-300">
              {review.codeType}
            </span>

            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-slate-300">
              {review.reviewMode}
            </span>

            {review.aiProvider ? (
              <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-slate-300">
                {review.aiProvider}
              </span>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* Issues */}
      {review.issues.length > 0 ? (
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">
              Detected Issues
            </h2>

            <p className="text-sm text-slate-500">
              {review.issues.length} issues
            </p>
          </div>

          <div className="space-y-5">
            {review.issues.map((issue, index) => (
              <IssueCard
                key={`${issue.title}-${index}`}
                issue={issue}
                index={index}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Code Comparison */}
      <section className="mt-10">
        <h2 className="text-2xl font-bold tracking-tight">Code</h2>

        <div className="mt-5 grid gap-6 xl:grid-cols-2">
          <CodeBlock title="Original Code" code={review.originalCode} />

          {review.improvedCode ? (
            <CodeBlock title="Improved Code" code={review.improvedCode} />
          ) : (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-6">
              <h3 className="font-semibold text-white">Improved Code</h3>

              <p className="mt-3 text-sm leading-6 text-slate-400">
                Improved code will appear here after AI analysis is completed.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Learning Notes */}
      {review.learningNotes.length > 0 ||
      review.recommendedTopics.length > 0 ? (
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          {review.learningNotes.length > 0 ? (
            <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
              <h2 className="text-xl font-semibold text-cyan-300">
                Learning Notes
              </h2>

              <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-300">
                {review.learningNotes.map((note) => (
                  <li key={note}>• {note}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {review.recommendedTopics.length > 0 ? (
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-xl font-semibold">Recommended Topics</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {review.recommendedTopics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-full border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
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

      <p className="mt-3 wrap-break-word text-2xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
