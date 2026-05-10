import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';
import { caseStudies } from '../../case-studies/case-studies';
import GoBack from '@/components/GoBack';
import CaseStudyBrief from './CaseStudyBrief';
import CaseStudyStory from './CaseStudyStory';
import CaseStudyPdfCta from '@/components/CaseStudyPdfCta';
import { baseUrl } from '@/app/sitemap';

export async function generateStaticParams() {
  return caseStudies.map((study) => ({
    slug: study.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) return { title: 'Case Study Not Found' };

  const url = `${baseUrl}/case-study/${study.slug}`;
  const ogImage = `${baseUrl}/og?title=${encodeURIComponent(study.title)}`;

  return {
    title: study.title,
    description: study.description,
    keywords: study.tags,
    alternates: { canonical: `/case-study/${study.slug}` },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'article',
      url,
      title: study.title,
      description: study.description,
      images: [{ url: ogImage }],
    },
    twitter: {
      card: 'summary_large_image',
      title: study.title,
      description: study.description,
      images: [ogImage],
    },
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.slug === slug);

  if (!study) {
    notFound();
  }

  const url = `${baseUrl}/case-study/${study.slug}`;
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: study.title,
    description: study.description,
    image: `${baseUrl}/og?title=${encodeURIComponent(study.title)}`,
    url,
    author: { '@type': 'Person', name: 'Anthony Coffey', url: baseUrl },
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
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    keywords: study.tags.join(', '),
    articleSection: 'Case Study',
  };
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Case Studies',
        item: `${baseUrl}/case-studies`,
      },
      { '@type': 'ListItem', position: 3, name: study.title, item: url },
    ],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Breadcrumbs title={study.title} />

      <section className="bg-surface border border-border rounded-lg shadow-sm px-6 sm:px-10 pt-6 sm:pt-8 pb-4 sm:pb-6">
        <h1
          className="title font-editorial font-bold text-3xl sm:text-4xl text-c-heading"
          style={{ letterSpacing: '0.005em' }}
        >
          {study.title}
        </h1>

        <p className="text-c-muted text-lg mt-4 mb-6 leading-relaxed">
          {study.description}
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {study.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs bg-bg-alt text-c-muted px-2.5 py-1 rounded-md border border-border font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <hr className="my-8 border-border" />

        <article className="prose prose-lg xl:prose-xl max-w-none dark:prose-invert mt-8">
          {study.layout === 'styleA' ? (
            <CaseStudyBrief study={study} />
          ) : (
            <CaseStudyStory study={study} />
          )}
        </article>

        {study.pdfPath && (
          <CaseStudyPdfCta pdfPath={study.pdfPath} title={study.title} />
        )}

        <div className="mt-12 flex justify-between items-center pt-8 border-t border-border">
          <GoBack />
        </div>
      </section>
    </div>
  );
}
