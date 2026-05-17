# @anthonycoffey/periscope

SEO data tooling. A unified CLI over a set of project-configurable engines.

Look at the SERPs from a hidden vantage. Your repo is the vantage. The SERPs are the surface.

## What it does

| Command | What it does |
| --- | --- |
| `periscope snapshot` | Pull a multi-engine SEO snapshot (GSC, GA4, Bing, Google Ads Keyword Planner) and write JSON + Markdown to `outputDir` |
| `periscope diff <older> <newer>` | Diff two snapshot JSONs; show per-engine deltas, movers, fallers |
| `periscope audit articles` | Walk MDX articles; flag `OPPORTUNITY` vs `WELL_TARGETED` keyword fit |
| `periscope discover topics` | Seed Ads with categories + top GSC queries to surface editorial backlog |
| `periscope validate lps` | Validate `/lp/*` pages: `UNDER_INVESTED` / `WELL_TARGETED` / `OVER_AMBITIOUS` verdicts |
| `periscope probe <url>` | One-shot competitor URL probe; top 30 keyword ideas to stdout |
| `periscope doctor [engine]` | Diagnose engine credentials and access (currently: `ads`) |

## Status

**1.0.0 — stable.** Phase A is complete. The package ships every capability the legacy `scripts/seo-*.mjs` + `scripts/keyword-*.mjs` files provided, plus a config layer, types, tests, and the `doctor` diagnostic command. Originally driven by [SPEC-023](../../docs/specs/archive/SPEC-023-periscope-tool-suite.md).

From 1.0.0 forward, the CLI surface, config schema, and exported library functions follow [semver](https://semver.org/):

- **patch** (`1.0.x`) — bug fixes, doc updates, internal refactors
- **minor** (`1.x.0`) — new commands, new config fields, new engines (additive)
- **major** (`2.0.0`) — breaking changes to CLI flags, config schema, snapshot JSON shape, or the lib surface

Consumers can pin with `^1.0.0` and rely on `npm update` for non-breaking changes. Phase B (extract to own repo) is the next milestone, tracked separately.

## Install (from source, for periscope development)

```bash
cd tooling/periscope
npm install
npm run build
```

The CLI is available at `tooling/periscope/dist/cli.js`. The coffey.codes root `package.json` has `seo:*` npm scripts that delegate to it.

## Install (from GitHub Packages)

The package publishes to [GitHub Packages](https://github.com/anthonycoffey/coffey.codes/pkgs/npm/periscope) under the `@anthonycoffey` scope. Visibility is **private**, so consumers need a Personal Access Token with `read:packages` scope.

### One-time setup in a consuming project

1. Create a PAT at https://github.com/settings/tokens with the `read:packages` scope. Copy the token.
2. Add an `.npmrc` to the consuming project root (and to `.gitignore` — never commit the token):

   ```ini
   @anthonycoffey:registry=https://npm.pkg.github.com
   //npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}
   ```

3. Set the env var: `export GITHUB_PACKAGES_TOKEN=<your-pat>` (or use a `.env` file your shell loads).

### Install

```bash
npm install @anthonycoffey/periscope
```

### Verify

```bash
npx periscope --help
```

## Publishing new versions

Two ways, both via the [periscope-publish workflow](../../.github/workflows/periscope-publish.yml):

1. **Manual (during Phase A iteration).** GitHub UI: Actions → "Publish @anthonycoffey/periscope" → Run workflow → pick the branch.
2. **Tag-based (releases).** Bump version in `tooling/periscope/package.json`, commit, then `git tag periscope-v0.1.0 && git push origin periscope-v0.1.0`. Workflow runs, publishes, summary in the Actions run.

The workflow uses `GITHUB_TOKEN` (auto-granted `packages:write` via `permissions:` in the workflow). No PATs needed for publishing.

## Config

Drop a `periscope.config.ts` (or `.mjs` / `.json`) at your project root. Schema validated by zod at load.

```ts
import type { PeriscopeConfig } from '@anthonycoffey/periscope/types';

const config: PeriscopeConfig = {
  siteUrl: 'sc-domain:coffey.codes',
  ga4PropertyId: '416080229',
  outputDir: 'docs/strategy/data',
  articles: {
    dir: 'app/(site)/articles/posts',
  },
  landingPages: {
    dir: 'app/lp',
    pageFile: 'page.tsx',
    brandSuffix: ' | Anthony Coffey',
  },
  categories: [
    'Web Development',
    'Mobile Development',
    'Cloud & DevOps',
    'Software Engineering',
    'Tools & Productivity',
  ],
};

export default config;
```

Examples for different project shapes live in `examples/`.

## Engines and auth

| Engine | Auth | Env var(s) |
| --- | --- | --- |
| Google Search Console | Service account | `GSC_SERVICE_ACCOUNT_KEY_PATH` or `GSC_SERVICE_ACCOUNT_JSON` |
| GA4 | Same service account, Viewer on the property | `GA4_PROPERTY_ID` (or `ga4PropertyId` in config) |
| Bing Webmaster Tools | API key | `BING_WEBMASTER_API_KEY` |
| Google Ads Keyword Planner | Same service account + dev token | `GOOGLE_ADS_DEVELOPER_TOKEN`, `GOOGLE_ADS_CUSTOMER_ID`, `GOOGLE_ADS_LOGIN_CUSTOMER_ID` |

See the [seo-snapshot-setup guide](../../docs/documentation/guides/seo-snapshot-setup.md) for full setup, including the Google Cloud one-time wiring and Bing API key generation.

## Development

```bash
npm run build      # tsup, produces dist/
npm run dev        # tsup --watch
npm test           # vitest run
npm run test:watch # vitest watch mode
npm run typecheck  # tsc --noEmit
```

## License

MIT. Same as the parent coffey.codes repo.
