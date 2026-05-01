import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import JsonLd from '@/components/JsonLd';
import { baseUrl } from '@/app/sitemap';
import {
  BuildingLibraryIcon,
  ServerStackIcon,
  CpuChipIcon,
  ScaleIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title: 'Senior Engineer on Retainer for Agencies & Tech Teams',
  description:
    'Embedded senior developer / lead dev for agencies, startups, and tech teams. 12+ years shipping production work in architecture, DevOps, and practical AI integration — no ramp, no hiring loop.',
  alternates: { canonical: '/lp/strategic-partners' },
  openGraph: {
    title: 'Senior Engineer on Retainer for Agencies & Tech Teams',
    description:
      'Embedded senior developer / lead dev for agencies, startups, and tech teams — architecture, DevOps, and practical AI, hands-on the keyboard.',
    url: '/lp/strategic-partners',
    type: 'website',
  },
};

export default function StrategicPartnersLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Senior Engineer on Retainer',
        item: `${baseUrl}/lp/strategic-partners`,
      },
    ],
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Senior Developer / Lead Dev on Retainer',
    provider: { '@type': 'Person', name: 'Anthony Coffey', url: baseUrl },
    areaServed: 'US',
    description:
      'Embedded senior engineer for agencies, startups, and tech teams — architecture, DevOps, and practical AI/ML integration. Hands-on delivery, no ramp, no hiring loop.',
    url: `${baseUrl}/lp/strategic-partners`,
  };
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-c-heading">
          Need Senior Hands on the Keyboard? Plug in a Lead Dev Without the
          Hiring Loop.
        </h1>
        <p className="text-xl text-c-muted max-w-3xl mx-auto">
          Have a critical project you can&apos;t staff fast enough? Anthony
          Coffey embeds with startups, agencies, and tech teams as a senior
          developer / lead dev on retainer. 12+ years shipping production
          systems in architecture, DevOps, and practical AI integration — no
          ramp time, no junior bait-and-switch, no slide decks.
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
            A Senior Engineer Who Owns Delivery
          </h2>
          <p className="text-lg text-c-text mb-4">
            Get immediate access to 12+ years of hands-on experience in
            software architecture, DevOps, and practical AI integration.
            Whether you need someone to lead a tricky implementation or just an
            extra senior pair of hands that can ship without daily oversight,
            you bring on an experienced IC who&apos;s done this before — many
            times.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-c-text mb-6">
            <div className="flex items-start">
              <BuildingLibraryIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Architecture & Tech Decisions:
                </span>{' '}
                Confident calls on the structural choices that bite later.
              </span>
            </div>
            <div className="flex items-start">
              <ServerStackIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">DevOps & CI/CD:</span>{' '}
                Streamline development and deployment with status checks and
                uptime monitoring done right.
              </span>
            </div>
            <div className="flex items-start">
              <CpuChipIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">
                  Practical AI Implementation:
                </span>{' '}
                Ship real AI features — LLM integration, automation — not
                experiments.
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
                  Embedded Senior Capacity:
                </span>{' '}
                Plug in for a project or stay on retainer — no hiring loop.
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
              Discuss Your Project
            </h3>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section id="schedule-call" className="text-center bg-bg-alt rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-c-heading">
          Talk Through the Work
        </h2>
        <p className="text-lg text-c-muted mb-6 max-w-2xl mx-auto">
          Book a free 20-minute call to walk through the project. If it&apos;s
          a fit, we&apos;ll talk scope and how to get a senior dev on it
          without the hiring loop.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Intro Call
        </a>
      </section>
    </div>
  );
}
