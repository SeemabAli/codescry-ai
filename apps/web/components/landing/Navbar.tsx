import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export function Navbar() {
  return (
    <nav className="border-b border-[var(--ink-hairline)] bg-[var(--paper)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/">
          <Logo />
        </Link>

        <div className="hidden items-center gap-6 text-sm text-[var(--ink-faint)] md:flex">
          <a
            href="#concept"
            className="transition hover:text-[var(--ink)]"
          >
            Concept
          </a>
          <a
            href="#ledger"
            className="transition hover:text-[var(--ink)]"
          >
            The Ledger
          </a>
          <a
            href="#features"
            className="transition hover:text-[var(--ink)]"
          >
            Features
          </a>
          <a
            href="#how-it-works"
            className="transition hover:text-[var(--ink)]"
          >
            Workflow
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-[var(--ink)] px-3 py-1.5 transition hover:bg-[var(--paper-raised)] rounded-[4px] border border-transparent sm:block"
          >
            Log in
          </Link>

          <Link
            href="/register"
            className="rounded-[4px] bg-[var(--pen)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--pen-hover)]"
          >
            Start Reviewing
          </Link>
        </div>
      </div>
    </nav>
  );
}