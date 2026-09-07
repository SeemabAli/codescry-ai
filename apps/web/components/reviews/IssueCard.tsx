"use client";

import { useState } from "react";
import type { ReviewIssueDetail } from "@/types/review";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";

type IssueCardProps = {
  issue: ReviewIssueDetail;
  index: number;
};

export function IssueCard({ issue, index }: IssueCardProps) {
  const severity = issue.severity_level || issue.severity || "medium";
  const lineNumber = issue.line_number ?? issue.lineNumber;
  const codeExample = issue.code_example ?? issue.codeExample;

  const [isEndorsed, setIsEndorsed] = useState(false);

  return (
    <div
      className={`rounded-[4px] bg-[var(--paper)] p-4 text-xs transition ${
        isEndorsed
          ? "border border-[var(--ink-hairline)] border-l-2 border-l-[var(--pen)]"
          : "border border-dashed border-[var(--ink-hairline)]"
      }`}
    >
      {/* Header Line */}
      <div className="flex items-center justify-between gap-2 border-b border-[var(--ink-hairline)]/50 pb-2.5">
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-[var(--ink-faint)]">
          <span className="text-[var(--ink-faint)] font-bold">◇</span>
          <span>
            {isEndorsed ? "Reviewer · raised via CodeScry" : "CodeScry · suggestion"}
          </span>
          {lineNumber ? (
            <span className="text-[10px] bg-[var(--paper-dim)] px-1 py-0.5 rounded-[2px] ml-1">
              line {lineNumber}
            </span>
          ) : null}
        </div>

        <SeverityBadge severity={severity} />
      </div>

      {/* Title */}
      <h3 className="mt-3 font-sans text-sm font-semibold text-[var(--ink)]">
        {issue.title}
      </h3>

      {/* Explanation */}
      <div className="mt-2 text-xs leading-relaxed text-[var(--ink-faint)] max-w-prose">
        <p>{issue.explanation}</p>
      </div>

      {/* Recommendation */}
      <div className="mt-3 rounded-[2px] border-l-2 border-[var(--ink-hairline)] bg-[var(--paper-raised)] px-3 py-2">
        <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold mb-1">
          Correction
        </div>
        <p className="text-xs text-[var(--ink)] leading-relaxed">
          {issue.recommendation}
        </p>
      </div>

      {/* Suggested Fix Code Example */}
      {codeExample && codeExample.trim().length > 0 ? (
        <div className="mt-3">
          <div className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold mb-1">
            Diff Proposal
          </div>
          <pre className="overflow-x-auto rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] p-2.5 font-mono text-[11px] leading-relaxed text-[var(--ink)]">
            <code>{codeExample}</code>
          </pre>
        </div>
      ) : null}

      {/* Endorse Action footer */}
      <div className="mt-3 pt-2.5 border-t border-[var(--ink-hairline)]/50 flex items-center justify-between">
        <span className="font-mono text-[10px] text-[var(--ink-faint)]">
          Category: {issue.category || "General"}
        </span>

        <button
          type="button"
          onClick={() => setIsEndorsed(!isEndorsed)}
          className={`rounded-[3px] px-2.5 py-1 text-[11px] font-medium transition ${
            isEndorsed
              ? "bg-[var(--pen)] text-white"
              : "border border-[var(--ink-hairline)] text-[var(--ink)] hover:bg-[var(--paper-raised)]"
          }`}
        >
          {isEndorsed ? "✓ Raised to Review" : "Raise as comment"}
        </button>
      </div>
    </div>
  );
}