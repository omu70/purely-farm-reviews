// =============================================================
// Shopify app singleton — the heart of auth, webhooks & sessions.
// File location: /app/shopify.server.js
//
// Every route imports `authenticate` from here. This file was
// missing, which is why the app could not build.
// =============================================================
import "@shopify/shopify-app-remix/adapters/node";
import {
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { SupabaseSessionStorage } from "./utils/session-storage.server";
import { supabaseAdmin } from "./utils/supabase.server";

// ---- Free-tier rule: first 50 installs = early_adopter_free ----
async function registerShop(shopDomain) {
  try {
    const { data: existing } = await supabaseAdmin
      .from("shops")
      .select("shop_domain")
      .eq("shop_domain", shopDomain)
      .maybeSingle();
    if (existing) return; // already recorded

    const { count } = await supabaseAdmin
      .from("shops")
      .select("shop_domain", { count: "exact", head: true });

    const planType = (count ?? 0) < 50 ? "early_adopter_free" : "standard";
    await supabaseAdmin
      .from("shops")
      .insert({ shop_domain: shopDomain, plan_type: planType });

    console.log(`[registerShop] ${shopDomain} → ${planType} (#${(count ?? 0) + 1})`);
  } catch (e) {
    console.error("[registerShop]", e);
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  // apiVersion omitted → defaults to the latest version the library supports.
  scopes: process.env.SCOPES?.split(",") ?? ["write_products", "read_products"],
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new SupabaseSessionStorage(),
  distribution: AppDistribution.AppStore,
  future: {
    // Token-exchange based auth — recommended for embedded apps on serverless.
    unstable_newEmbeddedAuthStrategy: true,
  },
  hooks: {
    afterAuth: async ({ session }) => {
      await registerShop(session.shop);
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
