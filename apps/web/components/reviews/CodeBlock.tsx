"use client";

import { useState } from "react";

type CodeBlockProps = {
  title: string;
  code: string;
  languageLabel?: string;
};

export function CodeBlock({
  title,
  code,
  languageLabel = "TypeScript / Diff",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  const lines = (code || "").split("\n");

  return (
    <div className="overflow-hidden rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)]">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-4 py-2 text-xs font-mono text-[var(--ink-faint)]">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-[var(--ink)]">{title}</span>
          <span className="text-[var(--ink-hairline)]">/</span>
          <span>{languageLabel}</span>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-[3px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-2.5 py-1 text-[11px] font-medium text-[var(--ink)] transition hover:bg-[var(--paper-raised)]"
        >
          {copied ? "✓ Copied" : "Copy lines"}
        </button>
      </div>

      {/* Ruled Monospace Code Pane */}
      <div className="overflow-x-auto font-mono text-xs max-h-[560px]">
        <div className="divide-y divide-[var(--ink-hairline)]/30 min-w-full">
          {lines.map((line, idx) => {
            const isAdd = line.startsWith("+");
            const isDel = line.startsWith("-");

            let lineStyle = "bg-[var(--paper)] text-[var(--ink)]";
            let gutterStyle = "bg-[var(--paper-dim)] text-[var(--ink-faint)]";

            if (isAdd) {
              lineStyle = "bg-[var(--diff-add-bg)] text-[var(--diff-add)]";
              gutterStyle = "bg-[var(--diff-add-bg)] text-[var(--diff-add)] border-[var(--diff-add)]/20";
            } else if (isDel) {
              lineStyle = "bg-[var(--diff-del-bg)] text-[var(--diff-del)]";
              gutterStyle = "bg-[var(--diff-del-bg)] text-[var(--diff-del)] border-[var(--diff-del)]/20";
            }

            return (
              <div
                key={idx}
                className={`flex items-center h-7 ${lineStyle} hover:brightness-95 transition-colors`}
              >
                <span
                  className={`w-12 shrink-0 select-none border-r border-[var(--ink-hairline)] pr-3 text-right text-[11px] font-mono leading-7 ${gutterStyle}`}
                >
                  {idx + 1}
                </span>
                <span className="px-3 whitespace-pre font-mono leading-7">
                  {line || " "}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}