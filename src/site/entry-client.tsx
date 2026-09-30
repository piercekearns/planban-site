import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { PlanbanPublicWebsite } from "./components/PlanbanPublicWebsite";
import { findSiteRoute } from "./routes";
import type { ContentDocument } from "./content/markdown";
import { docsGlobKey, registerDocsDocument } from "./docs-content";
import "./styles.css";
import "./site-typography.css";

// Each docs document is a separate chunk, fetched only on its own page.
const docsDocumentLoaders = import.meta.glob<ContentDocument>("./content/docs/**/*.md", { import: "default" });

async function start() {
  const container = document.getElementById("root") as HTMLElement;
  const siteRoute = findSiteRoute(container.dataset.route);
  const docsPage = siteRoute?.article?.docsPage;
  if (docsPage) {
    const key = docsGlobKey(docsPage.sourceFile);
    const load = docsDocumentLoaders[key];
    if (!load) throw new Error(`No docs document chunk for ${docsPage.sourceFile}.`);
    registerDocsDocument(key, await load());
  }
  const app = <React.StrictMode>
      <PlanbanPublicWebsite route={siteRoute?.id ?? "home"} />
    </React.StrictMode>;

  // Built pages are prerendered and hydrate; the Vite dev server serves the
  // bare template, which renders on the client instead.
  if (container.hasChildNodes()) hydrateRoot(container, app);
  else createRoot(container).render(app);
}

void start();
