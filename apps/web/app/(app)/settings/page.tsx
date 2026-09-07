"use client";

import { useEffect, useState } from "react";
import { getStoredUser } from "@/utils/auth-storage";
import type { AuthUser } from "@/types/auth";

export default function SettingsPage() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) {
      setUser(stored);
      setName(stored.name);
      setEmail(stored.email);
    }
  }, []);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSavedMessage("Settings saved to ledger session.");
    setTimeout(() => setSavedMessage(""), 3000);
  }

  return (
    <div className="max-w-3xl pb-16">
      {/* Header */}
      <div className="border-b border-[var(--ink-hairline)] pb-6">
        <div className="font-mono text-xs text-[var(--ink-faint)] flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 bg-[var(--pen)] rounded-[1px]" />
          <span>Ledger Preferences</span>
        </div>

        <h1 className="mt-2 font-serif text-3xl font-normal tracking-tight text-[var(--ink)]">
          Reviewer Settings
        </h1>

        <p className="mt-1 text-xs text-[var(--ink-faint)] max-w-xl">
          Manage your editorial profile and AI proofreading annotation preferences.
        </p>
      </div>

      {savedMessage ? (
        <div className="mt-6 rounded-[2px] border border-[var(--diff-add)]/30 bg-[var(--diff-add-bg)] px-3.5 py-2 text-xs font-mono text-[var(--diff-add)]">
          {savedMessage}
        </div>
      ) : null}

      {/* Profile Form */}
      <form onSubmit={handleSave} className="mt-8 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6">
        <h2 className="font-serif text-lg font-normal text-[var(--ink)]">
          Reviewer Profile
        </h2>
        <p className="text-xs text-[var(--ink-faint)] mt-1">
          Identifies your markups and decisions in review threads.
        </p>

        <div className="mt-5 space-y-4 text-xs">
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
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full sm:max-w-md rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--pen)]"
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="reviewer@domain.org"
              className="w-full sm:max-w-md rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-2 text-xs text-[var(--ink)] outline-none focus:border-[var(--pen)]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="rounded-[4px] bg-[var(--pen)] px-4 py-2 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)]"
            >
              Save Profile
            </button>
          </div>
        </div>
      </form>

      {/* Proofreading Annotations Preferences */}
      <div className="mt-6 rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] p-6">
        <h2 className="font-serif text-lg font-normal text-[var(--ink)]">
          Proofreading Options
        </h2>
        <p className="text-xs text-[var(--ink-faint)] mt-1">
          Configure how CodeScry AI generates candidate margin notes.
        </p>

        <div className="mt-5 space-y-3 text-xs">
          <label className="flex items-start gap-3 p-3 rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 accent-[var(--pen)]"
            />
            <div>
              <p className="font-medium text-[var(--ink)]">
                Senior Developer Explanations
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
                Annotate why an anti-pattern or vulnerability is dangerous, like a teacher in the margin.
              </p>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper-raised)] cursor-pointer">
            <input
              type="checkbox"
              defaultChecked
              className="mt-0.5 accent-[var(--pen)]"
            />
            <div>
              <p className="font-medium text-[var(--ink)]">
                Synthesize Suggested Code Fixes
              </p>
              <p className="mt-0.5 text-[11px] text-[var(--ink-faint)]">
                Provide unified diff proposals directly within the margin card for instant endorsement.
              </p>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}