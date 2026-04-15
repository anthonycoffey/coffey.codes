import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import {
  BuildingLibraryIcon,
  ServerStackIcon,
  CpuChipIcon,
  ScaleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

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
        <h1 className="text-4xl font-bold mb-4 text-c-heading">
          Need Senior Expertise? Augment Your Team with a Strategic Tech
          Partner.
        </h1>
        <p className="text-xl text-c-muted max-w-3xl mx-auto">
          Facing complex technical hurdles or need strategic leadership for a
          critical project? Anthony Coffey partners with startups, agencies, and
          tech teams as a Fractional CTO or Specialist Lead. Augment your
          existing team with deep expertise in architecture, DevOps, and AI to
          confidently tackle ambitious goals and deliver superior results.
        </p>
        <div className="flex justify-center mb-24 mt-10">
          <div className="relative w-64 h-64 md:w-72 md:h-72">
            <Image
              width={330}
              height={330}
              src="/headshot.png"
              alt="Anthony Coffey"
              className="w-full h-full object-cover rounded-lg shadow-md"
            />
            <div className="absolute -bottom-12 -right-6 bg-surface p-3 rounded-lg shadow-md border border-border">
              <p className="font-bold text-accent1-dark text-base m-0 text-right">
                Anthony Coffey
              </p>
              <p className="text-c-text text-sm m-0 font-semibold">
                Senior Solutions Architect & AI Specialist
              </p>
              <p className="text-c-text text-xs m-0 text-right">
                Austin, Texas
              </p>
              <SocialIcons />
            </div>
          </div>
        </div>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-c-heading">
            Your On-Demand Technical Leadership
          </h2>
          <p className="text-lg text-c-text mb-4">
            Gain immediate access to 12+ years of specialized experience in
            software architecture, DevOps, and practical AI integration. Whether
            you need high-level strategic guidance or hands-on leadership for
            complex implementations, partner with a proven expert to navigate
            technical challenges, ensure best practices, and drive your most
            important projects forward.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-c-text mb-6">
            <div className="flex items-start">
              <BuildingLibraryIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Expert Architecture & Tech Strategy:
                </span>{' '}
                Make confident technology decisions.
              </span>
            </div>
            <div className="flex items-start">
              <ServerStackIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">DevOps & CI/CD Mastery:</span>{' '}
                Streamline development and deployment.
              </span>
            </div>
            <div className="flex items-start">
              <CpuChipIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Practical AI Implementation:
                </span>{' '}
                Integrate AI to enhance your offerings.
              </span>
            </div>
            <div className="flex items-start">
              <ScaleIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Scalable & Reliable Systems:
                </span>{' '}
                Build robust solutions for the long term.
              </span>
            </div>
            <div className="flex items-start">
              <UserPlusIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Seamless Team Augmentation:
                </span>{' '}
                Add senior expertise exactly when needed.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Partnership Call
          </a>
        </div>
        {/* Right column now includes headshot ABOVE the contact form */}
        <div className="flex flex-col items-center gap-10">
          {' '}
          {/* Use flex-col to stack items */}
          {/* Original Contact Form Box */}
          <div className="bg-surface p-8 rounded-lg shadow-lg w-full">
            {' '}
            {/* Ensure form takes full width */}
            <h3 className="text-2xl font-semibold mb-6 text-center text-c-heading">
              Discuss a Strategic Partnership
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section
        id="schedule-call"
        className="text-center py-12 bg-bg-alt rounded-lg"
      >
        <h2 className="text-3xl font-semibold mb-4 text-c-heading">
          Explore Collaboration Opportunities
        </h2>
        <p className="text-lg text-c-muted mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute call to discuss how specialized
          expertise can augment your team and accelerate your project success.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Partnership Call Now
        </a>
      </section>
    </div>
  );
}
