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

        <article className="prose prose-sm sm:prose-base lg:prose-lg xl:prose-xl 2xl:prose-2xl">
          <p>
            Austin, Texas-based Solutions Architect and Full Stack Developer
            with over a decade of experience in cloud computing (AWS, Google
            Cloud), software engineering, and business strategy.
          </p>
          <p>
            Specializing in delivering innovative, scalable solutions that solve
            complex real-world challenges. Whether optimizing cloud
            infrastructure or architecting full-stack applications, I leverage
            modern technologies and best practices in DevOps to build systems
            that are secure, efficient, and tailored to business needs.
          </p>
          <p>
            Proven ability to drive projects from concept to deployment,
            ensuring they align with strategic goals while maintaining
            flexibility for growth and innovation.
          </p>
        </article>

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
