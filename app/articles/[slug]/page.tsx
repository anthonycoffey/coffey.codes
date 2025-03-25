import { notFound } from 'next/navigation';
import { CustomMDX } from 'app/components/mdx';
import { getRSSBlogPosts, formatDate } from 'app/articles/utils';
import { baseUrl } from 'app/sitemap';
import GoBack from 'app/components/GoBack';
import Breadcrumbs from 'app/components/Breadcrumbs';
import Link from 'next/link';
export async function generateStaticParams() {
  let posts = getRSSBlogPosts();

  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }) {
  let post = getRSSBlogPosts().find((post) => post.slug === params.slug);
  if (!post) {
    return;
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
    image,
  } = post.metadata;
  let ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(title)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `${baseUrl}/articles/${post.slug}`,
      images: [
        {
          url: ogImage,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function Blog({ params }) {
  let post = getRSSBlogPosts().find((post) => post.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            image: post.metadata.image
              ? `${baseUrl}${post.metadata.image}`
              : `/og?title=${encodeURIComponent(post.metadata.title)}`,
            url: `${baseUrl}/articles/${post.slug}`,
            author: {
              '@type': 'Person',
              name: 'Anthony Coffey',
            },
            keywords: post.metadata.tags ? post.metadata.tags.join(', ') : '',
            articleSection: post.metadata.category || '',
          }),
        }}
      />
      <Breadcrumbs title={post.metadata.title} />
      <h1 className="title font-semibold text-2xl tracking-tighter">
        {post.metadata.title}
      </h1>
      <div className="flex flex-col ml-2">
        <p>
          <em>{formatDate(post.metadata.publishedAt)}</em>
        </p>
        
        {post.metadata.category && (
          <div className="mt-2">
            <span className="font-semibold">Category: </span>
            <Link 
              href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
              className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full"
            >
              {post.metadata.category}
            </Link>
          </div>
        )}
        
        {post.metadata.tags && post.metadata.tags.length > 0 && (
          <div className="mt-2">
            <span className="font-semibold">Tags: </span>
            <div className="flex flex-wrap gap-2 mt-1">
              {post.metadata.tags.map((tag) => (
                <Link 
                  key={tag}
                  href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                  className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      <article className="mx-auto prose prose-lg xl:prose-xl">
        <CustomMDX source={post.content} />
      </article>
      <GoBack />
    </section>
  );
}
