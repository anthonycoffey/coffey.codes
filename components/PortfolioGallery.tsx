import Image from 'next/image';

interface PortfolioGalleryProps {
  /** Featured / hero image — rendered as the first (large) slot. */
  featured?: string;
  /** Additional images, rendered as a thumbnail strip after `featured`. */
  images?: string[];
  /** Used for alt text. */
  title: string;
}

/**
 * Portfolio media gallery — renders `[featured, ...images]` for a
 * portfolio item's detail page. De-duplicates entries (preserving
 * declared order) so an item that mistakenly lists its featured shot
 * inside `images` doesn't render it twice.
 *
 * Layout:
 * - `featured` (or the first available entry) shows as a large figure.
 * - Remaining entries render as a responsive thumbnail grid below.
 * - If only one image total is available, only the large figure renders.
 * - Renders `null` when no media is supplied — callers can mount this
 *   unconditionally on the detail page.
 *
 * This is a server component (no client interactivity). A lightbox is
 * intentionally out of scope for v1 — see SPEC-034.
 */
export default function PortfolioGallery({
  featured,
  images,
  title,
}: PortfolioGalleryProps) {
  // Dedupe in declared order: featured first, then any images[] entries
  // that aren't equal to featured.
  const ordered: string[] = [];
  if (featured) ordered.push(featured);
  if (images) {
    for (const src of images) {
      if (src && !ordered.includes(src)) ordered.push(src);
    }
  }

  if (ordered.length === 0) return null;

  const [hero, ...rest] = ordered;

  return (
    <section
      aria-label={`${title} media gallery`}
      className="not-prose my-8"
    >
      <figure className="relative w-full overflow-hidden rounded-lg border border-border bg-bg-alt aspect-video">
        <Image
          src={hero}
          alt={`${title} — featured image`}
          fill
          sizes="(max-width: 768px) 100vw, 896px"
          className="object-cover"
        />
      </figure>

      {rest.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {rest.map((src, i) => (
            <li
              key={src}
              className="relative aspect-video overflow-hidden rounded-md border border-border bg-bg-alt"
            >
              <Image
                src={src}
                alt={`${title} — screenshot ${i + 2}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
