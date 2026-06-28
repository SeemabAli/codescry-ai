export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* Navbar */}
      <nav className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 font-bold text-slate-950">
              CS
            </div>
            <span className="text-lg font-semibold tracking-tight">
              CodeScry AI
            </span>
          </div>

          <div className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-white">
              How it works
            </a>
            <a href="#tech-stack" className="hover:text-white">
              Tech Stack
            </a>
          </div>

          <button className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300">
            Start Reviewing
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto flex max-w-6xl flex-col items-center px-6 py-24 text-center">
        <div className="mb-6 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
          AI code review for MERN developers
        </div>

        <h1 className="max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          Review your code with an{" "}
          <span className="text-cyan-300">AI senior developer</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
          CodeScry AI helps developers find bugs, security issues, performance
          problems, and bad practices in React, Node.js, Express, and MongoDB
          code.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <button className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300">
            Try Code Review
          </button>

          <button className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10">
            View Demo
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3"
      >
        <FeatureCard
          title="Detect Bugs"
          description="Find logic errors, missing edge cases, weak error handling, and risky implementation patterns."
        />

        <FeatureCard
          title="Security Review"
          description="Catch unsafe request handling, missing validation, exposed secrets, and common backend vulnerabilities."
        />

        <FeatureCard
          title="Improve Code"
          description="Generate cleaner, safer, and more maintainable versions of your MERN stack code."
        />
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="border-t border-white/10 bg-slate-900/50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="text-3xl font-bold tracking-tight">
            How CodeScry AI works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <StepCard
              number="01"
              title="Paste your code"
              description="Add React, Node.js, Express, MongoDB, or JavaScript code."
            />

            <StepCard
              number="02"
              title="AI reviews it"
              description="The AI checks quality, security, performance, and best practices."
            />

            <StepCard
              number="03"
              title="Learn and improve"
              description="Get clear explanations, severity levels, and improved code."
            />
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">Tech Stack</h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {[
            "Next.js",
            "TypeScript",
            "Tailwind CSS",
            "Node.js",
            "Express",
            "MongoDB",
            "FastAPI",
            "LangChain",
            "LangGraph",
            "LLM API",
          ].map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-slate-500">
        Built for developers learning AI-powered web applications.
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950 p-6">
      <div className="text-sm font-bold text-cyan-300">{number}</div>
      <h3 className="mt-4 text-xl font-semibold">{title}</h3>
      <p className="mt-3 leading-7 text-slate-400">{description}</p>
    </div>
  );
}