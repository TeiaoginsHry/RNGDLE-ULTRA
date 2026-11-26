# RNGDLE — Vercel Edition

A fresh Next.js project designed for browser-based setup and deployment. It replaces the earlier Vite/Supabase build with **Vercel + Neon Postgres + Clerk**. No Supabase project or local VS Code setup is required.

## What is included

- Premium dark navy / violet RNG interface, responsive layouts and animated drops
- Eight rarity tiers with database-configured chances
- Server-side cryptographic random selection and persistent roll records
- Clerk email/password and Google sign-in UI
- Player records and global roll leaderboard
- Recent roll history
- Owner dashboard, user ban/unban, rarity editor, and activity log
- Owner authorization checked on the server against `OWNER_CLERK_USER_ID`

## Browser-only setup

1. Create a GitHub repository at https://github.com/new.
2. Upload the contents of this folder using GitHub's **Add file → Upload files** page. Keep the folder structure.
3. Create a Vercel account at https://vercel.com and import that GitHub repository.
4. In Vercel Marketplace, add a Neon Postgres database and a Clerk authentication integration. Follow each integration's connect/authorize flow.
5. In Vercel → Project → Settings → Environment Variables, ensure these are present (the integrations may populate some automatically):
   - `DATABASE_URL` — Neon connection string
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk publishable key
   - `CLERK_SECRET_KEY` — Clerk secret key
   - `OWNER_CLERK_USER_ID` — your Clerk user ID (see Owner setup)
6. In the Neon SQL Editor, run the complete contents of `db/schema.sql` once.
7. In Clerk, enable Email + Password and Google under **Configure → SSO connections**. Set the Clerk allowed redirect URLs / domains to your Vercel deployment domain.
8. Redeploy the Vercel project after adding environment variables.

## Permanent owner setup

1. Sign up on your deployed site using **teiaoginshry@gmail.com** and verify that email in Clerk.
2. In Clerk Dashboard → Users, open that account and copy its immutable **User ID** (starts with `user_`).
3. In Vercel → Project → Settings → Environment Variables, set `OWNER_CLERK_USER_ID` to that exact ID for Production (and Preview if desired).
4. Redeploy. The Admin button and owner APIs will now be available only to that Clerk user ID. Never use an email-only frontend check as an authorization control.

The `OWNER_CLERK_USER_ID` value is intentionally not guessed or hardcoded. It must be copied from your own Clerk account after you register. Do not share `CLERK_SECRET_KEY` or the Neon database URL publicly.

## Local development (optional; not required)

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Important notes

- The browser never receives the Clerk secret or Neon connection string.
- Admin APIs independently verify the Clerk session and configured owner user ID.
- The RNG is performed server-side using PostgreSQL `gen_random_bytes`.
- This project is a functional foundation. Before a high-traffic public launch, add rate limiting, email abuse protection, audit retention policy, and load testing. The admin settings table is prepared for future site settings UI; the first admin screen focuses on user controls, odds, and activity.
