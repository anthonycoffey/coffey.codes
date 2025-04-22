import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import {
  CodeBracketSquareIcon,
  ChartPieIcon,
  SparklesIcon,
  UserGroupIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title:
    'Integrated Web Presence & Marketing Tech for SMBs | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Expert web development (WordPress, JavaScript) combined with essential marketing tech setup (Analytics, GTM) for SMBs by Anthony Coffey, Solutions Architect & AI/ML Specialist.',
};

export default function SmbWebMarketingLandingPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Stop Worrying About Your Website. Start Growing Your Business.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          Is your website just an online brochure, or is it actively helping you
          grow? For SMBs needing more than just a pretty design, Anthony Coffey
          delivers professional websites integrated with essential marketing
          tools (like Google Analytics & Tag Manager) – all backed by reliable,
          expert support.
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
            Beyond the Build: Websites That Drive Results
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            You need a website that looks great *and* performs. With 12 years of
            experience in both WordPress and modern JavaScript development, I
            build high-quality sites designed for your specific needs.
            Crucially, I ensure they&apos;re properly configured with essential tools
            like Google Analytics and Tag Manager, so you can actually track
            your marketing efforts and understand what&apos;s working. Get a
            dependable partner, not just a developer.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <div className="flex items-start">
              <CodeBracketSquareIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Flexible Development:</span>{' '}
                Expertise in WordPress & modern JS to fit your needs.
              </span>
            </div>
            <div className="flex items-start">
              <ChartPieIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Track Your Success:</span>{' '}
                Seamless Google Analytics & Tag Manager setup.
              </span>
            </div>
            <div className="flex items-start">
              <SparklesIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Professional & Polished:</span>{' '}
                High-quality design that builds trust.
              </span>
            </div>
            <div className="flex items-start">
              <UserGroupIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Reliable Partnership:</span>{' '}
                Dependable support and clear technical advice.
              </span>
            </div>
            <div className="flex items-start">
              <RocketLaunchIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-blue-600 dark:text-blue-400" />
              <span>
                <span className="font-semibold">Marketing-Ready:</span> A web
                presence built to achieve your business goals.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Web Strategy Call
          </a>
        </div>
        {/* Right column now includes headshot ABOVE the contact form */}
        <div className="flex flex-col items-center gap-10">
          {/* Original Contact Form Box */}
          <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg w-full">
            {/* Ensure form takes full width */}
            <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">
              Get Your Project Started
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
          Plan Your Integrated Web Presence
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss your website
          needs and how integrating marketing technology can help achieve your
          business objectives.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Web Call Now
        </a>
      </section>
    </div>
  );
}
