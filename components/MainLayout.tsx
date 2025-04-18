'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from './nav';
import { LandingPageHeader } from './LandingPageHeader';
import GoogleAnalyticsClient from './GoogleAnalyticsClient';
import Footer from './footer';
import ConsentManager from './ConsentManager';
import { ThemeProvider } from './ThemeProvider';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/lp' || pathname?.startsWith('/lp/');

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="theme"
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
  );
}
