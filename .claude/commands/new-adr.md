Create a new Architecture Decision Record (ADR) from the canonical template.

Steps:
1. Read `docs/templates/adr-template.md`
2. Ask the user for:
   - **Title** — short description of the decision (e.g., "Use Resend for transactional email")
   - **ID** — next available ADR number (e.g., ADR-001). Check `docs/specs/adrs/` for existing IDs.
3. Create a new file at `docs/specs/adrs/ADR-{ID}-{kebab-case-title}.md`
4. Fill in the frontmatter:
   - `id`: the ADR ID provided
   - `title`: the title provided
   - `status`: `proposed`
   - `date`: today's date (YYYY-MM-DD)
   - `deciders`: ["Anthony Coffey"]
   - Leave `supersedes` and `superseded_by` empty
5. Present the new file to the user for editing

Important reminders about ADRs:
- ADRs are **permanent records** — never delete or archive them
- Status transitions: `proposed` → `accepted` | `deprecated` | `superseded`
- If a decision is reversed, create a new ADR and set `superseded_by` on the old one
- Add a link to the new ADR in `docs/SUMMARY.md` under the ADRs section
