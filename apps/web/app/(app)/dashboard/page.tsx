import Link from "next/link";

export default function DashboardPage() {
  return (
    <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <p className="text-sm font-medium text-cyan-300">
            Developer Dashboard
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome to CodeScry AI
          </h1>

          <p className="mt-3 max-w-2xl text-slate-400">
            Track your code reviews, monitor your improvement, and start a new
            AI-powered code review.
          </p>
        </div>

        <Link
          href="/reviews/new"
          className="rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Start New Review
        </Link>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <DashboardStatCard
          label="Total Reviews"
          value="0"
          description="Code reviews created"
        />

        <DashboardStatCard
          label="Average Score"
          value="--"
          description="Your code quality score"
        />

        <DashboardStatCard
          label="Issues Found"
          value="0"
          description="Bugs and improvements detected"
        />
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-white/15 bg-white/3 p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
          CS
        </div>

        <h2 className="mt-6 text-xl font-semibold">No code reviews yet</h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
          Your dashboard will show review history, issue trends, and code
          quality analytics after you submit your first code review.
        </p>

        <Link
          href="/reviews/new"
          className="mt-6 inline-flex rounded-xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Create First Review
        </Link>
      </div>
    </>
  );
}

function DashboardStatCard({
  label,
  value,
  description,
}: {
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
      <p className="text-sm text-slate-400">{label}</p>

      <p className="mt-3 text-4xl font-bold tracking-tight text-white">
        {value}
      </p>

      <p className="mt-2 text-sm text-slate-500">{description}</p>
    </div>
  );
}
