import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
} from '@heroicons/react/20/solid';

const navItems = {
  '/': {
    name: 'home',
    icon: <HomeIcon className="h-4 w-4 ml-1" />,
  },
  '/articles': {
    name: 'articles',
    icon: <DocumentTextIcon className="h-4 w-4 ml-1" />,
  },
  '/contact': {
    name: 'contact',
    icon: <EnvelopeIcon className="h-4 w-4 ml-1" />,
  },
};

export function Navbar() {
  return (
    <aside className="-ml-[8px] tracking-tight">
      <div className="flex justify-center">
        <img src="/logo-horizontal.svg" alt="logo" className="h-20" />
      </div>
      <div className="flex justify-between">
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
                  className="transition-all hover:underline flex align-middle relative py-1 px-2 m-1"
                >
                  <span className="flex items-center space-x-1">
                    {icon}
                    <span>{name}</span>
                  </span>
                </Link>
              );
            })}
            {/* <SocialIcons /> */}
          </div>
        </nav>
      </div>
    </aside>
  );
}
