import { NextResponse } from 'next/server';

export async function GET() {
  const params = new URLSearchParams({
    client_id: process.env.DISCORD_CLIENT_ID,
    redirect_uri: process.env.DISCORD_REDIRECT_URI,
    response_type: 'code',
    // identify only — this can NEVER be used to add the user to a server.
    // It only lets us read their Discord user id, username, and avatar.
    scope: 'identify',
    prompt: 'consent',
  });

  return NextResponse.redirect(`https://discord.com/api/oauth2/authorize?${params.toString()}`);
}
