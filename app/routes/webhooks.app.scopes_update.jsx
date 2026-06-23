// =============================================================
// Webhook: app/scopes_update — fired when granted access scopes change.
// File location: /app/routes/webhooks.app.scopes_update.jsx
// =============================================================
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} for ${shop}`, payload?.current);
  return new Response();
};
