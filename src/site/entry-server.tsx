import React from "react";
import { renderToString } from "react-dom/server";
import { PlanbanPublicWebsite } from "./components/PlanbanPublicWebsite";
import { type SiteRoute, renderRouteHead } from "./routes";
import type { ContentDocument } from "./content/markdown";
import { registerDocsDocument } from "./docs-content";

// The prerenderer renders every docs page, so it loads every docs document.
const docsDocuments = import.meta.glob<ContentDocument>("./content/docs/**/*.md", { eager: true, import: "default" });
for (const [key, document] of Object.entries(docsDocuments)) registerDocsDocument(key, document);

export { canonicalUrl, renderRouteHead, siteRoutes } from "./routes";
export { planbanFeatureList } from "./site-facts";
export { buildLlmsTxt } from "./llms";

export function renderRoute(route: SiteRoute): { html: string; head: string } {
  const html = renderToString(<React.StrictMode>
      <PlanbanPublicWebsite route={route.id} />
    </React.StrictMode>);
  return { html, head: renderRouteHead(route) };
}
