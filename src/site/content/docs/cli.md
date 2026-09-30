---
title: "Planban CLI reference | Planban docs"
description: "Every Planban CLI command in v1.1.6: how to run the CLI from your marketplace folder, the shared options, and the commands for boards, Items, documents, updates and recovery."
path: /docs/cli/
updated: 2026-09-30
sources: src/cli.ts; bin/planban.mjs; package.json (bin, scripts.planban); src/core/protocol.ts (CLI fallback line); plugins/planban/skills/planban/references/planban-protocol.md (CLI examples); plugins/planban/skills/planban-create/SKILL.md; README.md (Manual Install, Install With Claude Code details); src/core/storage.ts; src/core/registry.ts; src/core/updatePreflight.ts; src/core/updateRunner.ts
---

# Planban CLI reference

The Planban CLI is the `planban` program at `bin/planban.mjs` in your Planban marketplace checkout; Planban is not published to npm, so you run it with `node` from that checkout.

The CLI reads and changes the same boards as the board itself and the [MCP tools](/docs/mcp-tools/). Agents use it when the MCP tools are not available, and you can use it for scripting, set-up and recovery.

## How do I run the CLI?

Run `bin/planban.mjs` with `node`, giving the command and its options:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" <command>
```

`PLANBAN_ROOT` is the folder of your Planban marketplace. The install commands set it; in a new terminal, set it again with the line for your host.

In Codex:

```bash
PLANBAN_ROOT="$(codex plugin marketplace list | awk '$1 == "planban" { print $2 }')"
```

In Claude Code:

```bash
PLANBAN_ROOT="$HOME/.claude/plugins/marketplaces/planban"
```

For a local clone, `PLANBAN_ROOT` is the clone itself. The CLI installs any missing runtime dependencies on first run. `--help` lists the commands, `<command> --help` lists a command's options, and `--version` prints the Planban version.

## Which options do most commands share?

| Option | Meaning |
| --- | --- |
| `--cwd <path>` | The project to work on. Defaults to the current folder. A subfolder or a linked git worktree of a set-up project finds that project's board; `init` sets up exactly the folder you give. |
| `-o, --output <format>` | `-o json` prints the result as JSON. Agents always pass it. |
| `--base-revision <revision>` | On commands that change Items: refuse the change if the board's revision is no longer this number. |

A failed command prints its error message to stderr and exits with status 1. Statuses are written as `in-progress`, `up-next`, `pending`, `complete` and `archived`.

## Which commands manage boards?

| Command | What it does |
| --- | --- |
| `init` | Sets up Planban for a project. Options: `--cwd`, `--title <title>`, `--repo-id <id>`, `--no-agents` (leave `AGENTS.md` alone). See [Set up Planban for a project](/docs/set-up-a-project/). |
| `status` | Reports whether the project is set up, with its board id and the paths of its manifest, generated context, planning root and roadmap. |
| `list-boards` | Lists the boards registered on this device. `--include-archived` adds archived boards. |
| `archive-board <repoId>` | Archives a whole board. It leaves normal board lists but keeps all its planning state. |
| `restore-board <repoId>` | Restores an archived board. |
| `duplicate-board <sourceRepoId>` | Copies a whole board into a new board, leaving the source untouched. Options: `--repo-id <id>`, `--title <title>`. |
| `delete-board <repoId>` | Deletes a whole board after writing a timestamped backup. Requires `--yes`. It never deletes your project repository. |
| `demo` | Creates or reuses the Planban Demo board. |
| `serve` | Runs the local board app in the terminal. Options: `--cwd`, `--port <port>` (default `4317`), `--no-vite`. |

Most people start the board through their agent or `node plugins/planban/scripts/launch-planban.mjs --cwd /path/to/repo`, which runs the app in the background and prints the verified URL.

## Which commands read Items?

| Command | What it does |
| --- | --- |
| `list-cards` | Prints every card on the board. |
| `get-card <cardId>` | Prints one card, with its `ancestry`: the Group that owns it, if any. |
| `query-cards` | Searches and filters cards without changing anything, and prints the matches with the board revision. |

`query-cards` takes these options, which combine:

| Option | Values |
| --- | --- |
| `--search <text>` | Matches id, title, summary, next action and tags |
| `--projection <projection>` | `main`, `group` or `flattened` |
| `--group <cardId>` | The Group for the `group` projection or the `selected-group` scope |
| `--scope <scope>` | `projection`, `root`, `owned`, `leaf` or `selected-group` |
| `--group-role <role>` | `any`, `group` or `item-only` |
| `--status <status>` | A Status; repeat for several |
| `--blocked <state>` | `any`, `blocked` or `unblocked` |
| `--tag <tag>` | A tag; repeat for several |

For example:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" get-card <card-id> --cwd /path/to/repo -o json
```

