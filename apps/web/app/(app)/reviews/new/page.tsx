"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeBlock } from "@/components/reviews/CodeBlock";
import { CodeEditor } from "@/components/reviews/CodeEditor";
import { IssueCard } from "@/components/reviews/IssueCard";
import { ApprovalPanel } from "@/components/reviews/ApprovalPanel";
import { AgentWorkflowTracker } from "@/components/reviews/AgentWorkflowTracker";
import { codeTypes, reviewModes, sampleCode } from "@/constants/reviews";
import {
  reviewCodeStructured,
  startAgentPRReview,
} from "@/services/review.service";
import type {
  AgentPRReviewState,
  CodeReviewStructuredResponse,
} from "@/types/review";

const SAMPLE_PR_DIFF = `diff --git a/src/routes/auth.js b/src/routes/auth.js
index 10a45e..88cb12 100644
--- a/src/routes/auth.js
+++ b/src/routes/auth.js
@@ -12,6 +12,16 @@ router.post("/login", async (req, res) => {
+  const { username, password } = req.body;
+  // Find user by plain password
+  const user = await db.collection("users").findOne({
+    username: username,
+    password: password,
+  });
+  if (user) {
+    return res.json({ status: "ok", token: "secret-token", user: user });
+  }
+  return res.status(401).send("Invalid login");
 });
`;

