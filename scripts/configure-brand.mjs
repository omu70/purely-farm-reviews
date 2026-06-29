#!/usr/bin/env node
// =============================================================
// configure-brand.mjs — one-shot per-brand setup for the Reviews app.
//
// Reads brand.config.json (the single source of truth) and stamps every
// brand-specific value into the files that can't read runtime env:
//   • shopify.app.toml      → client_id, name, handle, app URL,
//                             redirect URLs, webhook URLs, scopes
//   • the 4 widget .liquid   → default API base URL
//   • app-embed.js           → fallback API base URL
//   • .env                   → generated (non-secret values filled in)
//   • REVIEW_LOCALE          → which name/location pool the generator uses
//
// It is ZERO-dependency (Node 18+ built-ins only) and idempotent:
// running it twice with the same config changes nothing.
//
// Usage:
//   node scripts/configure-brand.mjs                 # uses ./brand.config.json
//   node scripts/configure-brand.mjs path/to/cfg.json
//   node scripts/configure-brand.mjs --check         # report only, write nothing
// =============================================================
import { readFileSync, writeFileSync, existsSync, renameSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// ---- args ----
const args = process.argv.slice(2);
const CHECK_ONLY = args.includes("--check");
const cfgArg = args.find((a) => !a.startsWith("--"));
const CONFIG_PATH = resolve(ROOT, cfgArg || "brand.config.json");

// ---- tiny logger ----
const C = { g: "\x1b[32m", y: "\x1b[33m", r: "\x1b[31m", b: "\x1b[36m", d: "\x1b[2m", x: "\x1b[0m" };
const ok = (m) => console.log(`${C.g}✓${C.x} ${m}`);
const info = (m) => console.log(`${C.b}•${C.x} ${m}`);
const warn = (m) => console.log(`${C.y}!${C.x} ${m}`);
const die = (m) => { console.error(`${C.r}✗ ${m}${C.x}`); process.exit(1); };

// ---- helpers ----
const normDomain = (s) =>
  String(s || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/\/+$/, "")
    .toLowerCase();

function readFile(p) { return readFileSync(p, "utf8"); }
function writeFile(p, c) { if (!CHECK_ONLY) writeFileSync(p, c); }

// Replace and report whether anything changed.
function applyReplacements(label, relPath, replacers) {
  const abs = join(ROOT, relPath);
  if (!existsSync(abs)) { warn(`skip ${relPath} (not found)`); return 0; }
  let text = readFile(abs);
  const before = text;
  for (const [from, to] of replacers) {
    if (from instanceof RegExp) text = text.replace(from, to);
    else if (from && from !== to) text = text.split(from).join(to);
  }
  if (text !== before) {
    writeFile(abs, text);
    ok(`${label}  ${C.d}(${relPath})${C.x}`);
    return 1;
  }
  info(`${label} already up to date  ${C.d}(${relPath})${C.x}`);
  return 0;
}

// =============================================================
// 1) Load + validate config
// =============================================================
if (!existsSync(CONFIG_PATH)) die(`Config not found: ${CONFIG_PATH}`);
let cfg;
try { cfg = JSON.parse(readFile(CONFIG_PATH)); }
catch (e) { die(`brand.config.json is not valid JSON: ${e.message}`); }

const brand = cfg.brand || {};
const deploy = cfg.deploy || {};
const locale = cfg.reviewsLocale || {};

const newDomain = normDomain(deploy.vercelDomain);
const clientId = String(deploy.shopifyClientId || "").trim();
const scopes = String(deploy.scopes || "read_products").trim();
const appName = String(brand.appName || "Reviews").trim();
const appHandle = String(brand.appHandle || "").trim();
const localePreset = String(locale.preset || "india").trim();

const PLACEHOLDER = /YOUR[-_]?APP|YOUR[-_]?DOMAIN|example\.com/i;

const problems = [];
if (!newDomain || PLACEHOLDER.test(newDomain) || !/\.[a-z]{2,}$/.test(newDomain))
  problems.push(`deploy.vercelDomain looks unset/placeholder: "${deploy.vercelDomain}"`);
if (!appHandle || PLACEHOLDER.test(appHandle))
  problems.push(`brand.appHandle looks unset/placeholder: "${brand.appHandle}"`);
if (!clientId || PLACEHOLDER.test(clientId))
  warn(`deploy.shopifyClientId is empty/placeholder — run \`shopify app config link\` to fill it, or paste the Client ID into brand.config.json.`);
if (!["india", "global"].includes(localePreset))
  problems.push(`reviewsLocale.preset must be "india" or "global" (got "${localePreset}")`);

if (problems.length) {
  console.log("");
  problems.forEach((p) => warn(p));
  die(`Fix brand.config.json and re-run. Nothing was written.`);
}

console.log(`\n${C.b}Configuring brand:${C.x} ${appName}  →  https://${newDomain}\n`);

// Discover the domain currently baked into the toml so we can swap it out
// no matter what it is. Always also swap the factory + placeholder domains.
const tomlAbs = join(ROOT, "shopify.app.toml");
let detectedOld = "";
if (existsSync(tomlAbs)) {
  const m = readFile(tomlAbs).match(/application_url\s*=\s*"https?:\/\/([^"\/]+)/i);
  if (m) detectedOld = normDomain(m[1]);
}
const oldDomains = [...new Set([detectedOld, "review-lovely-lady.vercel.app", "your-app.vercel.app"])]
  .filter((d) => d && d !== newDomain);

