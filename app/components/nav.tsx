import Link from 'next/link';
import {
  HomeIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  ClipboardDocumentCheckIcon,
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
  '/case-studies': {
    name: 'case studies',
    icon: <ClipboardDocumentCheckIcon className="h-4 w-4 ml-1" />,
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
        <a href="/">
          <img src="/logo-horizontal.svg" alt="logo" className="h-20" />
        </a>
      </div>
      <div className="flex justify-between">
        <nav
          className="flex flex-row items-start relative px-0 pb-0 fade md:overflow-auto scroll-pr-6 md:relative mb-4"
          id="nav"
        >
          <div className="flex flex-row space-x-1">
            {Object.entries(navItems).map(([path, { name, icon }]) => {
              return (
                <Link
                  key={path}
                  href={path}
                  className="transition-all hover:underline flex align-middle relative"
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
