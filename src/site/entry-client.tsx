import React from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { PlanbanPublicWebsite } from "./components/PlanbanPublicWebsite";
import { findSiteRoute } from "./routes";
import "./styles.css";
import "./site-typography.css";

const container = document.getElementById("root") as HTMLElement;
const route = findSiteRoute(container.dataset.route)?.id ?? "home";
const app = <React.StrictMode>
    <PlanbanPublicWebsite route={route} />
  </React.StrictMode>;

// Built pages are prerendered and hydrate; the Vite dev server serves the bare
// template, which renders on the client instead.
if (container.hasChildNodes()) hydrateRoot(container, app);
else createRoot(container).render(app);
