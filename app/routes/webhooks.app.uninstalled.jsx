// =============================================================
// Webhook: app/uninstalled — clean up this shop's sessions so a
// future reinstall starts fresh. (Review data is intentionally kept.)
// File location: /app/routes/webhooks.app.uninstalled.jsx
// =============================================================
import { authenticate } from "../shopify.server";
import { supabaseAdmin } from "../utils/supabase.server";

export const action = async ({ request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`[webhook] ${topic} for ${shop}`);

  await supabaseAdmin.from("shopify_sessions").delete().eq("shop", shop);

  return new Response();
};
