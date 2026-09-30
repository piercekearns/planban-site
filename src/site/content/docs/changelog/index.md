---
title: "Planban changelog | Planban docs"
description: "Every public Planban release, newest first: what changed in the latest version, earlier releases back to v1.0.0, and how to update."
path: /docs/changelog/
updated: 2026-09-30
sources: gh release list --repo piercekearns/planban; release/notes/*.md; release/latest.json (changelogSummary); src/site/releases.ts
---

# Planban changelog

The Planban changelog lists every public Planban release, with a page for each release from v1.1.6 onwards and a link to the GitHub release notes for earlier versions.

Releases are listed newest first. Each date is the day the release was published on GitHub.

## What changed in the latest release?

Planban v1.1.6, released on 26 September 2026, adds Claude Code desktop support, makes the agent's board-link handoff work the same way in every host, and resolves boards from linked git worktrees.

- Planban installs as a Claude Code plugin, with six `/planban:` commands, the board in the browser pane, and a session-start hook.
- MCP results that concern a board carry the board link, so agents in any host return it without the skills.
- Sessions in a linked git worktree open the main checkout's board.

Read the full notes on the [Planban v1.1.6](/docs/changelog/v1-1-6/) page.

## Which releases came before v1.1.6?

Earlier releases predate Claude Code support, and their notes are on GitHub. Some of those notes include install or update steps that no longer apply; follow the current [install](/docs/install-codex/) and [update](/docs/updating/) pages instead.

<!-- component: release-history -->

## How do I update to the latest release?

The board shows an update notice when a new release is out. In Codex, choose **Update now** or **Update with Codex** on the board, or run the marketplace commands. In Claude Code, run the plugin update commands. Then start a new session. See [Update Planban](/docs/updating/) for the exact commands.
