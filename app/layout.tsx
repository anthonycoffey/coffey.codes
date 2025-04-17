'use client'; // Required for usePathname hook

import '/styles/global.sass';
import { usePathname } from 'next/navigation';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// Note: Script component might need careful handling in Client Components if issues arise.
// import Script from 'next/script';
import { Navbar } from '../components/nav';
import { LandingPageHeader } from '../components/LandingPageHeader';
import GoogleAnalyticsClient from '../components/GoogleAnalyticsClient';
import Footer from '../components/footer';
import ConsentManager from '../components/ConsentManager';
import { ThemeProvider } from '../components/ThemeProvider';

// Metadata and viewport exports are removed as they are not allowed in Client Components ('use client').
// These should be defined in specific page.tsx files or potentially in a separate
// Server Component layout file that wraps this Client Component if global metadata is required.

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  // Check if the current path starts with /lp/ or is exactly /lp
  const isLandingPage = pathname === '/lp' || pathname?.startsWith('/lp/');

  return (
    <html lang="en" className={cx('', GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      {/* Apply base light/dark mode styles */}
      <body className="bg-white dark:bg-neutral-950 text-black dark:text-white antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* Consent Manager should load early */}
          <ConsentManager />
          {/* Google Analytics */}
          <GoogleAnalyticsClient />

          {/* Conditionally render the correct header */}
          {isLandingPage ? <LandingPageHeader /> : <Navbar />}

          {/* Render the page content */}
          <main>{children}</main>

          {/* Conditionally render the footer (only on non-landing pages) */}
          {!isLandingPage && <Footer />}

        </ThemeProvider>
      </body>
    </html>
  );
}
