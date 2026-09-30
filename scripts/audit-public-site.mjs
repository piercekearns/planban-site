#!/usr/bin/env node
import { readdir, readFile, stat } from "node:fs/promises";
import { basename, join, relative, resolve, sep } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const auditRoots = process.argv.slice(2).map((path) => resolve(path));
const roots = auditRoots.length > 0
  ? auditRoots
  : [
    resolve(repoRoot, "src/site"),
    resolve(repoRoot, "functions"),
    resolve(repoRoot, "dist/site"),
  ];

const requiredFiles = [
  "src/site/index.html",
  "src/site/entry-client.tsx",
  "src/site/entry-server.tsx",
  "src/site/routes.ts",
  "src/site/components/PlanbanPublicWebsite.tsx",
  "functions/api/subscribe.ts",
  "dist/site/index.html",
  "dist/site/privacy/index.html",
  "dist/site/claude-code/index.html",
  "dist/site/codex/index.html",
  "dist/site/what-is-an-agent-native-kanban-board/index.html",
  "dist/site/docs/index.html",
  "dist/site/docs/install-codex/index.html",
  "dist/site/docs/install-claude-code/index.html",
  "dist/site/docs/cli/index.html",
  "dist/site/docs/mcp-tools/index.html",
  "dist/site/docs/changelog/index.html",
  "dist/site/docs/changelog/v1-1-6/index.html",
  "dist/site/404.html",
  "dist/site/robots.txt",
  "dist/site/sitemap.xml",
  "dist/site/llms.txt",
  "dist/site/_headers",
];

const forbiddenSegments = new Set([
  ".git",
  ".planban",
  ".codex",
  ".claude",
  ".cursor",
  "node_modules",
  "tmp",
  "coverage",
  "test-results",
]);

const forbiddenFileNames = new Set([
  ".env",
  ".env.local",
  ".env.production",
  "AGENTS.md",
  "CLAUDE.md",
  "CLOUD.md",
  "cloud.md",
]);

const forbiddenContent = [
  { name: "GitHub token", pattern: /gho_[A-Za-z0-9_]+/u },
  { name: "OpenAI-style secret key", pattern: /\bsk-(?:proj|live|test|admin|svcacct)-[A-Za-z0-9_-]{16,}/u },
  { name: "Planban launch token", pattern: /planban:[a-z0-9-]+:[0-9a-f-]{36}/iu },
  { name: "private user home path", pattern: /\/Users\/piercekearns/u },
  { name: "private Planban home path", pattern: /\/Users\/piercekearns\/\.planban/u },
  { name: "private Codex attachment path", pattern: /\/\.codex\/attachments/u },
  { name: "private local temp screenshot", pattern: /tmp-planban-board-mcp-verify/u },
  { name: "private feedback transcript", pattern: /\bOliver Griffiths\b|\bZoo-Lane\b|\bclawchestra\b/iu },
];

const textExtensions = new Set([
  ".css",
  ".html",
  ".js",
  ".json",
  ".md",
  ".mjs",
  ".svg",
  ".ts",
  ".tsx",
  ".txt",
  ".xml",
  ".yml",
  ".yaml",
]);

const textFileNames = new Set(["_headers", "_redirects"]);

function extension(path) {
  const index = path.lastIndexOf(".");
  return index >= 0 ? path.slice(index) : "";
}

async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

function displayPath(path) {
  const rel = relative(repoRoot, path);
  return rel.startsWith("..") ? path : rel;
}

async function walk(dir, results = []) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    const rel = displayPath(path);
    const segments = rel.split(sep);
    if (segments.some((segment) => forbiddenSegments.has(segment))) {
      results.push({ type: "forbidden-path", path: rel });
      continue;
    }
    if (forbiddenFileNames.has(entry.name)) {
      results.push({ type: "forbidden-file", path: rel });
      continue;
    }
    if (entry.isDirectory()) await walk(path, results);
    else results.push({ type: "file", path: rel, absolutePath: path });
  }
  return results;
}

const findings = [];

for (const file of requiredFiles) {
  if (!(await pathExists(resolve(repoRoot, file)))) {
    findings.push({ type: "missing-required-file", path: file });
  }
}

for (const root of roots) {
  if (!(await pathExists(root))) {
    findings.push({ type: "missing-audit-root", path: displayPath(root) });
    continue;
  }
  const entries = await walk(root);
  for (const entry of entries) {
    if (entry.type !== "file") {
      findings.push(entry);
      continue;
    }
    if (!textExtensions.has(extension(entry.path)) && !textFileNames.has(basename(entry.path))) continue;
    const text = await readFile(entry.absolutePath, "utf8");
    for (const rule of forbiddenContent) {
      if (rule.pattern.test(text)) {
        findings.push({ type: "forbidden-content", path: entry.path, rule: rule.name });
      }
    }
  }
}

