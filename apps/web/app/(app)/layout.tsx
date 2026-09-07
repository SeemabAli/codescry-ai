import Link from "next/link";
import { AppSidebar } from "@/components/app/AppSidebar";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { Logo } from "@/components/common/Logo";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <AuthGuard>
        <div className="flex min-h-screen">
          <AppSidebar />

          <section className="flex-1 px-4 py-6 sm:px-8 lg:px-10 overflow-x-hidden">
            {/* Mobile Header */}
            <div className="mb-6 flex items-center justify-between border-b border-[var(--ink-hairline)] pb-4 lg:hidden">
              <Link href="/">
                <Logo />
              </Link>

              <div className="flex items-center gap-2.5">
                <Link
                  href="/reviews/new"
                  className="rounded-[4px] bg-[var(--pen)] px-3 py-1.5 text-xs font-medium text-white transition hover:bg-[var(--pen-hover)]"
                >
                  New Review
                </Link>

                <LogoutButton className="rounded-[4px] border border-[var(--ink-hairline)] px-2.5 py-1.5 text-xs font-medium text-[var(--ink-faint)] transition hover:bg-[var(--paper-raised)] hover:text-[var(--ink)]">
                  Log out
                </LogoutButton>
              </div>
            </div>

            {children}
          </section>
        </div>
      </AuthGuard>
    </main>
  );
}