if (detectedOld && detectedOld !== newDomain) info(`Replacing current domain "${detectedOld}" everywhere.`);
const domainReplacers = oldDomains.map((d) => [d, newDomain]);

let changes = 0;

// =============================================================
// 2) shopify.app.toml — identifiers + every URL + scopes
// =============================================================
changes += applyReplacements("shopify.app.toml", "shopify.app.toml", [
  ...domainReplacers,
  [/^(client_id\s*=\s*)"[^"]*"/m, clientId ? `$1"${clientId}"` : "$&"],
  [/^(name\s*=\s*)"[^"]*"/m, `$1"${appName.replace(/"/g, "'")}"`],
  [/^(handle\s*=\s*)"[^"]*"/m, `$1"${appHandle}"`],
  [/^(\s*scopes\s*=\s*)"[^"]*"/m, `$1"${scopes}"`],
]);

// =============================================================
// 3) Theme App Extension — default API base URL in every block + the JS fallback
// =============================================================
const widgetFiles = [
  "extensions/reviews-widget/blocks/app-embed.liquid",
  "extensions/reviews-widget/blocks/star-badge.liquid",
  "extensions/reviews-widget/blocks/review-widget.liquid",
  "extensions/reviews-widget/blocks/store-reviews.liquid",
  "extensions/reviews-widget/assets/app-embed.js",
];
for (const f of widgetFiles) changes += applyReplacements(f.split("/").pop(), f, domainReplacers);

// =============================================================
// 4) .env — create if missing (never clobber existing secrets)
// =============================================================
const envAbs = join(ROOT, ".env");
const envBody = [
  "# Generated by scripts/configure-brand.mjs — fill the __SET_ME__ secrets.",
  "# These same 7 vars must also be added in Vercel → Project → Settings → Environment Variables.",
  "",
  "# --- Shopify (Partner Dashboard → your app → Client credentials) ---",
  `SHOPIFY_API_KEY=${clientId || "__SET_ME__"}   # = your app's Client ID`,
  "SHOPIFY_API_SECRET=__SET_ME__                 # your app's Client secret",
  `SHOPIFY_APP_URL=https://${newDomain}`,
  `SCOPES=${scopes}`,
  "",
  "# --- Supabase (Settings → API). Can be a shared project across brands;",
  "#     every row is partitioned by shop_domain. ---",
  "SUPABASE_URL=__SET_ME__",
  "SUPABASE_SERVICE_ROLE_KEY=__SET_ME__          # server-only secret — never expose",
  "",
  "# --- Review generator locale: 'india' | 'global' ---",
  `REVIEW_LOCALE=${localePreset}`,
  "",
  "NODE_ENV=production",
  "",
].join("\n");

if (CHECK_ONLY) {
  info(`.env would be ${existsSync(envAbs) ? "left as-is (already exists)" : "created"}`);
} else if (!existsSync(envAbs)) {
  writeFileSync(envAbs, envBody);
  ok(`.env created — now fill the __SET_ME__ values  ${C.d}(.env is gitignored)${C.x}`);
  changes++;
} else {
  warn(`.env already exists — left untouched. Ensure it has:`);
  console.log(`${C.d}    SHOPIFY_APP_URL=https://${newDomain}\n    SCOPES=${scopes}\n    REVIEW_LOCALE=${localePreset}${C.x}`);
}

// =============================================================
// 5) Warn about stale local Shopify link-state in a duplicated folder
// =============================================================
const dotShopify = join(ROOT, ".shopify");
if (existsSync(dotShopify) && detectedOld && detectedOld !== newDomain) {
  if (CHECK_ONLY) {
    warn(`.shopify/ holds the previous app's link-state — it should be reset for this brand.`);
  } else {
    const bak = join(ROOT, ".shopify.bak");
    try {
      renameSync(dotShopify, bak);
      ok(`.shopify/ moved to .shopify.bak/ — run \`shopify app config link\` to link THIS app.`);
    } catch {
      warn(`Could not move .shopify/. Delete it manually before \`shopify app config link\`.`);
    }
  }
}

// marker (handy for humans + future runs)
if (!CHECK_ONLY) {
  writeFileSync(
    join(ROOT, ".brand-applied.json"),
    JSON.stringify({ appName, appHandle, domain: newDomain, localePreset, appliedAt: new Date().toISOString() }, null, 2) + "\n"
  );
}

// =============================================================
// 6) Summary + next steps
// =============================================================
console.log("");
if (CHECK_ONLY) { info("--check: no files were written."); process.exit(0); }
ok(`Brand stamped (${changes} file group${changes === 1 ? "" : "s"} updated).`);
console.log(`
${C.b}Next — go live:${C.x}
  1. Fill secrets in ${C.d}.env${C.x}  (SHOPIFY_API_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
  2. ${C.d}npm install${C.x}
  3. Run ${C.d}supabase/schema_full.sql${C.x} once in the Supabase SQL editor
  4. Push to GitHub → import in Vercel → add the SAME env vars → deploy
  5. ${C.d}npx shopify app config link${C.x}  then  ${C.d}npx shopify app deploy${C.x}
  6. Install on the store, enable "Reviews — Auto Display" in the theme editor
  (Full details in GO_LIVE.md)
`);
