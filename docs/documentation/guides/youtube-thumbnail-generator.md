---
service: coffey.codes
updated: 2026-05-15
description: How to generate local YouTube thumbnails from the hidden /og/youtube route using scripts/youtube-thumbnail.mjs.
---

# YouTube thumbnail generator

`scripts/youtube-thumbnail.mjs` is a local CLI helper that calls the hidden `GET /og/youtube` route and writes the returned image to disk.

The script supports:

- required title text
- repeatable `category` query params
- optional output path
- optional base URL override

## Preconditions

1. Run the Next.js dev server first:

```powershell
npm run dev
```

2. Keep requests local. `app/og/youtube/route.tsx` returns `404` in production and when the host is not localhost/127.0.0.1.

## Quick start

```powershell
npm run thumbnail:youtube -- --title "hello world" --category "Digital Marketing" --category "SEO"
```

By default, the script writes to:

`tmp/youtube-thumbnail-<title-slug>.png`

Example:

`tmp/youtube-thumbnail-hello-world.png`

## Usage

```powershell
node scripts/youtube-thumbnail.mjs --title "<title>" [--category "<category>"]... [--out <file>] [--base-url <url>]
```

NPM alias:

```powershell
npm run thumbnail:youtube -- --title "<title>" [--category "<category>"]... [--out <file>] [--base-url <url>]
```

## Options

- `--title` (required): Thumbnail title text.
- `--category` (optional, repeatable): Adds one category token per flag. The route receives repeated `category` params and renders them as a joined label.
- `--out` (optional): Output file path, relative to repo root or absolute.
- `--base-url` (optional): Base URL for the local app. Default is `http://localhost:3000`.
- `-h`, `--help`: Print CLI help.

## Examples

Use two categories and default output path:

```powershell
npm run thumbnail:youtube -- --title "How to Build a Content Funnel" --category "Digital Marketing" --category "SEO"
```

Write to a specific file:

```powershell
npm run thumbnail:youtube -- --title "How to Build a Content Funnel" --category "Digital Marketing" --out "tmp/content-funnel.png"
```

Use a different local port:

```powershell
npm run thumbnail:youtube -- --title "How to Build a Content Funnel" --category "Digital Marketing" --base-url "http://localhost:4000"
```

## Troubleshooting

- Error: `Missing required --title`
  - Fix: provide `--title`.
- Error: `Failed to reach http://localhost:3000`
  - Fix: start the dev server with `npm run dev`, or set `--base-url` to the correct local host/port.
- Error: `Request failed (404 Not Found)`
  - Cause: route guard blocked non-localhost hostnames or production environment.
  - Fix: call through localhost while running the local dev server.
- Unexpected file extension:
  - The script chooses extension by response `content-type` (`.png`, `.jpg`, `.webp`).
