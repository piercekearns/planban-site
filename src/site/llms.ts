// /llms.txt (https://llmstxt.org): an H1, a blockquote summary, a short note,
// then H2 sections of links. Generated from the docs registry at build time
// by scripts/prerender-site.mjs, so it always lists every docs page.
import { docsIndexPage, docsSections, llmsOptionalLinks } from "./docs";
import { siteRoutes } from "./routes";
import { planbanCanonicalDescription, planbanRepositoryUrl, planbanVersion, siteOrigin } from "./site-facts";

function linkLine(title: string, url: string, note: string): string {
  return `- [${title}](${url}): ${note}`;
}

export function buildLlmsTxt(): string {
  const lines = [
    "# Planban",
    "",
    `> ${planbanCanonicalDescription}`,
    "",
    `Current version: ${planbanVersion}. MIT licence. Planban is not published to npm; install it through the Codex or Claude Code plugin marketplace from ${planbanRepositoryUrl}. Board state stays on your machine under ~/.planban.`,
  ];
  for (const section of docsSections) {
    const pages = section.id === "get-started" ? [docsIndexPage, ...section.pages] : section.pages;
    if (pages.length === 0) continue;
    lines.push("", `## ${section.title}`, "");
    for (const page of pages) {
      lines.push(linkLine(page.meta.headline, `${siteOrigin}${page.meta.frontMatter.path}`, page.meta.frontMatter.description));
    }
  }
  lines.push("", "## Optional", "");
  for (const link of llmsOptionalLinks) {
    if ("url" in link) {
      lines.push(linkLine(link.title, link.url, link.note));
      continue;
    }
    const route = siteRoutes.find(candidate => candidate.path === link.path);
    if (!route?.article) throw new Error(`llms.txt optional link ${link.path} is not a content page.`);
    lines.push(linkLine(route.article.meta.headline, `${siteOrigin}${route.path}`, route.description));
  }
  return `${lines.join("\n")}\n`;
}
