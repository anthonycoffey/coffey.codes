import { ImageResponse } from 'next/og';

const DEFAULT_TITLE =
  'Anthony Coffey | Full Stack Software Engineer in Austin, Texas';
const DEFAULT_AUTHOR = 'Anthony Coffey';
const MAX_TITLE_LENGTH = 120;
const MAX_CATEGORY_LENGTH = 40;
const MAX_AUTHOR_LENGTH = 40;

// Satori (used by next/og) requires display: 'flex' on any element with
// children. Every container here that has more than one child includes it.

export function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawTitle = url.searchParams.get('title') || DEFAULT_TITLE;
    const title = rawTitle.slice(0, MAX_TITLE_LENGTH);
    const category = url.searchParams
      .get('category')
      ?.slice(0, MAX_CATEGORY_LENGTH);
    const rawAuthor = url.searchParams.get('author') || DEFAULT_AUTHOR;
    const author = rawAuthor.slice(0, MAX_AUTHOR_LENGTH);

    // Long titles shrink so they still fit 3 lines comfortably.
    const titleFontSize = title.length > 80 ? 56 : title.length > 50 ? 68 : 80;

    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '64px 80px',
            background:
              'linear-gradient(135deg, #0F172A 0%, #1E3A8A 28%, #1D4ED8 52%, #BD93F9 78%, #F97316 100%)',
            position: 'relative',
            fontFamily: 'sans-serif',
            color: 'white',
          }}
        >
          {/* Soft highlight in the upper-left for depth */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              background:
                'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(255,255,255,0.18), transparent 60%)',
            }}
          />

          {/* Top: brand mark */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
            }}
          >
            coffey.codes
          </div>

          {/* Middle: optional category kicker + title */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 24,
            }}
          >
            {category ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.85)',
                  letterSpacing: '0.28em',
                  textTransform: 'uppercase',
                }}
              >
                {category}
              </div>
            ) : null}
            <div
              style={{
                display: 'flex',
                fontSize: titleFontSize,
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.05,
              }}
            >
              {title}
            </div>
          </div>

          {/* Bottom: author with accent dot */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              fontSize: 24,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 10,
                height: 10,
                borderRadius: 5,
                background: '#F97316',
              }}
            />
            {author}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch {
    return Response.redirect(new URL('/og-image.jpg', request.url), 302);
  }
}
