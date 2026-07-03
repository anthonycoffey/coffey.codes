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
  ShieldCheckIcon,
  ArrowsPointingOutIcon,
  PuzzlePieceIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const LP_TITLE = 'Custom Web & Mobile Apps for Growing SMEs';
const LP_DESCRIPTION =
  'Reliable, scalable web and mobile apps built directly by a senior engineer with 12+ years shipping production systems.';
const LP_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent(LP_TITLE)}&category=${encodeURIComponent('Web & Mobile')}`;

export const metadata: Metadata = {
  title: LP_TITLE,
  description:
    'Reliable, scalable web and mobile apps built by a senior developer. Direct, hands-on engineering for established SMEs focused on long-term growth — no junior hand-off, no agency overhead.',
  alternates: { canonical: '/lp/sme-web-mobile' },
  openGraph: {
    title: LP_TITLE,
    description: LP_DESCRIPTION,
    url: '/lp/sme-web-mobile',
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
  'react.svg',
  'nodejs.svg',
  'typescript-icon.svg',
  'expo.svg',
  'python.svg',
  'postgresql.svg',
  'aws.svg',
  'google-cloud.svg',
  'firebase.svg',
  'graphql.svg',
  'tailwindcss.svg',
  'vercel.svg',
];

export default function SmeWebMobileLandingPage() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Custom Web & Mobile Apps',
        item: `${baseUrl}/lp/sme-web-mobile`,
      },
    ],
  };
  const service = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Custom Web & Mobile Application Development',
    provider: { '@type': 'Person', name: 'Anthony Coffey', url: baseUrl },
    areaServed: 'US',
    description:
      'Reliable, scalable web and mobile apps built directly by a senior engineer for established SMEs.',
    url: `${baseUrl}/lp/sme-web-mobile`,
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />

      <LpHero
        eyebrow="Custom Web & Mobile"
        title="Stop fighting unreliable tech. Get apps built to last."
        subhead="For established businesses tired of stalled projects and agency churn. One senior engineer owns your custom web or mobile build end to end, and delivers on time and to spec."
        credibility={[
          '12+ years building production web and mobile applications',
          'One senior engineer owns delivery, no junior bait-and-switch',
          'On time and on spec, with no surprises at the deadline',
        ]}
        formHeading="Tell me about your project"
        formWindowTitle="project_brief.exe"
        form={<LeadForm formName="lp_sme_web_mobile" />}
      />

      <LpBenefits
        heading="Delivery you can count on"
        intro="The problem is rarely the code. It is projects that drift, teams that hand you a junior, and a launch date nobody stands behind."
        items={[
          {
            icon: ShieldCheckIcon,
            title: 'Ownership end to end',
            body: 'One person accountable for the whole build, from architecture to launch.',
          },
          {
            icon: ArrowsPointingOutIcon,
            title: 'Built to scale',
            body: 'Architected for where your business is going, not just what it needs today.',
          },
          {
            icon: PuzzlePieceIcon,
            title: 'Clean integrations',
            body: 'Connected to the systems and APIs you already depend on.',
          },
          {
            icon: ClockIcon,
            title: 'On time, on spec',
            body: 'Realistic scope, steady progress, and a launch date that holds.',
          },
        ]}
      />

      <LpProof
        intro="Delivered work, not a skills list."
        caseStudies={[
          {
            href: '/case-study/postgis-fleet-optimization',
            title: 'Geospatial fleet optimization',
            blurb: 'A custom routing system delivered end to end, from the data model to live dispatch decisions.',
          },
          {
            href: '/case-study/data-driven-seo-pipeline',
            title: 'A data pipeline built from zero',
            blurb: 'Shipped and running: multi-engine data collection turned into daily decisions.',
          },
        ]}
        techLogos={TECH_LOGOS}
      />

      <LpFinalCta
        heading="Ready to scope your project?"
        body="Book a free 20-minute call to talk through what you are building and how to get it delivered without the usual friction."
        ctaLabel="Book your free call"
      />
    </div>
  );
}
