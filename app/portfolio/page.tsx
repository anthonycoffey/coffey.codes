import { BriefcaseIcon } from '@heroicons/react/20/solid';
import PortfolioGrid from './components/PortfolioGrid';

export const metadata = {
  title: 'Portfolio',
  description: 'Explore some of my recent web and mobile software projects.',
};

export default async function Page({ searchParams }) {
  const portfolioItems = [
    {
      title: 'P2P Roadside Service App for Technicians ',
      description:
        'React Native mobile app that leverages an API provided by a custom CRM to give technicians the same job management features found in web app.',
      link: '#',
      details:
        "Developed using React Native and Tamagui UI library. Works on both iOS and Android, and includes a custom native module that handles payment via Authorize.net's Accept.js",
      playStoreLink:
        'https://play.google.com/store/apps/details?id=com.phoenix_mobile.app',
    },
  ];

  return (
    <section>
      <div className="page-content">
        <header>
          <h1 className="font-semibold text-2xl lg:text-3xl tracking-tighter">
            <BriefcaseIcon className="w-6 h-6 inline mr-2" /> Portfolio
          </h1>
          <span className="text-neutral-200">
            Explore some of my recent web and mobile software projects.
          </span>
        </header>
        <PortfolioGrid items={portfolioItems} />
      </div>
    </section>
  );
}
