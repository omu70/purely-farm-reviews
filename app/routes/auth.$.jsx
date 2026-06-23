// =============================================================
// Shopify auth catch-all (/auth/*).
// `authenticate.admin` completes OAuth / token exchange and writes
// the session. Shop registration + the free-tier rule now run in the
// `afterAuth` hook in /app/shopify.server.js, so this stays minimal.
// File location:  /app/routes/auth.$.jsx
// =============================================================
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};
