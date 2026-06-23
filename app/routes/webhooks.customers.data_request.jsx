// =============================================================
// GDPR compliance webhook: customers/data_request.
// Shopify requires this endpoint for every app. We only ever store
// review content (name/location/optional email) that is already shown
// publicly on the storefront, so there is nothing private to return.
// File location: /app/routes/webhooks.customers.data_request.jsx
// =============================================================
import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} for ${shop} — no private data held.`);
  return new Response();
};
