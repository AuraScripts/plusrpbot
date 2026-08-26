import { sql } from '@vercel/postgres';

export async function ensureTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS verified_members (
      id SERIAL PRIMARY KEY,
      discord_id TEXT UNIQUE NOT NULL,
      username TEXT NOT NULL,
      avatar_url TEXT,
      verified_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
}

export async function upsertVerifiedMember({ discordId, username, avatarUrl }) {
  await ensureTable();
  await sql`
    INSERT INTO verified_members (discord_id, username, avatar_url, verified_at)
    VALUES (${discordId}, ${username}, ${avatarUrl}, now())
    ON CONFLICT (discord_id)
    DO UPDATE SET username = EXCLUDED.username, avatar_url = EXCLUDED.avatar_url;
  `;
}

export async function listVerifiedMembers() {
  await ensureTable();
  const { rows } = await sql`
    SELECT discord_id, username, avatar_url, verified_at
    FROM verified_members
    ORDER BY verified_at DESC;
  `;
  return rows;
}

export async function countVerifiedMembers() {
  await ensureTable();
  const { rows } = await sql`SELECT COUNT(*)::int AS count FROM verified_members;`;
  return rows[0].count;
}
