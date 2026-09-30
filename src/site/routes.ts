import {
  planbanCanonicalDescription,
  planbanFeatureList,
  planbanLicenseUrl,
  planbanLogoUrl,
  planbanReleasesUrl,
  planbanRepositoryUrl,
  planbanSocialImageUrl,
  planbanVersion,
  planbanXProfileUrl,
  siteOrigin,
  siteUrl,
} from "./site-facts";

export type SiteRouteId = "home" | "privacy" | "not-found";

export interface SiteRoute {
  id: SiteRouteId;
  /** Public URL path, folder-style with a trailing slash. */
  path: string;
  /** Output file relative to dist/site. */
  outputFile: string;
  title: string;
  description: string;
  socialTitle: string;
  ogDescription: string;
  twitterDescription: string;
  /** Indexable routes get a canonical URL and a sitemap entry. */
  indexable: boolean;
  /** Repository files whose last commit date becomes the sitemap lastmod. */
  sourceFiles: readonly string[];
  preloadDisplayFont?: boolean;
  structuredData?: boolean;
}

const sharedPageSources = [
  "src/site/components/PlanbanPublicWebsite.tsx",
  "src/site/routes.ts",
  "src/site/site-facts.ts",
] as const;

export const siteRoutes: readonly SiteRoute[] = [
  {
    id: "home",
    path: "/",
    outputFile: "index.html",
    title: "Planban | Agent-native Kanban for Codex and Claude Code",
    description: planbanCanonicalDescription,
    socialTitle: "Planban",
    ogDescription: planbanCanonicalDescription,
    twitterDescription: "An agent-native Kanban board that lives in your agent's browser. Works with Codex and Claude Code.",
    indexable: true,
    sourceFiles: [
      ...sharedPageSources,
      "src/site/components/HeroLiveDemo.tsx",
      "src/site/components/OutcomeJourney.tsx",
    ],
    preloadDisplayFont: true,
    structuredData: true,
  },
  {
    id: "privacy",
    path: "/privacy/",
    outputFile: "privacy/index.html",
    title: "Privacy Policy | Planban",
    description: "Read how the Planban public website handles email signups, standard request metadata, and local product data.",
    socialTitle: "Planban Privacy Policy",
    ogDescription: "How the Planban public website handles email signups, request metadata, and local product data.",
    twitterDescription: "How the Planban public website handles email signups, request metadata, and local product data.",
    indexable: true,
    sourceFiles: sharedPageSources,
  },
  {
    id: "not-found",
    path: "/404.html",
    outputFile: "404.html",
    title: "Page not found | Planban",
    description: "This page does not exist on planban.ai.",
    socialTitle: "Planban",
    ogDescription: "This page does not exist on planban.ai.",
    twitterDescription: "This page does not exist on planban.ai.",
    indexable: false,
    sourceFiles: sharedPageSources,
  },
];

export function findSiteRoute(id: string | undefined): SiteRoute | undefined {
  return siteRoutes.find(route => route.id === id);
}

export function canonicalUrl(route: SiteRoute): string {
  return `${siteOrigin}${route.path}`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

const organizationId = `${siteOrigin}/#org`;
const websiteId = `${siteOrigin}/#website`;

export function buildStructuredData() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: "Planban",
        url: siteUrl,
        logo: planbanLogoUrl,
        description: planbanCanonicalDescription,
        sameAs: [planbanRepositoryUrl, planbanXProfileUrl],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: siteUrl,
        name: "Planban",
        publisher: { "@id": organizationId },
      },
      {
        "@type": "SoftwareApplication",
        name: "Planban",
        url: siteUrl,
        description: planbanCanonicalDescription,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "macOS, Linux, Windows",
        softwareVersion: planbanVersion,
        offers: {
          "@type": "Offer",
          price: 0,
          priceCurrency: "USD",
        },
        license: planbanLicenseUrl,
        author: { "@id": organizationId },
        sameAs: planbanRepositoryUrl,
        releaseNotes: planbanReleasesUrl,
        featureList: [...planbanFeatureList],
      },
    ],
  };
}

/** Serialises JSON for an inline script without allowing it to close the tag. */
function inlineJson(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("&", "\\u0026");
}

export function renderRouteHead(route: SiteRoute): string {
  const pageUrl = canonicalUrl(route);
  const tags = [
    `<title>${escapeHtml(route.title)}</title>`,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
    route.indexable ? null : `<meta name="robots" content="noindex" />`,
    `<meta property="og:title" content="${escapeHtml(route.socialTitle)}" />`,
    `<meta property="og:description" content="${escapeHtml(route.ogDescription)}" />`,
    `<meta property="og:type" content="website" />`,
    route.indexable ? `<meta property="og:url" content="${pageUrl}" />` : null,
    `<meta property="og:image" content="${planbanSocialImageUrl}" />`,
    `<meta property="og:image:type" content="image/png" />`,
    `<meta property="og:image:width" content="1200" />`,
    `<meta property="og:image:height" content="630" />`,
    `<meta property="og:image:alt" content="Planban logo and wordmark." />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@planbanai" />`,
    `<meta name="twitter:title" content="${escapeHtml(route.socialTitle)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(route.twitterDescription)}" />`,
    `<meta name="twitter:image" content="${planbanSocialImageUrl}" />`,
    `<meta name="twitter:image:alt" content="Planban logo and wordmark." />`,
    route.indexable ? `<link rel="canonical" href="${pageUrl}" />` : null,
    route.preloadDisplayFont ? `<link rel="preload" href="/assets/fonts/Hellenica.otf" as="font" type="font/otf" crossorigin />` : null,
    route.structuredData ? `<script type="application/ld+json">${inlineJson(buildStructuredData())}</script>` : null,
  ];
  return tags.filter((tag): tag is string => tag !== null).join("\n    ");
}
