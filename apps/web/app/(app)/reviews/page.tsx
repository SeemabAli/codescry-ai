"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Review } from "@/types/review";
import { getReviews } from "@/services/review.service";
import { getAuthToken } from "@/utils/auth-storage";

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [search, setSearch] = useState("");
  const [codeType, setCodeType] = useState("all");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    loadReviews();
  }, []);

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
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-300">Review History</p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your code reviews
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            View your previous AI code reviews, scores, issues, and improved
            code suggestions.
          </p>
        </div>

        <Link
          href="/reviews/new"
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          New Review
        </Link>
      </div>

      <div className="mt-8 flex flex-col gap-4 md:flex-row">
        <input
          type="text"
          placeholder="Search reviews..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400 md:max-w-sm"
        />

        <select
          value={codeType}
          onChange={(event) => setCodeType(event.target.value)}
          className="rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
        >
          <option value="all">All code types</option>
          <option value="react-component">React Component</option>
          <option value="express-route">Express Route</option>
          <option value="express-controller">Express Controller</option>
          <option value="mongoose-model">Mongoose Model</option>
          <option value="javascript-utility">JavaScript Utility</option>
        </select>
      </div>

      {isLoading ? (
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
          <p className="mt-5 text-sm text-slate-400">Loading reviews...</p>
        </div>
      ) : null}

      {error ? (
        <div className="mt-10 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-red-300">
          {error}
        </div>
      ) : null}

      {!isLoading && !error && filteredReviews.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
            0
          </div>

          <h2 className="mt-6 text-xl font-semibold">No reviews found</h2>

          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
            You have not created any code reviews yet. Submit your first code
            snippet and your review history will appear here.
          </p>

          <Link
            href="/reviews/new"
            className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Create First Review
          </Link>
        </div>
      ) : null}

      {!isLoading && !error && filteredReviews.length > 0 ? (
        <div className="mt-10 grid gap-5">
          {filteredReviews.map((review) => (
            <Link
              key={review._id}
              href={`/reviews/${review._id}`}
              className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-cyan-400/40 hover:bg-white/[0.06]"
            >
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-semibold text-white">
                      {review.title}
                    </h2>

                    <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-xs text-slate-300">
                      {review.status}
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {review.fileName} • {review.codeType} • {review.reviewMode}
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
      ) : null}
    </>
  );
}