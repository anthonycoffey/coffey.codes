import '/styles/global.sass';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Navbar } from './components/nav';
import GoogleAnalyticsClient from './components/GoogleAnalyticsClient';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Footer from './components/footer';
import { baseUrl } from './sitemap';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Anthony Coffey | Solutions Architect in Austin, Texas',
    template: '%s - Anthony Coffey | Solutions Architect in Austin, Texas',
  },
  description: 'Welcome to my portfolio blog site!',
  openGraph: {
    title: 'Anthony Coffey | Solutions Architect & Software Engineer',
    description:
      'Portfolio blog site for Austin based solutions architect and software engineer, Anthony Coffey.',
    url: baseUrl,
    siteName: 'Anthony Coffey | Solutions Architect & Software Engineer',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Anthony Coffey | Solutions Architect in Austin, Texas',
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
    <html
      lang="en"
      className={cx(
        'text-white bg-black ',
        GeistSans.variable,
        GeistMono.variable,
      )}
    >
      <body className="antialiased max-w-xl px-4 mt-8 mx-auto">
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
        <Script
          id="iubenda-configuration"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
            var _iub = _iub || [];
            _iub.csConfiguration = {"siteId":3791967,"cookiePolicyId":63442989,"lang":"en","storage":{"useSiteId":true}};
          `,
          }}
        />
        <Script
          src="https://cs.iubenda.com/autoblocking/3791967.js"
          strategy="lazyOnload"
        />
        <Script src="//cdn.iubenda.com/cs/gpp/stub.js" strategy="lazyOnload" />
        <Script
          src="//cdn.iubenda.com/cs/iubenda_cs.js"
          charSet="UTF-8"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
