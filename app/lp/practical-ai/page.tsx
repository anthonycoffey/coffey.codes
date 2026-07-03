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
  LightBulbIcon,
  PuzzlePieceIcon,
  ShieldCheckIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

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

const TECH_LOGOS = [
  'python.svg',
  'nodejs.svg',
  'typescript-icon.svg',
  'react.svg',
  'aws.svg',
  'google-cloud.svg',
  'firebase.svg',
  'postgresql.svg',
  'graphql.svg',
  'vercel.svg',
  'tailwindcss.svg',
  'expo.svg',
];

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
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <JsonLd data={breadcrumb} />
      <JsonLd data={service} />

      <LpHero
        eyebrow="Practical AI"
        title="Cut through the AI hype. Get AI that ships."
        subhead="For businesses that want working AI, not another demo. A senior engineer with 12 years of production experience builds the LLM features, automations, and custom tools that actually run in production."
        credibility={[
          '12+ years shipping production software, now applied to AI',
          'LLM integration, automation, and custom tooling on a solid foundation',
          'Hands on the keyboard, no slide-deck deliverables',
        ]}
        formHeading="Discuss your AI initiative"
        formWindowTitle="ai_project.exe"
        form={<LeadForm formName="lp_practical_ai" />}
      />

      <LpBenefits
        heading="Engineering discipline, applied to AI"
        intro="Most AI projects stall between the demo and production. The difference is engineering, not algorithms."
        items={[
          {
            icon: LightBulbIcon,
            title: 'Practical, not experimental',
            body: 'AI scoped to a real business outcome and shipped as working software.',
          },
          {
            icon: PuzzlePieceIcon,
            title: 'Integrated cleanly',
            body: 'LLMs and automations wired into the systems you already run, not bolted on.',
          },
          {
            icon: ShieldCheckIcon,
            title: 'Production-ready',
            body: 'Built to run reliably under real load, with the error handling demos skip.',
          },
          {
            icon: ChartBarIcon,
            title: 'Measurable ROI',
            body: 'Every initiative tied to a metric you can point to.',
          },
        ]}
      />

      <LpProof
        intro="A sample of delivered work. Both shipped, both measured."
        caseStudies={[
          {
            href: '/case-study/data-driven-seo-pipeline',
            title: 'A data-driven pipeline, built from zero',
            blurb: 'An automated pipeline that pulls multi-engine search data and turns it into editorial decisions.',
          },
          {
            href: '/case-study/postgis-fleet-optimization',
            title: 'Geospatial fleet optimization',
            blurb: 'A data-heavy routing system on PostGIS that turns raw location data into faster dispatch decisions.',
          },
        ]}
        techLogos={TECH_LOGOS}
      />

      <LpFinalCta
        heading="Have an AI feature in mind?"
        body="Book a free 20-minute call to talk through the feature or automation you want, and how to ship it on a foundation that lasts."
        ctaLabel="Book your free AI call"
      />
    </div>
  );
}