export default function NewReviewPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"agent-pr" | "direct-code">("agent-pr");

  // Agent PR State
  const [owner, setOwner] = useState("octocat");
  const [repo, setRepo] = useState("Hello-World");
  const [pullNumber, setPullNumber] = useState("42");
  const [customDiff, setCustomDiff] = useState(SAMPLE_PR_DIFF);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentState, setAgentState] = useState<AgentPRReviewState | null>(null);

  // Direct Code State
  const [fileName, setFileName] = useState("user.controller.ts");
  const [codeType, setCodeType] = useState("express-controller");
  const [reviewMode, setReviewMode] = useState("deep-review");
  const [code, setCode] = useState(sampleCode);
  const [isDirectAnalyzing, setIsDirectAnalyzing] = useState(false);
  const [directResult, setDirectResult] = useState<CodeReviewStructuredResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  // Start Agent PR Review Run
  async function handleStartAgentPR() {
    setError(null);
    const prNum = parseInt(pullNumber, 10);
    if (isNaN(prNum) || prNum < 1) {
      setError("Please enter a valid pull request number.");
      return;
    }
    if (!owner.trim() || !repo.trim()) {
      setError("Please enter both repository owner and repository name.");
      return;
    }

    setIsAgentRunning(true);
    setAgentState(null);

    try {
      const response = await startAgentPRReview({
        owner: owner.trim(),
        repo: repo.trim(),
        pull_number: prNum,
        custom_diff: customDiff.trim() || undefined,
      });

      setAgentState(response.state);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to launch PR review agent.");
    } finally {
      setIsAgentRunning(false);
    }
  }

  // Direct Code Review Analysis
  async function handleDirectReview() {
    setError(null);
    if (!code.trim()) {
      setError("Please provide code content to review.");
      return;
    }

    setIsDirectAnalyzing(true);
    setDirectResult(null);

    try {
      const result = await reviewCodeStructured({
        file_name: fileName,
        code_type: codeType,
        review_mode: reviewMode,
        code: code,
      });
      setDirectResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code review analysis failed.");
    } finally {
      setIsDirectAnalyzing(false);
    }
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Header */}
      <div>
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-[var(--ink-faint)]">
          <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
          <span>Dispatch · New Evaluation</span>
        </div>
        <h1 className="mt-1 font-serif text-3xl font-normal tracking-tight text-[var(--ink)] sm:text-4xl">
          The Review Desk
        </h1>
        <p className="mt-2 max-w-2xl font-sans text-xs text-[var(--ink-faint)] leading-relaxed">
          Commission an autonomous pull request reading through LangGraph and Qdrant guidelines,
          or submit a manuscript file for immediate editorial margin notation.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[var(--ink-hairline)]">
        <button
          type="button"
          onClick={() => {
            setActiveTab("agent-pr");
            setError(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition ${
            activeTab === "agent-pr"
              ? "border-b-2 border-[var(--pen)] font-semibold text-[var(--ink)] bg-[var(--paper-dim)]/40"
              : "border-b-2 border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]"
          }`}
        >
          <span>§ 1</span> Autonomous GitHub PR Scryer
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab("direct-code");
            setError(null);
          }}
          className={`flex items-center gap-2 px-5 py-3 font-mono text-xs uppercase tracking-wider transition ${
            activeTab === "direct-code"
              ? "border-b-2 border-[var(--pen)] font-semibold text-[var(--ink)] bg-[var(--paper-dim)]/40"
              : "border-b-2 border-transparent text-[var(--ink-faint)] hover:text-[var(--ink)]"
          }`}
        >
          <span>§ 2</span> Direct File & Snippet Reader
        </button>
      </div>

      {/* Global Error Notice */}
      {error ? (
        <div className="rounded-[4px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] p-4 text-xs text-[var(--pen)] flex items-center justify-between font-mono">
          <div className="flex items-center gap-2">
            <span>■</span>
            <span className="font-sans text-xs">{error}</span>
          </div>
          <button
            type="button"
            onClick={() => setError(null)}
            className="text-[11px] underline uppercase tracking-wider font-mono hover:text-[var(--ink)]"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* TAB 1: AUTONOMOUS GITHUB PR AGENT */}
      {activeTab === "agent-pr" && (
        <div className="space-y-8">
          <section className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 md:p-8">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center border-b border-[var(--ink-hairline)] pb-5 mb-6">
              <div>
                <h2 className="font-serif text-lg font-normal text-[var(--ink)]">
                  Configure Pull Request Coordinates
                </h2>
                <p className="mt-0.5 text-xs text-[var(--ink-faint)]">
                  Provide repository details or submit a raw unified diff patch for autonomous reading.
                </p>
              </div>

              <div className="flex items-center gap-2 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setCustomDiff(SAMPLE_PR_DIFF)}
                  className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink)] hover:bg-[var(--paper-raised)] transition"
                >
                  Load Sample Patch
                </button>
                <button
                  type="button"
                  onClick={() => setCustomDiff("")}
                  className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-1.5 text-[11px] font-medium text-[var(--ink-faint)] hover:text-[var(--ink)] transition"
                >
                  Clear Patch
                </button>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  Owner / Organization
                </label>
                <input
                  type="text"
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  placeholder="e.g. facebook"
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-hairline)] focus:outline-none focus:border-[var(--pen)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  Repository Name
                </label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  placeholder="e.g. react"
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-hairline)] focus:outline-none focus:border-[var(--pen)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  PR Number
                </label>
                <input
                  type="number"
                  value={pullNumber}
                  onChange={(e) => setPullNumber(e.target.value)}
                  placeholder="e.g. 42"
                  min="1"
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-hairline)] focus:outline-none focus:border-[var(--pen)]"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                Unified Diff Patch (or override)
              </label>
              <textarea
                rows={7}
                value={customDiff}
                onChange={(e) => setCustomDiff(e.target.value)}
                placeholder="Paste unified diff patch (diff --git a/... b/...)..."
                className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] p-3 font-mono text-xs leading-relaxed text-[var(--ink)] placeholder:text-[var(--ink-hairline)] focus:outline-none focus:border-[var(--pen)]"
              />
            </div>

            <div className="mt-6 flex flex-col justify-between gap-4 border-t border-[var(--ink-hairline)] pt-5 sm:flex-row sm:items-center">
              <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] text-[var(--ink-faint)]">
                <span>◇ Qdrant RAG matching</span>
                <span>·</span>
                <span>Gemini 2.5 analysis</span>
                <span>·</span>
                <span>LangGraph human gate</span>
              </div>

              <button
                type="button"
                disabled={isAgentRunning}
                onClick={handleStartAgentPR}
                className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-[var(--pen)] hover:bg-[var(--pen-hover)] px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition active:translate-y-[1px] disabled:opacity-50"
              >
                {isAgentRunning ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Executing Scryer Graph...
                  </>
                ) : (
                  <>■ Launch Autonomous Review</>
                )}
              </button>
            </div>
          </section>

          {/* LIVE AGENT STATE AND HUMAN-IN-THE-LOOP PANEL */}
          {agentState && (
            <div className="space-y-8">
              {/* LangGraph Workflow Tracker */}
              <AgentWorkflowTracker
                status={agentState.status}
                codeScore={agentState.review_result?.code_score}
                prNumber={agentState.pull_number}
              />

              {/* Human-in-the-Loop Decision Dock */}
              <ApprovalPanel
                threadId={agentState.thread_id}
                currentStatus={agentState.status}
                reviewSummary={agentState.review_result?.summary}
                codeScore={agentState.review_result?.code_score}
                issuesCount={agentState.review_result?.detected_issues.length || 0}
                githubActionResult={agentState.github_action_result}
                onDecisionSubmitted={(updated) => setAgentState(updated)}
              />

              {/* Retrieved Best Practices via Qdrant */}
              {agentState.retrieved_rules && agentState.retrieved_rules.length > 0 && (
                <section className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6">
                  <div className="flex items-center gap-2 mb-4 border-b border-[var(--ink-hairline)] pb-3">
                    <span className="font-mono text-xs text-[var(--ink-faint)]">◇ Qdrant Vector Context</span>
                    <h3 className="font-serif text-base font-normal text-[var(--ink)]">
                      Retrieved Engineering Guidelines
                    </h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {agentState.retrieved_rules.map((rule, idx) => (
                      <div
                        key={idx}
                        className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] p-3.5 text-xs space-y-1.5"
                      >
                        <span className="inline-block font-mono text-[10px] text-[var(--ink-faint)] uppercase border-b border-[var(--ink-hairline)] pb-0.5">
                          {rule.category}
                        </span>
                        <h4 className="font-sans font-semibold text-[var(--ink)] text-xs">{rule.title}</h4>
                        <p className="text-[var(--ink-faint)] leading-relaxed text-[11px]">{rule.guideline}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Detected Defects & Margin Notes */}
              {agentState.review_result?.detected_issues && agentState.review_result.detected_issues.length > 0 && (
                <section className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-3">
                    <h3 className="font-serif text-xl font-normal text-[var(--ink)]">
                      Margin Notes & Proposed Corrections
                    </h3>
                    <span className="font-mono text-xs text-[var(--ink-faint)]">
                      {agentState.review_result.detected_issues.length} items logged
                    </span>
                  </div>
                  <div className="space-y-4">
                    {agentState.review_result.detected_issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} index={idx} />
                    ))}
                  </div>
                </section>
              )}

              {/* Code Comparison */}
              <div className="grid gap-6 lg:grid-cols-2">
                <CodeBlock
                  title="Evaluated PR Diff"
                  code={agentState.diff_content}
                  languageLabel="Unified Diff Patch"
                />
                <CodeBlock
                  title="Improved Refactored Code"
                  code={agentState.review_result?.improved_code || agentState.diff_content}
                  languageLabel="Production Solution"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DIRECT CODE SNIPPET REVIEW */}
      {activeTab === "direct-code" && (
        <div className="space-y-8">
          <section className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 md:p-8">
            <div className="grid gap-5 md:grid-cols-3 mb-5">
              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  File Name
                </label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="e.g. auth.controller.ts"
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] placeholder:text-[var(--ink-hairline)] focus:outline-none focus:border-[var(--pen)]"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  Code Type
                </label>
                <select
                  value={codeType}
                  onChange={(e) => setCodeType(e.target.value)}
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--pen)]"
                >
                  {codeTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-1.5">
                  Review Mode
                </label>
                <select
                  value={reviewMode}
                  onChange={(e) => setReviewMode(e.target.value)}
                  className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2.5 font-mono text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--pen)]"
                >
                  {reviewModes.map((mode) => (
                    <option key={mode.value} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
                  Manuscript Source Code
                </label>
                <button
                  type="button"
                  onClick={() => setCode(sampleCode)}
                  className="font-mono text-[11px] text-[var(--pen)] hover:underline"
                >
                  Load Sample Code
                </button>
              </div>
              <CodeEditor value={code} onChange={setCode} />
            </div>

            <div className="mt-6 flex justify-end border-t border-[var(--ink-hairline)] pt-5">
              <button
                type="button"
                disabled={isDirectAnalyzing || !code.trim()}
                onClick={handleDirectReview}
                className="inline-flex items-center gap-2 rounded-[4px] bg-[var(--pen)] hover:bg-[var(--pen-hover)] px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-white transition active:translate-y-[1px] disabled:opacity-50"
              >
                {isDirectAnalyzing ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Reading Manuscript...
                  </>
                ) : (
                  <>■ Analyze with Gemini</>
                )}
              </button>
            </div>
          </section>

          {/* DIRECT REVIEW RESULT */}
          {directResult && (
            <div className="space-y-8">
              {/* Summary & Score Header */}
              <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 md:p-8">
                <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start border-b border-[var(--ink-hairline)] pb-6 mb-6">
                  <div>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)]">
                      Evaluation Complete · {directResult.ai_provider || "Gemini 2.5"}
                    </span>
                    <h2 className="mt-1 font-serif text-2xl font-normal text-[var(--ink)]">
                      Editorial Assessment
                    </h2>
                    <p className="mt-2 text-xs text-[var(--ink-faint)] leading-relaxed max-w-2xl font-sans">
                      {directResult.summary}
                    </p>
                  </div>

                  <div className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] p-4 text-center min-w-[140px] font-mono">
                    <span className="text-[10px] text-[var(--ink-faint)] uppercase">Quality Score</span>
                    <p className="mt-1 font-serif text-3xl font-normal text-[var(--ink)]">
                      {directResult.code_score}
                      <span className="text-xs font-normal text-[var(--ink-faint)]">/100</span>
                    </p>
                  </div>
                </div>

                {directResult.learning_recommendations && directResult.learning_recommendations.length > 0 && (
                  <div>
                    <h4 className="font-mono text-[11px] uppercase tracking-wider text-[var(--ink-faint)] mb-3 font-semibold">
                      Editorial Recommendations
                    </h4>
                    <ul className="grid gap-2 sm:grid-cols-2 font-mono text-xs text-[var(--ink)]">
                      {directResult.learning_recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 bg-[var(--paper-raised)] p-2.5 rounded-[3px] border border-[var(--ink-hairline)]">
                          <span className="text-[var(--pen)]">◇</span>
                          <span className="font-sans text-xs">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Detected Issues */}
              {directResult.detected_issues.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] pb-3">
                    <h3 className="font-serif text-xl font-normal text-[var(--ink)]">
                      Margin Notes ({directResult.detected_issues.length})
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {directResult.detected_issues.map((issue, idx) => (
                      <IssueCard key={idx} issue={issue} index={idx} />
                    ))}
                  </div>
                </div>
              )}

              {/* Improved Code Comparison */}
              <div className="grid gap-6 lg:grid-cols-2">
                <CodeBlock title="Original Manuscript" code={code} languageLabel={codeType} />
                <CodeBlock
                  title="Refactored & Improved Manuscript"
                  code={directResult.improved_code}
                  languageLabel={codeType}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}