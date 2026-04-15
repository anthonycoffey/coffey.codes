import Link from 'next/link';
import Image from 'next/image';

export function LandingPageHeader() {
  return (
    <aside className="bg-bg border-b-2 border-border text-c-text tracking-tight w-full">
      <div className="px-4 py-2">
        <div className="flex items-center justify-center">
          <Link href="/" className="block">
            <Image
              width={300}
              height={82}
              src="/logo-horizontal.svg"
              alt="logo"
              className="h-14 w-auto"
              priority
            />
          </Link>
        </div>
      </div>
    </aside>
  );
}
