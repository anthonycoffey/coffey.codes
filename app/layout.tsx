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
    // Re-add suppressHydrationWarning
    // Let next-themes manage the class on <html>, apply base styles to <body>
    <html lang="en" className={cx(GeistSans.variable, GeistMono.variable)} suppressHydrationWarning>
      {/* Apply base light/dark mode styles to body */}
      <body className="antialiased bg-white dark:bg-neutral-900 text-black dark:text-white"> {/* Apply base styles here */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem // Re-add enableSystem as per user requirement
          storageKey="theme" // Add explicit storage key
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
