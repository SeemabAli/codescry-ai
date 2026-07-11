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
  languageLabel = "JavaScript",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);

    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1500);
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{languageLabel}</p>
        </div>

        <button
          type="button"
          onClick={handleCopy}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>

      <pre className="max-h-[520px] overflow-auto bg-slate-950 p-5 text-sm leading-6 text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
}