# docs/

This folder is the single source of truth for all project documentation, specifications, and architectural decisions for **coffey.codes**.

## Folder Rules

| Folder | Purpose | Never put here |
|--------|---------|----------------|
| `templates/` | Canonical document templates. Do not modify without review. | Project-specific content |
| `specs/plans/` | Multi-phase project plans and roadmaps | Completed work |
| `specs/active/` | Current feature and bug specs (draft → complete) | Archived work |
| `specs/adrs/` | Architecture Decision Records — permanent, never archived | Anything other than ADRs |
| `specs/archive/` | Completed or deprecated specs | Active work |
| `documentation/agents/` | AI agent briefs — repo context for Claude and other AI tools | Specs |
| `documentation/guides/` | Procedural how-to documentation | Deep technical analysis |
| `documentation/deep-dives/` | Narrow-focus technical deep dives and strategy docs | Step-by-step guides |
| `documentation/repos/` | Comprehensive repo/service technical reference | |
| `archive/` | General archive for deprecated non-spec documents | Active documents |

## Spec Lifecycle

```
draft → ready → in-progress → review-pending → complete
                                    ↓
                               deprecated (from any status)
```

- **draft** — being written, not ready for implementation
- **ready** — spec is complete and approved for development
- **in-progress** — development is underway
- **review-pending** — implementation is complete, awaiting review
- **complete** — shipped and verified
- **deprecated** — no longer relevant or superseded

ADRs are permanent records. They are never archived or deleted.

## DDD + TDD Workflow

```
1. Plan    → Understand the problem space, identify unknowns
2. Spec    → Write a spec in docs/specs/active/ (status: draft)
3. Review  → Get spec to status: ready before writing code
4. Test    → Write failing tests first (RED)
5. Implement → Make tests pass (GREEN)
6. Refactor → Clean up while keeping tests green
7. Archive → Move completed spec to docs/specs/archive/
```

## Slash Commands

Use these Claude Code commands to create new documents from canonical templates:

| Command | Creates | Destination |
|---------|---------|-------------|
| `/new-spec` | Feature spec | `docs/specs/active/` |
| `/new-bug` | Bug report | `docs/specs/active/` |
| `/new-adr` | Architecture Decision Record | `docs/specs/adrs/` |
| `/new-agent-brief` | AI agent brief | `docs/documentation/agents/` |

For detailed usage instructions, examples, and tips for each command, see the [Claude Commands Guide](documentation/guides/using-claude-commands.md).

## Common Prompts for Claude

**Start a new feature:**
> "Read docs/specs/active/SPEC-XXX-title.md and implement it. Follow the tasks checklist and update the spec status to in-progress."

**Review a spec before coding:**
> "Review docs/specs/active/SPEC-XXX-title.md. Identify any gaps in the requirements or design before I approve it."

**Update the agent brief after major changes:**
> "Read docs/documentation/agents/coffey-codes.md and update it to reflect recent changes in [area]."

**Create an ADR for a decision:**
> "Use /new-adr to document the decision to [choice]. Context: [reason]."
