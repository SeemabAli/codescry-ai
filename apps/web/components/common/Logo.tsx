export function Logo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <span
        className="flex h-4 w-1.5 bg-[var(--pen)] rounded-[1px] shrink-0"
        aria-hidden="true"
      />
      <span className="font-serif text-xl font-medium tracking-tight text-[var(--ink)]">
        CodeScry
        <span className="font-mono text-xs text-[var(--ink-faint)] font-normal ml-1.5 border border-[var(--ink-hairline)] px-1 py-0.5 rounded-[2px] bg-[var(--paper-dim)]">
          AI
        </span>
      </span>
    </div>
  );
}