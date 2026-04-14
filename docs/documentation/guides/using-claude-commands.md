# Using Claude Code Slash Commands

This project ships with four custom Claude Code slash commands that automate the most common DDD document creation tasks. Each command reads a canonical template, prompts you for required fields, and drops a correctly named file into the right folder — so you never have to remember paths, ID formats, or frontmatter schemas.

---

## What are slash commands?

Slash commands are custom prompts stored in `.claude/commands/`. When you type `/command-name` in Claude Code, Claude reads the command file and executes the instructions inside it as if you had typed them yourself. They work in the Claude Code terminal, the desktop app, and IDE extensions (VS Code, JetBrains).

The four DDD commands live at:

```
.claude/commands/
├── new-spec.md
├── new-bug.md
├── new-adr.md
└── new-agent-brief.md
```

---

## `/new-spec` — Create a feature spec

**Use when:** You are about to build a new feature or make a significant change.

### What it does

1. Reads `docs/templates/feature-template.md`
2. Asks you for a **title** and **ID** (e.g., `SPEC-002`)
3. Creates `docs/specs/active/SPEC-{ID}-{title-slug}.md` with today's date filled in
4. Opens the file for editing

### Example

```
/new-spec
```

Claude will ask:
> What is the title of this feature spec?
> What is the next available SPEC ID?

After answering, you get a pre-filled spec at `docs/specs/active/SPEC-002-contact-form-backend.md`.

### Workflow after creation

Fill in the **Problem**, **Requirements**, and **Design** sections, then change `status` from `draft` to `ready` when you are satisfied. No code should be written until the spec reaches `ready`.

---

## `/new-bug` — Create a bug report

**Use when:** You have identified a bug and want to track its investigation and fix.

### What it does

1. Reads `docs/templates/bug-template.md`
2. Asks you for a **title**, **ID** (e.g., `BUG-001`), and **severity** (P0–P3)
3. Creates `docs/specs/active/BUG-{ID}-{title-slug}.md` with today's date filled in
4. Opens the file for editing

### Severity guide

| Level | Meaning | Example |
|-------|---------|---------|
| P0 | Site down, data loss, security breach | Server returning 500 on all routes |
| P1 | Major feature broken, no workaround | Search returns no results for any query |
| P2 | Feature degraded, workaround exists | Search works but is slow |
| P3 | Minor, cosmetic, low impact | Typo in footer text |

### Example

```
/new-bug
```

Claude will ask:
> What is the title of this bug?
> What is the next available BUG ID?
> What is the severity? (P0/P1/P2/P3)

After answering, you get a pre-filled bug report at `docs/specs/active/BUG-001-search-returns-empty-results.md`.

### Workflow after creation

Fill in **Steps to Reproduce**, **Expected vs Actual Behavior**, and **Root Cause** as you investigate. Update `status` to `in-progress` when actively working on it.

---

## `/new-adr` — Create an Architecture Decision Record

**Use when:** You are making a significant technical decision that future contributors (or your future self) should understand — a library choice, an architectural pattern, a decision to NOT do something.

### What it does

1. Reads `docs/templates/adr-template.md`
2. Asks you for a **title** and **ID** (e.g., `ADR-001`)
3. Creates `docs/specs/adrs/ADR-{ID}-{title-slug}.md` with `status: proposed`
4. Opens the file for editing

### Example

```
/new-adr
```

Claude will ask:
> What is the title of this ADR? (e.g., "Use Resend for transactional email")
> What is the next available ADR ID?

After answering, you get `docs/specs/adrs/ADR-001-use-resend-for-transactional-email.md`.

### ADR Status Lifecycle

```
proposed → accepted → deprecated
                   → superseded (by a newer ADR)
```

When you change your mind later, **do not delete or edit the old ADR**. Instead:
1. Create a new ADR documenting the new decision
2. Set `superseded_by: ADR-XXX` on the old ADR
3. Set `supersedes: ADR-XXX` on the new ADR

ADRs are permanent records. They document the reasoning behind past decisions even when those decisions change.

### After creation

- Change `status` from `proposed` to `accepted` once the decision is confirmed
- Add a link to the new ADR in `docs/SUMMARY.md` under the **ADRs** section

---

## `/new-agent-brief` — Create an AI agent brief

**Use when:** You are adding a new service or repo to the project, or you want to create a dedicated context document for a service that Claude works with frequently.

### What it does

1. Reads `docs/templates/agent-brief-template.md`
2. Asks you for a **service name** and **repo URL**
3. Creates `docs/documentation/agents/{service-name}.md` with today's date
4. Opens the file for editing

### Example

```
/new-agent-brief
```

Claude will ask:
> What is the service name for this agent brief?
> What is the repo URL (if applicable)?

After answering, you get `docs/documentation/agents/my-service.md`.

### What to put in an agent brief

The most important sections are:

- **Purpose** — one paragraph on what the service does and who it serves
- **Tech Stack** — the table is the fastest way for Claude to orient to a new codebase
- **Entry Points** — key files Claude should read first
- **Known Gotchas** — footguns, non-obvious behaviors, things that caused bugs before. This is the highest-value section.

Agent briefs are **living documents**. Update them whenever you make significant changes to the repo's structure, stack, or conventions.

### After creation

- Add a link in `docs/SUMMARY.md` under **Agent Briefs**
- Add a link in `docs/documentation/README.md` under **Agents**

---

## Tips for working with Claude on specs

### Starting a session

Point Claude at the agent brief to establish context immediately:

> "Read `docs/documentation/agents/coffey-codes.md` before we start."

### Implementing a spec

> "Read `docs/specs/active/SPEC-002-contact-form-backend.md` and implement it. Follow the task checklist and update the spec status to `in-progress`."

### Reviewing a spec before coding

> "Review `docs/specs/active/SPEC-002-contact-form-backend.md`. Identify any gaps in the requirements or design."

### Updating an agent brief after big changes

> "Read `docs/documentation/agents/coffey-codes.md` and update it to reflect the changes we just made to the contact form and API route."

### Documenting a decision

> "Use `/new-adr` to document the decision to use Resend for transactional email. Context: we evaluated Resend, Postmark, and Formspree. Resend won on developer ergonomics and Next.js integration."

---

## Quick reference

| Command | Template | Output location | When to use |
|---------|----------|----------------|-------------|
| `/new-spec` | `docs/templates/feature-template.md` | `docs/specs/active/` | New feature or significant change |
| `/new-bug` | `docs/templates/bug-template.md` | `docs/specs/active/` | Bug report and investigation |
| `/new-adr` | `docs/templates/adr-template.md` | `docs/specs/adrs/` | Architectural decision to record |
| `/new-agent-brief` | `docs/templates/agent-brief-template.md` | `docs/documentation/agents/` | New service/repo context for AI |
