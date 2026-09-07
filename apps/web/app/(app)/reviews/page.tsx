"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { deleteReview, getReviews } from "@/services/review.service";
import type { Review } from "@/types/review";
import { getAuthToken } from "@/utils/auth-storage";
import { WaxSealBadge } from "../dashboard/page";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [codeType, setCodeType] = useState("all");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    loadReviews();
  }, []);

  async function loadReviews() {
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
        setError("Failed to load reviews");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteReview(reviewId: string) {
    const confirmed = window.confirm(
      "Remove this review entry from the ledger?"
    );

    if (!confirmed) return;

    const token = getAuthToken();

    if (!token) {
      setError("You are not logged in.");
      return;
    }

    setDeletingId(reviewId);

    try {
      await deleteReview(reviewId, token);

      setReviews((currentReviews) =>
        currentReviews.filter((review) => review._id !== reviewId)
      );
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to delete review");
      }
    } finally {
      setDeletingId("");
    }
  }

  const filteredReviews = useMemo(() => {
    return reviews.filter((review) => {
      const matchesSearch =
        review.title.toLowerCase().includes(search.toLowerCase()) ||
        review.fileName.toLowerCase().includes(search.toLowerCase());

      const matchesCodeType = codeType === "all" || review.codeType === codeType;

      return matchesSearch && matchesCodeType;
    });
  }, [reviews, search, codeType]);

  return (
    <div className="max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--ink-hairline)] pb-6 md:flex-row md:items-end">
        <div>
          <div className="font-mono text-xs text-[var(--ink-faint)] flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
            <span>Ledger Archives</span>
          </div>

          <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--ink)]">
            Review History
          </h1>

          <p className="mt-1 text-xs text-[var(--ink-faint)] max-w-xl">
            Complete archive of annotated pull requests, margin evaluations, and reviewer decisions.
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

      {/* Filter Row */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row text-xs">
        <input
          type="text"
          placeholder="Filter by title or filename..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full sm:max-w-xs rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]/50 focus:border-[var(--pen)]"
        />

        <select
          value={codeType}
          onChange={(event) => setCodeType(event.target.value)}
          className="rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--pen)]"
        >
          <option value="all">All file types</option>
          <option value="react-component">React Component</option>
          <option value="express-route">Express Route</option>
          <option value="express-controller">Express Controller</option>
          <option value="mongoose-model">Mongoose Model</option>
          <option value="javascript-utility">JavaScript Utility</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-10 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-12 text-center">
          <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-[var(--pen)] border-t-transparent" />
          <p className="mt-4 font-mono text-xs text-[var(--ink-faint)]">
            Loading archive entries...
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-8 rounded-[4px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] p-4 text-xs text-[var(--pen)]">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && filteredReviews.length === 0 ? (
        <div className="mt-10 rounded-[4px] border border-dashed border-[var(--ink-hairline)] bg-[var(--paper)] p-12 text-center">
          <div className="font-mono text-sm text-[var(--ink-faint)] mb-2">◇</div>
          <h2 className="font-serif text-xl font-normal text-[var(--ink)]">
            No entries matched your search.
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-xs text-[var(--ink-faint)]">
            Adjust your filter keywords or submit a new diff to the ledger.
          </p>
        </div>
      ) : null}

      {!isLoading && !error && filteredReviews.length > 0 ? (
        <div className="mt-6 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 border-b border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-4 py-2.5 font-mono text-[11px] text-[var(--ink-faint)] uppercase tracking-wider">
            <div className="col-span-5 sm:col-span-5">File & Description</div>
            <div className="col-span-3 sm:col-span-3">Status</div>
            <div className="col-span-2 sm:col-span-2 text-right">Score</div>
            <div className="col-span-2 sm:col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-[var(--ink-hairline)] font-mono text-xs">
            {filteredReviews.map((review) => (
              <div
                key={review._id}
                className="grid grid-cols-12 items-center px-4 py-3 hover:bg-[var(--paper-raised)] transition"
              >
                <div className="col-span-5 sm:col-span-5 pr-4">
                  <Link
                    href={`/reviews/${review._id}`}
                    className="font-sans text-xs font-medium text-[var(--ink)] hover:text-[var(--pen)] hover:underline block truncate"
                  >
                    {review.title}
                  </Link>
                  <div className="font-mono text-[10px] text-[var(--ink-faint)] mt-0.5 truncate">
                    {review.fileName} · {review.codeType} ·{" "}
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>

                <div className="col-span-3 sm:col-span-3">
                  <WaxSealBadge status={review.status} />
                </div>

                <div className="col-span-2 sm:col-span-2 text-right font-mono text-xs text-[var(--ink)]">
                  {review.score === null ? "—" : `${review.score}/100`}
                </div>

                <div className="col-span-2 sm:col-span-2 flex items-center justify-end gap-3">
                  <Link
                    href={`/reviews/${review._id}`}
                    className="text-[11px] font-medium text-[var(--pen)] hover:underline"
                  >
                    Open
                  </Link>
                  <button
                    type="button"
                    disabled={deletingId === review._id}
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-[11px] text-[var(--ink-faint)] hover:text-[var(--pen)] transition"
                  >
                    {deletingId === review._id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}