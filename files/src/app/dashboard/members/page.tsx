import { prisma } from "@/lib/prisma";
import { PullButton } from "./PullButton";
import { DeleteMemberButton } from "./DeleteMemberButton";

export default async function MembersPage() {
  const members = await prisma.member.findMany({
    orderBy: { verifiedAt: "desc" },
    select: {
      id: true,
      discordId: true,
      username: true,
      globalName: true,
      avatar: true,
      email: true,
      verifiedAt: true,
      lastPulledAt: true,
      ip: true,
    },
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Verified Members</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""} authorized
          </p>
        </div>
        <PullButton count={members.length} />
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-[var(--muted)]">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Discord ID</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 font-medium">Verified</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">
                  Last Pull
                </th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {members.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-[var(--muted)]"
                  >
                    No members yet
                  </td>
                </tr>
              )}
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--card-hover)]/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {m.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`https://cdn.discordapp.com/avatars/${m.discordId}/${m.avatar}.png?size=64`}
                          alt=""
                          className="h-8 w-8 rounded-full"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-[var(--border)] flex items-center justify-center text-xs">
                          {m.username[0]}
                        </div>
                      )}
                      <div>
                        <div className="font-medium">
                          {m.globalName || m.username}
                        </div>
                        <div className="text-xs text-[var(--muted)]">
                          @{m.username}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-[var(--muted)]">
                    {m.discordId}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-[var(--muted)]">
                    {m.email || "—"}
                  </td>
                  <td className="px-4 py-3 text-[var(--muted)]">
                    {new Date(m.verifiedAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-[var(--muted)]">
                    {m.lastPulledAt
                      ? new Date(m.lastPulledAt).toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteMemberButton id={m.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
