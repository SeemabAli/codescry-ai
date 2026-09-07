type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 transition hover:bg-[var(--paper-raised)]">
      <div className="flex items-center gap-2">
        <span className="font-mono text-xs font-semibold text-[var(--ink-faint)]">
          {number}
        </span>
        <div className="h-px flex-1 bg-[var(--ink-hairline)]" />
      </div>

      <h3 className="mt-3 font-serif text-lg font-medium text-[var(--ink)]">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-[var(--ink-faint)]">
        {description}
      </p>
    </div>
  );
}