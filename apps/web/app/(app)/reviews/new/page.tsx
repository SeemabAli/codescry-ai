"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CodeEditor } from "@/components/reviews/CodeEditor";
import { codeTypes, reviewModes, sampleCode } from "@/constants/reviews";
import { createReview } from "@/services/review.service";
import { getAuthToken } from "@/utils/auth-storage";

export default function NewReviewPage() {
  const router = useRouter();

  const [fileName, setFileName] = useState("user.routes.js");
  const [codeType, setCodeType] = useState("express-route");
  const [reviewMode, setReviewMode] = useState("deep-review");
  const [code, setCode] = useState(sampleCode);

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCodeEmpty = code.trim().length === 0;

  async function handleAnalyzeCode() {
    setError("");

    const token = getAuthToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    if (isCodeEmpty) {
      setError("Please paste code before submitting.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createReview(
        {
          fileName,
          codeType,
          reviewMode,
          code,
        },
        token
      );

      router.push(`/reviews/${response.review._id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to submit review");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div>
        <p className="text-sm font-medium text-cyan-300">New Code Review</p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight">
          Review your code
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Paste your MERN stack code and CodeScry AI will analyze bugs,
          security issues, performance problems, and best practices.
        </p>
      </div>

      <div className="mt-10 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <div className="grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="fileName"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                File name
              </label>

              <input
                id="fileName"
                type="text"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                placeholder="example: LoginForm.tsx"
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="codeType"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Code type
              </label>

              <select
                id="codeType"
                value={codeType}
                onChange={(event) => setCodeType(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                {codeTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="reviewMode"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Review mode
              </label>

              <select
                id="reviewMode"
                value={reviewMode}
                onChange={(event) => setReviewMode(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400"
              >
                {reviewModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <div className="mb-2 flex items-center justify-between gap-4">
              <label className="block text-sm font-medium text-slate-300">
                Code
              </label>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500">
                  {code.length} characters
                </span>

                <button
                  type="button"
                  onClick={() => setCode(sampleCode)}
                  className="text-xs font-medium text-cyan-300 transition hover:text-cyan-200"
                >
                  Load sample
                </button>

                <button
                  type="button"
                  onClick={() => setCode("")}
                  className="text-xs font-medium text-slate-400 transition hover:text-white"
                >
                  Clear
                </button>
              </div>
            </div>

            <CodeEditor value={code} onChange={setCode} />
          </div>

          <div className="mt-6 flex flex-col justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
            <p className="text-sm text-slate-500">
              This will create a review record. AI processing will be connected
              in the next backend step.
            </p>

            <button
              type="button"
              disabled={isCodeEmpty || isSubmitting}
              onClick={handleAnalyzeCode}
              className={
                isCodeEmpty || isSubmitting
                  ? "cursor-not-allowed rounded-xl bg-slate-700 px-6 py-3 text-sm font-semibold text-slate-400"
                  : "rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
              }
            >
              {isSubmitting ? "Submitting..." : "Analyze Code"}
            </button>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">What will AI check?</h2>

            <ul className="mt-5 space-y-3 text-sm text-slate-400">
              <li>• Bugs and logic mistakes</li>
              <li>• Security vulnerabilities</li>
              <li>• Performance problems</li>
              <li>• Code quality and readability</li>
              <li>• MERN stack best practices</li>
              <li>• Improved/refactored code</li>
            </ul>
          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-cyan-400/10 p-6">
            <h2 className="text-lg font-semibold text-cyan-300">
              Learning Mode
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              CodeScry AI will not only tell you what is wrong. It will explain
              why it is wrong and how to fix it like a senior developer mentor.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
            <h2 className="text-lg font-semibold">Current Selection</h2>

            <div className="mt-5 space-y-3 text-sm text-slate-400">
              <div className="flex justify-between gap-4">
                <span>File</span>
                <span className="text-slate-200">{fileName || "Untitled"}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Code Type</span>
                <span className="text-slate-200">{codeType}</span>
              </div>

              <div className="flex justify-between gap-4">
                <span>Mode</span>
                <span className="text-slate-200">{reviewMode}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}