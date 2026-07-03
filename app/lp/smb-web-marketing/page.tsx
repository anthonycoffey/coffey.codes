import React from 'react';
import { Metadata } from 'next';
import JsonLd from '@/components/JsonLd';
import { baseUrl } from '@/app/sitemap';
import LeadForm from '@/components/LeadForm';
import LpHero from '@/components/lp/LpHero';
import LpBenefits from '@/components/lp/LpBenefits';
import LpProof from '@/components/lp/LpProof';
import LpFinalCta from '@/components/lp/LpFinalCta';
import {
  GlobeAltIcon,
  ChartBarIcon,
  BoltIcon,
  WrenchScrewdriverIcon,
} from '@heroicons/react/24/outline';

const LP_TITLE = 'Web & Marketing Tech for Small Businesses';
const LP_DESCRIPTION =
  'Professional websites integrated with Google Analytics and Tag Manager — built for SMB growth.';
const LP_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent(LP_TITLE)}&category=${encodeURIComponent('Web Marketing')}`;

export const metadata: Metadata = {
  title: LP_TITLE,
  description:
    'Professional websites (WordPress & JavaScript) wired up with Google Analytics and Tag Manager, so your SMB can track and grow with confidence.',
  alternates: { canonical: '/lp/smb-web-marketing' },
  openGraph: {
    title: LP_TITLE,
    description: LP_DESCRIPTION,
    url: '/lp/smb-web-marketing',
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

const TECH_LOGOS = [
  'wordpress.svg',
  'react.svg',
  'nodejs.svg',
  'typescript-icon.svg',
  'tailwindcss.svg',
  'php.svg',
  'mysql.svg',
  'google-cloud.svg',
  'vercel.svg',
  'sass.svg',
  'javascript.svg',
  'firebase.svg',
];

export default function SmbWebMarketingLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'SMB Web & Marketing',
        item: `${baseUrl}/lp/smb-web-marketing`,
      },
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
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />

      <LpHero
        eyebrow="Websites That Work"
        title="A website that brings you customers, not just sits there."
        subhead="For small businesses that need a professional site wired to actually get results. Expert web development plus the analytics and tracking most shops skip, built by a senior engineer in Austin."
        credibility={[
          'Professional websites built by a senior engineer, not a template farm',
          'Analytics and conversion tracking set up from day one',
          'Austin-based, local accountability, no offshore handoff',
        ]}
        formHeading="Get your project started"
        formWindowTitle="new_website.exe"
        form={<LeadForm formName="lp_smb_web_marketing" />}
      />

      <LpBenefits
        heading="More than a pretty page"
        intro="A website should earn its cost. That means it is built to convert and wired so you can see what is working."
        items={[
          {
            icon: GlobeAltIcon,
            title: 'Built to convert',
            body: 'Structured and written to turn visitors into inquiries, not just look nice.',
          },
          {
            icon: ChartBarIcon,
            title: 'Tracking that proves it',
            body: 'GA4 and conversion tracking so you can see what is actually bringing in business.',
          },
          {
            icon: BoltIcon,
            title: 'Fast and reliable',
            body: 'Quick to load and dependable, on modern infrastructure.',
          },
          {
            icon: WrenchScrewdriverIcon,
            title: 'A real person to call',
            body: 'One engineer you can reach directly when something needs to change.',
          },
        ]}
      />

      <LpProof
        intro="The same engineering rigor goes into a small-business site as a large custom build."
        caseStudies={[
          {
            href: '/case-study/data-driven-seo-pipeline',
            title: 'Turning search data into growth',
            blurb: 'How a data pipeline surfaces the pages and queries actually worth investing in.',
          },
          {
            href: '/case-study/postgis-fleet-optimization',
            title: 'Custom software, delivered',
            blurb: 'A data-heavy application shipped end to end, proof the same care goes into every build.',
          },
        ]}
        techLogos={TECH_LOGOS}
      />

      <LpFinalCta
        heading="Ready for a site that pulls its weight?"
        body="Book a free 20-minute call to talk through your business and what your website should be doing for it."
        ctaLabel="Book your free web call"
      />
    </div>
  );
}
