/**
 * periscope.config — coffey.codes
 *
 * Consumed by @anthonycoffey/periscope's CLI commands. Loaded via
 * dynamic import; default export is the config object. Validated by
 * zod at load time.
 *
 * Using .mjs instead of .ts so Node can import without the
 * --experimental-strip-types flag.
 */

/** @type {import('@anthonycoffey/periscope/lib/config').PeriscopeConfig} */
const config = {
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
