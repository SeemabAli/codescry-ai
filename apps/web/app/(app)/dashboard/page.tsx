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
        (issue) =>
          issue.severity === "Critical" ||
          issue.severity === "High" ||
          (issue as unknown as { severity_level?: string }).severity_level ===
            "critical" ||
          (issue as unknown as { severity_level?: string }).severity_level ===
            "high"
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

  const recentReviews = reviews.slice(0, 6);

  return (
    <div className="max-w-6xl pb-16">
      {/* Header Bar */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--ink-hairline)] pb-6 md:flex-row md:items-end">
        <div>
          <div className="font-mono text-xs text-[var(--ink-faint)] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
            <span>Editorial Ledger · Overview</span>
          </div>

          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--ink)]">
            Review Desk
          </h1>

          <p className="mt-1 text-xs text-[var(--ink-faint)] max-w-xl">
            Candidate pull requests, active margin notes, and code quality evaluations.
          </p>
        </div>

        <div>
          <Link
            href="/reviews/new"
            className="rounded-[4px] bg-[var(--pen)] px-4 py-2 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)] inline-flex items-center gap-2"
          >
            <span>Start New Review</span>
            <span className="font-mono opacity-70">→</span>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="mt-12 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-12 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--pen)] border-t-transparent" />
          <p className="mt-4 font-mono text-xs text-[var(--ink-faint)]">
            Reading ledger entries...
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-[4px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] p-4 text-xs text-[var(--pen)]">
          {error}
        </div>
      ) : null}

      {!isLoading && !error ? (
        <>
          {/* Stat Metrics Grid */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y md:divide-y-0 md:divide-x divide-[var(--ink-hairline)] border border-[var(--ink-hairline)] bg-[var(--paper)] rounded-[4px] overflow-hidden">
            <StatCell label="Total Reviews" value={String(stats.totalReviews)} />
            <StatCell label="Completed" value={String(stats.completedReviews)} />
            <StatCell
              label="Avg. Score"
              value={stats.averageScore === null ? "—" : `${stats.averageScore}/100`}
            />
            <StatCell label="Margin Notes" value={String(stats.totalIssues)} />
            <StatCell
              label="Critical"
              value={String(stats.highPriorityIssues)}
              accent={stats.highPriorityIssues > 0}
            />
            <StatCell label="Failed" value={String(stats.failedReviews)} />
          </div>

          {reviews.length === 0 ? (
            /* Empty State: Centered Fraunces headline, one action */
            <div className="mt-12 rounded-[4px] border border-dashed border-[var(--ink-hairline)] bg-[var(--paper)] p-12 text-center">
              <div className="font-mono text-sm text-[var(--ink-faint)] mb-2">◇</div>
              <h2 className="font-serif text-xl font-normal text-[var(--ink)]">
                No reviews yet in this ledger.
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-xs text-[var(--ink-faint)]">
                Submit a pull request diff or paste controller code to begin your first markup.
              </p>
              <div className="mt-6">
                <Link
                  href="/reviews/new"
                  className="rounded-[4px] bg-[var(--pen)] px-5 py-2 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)]"
                >
                  Create First Review
                </Link>
              </div>
            </div>
          ) : (
            /* Ledger Table of Recent Reviews */
            <section className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-serif text-xl font-normal text-[var(--ink)]">
                  Recent Ledger Entries
                </h2>

                <Link
                  href="/reviews"
                  className="font-mono text-xs text-[var(--ink-faint)] hover:text-[var(--ink)] underline underline-offset-4"
                >
                  View full history ({reviews.length}) →
                </Link>
              </div>

              <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 border-b border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-4 py-2 font-mono text-[11px] text-[var(--ink-faint)] uppercase tracking-wider">
                  <div className="col-span-5 sm:col-span-6">Diff / Title</div>
                  <div className="col-span-3 sm:col-span-2 text-left">Status</div>
                  <div className="col-span-2 text-right">Score</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-[var(--ink-hairline)] font-mono text-xs">
                  {recentReviews.map((review) => (
                    <div
                      key={review._id}
                      className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[var(--paper-raised)] transition"
                    >
                      <div className="col-span-5 sm:col-span-6 pr-4">
                        <Link
                          href={`/reviews/${review._id}`}
                          className="font-sans text-xs font-medium text-[var(--ink)] hover:text-[var(--pen)] hover:underline block truncate"
                        >
                          {review.title}
                        </Link>
                        <div className="font-mono text-[10px] text-[var(--ink-faint)] mt-0.5 truncate">
                          {review.fileName || "unnamed.diff"} · {review.codeType || "diff"}
                        </div>
                      </div>

                      <div className="col-span-3 sm:col-span-2">
                        <WaxSealBadge status={review.status} />
                      </div>

                      <div className="col-span-2 text-right font-mono text-xs text-[var(--ink)]">
                        {review.score === null ? "—" : `${review.score}/100`}
                      </div>

                      <div className="col-span-2 text-right">
                        <Link
                          href={`/reviews/${review._id}`}
                          className="text-[11px] font-medium text-[var(--pen)] hover:underline"
                        >
                          Open →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      ) : null}
    </div>
  );
}

function StatCell({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="p-4">
      <p className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
        {label}
      </p>
      <p
        className={`mt-1 font-serif text-2xl font-normal ${
          accent ? "text-[var(--pen)]" : "text-[var(--ink)]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

/**
 * Wax Seal Status Mark:
 * ■ Open — --ink
 * ■ Changes requested — --pen
 * ■ Approved — --diff-add
 * ■ Merged — --ink-faint
 */
export function WaxSealBadge({ status }: { status: string }) {
  const norm = (status || "").toLowerCase();

  if (norm === "completed" || norm === "approved") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--diff-add)]">
        <span className="text-[9px]">■</span>
        <span>Approved</span>
      </span>
    );
  }

  if (norm === "failed" || norm === "changes requested" || norm === "rejected") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--pen)] font-medium">
        <span className="text-[9px]">■</span>
        <span>Changes requested</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-[var(--ink)]">
      <span className="text-[9px]">■</span>
      <span>Open</span>
    </span>
  );
}