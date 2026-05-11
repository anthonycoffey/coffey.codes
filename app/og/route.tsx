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
    const origin = url.origin;
    const bgUrl = `${origin}/og-meta-base.svg`;

    const rawTitle = url.searchParams.get('title') || DEFAULT_TITLE;
    const title = rawTitle.slice(0, MAX_TITLE_LENGTH);
    const category = url.searchParams
      .get('category')
      ?.slice(0, MAX_CATEGORY_LENGTH);
    const rawAuthor = url.searchParams.get('author') || DEFAULT_AUTHOR;
    const author = rawAuthor.slice(0, MAX_AUTHOR_LENGTH);

    // Long titles shrink so they still fit comfortably in the upper half
    // (we keep the bottom-left clear for the logomark inside the SVG).
    const titleFontSize = title.length > 80 ? 52 : title.length > 50 ? 64 : 76;

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
          {/* Brand background (SVG with logomark in the bottom-left). */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgUrl}
            alt=""
            width={1200}
            height={630}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 1200,
              height: 630,
            }}
          />

          {/* Title block — pinned to the upper portion so it doesn't
              collide with the logomark in the SVG's bottom-left. */}
          <div
            style={{
              position: 'absolute',
              top: 64,
              left: 80,
              right: 80,
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
                  color: 'rgba(255,255,255,0.9)',
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
                textShadow: '0 2px 12px rgba(0,0,0,0.35)',
              }}
            >
              {title}
            </div>
          </div>

          {/* Author — bottom-right so the logomark keeps the bottom-left. */}
          <div
            style={{
              position: 'absolute',
              bottom: 64,
              right: 80,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              fontSize: 22,
              color: 'rgba(255,255,255,0.9)',
              textShadow: '0 2px 8px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                display: 'flex',
                width: 8,
                height: 8,
                borderRadius: 4,
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
