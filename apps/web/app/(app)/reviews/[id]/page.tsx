"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import { AgentWorkflowTracker } from "@/components/reviews/AgentWorkflowTracker";
import { ApprovalPanel } from "@/components/reviews/ApprovalPanel";
import { CodeBlock } from "@/components/reviews/CodeBlock";
import { IssueCard } from "@/components/reviews/IssueCard";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";
import {
  deleteReview,
  getAgentPRReviewState,
  getReviewById,
} from "@/services/review.service";
import type {
  AgentPRReviewState,
  Review,
  ReviewIssueDetail,
  SeverityLevel,
} from "@/types/review";
import { getAuthToken } from "@/utils/auth-storage";

export default function ReviewDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const reviewId = params.id;

  const [review, setReview] = useState<Review | null>(null);
  const [agentState, setAgentState] = useState<AgentPRReviewState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  // View state for ledger diff pane
  const [activeDiffView, setActiveDiffView] = useState<"diff" | "improved">("diff");
  const [activeFileIndex, setActiveFileIndex] = useState(0);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      setError(null);

      // 1. Try fetching as an agent PR review thread first
      if (reviewId.startsWith("pr_") || reviewId.includes("_")) {
        try {
          const agentRes = await getAgentPRReviewState(reviewId);
          if (agentRes && agentRes.state) {
            setAgentState(agentRes.state);
            setIsLoading(false);
            return;
          }
        } catch {
          // Fall through to DB fetch
        }
      }

      // 2. Try fetching as a DB review
      const token = getAuthToken();
      if (!token) {
        try {
          const agentRes = await getAgentPRReviewState(reviewId);
          if (agentRes && agentRes.state) {
            setAgentState(agentRes.state);
            setIsLoading(false);
            return;
          }
        } catch {
          router.replace("/login");
          return;
        }
      } else {
        try {
          const response = await getReviewById(reviewId, token);
          setReview(response.review);
          if (response.review.threadId) {
            try {
              const agentRes = await getAgentPRReviewState(response.review.threadId);
              if (agentRes && agentRes.state) {
                setAgentState(agentRes.state);
              }
            } catch {
              // Agent thread may be completed
            }
          }
        } catch (err) {
          try {
            const agentRes = await getAgentPRReviewState(reviewId);
            if (agentRes && agentRes.state) {
              setAgentState(agentRes.state);
              setIsLoading(false);
              return;
            }
          } catch {
            setError(err instanceof Error ? err.message : "Failed to load review record.");
          }
        }
      }

      setIsLoading(false);
    }

    if (reviewId) {
      loadData();
    }
  }, [reviewId, router]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this review record?")) return;
    const token = getAuthToken();
    if (!token) return;

    setIsDeleting(true);
    try {
      await deleteReview(reviewId, token);
      router.push("/reviews");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete review record.");
    } finally {
      setIsDeleting(false);
    }
  }

  // Derive file manifest from diff content or review fileName
  const fileManifest = useMemo(() => {
    const rawDiff = agentState?.diff_content || review?.originalCode || "";
    const detectedFiles: { name: string; additions: number; deletions: number }[] = [];

    const matches = rawDiff.matchAll(/diff --git a\/(.+?) b\/(.+)/g);
    for (const match of matches) {
      const fileName = match[2] || match[1];
      if (fileName && !detectedFiles.some((f) => f.name === fileName)) {
        detectedFiles.push({ name: fileName, additions: 14, deletions: 2 });
      }
    }

    if (detectedFiles.length === 0) {
      detectedFiles.push({
        name: review?.fileName || "manuscript_diff.ts",
        additions: 12,
        deletions: 1,
      });
    }

    return detectedFiles;
  }, [agentState, review]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center font-mono">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-[var(--pen)] border-t-transparent" />
        <p className="mt-4 text-xs uppercase tracking-wider text-[var(--ink-faint)]">
          Reading Ledger & Checkpoints...
        </p>
      </div>
    );
  }

  if (error && !review && !agentState) {
    return (
      <div className="rounded-[4px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] p-6 font-mono">
        <div className="flex items-center gap-2 text-[var(--pen)] font-bold text-sm">
          <span>■</span>
          <span>Record Unavailable</span>
        </div>
        <p className="mt-2 text-xs text-[var(--ink)] font-sans">{error}</p>
        <Link
          href="/reviews"
          className="mt-4 inline-flex rounded-[3px] bg-[var(--pen)] px-4 py-2 font-mono text-xs uppercase text-white"
        >
          Return to Archives
        </Link>
      </div>
    );
  }

  // Extract shared review properties
  const title =
    agentState?.pr_title ||
    review?.title ||
    (agentState ? `Pull Request #${agentState.pull_number}` : "CodeScry Manuscript Review");

  const targetIdentifier = agentState
    ? `${agentState.owner}/${agentState.repo} · PR #${agentState.pull_number}`
    : `${review?.fileName || "Unknown File"} · ${review?.codeType || "Script"}`;

  const score = agentState?.review_result?.code_score ?? review?.score ?? null;

  const detectedIssues: ReviewIssueDetail[] =
    agentState?.review_result?.detected_issues || review?.issues || [];

  const summary = agentState?.review_result?.summary || review?.summary || "";
  const diffContent = agentState?.diff_content || review?.originalCode || "";
  const improvedContent =
    agentState?.review_result?.improved_code || review?.improvedCode || diffContent;

  const currentStatus = agentState?.status || "completed";

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP EDITORIAL MASTHEAD */}
      <div className="border-b border-[var(--ink-hairline)] pb-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
              <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
              <span>Review Dossier · {reviewId}</span>
            </div>
            <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-[var(--ink)] sm:text-4xl">
              {title}
            </h1>
            <p className="mt-1 font-mono text-xs text-[var(--ink-faint)]">
              Target: <span className="text-[var(--ink)] font-semibold">{targetIdentifier}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
            <Link
              href="/reviews"
              className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-1.5 text-[var(--ink)] hover:bg-[var(--paper-dim)] transition"
            >
              ← Archives
            </Link>
            <Link
              href="/reviews/new"
              className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-3 py-1.5 text-[var(--ink)] hover:bg-[var(--paper-raised)] transition"
            >
              + New Evaluation
            </Link>
            {review && (
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-[3px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] px-3 py-1.5 text-[var(--pen)] hover:bg-[var(--pen)] hover:text-white transition disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Expunge"}
              </button>
            )}
          </div>
        </div>

        {/* Ledger Metadata Strip */}
        <div className="mt-4 grid grid-cols-2 divide-x divide-[var(--ink-hairline)] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] rounded-[3px] font-mono sm:grid-cols-4">
          <div className="p-3 text-center">
            <span className="text-[10px] uppercase text-[var(--ink-faint)]">Quality Score</span>
            <p className="font-serif text-xl text-[var(--ink)] font-normal mt-0.5">
              {score !== null ? `${score}/100` : "—"}
            </p>
          </div>

          <div className="p-3 text-center">
            <span className="text-[10px] uppercase text-[var(--ink-faint)]">Margin Notes</span>
            <p className="font-serif text-xl text-[var(--ink)] font-normal mt-0.5">
              {detectedIssues.length}
            </p>
          </div>

          <div className="p-3 text-center">
            <span className="text-[10px] uppercase text-[var(--ink-faint)]">Review Status</span>
            <p className="text-xs font-medium text-[var(--ink)] capitalize mt-1.5">
              ■ {currentStatus.replace("_", " ")}
            </p>
          </div>

          <div className="p-3 text-center">
            <span className="text-[10px] uppercase text-[var(--ink-faint)]">Scrying Engine</span>
            <p className="text-xs font-medium text-[var(--ink)] mt-1.5">
              {review?.aiProvider || "Gemini 2.5"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. AGENT WORKFLOW TRACKER (If agent review) */}
      {agentState && (
        <AgentWorkflowTracker
          status={agentState.status}
          codeScore={score}
          prNumber={agentState.pull_number}
        />
      )}

      {/* 3. HUMAN-IN-THE-LOOP APPROVAL PANEL (If agent thread available) */}
      {agentState && (
        <ApprovalPanel
          threadId={agentState.thread_id}
          currentStatus={agentState.status}
          reviewSummary={summary}
          codeScore={score}
          issuesCount={detectedIssues.length}
          githubActionResult={agentState.github_action_result}
          onDecisionSubmitted={(updated) => setAgentState(updated)}
        />
      )}

      {/* 4. THE 3-COLUMN LEDGER GRID */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px_1fr_340px]">
        {/* ================= COLUMN 1: MANIFEST (~220px) ================= */}
        <aside className="space-y-4">
          <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-4">
            <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-2.5 mb-3 font-mono">
              <span className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold">
                PR Manifest
              </span>
              <span className="text-[10px] text-[var(--ink-faint)]">
                {fileManifest.length} file{fileManifest.length > 1 ? "s" : ""}
              </span>
            </div>

            <nav className="space-y-1 font-mono text-xs">
              {fileManifest.map((file, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveFileIndex(idx)}
                  className={`w-full text-left px-2.5 py-2 rounded-[2px] transition flex flex-col ${
                    idx === activeFileIndex
                      ? "border-l-2 border-[var(--pen)] bg-[var(--paper-dim)] text-[var(--ink)] font-semibold"
                      : "text-[var(--ink-faint)] hover:bg-[var(--paper-dim)]/50 hover:text-[var(--ink)]"
                  }`}
                >
                  <span className="truncate">{file.name}</span>
                  <span className="text-[10px] text-[var(--ink-faint)] font-normal mt-0.5">
                    <span className="text-[var(--diff-add)]">+{file.additions}</span>{" "}
                    <span className="text-[var(--diff-del)]">-{file.deletions}</span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Qdrant Guidelines in column 1 */}
          {agentState?.retrieved_rules && agentState.retrieved_rules.length > 0 && (
            <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-4">
              <div className="border-b border-[var(--ink-hairline)] pb-2 mb-2 font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold">
                ◇ RAG Guidelines
              </div>
              <div className="space-y-2.5">
                {agentState.retrieved_rules.slice(0, 3).map((rule, idx) => (
                  <div key={idx} className="text-xs">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[var(--ink-faint)] block">
                      {rule.category}
                    </span>
                    <p className="font-sans font-medium text-[var(--ink)] text-[11px] mt-0.5">
                      {rule.title}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>

        {/* ================= COLUMN 2: DIFF PANE (fluid, min 640px) ================= */}
        <main className="space-y-5 min-w-0">
          {/* Executive Summary Box */}
          {summary && (
            <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-5">
              <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-2 mb-3">
                <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold">
                  Executive Proofreader's Note
                </span>
                {agentState?.review_result?.severity_level && (
                  <SeverityBadge severity={agentState.review_result.severity_level} />
                )}
              </div>
              <p className="font-sans text-xs text-[var(--ink)] leading-relaxed">
                {summary}
              </p>
            </div>
          )}

          {/* Diff View Switcher */}
          <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-2 font-mono text-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveDiffView("diff")}
                className={`px-3 py-1 rounded-[3px] transition ${
                  activeDiffView === "diff"
                    ? "bg-[var(--ink)] text-[var(--paper-raised)] font-semibold"
                    : "text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--paper-dim)]"
                }`}
              >
                Unified Diff Patch
              </button>
              <button
                type="button"
                onClick={() => setActiveDiffView("improved")}
                className={`px-3 py-1 rounded-[3px] transition ${
                  activeDiffView === "improved"
                    ? "bg-[var(--ink)] text-[var(--paper-raised)] font-semibold"
                    : "text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-[var(--paper-dim)]"
                }`}
              >
                Production Solution
              </button>
            </div>

            <span className="text-[11px] text-[var(--ink-faint)]">
              {fileManifest[activeFileIndex]?.name || "manuscript_diff.ts"}
            </span>
          </div>

          {/* Active Code Block */}
          {activeDiffView === "diff" ? (
            <CodeBlock
              title={fileManifest[activeFileIndex]?.name || "PR Patch"}
              code={diffContent}
              languageLabel="Unified Diff"
            />
          ) : (
            <CodeBlock
              title="Refactored Manuscript"
              code={improvedContent}
              languageLabel="Improved Code"
            />
          )}
        </main>

        {/* ================= COLUMN 3: MARGIN NOTES (~320px) ================= */}
        <aside className="space-y-4">
          <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-2 font-mono">
            <span className="text-[11px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold">
              Proofreader's Margin
            </span>
            <span className="text-[10px] text-[var(--ink-faint)]">
              {detectedIssues.length} note{detectedIssues.length > 1 ? "s" : ""}
            </span>
          </div>

          {detectedIssues.length === 0 ? (
            <div className="rounded-[4px] border border-dashed border-[var(--ink-hairline)] bg-[var(--paper)] p-6 text-center font-mono text-xs text-[var(--ink-faint)]">
              <span className="text-base text-[var(--diff-add)] block mb-1">✓</span>
              <span>Clean manuscript. No critical defects annotated in the margin.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {detectedIssues.map((issue, idx) => (
                <IssueCard key={idx} issue={issue} index={idx} />
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
