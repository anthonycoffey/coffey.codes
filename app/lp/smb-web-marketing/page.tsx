import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';
import Image from 'next/image';
import SocialIcons from '@/components/SocialIcons';
import JsonLd from '@/components/JsonLd';
import { baseUrl } from '@/app/sitemap';
import {
  CodeBracketSquareIcon,
  ChartPieIcon,
  SparklesIcon,
  UserGroupIcon,
  RocketLaunchIcon,
} from '@heroicons/react/24/outline'; // Import necessary icons

export const metadata: Metadata = {
  title: 'Web & Marketing Tech for Small Businesses',
  description:
    'Professional websites (WordPress & JavaScript) wired up with Google Analytics and Tag Manager, so your SMB can track and grow with confidence.',
  alternates: { canonical: '/lp/smb-web-marketing' },
  openGraph: {
    title: 'Web & Marketing Tech for Small Businesses',
    description:
      'Professional websites integrated with Google Analytics and Tag Manager — built for SMB growth.',
    url: '/lp/smb-web-marketing',
    type: 'website',
  },
};

export default function SmbWebMarketingLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'SMB Web & Marketing', item: `${baseUrl}/lp/smb-web-marketing` },
    ],
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Web Development & Marketing Tech for Small Businesses',
    provider: { '@type': 'Person', name: 'Anthony Coffey', url: baseUrl },
    areaServed: 'US',
    description:
      'Professional websites (WordPress & JavaScript) integrated with Google Analytics and Tag Manager for SMB growth.',
    url: `${baseUrl}/lp/smb-web-marketing`,
  };
  return (
    <div className="container max-w-6xl mx-auto px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-c-heading">
          Stop Worrying About Your Website. Start Growing Your Business.
        </h1>
        <p className="text-xl text-c-muted max-w-3xl mx-auto">
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
            Beyond the Build: Websites That Drive Results
          </h2>
          <p className="text-lg text-c-text mb-4">
            You need a website that looks great *and* performs. With 12 years of
            experience in both WordPress and modern JavaScript development, I
            build high-quality sites designed for your specific needs.
            Crucially, I ensure they&apos;re properly configured with essential
            tools like Google Analytics and Tag Manager, so you can actually
            track your marketing efforts and understand what&apos;s working. Get
            a dependable partner, not just a developer.
          </p>
          {/* Enhanced Benefits List with Icons */}
          <div className="space-y-4 text-lg text-c-text mb-6">
            <div className="flex items-start">
              <CodeBracketSquareIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Flexible Development:</span>{' '}
                Expertise in WordPress & modern JS to fit your needs.
              </span>
            </div>
            <div className="flex items-start">
              <ChartPieIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Track Your Success:</span>{' '}
                Seamless Google Analytics & Tag Manager setup.
              </span>
            </div>
            <div className="flex items-start">
              <SparklesIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Professional & Polished:</span>{' '}
                High-quality design that builds trust.
              </span>
            </div>
            <div className="flex items-start">
              <UserGroupIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Reliable Partnership:</span>{' '}
                Dependable support and clear technical advice.
              </span>
            </div>
            <div className="flex items-start">
              <RocketLaunchIcon className="h-6 w-6 mr-3 mt-1 flex-shrink-0 text-accent1-dark" />
              <span>
                <span className="font-semibold">Marketing-Ready:</span> A web
                presence built to achieve your business goals.
              </span>
            </div>
          </div>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Web Strategy Call
          </a>
        </div>
        {/* Right column now includes headshot ABOVE the contact form */}
        <div className="flex flex-col items-center gap-10">
          {/* Original Contact Form Box */}
          <div className="bg-surface p-8 rounded-lg shadow-lg w-full">
            {/* Ensure form takes full width */}
            <h3 className="text-2xl font-semibold mb-6 text-center text-c-heading">
              Get Your Project Started
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
          Plan Your Integrated Web Presence
        </h2>
        <p className="text-lg text-c-muted mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss your website
          needs and how integrating marketing technology can help achieve your
          business objectives.
        </p>
        <a
          href="https://calendly.com/antcoffpersonal/meet" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-accent1-dark hover:opacity-90 text-surface font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Web Call Now
        </a>
      </section>
    </div>
  );
}
