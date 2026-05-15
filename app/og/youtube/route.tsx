import { ImageResponse } from 'next/og';

const DEFAULT_TITLE = 'My Digital Marketing Strategy Explained';
const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 40;

// Localhost-only thumbnail generator. The two guards below make the route
// return 404 anywhere other than `npm run dev` on this machine.
export function GET(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return new Response('Not Found', { status: 404 });
  }
  const host = request.headers.get('host') || '';
  if (!host.startsWith('localhost') && !host.startsWith('127.0.0.1')) {
    return new Response('Not Found', { status: 404 });
  }

  try {
    const url = new URL(request.url);
    const origin = url.origin;
    const bgUrl = `${origin}/youtube-og-meta-base.svg`;

    const rawTitle = url.searchParams.get('title') || DEFAULT_TITLE;
    const title = rawTitle.slice(0, MAX_TITLE_LENGTH);

    const categories = url.searchParams
      .getAll('category')
      .map((c) => c.slice(0, MAX_CATEGORY_LENGTH).trim())
      .filter(Boolean);
    const categoryText = categories.join(' · ');

    const titleFontSize = title.length > 80 ? 76 : title.length > 50 ? 92 : 112;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            display: 'flex',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt=""
            width={1280}
            height={720}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1280,
              height: 720,
            }}
          />

          {/* Slate-navy tint at lower opacity than /og so the logomark
              and brand colors stay prominent behind the text. */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1280,
              height: 720,
              display: 'flex',
              background: 'rgba(15, 23, 42, 0.35)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 56,
              left: 64,
              right: 64,
              display: 'flex',
              flexDirection: 'column',
              gap: 32,
            }}
          >
            {categoryText ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 44,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.95)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                }}
              >
                {categoryText}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                fontSize: titleFontSize,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
                textShadow: '0 2px 16px rgba(0,0,0,0.5)',
              }}
            >
              {title}
            </div>
          </div>

        </div>
      ),
      {
        width: 1280,
        height: 720,
      },
    );
  } catch {
    return new Response('Error generating thumbnail', { status: 500 });
  }
}
