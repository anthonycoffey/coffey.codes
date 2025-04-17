import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Senior-Level Expertise for Strategic Partners | Coffey Codes',
  description: 'Augment your team with specialized expertise in software architecture, DevOps, and practical AI integration. Fractional CTO & Specialist Lead services.',
};

export default function StrategicPartnersLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Elevate Your Projects with Specialized Senior Expertise
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          For Startups, Agencies, or Tech Teams seeking senior-level expertise to elevate their projects, Anthony Coffey acts as your Fractional CTO or Specialist Lead. Augment your capabilities and deliver superior technical outcomes.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Fractional CTO & Specialist Lead</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Leverage 12 years of deep expertise in software architecture, DevOps, and practical AI integration to ensure your initiatives are scalable, reliable, and cutting-edge. Partner with a proven expert to overcome technical challenges and achieve ambitious goals.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Strategic guidance on architecture and technology choices.</li>
            <li>Hands-on expertise in DevOps practices and CI/CD pipelines.</li>
            <li>Practical AI integration to enhance your products/services.</li>
            <li>Scalable and reliable system design.</li>
            <li>Augment your team's capabilities for critical projects.</li>
          </ul>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Partnership Call
          </a>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">Discuss a Strategic Partnership</h3>
          <ContactForm />
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section id="schedule-call" className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Explore Collaboration Opportunities</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute call to discuss how specialized expertise can augment your team and accelerate your project success.
        </p>
        <a
          href="YOUR_SCHEDULING_LINK_HERE" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Partnership Call Now
        </a>
      </section>
    </div>
  );
}
