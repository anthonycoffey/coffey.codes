import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import JsonLd from '@/components/JsonLd';
import { baseUrl } from '@/app/sitemap';
import {
  LightBulbIcon,
  ArrowsPointingOutIcon,
  PuzzlePieceIcon,
  MapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title: 'Practical AI Solutions for Business Growth',
  description:
    'Move past AI hype. Production-ready, scalable AI/ML solutions integrated with your business for tangible, measurable results.',
  alternates: { canonical: '/lp/practical-ai' },
  openGraph: {
    title: 'Practical AI Solutions for Business Growth',
    description:
      'Production-ready, scalable AI/ML solutions integrated with your business for measurable ROI.',
    url: '/lp/practical-ai',
    type: 'website',
  },
};

export default function PracticalAiLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Practical AI', item: `${baseUrl}/lp/practical-ai` },
    ],
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Practical AI Solutions for Business Growth',
    provider: { '@type': 'Person', name: 'Anthony Coffey', url: baseUrl },
    areaServed: 'US',
    description:
      'Production-ready, scalable AI/ML solutions integrated with your business for tangible, measurable results.',
    url: `${baseUrl}/lp/practical-ai`,
  };
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-c-heading">
          Cut Through the AI Hype. Get AI Solutions That Actually Work.
        </h1>
        <p className="text-xl text-c-muted max-w-3xl mx-auto">
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
            Engineering Discipline Meets AI Innovation
          </h2>
          <p className="text-lg text-c-text mb-4">
            Successful AI isn&apos;t just about algorithms; it&apos;s about
            solid engineering. Leverage 12+ years of disciplined software
            development experience to ensure your AI initiatives are not just
            innovative, but also robust, well-integrated, and focused on
            measurable business value. Get the strategic oversight of a
            Fractional CTO combined with hands-on implementation expertise.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-c-text mb-6">
            <div className="flex items-start">
              <LightBulbIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Practical & Achievable:</span>{' '}
                AI solutions focused on real-world application.
              </span>
            </div>
            <div className="flex items-start">
              <ArrowsPointingOutIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Scalable & Sustainable:</span>{' '}
                Built for long-term performance and growth.
              </span>
            </div>
            <div className="flex items-start">
              <PuzzlePieceIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Seamless Integration:</span>{' '}
                Connect AI with your existing systems smoothly.
              </span>
            </div>
            <div className="flex items-start">
              <MapIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Clear Strategy & Guidance:
                </span>{' '}
                Understand the WHAT, WHY and HOW.
              </span>
            </div>
            <div className="flex items-start">
              <ChartBarIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Measurable ROI:</span> Focus on
                AI that delivers tangible business results.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free AI Strategy Call
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
              Discuss Your AI Initiative
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
          Explore Your AI Potential
        </h2>
        <p className="text-lg text-c-muted mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss how practical
          AI solutions can drive innovation and efficiency in your business.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free AI Call Now
        </a>
      </section>
    </div>
  );
}
