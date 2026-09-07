"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Logo } from "@/components/common/Logo";
import { registerUser } from "@/services/auth.service";
import { saveAuthSession } from "@/utils/auth-storage";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await registerUser({
        name,
        email,
        password,
      });

      saveAuthSession(data.token, data.user);

      router.push("/dashboard");
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to create account. Please verify your details.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--paper)] px-6 py-12 text-[var(--ink)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] p-8">
          <div className="mb-6">
            <h1 className="font-serif text-2xl font-normal tracking-tight text-[var(--ink)]">
              Register Reviewer
            </h1>

            <p className="mt-2 text-xs leading-relaxed text-[var(--ink-faint)]">
              Create an account to begin annotating and reviewing pull requests.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-[2px] border border-[var(--pen)]/30 bg-[var(--diff-del-bg)] px-3.5 py-2.5 text-xs text-[var(--pen)]">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleRegister} className="space-y-4 text-xs font-sans">
            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block font-medium text-[var(--ink)]"
              >
                Full Name
              </label>

              <input
                id="name"
                type="text"
                placeholder="Ada Lovelace"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)]/50 focus:border-[var(--pen)] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-medium text-[var(--ink)]"
              >
                Email Address
              </label>

              <input
                id="email"
                type="email"
                placeholder="ada@analytical.engine"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                disabled={isLoading}
                className="w-full rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)]/50 focus:border-[var(--pen)] disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block font-medium text-[var(--ink)]"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none transition placeholder:text-[var(--ink-faint)]/50 focus:border-[var(--pen)] disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={
                isLoading
                  ? "mt-2 w-full cursor-not-allowed rounded-[4px] bg-[var(--ink-hairline)] px-4 py-2.5 text-xs font-medium text-[var(--ink-faint)]"
                  : "mt-2 w-full rounded-[4px] bg-[var(--pen)] px-4 py-2.5 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)]"
              }
            >
              {isLoading ? "Creating record..." : "Register Reviewer"}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[var(--ink-hairline)] text-center text-xs text-[var(--ink-faint)]">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium text-[var(--pen)] hover:underline"
            >
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}