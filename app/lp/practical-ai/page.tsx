import React from 'react';
import LeadForm from '@/components/LeadForm';
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

const LP_TITLE = 'Practical AI Solutions for Business Growth';
const LP_DESCRIPTION =
  'Production-ready, scalable AI/ML solutions integrated with your business for measurable ROI.';
const LP_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent(LP_TITLE)}&category=${encodeURIComponent('AI Consulting')}`;

export const metadata: Metadata = {
  title: LP_TITLE,
  description:
    'Move past AI hype. Production-ready, scalable AI/ML solutions integrated with your business for tangible, measurable results.',
  alternates: { canonical: '/lp/practical-ai' },
  openGraph: {
    title: LP_TITLE,
    description: LP_DESCRIPTION,
    url: '/lp/practical-ai',
    type: 'website',
    images: [{ url: LP_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: LP_TITLE,
    description: LP_DESCRIPTION,
    images: [LP_OG_IMAGE],
  },
};

export default function PracticalAiLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Practical AI',
        item: `${baseUrl}/lp/practical-ai`,
      },
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
          Ready to use AI but tired of the buzzwords? For businesses that want
          tangible results — not another experiment — Anthony Coffey is the
          senior engineer who actually ships the work. Production-ready AI
          features, built on robust, scalable foundations and integrated
          cleanly into your existing systems.
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
            solid engineering. With 12+ years of disciplined software
            development under the belt, you get AI work that&apos;s not just
            interesting — it&apos;s robust, well-integrated, and focused on
            measurable business value. Senior engineering judgment and
            hands-on implementation from the same person.
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
                  Clear on the WHAT, WHY and HOW:
                </span>{' '}
                You always know what&apos;s being built and why — no black-box
                handoffs.
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
            Book a Free Intro Call
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
            <LeadForm formName="lp_practical_ai" />
          </div>
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section id="schedule-call" className="text-center bg-bg-alt rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-c-heading">
          Explore Your AI Potential
        </h2>
        <p className="text-lg text-c-muted mb-6 max-w-2xl mx-auto">
          Book a free 20-minute intro call to talk through the AI feature or
          automation you have in mind, and how to ship it on a solid
          engineering foundation.
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
