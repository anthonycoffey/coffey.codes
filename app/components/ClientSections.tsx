// app/components/ClientSections.jsx - Client Component
'use client';

import AnimatedSection from './AnimatedSection';

export default function ClientSections({ sections }) {
  return (
    <>
      {sections.map((section) => (
        <AnimatedSection
          key={section.id}
          background={section.background}
          maxWidth={section.maxWidth}
        >
          {section.content}
        </AnimatedSection>
      ))}
    </>
  );
}
