import { NextResponse } from 'next/server';
import { upsertVerifiedMember } from '../../../../lib/db';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/?error=missing_code`);
  }

  // Exchange the code for a short-lived access token.
  const tokenRes = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.DISCORD_CLIENT_ID,
      client_secret: process.env.DISCORD_CLIENT_SECRET,
      grant_type: 'authorization_code',
      code,
      redirect_uri: process.env.DISCORD_REDIRECT_URI,
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/?error=token_exchange_failed`);
  }
  const tokenData = await tokenRes.json();

  // Use the token once, immediately, to read the user's identity. We do not store
  // the access or refresh token anywhere — there is nothing here that could be used
  // later to add this person to a server.
  const userRes = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!userRes.ok) {
    return NextResponse.redirect(`${origin}/?error=user_fetch_failed`);
  }
  const user = await userRes.json();

  const avatarUrl = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`
    : `https://cdn.discordapp.com/embed/avatars/${Number(user.discriminator || 0) % 5}.png`;

  await upsertVerifiedMember({
    discordId: user.id,
    username: user.username,
    avatarUrl,
  });

  return NextResponse.redirect(`${origin}/?verified=1`);
}
