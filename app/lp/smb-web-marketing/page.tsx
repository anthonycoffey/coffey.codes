import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Integrated Web Presence & Marketing Tech for SMBs | Coffey Codes',
  description: 'Expert web development (WordPress, JavaScript) combined with essential marketing tech setup (Analytics, GTM) for SMBs.',
};

export default function SmbWebMarketingLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Your Professional Web Presence, Integrated & Supported
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          For Small to Medium Businesses requiring a professional web presence integrated with essential marketing tools, Anthony Coffey offers expert web development combined with comprehensive marketing tech setup and support.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Web Development Meets Marketing Tech</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Whether building or maintaining WordPress or modern JavaScript sites, benefit from 12 years of proven experience delivering high-quality websites configured with core analytics and tracking (Google Analytics, Tag Manager). Receive dependable partnership and trustworthy technical guidance.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Expertise in both WordPress and modern JS frameworks.</li>
            <li>Seamless integration with Google Analytics & Tag Manager.</li>
            <li>High-quality, professional website design and development.</li>
            <li>Reliable support and technical guidance.</li>
            <li>Focus on building a web presence that supports your marketing goals.</li>
          </ul>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Web Strategy Call
          </a>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">Get Your Project Started</h3>
          <ContactForm />
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section id="schedule-call" className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Plan Your Integrated Web Presence</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss your website needs and how integrating marketing technology can help achieve your business objectives.
        </p>
        <a
          href="YOUR_SCHEDULING_LINK_HERE" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Web Call Now
        </a>
      </section>
    </div>
  );
}
