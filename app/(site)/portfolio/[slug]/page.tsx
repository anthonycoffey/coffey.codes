import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowTopRightOnSquareIcon,
  CodeBracketSquareIcon,
  TagIcon,
} from '@heroicons/react/24/outline';

import Breadcrumbs from '@/components/Breadcrumbs';
import { CustomMDX } from '@/components/mdx';
import { baseUrl } from '@/app/sitemap';
import { formatDate } from '@/utils/date';
import {
  getAllPortfolioItems,
  getPortfolioItem,
} from '@/app/(site)/portfolio/utils';

// Avoid the "missing timezone" warning Google's Rich Results Test
// emits for date-only schema.org datePublished/dateModified values.
function toIsoDatetime(value: string): string {
  return value.includes('T') ? value : `${value}T00:00:00.000Z`;
}

export async function generateStaticParams() {
  return getAllPortfolioItems().map((item) => ({ slug: item.slug }));
}

interface PageParams {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageParams) {
  const { slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) return;

  const { title, summary, mainImage, tags } = item.metadata;
  const ogImage = mainImage
    ? `${baseUrl}${mainImage}`
    : `${baseUrl}/og?title=${encodeURIComponent(title)}&category=${encodeURIComponent('Portfolio')}`;

  return {
    title,
    description: summary,
    keywords: tags?.join(', '),
    alternates: { canonical: `/portfolio/${slug}` },
    openGraph: {
      title,
      description: summary,
      type: 'article',
      url: `${baseUrl}/portfolio/${slug}`,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: summary,
      images: [ogImage],
    },
  };
}

export default async function PortfolioItemPage({ params }: PageParams) {
  const { slug } = await params;
  const item = getPortfolioItem(slug);
  if (!item) notFound();

  const { metadata } = item;
  const datePublishedIso = toIsoDatetime(metadata.publishedAt);
  const dateModifiedIso = toIsoDatetime(
    metadata.updated ?? item.mtime ?? metadata.publishedAt,
  );

  return (
    <>
      {/* schema.org structured data */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CreativeWork',
            name: metadata.title,
            description: metadata.summary,
            url: `${baseUrl}/portfolio/${slug}`,
            datePublished: datePublishedIso,
            dateModified: dateModifiedIso,
            image: metadata.mainImage
              ? `${baseUrl}${metadata.mainImage}`
              : undefined,
            author: {
              '@type': 'Person',
              name: 'Anthony Coffey',
              url: baseUrl,
            },
            keywords: metadata.tags?.join(', '),
            ...(metadata.repo && {
              codeRepository: metadata.repo,
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
              { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Portfolio',
                item: `${baseUrl}/portfolio`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: metadata.title,
                item: `${baseUrl}/portfolio/${slug}`,
              },
            ],
          }),
        }}
      />

      <Breadcrumbs title={metadata.title} />

      <section className="bg-surface border border-border rounded-lg shadow-sm px-6 sm:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          {metadata.mainImage ? (
            <Image
              src={metadata.mainImage}
              alt={`${metadata.title} logo`}
              width={48}
              height={48}
              className="h-10 w-10 flex-shrink-0 mt-1 object-contain"
              priority
            />
          ) : (
            <CodeBracketSquareIcon className="h-8 w-8 text-link flex-shrink-0 mt-1" />
          )}
          <h1
            className="title font-editorial font-bold text-3xl sm:text-4xl text-c-heading"
            style={{ letterSpacing: '0.005em' }}
          >
            {metadata.title}
          </h1>
        </div>

        <p className="text-lg text-c-muted mt-2 mb-4 leading-relaxed">
          {metadata.summary}
        </p>

        {/* Tag chips + meta row */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-c-muted">
          {metadata.client && (
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold text-c-text">Client:</span>
              {metadata.client}
            </span>
          )}
          {metadata.client && metadata.year && (
            <span className="text-c-muted">·</span>
          )}
          {metadata.year && (
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold text-c-text">Year:</span>
              {metadata.year}
            </span>
          )}
          <span className="text-c-muted">·</span>
          <time dateTime={metadata.publishedAt} itemProp="datePublished">
            Updated {formatDate(metadata.updated ?? metadata.publishedAt)}
          </time>
        </div>

        {metadata.tags && metadata.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {metadata.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 bg-accent2 text-c-heading text-xs font-semibold px-2.5 py-1 rounded-full"
              >
                <TagIcon className="h-3 w-3" />
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Action buttons */}
        {(metadata.link || metadata.repo) && (
          <div className="flex flex-wrap gap-3 mb-6">
            {metadata.link && (
              <a
                href={metadata.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-accent1-dark text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                View live
              </a>
            )}
            {metadata.repo && (
              <a
                href={metadata.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-surface border border-border text-c-text text-sm font-semibold px-4 py-2 rounded-lg hover:bg-bg-alt transition-colors"
              >
                <CodeBracketSquareIcon className="h-4 w-4" />
                Source repository
              </a>
            )}
          </div>
        )}

        <hr className="my-6 border-border" />

        {/* MDX body. Table rendering (wrap-aware, no horizontal scroll)
         * is handled at the component level in components/mdx.tsx so it
         * applies uniformly to articles and any future MDX page. */}
        <article className="prose prose-lg xl:prose-xl max-w-none dark:prose-invert">
          <CustomMDX source={item.content} />
        </article>

        {/* Footer: navigate back */}
        <div className="mt-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-link hover:underline text-sm"
          >
            ← Back to portfolio
          </Link>
        </div>
      </section>
    </>
  );
}
