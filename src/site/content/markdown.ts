// Build-time Markdown for the content pages. vite.site.config.ts runs
// parseContentDocument on every src/site/content/*.md import, so the browser
// and the prerenderer receive the same small JSON tree and no Markdown parser
// ships to visitors. It supports only what the page drafts use: front matter,
// # to ### headings, paragraphs, - and 1. lists, fenced code, a standalone
// image with an optional "*Caption: ...*" line, and inline code, **strong**,
// *emphasis*, [links](url), and bare https:// URLs. A line of the form
// <!-- component: name --> places a site component (such as the generated
// docs index) at that point in the page.

export type InlineNode =
  | { type: "text"; value: string }
  | { type: "code"; value: string }
  | { type: "strong"; children: InlineNode[] }
  | { type: "em"; children: InlineNode[] }
  | { type: "link"; href: string; children: InlineNode[] };

export type ContentBlock =
  | { type: "heading"; level: 1 | 2 | 3; id: string; text: string; children: InlineNode[] }
  | { type: "paragraph"; children: InlineNode[] }
  | { type: "list"; ordered: boolean; items: InlineNode[][] }
  | { type: "code"; language: string; value: string }
  | { type: "figure"; src: string; alt: string; caption: InlineNode[] | null }
  | { type: "component"; name: string };

export interface ContentFrontMatter {
  title: string;
  description: string;
  path: string;
  updated: string;
}

export interface ContentDocument {
  frontMatter: ContentFrontMatter;
  blocks: ContentBlock[];
}

/**
 * The parts of a document that navigation, head tags and llms.txt need.
 * Importing "page.md?meta" yields this instead of the whole block tree.
 */
export interface ContentMeta {
  frontMatter: ContentFrontMatter;
  /** Plain text of the page's H1. */
  headline: string;
}

export function contentMeta(document: ContentDocument, file = document.frontMatter.path): ContentMeta {
  const heading = document.blocks.find(block => block.type === "heading" && block.level === 1);
  if (!heading || heading.type !== "heading") throw new Error(`${file} has no H1.`);
  return { frontMatter: document.frontMatter, headline: heading.text };
}

export interface ParseOptions {
  /** Values substituted for {{name}} tokens before parsing. */
  tokens?: Record<string, string>;
}

function parseFrontMatter(source: string, file: string): { frontMatter: ContentFrontMatter; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n/u.exec(source);
  if (!match) throw new Error(`${file}: missing front matter.`);
  const fields: Record<string, string> = {};
  for (const line of match[1]!.split("\n")) {
    const field = /^([A-Za-z]+):\s*(.*)$/u.exec(line);
    if (!field) continue;
    fields[field[1]!] = field[2]!.trim().replace(/^"(.*)"$/u, "$1");
  }
  for (const key of ["title", "description", "path", "updated"] as const) {
    if (!fields[key]) throw new Error(`${file}: front matter is missing ${key}.`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(fields.updated!)) throw new Error(`${file}: updated must be YYYY-MM-DD.`);
  return {
    frontMatter: {
      title: fields.title!,
      description: fields.description!,
      path: fields.path!,
      updated: fields.updated!,
    },
    body: source.slice(match[0].length),
  };
}

function trimUrl(url: string): string {
  return url.replace(/[.,;:]+$/u, "");
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let buffer = "";
  const flush = () => {
    if (buffer) nodes.push({ type: "text", value: buffer });
    buffer = "";
  };
  let index = 0;
  while (index < text.length) {
    const rest = text.slice(index);
    if (rest.startsWith("`")) {
      const end = text.indexOf("`", index + 1);
      if (end > index) {
        flush();
        nodes.push({ type: "code", value: text.slice(index + 1, end) });
        index = end + 1;
        continue;
      }
    }
    if (rest.startsWith("**")) {
      const end = text.indexOf("**", index + 2);
      if (end > index) {
        flush();
        nodes.push({ type: "strong", children: parseInline(text.slice(index + 2, end)) });
        index = end + 2;
        continue;
      }
    }
    if (rest.startsWith("*")) {
      const end = text.indexOf("*", index + 1);
      if (end > index + 1) {
        flush();
        nodes.push({ type: "em", children: parseInline(text.slice(index + 1, end)) });
        index = end + 1;
        continue;
      }
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)/u.exec(rest);
    if (link) {
      flush();
      nodes.push({ type: "link", href: link[2]!, children: parseInline(link[1]!) });
      index += link[0].length;
      continue;
    }
    const bare = /^https:\/\/[^\s<>()]+/u.exec(rest);
    if (bare && (index === 0 || /\s/u.test(text[index - 1]!))) {
      const url = trimUrl(bare[0]);
      flush();
      nodes.push({ type: "link", href: url, children: [{ type: "text", value: url }] });
      index += url.length;
      continue;
    }
    buffer += text[index];
    index += 1;
  }
  flush();
  return nodes;
}

export function inlineText(nodes: readonly InlineNode[]): string {
  return nodes.map(node => node.type === "text" || node.type === "code" ? node.value : inlineText(node.children)).join("");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/gu, "")
    .trim()
    .replace(/\s+/gu, "-");
}

