import { backend, frontend } from './logos';
import LogoGrid from '../components/LogoGrid';
import Testimonials from '../components/Testimonials';
import SocialIcons from '../components/SocialIcons';
import ClientSections from '../components/ClientSections';
import {
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  ServerIcon,
  CommandLineIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';

export const metadata = {
  title: 'Anthony Coffey | Full Stack Software Engineer',
  description:
    'Build reliable, scalable software with Anthony Coffey. 12+ years of full stack engineering expertise in React, Node.js, and cloud architecture.',
};

export default function Page() {
  const sectionsContent = [
    {
      id: 'hero',
      // Add dark background
      background: 'bg-white dark:bg-neutral-900',
      maxWidth: 'max-w-4xl',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div>
            {/* Style heading and paragraph */}
            <h1 className="leading-tight text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Building Reliable, Scalable Software for Web & Mobile
            </h1>
            <p className="text-lg text-gray-800 dark:text-gray-300 mb-6">
              Full Stack Engineer with 12+ years of experience shipping
              production-ready applications. Specializing in React, Node.js, and
              Cloud Architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href="/contact"
                className="px-6 py-3 text-base text-center rounded-md text-white bg-blue-600 font-medium no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
                Start Your Project
              </a>
              {/* Style secondary button */}
              <a
                target="_blank"
                href="https://calendly.com/antcoffpersonal/meet"
                className="px-6 py-3 border border-blue-600 text-base text-center rounded-md text-blue-600 bg-white dark:bg-neutral-800 dark:text-blue-400 dark:border-blue-500 no-underline flex items-center justify-center hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors"
              >
                <CalendarDaysIcon className="mr-2 h-5 w-5" />
                Book Free Consultation
              </a>
            </div>
            <div className="flex justify-center md:hidden mt-12">
              <ChevronDownIcon className="h-8 w-8 text-blue-600 animate-bounce" />
            </div>
          </div>
          <div className="hidden md:flex justify-center md:justify-end mr-4">
            <div className="relative w-64 h-64 md:w-72 md:h-72">
              <Image
                width={330}
                height={330}
                src="/headshot.png"
                alt="Anthony Coffey"
                className="w-full h-full object-cover rounded-lg shadow-md "
              />
              {/* Style headshot info box */}
              <div className="absolute -bottom-12 -right-6 bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700">
                <p className="font-bold text-blue-600 dark:text-blue-400 text-base m-0 text-right">
                  Anthony Coffey
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-sm m-0 font-semibold">
                  Full Stack Software Engineer
                </p>
                <p className="text-gray-700 dark:text-gray-300 text-xs m-0 text-right">
                  Austin, Texas
                </p>
                <SocialIcons />
              </div>
            </div>
          </div>
        </div>
      ),
    },
    // Add other sections here...
    {
      id: 'services',
      // Add dark background
      background: 'bg-white dark:bg-neutral-900',
      maxWidth: 'max-w-6xl',
      content: (
        // Style main container
        <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-lg overflow-hidden">
          {/* Section Header */}
          <div className="bg-blue-600 text-white p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              Technical Expertise
            </h2>
          </div>

          {/* Unified Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {/* Performance Optimization */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b md:border-r border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <BoltIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Performance & Optimization
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Optimize application speed and efficiency through code-level
                improvements, database tuning, and efficient resource
                management.
              </p>
            </div>

            {/* Security Hardening */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b lg:border-r border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Secure App Development
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Implement robust security measures (OWASP Top 10, XSS/CSRF
                protection) to safeguard your applications and user data.
              </p>
            </div>

            {/* Application Development */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <CodeBracketIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Full Stack Development
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Build custom, production-ready web and mobile applications using
                React, React Native, Next.js, and Node.js.
              </p>
            </div>

            {/* System Architecture */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b lg:border-r border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <ServerIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Cloud Architecture
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Design and implement resilient, cost-effective cloud solutions
                on AWS and Google Cloud (GCP) that support sustainable growth.
              </p>
            </div>

            {/* AI/ML Integration */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b lg:border-r border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  AI-Powered Solutions
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Integrate practical AI/ML capabilities (Gemini, Cloud Vision)
                into applications to solve complex problems and enhance user
                experience.
              </p>
            </div>

            {/* DevOps */}
            {/* Style service item container, heading, paragraph */}
            <div className="border-b border-gray-200 dark:border-neutral-700 p-6 hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors">
              <div className="flex items-center mb-3">
                <CommandLineIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  DevOps & Infrastructure
                </h3>
              </div>
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Implement efficient CI/CD pipelines, containerization
                (Docker/Kubernetes), and infrastructure as code (Terraform) for
                reliable deployments.
              </p>
            </div>

            {/* CTA Area - spans 3 cells */}
            {/* Style CTA container, text, secondary button */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-50 dark:bg-neutral-700 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-800 dark:text-gray-200 font-medium">
                Ready to start your project?
              </p>
              <div className="flex gap-3">
                <a
                  href="/contact"
                  className="px-4 py-2 text-sm rounded-md text-white bg-blue-600 no-underline flex items-center hover:bg-blue-700 transition-colors"
                >
                  <ChatBubbleOvalLeftIcon className="mr-1 h-4 w-4" />
                  Discuss Your Project
                </a>
                <a
                  href="https://calendly.com/antcoffpersonal/meet"
                  target="_blank"
                  className="px-4 py-2 text-sm rounded-md text-blue-600 bg-white dark:bg-neutral-800 dark:text-blue-400 border border-blue-600 dark:border-blue-500 no-underline flex items-center hover:bg-blue-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <CalendarDaysIcon className="mr-1 h-4 w-4" />
                  Schedule Call
                </a>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'expertise',
      // Add dark background
      background: 'bg-white dark:bg-neutral-900',
      maxWidth: 'max-w-3xl',
      content: (
        <>
          {/* Technology Stack */}
          <div className="mb-20">
            {/* Style heading and paragraph */}
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-900 dark:text-white">
              Engineering Approach & Technologies
            </h2>
            <p className="text-center text-gray-800 dark:text-gray-300 mb-10">
              Delivering high-quality software through rigorous engineering
              practices and modern technologies.
            </p>

            {/* Style "What To Expect" box */}
            <div className="bg-blue-50 dark:bg-blue-950/50 rounded-xl mb-12 max-w-3xl mx-auto py-8 px-6 shadow-sm border border-blue-100 dark:border-blue-900/50">
              <h3 className="text-2xl font-bold mb-8 text-gray-900 dark:text-blue-100 text-center">
                Engineering Principles
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  {
                    title: 'Clean Code',
                    desc: 'Writing maintainable, self-documenting code that is easy to extend.',
                  },
                  {
                    title: 'High Test Coverage',
                    desc: 'Ensuring reliability with comprehensive unit and integration tests.',
                  },
                  {
                    title: 'Modern Tech Stack',
                    desc: 'Leveraging the latest tools like React, Next.js, and TypeScript.',
                  },
                  {
                    title: 'Practical AI Integration',
                    desc: 'Implementing AI/ML solutions that solve real-world problems.',
                  },
                  {
                    title: 'Production-Ready Focus',
                    desc: 'Delivering robust, secure, and deployable software.',
                  },
                  {
                    title: 'Clear Communication',
                    desc: 'Transparent updates and collaboration throughout the development process.',
                  },
                ].map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                    <div>
                      {/* Style list item text */}
                      <span className="block font-semibold text-gray-900 dark:text-gray-100">
                        {item.title}
                      </span>
                      <span className="block text-gray-700 dark:text-gray-300 text-sm">
                        {item.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <LogoGrid logos={[...frontend, ...backend]} />
          </div>

          {/* Testimonials */}
          <div className="max-w-lg mx-auto">
            {/* Style heading */}
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-gray-900 dark:text-white">
              Don&apos;t Just Take My Word For It!
            </h2>
            <Testimonials />
          </div>
        </>
      ),
    },
  ];

  return (
    <>
      {/* Client component that handles the animations */}
      <ClientSections sections={sectionsContent} />
    </>
  );
}
