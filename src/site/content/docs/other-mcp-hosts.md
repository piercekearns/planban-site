---
title: "Use Planban from other MCP hosts | Planban docs"
description: "Run Planban's MCP server from any host that supports local stdio MCP servers: what the host gets, how to configure it, and how the agent returns the board link."
path: /docs/other-mcp-hosts/
updated: 2026-09-30
sources: README.md (Install, Other hosts); plugins/planban/scripts/start-planban-mcp.mjs; plugins/planban/scripts/runtime-root.mjs; plugins/planban/scripts/runtime-dependencies.mjs; scripts/configure-local-plugin.mjs; plugins/planban/mcp/server.mjs; src/core/protocol.ts; src/core/storage.ts (buildAgentsBlock); plugins/planban/skills/planban/references/planban-protocol.md (Host adapters); release/notes/v1.1.6.md
---

# Use Planban from other MCP hosts

Any agent host that can run a local stdio MCP server can use Planban's tools by starting `plugins/planban/scripts/start-planban-mcp.mjs` from a Planban checkout, although it gets no slash commands or skills.

Codex and Claude Code install Planban as a plugin. Other hosts use the same MCP server directly, so their agents read and change the same boards.

## What does another MCP host get, and what does it miss?

Another host gets the Planban MCP server: the same [MCP tools](/docs/mcp-tools/), the same instructions to the agent, and the same clickable board URLs in tool results.

It does not get:

- the six Planban commands, such as `/pb` in Codex or `/planban:pb` in Claude Code;
- the skills, including the Planban protocol and house style references they carry;
- the Claude Code session-start hook;
- a board beside the session. The agent makes no attempt to open an in-app browser and returns the board as a link for you to open.

## How do I configure the Planban MCP server?

Clone Planban and install its dependencies:

```bash
git clone https://github.com/piercekearns/planban.git
cd planban
npm install
```

Then add an MCP server to your host's configuration that runs `node <checkout>/plugins/planban/scripts/start-planban-mcp.mjs` with the environment variable `PLANBAN_REPO_ROOT=<checkout>`, where `<checkout>` is the absolute path of your clone.

Many hosts use a JSON file of this shape. This example is generic: Planban has not been tested with a specific host, so check your host's documentation for the file name and keys it expects.

```json
{
  "mcpServers": {
    "planban": {
      "command": "node",
      "args": ["<checkout>/plugins/planban/scripts/start-planban-mcp.mjs"],
      "env": {
        "PLANBAN_REPO_ROOT": "<checkout>"
      }
    }
  }
}
```

If `PLANBAN_REPO_ROOT` points at a folder that is not a complete Planban checkout, the server stops with `PLANBAN_REPO_ROOT does not contain a complete Planban runtime`. If dependencies are missing, the server runs `npm install` before it starts and writes that output to stderr, so running `npm install` yourself first keeps the first start quick.

## How does the agent learn Planban's rules without the skills?

The server gives the agent its core rules when the host connects. These instructions tell the agent to:

- prefer the Planban tools for all board, card and document reads and writes;
- pass `cwd` as the absolute repository path, or `repoId` for a registered board;
- read `.planban/agent-context.md` before creating or materially editing owner-facing content;
- make one change at a time on each board;
- move work to Complete only when you ask, confirm review or testing, or waive review;
- include the exact clickable board URL in its reply after opening the board or finishing a batch of changes.

A project that is [set up for Planban](/docs/set-up-a-project/) adds more. Its `.planban/agent-context.md` and the managed block in its `AGENTS.md` describe the board, the tool names and the [status protocol](/docs/agent-protocol/). Each tool's description also states its own rules, such as the completion check on `planban_move_card`.

## How does the agent return the board link?

Results from the create, change, status and `planban_get_board` tools carry a `boardUrl`, a `boardUrlVerified` flag and a ready-made `userReply` link. When the local app answered a health check, the link reads `[Open the verified board](URL)`. Otherwise it reads `[Open the board](URL)` and names `planban_launch_board` as the way to verify it.

`planban_launch_board` starts or finds the local Planban app and returns a verified URL. The agent calls it once when a result is unverified, then includes the link in its final reply. See [How agents work with the board](/docs/agent-protocol/#what-does-the-agent-tell-me-after-changing-the-board).

## What happens in a Planban project when the host has no Planban install?

A project's generated guidance covers this case. When Planban tools are not available in a session, `.planban/agent-context.md` tells the agent to:

- tell you once, in one sentence, that the project tracks work in Planban but Planban is not installed for this host, and link the install steps;
- continue the requested work;
- apply any required board changes with the Planban CLI from a Planban checkout, or tell you which Planban updates are pending.

The CLI form it gives is:

```bash
node <planban-checkout>/bin/planban.mjs <command> --cwd <this repo> -o json
```

The managed `AGENTS.md` block carries the same first two instructions. See the [CLI reference](/docs/cli/) for every command.
