import { backend, frontend } from './logos';
import LogoGrid from './components/LogoGrid';
import WorkHistory from './components/WorkHistory';
import {
  ChatBubbleOvalLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';
import SocialIcons from './components/SocialIcons';

export const metadata = {
  title:
    'Anthony Coffey | Solutions Architect & Software Engineer in Austin, Texas',
  description:
    'Portfolio blog site for Austin based artist and software engineer Anthony Coffey.',
};
export default function Page() {
  return (
    <section>
      <div className="page-content space-y-4">
        <h1 className="leading-1 text-3xl mb-0">Anthony Coffey</h1>
        <span className="block mt-1 text-xl p-0 italic">
          Solutions Architect & Software Engineer
        </span>
        <SocialIcons />

        <p className="leading-loose line-">
          Experienced Solutions Architect and Full Stack Developer with over a
          decade of expertise in cloud computing (AWS, Google Cloud), business
          strategy, and software engineering. Proven track record in building
          scalable, secure systems using modern web technologies and DevOps
          practices. Deep knowledge of cybersecurity and AI integration,
          delivering robust, real-world solutions through effective project
          management and technical leadership.
        </p>
        <p className="leading-loose">
          Most importantly, I’ve learned how to be a great collaborator —
          committed to every project I take on and passionate about delivering
          high value work.
        </p>
        <div className="flex flex-col justify-center bg-gray-900 p-6 md:p-10 rounded-lg items-center my-6 md:my-10">
          <p className="text-xl md:text-2xl font-bold mb-4 text-center">
            Want to learn more about my expertise?
          </p>
          <div className="flex flex-col md:flex-row justify-between w-full space-y-4 md:space-y-0 md:space-x-4">
            <a
              href="/contact"
              className="px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-blue-600 hover:bg-blue-800 no-underline flex items-center justify-center"
            >
              Let's chat!{' '}
              <ChatBubbleOvalLeftIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
            </a>
            <a
              target="_blank"
              href="/Anthony%20Coffey%20-%20Resume.pdf"
              className="px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-gray-600 hover:bg-gray-900 hover:border-white no-underline flex items-center justify-center"
            >
              Download Resume{' '}
              <DocumentArrowDownIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
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

      <div className="flex flex-col justify-center bg-gray-900 p-6 md:p-10 rounded-lg items-center my-6 md:my-10">
        <p className="text-xl md:text-2xl font-bold mb-4 text-center">
          How can I help?
        </p>
        <div className="flex flex-col md:flex-row justify-between w-full space-y-4 md:space-y-0 md:space-x-4">
          <a
            href="/contact"
            className="px-6 py-3 md:px-10 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-blue-600 hover:bg-blue-800 no-underline flex items-center justify-center"
          >
            Let's chat!{' '}
            <ChatBubbleOvalLeftIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
          </a>
          <a
            target="_blank"
            href="/Anthony%20Coffey%20-%20Resume.pdf"
            className="px-6 py-3 md:px-10 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-gray-600 hover:bg-gray-900 hover:border-white no-underline flex items-center justify-center"
          >
            Download Resume{' '}
            <DocumentArrowDownIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
          </a>
        </div>
      </div>
    </section>
  );
}
