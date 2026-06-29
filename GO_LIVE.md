# GO LIVE — launch this Reviews app for a new brand

This app isn't on the Shopify App Store, so each store gets its **own copy**: one
duplicate of this folder → one Vercel deploy → one Shopify custom app. This is the whole
runbook. First time takes ~30–45 min; after that it's mostly waiting on builds.

> **The one-prompt path:** duplicate this folder, open it in Cowork, and say:
> *"Set this up for **Acme Co**. Vercel domain `acme-reviews.vercel.app`, Shopify Client
> ID `…`, Client secret `…`, Supabase URL `…`, service_role key `…`, locale global,
> store `acme-co.myshopify.com`."*
> Claude reads `CLAUDE.md`, fills `brand.config.json` + `.env`, runs the configure script,
> and hands you the deploy steps below. The rest of this file is the manual version.

---

## What you need before starting
Four accounts (free tiers are fine): **Shopify Partners**, **Supabase**, **Vercel**, **GitHub**.
Plus the brand's details: name, desired app handle, and which store it installs on.

---

## Step 0 — Duplicate + reset
1. Copy this whole folder and rename it for the brand (e.g. `reviews-acme/`).
2. In the copy, delete carried-over local state so it doesn't point at the previous brand:
   ```bash
   rm -rf node_modules .shopify .vercel .env .brand-applied.json
   ```
   (The configure script also moves `.shopify/` aside automatically, but clearing it now is cleaner.)

## Step 1 — Fill `brand.config.json`
Open it and set the non-secret values:
```json
{
  "brand":  { "name": "Acme Co", "appName": "Acme Reviews", "appHandle": "acme-reviews", "supportEmail": "you@evolabs.com" },
  "deploy": { "vercelDomain": "acme-reviews.vercel.app", "shopifyClientId": "PASTE_CLIENT_ID", "scopes": "read_products" },
  "store":  { "myshopifyDomain": "acme-co.myshopify.com" },
  "reviewsLocale": { "preset": "global" }
}
```
- `vercelDomain` — no `https://`, no trailing slash. If you don't know it yet, pick the
  name you'll use when you create the Vercel project (you control it).
- `shopifyClientId` — from the Partner app (Step 3). Leave the placeholder for now if the
  app doesn't exist yet; `shopify app config link` fills it later.
- `preset` — `india` (Hinglish) or `global` (plain English).

## Step 2 — Stamp the brand into the code
```bash
npm run setup:brand
```
This rewrites `shopify.app.toml`, the four widget `.liquid` files, and the widget JS so
every URL/identifier matches this brand. It also creates `.env`. Re-runnable anytime.
Preview first with `npm run setup:check` if you like.

## Step 3 — Create the Shopify app
1. **Supabase first** (Step 4) if you want the Client ID flow to be one pass — or do this now:
   Partner Dashboard → **Apps → Create app → Create app manually** → name it.
2. Copy the app's **Client ID** and **Client secret** (Settings / API credentials).
3. Put the **Client ID** in `brand.config.json` → re-run `npm run setup:brand`.
4. Put the **Client secret** in `.env` as `SHOPIFY_API_SECRET`.

## Step 4 — Supabase
You can **reuse one Supabase project across all brands** (every row is keyed by
`shop_domain`) or spin up a fresh one per brand. Either way:
1. supabase.com → (reuse or **New project**).
2. **SQL Editor → New query** → paste **all** of `supabase/schema_full.sql` → **Run**.
   (Idempotent — safe to run on a shared project that already has the tables.)
3. **Settings → API** → copy the **Project URL** and the **service_role** secret key.
4. Put both in `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

## Step 5 — Finish `.env`
Every `__SET_ME__` should now be real:
```
SHOPIFY_API_KEY=<client id>
SHOPIFY_API_SECRET=<client secret>
SHOPIFY_APP_URL=https://acme-reviews.vercel.app
SCOPES=read_products
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role key>
REVIEW_LOCALE=global
NODE_ENV=production
```

## Step 6 — Ship to GitHub → Vercel
```bash
npm install
git init && git add . && git commit -m "Reviews app for Acme"
git branch -M main
git remote add origin https://github.com/<you>/<repo>.git
git push -u origin main
```
Then **vercel.com → Add New → Project → Import** the repo. Vercel auto-detects Remix.
Before deploying, add the **same 7 env vars** from `.env` (Production). Deploy, then
confirm the production domain equals `deploy.vercelDomain` (rename the Vercel project if
not). If the root 404s later, it's almost always a missing `SHOPIFY_APP_URL` — set it and redeploy.

## Step 7 — Push the Shopify config + widget
```bash
npx shopify app config link     # log in, select/create this brand's app — fills Client ID
npx shopify app deploy          # pushes app URLs, scopes, webhooks + the Reviews widget
```

## Step 8 — Install + turn on the widget
1. Partner Dashboard → app → **Test on development store / Select store** → **Install**.
   On install the store is recorded in Supabase (first 50 stores across the project get
   the free "early adopter" banner).
2. Store admin → **Online Store → Themes → Customize → App embeds** → enable
   **"Reviews — Auto Display"** → set its API URL to the Vercel domain → **Save**.

## Step 9 — Smoke test
- Product page shows the star badge + review grid (empty is fine).
- Admin → **Import CSV** → "Download 10 sample reviews" → upload → they appear.
- Storefront → "Write a review" → submit → shows as **pending** in admin → approve → it
  appears on the storefront.

---

## Per-brand checklist (copy this per store)
- [ ] Folder duplicated + reset (`rm -rf node_modules .shopify .vercel .env .brand-applied.json`)
- [ ] `brand.config.json` filled
- [ ] `npm run setup:brand` run
- [ ] Shopify app created; Client ID in config, secret in `.env`
- [ ] Supabase schema run; URL + service_role key in `.env`
- [ ] All 7 `.env` vars set (and mirrored in Vercel)
- [ ] Vercel deployed at the expected domain
- [ ] `shopify app config link` + `shopify app deploy` done
- [ ] App installed; "Reviews — Auto Display" enabled with the API URL
- [ ] Smoke test passed

## Notes
- **Reviews honesty:** the Generate page / bulk CSVs can post fabricated reviews — that's
  illegal as genuine reviews in many markets (FTC/EU/UK). Prefer real imports + storefront
  submissions; use Generate only to preview layout, then delete those rows.
- **Optional hardening** (not required to launch): the CSV import has no de-dup, so don't
  import the same file twice; the public `POST /api/reviews` is open (reviews land as
  `pending`, so spam is contained but visible in admin).
- **Dead files:** `api/index.js` and `remix.config.js` are leftovers excluded from deploy —
  delete them whenever.
