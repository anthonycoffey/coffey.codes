import { backend, frontend } from './logos';
import LogoGrid from './components/LogoGrid';
import WorkHistory from './components/WorkHistory';
import {
  ChatBubbleOvalLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Anthony Coffey | Digital Strategist & Software Engineer in Austin, Texas',
  description: 'Portfolio blog site for Austin based artist and software engineer Anthony Coffey.',
};
export default function Page() {
  return (
    <section>
      <div className="page-content space-y-4">
        <h1 className="leading-1 text-3xl mb-0">Anthony Coffey</h1>
        <span className="block mt-1 text-xl p-0 italic">
          Digital Strategist & Software Engineer
        </span>

        <p className="leading-loose line-">
          In 2012, fresh out of college, I decided to take a leap and turn my
          passion for web development into a full-time business. I started
          small, knocking on doors and offering WordPress websites, which
          surprisingly helped me land my first few clients. It was a humble
          beginning, but it paved the way for everything that came after.
        </p>
        <p className="leading-loose">
          By 2014, encouraged by my mentors, I joined E-lance (which later
          became UpWork), and my freelance career truly took off. Since then,
          I've worked with hundreds of clients, developing custom software
          solutions tailored to their unique needs. Along the way, I've honed my
          skills in systems architecture, cloud computing, AI/ML and product
          management.
        </p>
        <p className="leading-loose">
          Most importantly, I’ve learned how to be a great collaborator —
          committed to every project I take on and passionate about delivering
          high value work.
        </p>
        <div className="flex flex-col justify-center bg-gray-900 p-10 rounded-lg items-center my-10">
          <p className="text-2xl font-bold mb-4 text-center">
            Want to learn more about my expertise?
          </p>
          <div className="flex flex-row justify-between w-full">
            <a
              href="/contact"
              className="px-8 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 hover:bg-blue-800 md:py-4 md:text-lg md:px-10 no-underline"
            >
              <span className="flex items-center">
                Let's chat! <ChatBubbleOvalLeftIcon className="ml-1 h-8 w-8" />
              </span>
            </a>
            <a
              target="_blank"
              href="/Anthony%20Coffey%20-%20Resume.pdf"
              className="px-8 py-3 border border-transparent text-base rounded-md text-white bg-gray-600 hover:bg-gray-900 hover:border-white md:py-4 md:text-lg md:px-10 no-underline"
            >
              <span className="flex items-center">
                Download Resume{' '}
                <DocumentArrowDownIcon className="ml-1 h-8 w-8" />
              </span>
            </a>
          </div>
        </div>
      </div>

      <div className="mb-10 px-4 mx-auto">
        <WorkHistory />
      </div>

      <div className="mb-10 px-4 text-center md:text-left mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center ">Frontend</h1>
        <LogoGrid logos={frontend} />
      </div>

      <div className="mb-10 px-4 text-center md:text-left mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center">Cloud/Backend</h1>
        <LogoGrid logos={backend} />
      </div>

      <div className="flex flex-col justify-center bg-gray-900 p-10 rounded-lg items-center my-10">
        <p className="text-2xl font-bold mb-4 text-center">How can I help?</p>
        <div className="flex flex-row justify-between w-full">
          <a
            href="/contact"
            className="px-8 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 hover:bg-blue-800 md:py-4 md:text-lg md:px-10 no-underline"
          >
            <span className="flex items-center">
              Let's chat! <ChatBubbleOvalLeftIcon className="ml-1 h-8 w-8" />
            </span>
          </a>
          <a
            target="_blank"
            href="/Anthony%20Coffey%20-%20Resume.pdf"
            className="px-8 py-3 border border-transparent text-base rounded-md text-white bg-gray-600 hover:bg-gray-900 hover:border-white md:py-4 md:text-lg md:px-10 no-underline"
          >
            <span className="flex items-center">
              Download Resume <DocumentArrowDownIcon className="ml-1 h-8 w-8" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
