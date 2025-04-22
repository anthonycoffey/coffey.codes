import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import {
  ClockIcon,
  ArrowsPointingOutIcon,
  UserGroupIcon,
  ChartBarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title:
    'Custom Web & Mobile Apps for Established SMEs | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Reliable, scalable web and mobile applications built with senior-level expertise by Anthony Coffey, Solutions Architect & AI/ML Specialist, for established SMEs seeking long-term growth.',
};

export default function SmeWebMobileLandingPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Stop Fighting Unreliable Tech. Get Custom Apps That Fuel Growth.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          Tired of tech projects that derail or agencies that disappear?
          Established SMEs need reliable, scalable web and mobile applications
          built for the long haul. Anthony Coffey offers a direct, senior-level
          partnership – think of it as your Fractional CTO – focused squarely on
          delivering robust solutions you can depend on.
        </p>
        <div className="flex justify-center mb-24 mt-10">
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <Image
              width={330}
              height={330}
              src="/headshot.jpg"
              alt="Anthony Coffey"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <div className="absolute -bottom-12 -right-6 bg-white dark:bg-neutral-800 p-3 rounded-lg shadow-md border border-gray-200 dark:border-neutral-700">
              <p className="font-bold text-blue-600 dark:text-blue-400 text-base m-0 text-right">
                Anthony Coffey
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-sm m-0 font-semibold">
                Senior Solutions Architect & AI Specialist
              </p>
              <p className="text-gray-700 dark:text-gray-300 text-xs m-0 text-right">
                Austin, Texas
              </p>
              <SocialIcons />
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
            Experience That Translates to Reliable Results
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Benefit from 12+ years architecting sustainable, scalable solutions
            specifically designed for long-term business growth. Avoid the
            costly mistakes and delays common with junior teams or impersonal
            agencies. Get solutions built correctly from the start, saving you
            time and resources down the road.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <div className="flex items-start">
              <ClockIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">
                  On-Time, On-Budget Delivery:
                </span>{' '}
                Reliable execution you can count on.
              </span>
            </div>
            <div className="flex items-start">
              <ArrowsPointingOutIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Built to Scale:</span> Solutions
                architected for future growth and easy maintenance.
              </span>
            </div>
            <div className="flex items-start">
              <UserGroupIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Your Fractional CTO:</span>{' '}
                Direct access to senior-level strategic guidance.
              </span>
            </div>
            <div className="flex items-start">
              <ChartBarIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Business-Focused:</span>{' '}
                Tangible outcomes prioritized over technical jargon.
              </span>
            </div>
            <div className="flex items-start">
              <ShieldCheckIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Avoid Costly Rework:</span> Get
                it right the first time with expert architecture.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Strategy Call
          </a>
        </div>
        <div className="flex flex-col items-center gap-10">
          <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full">
            <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">
              Ready to Discuss Your Project?
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      <section
        id="schedule-call"
        className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
      >
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
          Let&apos;s Strategize Your Next Application
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss your specific
          needs and how we can build a reliable, scalable solution together.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Call Now
        </a>
      </section>
    </div>
  );
}
