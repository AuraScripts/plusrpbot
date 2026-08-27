import { prisma } from "@/lib/prisma";
import { getAppConfig } from "@/lib/discord";
import Link from "next/link";

export default async function DashboardPage() {
  const [memberCount, config] = await Promise.all([
    prisma.member.count(),
    getAppConfig(),
  ]);

  const recent = await prisma.member.findMany({
    orderBy: { verifiedAt: "desc" },
    take: 5,
    select: {
      discordId: true,
      username: true,
      globalName: true,
      avatar: true,
      verifiedAt: true,
    },
  });

  const cards = [
    {
      label: "Verified Members",
      value: memberCount,
      href: "/dashboard/members",
    },
    {
      label: "Client ID",
      value: config.clientId ? "Configured" : "Not set",
      href: "/dashboard/settings",
    },
    {
      label: "Target Guild",
      value: config.guildId ? "Set" : "Not set",
      href: "/dashboard/settings",
    },
    {
      label: "Brand Name",
      value: config.brandName || "PLUSRP",
      href: "/dashboard/settings",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-[var(--muted)] text-sm mb-8">
        Overview of your PLUSRP Restore instance
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 hover:border-[var(--primary)]/50 transition"
          >
            <div className="text-sm text-[var(--muted)] mb-1">{c.label}</div>
            <div className="text-2xl font-semibold">{c.value}</div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <h2 className="font-semibold">Recent Verifications</h2>
          <Link
            href="/dashboard/members"
            className="text-sm text-[var(--primary)] hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {recent.length === 0 && (
            <div className="px-5 py-8 text-center text-[var(--muted)] text-sm">
              No members verified yet. Share your{" "}
              <Link href="/verify" className="text-[var(--primary)] underline">
                verify page
              </Link>
              .
            </div>
          )}
          {recent.map((m) => (
            <div
              key={m.discordId}
              className="flex items-center gap-3 px-5 py-3"
            >
              {m.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={`https://cdn.discordapp.com/avatars/${m.discordId}/${m.avatar}.png?size=64`}
                  alt=""
                  className="h-9 w-9 rounded-full"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-[var(--border)] flex items-center justify-center text-xs">
                  {m.username[0]}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {m.globalName || m.username}
                </div>
                <div className="text-xs text-[var(--muted)]">
                  @{m.username} · {m.discordId}
                </div>
              </div>
              <div className="text-xs text-[var(--muted)]">
                {new Date(m.verifiedAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
