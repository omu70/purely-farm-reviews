// =============================================================
// Vite config — Remix (Vite plugin) + official Vercel preset.
// Replaces the old remix.config.js + @remix-run/vercel adapter.
// =============================================================
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import { vercelPreset } from "@vercel/remix/vite";

// Allow `shopify app dev` to HMR over the Cloudflare tunnel it creates.
const host = process.env.SHOPIFY_APP_URL
  ? new URL(process.env.SHOPIFY_APP_URL).host
  : undefined;

export default defineConfig({
  server: {
    port: Number(process.env.PORT || 3000),
    // Permit the Shopify CLI tunnel host during local development.
    allowedHosts: true,
    hmr: host
      ? { protocol: "wss", host, port: 443, clientPort: 443 }
      : undefined,
  },
  plugins: [
    remix({
      // The Vercel preset wires up Vercel Functions output automatically.
      presets: [vercelPreset()],
      ignoredRouteFiles: ["**/.*"],
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
      },
    }),
  ],
  // Shopify embedded apps must not inline assets (CSP-friendly).
  build: { assetsInlineLimit: 0 },
});
