import type { ReviewIssue } from "@/types/review";
import { SeverityBadge } from "@/components/reviews/SeverityBadge";

type IssueCardProps = {
  issue: ReviewIssue;
  index: number;
};

export function IssueCard({ issue, index }: IssueCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-sm font-semibold text-slate-300">
              {index + 1}
            </span>

            <h3 className="text-lg font-semibold text-white">{issue.title}</h3>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full border border-white/10 bg-slate-900 px-3 py-1 text-slate-300">
              {issue.category}
            </span>

            {issue.lineNumber ? (
              <span className="text-slate-500">Line {issue.lineNumber}</span>
            ) : null}
          </div>
        </div>

        <SeverityBadge severity={issue.severity} />
      </div>

      <div className="mt-5 space-y-4">
        <div>
          <p className="text-sm font-medium text-slate-300">Explanation</p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {issue.explanation}
          </p>
        </div>

        <div>
          <p className="text-sm font-medium text-slate-300">Recommendation</p>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            {issue.recommendation}
          </p>
        </div>

        {issue.codeExample ? (
          <pre className="overflow-x-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-sm leading-6 text-slate-300">
            <code>{issue.codeExample}</code>
          </pre>
        ) : null}
      </div>
    </div>
  );
}