"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getReviews } from "@/services/review.service";
import type { Review } from "@/types/review";
import { getAuthToken } from "@/utils/auth-storage";

export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      const token = getAuthToken();

      if (!token) {
        setError("You are not logged in.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getReviews(token);
        setReviews(response.reviews);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError("Failed to load dashboard data");
        }
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const stats = useMemo(() => {
    const completedReviews = reviews.filter(
      (review) => review.status === "completed"
    );

    const reviewsWithScore = completedReviews.filter(
      (review) => review.score !== null
    );

    const averageScore =
      reviewsWithScore.length > 0
        ? Math.round(
            reviewsWithScore.reduce(
              (total, review) => total + (review.score || 0),
              0
            ) / reviewsWithScore.length
          )
        : null;

    const totalIssues = reviews.reduce(
      (total, review) => total + review.issues.length,
      0
    );

    const highPriorityIssues = reviews.reduce((total, review) => {
      const count = review.issues.filter(
        (issue) => issue.severity === "Critical" || issue.severity === "High"
      ).length;

      return total + count;
    }, 0);

    const failedReviews = reviews.filter(
      (review) => review.status === "failed"
    ).length;

    return {
      totalReviews: reviews.length,
      completedReviews: completedReviews.length,
      averageScore,
      totalIssues,
      highPriorityIssues,
      failedReviews,
    };
  }, [reviews]);

  const recentReviews = reviews.slice(0, 5);

  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-300">
            Developer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome to CodeScry AI
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Track your code reviews, monitor your improvement, and start a new
            AI-powered code review.
          </p>
        </div>

        <Link
          href="/reviews/new"
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start New Review
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-5 text-sm text-slate-400">
            Loading dashboard data...
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-10 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          <div className="mt-10 grid gap-6 md:grid-cols-3 xl:grid-cols-6">
            <DashboardStatCard
              label="Total Reviews"
              value={String(stats.totalReviews)}
              description="Code reviews created"
            />

            <DashboardStatCard
              label="Completed"
              value={String(stats.completedReviews)}
              description="AI reviews completed"
            />

            <DashboardStatCard
              label="Average Score"
              value={stats.averageScore === null ? "--" : `${stats.averageScore}`}
              description="Code quality score"
            />

            <DashboardStatCard
              label="Issues Found"
              value={String(stats.totalIssues)}
              description="Total detected issues"
            />

            <DashboardStatCard
              label="High Priority"
              value={String(stats.highPriorityIssues)}
              description="Critical/high issues"
            />

            <DashboardStatCard
              label="Failed"
              value={String(stats.failedReviews)}
              description="Failed AI reviews"
            />
          </div>

          {reviews.length === 0 ? (
            <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                CS
              </div>

              <h2 className="mt-6 text-xl font-semibold">
                No code reviews yet
              </h2>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
                Your dashboard will show review history, issue trends, and code
                quality analytics after you submit your first code review.
              </p>

              <Link
                href="/reviews/new"
                className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Create First Review
              </Link>
            </div>
          ) : (
            <section className="mt-10">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">
                  Recent Reviews
                </h2>

                <Link
                  href="/reviews"
                  className="text-sm font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  View all
                </Link>
              </div>

              <div className="grid gap-5">
                {recentReviews.map((review) => (
                  <Link
                    key={review._id}
                    href={`/reviews/${review._id}`}
                    className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
                  >
                    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">
                            {review.title}
                          </h3>

                          <span className={getStatusClassName(review.status)}>
                            {review.status}
                          </span>
                        </div>

                        <p className="mt-2 text-sm text-slate-400">
                          {review.fileName} • {review.codeType}
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <p className="text-2xl font-bold text-white">
                          {review.score === null ? "--" : review.score}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">Score</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      ) : null}
    </>
  );
}

function DashboardStatCard({
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

      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function getStatusClassName(status: Review["status"]) {
  if (status === "completed") {
    return "rounded-full border border-green-400/30 bg-green-400/10 px-3 py-1 text-xs text-green-300";
  }

  if (status === "failed") {
    return "rounded-full border border-red-400/30 bg-red-400/10 px-3 py-1 text-xs text-red-300";
  }

  return "rounded-full border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300";
}