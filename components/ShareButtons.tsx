import CopyLinkButton from './CopyLinkButton';

type Props = {
  url: string;
  title: string;
};

/**
 * Renders share buttons (X, LinkedIn, Hacker News, Reddit, Copy Link) in
 * the article meta section. Server-rendered except for the clipboard
 * button which needs `navigator.clipboard`. Brand SVG paths are inlined
 * from simpleicons.org to avoid a runtime dependency on react-icons.
 */
export default function ShareButtons({ url, title }: Props) {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);

  const targets: { name: string; href: string; icon: React.ReactNode }[] = [
    {
      name: 'X',
      href: `https://x.com/intent/post?text=${t}&url=${u}`,
      icon: <XIcon />,
    },
    {
      name: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      icon: <LinkedInIcon />,
    },
    {
      name: 'Hacker News',
      href: `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`,
      icon: <HackerNewsIcon />,
    },
    {
      name: 'Reddit',
      href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
      icon: <RedditIcon />,
    },
  ];

  return (
    <div
      className="mt-2 flex flex-wrap items-center gap-1"
      aria-label="Share this article"
    >
      <span className="font-semibold text-c-text mr-1">Share:</span>
      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Share on ${target.name}`}
          className="inline-flex items-center justify-center rounded-md p-1.5 text-c-muted hover:text-link hover:bg-surface-hover transition-colors"
        >
          {target.icon}
        </a>
      ))}
      <CopyLinkButton url={url} />
    </div>
  );
}

// Brand SVGs reused / sourced from existing components/SocialIcons.tsx
// and simpleicons.org. Each rendered at 20x20 to match the heroicons
// elsewhere on this page.

const XIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.8 0-5 2.2-5 5v14c0 2.8 2.2 5 5 5h14c2.8 0 5-2.2 5-5v-14c0-2.8-2.2-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.3c-1 0-1.8-.8-1.8-1.8s.8-1.8 1.8-1.8 1.8.8 1.8 1.8-.8 1.8-1.8 1.8zm13.5 12.3h-3v-5.6c0-3.4-4-3.1-4 0v5.6h-3v-11h3v1.5c1.4-2.6 7-2.8 7 2.5v7z" />
  </svg>
);

const HackerNewsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M0 24V0h24v24zM6.951 5.896l4.112 7.708v5.064h1.583v-4.972l4.148-7.799h-1.749l-2.457 4.875c-.372.745-.688 1.434-.688 1.434s-.297-.708-.651-1.434L8.831 5.896h-1.88z" />
  </svg>
);

const RedditIcon = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-5 h-5"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.04 1.605a3.32 3.32 0 0 1 .045.563c0 2.848-3.36 5.158-7.508 5.158-4.14 0-7.5-2.31-7.5-5.158 0-.187.016-.378.047-.567-.61-.273-1.04-.89-1.04-1.604 0-.97.785-1.755 1.754-1.755.477 0 .9.182 1.207.49 1.207-.86 2.88-1.424 4.744-1.493l.81-3.8a.39.39 0 0 1 .47-.301l2.633.566a1.249 1.249 0 0 1 1.209-.953zM7.776 14.52a1.32 1.32 0 1 0 .03 0zm8.464.004a1.32 1.32 0 1 0-.029 0zm-4.323 4.276c.832 0 1.625-.105 2.394-.299a.343.343 0 0 0 .234-.435.345.345 0 0 0-.432-.232 9.064 9.064 0 0 1-2.196.273 9.066 9.066 0 0 1-2.197-.273.345.345 0 0 0-.432.232.343.343 0 0 0 .234.435c.769.194 1.563.299 2.395.299z" />
  </svg>
);
