// Canonical public facts about Planban. Page copy, head tags, and structured
// data read these values so the release version and positioning sentence are
// defined once.

export const siteOrigin = "https://planban.ai";
export const siteUrl = `${siteOrigin}/`;

/** The released Planban version shown in the header pill and structured data. */
export const planbanVersion = "1.1.6";
export const planbanReleaseUrl = `https://github.com/piercekearns/planban/releases/tag/v${planbanVersion}`;
export const planbanReleasesUrl = "https://github.com/piercekearns/planban/releases";
export const planbanRepositoryUrl = "https://github.com/piercekearns/planban";
export const planbanLicenseUrl = "https://github.com/piercekearns/planban/blob/main/LICENSE";
export const planbanXProfileUrl = "https://x.com/planbanai";

/** Owner-approved canonical description of Planban. */
export const planbanCanonicalDescription =
  "Planban is a local-first, agent-native Kanban board that installs as a plugin in Codex and Claude Code, so your agents keep the plan current and you see the whole project at a glance.";

export const planbanLogoUrl = `${siteOrigin}/assets/planban-logo-512.png`;
export const planbanSocialImageUrl = `${siteOrigin}/assets/planban-social-preview.png`;

/**
 * Structured-data feature list. Every entry must appear verbatim in the
 * rendered home page; the prerender step fails the build if one does not.
 */
export const planbanFeatureList = [
  "One board for the whole project",
  "Every Item, tracked as it happens",
  "Steer from any thread",
  "Scope and document each outcome",
  "Nothing lands until you approve it",
  "Local and agent-readable",
  "Portable references",
] as const;
