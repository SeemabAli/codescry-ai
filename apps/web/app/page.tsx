import Link from "next/link";
import { Navbar } from "@/components/landing/Navbar";
import { FeatureCard } from "@/components/landing/FeatureCard";
import { StepCard } from "@/components/landing/StepCard";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Navbar />

      {/* Hero Section — Left Aligned Editorial Sheet */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-20 border-b border-[var(--ink-hairline)]">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 font-mono text-xs text-[var(--ink-faint)]">
            <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
            <span>The Red Pen — Editorial Code Review</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal tracking-tight text-[var(--ink)] leading-[1.15]">
            Reviewing code like marking up an essay.
          </h1>

          <p className="mt-6 text-base sm:text-lg leading-relaxed text-[var(--ink-faint)] max-w-2xl font-normal">
            Paper, ink, and one red pen. Most tools borrow the visual noise of
            chat apps or glassy SaaS dashboards. CodeScry-AI treats your screen like a
            proofreader’s page — leaving precise margin notes so you can see at a glance
            what still needs a decision.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="rounded-[4px] bg-[var(--pen)] px-6 py-3 text-sm font-medium text-white transition hover:bg-[var(--pen-hover)] inline-flex items-center gap-2"
            >
              <span>Begin a Review</span>
              <span className="font-mono text-xs opacity-80">→</span>
            </Link>

            <a
              href="#ledger"
              className="rounded-[4px] border border-[var(--ink-hairline)] px-6 py-3 text-sm font-medium text-[var(--ink)] transition hover:bg-[var(--paper-raised)]"
            >
              Inspect the Ledger Grid
            </a>
          </div>
        </div>

        {/* The Ledger Grid Preview */}
        <div id="ledger" className="mt-14 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-4 py-2.5 font-mono text-xs text-[var(--ink-faint)]">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[1px] bg-[var(--ink-faint)]" />
              <span>pull-request-142.diff</span>
              <span className="text-[var(--ink-hairline)]">/</span>
              <span>auth-refactor</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[var(--pen)] font-medium">■ Changes requested</span>
            </div>
          </div>

          {/* 3-Column Ledger Grid Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[var(--ink-hairline)]">
            {/* Column 1: File Tree (~220px / 3 cols) */}
            <div className="lg:col-span-3 bg-[var(--paper-dim)] p-4 font-mono text-xs space-y-1">
              <div className="text-[var(--ink-faint)] uppercase tracking-wider text-[10px] pb-2 font-semibold">
                Files Changed (3)
              </div>
              <div className="border-l-2 border-[var(--pen)] pl-2.5 py-1 text-[var(--ink)] font-medium bg-[var(--paper)]">
                src/routes/auth.ts
              </div>
              <div className="pl-3 py-1 text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer">
                src/models/user.ts
              </div>
              <div className="pl-3 py-1 text-[var(--ink-faint)] hover:text-[var(--ink)] cursor-pointer">
                tests/auth.test.ts
              </div>
            </div>

            {/* Column 2: Diff Pane (6 cols) */}
            <div className="lg:col-span-5 bg-[var(--paper)] font-mono text-xs">
              <div className="divide-y divide-[var(--ink-hairline)]/50">
                <div className="flex items-center h-7 text-[var(--ink-faint)]">
                  <span className="w-10 text-right pr-3 bg-[var(--paper-dim)] border-r border-[var(--ink-hairline)] select-none">24</span>
                  <span className="px-3 text-[var(--ink-faint)]">@@ -24,7 +24,10 @@</span>
                </div>
                <div className="flex items-center h-7 text-[var(--ink-faint)]">
                  <span className="w-10 text-right pr-3 bg-[var(--paper-dim)] border-r border-[var(--ink-hairline)] select-none">25</span>
                  <span className="px-3">const router = Router();</span>
                </div>
                <div className="flex items-center h-7 bg-[var(--diff-del-bg)] text-[var(--diff-del)]">
                  <span className="w-10 text-right pr-3 bg-[var(--diff-del-bg)] border-r border-[var(--diff-del)]/20 select-none">26</span>
                  <span className="px-3">- const user = await User.findOne(&#123; password &#125;);</span>
                </div>
                <div className="flex items-center h-7 bg-[var(--diff-add-bg)] text-[var(--diff-add)]">
                  <span className="w-10 text-right pr-3 bg-[var(--diff-add-bg)] border-r border-[var(--diff-add)]/20 select-none">26</span>
                  <span className="px-3">+ const isMatch = await bcrypt.compare(pass, user.hash);</span>
                </div>
                <div className="flex items-center h-7 text-[var(--ink)]">
                  <span className="w-10 text-right pr-3 bg-[var(--paper-dim)] border-r border-[var(--ink-hairline)] select-none">27</span>
                  <span className="px-3">if (!isMatch) return res.status(401);</span>
                </div>
              </div>
            </div>

            {/* Column 3: Margin Notes (4 cols) */}
            <div className="lg:col-span-4 p-4 bg-[var(--paper-raised)] space-y-3">
              <div className="text-[var(--ink-faint)] uppercase tracking-wider text-[10px] font-semibold font-mono">
                Margin Notes (1 Unresolved)
              </div>

              {/* AI Suggestion Card */}
              <div className="rounded-[4px] border border-dashed border-[var(--ink-hairline)] bg-[var(--paper)] p-3 text-xs">
                <div className="flex items-center gap-1.5 text-[var(--ink-faint)] font-mono text-[11px] mb-1.5">
                  <span className="text-[var(--ink-faint)]">◇</span>
                  <span>CodeScry · suggestion</span>
                  <span className="ml-auto text-[10px]">line 26</span>
                </div>
                <p className="text-[var(--ink)] leading-relaxed">
                  Avoid plaintext credential queries. Use constant-time comparison on hashed tokens to protect against timing attacks.
                </p>
                <div className="mt-2 pt-2 border-t border-[var(--ink-hairline)]/50 flex items-center justify-between text-[11px]">
                  <span className="text-[var(--ink-faint)]">Endorsed by reviewer</span>
                  <span className="font-mono text-[var(--pen)] font-medium">unresolved</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section id="concept" className="mx-auto max-w-6xl px-6 py-16 border-b border-[var(--ink-hairline)]">
        <div className="max-w-xl mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--ink)]">
            Discipline in three rules
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-faint)] leading-relaxed">
            The palette is 60% paper, 30% ink, and 10% red pen. No shadows. No glass.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Paper, not glass"
            description="Flat surfaces, hairline dividers, zero drop shadows. Monitors are stared at for hours; bright glassy cards strain eyes, paper calms them."
          />
          <FeatureCard
            title="One accent for judgment"
            description="The red pen color is the scarcest resource on the page. It is reserved exclusively for the moment a human reviewer must make a call."
          />
          <FeatureCard
            title="Semantic git diffs"
            description="Git's add and delete colors remain functional and muted. They never leak into UI buttons, active navigation flags, or decorative badges."
          />
        </div>
      </section>

      {/* Workflow Section */}
      <section id="how-it-works" className="mx-auto max-w-6xl px-6 py-16 border-b border-[var(--ink-hairline)]">
        <div className="max-w-xl mb-10">
          <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[var(--ink)]">
            The editorial workflow
          </h2>
          <p className="mt-2 text-sm text-[var(--ink-faint)] leading-relaxed">
            How code moves from candidate diff to approved ledger entry.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <StepCard
            number="01"
            title="Submit Pull Request Diff"
            description="Provide a GitHub PR identifier or paste arbitrary diff lines directly into the ruled monospace editor."
          />
          <StepCard
            number="02"
            title="CodeScry Pre-reads the Page"
            description="The AI agent scans AST nodes, security implications, and MERN best practices, planting quiet margin notes marked with ◇."
          />
          <StepCard
            number="03"
            title="Apply the Red Pen"
            description="Human reviewer resolves margin notes, evaluates recommendations, and executes a definitive Approval or Changes Requested stamp."
          />
        </div>
      </section>

      {/* Editorial Footer */}
      <footer className="mx-auto max-w-6xl px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[var(--ink-faint)]">
        <div className="flex items-center gap-2">
          <span className="h-2 w-1 bg-[var(--pen)] rounded-[1px]" />
          <span>CodeScry-AI — Built for engineers who take pride in clean code.</span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hover:text-[var(--ink)]">
            Login
          </Link>
          <Link href="/register" className="hover:text-[var(--ink)]">
            Register
          </Link>
          <Link href="/dashboard" className="text-[var(--pen)] hover:underline">
            Dashboard →
          </Link>
        </div>
      </footer>
    </main>
  );
}