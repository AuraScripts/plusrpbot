# PLUSRP Restore

Self-hosted Discord member verification & recovery (RestoreCord-style) built for **Vercel**.

## Features

- Branded public verification page (`/verify`)
- Discord OAuth2 (`identify` + `guilds.join` + optional email/guilds)
- Encrypted storage of access & refresh tokens
- Admin dashboard (username + password)
  - Dashboard overview
  - Verified members list + delete
  - One-click **Pull All Members** into your guild
  - OAuth2 URL generator
  - Full settings (Discord app, guild, role, branding)
- Instant join + verified role on authorize (optional)

## Quick Start (Local)

1. Create a free Postgres database (recommended: [Neon](https://neon.tech))

2. Copy environment file:
   ```bash
   cp .env.example .env
   ```

3. Fill in `.env`:
   ```env
   DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
   JWT_SECRET="long-random-string-at-least-32-chars"
   ENCRYPTION_KEY="another-long-random-string-at-least-32-chars"
   ADMIN_USERNAME="admin"
   ADMIN_PASSWORD="your-secure-password"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. Install & push schema:
   ```bash
   npm install
   npx prisma db push
   ```

5. Run:
   ```bash
   npm run dev
   ```

6. Open http://localhost:3000/login

## Discord Setup

1. https://discord.com/developers/applications → New Application
2. OAuth2 → Redirects → add:
   - `http://localhost:3000/api/auth/callback`
   - `https://your-vercel-domain.vercel.app/api/auth/callback`
3. Copy **Client ID** and **Client Secret**
4. Bot tab → Reset Token → copy token  
   (Enable Server Members Intent if needed later)
5. Invite the bot to your server with **Create Instant Invite** + **Manage Roles**
6. In the dashboard → **Settings**:
   - Paste Client ID, Client Secret, Bot Token
   - Guild ID + optional Verified Role ID
   - Customize branding (name, logo, color, description)
   - Save

## Deploy on Vercel

1. Push this folder to a GitHub repo
2. Import project in Vercel
3. Add all environment variables (set `NEXT_PUBLIC_APP_URL` to your production URL)
4. Deploy

Build command (already in package.json):
```
prisma generate && next build
```

After first deploy, run once against production DB:
```bash
npx prisma db push
```

## Security Notes

- Tokens are encrypted at rest using `ENCRYPTION_KEY`
- Admin password is bcrypt-hashed
- Never commit `.env`
- Discord rate-limits how fast members can be added — the pull feature includes delays

## Branding

Default name is **PLUSRP**. Change it in Settings anytime.
