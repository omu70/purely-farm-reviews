// =============================================================
// Supabase-backed Shopify session storage.
// File location: /app/utils/session-storage.server.js
//
// Why custom (instead of the Prisma adapter the old package.json
// referenced)? This talks to Supabase over HTTPS (PostgREST), so it
// is completely stateless — perfect for Vercel's serverless functions,
// with no Postgres connection-pool limits to worry about. It reuses the
// same SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY you already configure.
//
// Requires a `shopify_sessions` table (see /supabase/schema_full.sql).
// =============================================================
import { Session } from "@shopify/shopify-api";
import { supabaseAdmin } from "./supabase.server";

const TABLE = "shopify_sessions";

export class SupabaseSessionStorage {
  async storeSession(session) {
    const row = {
      id: session.id,
      shop: session.shop,
      // store the full session (incl. online-token user fields)
      payload: session.toPropertyArray(true),
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabaseAdmin
      .from(TABLE)
      .upsert(row, { onConflict: "id" });
    if (error) {
      console.error("[session.store]", error);
      return false;
    }
    return true;
  }

  async loadSession(id) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("payload")
      .eq("id", id)
      .maybeSingle();
    if (error) {
      console.error("[session.load]", error);
      return undefined;
    }
    if (!data?.payload) return undefined;
    return Session.fromPropertyArray(data.payload, true);
  }

  async deleteSession(id) {
    const { error } = await supabaseAdmin.from(TABLE).delete().eq("id", id);
    if (error) {
      console.error("[session.delete]", error);
      return false;
    }
    return true;
  }

  async deleteSessions(ids) {
    const { error } = await supabaseAdmin.from(TABLE).delete().in("id", ids);
    if (error) {
      console.error("[session.deleteMany]", error);
      return false;
    }
    return true;
  }

  async findSessionsByShop(shop) {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select("payload")
      .eq("shop", shop);
    if (error) {
      console.error("[session.findByShop]", error);
      return [];
    }
    return (data || [])
      .filter((r) => r.payload)
      .map((r) => Session.fromPropertyArray(r.payload, true));
  }
}
