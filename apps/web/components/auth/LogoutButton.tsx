"use client";

import { type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { clearAuthSession } from "@/utils/auth-storage";

type LogoutButtonProps = {
  children?: ReactNode;
  className?: string;
};

export function LogoutButton({
  children = "Logout",
  className,
}: LogoutButtonProps) {
  const router = useRouter();

  async function handleLogout() {
    clearAuthSession();
    try {
      await signOut({ redirect: false });
    } catch {
      // Benign if NextAuth session was not active
    }
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/20"
      }
    >
      {children}
    </button>
  );
}