export function parseContentDocument(source: string, file: string, options: ParseOptions = {}): ContentDocument {
  let text = source.replace(/\r\n/gu, "\n");
  text = text.replace(/\{\{(\w+)\}\}/gu, (token, name: string) => {
    const value = options.tokens?.[name];
    if (value === undefined) throw new Error(`${file}: unknown token ${token}.`);
    return value;
  });
  const { frontMatter, body } = parseFrontMatter(text, file);
  const lines = body.split("\n");
  const blocks: ContentBlock[] = [];
  const headingIds = new Set<string>();
  let index = 0;

  const isBlockStart = (line: string) => /^(#{1,3} |```|- |\d+\. |!\[|<!-- component: )/u.test(line);

  while (index < lines.length) {
    const line = lines[index]!;
    if (line.trim() === "") {
      index += 1;
      continue;
    }

    const heading = /^(#{1,3}) (.+)$/u.exec(line);
    if (heading) {
      const children = parseInline(heading[2]!);
      const plain = inlineText(children);
      const id = slugify(plain);
      if (headingIds.has(id)) throw new Error(`${file}: duplicate heading "${plain}".`);
      headingIds.add(id);
      blocks.push({ type: "heading", level: heading[1]!.length as 1 | 2 | 3, id, text: plain, children });
      index += 1;
      continue;
    }

    const component = /^<!-- component: ([a-z0-9-]+) -->$/u.exec(line);
    if (component) {
      blocks.push({ type: "component", name: component[1]! });
      index += 1;
      continue;
    }

    const fence = /^```(\w*)$/u.exec(line);
    if (fence) {
      const end = lines.indexOf("```", index + 1);
      if (end < 0) throw new Error(`${file}: unclosed code fence.`);
      blocks.push({ type: "code", language: fence[1] || "text", value: lines.slice(index + 1, end).join("\n") });
      index = end + 1;
      continue;
    }

    const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/u.exec(line);
    if (image) {
      if (!image[1]) throw new Error(`${file}: image ${image[2]} has no alt text.`);
      index += 1;
      while (lines[index]?.trim() === "") index += 1;
      const caption = /^\*Caption: (.+)\*$/u.exec(lines[index] ?? "");
      if (caption) index += 1;
      blocks.push({ type: "figure", src: image[2]!, alt: image[1], caption: caption ? parseInline(caption[1]!) : null });
      continue;
    }

    const listMarker = /^(- |\d+\. )/u.exec(line);
    if (listMarker) {
      const ordered = listMarker[1] !== "- ";
      const items: InlineNode[][] = [];
      while (index < lines.length && (ordered ? /^\d+\. /u : /^- /u).test(lines[index]!)) {
        items.push(parseInline(lines[index]!.replace(/^(- |\d+\. )/u, "")));
        index += 1;
      }
      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraph: string[] = [];
    while (index < lines.length && lines[index]!.trim() !== "" && (paragraph.length === 0 || !isBlockStart(lines[index]!))) {
      paragraph.push(lines[index]!.trim());
      index += 1;
    }
    blocks.push({ type: "paragraph", children: parseInline(paragraph.join(" ")) });
  }

  return { frontMatter, blocks };
}
