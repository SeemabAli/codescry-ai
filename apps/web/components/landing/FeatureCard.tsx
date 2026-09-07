type FeatureCardProps = {
  title: string;
  description: string;
};

export function FeatureCard({ title, description }: FeatureCardProps) {
  return (
    <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6 transition hover:bg-[var(--paper-raised)]">
      <h3 className="font-serif text-lg font-medium text-[var(--ink)]">
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-faint)]">
        {description}
      </p>
    </div>
  );
}