## Which commands create and change Items?

| Command | What it does |
| --- | --- |
| `create-card <title>` | Creates an Item. Options: `--status`, `--summary`, `--next-action`, `--tag` (repeat), `--metadata-json <json>`, `--spec-file <path>`, `--plan-file <path>`, `--position top` or `bottom`, `--after <cardId>`, `--parent <groupId>`, `--base-revision`. |
| `create-cards` | Creates several Items at once, each with a default Spec. Options: `--title <title>` (required; repeat), `--status`, `--parent <groupId>`, `--base-revision`. |
| `create-group <title>` | Creates a Group. Options: `--summary` (the Group objective), `--next-action`, `--status`, `--item <cardId>` (repeat), `--anchor <cardId>` (the Item whose Main Board position the Group takes), `--spec-file`, `--plan-file`, `--base-revision`. |
| `move-card <cardId>` | Changes Status, ownership or position in one step. Options: `--status <status>`, `--parent <groupId>` or `--board`, `--after <cardId>` or `--first`, `--base-revision`. Give at least one. |
| `update-card <cardId>` | Changes card fields other than Status. Options: `--title`, `--summary` or `--clear-summary`, `--next-action` or `--clear-next-action`, `--tag` (repeat; replaces all tags), `--blocked-by <cardId>` or `--clear-blocked-by`, `--metadata-json <json>` or `--clear-metadata`, `--base-revision`. |
| `complete-card <cardId>` | Moves a card to Complete. |
| `archive-card <cardId>` | Moves a card to Archived. |
| `restore-card <cardId>` | Moves an archived card to Pending. |

New Items go to Pending unless you give `--status`. `create-card` writes a default Spec unless you give `--spec-file`, and creates a Plan only when you give `--plan-file`. For example:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" create-card "Title" --summary "..." --next-action "..." --cwd /path/to/repo -o json
node "$PLANBAN_ROOT/bin/planban.mjs" move-card <card-id> --status in-progress --cwd /path/to/repo -o json
```

Unlike the MCP tool, `complete-card` and `move-card --status complete` do not ask for confirmation. Agents follow the same rule either way: work is marked Complete only when you say so. See [How agents work with the board](/docs/agent-protocol/).

## Which commands read and write Specs and Plans?

| Command | What it does |
| --- | --- |
| `read-doc <cardId> <kind>` | Prints a card's `spec` or `plan`, with its path, whether it exists and its modification time. |
| `write-doc <cardId> <kind>` | Replaces a card's `spec` or `plan` with Markdown from `--file <path>`, or from standard input. Creates the document if the card has none. |

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" read-doc <card-id> spec --cwd /path/to/repo -o json
```

## How do I check for updates from the CLI?

Run `update` from your Planban folder. On its own, or with `--dry-run`, it only inspects: it reports whether this install can update directly, what blocks it, and the steps an update would run. It changes nothing.

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" update --dry-run --runtime-root "$PLANBAN_ROOT" -o json
```

`--execute` runs the direct update when the inspection allows it. `--current-board-url` names the board to reopen afterwards, and `--target-version`, `--target-ref` and `--target-commit` name the release to update to. In Claude Code, update with the plugin commands instead; see [Update Planban](/docs/updating/).

## Which commands are for recovery only?

These commands exist for migration and recovery. Use them when a recovery guide or the maintainers ask you to.

| Command | What it does |
| --- | --- |
| `export-flat-v1` | Writes a recoverable, history-backed export of the board in the older flat format, without changing the live board. Requires `--export-id <id>` (lower-case letters, numbers and hyphens). |
| `reconstruct-hierarchy` | Places existing Items into Groups in one change, from a JSON file of `{ "groups": [{ "id": ..., "childIds": [...] }] }`. Requires `--file <path>` and `--base-revision`. |
| `set-card-parent <cardId>` | Deprecated. Moves an Item into a Group (`--parent`) or to the Main Board (`--board`). Use `move-card` instead. |
