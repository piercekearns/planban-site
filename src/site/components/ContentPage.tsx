import { type ReactNode, useState } from "react";
import type { ContentBlock, ContentDocument, InlineNode } from "../content/markdown";
import { type SiteRoute, articleHeadline, siteRoutes } from "../routes";
import { planbanVersion } from "../site-facts";
import { CheckIcon, CopyIcon, copyTextToClipboard } from "./copy";
import "../content-page.css";

const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] as const;

/** Formats YYYY-MM-DD as "30 September 2026" without locale-dependent APIs, so server and client agree. */
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return `${day} ${monthNames[(month ?? 1) - 1]} ${year}`;
}

function renderInline(nodes: readonly InlineNode[]): ReactNode[] {
  return nodes.map((node, index) => {
    switch (node.type) {
      case "text":
        return node.value;
      case "code":
        return <code key={index}>{node.value}</code>;
      case "strong":
        return <strong key={index}>{renderInline(node.children)}</strong>;
      case "em":
        return <em key={index}>{renderInline(node.children)}</em>;
      case "link":
        return <a key={index} href={node.href}>{renderInline(node.children)}</a>;
    }
  });
}

const CodeBlock = ({
  language,
  value
}: {
  language: string;
  value: string;
}) => {
  const [copied, setCopied] = useState(false);
  const label = language === "bash" ? "commands" : "prompt";
  async function copy() {
    await copyTextToClipboard(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  }
  return <div className={`pb-code-box pb-article-code is-${language}`}>
      <pre><code>{value}</code></pre>
      <button type="button" className={`pb-copy-icon ${copied ? "copied" : ""}`} onClick={copy} aria-label={`${copied ? "Copied" : "Copy"} ${label}`}>
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span>{copied ? "Copied" : "Copy"}</span>
      </button>
    </div>;
};

function renderBlock(block: ContentBlock, key: number, headingOffset = 0): ReactNode {
  switch (block.type) {
    case "heading": {
      const level = Math.min(block.level + headingOffset, 6);
      const Heading = `h${level}` as "h1" | "h2" | "h3" | "h4";
      return <Heading key={key} id={block.id}>{renderInline(block.children)}</Heading>;
    }
    case "paragraph":
      return <p key={key}>{renderInline(block.children)}</p>;
    case "list": {
      const List = block.ordered ? "ol" : "ul";
      return <List key={key}>{block.items.map((item, index) => <li key={index}>{renderInline(item)}</li>)}</List>;
    }
    case "code":
      return <CodeBlock key={key} language={block.language} value={block.value} />;
    case "figure":
      return <figure key={key} className="pb-article-figure">
          <img src={block.src} alt={block.alt} width={1280} height={720} loading="lazy" decoding="async" />
          {block.caption ? <figcaption>{renderInline(block.caption)}</figcaption> : null}
        </figure>;
  }
}

interface Section {
  heading: Extract<ContentBlock, { type: "heading" }>;
  blocks: ContentBlock[];
}

function splitSections(document: ContentDocument): { intro: ContentBlock[]; sections: Section[] } {
  const intro: ContentBlock[] = [];
  const sections: Section[] = [];
  for (const block of document.blocks) {
    if (block.type === "heading" && block.level === 1) continue;
    if (block.type === "heading" && block.level === 2) {
      sections.push({ heading: block, blocks: [] });
      continue;
    }
    const current = sections.at(-1);
    if (current) current.blocks.push(block);
    else intro.push(block);
  }
  return { intro, sections };
}

function linkedPaths(blocks: readonly ContentBlock[]): Set<string> {
  const paths = new Set<string>();
  const visit = (nodes: readonly InlineNode[]) => {
    for (const node of nodes) {
      if (node.type === "link") paths.add(node.href);
      if ("children" in node) visit(node.children);
    }
  };
  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "heading") visit(block.children);
    if (block.type === "list") block.items.forEach(visit);
    if (block.type === "figure" && block.caption) visit(block.caption);
  }
  return paths;
}

export const ContentPage = ({
  route
}: {
  route: SiteRoute;
}) => {
  const article = route.article;
  if (!article) return null;
  const { document } = article;
  const headline = articleHeadline(article);
  const { intro, sections } = splitSections(document);
  const linked = linkedPaths(document.blocks);
  // Link the other content pages this page does not already link in its copy.
  const related = siteRoutes.filter(other => other.article && other.id !== route.id && !linked.has(other.path));
  const [lede, ...introRest] = intro;
  return <article className="pb-article glass" aria-labelledby="page-title">
      <nav className="pb-article-breadcrumb" aria-label="Breadcrumb">
        <ol>
          <li><a href="/">Home</a></li>
          <li aria-current="page">{article.breadcrumbName}</li>
        </ol>
      </nav>
      <header className="pb-article-header">
        <h1 id="page-title">{headline}</h1>
        {lede?.type === "paragraph" ? <p className="pb-article-lede">{renderInline(lede.children)}</p> : lede ? renderBlock(lede, -1) : null}
        {introRest.map((block, index) => renderBlock(block, index))}
      </header>
      <div className="pb-article-body">
        {sections.map(section => <section key={section.heading.id} aria-labelledby={section.heading.id}>
            {renderBlock(section.heading, -1)}
            {section.blocks.map((block, index) => renderBlock(block, index))}
          </section>)}
      </div>
      <footer className="pb-article-footer">
        <p className="pb-article-applies">
          Applies to Planban v{planbanVersion}. Updated <time dateTime={document.frontMatter.updated}>{formatDate(document.frontMatter.updated)}</time>.
        </p>
        {related.length > 0 ? <nav className="pb-article-related" aria-label="Related pages">
            <ul>
              {related.map(other => <li key={other.id}><a href={other.path}>{other.article ? articleHeadline(other.article) : other.title}</a></li>)}
            </ul>
          </nav> : null}
      </footer>
    </article>;
};

/**
 * Renders a question-and-answer document (every ## heading is a question) as
 * a list of items whose questions are h3 headings.
 */
export const QuestionList = ({
  document
}: {
  document: ContentDocument;
}) => {
  const { sections } = splitSections(document);
  return <div className="pb-faq-list">
      {sections.map(section => <div key={section.heading.id} className="pb-faq-item">
          {renderBlock(section.heading, -1, 1)}
          {section.blocks.map((block, index) => renderBlock(block, index))}
        </div>)}
    </div>;
};
