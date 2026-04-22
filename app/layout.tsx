import type { Metadata, Viewport } from 'next';
import '../styles/global.sass';
import { outfit, GeistMono } from '../lib/fonts';
import LayoutShell from '../components/LayoutShell';
import JsonLd from '../components/JsonLd';
import { baseUrl } from './sitemap';

const cx = (...classes: (string | undefined | false)[]) =>
  classes.filter(Boolean).join(' ');

const SITE_NAME = 'Anthony Coffey';
const SITE_DESCRIPTION =
  'Anthony Coffey — musician, director, and software engineer in Austin, TX. Creativity is at the core of everything I build, design, and ship.';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${SITE_NAME} — Musician, Engineer, Maker in Austin`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: baseUrl }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: baseUrl,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Musician, Engineer, Maker in Austin`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Musician, Engineer, Maker in Austin`,
    description: SITE_DESCRIPTION,
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: SITE_NAME,
  url: baseUrl,
  image: `${baseUrl}/headshot.png`,
  jobTitle: 'Software Engineer & Solutions Architect',
  description: SITE_DESCRIPTION,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Austin',
    addressRegion: 'TX',
    addressCountry: 'US',
  },
  sameAs: [
    'https://github.com/anthonycoffey',
    'https://linkedin.com/in/coffeyanthony',
    'https://linktr.ee/coffeycodes',
  ],
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: baseUrl,
  description: SITE_DESCRIPTION,
  inLanguage: 'en-US',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${baseUrl}/articles/search?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={cx(outfit.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased bg-bg text-c-text font-outfit">
        <JsonLd data={personSchema} />
        <JsonLd data={websiteSchema} />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
