#!/usr/bin/env node
// Runs after the client and server Vite builds. Renders every route in
// src/site/routes.ts to static HTML in dist/site and writes sitemap.xml and
// llms.txt.
import { execFileSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const siteDir = resolve(repoRoot, "dist/site");
const serverDir = resolve(repoRoot, "dist/site-server");
const rootMarkup = '<div id="root"></div>';
const headMarker = "<!--app-head-->";

const { renderRoute, siteRoutes, canonicalUrl, planbanFeatureList, buildLlmsTxt } = await import(
  pathToFileURL(resolve(serverDir, "entry-server.js")).href
);

const template = await readFile(resolve(siteDir, "index.html"), "utf8");
if (!template.includes(rootMarkup) || !template.includes(headMarker)) {
  throw new Error("dist/site/index.html is missing the root element or head marker.");
}
if (!/<meta[^>]+name="planban-site-commit"/u.test(template)) {
  throw new Error("dist/site/index.html is missing the planban-site-commit release identity.");
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll("\"", "&quot;");
}

const rendered = [];
for (const route of siteRoutes) {
  const { html, head } = renderRoute(route);
  if (!html.includes("<h1")) throw new Error(`${route.path} rendered without an h1.`);
  const page = template
    .replace(headMarker, head)
    .replace(rootMarkup, `<div id="root" data-route="${escapeAttribute(route.id)}">${html}</div>`);
  const outputPath = resolve(siteDir, route.outputFile);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, page);
  rendered.push({ route, html });
}

const home = rendered.find(({ route }) => route.id === "home");
const missingFeatures = planbanFeatureList.filter(feature => !home?.html.includes(feature));
if (missingFeatures.length > 0) {
  throw new Error(`Structured-data featureList entries are not visible on the home page: ${missingFeatures.join("; ")}`);
}

function lastModified(files) {
  try {
    const date = execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (/^\d{4}-\d{2}-\d{2}$/u.test(date)) return date;
  } catch {
    // Fall through to the build date when git is unavailable.
  }
  return new Date().toISOString().slice(0, 10);
}

const sitemapEntries = siteRoutes
  .filter(route => route.indexable)
  .map(route => `  <url>\n    <loc>${canonicalUrl(route)}</loc>\n    <lastmod>${lastModified(route.sourceFiles)}</lastmod>\n  </url>`);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`;
await writeFile(resolve(siteDir, "sitemap.xml"), sitemap);

// llms.txt is generated from the docs registry. It is not listed in the
// sitemap, and _headers serves it with X-Robots-Tag: noindex.
const llmsTxt = buildLlmsTxt();
await writeFile(resolve(siteDir, "llms.txt"), llmsTxt);

await rm(serverDir, { recursive: true, force: true });

process.stdout.write(JSON.stringify({
  ok: true,
  pages: siteRoutes.map(route => `dist/site/${route.outputFile}`),
  sitemap: sitemapEntries.length,
  llmsTxtLinks: llmsTxt.split("\n").filter(line => line.startsWith("- [")).length,
}, null, 2) + "\n");
