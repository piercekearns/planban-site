// Full block trees for the docs pages, keyed by Markdown source path.
import type { ContentDocument } from "./content/markdown";

const documents = import.meta.glob<ContentDocument>("./content/docs/**/*.md", { eager: true, import: "default" });

function globKey(sourceFile: string): string {
  return `./${sourceFile.replace(/^src\/site\//u, "")}`;
}

export function docsDocument(sourceFile: string): ContentDocument {
  const document = documents[globKey(sourceFile)];
  if (!document) throw new Error(`No docs document for ${sourceFile}.`);
  return document;
}
