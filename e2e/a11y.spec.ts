import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const ROUTES = [
  { name: 'homepage', path: '/' },
  {
    name: 'article',
    path: '/articles/production-grade-ci-cd-with-nextjs-vercel-and-github-actions',
  },
  { name: 'case-study', path: '/case-study/postgis-fleet-optimization' },
];

for (const route of ROUTES) {
  test(`${route.name} (${route.path}) has no axe-core violations`, async ({
    page,
  }) => {
    await page.goto(route.path);
    // Wait for the network to be quiet so dynamic content has rendered.
    await page.waitForLoadState('networkidle');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    const violations = results.violations;

    if (violations.length > 0) {
      const detail = violations
        .map(
          (v) =>
            `\n  [${v.impact ?? 'unknown'}] ${v.id}: ${v.help} (${v.nodes.length} nodes)\n    ${v.helpUrl}\n${v.nodes
              .slice(0, 3)
              .map(
                (n) =>
                  `      ${n.target.join(' ')}\n        ${n.failureSummary?.replace(/\n/g, '\n        ')}`,
              )
              .join('\n')}`,
        )
        .join('\n');
      throw new Error(
        `axe found ${violations.length} violation(s) on ${route.path}:${detail}`,
      );
    }

    expect(violations).toEqual([]);
  });
}
