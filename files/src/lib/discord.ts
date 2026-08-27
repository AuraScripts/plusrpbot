import { prisma } from "./prisma";
import { decrypt, encrypt } from "./crypto";

const DISCORD_API = "https://discord.com/api/v10";

export async function getAppConfig() {
  let config = await prisma.appConfig.findUnique({ where: { id: "main" } });
  if (!config) {
    config = await prisma.appConfig.create({ data: { id: "main" } });
  }
  return config;
}

export async function getDecryptedConfig() {
  const config = await getAppConfig();
  return {
    ...config,
    clientSecret: config.clientSecret ? decrypt(config.clientSecret) : "",
    botToken: config.botToken ? decrypt(config.botToken) : "",
  };
}

export function buildAuthorizeUrl(opts: {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  state?: string;
}) {
  const params = new URLSearchParams({
    client_id: opts.clientId,
    response_type: "code",
    redirect_uri: opts.redirectUri,
    scope: opts.scopes.join(" "),
    prompt: "consent",
  });
  if (opts.state) params.set("state", opts.state);
  return `https://discord.com/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const config = await getDecryptedConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error("Discord Client ID / Secret not configured");
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token: string;
    scope: string;
  }>;
}

export async function refreshAccessToken(refreshToken: string) {
  const config = await getDecryptedConfig();
  const body = new URLSearchParams({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });

  const res = await fetch(`${DISCORD_API}/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh failed: ${res.status} ${text}`);
  }

  return res.json() as Promise<{
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
  }>;
}

export async function getDiscordUser(accessToken: string) {
  const res = await fetch(`${DISCORD_API}/users/@me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Failed to fetch user: ${res.status}`);
  return res.json() as Promise<{
    id: string;
    username: string;
    discriminator: string;
    global_name: string | null;
    avatar: string | null;
    email?: string;
  }>;
}

export async function addMemberToGuild(opts: {
  guildId: string;
  userId: string;
  accessToken: string;
  roleIds?: string[];
}) {
  const config = await getDecryptedConfig();
  if (!config.botToken) throw new Error("Bot token not configured");

  const body: Record<string, unknown> = {
    access_token: opts.accessToken,
  };
  if (opts.roleIds && opts.roleIds.length > 0) {
    body.roles = opts.roleIds;
  }

  const res = await fetch(
    `${DISCORD_API}/guilds/${opts.guildId}/members/${opts.userId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bot ${config.botToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  // 201 = added, 204 = already in guild
  if (res.status === 201 || res.status === 204) {
    return { success: true, status: res.status };
  }

  const text = await res.text();
  return { success: false, status: res.status, error: text };
}

export async function getValidAccessToken(memberId: string): Promise<string | null> {
  const member = await prisma.member.findUnique({ where: { id: memberId } });
  if (!member) return null;

  const accessToken = decrypt(member.accessToken);
  const refreshToken = decrypt(member.refreshToken);

  // If we have expiresAt and it's still valid (with 60s buffer)
  if (member.expiresAt && member.expiresAt.getTime() > Date.now() + 60_000) {
    return accessToken;
  }

  // Try refresh
  try {
    const data = await refreshAccessToken(refreshToken);
    const newExpires = new Date(Date.now() + data.expires_in * 1000);
    await prisma.member.update({
      where: { id: memberId },
      data: {
        accessToken: encrypt(data.access_token),
        refreshToken: data.refresh_token ? encrypt(data.refresh_token) : member.refreshToken,
        expiresAt: newExpires,
      },
    });
    return data.access_token;
  } catch {
    return null; // token revoked or invalid
  }
}
