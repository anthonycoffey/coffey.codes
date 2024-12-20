import { backend, frontend } from './logos';
import LogoGrid from './components/LogoGrid';
import WorkHistory from './components/WorkHistory';
import {
  ChatBubbleOvalLeftIcon,
  DocumentArrowDownIcon,
} from '@heroicons/react/24/solid';
import SocialIcons from './components/SocialIcons';
import Testimonials from './components/Testimonials';

export const metadata = {
  title:
    'Anthony Coffey | Solutions Architect & Software Engineer in Austin, Texas',
  description:
    'Portfolio blog site for Austin based artist and software engineer Anthony Coffey.',
};
export default function Page() {
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
        <article className="prose-lg xl:prose-xl 2xl:prose-2xl">
          <p className="pt-4">
            Austin, Texas — Full Stack Engineer with over a decade of experience
            building reliable, scalable software that drives business growth. I
            partner with SMBs, agencies, and product owners to create digital
            products or improve existing ones by leveraging event-driven
            architecture, serverless computing, and cloud-native technologies.
          </p>
          <p>
            My approach begins with an important question, "Why?", and focuses
            on identifying the most suitable tools and strategies to drive
            clear, efficient results, cutting through unnecessary complexity at
            every stage of development.
          </p>
        </article>

        <div className="flex flex-col justify-center bg-gray-800 p-6 md:p-10 rounded-lg items-center my-6 md:my-10">
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
              className="px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-gray-600 hover:bg-gray-800 hover:border-white no-underline flex items-center justify-center"
            >
              Download Resume{' '}
              <DocumentArrowDownIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
            </a>
          </div>
        </div>
      </div>

      <div className="mb-10 px-4 mx-auto">
        <Testimonials />
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

      <div className="flex flex-col justify-center bg-gray-800 p-6 md:p-10 rounded-lg items-center my-6 md:my-10">
        <p className="text-xl md:text-2xl font-bold mb-4 text-center">
          How can I help?
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
            className="px-6 py-3 md:px-8 md:py-4 border border-transparent text-base md:text-lg rounded-md text-white bg-gray-600 hover:bg-gray-800 hover:border-white no-underline flex items-center justify-center"
          >
            Download Resume{' '}
            <DocumentArrowDownIcon className="ml-1 h-6 w-6 md:h-8 md:w-8" />
          </a>
        </div>
      </div>
    </section>
  );
}
