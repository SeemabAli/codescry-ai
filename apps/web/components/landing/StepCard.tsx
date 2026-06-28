type StepCardProps = {
  number: string;
  title: string;
  description: string;
};

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
      <div className="text-sm font-bold text-cyan-300">{number}</div>

      <h3 className="mt-4 text-xl font-semibold">{title}</h3>

      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}