import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { getAppConfig } from "@/lib/discord";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const config = await getAppConfig();
  // Never return raw secrets
  return NextResponse.json({
    clientId: config.clientId,
    hasClientSecret: !!config.clientSecret,
    hasBotToken: !!config.botToken,
    guildId: config.guildId,
    verifiedRoleId: config.verifiedRoleId,
    brandName: config.brandName,
    brandLogo: config.brandLogo,
    brandDescription: config.brandDescription,
    accentColor: config.accentColor,
    requestEmail: config.requestEmail,
    requestGuilds: config.requestGuilds,
    successRedirect: config.successRedirect,
  });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const data: Record<string, unknown> = {};

  if (typeof body.clientId === "string") data.clientId = body.clientId.trim();
  if (typeof body.clientSecret === "string" && body.clientSecret.trim()) {
    data.clientSecret = encrypt(body.clientSecret.trim());
  }
  if (typeof body.botToken === "string" && body.botToken.trim()) {
    data.botToken = encrypt(body.botToken.trim());
  }
  if (typeof body.guildId === "string") data.guildId = body.guildId.trim();
  if (typeof body.verifiedRoleId === "string")
    data.verifiedRoleId = body.verifiedRoleId.trim();
  if (typeof body.brandName === "string") data.brandName = body.brandName;
  if (typeof body.brandLogo === "string") data.brandLogo = body.brandLogo;
  if (typeof body.brandDescription === "string")
    data.brandDescription = body.brandDescription;
  if (typeof body.accentColor === "string") data.accentColor = body.accentColor;
  if (typeof body.requestEmail === "boolean")
    data.requestEmail = body.requestEmail;
  if (typeof body.requestGuilds === "boolean")
    data.requestGuilds = body.requestGuilds;
  if (typeof body.successRedirect === "string")
    data.successRedirect = body.successRedirect;

  await prisma.appConfig.upsert({
    where: { id: "main" },
    create: { id: "main", ...data },
    update: data,
  });

  return NextResponse.json({ ok: true });
}
