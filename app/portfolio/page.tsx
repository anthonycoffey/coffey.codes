import { BriefcaseIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'Portfolio',
  description:
    ' Explore a selection of my recent web and mobile software projects.',
};

export default async function Page({ searchParams }) {
  const portfolioItems = [
    {
      title: 'P2P Roadside Service App for Technicians ',
      description:
        'React Native mobile app that leverages an API provided by a custom CRM to give technicians the same job management features found in web app.',
      link: '#',
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
            Explore a selection of my recent web and mobile software projects.
          </span>
        </header>
        {/* Content Grid Section */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolioItems.map((item, index) => (
            <a
              key={index}
              href={item.link}
              className="block p-6 bg-neutral-800 rounded-lg shadow hover:shadow-lg hover:bg-neutral-700 transition"
            >
              <h2 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h2>
              <p className="text-neutral-400">{item.description}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
