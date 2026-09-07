"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Logo } from "@/components/common/Logo";
import type { AuthUser } from "@/types/auth";
import { getStoredUser } from "@/utils/auth-storage";

const navItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    code: "01",
  },
  {
    label: "New Review",
    href: "/reviews/new",
    code: "02",
  },
  {
    label: "Review History",
    href: "/reviews",
    code: "03",
  },
  {
    label: "Settings",
    href: "/settings",
    code: "04",
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <aside className="hidden w-64 border-r border-[var(--ink-hairline)] bg-[var(--paper-dim)] px-4 py-5 lg:flex lg:flex-col shrink-0 select-none">
      <div className="pb-4 border-b border-[var(--ink-hairline)]">
        <Link href="/">
          <Logo />
        </Link>
      </div>

      {/* Ledger Navigation */}
      <div className="mt-6">
        <div className="px-3 pb-2 font-mono text-[10px] uppercase tracking-wider text-[var(--ink-faint)] font-semibold">
          Ledger Navigation
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  isActive
                    ? "flex items-center justify-between border-l-2 border-[var(--pen)] bg-[var(--paper)] pl-3 pr-3 py-2 text-xs font-medium text-[var(--ink)] shadow-none rounded-r-[2px]"
                    : "flex items-center justify-between pl-3 pr-3 py-2 text-xs text-[var(--ink-faint)] transition hover:bg-[var(--paper-raised)] hover:text-[var(--ink)] rounded-[2px]"
                }
              >
                <span>{item.label}</span>
                <span className="font-mono text-[10px] text-[var(--ink-faint)] opacity-70">
                  {item.code}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Margin note box */}
      <div className="mt-8 rounded-[4px] border border-dashed border-[var(--ink-hairline)] bg-[var(--paper)] p-3 text-xs">
        <div className="flex items-center gap-1.5 text-[var(--ink-faint)] font-mono text-[11px] mb-1">
          <span>◇</span>
          <span>Proofreader's Rule</span>
        </div>
        <p className="text-[var(--ink-faint)] text-[11px] leading-relaxed">
          The red pen is reserved for judgment calls. AI suggests in the margin; the reviewer decides.
        </p>
      </div>

      {/* User Section at bottom */}
      <div className="mt-auto border-t border-[var(--ink-hairline)] pt-4">
        {user ? (
          <div className="mb-3 flex items-center gap-2.5 px-1">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-[2px] border border-[var(--ink-hairline)] bg-[var(--paper)] font-mono text-xs font-medium text-[var(--ink)]">
              {user.name ? user.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-[var(--ink)]">
                {user.name}
              </p>
              <p className="truncate font-mono text-[10px] text-[var(--ink-faint)]">
                {user.email}
              </p>
            </div>
          </div>
        ) : null}

        <LogoutButton className="w-full rounded-[4px] border border-[var(--ink-hairline)] bg-[var(--paper)] px-3 py-1.5 text-left text-xs font-medium text-[var(--ink-faint)] transition hover:bg-[var(--paper-raised)] hover:text-[var(--pen)] hover:border-[var(--pen)]/30" />
      </div>
    </aside>
  );
}