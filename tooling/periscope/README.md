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

## Status

**Phase A, in development.** This package lives inside `coffey.codes` at `tooling/periscope/` and ports the existing `scripts/seo-*.mjs` + `scripts/keyword-*.mjs` files into a typed, unified, config-driven package. Driven by [SPEC-023](../../docs/specs/active/SPEC-023-periscope-tool-suite.md).

Once parity against coffey.codes is proven, Phases B (extract to own repo) and C (publish to GitHub Packages) follow under their own SPECs.

## Install (during Phase A)

```bash
cd tooling/periscope
npm install
npm run build
```

The CLI is available at `tooling/periscope/dist/cli.js`. The coffey.codes root `package.json` has `seo:*` npm scripts that delegate to it.

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
