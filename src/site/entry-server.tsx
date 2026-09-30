import React from "react";
import { renderToString } from "react-dom/server";
import { PlanbanPublicWebsite } from "./components/PlanbanPublicWebsite";
import { type SiteRoute, renderRouteHead } from "./routes";

export { canonicalUrl, renderRouteHead, siteRoutes } from "./routes";
export { planbanFeatureList } from "./site-facts";
export { buildLlmsTxt } from "./llms";

export function renderRoute(route: SiteRoute): { html: string; head: string } {
  const html = renderToString(<React.StrictMode>
      <PlanbanPublicWebsite route={route.id} />
    </React.StrictMode>);
  return { html, head: renderRouteHead(route) };
}
