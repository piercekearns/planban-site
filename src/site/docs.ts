// The ordered docs registry. One list drives the /docs/ routes, the docs
// index, each page's section navigation and previous/next links, and the
// generated /llms.txt, so a page cannot appear in one and be missing from
// another. Each entry imports only its page's front matter and headline
// ("?meta"); the full documents load through docs-content.ts.
import type { ContentMeta } from "./content/markdown";
import docsIndexMeta from "./content/docs/index.md?meta";

export type DocsSectionId = "get-started" | "use-planban" | "reference" | "maintain" | "changelog";

export interface DocsPage {
  /** Route id: "docs" for the index, "docs-<slug>" for pages. */
  id: "docs" | `docs-${string}`;
  meta: ContentMeta;
  /** Markdown source, relative to the repository root. */
  sourceFile: `src/site/content/docs/${string}.md`;
  /** Short name for the visible breadcrumb and BreadcrumbList. */
  breadcrumbName: string;
  /** Parent page between Docs and this page in the breadcrumb, if any. */
  parentId?: DocsPage["id"];
}

export interface DocsSection {
  id: DocsSectionId;
  title: string;
  pages: readonly DocsPage[];
}

export const docsIndexPage: DocsPage = {
  id: "docs",
  meta: docsIndexMeta,
  sourceFile: "src/site/content/docs/index.md",
  breadcrumbName: "Docs",
};

export const docsSections: readonly DocsSection[] = [
  { id: "get-started", title: "Get started", pages: [] },
  { id: "use-planban", title: "Use Planban", pages: [] },
  { id: "reference", title: "Reference", pages: [] },
  { id: "maintain", title: "Maintain", pages: [] },
  { id: "changelog", title: "Changelog", pages: [] },
];

/** Every docs page in reading order, starting with the index. */
export const docsPages: readonly DocsPage[] = [docsIndexPage, ...docsSections.flatMap(section => section.pages)];

export function findDocsPage(id: string): DocsPage | undefined {
  return docsPages.find(page => page.id === id);
}

export function docsSectionOf(id: string): DocsSection | undefined {
  return docsSections.find(section => section.pages.some(page => page.id === id));
}

/** Previous and next pages in reading order, for the links at the foot of each page. */
export function docsNeighbours(id: string): { previous: DocsPage | undefined; next: DocsPage | undefined } {
  const index = docsPages.findIndex(page => page.id === id);
  if (index < 0) return { previous: undefined, next: undefined };
  return { previous: docsPages[index - 1], next: docsPages[index + 1] };
}

/** Breadcrumb trail below Home: Docs, any parent page, then the page itself. */
export function docsBreadcrumbs(page: DocsPage): Array<{ name: string; path: string }> {
  const trail: Array<{ name: string; path: string }> = [];
  for (let current: DocsPage | undefined = page; current; current = current.parentId ? findDocsPage(current.parentId) : undefined) {
    trail.unshift({ name: current.breadcrumbName, path: current.meta.frontMatter.path });
  }
  if (page.id !== docsIndexPage.id) trail.unshift({ name: docsIndexPage.breadcrumbName, path: docsIndexPage.meta.frontMatter.path });
  return trail;
}

/** Links listed under "Optional" in /llms.txt, after the docs sections. */
export const llmsOptionalLinks: ReadonlyArray<{ path: string } | { url: string; title: string; note: string }> = [
  { path: "/claude-code/" },
  { path: "/codex/" },
  { path: "/what-is-an-agent-native-kanban-board/" },
  { url: "https://github.com/piercekearns/planban", title: "Planban on GitHub", note: "source, README and issues" },
  { url: "https://github.com/piercekearns/planban/releases", title: "Earlier releases", note: "GitHub release notes for v1.0.0 to v1.1.5" },
];
