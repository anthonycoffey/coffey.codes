import { LandingPageHeader } from '@/components/LandingPageHeader';

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <LandingPageHeader />
      <main>{children}</main>
    </>
  );
}
