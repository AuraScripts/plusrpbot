import { NextResponse } from 'next/server';

// Creates a normal Discord invite link (like clicking "Create Invite" in the app).
// This does NOT add anyone automatically — it just returns a discord.gg link that
// a person has to click themselves, same as any other invite.
export async function POST() {
  const channelId = process.env.DISCORD_INVITE_CHANNEL_ID;

  const res = await fetch(`https://discord.com/api/v10/channels/${channelId}/invites`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      max_age: 86400,   // expires in 24 hours
      max_uses: 1,       // single use
      unique: true,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: 'Failed to create invite', detail: text }, { status: 500 });
  }

  const invite = await res.json();
  return NextResponse.json({ url: `https://discord.gg/${invite.code}` });
}
