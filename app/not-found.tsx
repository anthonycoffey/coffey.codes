import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div className="prose mx-auto max-w-3xl px-4 md:pb-16 min-h-[500px]">
      <section>
        <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
          Page Not Found
        </h1>
        <p className="subtitle"> </p>
        <p className="mb-4">
          Not all those who wander are lost, but this path exists not in these
          realms.
        </p>
        <div>
          <Image
            src="/wizard-404.jpg"
            alt="404 Not Found"
            width={1440}
            height={580}
            className="rounded-lg"
          />
        </div>
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-medium">
            Choose Your Path, Brave Wanderer!
          </h2>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="text-blue-600 hover:underline">
                Return to the Shire
              </Link>
            </li>
            <li>
              <Link href="/articles" className="text-blue-600 hover:underline">
                The Archives of Lore
              </Link>
            </li>
            <li>
              <Link href="/portfolio" className="text-blue-600 hover:underline">
                Artifacts of Power
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-blue-600 hover:underline">
                Send a Message by Raven
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
