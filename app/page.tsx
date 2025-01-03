import { backend, frontend } from './logos';
import LogoGrid from './components/LogoGrid';
import WorkHistory from './components/WorkHistory';
import {
  ChatBubbleOvalLeftIcon,
  DocumentArrowDownIcon,
  CalendarDaysIcon,
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
              Full Stack Software Engineer
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
            Need a hand? Let's Chat!
          </p>
          <div className="flex flex-col justify-between w-full space-y-4">
            <a
              href="/contact"
              className="px-6 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 no-underline flex items-center justify-center"
            >
              <ChatBubbleOvalLeftIcon className="mr-4 h-6 w-6 md:h-8 md:w-8" />
              Get in Touch!
            </a>
            <a
              target="_blank"
              href="https://calendly.com/antcoffpersonal/meet"
              className="px-6 py-3 border border-transparent text-base rounded-md text-white bg-gray-800 border-white no-underline flex items-center justify-center"
            >
              <CalendarDaysIcon className="mr-4 h-6 w-6 md:h-8 md:w-8" />
              Book Free Consultation
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
          Recruiting? Let's Connect!
        </p>
        <div className="flex flex-col justify-between w-full space-y-4 ">
          <a
            href="/contact"
            className="px-6 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 no-underline flex items-center justify-center"
          >
            <ChatBubbleOvalLeftIcon className="mr-4 h-6 w-6 md:h-8 md:w-8" />
            Message Me
          </a>
          <a
            target="_blank"
            href="https://calendly.com/antcoffpersonal/meet"
            className="px-6 py-3 border border-transparent text-base rounded-md text-white bg-gray-800 border-white no-underline flex items-center justify-center"
          >
            <CalendarDaysIcon className="mr-4 h-6 w-6 md:h-8 md:w-8" />
            Book Interview
          </a>
        </div>
      </div>
    </section>
  );
}
