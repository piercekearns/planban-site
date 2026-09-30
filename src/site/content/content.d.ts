declare module "*.md" {
  const document: import("./markdown").ContentDocument;
  export default document;
}

declare module "*.md?meta" {
  const meta: import("./markdown").ContentMeta;
  export default meta;
}
