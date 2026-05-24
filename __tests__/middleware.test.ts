import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware } from '@/middleware';

function makeRequest(url: string): NextRequest {
  return new NextRequest(new URL(url));
}

describe('middleware — tracking-param stripping', () => {
  // Verifies the "enterprise-grade SEO hygiene" behavior of stripping
  // social-network click identifiers before they create duplicate URLs.
  // GSC URL inspection (2026-05-23) flagged
  // `/?trk=public_post_comment-text` as "Duplicate without user-selected
  // canonical". This middleware prevents accumulation of similar.

  it('passes through requests with no tracking params', () => {
    const req = makeRequest('https://coffey.codes/articles/some-post');
    const res = middleware(req);
    // NextResponse.next() returns a 200-ish pass-through response, not a redirect.
    expect(res.status).not.toBe(308);
    expect(res.headers.get('location')).toBeNull();
  });

  it('passes through requests that only have UTM params (analytics, preserved)', () => {
    const req = makeRequest(
      'https://coffey.codes/articles/foo?utm_source=newsletter&utm_medium=email',
    );
    const res = middleware(req);
    expect(res.status).not.toBe(308);
  });

  it('passes through requests with gclid (Google Ads attribution, preserved)', () => {
    const req = makeRequest('https://coffey.codes/?gclid=abc123');
    const res = middleware(req);
    expect(res.status).not.toBe(308);
  });

  it('308-redirects when ?trk is present, stripping only that param', () => {
    const req = makeRequest(
      'https://coffey.codes/?trk=public_post_comment-text',
    );
    const res = middleware(req);

    expect(res.status).toBe(308);
    const location = res.headers.get('location');
    expect(location).toBeTruthy();
    expect(location).not.toContain('trk=');
    // Path preserved.
    expect(location).toContain('https://coffey.codes/');
  });

  it('308-redirects on ?fbclid', () => {
    const req = makeRequest(
      'https://coffey.codes/articles/foo?fbclid=IwAR0xyz',
    );
    const res = middleware(req);

    expect(res.status).toBe(308);
    expect(res.headers.get('location')).not.toContain('fbclid');
    expect(res.headers.get('location')).toContain('/articles/foo');
  });

  it('strips all tracking params when several are present at once', () => {
    const req = makeRequest(
      'https://coffey.codes/articles/foo?trk=a&fbclid=b&twclid=c&igshid=d',
    );
    const res = middleware(req);

    expect(res.status).toBe(308);
    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('trk=');
    expect(location).not.toContain('fbclid=');
    expect(location).not.toContain('twclid=');
    expect(location).not.toContain('igshid=');
  });

  it('preserves UTM params while stripping tracking params on the same URL', () => {
    const req = makeRequest(
      'https://coffey.codes/articles/foo?utm_source=linkedin&trk=share',
    );
    const res = middleware(req);

    expect(res.status).toBe(308);
    const location = res.headers.get('location') ?? '';
    expect(location).not.toContain('trk=');
    expect(location).toContain('utm_source=linkedin');
  });
});
