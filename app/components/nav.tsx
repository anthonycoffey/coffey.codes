import Link from 'next/link';
import { HomeIcon, PencilIcon, EnvelopeIcon } from '@heroicons/react/20/solid';
import SocialIcons from './SocialIcons';

const navItems = {
  '/': {
    name: 'home',
    icon: <HomeIcon className="h-4 w-4 ml-1" />,
  },
  '/articles': {
    name: 'articles',
    icon: <PencilIcon className="h-4 w-4 ml-1" />,
  },
  '/contact': {
    name: 'contact',
    icon: <EnvelopeIcon className="h-4 w-4 ml-1" />,
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] tracking-tight">
      <div className="lg:sticky lg:top-20 flex justify-between">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative"
          id="nav"
        >
          <div className="flex flex-row space-x-0 pr-10">
            {Object.entries(navItems).map(([path, { name, icon }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:text-neutral-800 dark:hover:text-neutral-200 flex align-middle relative py-1 px-2 m-1"
                >
                  <span className="flex items-center space-x-1">
                    {icon}
                    <span>{name}</span>
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
        <SocialIcons />
      </div>
    </aside>
  );
}
