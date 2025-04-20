import { notFound } from 'next/navigation';
import { CustomMDX } from '@/components/mdx';
import { getAllBlogPosts } from '@/app/articles/utils';
import { baseUrl } from '@/app/sitemap';
import GoBack from '@/components/GoBack';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';
import { formatDate } from '@/utils/date';
import Image from 'next/image';

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

  // Use simpler title format for articles to prioritize article title and avoid truncation
  const title = `${postTitle} | Anthony Coffey`;

  // Use the original postTitle for generating the OG image if no specific image is provided
  const ogImage = image
    ? image
    : `${baseUrl}/og?title=${encodeURIComponent(postTitle)}`;

  return {
    title, // Use the modified title
    description,
    openGraph: {
      title, // Use the modified title
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

export default async function Blog({ params }) {
  const { slug } = await params;

  const post = getAllBlogPosts().find((post) => post.slug === slug);

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
      {/* Style title */}
      <h1 className="title font-semibold text-2xl tracking-tighter dark:text-white">
        {post.metadata.title}
      </h1>
      <div className="flex flex-col ml-2">
        <div className="flex items-center space-x-4 mt-4">
          <Image
            width={330}
            height={330}
            src="/headshot.jpg"
            alt="Anthony Coffey"
            className="w-10 h-10 rounded-full"
          />
          <div>
            <span
              className="text-lg block"
              itemProp="author"
              itemScope
              itemType="https://schema.org/Person"
            >
              {/* Style author name */}
              <span itemProp="name" className="dark:text-gray-300">Anthony Coffey</span>
            </span>
            {/* Style date */}
            <time
              className="text-sm text-gray-500 dark:text-gray-400"
              dateTime={post.metadata.publishedAt}
              itemProp="datePublished"
            >
              Published on {formatDate(post.metadata.publishedAt)}
            </time>
          </div>
        </div>

        {post.metadata.category && (
          <div className="mt-2">
            {/* Style label */}
            <span className="font-semibold dark:text-gray-300">Category: </span>
            {/* Style category chip */}
            <Link
              href={`/articles/category/${encodeURIComponent(post.metadata.category.toLowerCase())}`}
              className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-sm font-medium px-2.5 py-0.5 rounded-full"
              itemProp="articleSection"
            >
              {post.metadata.category}
            </Link>
          </div>
        )}

        {post.metadata.tags && post.metadata.tags.length > 0 && (
          <div className="mt-2">
            <div className="flex flex-wrap gap-2 mt-1">
              {/* Style label */}
              <span className="font-semibold dark:text-gray-300">Tags: </span>
              <div itemProp="keywords">
                {post.metadata.tags.map((tag) => (
                  // Style tag chip
                  <Link
                    key={tag}
                    href={`/articles/tag/${encodeURIComponent(tag.toLowerCase())}`}
                    className="bg-gray-100 text-gray-800 dark:bg-neutral-800 dark:text-gray-300 text-xs font-medium px-2.5 py-0.5 rounded mr-2"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Add dark:prose-invert for MDX content */}
      <article className="mx-auto prose prose-lg xl:prose-xl dark:prose-invert">
        <CustomMDX source={post.content} />
      </article>
      <GoBack />
    </section>
  );
}
