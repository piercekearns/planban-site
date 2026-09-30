---
title: "Planban documentation | Planban"
description: "Install Planban in Codex or Claude Code, learn how Items, Groups, Status, Specs and Plans work, and look up every CLI command and MCP tool."
path: /docs/
updated: 2026-09-30
sources: README.md; plugins/planban/.claude-plugin/plugin.json; plugins/planban/.codex-plugin/plugin.json; src/site/site-facts.ts
---

# Planban documentation

Planban documentation explains how to install Planban in Codex and Claude Code, how its board models work as Items, Groups, Status, Specs and Plans, and how agents use its CLI and MCP tools to keep that board current.

Planban is a local-first, agent-native Kanban board. Your agent keeps the plan current as it works, and you see the whole project at a glance. Board state stays on your machine.

## Where do I start?

Install Planban in the host you use, then set up Planban for a project. The pages after that explain how the board works and how agents change it. Every page is listed here in reading order.

<!-- component: docs-index -->

## Which host should I install Planban in?

Install Planban in each host you use. Each install is separate, but all installs on one device share the same boards, so a board you create from Codex is the same board you open from Claude Code.

- **Codex desktop.** The board opens in the Codex in-app browser, and you open it with `/pb` or `/planban`. See [Install Planban in Codex](/docs/install-codex/).
- **Claude Code desktop.** The board opens in the Claude Code browser pane, and the commands carry the plugin prefix, as in `/planban:pb`. See [Install Planban in Claude Code](/docs/install-claude-code/).
- **Other MCP hosts.** Any host that can run a local stdio MCP server gets the same tools without commands, and the board opens as a link. See [Use Planban from other MCP hosts](/docs/other-mcp-hosts/).

## Which version do these docs describe?

These docs describe Planban v{{planbanVersion}}, the current release. Planban is open source under the MIT licence. It is not published to npm: you install it through the Codex or Claude Code plugin marketplace from [GitHub](https://github.com/piercekearns/planban).

Each page ends with the version it applies to and the date it was last updated. The [changelog](/docs/changelog/) lists every release.
