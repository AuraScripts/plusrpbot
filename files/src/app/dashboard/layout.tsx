import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import Link from "next/link";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: "◫" },
  { href: "/dashboard/members", label: "Verified Members", icon: "◎" },
  { href: "/dashboard/oauth", label: "OAuth URL", icon: "🔗" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙" },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] flex flex-col">
        <div className="p-5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-xs font-bold text-white">
              PR
            </div>
            <span className="font-semibold tracking-tight">PLUSRP</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white transition"
            >
              <span className="text-base opacity-70">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 text-sm">
            <div className="h-7 w-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-xs font-medium text-white">
              {session.username[0]?.toUpperCase()}
            </div>
            <span className="truncate text-[var(--muted)]">
              {session.username}
            </span>
          </div>
          <form action="/api/auth/logout" method="POST" className="mt-3">
            <button
              type="submit"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--card-hover)] hover:text-white transition"
            >
              Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
