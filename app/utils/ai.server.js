// =============================================================
// Review Generator — TEMPLATE-BASED (free, no API needed)
// File: /app/utils/ai.server.js
//
// Generates varied, realistic-sounding reviews using template
// composition. No external API calls. Zero cost.
//
// Locale (name/location/phrasing pools) is chosen by the REVIEW_LOCALE
// env var ("india" | "global"), set per-brand by configure-brand.mjs.
// See /app/utils/review-locale.js. Defaults to "india".
//
// ⚠️ Legal note: publishing fabricated reviews as genuine is illegal in
// many markets (US FTC, EU, UK). Use this to preview layout, then remove
// the rows — or rely on real CSV imports / storefront submissions.
// =============================================================
import { getLocale } from "./review-locale";

// Resolve the active locale pack at call time (so REVIEW_LOCALE is honoured
// without a rebuild, and tests can swap it per call).
const L = () => getLocale(process.env.REVIEW_LOCALE);

// ---------- Helpers ----------
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const initials = (name) => name.split(/\s+/).map((s) => s[0]).join("").slice(0, 2).toUpperCase();

function pickRating() {
  const r = Math.random();
  if (r < 0.7) return 5;
  if (r < 0.9) return 4;
  return 3;
}

function templateFor(loc, rating, productTitle) {
  const pool = rating === 5 ? loc.t5 : rating === 4 ? loc.t4 : loc.t3;
  return pick(pool)(productTitle);
}

// ---------- Public: per-product ----------
export async function generateSampleReviews({ productTitle, productDescription, count = 10, style = "hinglish" }) {
  const loc = L();
  const out = [];
  const usedNames = new Set();
  for (let i = 0; i < count; i++) {
    let name; do { name = pick(loc.names); } while (usedNames.has(name) && usedNames.size < loc.names.length);
    usedNames.add(name);
    const rating = pickRating();
    out.push({
      author_name: name,
      author_location: pick(loc.locations),
      rating,
      title: pick(loc.titles[rating]),
      content: templateFor(loc, rating, productTitle || "this product"),
    });
  }
  return out;
}

// ---------- Public: multi-product ----------
export async function generateForProducts({ shopDomain, products, countPerProduct = 10, style = "hinglish" }) {
  const loc = L();
  const records = [];
  for (const p of products) {
    const reviews = await generateSampleReviews({
      productTitle: p.title,
      productDescription: p.description,
      count: countPerProduct,
      style,
    });
    reviews.forEach((r) => {
      records.push({
        shop_domain: shopDomain,
        product_id: String(p.id),
        product_handle: p.handle || null,
        author_name: r.author_name,
        author_initials: initials(r.author_name),
        author_location: r.author_location,
        author_country: loc.country,
        is_verified: true,
        rating: r.rating,
        title: r.title || null,
        content: r.content,
        image_urls: [],
        status: "approved",
        source: "ai_sample",
        is_featured: false,
      });
    });
  }
  return records;
}
