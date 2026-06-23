// =============================================================
// GDPR compliance webhook: customers/redact.
// Delete any reviews tied to the customer's email for this shop.
// File location: /app/routes/webhooks.customers.redact.jsx
// =============================================================
import { authenticate } from "../shopify.server";
import { supabaseAdmin } from "../utils/supabase.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} for ${shop}`);

  const email = payload?.customer?.email;
  if (email) {
    await supabaseAdmin
      .from("reviews")
      .delete()
      .eq("shop_domain", shop)
      .eq("author_email", email);
  }

  return new Response();
};
