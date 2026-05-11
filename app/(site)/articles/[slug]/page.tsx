import { notFound } from 'next/navigation';
import { CustomMDX } from '@/components/mdx';
import { getAllBlogPosts } from '@/app/(site)/articles/utils';
import { baseUrl } from '@/app/sitemap';
import GoBack from '@/components/GoBack';
import CommentsLazy from '@/components/CommentsLazy';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { formatDate } from '@/utils/date';
import Image from 'next/image';

// Normalize a date-or-datetime string to an ISO 8601 datetime with timezone.
// Google's Rich Results Test flags date-only values on schema.org
// `datePublished` / `dateModified` as missing-timezone warnings.
function toIsoDatetime(value: string): string {
  return value.includes('T') ? value : `${value}T00:00:00.000Z`;
}

// Per-slug component overrides — keeps heavy 3D scene clients out of
// the global MDX registry so non-3D articles don't ship dynamic-import
// wrappers for three.js / @react-three/* code.
const slugComponentLoaders: Record<
  string,
  () => Promise<Record<string, React.ComponentType<unknown>>>
> = {
  'building-interactive-3d-experiences-with-react-three-fiber': async () => {
    const m = await import('@/components/mdx-scene-clients');
    return {
      ThreeScene: m.ThreeScene as unknown as React.ComponentType<unknown>,
      FishbowlScene: m.FishbowlScene as unknown as React.ComponentType<unknown>,
      SceneExplorer: m.SceneExplorer as unknown as React.ComponentType<unknown>,
    };
  },
};

export async function generateStaticParams() {
  const posts = getAllBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = getAllBlogPosts().find((post) => post.slug === slug);
  if (!post) {
    return;
  }

  const {
    title: postTitle, // Use a clearer name for the title from frontmatter
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;

  const youtubeId = post.metadata.youtubeId;

  // Build the /og URL with category as a kicker when the article has one.
  // The OG route accepts both `title` and `category` (optional).
  const ogParams = new URLSearchParams({ title: postTitle });
  if (post.metadata.category) {
    ogParams.set('category', post.metadata.category);
  }
  const generatedOg = `${baseUrl}/og?${ogParams.toString()}`;

  // For video articles, the YouTube thumbnail beats the generated /og card
  // because social sharers expect a play-button preview. Falls back to the
  // dynamic OG route for non-video articles.
  const ogImage = youtubeId
    ? `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`
    : image
      ? image
      : generatedOg;

  return {
    title: postTitle,
    description,
    alternates: { canonical: `/articles/${post.slug}` },
    openGraph: {
      title: postTitle,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/articles/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
      ...(youtubeId && {
        videos: [
          {
            url: `https://www.youtube.com/embed/${youtubeId}`,
            type: 'text/html',
            width: 1280,
            height: 720,
          },
        ],
      }),
    },
    // Player card lets the video play inline in tweets; falls back to
    // summary_large_image for non-video articles.
    twitter: youtubeId
      ? {
          card: 'player',
          title: postTitle,
          description,
          images: [ogImage],
          players: [
            {
              playerUrl: `https://www.youtube.com/embed/${youtubeId}`,
              streamUrl: `https://www.youtube.com/embed/${youtubeId}`,
              width: 1280,
              height: 720,
            },
          ],
        }
      : {
          card: 'summary_large_image',
          title: postTitle,
          description,
          images: [ogImage],
        },
  };
}

export default async function Blog({ params }) {
  const { slug } = await params;

  const post = getAllBlogPosts().find((post) => post.slug === slug);

  if (!post) {
    notFound();
  }

  const extraComponents = slugComponentLoaders[slug]
    ? await slugComponentLoaders[slug]()
    : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: toIsoDatetime(post.metadata.publishedAt),
            dateModified: toIsoDatetime(
              post.metadata.updated ||
                post.mtime ||
                post.metadata.publishedAt,
            ),
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `${baseUrl}/og?title=${encodeURIComponent(post.metadata.title)}${post.metadata.category ? `&category=${encodeURIComponent(post.metadata.category)}` : ''}`,
            url: `${baseUrl}/articles/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Anthony Coffey',
              url: baseUrl,
            },
            publisher: {
              '@type': 'Organization',
              name: 'coffey.codes',
              url: baseUrl,
              logo: {
                '@type': 'ImageObject',
                url: `${baseUrl}/publisher-logo.png`,
                width: 601,
                height: 601,
              },
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${baseUrl}/articles/${post.slug}`,
            },
            keywords: post.metadata.tags ? post.metadata.tags.join(', ') : '',
            articleSection: post.metadata.category || '',
            ...(post.metadata.youtubeId && {
              video: {
                '@type': 'VideoObject',
                name: post.metadata.title,
                description: post.metadata.summary,
                thumbnailUrl: `https://img.youtube.com/vi/${post.metadata.youtubeId}/maxresdefault.jpg`,
                uploadDate: toIsoDatetime(
                  post.metadata.updated || post.metadata.publishedAt,
                ),
                embedUrl: `https://www.youtube.com/embed/${post.metadata.youtubeId}`,
                contentUrl: `https://www.youtube.com/watch?v=${post.metadata.youtubeId}`,
              },
            }),
          }),
        }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: baseUrl,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Articles',
                item: `${baseUrl}/articles`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: post.metadata.title,
                item: `${baseUrl}/articles/${post.slug}`,
              },
            ],
          }),
        }}
      />
      <Breadcrumbs title={post.metadata.title} />
      <section className="bg-surface border border-border rounded-lg shadow-sm px-6 sm:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <h1
          className="title font-editorial font-bold text-3xl sm:text-4xl text-c-heading"
          style={{ letterSpacing: '0.005em' }}
        >
          {post.metadata.title}
        </h1>
        <div className="flex flex-col ml-2">
          <div className="flex items-center space-x-4 mt-4">
            <Image
              width={330}
              height={330}
              src="/headshot.png"
              alt="Anthony Coffey"
              priority
              sizes="40px"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <span
                className="text-lg block"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
              >
                <span itemProp="name" className="text-c-text">
                  Anthony Coffey
                </span>
              </span>
              <time
                className="text-sm text-c-muted"
                dateTime={post.metadata.publishedAt}
                itemProp="datePublished"
              >
                Published on {formatDate(post.metadata.publishedAt)}
              </time>
            </div>
          </div>

          {post.metadata.category && (
            <div className="mt-2">
              <span className="font-semibold text-c-text">Category: </span>
              <Link
                href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
                className="inline-block bg-accent2 text-c-heading text-sm font-medium px-2.5 py-0.5 rounded-full hover:bg-surface-hover transition-colors"
                itemProp="articleSection"
              >
                {post.metadata.category}
              </Link>
            </div>
          )}

          {post.metadata.tags && post.metadata.tags.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="font-semibold text-c-text">Tags: </span>
                <div itemProp="keywords">
                  {post.metadata.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                      className="inline-block bg-bg-alt text-c-muted text-xs font-medium px-2.5 py-0.5 rounded mr-2 hover:bg-surface-hover transition-colors"
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <hr className="my-8 border-border" />

        <article className="prose prose-lg xl:prose-xl max-w-none dark:prose-invert mt-8">
          <CustomMDX source={post.content} components={extraComponents} />
        </article>
        <CommentsLazy />
        <GoBack />
      </section>
    </>
  );
}
