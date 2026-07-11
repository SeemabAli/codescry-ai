import type { Severity } from "@/types/review";

const severityStyles: Record<Severity, string> = {
  Critical: "border-red-400/30 bg-red-400/10 text-red-300",
  High: "border-orange-400/30 bg-orange-400/10 text-orange-300",
  Medium: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
  Low: "border-blue-400/30 bg-blue-400/10 text-blue-300",
  Suggestion: "border-slate-400/30 bg-slate-400/10 text-slate-300",
};

type SeverityBadgeProps = {
  severity: Severity;
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className={`rounded-full border px-3 py-1 text-xs font-medium ${severityStyles[severity]}`}
    >
      {severity}
    </span>
  );
}