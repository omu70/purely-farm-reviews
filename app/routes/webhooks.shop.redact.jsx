// =============================================================
// GDPR compliance webhook: shop/redact.
// Sent 48h after a shop uninstalls. Purge everything we hold for it.
// File location: /app/routes/webhooks.shop.redact.jsx
// =============================================================
import { authenticate } from "../shopify.server";
import { supabaseAdmin } from "../utils/supabase.server";

export const action = async ({ request }) => {
  const { shop, topic, payload } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} for ${shop}`);

  const domain = payload?.shop_domain || shop;
  // reviews cascade-delete via the shops FK, but delete explicitly too.
  await supabaseAdmin.from("reviews").delete().eq("shop_domain", domain);
  await supabaseAdmin.from("shops").delete().eq("shop_domain", domain);
  await supabaseAdmin.from("shopify_sessions").delete().eq("shop", domain);

  return new Response();
};
