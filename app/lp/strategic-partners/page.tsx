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
  BoltIcon,
  CpuChipIcon,
  UserGroupIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const LP_TITLE = 'Senior Engineer on Retainer for Agencies & Tech Teams';
const LP_DESCRIPTION =
  'Embedded senior developer / lead dev for agencies, startups, and tech teams — architecture, DevOps, and practical AI, hands-on the keyboard.';
const LP_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent(LP_TITLE)}&category=${encodeURIComponent('Engineering Retainer')}`;

export const metadata: Metadata = {
  title: LP_TITLE,
  description:
    'Embedded senior developer / lead dev for agencies, startups, and tech teams. 12+ years shipping production work in architecture, DevOps, and practical AI integration — no ramp, no hiring loop.',
  alternates: { canonical: '/lp/strategic-partners' },
  openGraph: {
    title: LP_TITLE,
    description: LP_DESCRIPTION,
    url: '/lp/strategic-partners',
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
  'typescript-icon.svg',
  'nodejs.svg',
  'react.svg',
  'python.svg',
  'aws.svg',
  'google-cloud.svg',
  'firebase.svg',
  'postgresql.svg',
  'graphql.svg',
  'expo.svg',
  'vercel.svg',
  'tailwindcss.svg',
];

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
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />

      <LpHero
        eyebrow="Senior IC Capacity"
        title="Plug in a lead developer without the hiring loop."
        subhead="For agencies and teams that need experienced hands to ship a critical project without ramp. A senior engineer embeds on retainer and owns complex architecture, DevOps, and AI work end to end."
        credibility={[
          '12+ years owning delivery of complex builds',
          'No ramp: senior from day one, hands on the keyboard',
          'Embedded on retainer, not a strategy seat',
        ]}
        formHeading="Discuss your engagement"
        formWindowTitle="engagement.exe"
        form={<LeadForm formName="lp_strategic_partners" />}
      />

      <LpBenefits
        heading="Senior capacity, on demand"
        intro="You need someone who can own the hard parts from the first week, without a six-month search to find them."
        items={[
          {
            icon: BoltIcon,
            title: 'No ramp',
            body: 'Productive from the first week, not the second month.',
          },
          {
            icon: CpuChipIcon,
            title: 'Owns the hard parts',
            body: 'Architecture, DevOps, integrations, and AI work handled end to end.',
          },
          {
            icon: UserGroupIcon,
            title: 'Slots into your team',
            body: 'Works in your stack, your process, and your standups.',
          },
          {
            icon: ClockIcon,
            title: 'No hiring loop',
            body: 'Senior capacity for a six-month effort without running a six-month search.',
          },
        ]}
      />

      <LpProof
        intro="Complex work, owned start to finish."
        caseStudies={[
          {
            href: '/case-study/postgis-fleet-optimization',
            title: 'Complex build, owned end to end',
            blurb: 'A geospatial optimization system delivered from the data model to production.',
          },
          {
            href: '/case-study/data-driven-seo-pipeline',
            title: 'From zero to a running pipeline',
            blurb: 'Standing up a multi-engine data pipeline solo, start to finish.',
          },
        ]}
        techLogos={TECH_LOGOS}
      />

      <LpFinalCta
        heading="Need senior hands now?"
        body="Book a free 20-minute call to talk through the work and how quickly I can plug in."
        ctaLabel="Book an intro call"
      />
    </div>
  );
}
