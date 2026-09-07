"use client";

import { type ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getCurrentUser } from "@/services/auth.service";
import {
  clearAuthSession,
  getAuthToken,
  getStoredUser,
  saveAuthSession,
} from "@/utils/auth-storage";

type AuthGuardProps = {
  children: ReactNode;
};

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    let isMounted = true;

    async function verifyAuth() {
      const token = getAuthToken();
      const storedUser = getStoredUser();

      if (!token) {
        clearAuthSession();

        if (isMounted) {
          setStatus("unauthenticated");
        }

        router.replace("/login");
        return;
      }

      try {
        const data = await getCurrentUser(token);

        saveAuthSession(token, data.user);

        if (isMounted) {
          setStatus("authenticated");
        }
      } catch (error) {
        console.error("Auth verification error:", error);

        // If stored user exists, allow optimistic access if offline/network error
        if (storedUser && error instanceof Error && error.message.includes("fetch")) {
          if (isMounted) {
            setStatus("authenticated");
          }
          return;
        }

        clearAuthSession();

        if (isMounted) {
          setStatus("unauthenticated");
        }

        router.replace("/login");
      }
    }

    verifyAuth();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <div>
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />

          <p className="mt-5 text-sm text-slate-400">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return null;
  }

  return <>{children}</>;
}