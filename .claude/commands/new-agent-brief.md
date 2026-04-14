Create a new AI agent brief from the canonical template.

Steps:
1. Read `docs/templates/agent-brief-template.md`
2. Ask the user for:
   - **Service name** — the name of the service or repo this brief covers (e.g., "coffey.codes", "api-service")
   - **Repo URL** — the GitHub repository URL (if applicable)
3. Create a new file at `docs/documentation/agents/{kebab-case-service-name}.md`
4. Fill in the frontmatter:
   - `service`: the service name provided
   - `repo`: the repo URL provided (or empty string if not applicable)
   - `updated`: today's date (YYYY-MM-DD)
5. Present the new file to the user for editing

Agent briefs are living documents. Remind the user to:
- Update the brief whenever significant changes are made to the repo
- Keep the "Known Gotchas" section current — this is the most valuable section for AI agents
- Add a link to the new brief in `docs/SUMMARY.md` under the Agent Briefs section
- Add a link in `docs/documentation/README.md` under the Agents section
