// =============================================================
// Authenticated admin layout — wraps every /app/* page with the
// Polaris AppProvider + the embedded-app nav menu. This was the
// missing parent layout for app._index / app.generate / app.import.
// File location: /app/routes/app.jsx
// =============================================================
import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">Reviews</Link>
        <Link to="/app/generate">Generate</Link>
        <Link to="/app/import">Import CSV</Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs the app's error/headers boundaries for correct
// behaviour inside the admin iframe.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => boundary.headers(headersArgs);
