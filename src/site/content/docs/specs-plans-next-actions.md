---
title: "Specs, Plans and next actions | Planban docs"
description: "What goes on a Planban card, what a Spec and a Plan hold, when an Item gets a Plan, what makes a good next action, where the files live, and how agents edit them safely."
path: /docs/specs-plans-next-actions/
updated: 2026-09-30
sources: plugins/planban/skills/planban/references/planban-house-style.md (Information locations and ownership, Title, Summary, Next action, Spec, Plan); PRODUCT.md (principle 4); plugins/planban/mcp/server.mjs (planban_create_card, planban_read_doc, planban_write_doc); src/core/storage.ts (createCard, defaultSpecMarkdown, docPathForItem, readDoc, writeDoc); src/core/paths.ts (itemRoot); src/web/main.tsx; README.md (Local Storage)
---

# Specs, Plans and next actions

Every Planban Item carries a summary and a next action on its card, a Spec document that records its purpose, scope and acceptance, and, when the work needs one, a Plan document that sets out how it will be delivered and verified.

The card is for you to read at a glance. The documents hold the detail an agent needs to do the work safely. Each kind of information has one home, so nothing needs to be repeated.

## What goes on the card itself?

| Field | What it holds |
| --- | --- |
| Title | One stable, recognisable outcome, not a status report |
| Summary | What is true now, what scope that covers, and what remains or blocks it |
| Next action | The immediate step, who takes it when that matters, and when to stop |
| Group objective | For a Group: why its Items belong together and the larger outcome they produce |

Tags and metadata hold structured values, not prose. Status and priority come from the card's column and position; see [Status and priority](/docs/status-and-priority/). A summary does not rely on the column to say how far the work has got.

## What is a Spec?

A Spec is a Markdown document that says why the Item exists and what done looks like. It records the purpose, the target outcome (or, once accepted, the delivered outcome), the current state, the remaining work, and related work that lives elsewhere. It then keeps an agent reference: scope, decisions, constraints, edge cases, acceptance criteria, verification, rollback and authoritative links.

Every Item gets a Spec when it is created. If none is supplied, Planban writes a draft with Purpose, Target outcome, Current state and Agent reference sections for the agent or you to fill in. A Spec names the section that is current, so older text cannot be mistaken for today's instructions.

## What is a Plan, and when does an Item get one?

A Plan is a Markdown document that sets out how the work will be delivered and checked. It starts with a short **Plan status** block: the current phase, the phases already done, the next gate, and the point at which to stop or ask you. Then comes the runbook: ordered steps, one completion check per step, exact verification and rollback, and the approvals needed.

An Item gets a Plan only when the work is complex enough to need one. Planban creates the Plan document when an agent or you supply one, not by default. A Plan does not repeat the Spec's purpose or acceptance criteria.

## What makes a good next action?

A good next action names one executable step, the actor when it matters, any gate, and the condition for stopping. For example: "Run the migration on staging, then stop for owner review of the row counts." For work waiting on your review, it says what you are reviewing and what happens after you accept or reject it.

Avoid a backlog, a history recap or a vague "continue". If an Item is waiting on something else, say so: "Do not start until the API change ships." For completed work, "No active action in this Item" is enough.

## Where are Spec and Plan files stored?

Specs and Plans live on your machine, outside your repository, with the rest of the board:

```output
~/.planban/repos/<repo-id>/items/<card-id>/spec.md
~/.planban/repos/<repo-id>/items/<card-id>/plan.md
```

Open a card on the board to read and edit its Spec and Plan. Planban keeps earlier versions in the board's history. See [Where Planban stores your data](/docs/data-storage/).

## How do agents read and write them safely?

Agents use `planban_read_doc` and `planban_write_doc` with the card id and `kind` set to `spec` or `plan`. A read returns the Markdown and the file's modification time (`mtimeMs`). A write replaces the whole document.

To avoid overwriting a change made in the meantime, an agent passes the `mtimeMs` it read as `expectedMtimeMs`. If the file changed after that read, the write fails with `Document changed on disk. Reload before saving.` and the agent reads it again. The board's editor uses the same check when you save.

Before creating or materially editing a title, summary, next action, Group objective, Spec or Plan, agents read the Planban house style that ships with the plugin skills and follow it. From the CLI, `read-doc` reads a document and `write-doc` replaces one from a file or standard input, without the modification-time check:

```bash
node "$PLANBAN_ROOT/bin/planban.mjs" read-doc <card-id> spec --cwd /path/to/repo -o json
```
