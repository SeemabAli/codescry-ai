import type { Severity, SeverityLevel } from "@/types/review";

type SeverityProp = SeverityLevel | Severity | string;

export function SeverityBadge({ severity }: { severity: SeverityProp }) {
  const norm = (severity || "low").toString().toLowerCase();

  let colorClass = "text-[var(--ink-faint)]";
  let label = severity;

  if (norm === "critical") {
    colorClass = "text-[var(--pen)] font-medium";
    label = "Critical";
  } else if (norm === "high") {
    colorClass = "text-[var(--diff-del)] font-medium";
    label = "High";
  } else if (norm === "medium") {
    colorClass = "text-[var(--ink)]";
    label = "Medium";
  } else if (norm === "low") {
    colorClass = "text-[var(--ink-faint)]";
    label = "Low";
  } else if (norm === "suggestion") {
    colorClass = "text-[var(--ink-faint)]";
    label = "Suggestion";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-xs ${colorClass}`}>
      <span className="text-[8px] leading-none select-none">■</span>
      <span className="capitalize">{label}</span>
    </span>
  );
}