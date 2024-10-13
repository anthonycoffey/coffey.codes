import '/styles/global.sass';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav';
import GoogleAnalyticsClient from './components/GoogleAnalyticsClient';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer';
import { baseUrl } from './sitemap';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default:
      'Anthony Coffey | Solutions Architect & Software Engineer in Austin, Texas',
    template: '%s - Anthony Coffey | Software Engineer | Austin, Texas',
  },
  description: 'Welcome to my portfolio blog site!',
  openGraph: {
    title: 'Anthony Coffey | Solutions Architect & Software Engineer',
    description:
      'Portfolio blog site for Austin based artist and software engineer Anthony Coffey.',
    url: baseUrl,
    siteName: 'Anthony Coffey | Solutions Architect & Software Engineer',
    locale: 'en_US',
    type: 'website',
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
    <html
      lang="en"
      className={cx(
        'text-white bg-black ',
        GeistSans.variable,
        GeistMono.variable,
      )}
    >
      <body className="antialiased max-w-xl mx-4 mt-8 mx-auto">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="fixed top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source src="/deskloop.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <main className="flex-auto min-w-0 mt-6 flex flex-col px-2 md:px-0">
          <GoogleAnalyticsClient />
          <Navbar />
          {children}
          <Footer />
          <SpeedInsights />
        </main>
      </body>
    </html>
  );
}
