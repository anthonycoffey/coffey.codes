import Image from 'next/image';

export function LandingPageHeader() {
  // Intentionally not a link: /lp pages are ad-destination pages with no nav
  // back, so the logo is a brand mark only and never navigates off the page.
  return (
    <aside className="bg-bg border-b-2 border-border text-c-text tracking-tight w-full">
      <div className="px-4 py-2">
        <div className="flex items-center justify-center">
          <Image
            width={300}
            height={82}
            src="/logo-horizontal.svg"
            alt="Anthony Coffey"
            className="h-14 w-auto"
            priority
          />
        </div>
      </div>
    </aside>
  );
}
