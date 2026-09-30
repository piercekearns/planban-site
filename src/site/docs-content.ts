// Full block trees for the docs pages, keyed by Markdown source path. The
// client bundle does not include them: entry-client.tsx loads the current
// page's document (its own small chunk) before hydrating, and
// entry-server.tsx registers every document for prerendering.
import type { ContentDocument } from "./content/markdown";

const documents = new Map<string, ContentDocument>();

/** import.meta.glob key for a docs source file, relative to src/site. */
export function docsGlobKey(sourceFile: string): string {
  return `./${sourceFile.replace(/^src\/site\//u, "")}`;
}

export function registerDocsDocument(globKey: string, document: ContentDocument): void {
  documents.set(globKey, document);
}

export function docsDocument(sourceFile: string): ContentDocument {
  const document = documents.get(docsGlobKey(sourceFile));
  if (!document) throw new Error(`The docs document for ${sourceFile} has not been loaded.`);
  return document;
}
