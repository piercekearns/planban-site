---
title: "Planban commands in Codex and Claude Code | Planban docs"
description: "The six Planban commands, how to type them in Codex and Claude Code, what each one does, the plain prompts that work instead, and what the reply contains."
path: /docs/slash-commands/
updated: 2026-09-30
sources: plugins/planban/skills/*/SKILL.md; plugins/planban/skills/*/agents/openai.yaml; plugins/planban/skills/planban/references/planban-protocol.md (Command-Like Skills, Board Opening); plugins/planban/skills/planban-help/SKILL.md; plugins/planban/skills/pb/SKILL.md (Response); README.md (Install)
---

# Planban commands in Codex and Claude Code

Planban adds six commands to each host, `pb`, `planban`, `planban-create`, `planban-help`, `planban-tutorial` and `planban-feedback`, and Claude Code lists them with the plugin prefix, as in `/planban:pb`.

Each command is a skill that the Planban plugin installs. The commands are shortcuts: plain prompts that name Planban clearly do the same work.

## Which commands does Planban add?

| Command | Codex | Claude Code |
| --- | --- | --- |
| Open the best matching board | `/pb` or `/planban` | `/planban:pb` or `/planban:planban` |
| Create boards or Items from rough notes | `/planban-create` | `/planban:planban-create` |
| Show commands, prompts and a short guide | `/planban-help` | `/planban:planban-help` |
| Open the interactive tutorial | `/planban-tutorial` | `/planban:planban-tutorial` |
| Investigate and package feedback | `/planban-feedback` | `/planban:planban-feedback` |

Other MCP hosts get no commands. Their agents use the [MCP tools](/docs/mcp-tools/) directly.

## How do I type them in Codex and in Claude Code?

In Codex, type `/planban` and choose a Planban action from the `/` menu. The menu shows each command by its display name: PB, Planban, Planban Create, Planban Help, Planban Tutorial and Planban Feedback. You can also mention the plugin, as in `@planban Open my Planban board`.

In Claude Code, type `/planban:` to list the Planban commands, then pick one. Claude Code always shows the `planban:` prefix, because it names commands after the plugin that provides them.

## What does each command do?

- **`pb`** opens the best matching board at once, with no explanation first. It opens the current project's board when the project is set up for Planban. Otherwise it opens the only registered board, or the all-boards selector when there are several.
- **`planban`** opens the same board as `pb` for a plain open request. It is also the entry point for any other Planban work: reading and changing Items, Specs, Plans and Status. For that work it loads the full Planban protocol first. If you describe a Planban problem, it hands over to `planban-feedback`.
- **`planban-create`** turns rough intent into Planban structure: a new board or project set-up, one new Item, or several Items and Groups drawn from notes, issues or exported plans. See [Set up Planban for a project](/docs/set-up-a-project/).
- **`planban-help`** returns a short guide: the commands for your host, a few getting-started steps, the Item and Group vocabulary, and suggested prompts.
- **`planban-tutorial`** starts the local app, creates or reuses the Planban Demo board and opens the interactive tutorial.
- **`planban-feedback`** investigates a bug, request or rough edge using the conversation you have already had, searches existing issues, and drafts the best route. Nothing is posted until you approve it. See [Troubleshooting Planban](/docs/troubleshooting/#how-do-i-report-a-bug-or-send-feedback).

## Can I use plain prompts instead of commands?

Yes. Plain prompts work in any host when they name Planban clearly. These are the prompts Planban suggests:

- `Open my Planban board.`
- `Show all my Planban boards.`
- `Summarize this project's Planban roadmap state.`
- `Start work on the Planban roadmap item called <title or id>.`
- `Create Planban roadmap items from these notes: <notes>.`
- `Send Planban feedback: <feedback>.`
- `Check whether Planban has updates.`

After `/pb` or `/planban` opens a board, a short follow-up such as "start this card" or "do the next thing" is treated as Planban work. If it is unclear which Item you mean, the agent asks.

## What does the reply contain after a board opens?

Every reply after a board opens includes the exact board URL as a clickable link, even when the board also appeared beside your session. When the host showed the board, the reply reads:

```output
Planban is open: [Open the verified board](URL)
```

When the host could not show it, or has no browser beside the session, the reply reads as follows, with at most one short reason:

```output
Planban is running: [Open the verified board](URL)
```

The tutorial replies the same way, with `Planban tutorial is open` or `Planban tutorial is running` and a link to the tutorial. A reply that says only "Board opened" without the link is never correct.

## Which command can run without being typed?

In Codex, `planban` and `planban-feedback` allow implicit invocation. Codex can use them when your prompt clearly asks for Planban work or describes a Planban problem, without you typing a command. `pb`, `planban-create`, `planban-help` and `planban-tutorial` run only when you choose them.

In Claude Code, Claude can also use a Planban skill when your request matches its description, such as asking to open your Planban board.
