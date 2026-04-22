'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import { LandingPageHeader } from './LandingPageHeader';
import GoogleAnalyticsClient from './GoogleAnalyticsClient';
import Footer from './Footer';
import ConsentManager from './ConsentManager';
import { ThemeProvider } from './ThemeProvider';

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/lp' || pathname?.startsWith('/lp/');
  const isHomePage = pathname === '/';

  return (
    <ThemeProvider
      attribute="data-theme"
      defaultTheme="light"
      storageKey="theme"
    >
      <ConsentManager />
      <GoogleAnalyticsClient />

      {isLandingPage ? <LandingPageHeader /> : <Navbar />}

      <main>{children}</main>

      {!isLandingPage && !isHomePage && <Footer />}
    </ThemeProvider>
  );
}
