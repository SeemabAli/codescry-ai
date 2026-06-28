/* eslint-disable react-hooks/set-state-in-effect */
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
  },
  {
    label: "New Review",
    href: "/reviews/new",
  },
  {
    label: "Review History",
    href: "/reviews",
  },
  {
    label: "Settings",
    href: "/settings",
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  return (
    <aside className="hidden w-72 border-r border-white/10 bg-slate-950 px-6 py-6 lg:flex lg:flex-col">
      <Link href="/">
        <Logo />
      </Link>

      <nav className="mt-10 space-y-2">
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
                  ? "block rounded-xl bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-300"
                  : "block rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              }
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
        <p className="text-sm font-medium text-cyan-300">Learning Mode</p>

        <p className="mt-2 text-xs leading-5 text-slate-400">
          Every review will explain problems like a senior developer mentor.
        </p>
      </div>

      <div className="mt-auto border-t border-white/10 pt-5">
        {user ? (
          <div className="mb-4">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="mt-1 truncate text-xs text-slate-500">
              {user.email}
            </p>
          </div>
        ) : null}

        <LogoutButton className="w-full rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-left text-sm font-medium text-red-300 transition hover:bg-red-400/20" />
      </div>
    </aside>
  );
}