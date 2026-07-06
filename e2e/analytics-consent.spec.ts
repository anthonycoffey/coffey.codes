import { test, expect, type Page, type Request } from '@playwright/test';

// Mission-critical guardrail for GA4 tracking. This is the regression class that
// silently killed analytics for ~6 weeks (ADR-005/006) and the geo-consent +
// race hardening from ADR-007. The JSDOM unit tests cannot observe a real GA
// hit; this runs in a real browser against the preview deploy where GTM actually
// loads and builds the collect request.
//
// GA4 property is shared between preview and production (GTM-KJC6Q389 →
// G-MV8YG7QQW0 is hard-coded), so we INTERCEPT the collect endpoint: we capture
// the request the tag builds (to assert its consent signal) and fulfill a 204
// locally, so CI traffic never reaches the real property.

const GTM_ID = 'GTM-KJC6Q389';
const MEASUREMENT_ID = 'G-MV8YG7QQW0';
const COLLECT_GLOB = '**/g/collect*';

type Collected = { url: URL };

/** Intercept GA collect hits: capture them, answer 204, never forward. */
async function captureCollect(page: Page): Promise<Collected[]> {
  const hits: Collected[] = [];
  await page.route(COLLECT_GLOB, (route, request: Request) => {
    hits.push({ url: new URL(request.url()) });
    return route.fulfill({ status: 204, body: '' });
  });
  return hits;
}

type DataLayerCommand = [string, string, Record<string, unknown>];

/** Read the consent commands the page pushed to window.dataLayer. */
async function consentCommands(page: Page): Promise<DataLayerCommand[]> {
  return page.evaluate(() => {
    const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
    return dl
      .map((e) => {
        try {
          return Array.from(e as ArrayLike<unknown>);
        } catch {
          return e;
        }
      })
      .filter(
        (e): e is DataLayerCommand =>
          Array.isArray(e) && e[0] === 'consent',
      ) as DataLayerCommand[];
  });
}

test.describe('GA4 consent + tracking contract', () => {
  test('emits geo-scoped Consent Mode defaults and fires a GA collect hit', async ({
    page,
  }) => {
    const hits = await captureCollect(page);
    // Use a light page (no three.js loader) so requestIdleCallback — which gates
    // the GTM load — is not starved by the homepage render loop. The geo
    // defaults live in the root layout, so they are identical on every page.
    await page.goto('/contact');

    // The inline <head> script must push two `consent default` commands. This is
    // in the dataLayer synchronously, before GTM — no waiting needed.
    const defaults = (await consentCommands(page)).filter(
      (c) => c[1] === 'default',
    );
    expect(defaults.length).toBe(2);

    const global = defaults.find((c) => !c[2].region);
    const region = defaults.find((c) => c[2].region);
    // Global: analytics granted, ads denied.
    expect(global?.[2].analytics_storage).toBe('granted');
    expect(global?.[2].ad_storage).toBe('denied');
    // Region-scoped (EEA/UK/CH): analytics denied.
    expect(region?.[2].analytics_storage).toBe('denied');
    expect(region?.[2].region).toEqual(expect.arrayContaining(['DE', 'GB', 'CH']));

    // The GTM container loads (on idle) and GA4 sends a page_view for our
    // measurement ID. Generous timeout: the container is deferred to idle.
    await expect
      .poll(
        () => hits.some((h) => h.url.searchParams.get('tid') === MEASUREMENT_ID),
        {
          timeout: 30000,
          message: `no GA collect hit for ${MEASUREMENT_ID} (GTM ${GTM_ID}) — tag not firing`,
        },
      )
      .toBe(true);
  });

  test('re-asserts a returning visitor\'s stored grant before the first hit (race fix)', async ({
    page,
  }) => {
    // Seed a prior "accepted" choice BEFORE any page script runs.
    await page.addInitScript(() => {
      window.localStorage.setItem('google-consent', 'accepted');
    });
    await captureCollect(page);
    // On the HOMEPAGE specifically — the page whose three.js loader used to gate
    // the (old, component-based) re-assert. We do NOT dismiss the loader or touch
    // the banner: the inline head script must re-assert the grant on its own.
    await page.goto('/');

    // The head script pushed a `consent update` (granted) synchronously, before
    // GTM — present in the dataLayer independent of the loader/banner. This is
    // the mechanism of the race fix.
    const update = (await consentCommands(page)).find((c) => c[1] === 'update');
    expect(update?.[2].analytics_storage).toBe('granted');

    // End-to-end: once GTM initializes (on idle), it resolves analytics_storage
    // to granted from that queued update — no click required.
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const ics = (
              window as unknown as {
                google_tag_data?: {
                  ics?: { entries?: Record<string, { update?: boolean }> };
                };
              }
            ).google_tag_data?.ics?.entries;
            return ics?.analytics_storage?.update === true;
          }),
        { timeout: 30000 },
      )
      .toBe(true);
  });

  test('accepting the banner grants analytics and sets the _ga cookie', async ({
    page,
    context,
  }) => {
    await captureCollect(page);
    // Use /contact (no three.js loader) so the banner surfaces directly.
    await page.goto('/contact');

    await page.getByRole('button', { name: /accept/i }).click();

    // gtag resolves analytics_storage to granted...
    await expect
      .poll(() =>
        page.evaluate(() => {
          const ics = (
            window as unknown as {
              google_tag_data?: {
                ics?: { entries?: Record<string, { update?: boolean }> };
              };
            }
          ).google_tag_data?.ics?.entries;
          return ics?.analytics_storage?.update === true;
        }),
      )
      .toBe(true);

    // ...and GA sets its identity cookie (the ADR-005 symptom was NO _ga cookie
    // even after clicking Accept).
    await expect
      .poll(async () =>
        (await context.cookies()).some((c) => c.name.startsWith('_ga')),
        { timeout: 10000 },
      )
      .toBe(true);
  });

  test('pushes form_submit to the dataLayer on a successful lead submit', async ({
    page,
  }) => {
    await page.route('**/functions/sendContactFormEmail', (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: '{}' }),
    );
    await page.goto('/lp/practical-ai');

    await page.getByLabel(/name/i).fill('Ada Lovelace');
    await page.getByLabel(/email/i).fill('ada@example.com');
    await page
      .getByLabel(/project brief/i)
      .fill('Need an internal analytics dashboard.');
    await page.getByLabel(/project stage/i).selectOption('Prototype / MVP');
    await page.getByLabel(/timeline/i).selectOption('1-3 months');
    await page.getByLabel(/budget/i).selectOption('$15k - $50k');
    await page.getByLabel(/consent to contact/i).check();
    await page.getByRole('button', { name: /send message/i }).click();

    await expect(page.getByText(/your message has been sent/i)).toBeVisible();

    const hasFormSubmit = await page.evaluate(() => {
      const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer ?? [];
      return dl.some(
        (e) =>
          e &&
          typeof e === 'object' &&
          (e as { event?: string }).event === 'form_submit',
      );
    });
    expect(hasFormSubmit).toBe(true);
  });
});
