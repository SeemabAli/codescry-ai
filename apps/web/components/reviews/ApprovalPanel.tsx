"use client";

import { useState } from "react";
import { resumeAgentPRReview } from "@/services/review.service";
import type {
  AgentPRReviewState,
  AgentReviewStatus,
  GitHubActionResult,
} from "@/types/review";

type ApprovalPanelProps = {
  threadId: string;
  currentStatus: AgentReviewStatus;
  reviewSummary?: string;
  codeScore?: number | null;
  issuesCount?: number;
  githubActionResult?: GitHubActionResult | null;
  onDecisionSubmitted?: (updatedState: AgentPRReviewState) => void;
};

export function ApprovalPanel({
  threadId,
  currentStatus,
  codeScore,
  issuesCount = 0,
  githubActionResult,
  onDecisionSubmitted,
}: ApprovalPanelProps) {
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionResult, setActionResult] = useState<GitHubActionResult | null>(
    githubActionResult || null
  );
  const [status, setStatus] = useState<AgentReviewStatus>(currentStatus);
  const [justStamped, setJustStamped] = useState(false);

  const isPending = status === "pending_approval";

  async function handleDecision(decision: "approved" | "rejected" | "revise") {
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await resumeAgentPRReview(threadId, {
        decision,
        feedback: feedback.trim(),
      });

      setStatus(response.status);
      setJustStamped(true);
      if (response.state.github_action_result) {
        setActionResult(response.state.github_action_result);
      }
      if (onDecisionSubmitted) {
        onDecisionSubmitted(response.state);
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit approval decision.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 text-xs font-sans">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--ink-hairline)] pb-5 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--ink-faint)]">
            <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
            <span>Reviewer Decision Dock</span>
          </div>

          <h2 className="mt-1 font-serif text-xl font-normal text-[var(--ink)]">
            Review Authorization & Action
          </h2>

          <p className="mt-1 text-xs text-[var(--ink-faint)] max-w-xl">
            The AI scrying agent paused at this checkpoint. Evaluate the margin findings and execute your decision with the red pen.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[var(--ink-faint)]">Thread:</span>
          <span className="bg-[var(--paper-dim)] px-2 py-1 border border-[var(--ink-hairline)] rounded-[2px] text-[var(--ink)] truncate max-w-[160px]">
            {threadId}
          </span>
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-[2px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] p-3 text-xs text-[var(--pen)]">
          {error}
        </div>
      ) : null}

      {/* Snapshot Cells */}
      <div className="mt-5 grid grid-cols-3 divide-x divide-[var(--ink-hairline)] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] rounded-[3px] text-center font-mono">
        <div className="p-3">
          <span className="text-[10px] text-[var(--ink-faint)] uppercase">Quality Score</span>
          <p className="mt-0.5 font-serif text-xl text-[var(--ink)] font-normal">
            {codeScore !== null && codeScore !== undefined ? `${codeScore}/100` : "—"}
          </p>
        </div>

        <div className="p-3">
          <span className="text-[10px] text-[var(--ink-faint)] uppercase">Margin Notes</span>
          <p className="mt-0.5 font-serif text-xl text-[var(--ink)] font-normal">
            {issuesCount}
          </p>
        </div>

        <div className="p-3">
          <span className="text-[10px] text-[var(--ink-faint)] uppercase">State</span>
          <p
            className={`mt-0.5 text-xs font-mono font-medium capitalize ${
              justStamped ? "animate-stamp" : ""
            } ${
              status === "approved" || status === "completed"
                ? "text-[var(--diff-add)]"
                : status === "rejected"
                ? "text-[var(--pen)]"
                : "text-[var(--ink)]"
            }`}
          >
            ■ {status.replace("_", " ")}
          </p>
        </div>
      </div>

      {/* Executed Action Result */}
      {actionResult ? (
        <div className="mt-4 rounded-[2px] border border-[var(--diff-add)]/30 bg-[var(--diff-add-bg)] p-3.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-[var(--diff-add)] font-medium">
            <span>■</span>
            <span>Review Decision Executed</span>
          </div>
          <p className="mt-1 text-[11px] text-[var(--ink)]">
            {actionResult.status_message}
          </p>
          {actionResult.pr_url ? (
            <a
              href={actionResult.pr_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-[11px] text-[var(--pen)] underline"
            >
              View GitHub PR discussion →
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Decision Controls */}
      <div className="mt-5 space-y-3">
        <div>
          <label
            htmlFor="operator-feedback"
            className="block font-mono text-[11px] text-[var(--ink-faint)] uppercase mb-1.5"
          >
            Reviewer Remarks / Instructions (Optional)
          </label>
          <textarea
            id="operator-feedback"
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            disabled={isSubmitting || !isPending}
            placeholder={
              isPending
                ? "Add editorial notes to post alongside this review decision..."
                : "Checkpoint review has been submitted."
            }
            className="w-full rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-2.5 font-sans text-xs text-[var(--ink)] outline-none placeholder:text-[var(--ink-faint)]/50 focus:border-[var(--pen)] disabled:opacity-50"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <span className="font-mono text-[11px] text-[var(--ink-faint)]">
            {isPending
              ? "One action stamp will finalize the review."
              : `Current decision status: ${status.toUpperCase()}`}
          </span>

          <div className="flex flex-wrap items-center gap-2.5">
            {isPending ? (
              <>
                {/* Secondary: Request revisions */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision("revise")}
                  className="rounded-[4px] border border-[var(--ink-hairline)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--paper-raised)] transition disabled:opacity-50"
                >
                  {isSubmitting ? "..." : "Re-evaluate"}
                </button>

                {/* Primary option 1: Request changes (red pen) */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision("rejected")}
                  className="rounded-[4px] bg-[var(--pen)] px-4 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)] disabled:opacity-50"
                >
                  {isSubmitting ? "Marking..." : "■ Request Changes"}
                </button>

                {/* Secondary option 2: Approve (functional forest border) */}
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleDecision("approved")}
                  className="rounded-[4px] border border-[var(--diff-add)] text-[var(--diff-add)] bg-[var(--diff-add-bg)] px-4 py-1.5 text-xs font-medium hover:brightness-95 transition disabled:opacity-50"
                >
                  {isSubmitting ? "Signing..." : "■ Approve & Sign"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setStatus("pending_approval")}
                className="rounded-[4px] border border-[var(--ink-hairline)] px-3 py-1.5 text-xs font-medium text-[var(--ink)] hover:bg-[var(--paper-raised)] transition"
              >
                Reopen Decision
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
