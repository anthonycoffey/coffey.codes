// Synthetic production monitor for GA4 tracking (SPEC-034).
//
// Loads production in a real browser and asserts the whole tracking chain still
// works end to end: the inline Consent Mode default is present before GTM, the
// GTM container + GA4 tag load, a collect hit fires for the measurement ID, and
// an explicit banner grant resolves analytics to granted with a `_ga` cookie.
//
// This is the drift alarm the ADR-005 outage lacked: the tag can silently stop
// counting (a consent-serialization mistake, a container change, a deploy
// regression) while the site looks fine. A scheduled run of this script pages us
// within the hour instead of six weeks later.
//
// GA collect hits are intercepted and answered locally (204) so the monitor
// never pollutes the shared GA4 property with synthetic traffic.
//
// Env:
//   MONITOR_URL         target origin (default https://coffey.codes)
//   SLACK_WEBHOOK_URL    Slack Incoming Webhook; alerts POST here on failure
//   VERCEL_AUTOMATION_BYPASS_SECRET  optional, for protected preview URLs
//   MONITOR_HEARTBEAT    if "1", also posts a success ping to Slack
//
// Exit code 0 = healthy, 1 = one or more checks failed (and alerted).

import { chromium } from '@playwright/test';

const TARGET = process.env.MONITOR_URL ?? 'https://coffey.codes';
const MEASUREMENT_ID = 'G-MV8YG7QQW0';
const GTM_ID = 'GTM-KJC6Q389';
const SLACK = process.env.SLACK_WEBHOOK_URL;
const BYPASS = process.env.VERCEL_AUTOMATION_BYPASS_SECRET;

const failures = [];
const check = (label, ok, detail = '') => {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
    failures.push(detail ? `${label} — ${detail}` : label);
  }
};

async function postSlack(text) {
  if (!SLACK) {
    console.error('SLACK_WEBHOOK_URL not set — cannot alert');
    return;
  }
  try {
    const res = await fetch(SLACK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) console.error(`Slack POST failed: ${res.status}`);
  } catch (err) {
    console.error('Slack POST threw:', err);
  }
}

async function run() {
  const browser = await chromium.launch();
  const context = await browser.newContext(
    BYPASS ? { extraHTTPHeaders: { 'x-vercel-protection-bypass': BYPASS } } : {},
  );
  const page = await context.newPage();

  const collectHits = [];
  await page.route('**/g/collect*', (route, request) => {
    collectHits.push(new URL(request.url()));
    return route.fulfill({ status: 204, body: '' });
  });

  try {
    await page.goto(TARGET, { waitUntil: 'load', timeout: 30000 });

    // 1. The inline Consent Mode default is present (ADR-006/007).
    const inline = await page.evaluate(
      () => document.getElementById('consent-default')?.textContent ?? '',
    );
    check('inline consent-default script present', inline.includes("gtag('consent','default'"));
    check(
      'global default grants analytics',
      inline.includes('"analytics_storage":"granted"'),
    );
    check(
      'region-scoped default present (EEA/UK/CH)',
      inline.includes('"region":[') && inline.includes('"GB"'),
    );

    // 2. GTM + GA4 tag load and a collect hit fires for our measurement ID.
    await page
      .waitForRequest(
        (r) => r.url().includes('googletagmanager.com/gtm.js'),
        { timeout: 15000 },
      )
      .catch(() => {});
    await page
      .waitForRequest((r) => r.url().includes('/g/collect'), { timeout: 15000 })
      .catch(() => {});
    check(`GTM container ${GTM_ID} loaded`, await page.evaluate(
      () => [...document.scripts].some((s) => (s.src || '').includes('gtm.js')),
    ));
    check(
      `GA4 collect hit fired for ${MEASUREMENT_ID}`,
      collectHits.some((u) => u.searchParams.get('tid') === MEASUREMENT_ID),
      `${collectHits.length} collect hit(s) seen`,
    );

    // 3. Explicit grant works (the ADR-005 outage: Accept set no _ga cookie).
    //    /contact has no three.js loader, so the banner surfaces directly.
    await page.goto(`${TARGET.replace(/\/$/, '')}/contact`, {
      waitUntil: 'load',
      timeout: 30000,
    });
    // The banner is lazily mounted on idle — wait for it rather than probing
    // synchronously (that was a monitor false-negative, not a site failure).
    const accept = page.getByRole('button', { name: /accept/i }).first();
    let banner = true;
    try {
      await accept.waitFor({ state: 'visible', timeout: 15000 });
      await accept.click();
    } catch {
      banner = false;
    }
    check('consent banner Accept button present on /contact', banner);
    await page.waitForTimeout(2500);

    const granted = await page.evaluate(() => {
      const ics = window.google_tag_data?.ics?.entries;
      return ics?.analytics_storage?.update === true;
    });
    check('accepting the banner resolves analytics_storage to granted', granted);

    const gaCookie = (await context.cookies()).some((c) => c.name.startsWith('_ga'));
    check('GA identity cookie (_ga) set after grant', gaCookie);
  } catch (err) {
    check('monitor completed without throwing', false, String(err?.message ?? err));
  } finally {
    await browser.close();
  }
}

await run();

if (failures.length) {
  const text =
    `:rotating_light: *GA4 tracking monitor failed* for ${TARGET}\n` +
    failures.map((f) => `• ${f}`).join('\n') +
    `\n_Runbook: docs/specs/adrs/ADR-005..007, docs/strategy/ga4-events.md_`;
  await postSlack(text);
  console.error(`\nMONITOR FAILED: ${failures.length} check(s) failed`);
  process.exit(1);
}

if (process.env.MONITOR_HEARTBEAT === '1') {
  await postSlack(`:white_check_mark: GA4 tracking monitor healthy for ${TARGET}`);
}
console.log('\nMONITOR OK: all checks passed');
