import { NextResponse, type NextRequest } from 'next/server';

/**
 * Tracking parameters appended by social networks when a link is shared.
 * Stripping them keeps canonical URLs clean and prevents accumulating
 * "Duplicate without user-selected canonical" entries in Google Search
 * Console (one was observed for `?trk=public_post_comment-text` from a
 * 2024 LinkedIn comment share).
 *
 * Deliberately NOT stripped (because these carry analytics value):
 *   - `utm_*` (utm_source/medium/campaign/term/content/id) — GA4 attribution
 *   - `gclid` — Google Ads click identifier, used by GA4 when the
 *     Google Ads link is configured
 *   - `_gl` — GA4 cross-domain linker
 *   - `mc_cid` / `mc_eid` — Mailchimp campaign + email IDs
 *   - `srsltid` — Google Shopping
 */
const TRACKING_PARAMS_TO_STRIP = [
  'trk', // LinkedIn share/comment tracker
  'fbclid', // Facebook click identifier
  'twclid', // X / Twitter click identifier
  'igshid', // Instagram share identifier
] as const;

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  let stripped = false;

  for (const param of TRACKING_PARAMS_TO_STRIP) {
    if (url.searchParams.has(param)) {
      url.searchParams.delete(param);
      stripped = true;
    }
  }

  if (stripped) {
    return NextResponse.redirect(url, 308);
  }

  return NextResponse.next();
}

export const config = {
  /**
   * Match everything except Next.js internals, static files, and OG image
   * route handlers. Avoids redirecting data fetches and asset requests.
   */
  matcher: ['/((?!api|_next/static|_next/image|og|.*\\..*).*)'],
};
