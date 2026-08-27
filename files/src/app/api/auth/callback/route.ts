import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import {
  exchangeCode,
  getDiscordUser,
  addMemberToGuild,
  getAppConfig,
} from "@/lib/discord";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  const error = req.nextUrl.searchParams.get("error");

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    `${req.nextUrl.protocol}//${req.nextUrl.host}`;

  if (error) {
    return NextResponse.redirect(
      `${baseUrl}/verify?error=${encodeURIComponent(error)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/verify?error=missing_code`);
  }

  try {
    const redirectUri = `${baseUrl}/api/auth/callback`;
    const tokenData = await exchangeCode(code, redirectUri);
    const user = await getDiscordUser(tokenData.access_token);

    const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    await prisma.member.upsert({
      where: { discordId: user.id },
      create: {
        discordId: user.id,
        username: user.username,
        discriminator: user.discriminator || "0",
        globalName: user.global_name,
        avatar: user.avatar,
        email: user.email || null,
        accessToken: encrypt(tokenData.access_token),
        refreshToken: encrypt(tokenData.refresh_token),
        expiresAt,
        scopes: tokenData.scope,
        ip,
      },
      update: {
        username: user.username,
        discriminator: user.discriminator || "0",
        globalName: user.global_name,
        avatar: user.avatar,
        email: user.email || null,
        accessToken: encrypt(tokenData.access_token),
        refreshToken: encrypt(tokenData.refresh_token),
        expiresAt,
        scopes: tokenData.scope,
        ip,
        verifiedAt: new Date(),
      },
    });

    // Optionally add to guild immediately + give role
    const config = await getAppConfig();
    if (config.guildId && tokenData.scope.includes("guilds.join")) {
      const roleIds = config.verifiedRoleId ? [config.verifiedRoleId] : [];
      await addMemberToGuild({
        guildId: config.guildId,
        userId: user.id,
        accessToken: tokenData.access_token,
        roleIds,
      });
    }

    if (config.successRedirect) {
      return NextResponse.redirect(config.successRedirect);
    }

    return NextResponse.redirect(`${baseUrl}/verify?success=1`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    const msg = err instanceof Error ? err.message : "unknown_error";
    return NextResponse.redirect(
      `${baseUrl}/verify?error=${encodeURIComponent(msg)}`
    );
  }
}
