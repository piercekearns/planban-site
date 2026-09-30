// Public Planban releases, newest first, for the changelog index. Dates are
// the GitHub release publish dates (UTC). Releases with a page under
// /docs/changelog/ link there; earlier ones link to their GitHub release.
export interface PlanbanRelease {
  version: string;
  /** YYYY-MM-DD */
  published: string;
  summary: string;
  /** Site path of the release page, when there is one. */
  page?: string;
}

export const planbanReleases: readonly PlanbanRelease[] = [
  { version: "1.1.6", published: "2026-09-26", summary: "Claude Code desktop support, host-neutral agent handoff, and board discovery from linked git worktrees.", page: "/docs/changelog/v1-1-6/" },
  { version: "1.1.5", published: "2026-09-16", summary: "Fixes first-launch failures and prepares the runtime the same way for the board, CLI and MCP server." },
  { version: "1.1.4", published: "2026-09-01", summary: "Prepares lighter marketplace updates and strengthens command execution on Windows." },
  { version: "1.1.3", published: "2026-08-31", summary: "Makes active agent work easier to see and keeps boards responsive while they reconcile changes." },
  { version: "1.1.2", published: "2026-08-30", summary: "Compatibility and launch-reliability fixes." },
  { version: "1.1.1", published: "2026-08-30", summary: "Reliability and usability fixes for the v1.1 release." },
  { version: "1.1.0", published: "2026-08-30", summary: "Adds the one-level Groups and Items model." },
  { version: "1.0.5", published: "2026-08-30", summary: "Makes bug feedback agent-led, evidence-backed and easier to submit." },
  { version: "1.0.4", published: "2026-08-29", summary: "Makes the verified board URL part of every successful open confirmation." },
  { version: "1.0.3", published: "2026-08-28", summary: "Fixes cold launches after the browser reliability patch." },
  { version: "1.0.2", published: "2026-08-28", summary: "Browser reliability fixes." },
  { version: "1.0.0", published: "2026-06-17", summary: "First public release, for Codex." },
];

export function releaseUrl(release: PlanbanRelease): string {
  return release.page ?? `https://github.com/piercekearns/planban/releases/tag/v${release.version}`;
}
