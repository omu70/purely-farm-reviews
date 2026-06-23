# Reviews App — Deploy Guide (Supabase + Vercel + Shopify)

Step-by-step, in order. Should take ~30–45 minutes the first time.

Your stack: **Supabase** (database) → **Vercel** (hosts the admin app + `/api/reviews`) → **Shopify** (hosts the storefront widget, installs the app on your store).

---

## What I already fixed in the code

So you know what changed before you deploy:

- Added the missing files the app needs to even build: `app/shopify.server.js`, `app/root.jsx`, `app/entry.server.jsx`, `app/routes/app.jsx`, `app/routes/_index.jsx`, the 5 webhook routes, and `vite.config.js`.
- Switched the build to the **Remix Vite + `@vercel/remix`** path (the old `remix.config.js` + `api/index.js` adapter conflicted and is now neutralized + excluded from deploy).
- Replaced Prisma session storage with a **Supabase session adapter** (`app/utils/session-storage.server.js`) — no extra database to manage, works on serverless.
- Wrote **`supabase/schema_full.sql`** — one idempotent script with all tables, the storage bucket, the sessions table, and the **bug fix** that lets the review generator save (`source = 'ai_sample'` was previously rejected by the DB).
- Created **`shopify.app.toml`** (with placeholders) and a `.gitignore`.

---

## Prerequisites

- **Node.js 18.20+** installed → check with `node -v`.
- The four accounts you already have: Shopify Partner + app, Supabase, Vercel, GitHub.
- A terminal open in this project folder.

---

## Part 1 — Supabase (new project)

1. Go to **supabase.com → New project**. Name it e.g. `reviews-app`, pick a region near your customers, set a database password (save it somewhere).
2. Wait ~2 min for it to provision.
3. Open **SQL Editor → New query**. Open `supabase/schema_full.sql` from this folder, copy **all** of it, paste, and click **Run**. You should see "Success. No rows returned."
4. Go to **Settings → API** and copy two values:
   - **Project URL** → this is your `SUPABASE_URL`
   - **Project API keys → `service_role` (secret)** → click reveal, copy → this is your `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ The service_role key bypasses all security. Only ever put it in Vercel env vars / your local `.env`. Never in the browser or the theme.

---

## Part 2 — Get the code on GitHub

In a terminal, in this folder:

```bash
npm install          # installs dependencies (and creates package-lock.json)
git init             # skip if this folder is already a git repo
git add .
git commit -m "Reviews app: complete scaffolding + Vercel/Supabase setup"
git branch -M main
git remote add origin https://github.com/<you>/<your-repo>.git   # your repo URL
git push -u origin main
```

> If the repo already exists with content, `git pull --rebase origin main` first, then push.

---

## Part 3 — Deploy to Vercel

1. **vercel.com → Add New → Project → Import** your GitHub repo.
2. Vercel auto-detects **Remix**. Leave the build settings as-is (it reads `vercel.json`).
3. Before deploying, open **Environment Variables** and add these (Production):

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | from Part 1 |
   | `SUPABASE_SERVICE_ROLE_KEY` | from Part 1 |
   | `SHOPIFY_API_KEY` | Partner Dashboard → your app → **Client ID** |
   | `SHOPIFY_API_SECRET` | Partner Dashboard → your app → **Client secret** |
   | `SCOPES` | `write_products,read_products` |
   | `SHOPIFY_APP_URL` | leave blank for now — you'll set it in step 5 |

4. Click **Deploy**. When it finishes, copy your production domain, e.g. `https://reviews-app-xxxx.vercel.app`.
5. Go to **Settings → Environment Variables**, set `SHOPIFY_APP_URL` to that exact domain, then **Deployments → ⋯ → Redeploy** so it picks up the value.

> If the first build shows a 404 at the root later, it's almost always the `SHOPIFY_APP_URL` env var missing — set it and redeploy.

---

## Part 4 — Push the Shopify config + storefront widget

The **admin app** lives on Vercel, but the **storefront widget** (the star badge / review grid) lives on Shopify and only gets there via the CLI.

