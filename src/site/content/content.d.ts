declare module "*.md" {
  const document: import("./markdown").ContentDocument;
  export default document;
}
