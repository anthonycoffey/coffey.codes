import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';

export const metadata: Metadata = {
  title:
    'Senior-Level Expertise for Strategic Partners | Anthony Coffey - Solutions Architect, AI/ML',
  description:
    'Augment your team with specialized expertise from Anthony Coffey, Solutions Architect & AI/ML Specialist, in software architecture, DevOps, and practical AI/ML integration. Fractional CTO & Specialist Lead services.',
};

export default function StrategicPartnersLandingPage() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Need Senior Expertise? Augment Your Team with a Strategic Tech Partner.
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          Facing complex technical hurdles or need strategic leadership for a critical project? Anthony Coffey partners with startups, agencies, and tech teams as a Fractional CTO or Specialist Lead. Augment your existing team with deep expertise in architecture, DevOps, and AI to confidently tackle ambitious goals and deliver superior results.
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
            Your On-Demand Technical Leadership
          </h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Gain immediate access to 12+ years of specialized experience in software architecture, DevOps, and practical AI integration. Whether you need high-level strategic guidance or hands-on leadership for complex implementations, partner with a proven expert to navigate technical challenges, ensure best practices, and drive your most important projects forward.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Expert Architecture & Tech Strategy: Make confident technology decisions.</li>
            <li>DevOps & CI/CD Mastery: Streamline development and deployment.</li>
            <li>Practical AI Implementation: Integrate AI to enhance your offerings.</li>
            <li>Scalable & Reliable Systems: Build robust solutions for the long term.</li>
            <li>Seamless Team Augmentation: Add senior expertise exactly when needed.</li>
          </ul>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Partnership Call
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
              Discuss a Strategic Partnership
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
          Explore Collaboration Opportunities
        </h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute call to discuss how specialized
          expertise can augment your team and accelerate your project success.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Partnership Call Now
        </a>
      </section>
    </div>
  );
}
