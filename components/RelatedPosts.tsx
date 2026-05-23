import Link from 'next/link';
import type { BlogPost } from '@/app/(site)/articles/utils';

const DEFAULT_LIMIT = 3;

function normalizeTag(tag: string): string {
  return tag.toLowerCase().trim();
}

function countSharedTags(a: string[] | undefined, b: string[] | undefined): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map(normalizeTag));
  let shared = 0;
  for (const tag of b) {
    if (setA.has(normalizeTag(tag))) shared += 1;
  }
  return shared;
}

type Scored = { post: BlogPost; sharedTags: number; sameCategory: boolean };

/**
 * Pick the best candidates to surface as related posts, ranked by:
 *   1. Shared-tag count (descending)
 *   2. Same category as a tiebreaker
 *   3. publishedAt recency as the final tiebreaker
 *
 * Candidates with no shared tags AND a different category are excluded.
 * The current post (matched by slug) is always excluded.
 */
export function selectRelatedPosts(
  current: BlogPost,
  candidates: BlogPost[],
  limit: number = DEFAULT_LIMIT,
): BlogPost[] {
  const currentTags = current.metadata.tags;
  const currentCategory = current.metadata.category;

  const scored: Scored[] = candidates
    .filter((post) => post.slug !== current.slug)
    .map((post) => ({
      post,
      sharedTags: countSharedTags(currentTags, post.metadata.tags),
      sameCategory:
        !!currentCategory &&
        !!post.metadata.category &&
        post.metadata.category === currentCategory,
    }))
    .filter((entry) => entry.sharedTags > 0 || entry.sameCategory);

  scored.sort((a, b) => {
    if (b.sharedTags !== a.sharedTags) return b.sharedTags - a.sharedTags;
    if (a.sameCategory !== b.sameCategory) return a.sameCategory ? -1 : 1;
    const dateA = new Date(a.post.metadata.publishedAt).getTime();
    const dateB = new Date(b.post.metadata.publishedAt).getTime();
    return dateB - dateA;
  });

  return scored.slice(0, limit).map((entry) => entry.post);
}

type RelatedPostsProps = {
  current: BlogPost;
  candidates: BlogPost[];
  limit?: number;
};

export default function RelatedPosts({
  current,
  candidates,
  limit = DEFAULT_LIMIT,
}: RelatedPostsProps) {
  const related = selectRelatedPosts(current, candidates, limit);
  if (related.length === 0) return null;

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="mt-12 border-t border-neutral-200 pt-8 dark:border-neutral-800"
    >
      <h2
        id="related-posts-heading"
        className="text-xl font-semibold tracking-tight"
      >
        Related articles
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/articles/${post.slug}`}
              className="block rounded-lg border border-neutral-200 p-4 transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
            >
              <h3 className="text-base font-medium leading-snug">
                {post.metadata.title}
              </h3>
              {post.metadata.summary ? (
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-3">
                  {post.metadata.summary}
                </p>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
