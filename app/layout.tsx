'use client';

import '../styles/global.sass';
import { usePathname } from 'next/navigation';
import { fraunces, nunito, GeistMono } from '../lib/fonts';
import Navbar from '../components/Navbar';
import { LandingPageHeader } from '../components/LandingPageHeader';
import GoogleAnalyticsClient from '../components/GoogleAnalyticsClient';
import Footer from '../components/Footer';
import ConsentManager from '../components/ConsentManager';
import { ThemeProvider } from '../components/ThemeProvider';

const cx = (...classes: (string | undefined | false)[]) => classes.filter(Boolean).join(' ');

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLandingPage = pathname === '/lp' || pathname?.startsWith('/lp/');

  return (
    <html
      lang="en"
      data-theme="light"
      className={cx(fraunces.variable, nunito.variable, GeistMono.variable)}
      suppressHydrationWarning
    >
      <body className="antialiased bg-bg text-c-text font-nunito">
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="light"
          storageKey="theme"
        >
          <ConsentManager />
          <GoogleAnalyticsClient />

          {isLandingPage ? <LandingPageHeader /> : <Navbar />}

          <main>{children}</main>

          {!isLandingPage && <Footer />}
        </ThemeProvider>
      </body>
    </html>
  );
}
