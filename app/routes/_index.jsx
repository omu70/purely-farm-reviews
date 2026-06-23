// =============================================================
// Public landing route ("/").
// If Shopify opens it with ?shop=..., forward into the embedded app;
// otherwise show a tiny info page.
// File location: /app/routes/_index.jsx
// =============================================================
import { redirect } from "@remix-run/node";

export const loader = async ({ request }) => {
  const url = new URL(request.url);
  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }
  return null;
};

export default function Index() {
  return (
    <main
      style={{
        fontFamily: "system-ui, sans-serif",
        maxWidth: 560,
        margin: "0 auto",
        padding: "4rem 1.5rem",
        lineHeight: 1.6,
        color: "#1a1a1a",
      }}
    >
      <h1 style={{ fontSize: "1.6rem", marginBottom: ".5rem" }}>Reviews App</h1>
      <p>
        This is the backend for the Reviews app. Open it from your Shopify
        admin under <strong>Apps</strong> — it runs embedded inside Shopify.
      </p>
      <p style={{ color: "#6b7280", fontSize: ".9rem" }}>
        Storefront review data is served from <code>/api/reviews</code>.
      </p>
    </main>
  );
}
