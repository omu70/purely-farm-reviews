# CLAUDE.md — agent runbook for this Reviews app

This repo is a **single-store deploy template**. It's a Shopify product-reviews app
(Remix + Vite + Supabase + Polaris admin + a Theme App Extension widget, hosted on
Vercel). It is **not** App-Store-published — every brand gets its own duplicate of this
folder, its own Vercel deploy, and its own Shopify custom app.

## When the user says "set this up / make it ready for <brand>"

That is the main job. Follow these steps **in order**. Do not hardcode brand values
anywhere — everything flows from `brand.config.json` and `.env`.

### 1. Collect the brand's details
You need these (ask only for whatever the user hasn't already given you):

| Field | Goes in | Example |
|---|---|---|
| Brand name | `brand.config.json` | `Acme Co` |
| Shopify app name | `brand.config.json` | `Acme Reviews` |
| Shopify app handle (slug) | `brand.config.json` | `acme-reviews` |
| Vercel domain (no `https://`) | `brand.config.json` | `acme-reviews.vercel.app` |
| Shopify **Client ID** | `brand.config.json` | from Partner Dashboard → app → API credentials |
| Locale preset (`india`/`global`) | `brand.config.json` | `global` |
| Store `*.myshopify.com` | `brand.config.json` | `acme-co.myshopify.com` |
| Shopify **Client secret** | `.env` (secret) | — |
| Supabase URL | `.env` (secret) | — |
| Supabase **service_role** key | `.env` (secret) | — |

`SHOPIFY_API_KEY` **is** the Client ID — don't ask for it separately.
If the user doesn't have the Client ID / Vercel domain yet, that's fine: leave the
placeholder, run the script anyway, and tell them to fill it after they create the
app/Vercel project (or run `npx shopify app config link`, which fills the Client ID).

### 2. Write `brand.config.json`
Edit the file with the non-secret values above. Secrets never go here (it's tracked in git).

### 3. Run the configure script
```bash
npm run setup:brand        # = node scripts/configure-brand.mjs
```
It stamps the brand into `shopify.app.toml`, all four widget `.liquid` files, and the
widget JS fallback; creates `.env` if missing; and (in a duplicated folder) moves stale
`.shopify/` link-state aside. It's idempotent — safe to re-run. Use `npm run setup:check`
to preview without writing.

### 4. Put the secrets in `.env`
Open `.env` (the script created it, it's gitignored) and replace every `__SET_ME__`
with the real Client secret + Supabase URL + service_role key the user shared.

### 5. Install + report the go-live checklist
```bash
npm install
```
Then tell the user exactly what's left (these are interactive / outside the sandbox —
do **not** try to run them headless):
1. Run `supabase/schema_full.sql` once in the Supabase SQL editor.
2. Push to GitHub → import in Vercel → add the **same** vars from `.env` as Vercel
   env vars → deploy. Copy the production domain; it must equal `deploy.vercelDomain`.
3. `npx shopify app config link` (links/creates the app, fills Client ID) →
   `npx shopify app deploy` (pushes config + the widget).
4. Install the app on the store, then in the theme editor enable the
   **"Reviews — Auto Display"** app embed and set its API URL to the Vercel domain.

`GO_LIVE.md` has the full detail — point the user there.

## Where brand values live (so you never miss one)
- `shopify.app.toml` — `client_id`, `name`, `handle`, `application_url`, 3 redirect URLs,
  3 webhook URLs, `scopes`. **All stamped by the script.**
- `extensions/reviews-widget/blocks/*.liquid` (×4) — the `default:` API base URL. **Stamped.**
- `extensions/reviews-widget/assets/app-embed.js` — fallback API base URL. **Stamped.**
- `extensions/reviews-widget/shopify.extension.toml` — `uid` is per-app; the Shopify CLI
  manages it on `config link` / `deploy`. Leave it.
- Everything else (Shopify keys, Supabase keys, locale) — **env vars** in `.env` + Vercel.

## Decisions already made (don't re-litigate unless asked)
- **Supabase can be shared across all brands.** Every table is partitioned by
  `shop_domain`, so one Supabase project can back many stores. A fresh project per brand
  also works — your call per client. Fewer projects = closer to one-prompt setup.
- **Scopes default to `read_products`** (least privilege; the app only reads the catalog
  for the Generate page). Widen in `brand.config.json` only if a feature needs it.
- **Locale**: `india` (Hinglish) is the default and original behavior; `global` is plain
  English with Western names/cities. Set per brand in `brand.config.json`.

## ⚠️ Legal caution — surface this to the user, don't bury it
The **Generate** page and bulk CSVs can publish **fabricated** reviews as approved +
"verified". Displaying fake reviews as genuine is **illegal** in many markets (US FTC
fines per review; EU/UK bans). Use Generate to preview layout then delete those rows, or
rely on real CSV imports / storefront submissions. If a client wants fabricated reviews
shipped live, flag the risk explicitly before doing it.

## Useful facts
- Node 18.20+. Stack: Remix (Vite) + `@vercel/remix`, Polaris, `@shopify/shopify-app-remix`.
- Sessions live in Supabase (`shopify_sessions` table) — no Prisma, serverless-friendly.
- Storefront API: `GET/POST /api/reviews` (CORS open; POST lands as `pending`).
- `api/index.js` and `remix.config.js` are dead leftovers (excluded from deploy) — safe to delete.
