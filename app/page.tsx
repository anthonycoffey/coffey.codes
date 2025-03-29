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
  title: 'Anthony Coffey - Full Stack Software Engineer | Austin, Texas',
  description:
    'Expert software development and consulting services - building scalable, secure, and high-performance applications for businesses of all sizes.',
};

export default function Page() {
  const sectionsContent = [
    {
      id: 'hero',
      background: 'bg-white',
      maxWidth: 'max-w-4xl',
      content: (
        <div className="grid grid-cols-1 md:grid-cols-2 items-center">
          <div>
            <h1 className="leading-tight text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Software Solutions That Drive Business Growth
            </h1>
            <p className="text-lg text-gray-800 mb-6">
              With 12+ years of experience, I deliver secure, high-performance
              applications that solve complex business challenges and drive
              measurable results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <a
                href="/contact"
                className="px-6 py-3 text-base text-center rounded-md text-white bg-blue-600 font-medium no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
              >
                <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
                Start Your Project
              </a>
              <a
                target="_blank"
                href="https://calendly.com/antcoffpersonal/meet"
                className="px-6 py-3 border border-blue-600 text-base text-center rounded-md text-blue-600 bg-white no-underline flex items-center justify-center hover:bg-blue-50 transition-colors"
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
                src="/headshot.jpg"
                alt="Anthony Coffey"
                className="w-full h-full object-cover rounded-lg shadow-md "
              />
              <div className="absolute -bottom-12 -right-6 bg-white p-3 rounded-lg shadow-md border border-gray-200">
                <p className="font-bold text-blue-600 text-base m-0 text-right">
                  Anthony Coffey
                </p>
                <p className="text-gray-700 text-sm m-0 font-semibold">
                  Solutions Architect & Full Stack SWE
                </p>
                <p className="text-gray-700 text-xs m-0 text-right">
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
      background: 'bg-white',
      maxWidth: 'max-w-6xl',
      content: (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Section Header */}
          <div className="bg-blue-600 text-white p-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold">
              Have Questions? Reach Out!
            </h2>
          </div>

          {/* Unified Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
            {/* Performance Optimization */}
            <div className="border-b md:border-r border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <BoltIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  Performance Optimization
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Transform sluggish systems into lightning-fast solutions that
                scale with your business growth.
              </p>
            </div>

            {/* Security Hardening */}
            <div className="border-b lg:border-r border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <ShieldCheckIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  Security Hardening
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Protect your business with enterprise-grade security practices
                and compliance-ready architecture.
              </p>
            </div>

            {/* Application Development */}
            <div className="border-b border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <CodeBracketIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  Application Development
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Custom web, mobile, and desktop applications built with modern
                technology stacks.
              </p>
            </div>

            {/* System Architecture */}
            <div className="border-b lg:border-r border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <ServerIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  System Architecture
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Scalable, maintainable, and cost-effective infrastructure
                design.
              </p>
            </div>

            {/* AI/ML Integration */}
            <div className="border-b lg:border-r border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <AdjustmentsHorizontalIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  AI/ML Integration
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Intelligent solutions leveraging cutting-edge AI and machine
                learning technologies.
              </p>
            </div>

            {/* DevOps */}
            <div className="border-b border-gray-200 p-6 hover:bg-blue-50 transition-colors">
              <div className="flex items-center mb-3">
                <CommandLineIcon className="h-6 w-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-bold text-gray-900">
                  DevOps
                </h3>
              </div>
              <p className="text-gray-700 mb-3">
                Streamlined development workflows and deployment pipelines.
              </p>
            </div>

            {/* CTA Area - spans 3 cells */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-gray-50 p-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-gray-800 font-medium">
                Ready to transform your business?
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
                  className="px-4 py-2 text-sm rounded-md text-blue-600 bg-white border border-blue-600 no-underline flex items-center hover:bg-blue-50 transition-colors"
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
      background: 'bg-white',
      maxWidth: 'max-w-3xl',
      content: (
        <>
          {/* Technology Stack */}
          <div className="mb-20">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-center text-gray-900">
              Full-Stack & Cloud Native Expertise
            </h2>
            <p className="text-center text-gray-800 mb-10">
              Leveraging modern technologies to build powerful solutions
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mb-12 max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-6 text-gray-900 text-center">
                Dependable Solutions That You Can Count On!
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Thorough requirements gathering and planning
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Agile development with regular updates
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Rigorous testing and quality assurance
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Clear, transparent communication
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Comprehensive documentation
                  </span>
                </div>
                <div className="flex items-start">
                  <CheckCircleIcon className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-800">
                    Ongoing support and maintenance options
                  </span>
                </div>
              </div>
            </div>

            <LogoGrid logos={[...frontend, ...backend]} />
          </div>

          {/* Testimonials */}
          <div className="max-w-lg mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center text-gray-900">
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
