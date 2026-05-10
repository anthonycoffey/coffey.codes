import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.mock('next/og', () => ({
  ImageResponse: vi.fn(function MockImageResponse(this: object) {
    return new Response('mock', { status: 200 }) as unknown as Response;
  }),
}));

import { GET } from '@/app/og/route';
import { ImageResponse } from 'next/og';

beforeEach(() => {
  vi.mocked(ImageResponse).mockClear();
  vi.mocked(ImageResponse).mockImplementation(
    function MockImageResponse(this: object) {
      return new Response('mock', { status: 200 }) as unknown as Response;
    },
  );
});

const findTextInElement = (
  el: React.ReactElement,
  predicate: (s: string) => boolean,
): string | undefined => {
  const html = renderToStaticMarkup(el);
  const match = html.match(/>([^<]+)</g);
  if (!match) return undefined;
  for (const m of match) {
    const text = m.slice(1, -1);
    if (predicate(text)) return text;
  }
  return undefined;
};

describe('GET /og', () => {
  it('uses default title when no title param is provided', async () => {
    const res = await GET(new Request('http://localhost/og'));
    expect(res.status).toBe(200);
    expect(vi.mocked(ImageResponse)).toHaveBeenCalledOnce();
    const [element] = vi.mocked(ImageResponse).mock.calls[0];
    const text = findTextInElement(
      element as React.ReactElement,
      (s) => /Anthony Coffey/i.test(s),
    );
    expect(text).toBeDefined();
  });

  it('uses provided title param', async () => {
    const res = await GET(
      new Request('http://localhost/og?title=Hello%20World'),
    );
    expect(res.status).toBe(200);
    const [element] = vi.mocked(ImageResponse).mock.calls[0];
    const text = findTextInElement(
      element as React.ReactElement,
      (s) => s === 'Hello World',
    );
    expect(text).toBe('Hello World');
  });

  it('truncates titles longer than 120 characters', async () => {
    const longTitle = 'x'.repeat(500);
    const res = await GET(
      new Request(`http://localhost/og?title=${longTitle}`),
    );
    expect(res.status).toBe(200);
    const [element] = vi.mocked(ImageResponse).mock.calls[0];
    const text = findTextInElement(
      element as React.ReactElement,
      (s) => s.startsWith('xxxx'),
    );
    expect(text).toBeDefined();
    expect(text!.length).toBe(120);
  });

  it('returns a redirect to /og-image.jpg when ImageResponse throws', async () => {
    vi.mocked(ImageResponse).mockImplementationOnce(() => {
      throw new Error('boom');
    });

    const res = await GET(new Request('http://localhost/og?title=trigger'));
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toMatch(/\/og-image\.jpg$/);
  });
});
