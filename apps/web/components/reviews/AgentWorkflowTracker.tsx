import type { AgentReviewStatus } from "@/types/review";

type AgentWorkflowTrackerProps = {
  status: AgentReviewStatus;
  codeScore?: number | null;
  prNumber?: number;
};

export function AgentWorkflowTracker({
  status,
  codeScore,
  prNumber,
}: AgentWorkflowTrackerProps) {
  const isPaused = status === "pending_approval";
  const isApproved = status === "approved" || status === "completed";
  const isRejected = status === "rejected";

  const steps = [
    {
      id: "ingest",
      name: "PR Ingest & Diff",
      description: prNumber ? `Fetched PR #${prNumber}` : "Unified diff loaded",
      state: "done" as const,
    },
    {
      id: "rag",
      name: "Knowledge Matching",
      description: "Qdrant vector guidance matched",
      state: "done" as const,
    },
    {
      id: "gemini",
      name: "Agentic Pre-reading",
      description: codeScore ? `Scored ${codeScore}/100 with margin notes` : "Reasoning complete",
      state: "done" as const,
    },
    {
      id: "gate",
      name: "Human-in-the-Loop Gate",
      description: isPaused
        ? "PAUSED: Awaiting reviewer red pen"
        : isApproved
        ? "Approved by reviewer"
        : isRejected
        ? "Changes requested by reviewer"
        : "Checkpointed state",
      state: isPaused ? ("active" as const) : ("done" as const),
    },
    {
      id: "github",
      name: "GitHub Execution",
      description: isApproved
        ? "Autonomous PR review signed"
        : isRejected
        ? "Revisions request posted"
        : "Awaiting decision call",
      state: isApproved || isRejected ? ("done" as const) : ("upcoming" as const),
    },
  ];

  return (
    <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-5">
      <div className="flex flex-col justify-between gap-2 border-b border-[var(--ink-hairline)] pb-3 mb-4 sm:flex-row sm:items-center">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--ink-faint)]">
            Execution Pipeline
          </span>
          <h3 className="font-serif text-base font-normal text-[var(--ink)]">
            LangGraph Review Checkpoints
          </h3>
        </div>

        <div className="font-mono text-xs">
          <span
            className={`inline-flex items-center gap-1.5 ${
              isPaused
                ? "text-[var(--pen)] font-medium"
                : isApproved
                ? "text-[var(--diff-add)]"
                : isRejected
                ? "text-[var(--pen)]"
                : "text-[var(--ink)]"
            }`}
          >
            <span className="text-[8px]">■</span>
            <span className="capitalize">{status.replace("_", " ")}</span>
          </span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[var(--ink-hairline)] border border-[var(--ink-hairline)] bg-[var(--paper-dim)] rounded-[3px] overflow-hidden">
        {steps.map((step, idx) => {
          const isActive = step.state === "active";
          const isDone = step.state === "done";

          return (
            <div
              key={step.id}
              className={`p-3 text-xs transition ${
                isActive
                  ? "bg-[var(--paper)] border-l-2 border-l-[var(--pen)]"
                  : isDone
                  ? "bg-[var(--paper-dim)]"
                  : "bg-[var(--paper-dim)] opacity-50"
              }`}
            >
              <div className="flex items-center justify-between font-mono text-[10px] text-[var(--ink-faint)] mb-1">
                <span>0{idx + 1}</span>
                <span>{isActive ? "ACTIVE" : isDone ? "✓" : "—"}</span>
              </div>
              <h4 className="font-sans font-medium text-[var(--ink)]">{step.name}</h4>
              <p className="mt-1 font-mono text-[10px] text-[var(--ink-faint)] line-clamp-2">
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
