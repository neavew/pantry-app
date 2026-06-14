# Pantry App

A shared household pantry tracker for two people. Built with React + Supabase + Anthropic.

---

## Setup (one-time, ~15 minutes)

### 1. Set up the Supabase database

1. Go to your Supabase project → **SQL Editor** → **New query**
2. Paste the contents of `supabase-schema.sql` and click **Run**
3. This creates the `pantry_items` table and enables realtime sync

### 2. Add your environment variables

1. Copy the example file:
   ```
   cp .env.example .env.local
   ```
2. Open `.env.local` and fill in your values:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_ANTHROPIC_API_KEY=sk-ant-...
   ```
   **Never share or commit `.env.local`** — it's in `.gitignore` automatically.

### 3. Run locally (optional, to test before deploying)

```bash
npm install
npm run dev
```
Open http://localhost:5173

---

## Deploy to Vercel

1. Go to **vercel.com** → **Add New Project** → Import your GitHub repo
2. In Vercel's **Environment Variables** section, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ANTHROPIC_API_KEY`
3. Click **Deploy** — Vercel builds and gives you a URL like `https://pantry-app-xyz.vercel.app`
4. **Share the URL with your partner** — bookmark it on both iPhones as a home screen shortcut:
   Safari → Share → Add to Home Screen

---

## Features

- **Dashboard** — two dials showing Costco and Grocery Store trip urgency, based on how many staples are low/out
- **Shopping Lists** — separate Costco and Grocery Store lists; staples auto-add when Low; tick off to restock
- **Pantry** — full inventory by category (Fridge, Freezer, Pantry shelf); tap Full/Low/Out to update
- **Scan** — upload a fridge photo or type a voice note; AI suggests updates; you confirm before anything saves
- **Real-time sync** — both partners see changes instantly via Supabase realtime

---

## Costs

- Supabase free tier: plenty for household use
- Vercel free tier: more than enough
- Anthropic API: ~$0.01–0.03 per photo scan; a few dollars/month at most
