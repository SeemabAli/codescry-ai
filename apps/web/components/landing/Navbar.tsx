import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export function Navbar() {
  return (
    <nav className="border-b border-white/10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/">
          <Logo />
        </Link>

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

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-sm font-medium text-slate-300 transition hover:text-white sm:block"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-300"
          >
            Start Reviewing
          </Link>
        </div>
      </div>
    </nav>
  );
}