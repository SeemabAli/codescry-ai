"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Logo } from "@/components/common/Logo";
import { loginUser } from "@/services/auth.service";
import { saveAuthSession } from "@/utils/auth-storage";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      const data = await loginUser({
        email,
        password,
      });

      saveAuthSession(data.token, data.user);

      router.push("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to login");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-12 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link href="/">
            <Logo />
          </Link>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-cyan-950/20">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Welcome back
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-400">
              Login to continue reviewing your MERN code with CodeScry AI.
            </p>
          </div>

          {error ? (
            <div className="mb-5 rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Email address
              </label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-300"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={
                isLoading
                  ? "w-full cursor-not-allowed rounded-xl bg-slate-700 px-4 py-3 font-semibold text-slate-400"
                  : "w-full rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
              }
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Do not have an account?{" "}
            <Link href="/register" className="font-medium text-cyan-300">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}