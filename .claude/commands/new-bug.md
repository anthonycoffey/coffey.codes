Create a new bug report from the canonical template.

Steps:
1. Read `docs/templates/bug-template.md`
2. Ask the user for:
   - **Title** — short descriptive name for the bug
   - **ID** — next available BUG number (e.g., BUG-001). Check `docs/specs/active/` and `docs/specs/archive/` for existing IDs to avoid collisions.
   - **Severity** — P0 (site down/data loss), P1 (major feature broken), P2 (degraded, workaround exists), or P3 (minor/cosmetic)
3. Create a new file at `docs/specs/active/BUG-{ID}-{kebab-case-title}.md`
4. Fill in the frontmatter:
   - `id`: the BUG ID provided
   - `title`: the title provided
   - `status`: `draft`
   - `severity`: the severity provided
   - `created`: today's date (YYYY-MM-DD)
   - `author`: Anthony Coffey
   - Leave `reviewers` and `affected_repos` as empty arrays
5. Present the new file to the user for editing

Severity guide:
- **P0** — Site down / data loss / security breach — fix immediately
- **P1** — Major feature broken, no workaround
- **P2** — Feature degraded, workaround exists
- **P3** — Minor issue, cosmetic, low impact
