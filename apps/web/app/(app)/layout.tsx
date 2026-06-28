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
    <main className="min-h-screen bg-slate-950 text-white">
      <AuthGuard>
        <div className="flex min-h-screen">
          <AppSidebar />

          <section className="flex-1 px-6 py-6 lg:px-10">
            {/* Mobile Header */}
            <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-5 lg:hidden">
              <Link href="/">
                <Logo />
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/reviews/new"
                  className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950"
                >
                  New Review
                </Link>

                <LogoutButton className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-400/20">
                  Logout
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