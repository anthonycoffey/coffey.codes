import '/styles/global.sass';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from '../components/nav';
import GoogleAnalyticsClient from '../components/GoogleAnalyticsClient';
import Footer from '../components/footer';
import { baseUrl } from './sitemap';
import ConsentManager from '../components/ConsentManager';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      'Anthony Coffey, SWE, DevOps | Full Stack Engineer based in Austin, Texas',
    template: '%s - Anthony Coffey, SWE, DevOps | Full Stack Engineer',
  },
  description: 'Welcome to my portfolio blog site!',
  openGraph: {
    title:
      'Anthony Coffey, SWE, DevOps | Full Stack Engineer based in Austin, Texas',
    description:
      'Portfolio blog site for Anthony Coffey, Austin Texas based software engineer.',
    url: baseUrl,
    siteName: 'Anthony Coffey | Full Stack Engineer based in Austin, Texas',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Anthony Coffey | Full Stack Engineer based in Austin, Texas',
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export const viewport = 'width=device-width, initial-scale=1';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cx('', GeistSans.variable, GeistMono.variable)}>
      <body className="antialiased">
        {/*<video*/}
        {/*  autoPlay*/}
        {/*  loop*/}
        {/*  muted*/}
        {/*  playsInline*/}
        {/*  className="fixed top-0 left-0 w-full h-full object-cover -z-10"*/}
        {/*>*/}
        {/*  <source src="/deskloop.mp4" type="video/mp4" />*/}
        {/*  Your browser does not support the video tag.*/}
        {/*</video>*/}

        <GoogleAnalyticsClient />
        <Navbar />
        {children}
        <Footer />
        <ConsentManager />
      </body>
    </html>
  );
}
