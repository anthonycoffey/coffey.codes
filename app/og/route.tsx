import { ImageResponse } from 'next/og';

const DEFAULT_TITLE =
  'Anthony Coffey | Full Stack Software Engineer - Austin, Texas';
const MAX_TITLE_LENGTH = 120;

export function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawTitle = url.searchParams.get('title') || DEFAULT_TITLE;
    const title = rawTitle.slice(0, MAX_TITLE_LENGTH);

    return new ImageResponse(
      (
        <div tw="flex flex-col w-full h-full items-center justify-center bg-black/80">
          <div tw="flex flex-col md:flex-row w-full px-4 md:items-center justify-between p-8">
            <h2 tw="flex flex-col text-4xl font-bold tracking-tight text-center text-white">
              {title}
            </h2>
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
