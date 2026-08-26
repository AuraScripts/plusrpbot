import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/verify?error=no_code", request.url));
  }

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "Missing Discord credentials" }, { status: 500 });
  }

  // Exchange code for tokens
  const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    console.error("Token error:", tokenData);
    return NextResponse.redirect(new URL("/verify?error=token_failed", request.url));
  }

  const { access_token } = tokenData;

  // Get user info
  const userResponse = await fetch("https://discord.com/api/users/@me", {
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });

  const user = await userResponse.json();

  if (!userResponse.ok) {
    return NextResponse.redirect(new URL("/verify?error=user_failed", request.url));
  }

  // For now we just redirect to success page with user info
  // Later we will save access_token + refresh_token to database
  const successUrl = new URL("/success", request.url);
  successUrl.searchParams.set("id", user.id);
  successUrl.searchParams.set("username", user.username);
  successUrl.searchParams.set("avatar", user.avatar || "");

  return NextResponse.redirect(successUrl);
}