// Built-output checks: every sitemap URL has a page, every internal link and
// #anchor resolves, and llms.txt lists exactly the indexable docs pages.
const siteDir = resolve(repoRoot, "dist/site");
const siteOrigin = "https://planban.ai";
let checkedLinks = 0;

function outputFileForPath(pathname) {
  const clean = decodeURIComponent(pathname);
  if (clean.endsWith("/")) return join(siteDir, clean, "index.html");
  return join(siteDir, clean);
}

if (await pathExists(join(siteDir, "sitemap.xml"))) {
  const sitemap = await readFile(join(siteDir, "sitemap.xml"), "utf8");
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/gu)].map((match) => new URL(match[1]).pathname);
  for (const path of sitemapPaths) {
    if (!(await pathExists(outputFileForPath(path)))) findings.push({ type: "sitemap-url-without-page", path });
  }

  const htmlFiles = (await walk(siteDir))
    .filter((entry) => entry.type === "file" && entry.path.endsWith(".html"))
    .map((entry) => entry.absolutePath);
  const idsByFile = new Map();
  async function idsIn(file) {
    if (!idsByFile.has(file)) {
      const html = await readFile(file, "utf8");
      idsByFile.set(file, new Set([...html.matchAll(/\sid="([^"]+)"/gu)].map((match) => match[1])));
    }
    return idsByFile.get(file);
  }
  for (const file of htmlFiles) {
    const html = await readFile(file, "utf8");
    // Every page carries the Umami tracker exactly once, limited to planban.ai.
    const umamiTags = html.match(/<script[^>]+src="https:\/\/cloud\.umami\.is\/script\.js"[^>]*>/gu) ?? [];
    if (umamiTags.length !== 1 || !umamiTags[0].includes('data-domains="planban.ai"')) {
      findings.push({ type: "umami-script", path: displayPath(file), count: umamiTags.length });
    }
    for (const match of html.matchAll(/\shref="([^"]+)"/gu)) {
      const href = match[1].replaceAll("&amp;", "&");
      let target;
      if (href.startsWith("#")) target = new URL(href, `${siteOrigin}/${relative(siteDir, file)}`);
      else if (href.startsWith("/") && !href.startsWith("//")) target = new URL(href, siteOrigin);
      else if (href.startsWith(`${siteOrigin}/`)) target = new URL(href);
      else continue;
      checkedLinks += 1;
      const targetFile = href.startsWith("#") ? file : outputFileForPath(target.pathname);
      if (!(await pathExists(targetFile))) {
        findings.push({ type: "broken-internal-link", path: displayPath(file), href });
        continue;
      }
      const anchor = decodeURIComponent(target.hash.slice(1));
      if (anchor && targetFile.endsWith(".html") && !(await idsIn(targetFile)).has(anchor)) {
        findings.push({ type: "missing-anchor", path: displayPath(file), href });
      }
    }
  }

  const llmsPath = join(siteDir, "llms.txt");
  if (await pathExists(llmsPath)) {
    const llms = await readFile(llmsPath, "utf8");
    if (!/^# .+\n\n> .+/u.test(llms)) findings.push({ type: "llms-txt-format", path: "dist/site/llms.txt", rule: "H1 then blockquote summary" });
    const llmsPaths = new Set([...llms.matchAll(/\]\((https:\/\/planban\.ai[^)\s]*)\)/gu)].map((match) => new URL(match[1]).pathname));
    const indexable = new Set(sitemapPaths);
    for (const path of llmsPaths) {
      if (!indexable.has(path)) findings.push({ type: "llms-txt-link-not-indexable", path });
    }
    for (const path of sitemapPaths.filter((candidate) => candidate.startsWith("/docs/"))) {
      if (!llmsPaths.has(path)) findings.push({ type: "docs-page-missing-from-llms-txt", path });
    }
  }
}

// House style: no em dashes in page copy.
for (const entry of await walk(resolve(repoRoot, "src/site/content"))) {
  if (entry.type !== "file" || !entry.path.endsWith(".md")) continue;
  if ((await readFile(entry.absolutePath, "utf8")).includes("\u2014")) {
    findings.push({ type: "style-em-dash", path: entry.path });
  }
}

if (findings.length > 0) {
  process.stderr.write(JSON.stringify({ ok: false, roots: roots.map(displayPath), findings }, null, 2) + "\n");
  process.exitCode = 1;
} else {
  process.stdout.write(JSON.stringify({ ok: true, roots: roots.map(displayPath), checkedRequiredFiles: requiredFiles.length, checkedInternalLinks: checkedLinks }, null, 2) + "\n");
}
