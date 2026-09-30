---
title: "Set up Planban for a project | Planban docs"
description: "Create a Planban board for a repository: what set-up writes, how the board id is chosen, the tutorial and Demo board, importing existing plans, and refreshing guidance."
path: /docs/set-up-a-project/
updated: 2026-09-30
sources: README.md (First Run); src/core/storage.ts (initializeProject, buildAgentsBlock, upsertManagedBlock); src/cli.ts (init); src/core/paths.ts (defaultRepoId, slugify); src/core/protocol.ts (buildAgentContext); src/core/registry.ts (registerBoardFromState); src/core/demo.ts; plugins/planban/scripts/launch-planban.mjs; plugins/planban/skills/planban-tutorial/SKILL.md; plugins/planban/skills/planban-create/SKILL.md; plugins/planban/skills/planban-help/SKILL.md; release/notes/v1.1.6.md (Updating)
---

# Set up Planban for a project

Setting up Planban for a project creates a board for that repository: it writes two discovery files in the project's `.planban/` folder, creates a live roadmap under `~/.planban`, and adds a managed Planban block to the project's `AGENTS.md`.

You set up each project once on each device. After that, any agent session in the project, in any host with Planban installed, finds the same board.

## How do I set up a project by asking my agent?

Ask your agent, replacing the path with your project's:

```text
Set up Planban for my local project at /path/to/project. If it is not initialized yet, ask me before initializing it. Then open the board and help me create roadmap items from the current repo docs, issues, notes, or my description of what I am building.
```

The `planban-create` command (`/planban-create` in Codex, `/planban:planban-create` in Claude Code) also handles project set-up from a rough request. To set up a project yourself, run the CLI's `init` command:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" init --cwd /path/to/repo
```

`$PLANBAN_ROOT` is your Planban marketplace folder; see [How do I run the CLI?](/docs/cli/#how-do-i-run-the-cli).

## What does setting up a project write?

Set-up writes four things and registers the board:

- **`.planban/project.json`** in your project. This manifest records the board id (`repoId`) and marks Planban as enabled for the project.
- **`.planban/agent-context.md`** in your project. This generated guide tells agents where the live roadmap is, gives the board URL and the Planban tool names, and sets out the status protocol and what to do when Planban is not installed in a host.
- **`~/.planban/repos/<repo-id>/roadmap.json`** on your machine. This is the live board. Set-up creates it only when it does not exist, so an existing board is never overwritten.
- **A managed block in `AGENTS.md`** in your project. Set-up creates `AGENTS.md` if needed and writes a block between `<!-- BEGIN PLANBAN -->` and `<!-- END PLANBAN -->`. Running set-up again replaces that block in place and leaves the rest of the file alone. Pass `--no-agents` to skip it.

Set-up does not write a `CLAUDE.md`. In Claude Code, the [session-start hook](/docs/install-claude-code/#what-does-the-session-start-hook-do) points Claude at the board instead.

We recommend adding `.planban/` to your project's `.gitignore`. The discovery files contain absolute paths from your machine, and board state lives on each device, so each device that works on the project runs set-up once. See [Where Planban stores your data](/docs/data-storage/).

## How is the board's id chosen?

By default, the board id is the project folder's name in lower case, with every run of other characters replaced by a hyphen. A folder called `My App` becomes `my-app`. The default title is the id with hyphens turned into spaces and each word capitalised, such as `My App`.

The id appears in the board URL (`http://127.0.0.1:4317/boards/my-app`) and in the path of the live roadmap. Choose your own with `--repo-id`, and your own title with `--title`:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" init --cwd /path/to/repo --repo-id <repo-id> --title "<title>"
```

Ids are not checked for clashes. If another project with the same folder name is already set up, set-up points this project at that existing board. Pass `--repo-id` to keep the two apart.

## What are the tutorial and the Planban Demo board?

The tutorial is a short interactive tour of the board. Open it with `/planban-tutorial` in Codex or `/planban:planban-tutorial` in Claude Code, or from a terminal in your Planban folder:

```bash
node plugins/planban/scripts/launch-planban.mjs --tutorial
```

This creates or reuses the Planban Demo board, starts the local app if needed, and prints a URL such as `http://127.0.0.1:4317/tutorial?mode=first-run`.

The Planban Demo board (`planban-demo`) is a practice board with five cards. Use it to drag cards between columns, drag one Item onto another to create a Group, open a card's details and Spec, mark a card Complete, and try the feedback button. It is not linked to any of your repositories, and it never touches an `AGENTS.md`.

## How do I turn existing plans into Planban Items?

Give your agent the context and ask it to draft Items for you to review. The context can be repository docs, GitHub Issues, Notion, Jira or Linear exports, copied notes, or a plain-language description of the project. For example:

```text
Create Planban roadmap items from these notes: <notes>.
```

The agent decides whether each outcome is an [Item or a Group](/docs/items-and-groups/), writes each summary, next action and Spec, and inspects the existing board before it creates several Items. You can edit, reorder or archive the drafts on the board.

## How do I refresh a project's generated guidance after an update?

Run set-up again with the board's existing id. You can find the id in `.planban/project.json` or in the board URL.

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" init --cwd /path/to/repo --repo-id <repo-id>
```

This rewrites `.planban/project.json` and `.planban/agent-context.md`, and replaces the managed block in `AGENTS.md`. The live board keeps all its Items, Specs and Plans. In v1.1.6, both the generated context and the `AGENTS.md` block gained new guidance, so keep the block unless you maintain `AGENTS.md` yourself. To leave `AGENTS.md` untouched, add `--no-agents`.
