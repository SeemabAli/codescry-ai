import Link from "next/link";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { Navbar } from "@/components/landing/Navbar";
import { StepCard } from "@/components/landing/StepCard";
import { features, steps, techStack } from "@/constants/landing";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <Navbar />

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
          <Link
            href="/register"
            className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Try Code Review
          </Link>

          <a
            href="#how-it-works"
            className="rounded-2xl border border-white/15 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
          >
            View Demo
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="mx-auto grid max-w-6xl gap-6 px-6 pb-24 md:grid-cols-3"
      >
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            title={feature.title}
            description={feature.description}
          />
        ))}
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
            {steps.map((step) => (
              <StepCard
                key={step.number}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section id="tech-stack" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">Tech Stack</h2>

        <div className="mt-8 flex flex-wrap gap-3">
          {techStack.map((tech) => (
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