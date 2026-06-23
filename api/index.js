// =============================================================
// DEPRECATED — do not use.
//
// This app no longer deploys through a classic Vercel adapter.
// It now builds with the Remix **Vite** plugin + the official
// `@vercel/remix` preset (see /vite.config.js). Vercel renders the
// whole app (including /api/reviews) via Vercel Functions automatically.
//
// Deletion of this file was not permitted in the session, so it is:
//   1) neutralised (no broken `../build/index.js` import), and
//   2) excluded from the Vercel deploy via /.vercelignore
//
// Safe to delete manually whenever you like.
// =============================================================
export default function handler(_req, res) {
  res.statusCode = 410;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: "Deprecated. The public API is /api/reviews." }));
}
