import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAppConfig,
  getValidAccessToken,
  addMemberToGuild,
} from "@/lib/discord";

export const maxDuration = 60; // Vercel pro allows higher; hobby is 10s

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getAppConfig();
  if (!config.guildId) {
    return NextResponse.json(
      { error: "Guild ID not configured in Settings" },
      { status: 400 }
    );
  }

  const members = await prisma.member.findMany({
    select: { id: true, discordId: true },
  });

  let success = 0;
  let already = 0;
  let failed = 0;

  // Process in small batches with delays (Discord rate limits ~5-10 adds/sec depending on server size)
  for (const member of members) {
    try {
      const accessToken = await getValidAccessToken(member.id);
      if (!accessToken) {
        failed++;
        continue;
      }

      const roleIds = config.verifiedRoleId ? [config.verifiedRoleId] : [];
      const result = await addMemberToGuild({
        guildId: config.guildId,
        userId: member.discordId,
        accessToken,
        roleIds,
      });

      if (result.success) {
        if (result.status === 204) already++;
        else success++;

        await prisma.member.update({
          where: { id: member.id },
          data: { lastPulledAt: new Date() },
        });
      } else {
        failed++;
        console.error(`Pull failed for ${member.discordId}:`, result.error);
      }
    } catch (err) {
      failed++;
      console.error(`Pull error for ${member.discordId}:`, err);
    }

    // Small delay between requests
    await new Promise((r) => setTimeout(r, 350));
  }

  return NextResponse.json({ success, already, failed, total: members.length });
}