1. Open **`shopify.app.toml`** and replace the placeholders:
   - `client_id` → your app's **Client ID**
   - every `https://<YOUR-APP>.vercel.app` → your real Vercel domain (it appears 4 times)
2. In the terminal:

```bash
npx shopify app deploy
```

   - Log in to your Partner account when prompted, and confirm it targets your existing app.
   - This pushes: the **app URLs + access scopes + webhooks** (from the toml) **and** the **Reviews Widget** theme extension to Shopify.
3. (Optional sanity check) Partner Dashboard → your app → **Configuration**: App URL and the redirect URLs should now show your Vercel domain.

---

## Part 5 — Install the app on your store

1. Partner Dashboard → your app → **Test your app / Select store** → choose your store → **Install**.
2. Approve the requested scopes. The app opens **embedded** inside your Shopify admin.
3. On install, your store is auto-recorded in Supabase (first 50 stores get the `early_adopter_free` plan — you'll see a green banner).

If the app loads with the dashboard (even if empty), auth + database + sessions all work. 🎉

---

## Part 6 — Turn on the widget in your theme

1. **Online Store → Themes → Customize**.
2. Bottom-left, click the **App embeds** icon → toggle on **"Reviews — Auto Display"**.
3. In its settings, set **App API URL (Vercel)** to your Vercel domain → **Save**.
   - This auto-injects the star badge under the product title, the review grid at the bottom of product pages, and small star badges on collection/search cards.
4. *(Optional)* Add the **"Store Reviews"** section to your homepage, and/or the standalone **Star Badge** / **Review Grid** app blocks on the product template if you want manual placement. Set the API URL on each.

---

## Part 7 — Test it works

- [ ] Open any product page on your storefront → star badge + review grid appear (empty is fine at first).
- [ ] Admin → **Import CSV** → click **"Download 10 sample reviews"**, then upload it → reviews import.
- [ ] Refresh the product page (use a `product_handle` that matches a real product) → reviews show with the average rating.
- [ ] Storefront → **"Write a review"** → submit → it appears as **pending** in the admin dashboard → approve it → it shows on the storefront.
- [ ] Admin → **Generate** → pick products → generate (this now works after the DB fix).

---

## Part 8 — What's still remaining / things to know

**Build-it-later (not blocking launch):**
- No email notification when a new review is submitted.
- No UI to reply to reviews from the admin (the DB supports `reply`, but there's no button).
- The storefront widget has a filter icon but no working filter/sort yet.
- Analytics (views, conversion) aren't tracked.

**Minor code notes:**
- `app/routes/api.reviews.jsx` builds a product filter by string-interpolating the handle. Product handles with commas/periods (rare) could break that one query — fine for normal handles.
- `api/index.js` and `remix.config.js` are deprecated leftovers (neutralized + excluded from deploy via `.vercelignore`). Delete them whenever you like.
- The app requests `write_products` but only ever reads products — you can narrow `SCOPES` to just `read_products` (in both Vercel env and `shopify.app.toml`) for least privilege, then redeploy.

**⚠️ Legal caution (you chose to keep the generator as-is):**
The **Generate** feature creates fake reviews and publishes them as **approved**. Displaying fabricated reviews is **illegal** in many places — in the US the FTC can fine up to ~$50,000 **per fake review**, and the EU/UK have similar bans. This is a real risk to your store, not just a formality. Strongly consider using it only to preview layout (and deleting those rows before launch), or relying on the CSV import / real storefront submissions instead.

**Couldn't be tested from here:** the live Vercel build and the embedded Shopify login can only be confirmed once deployed. If login loops or the build fails, the usual causes are (1) a missing env var, especially `SUPABASE_SERVICE_ROLE_KEY` or `SHOPIFY_APP_URL`, or (2) the toml URLs not matching the Vercel domain.

---

## Command cheat-sheet

```bash
npm install                 # install deps
npm run dev                 # local dev (shopify app dev) — opens a tunnel
npx shopify app deploy      # push app config + theme widget to Shopify
git add . && git commit -m "..." && git push   # triggers a Vercel deploy
```
