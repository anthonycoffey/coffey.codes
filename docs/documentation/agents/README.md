# How to Work with AI Agents

This guide explains how to use the docs repository to work with AI agents (Claude, Codex, etc.) for development tasks.

## Quick Start

When starting any task with an agent, point them to docs first:

```
Read docs/documentation/agents/[repo-name].md before starting.
```

That's it. The agent file contains links to everything else they need.

## Documentation

| Content            | Location                                  | Purpose                                                       |
| ------------------ | ----------------------------------------- | ------------------------------------------------------------- |
| Agent instructions | `documentation/agents/`                   | Entry point for agents — cross-repo interfaces, API contracts |
| How we work        | `documentation/development-standards.md`  | Development process, TDD practices, conventions               |
| Repo overviews     | `documentation/repos/coffey-codes.md`     | Detailed docs — architecture, commands, concepts              |
| System overview    | `documentation/guides/system-overview.md` | How all repos fit together                                    |
| Specs & plans      | `specs/plans/`                            | What to build — requirements, design, acceptance criteria     |
| ADRs               | `specs/adrs/`                             | Architecture Decision Records — permanent                     |
| Templates          | `templates/`                              | Starting point for new specs and ADRs                         |

## Workflow: New Feature

### 1. Write the Spec

```bash
cd docs
cp templates/feature-template.md specs/plans/SPEC-XXX-feature-name.md
# Edit the spec with requirements
git add specs/plans/SPEC-XXX-feature-name.md && git commit -m "docs(SPEC-XXX): add feature spec" && git push
```

### 2. Prompt the Agent

```
## Task
Implement SPEC-XXX: [Feature Name]

## Context
Read these files first:
1. docs/documentation/agents/[repo-name].md (agent instructions)
2. docs/specs/plans/SPEC-XXX-feature-name.md (the spec)

## Rules
- Follow TDD: write failing tests first
- Add REQ-ID comments for traceability
- Do not commit or push without asking
```

### 3. Review and Iterate

Agent implements → you review → agent fixes → repeat until done.

### 4. Close the Loop

```bash
cd docs
# Edit specs/plans/SPEC-XXX-feature-name.md, change status to "review-pending"
git add specs/plans/SPEC-XXX-feature-name.md && git commit -m "docs(SPEC-XXX): mark as review-pending" && git push
```

## Workflow: Bug Fix

### 1. Write the Spec

```bash
cd docs
cp templates/bug-template.md specs/plans/SPEC-XXX-bug-name.md
# Edit with reproduction steps, expected behavior
git add specs/plans/SPEC-XXX-bug-name.md && git commit -m "docs(SPEC-XXX): add bug spec" && git push
```

### 2. Prompt the Agent

```
## Task
Fix SPEC-XXX: [Bug Name]

## Context
Read these files first:
1. docs/documentation/agents/[repo-name].md (agent instructions)
2. docs/specs/plans/SPEC-XXX-bug-name.md (the spec)

## Rules
- Write a failing test that reproduces the bug first
- Fix the bug
- Verify test passes
- Do not commit or push without asking
```

## Workflow: Documentation Update

```
## Task
Update documentation to reflect [changes made]

## Context
1. docs/documentation/repos/[repo-name].md (doc to update)
2. [repo-name]/ (codebase to verify against)

## Rules
- Verify all commands, paths, and structures against actual code
- Do not commit or push without asking
```

## Prompt Templates

### Simple Task

```
Read docs/documentation/agents/[repo-name].md then [describe task].

Do not commit without asking.
```

### Task with Spec

```
Implement docs/specs/plans/SPEC-XXX.md

Read docs/documentation/agents/[repo-name].md first.

Follow TDD. Do not commit without asking.
```

### Review Task

```
Review [file or folder] for [accuracy/completeness/bugs].

Compare against [source of truth].

Do not make edits—review only.
```

## Tips

### Be Specific
Vague prompts lead to vague results. Always point to specific files, lines, or commands.

### Point to Files, Not Descriptions
Agents can't infer structure from prose. Always link to the actual file or code to modify.

### Set Boundaries
Be explicit about what the agent can and cannot do. For example, "Do not create new files outside established patterns without asking."

Always include:

- "Do not commit without asking"
- "Do not create new files outside established patterns without asking"
- "Ask if requirements are unclear"

### One Task at a Time

Break large tasks into smaller specs. Agents work better with focused scope.

### Review Everything

Never auto-approve commits. Always review diffs before pushing.



## Common Prompts

### Start of Session

```
Read docs/documentation/agents/[repo-name].md and docs/documentation/development-standards.md. Let me know when ready.
```

### Check Understanding

```
Before implementing, explain your plan. What files will you modify? What tests will you write?
```

### Course Correct

```
Stop. That approach won't work because [reason]. Instead, [alternative approach].
```

### Wrap Up

```
Show me a summary of all changes made. Do not commit yet.
```
