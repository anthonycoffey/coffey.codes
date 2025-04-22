import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import {
  LightBulbIcon,
  ArrowsPointingOutIcon,
  PuzzlePieceIcon,
  MapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title:
    'Practical AI Solutions for Business Growth | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Move beyond AI hype with Anthony Coffey, Solutions Architect & AI/ML Specialist. Get production-ready, scalable AI/ML solutions integrated with your business for tangible results.',
};

export default function PracticalAiLandingPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Cut Through the AI Hype. Get AI Solutions That Actually Work.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          Ready to leverage AI but tired of the buzzwords? For businesses
          seeking tangible results, not just experiments, Anthony Coffey is your
          Practical Innovation Partner. Get production-ready AI solutions, built
          on robust, scalable foundations, and integrated seamlessly into your
          operations.
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
            Engineering Discipline Meets AI Innovation
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Successful AI isn&apos;t just about algorithms; it&apos;s about
            solid engineering. Leverage 12+ years of disciplined software
            development experience to ensure your AI initiatives are not just
            innovative, but also robust, well-integrated, and focused on
            measurable business value. Get the strategic oversight of a
            Fractional CTO combined with hands-on implementation expertise.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <div className="flex items-start">
              <LightBulbIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Practical & Achievable:</span> AI
                solutions focused on real-world application.
              </span>
            </div>
            <div className="flex items-start">
              <ArrowsPointingOutIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Scalable & Sustainable:</span>{' '}
                Built for long-term performance and growth.
              </span>
            </div>
            <div className="flex items-start">
              <PuzzlePieceIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Seamless Integration:</span>{' '}
                Connect AI with your existing systems smoothly.
              </span>
            </div>
            <div className="flex items-start">
              <MapIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Clear Strategy & Guidance:</span>{' '}
                Understand the 'what, why, and how'.
              </span>
            </div>
            <div className="flex items-start">
              <ChartBarIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Measurable ROI:</span> Focus on AI
                that delivers tangible business results.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free AI Strategy Call
          </a>
        </div>
        {/* Right column now includes headshot ABOVE the contact form */}
        <div className="flex flex-col items-center gap-10">
          {' '}
          {/* Use flex-col to stack items */}
          {/* Original Contact Form Box */}
          <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full">
            {' '}
            {/* Ensure form takes full width */}
            <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">
              Discuss Your AI Initiative
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section
        id="schedule-call"
        className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg"
      >
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">
          Explore Your AI Potential
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss how practical
          AI solutions can drive innovation and efficiency in your business.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free AI Call Now
        </a>
      </section>
    </div>
  );
}
