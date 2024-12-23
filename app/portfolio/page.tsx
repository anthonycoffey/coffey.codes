import SocialIcons from '../components/SocialIcons';
import {
  ChatBubbleOvalLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Portfolio',
  description: 'Work portfolio of current and past projects',
};

export default async function Page({ searchParams }) {
  return (
    <section>
      <div className="page-content">
        <div className="grid grid-cols-2 gap-2 items-center bg-blue-600 rounded-xl p-2">
          <div className="px-2">
            <h1 className="leading-1 text-2xl md:text-3xl m-0">
              Anthony Coffey
            </h1>
            <p className="md:text-xl m-0 p-0 mb-2">
              Full-Stack Software Engineer
            </p>
            <SocialIcons />
          </div>
          <div className="flex justify-end">
            <img
              src="/headshot.jpg"
              alt="Anthony Coffey"
              className="rounded-xl w-40 shadow-2xl border-2 border-blue-500"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
