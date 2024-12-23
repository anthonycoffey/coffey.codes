import { BriefcaseIcon } from '@heroicons/react/20/solid';

export const metadata = {
  title: 'Portfolio',
  description:
    ' Explore a selection of my recent web and mobile software projects.',
};

export default async function Page({ searchParams }) {
  return (
    <section>
      <div className="page-content">
        <h1 className="font-semibold text-2xl lg:text-3xl tracking-tighter">
          <BriefcaseIcon className="w-6 h-6 inline mr-2" /> Portfolio
        </h1>
        <span className="text-neutral-200">
          Explore a selection of my recent web and mobile software projects.
        </span>
      </div>
    </section>
  );
}
