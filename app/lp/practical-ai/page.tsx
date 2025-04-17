import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Practical AI Solutions for Business Growth | Coffey Codes',
  description: 'Move beyond AI hype. Get production-ready, scalable AI solutions integrated with your business for tangible results.',
};

export default function PracticalAiLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
          Implement Practical AI That Delivers Real Business Value
        </h1>
        <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
          For forward-thinking businesses ready to move beyond AI hype to tangible results, Anthony Coffey serves as your Practical Innovation Partner. Get production-ready AI solutions built on sustainable, scalable architectures.
        </p>
      </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">From Hype to Production-Ready AI</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Leverage 12 years of disciplined engineering experience to ensure your AI initiatives are robust, integrated, and deliver measurable business value. Benefit from Fractional CTO-level strategic insights throughout the process.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Focus on practical, achievable AI implementations.</li>
            <li>Solutions designed for scalability and long-term use.</li>
            <li>Integration with existing systems and workflows.</li>
            <li>Clear communication and strategic guidance.</li>
            <li>Emphasis on tangible ROI and business outcomes.</li>
          </ul>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free AI Strategy Call
          </a>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">Discuss Your AI Initiative</h3>
          <ContactForm />
        </div>
      </section>

      {/* Placeholder section for scheduling call */}
      <section id="schedule-call" className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Explore Your AI Potential</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss how practical AI solutions can drive innovation and efficiency in your business.
        </p>
        <a
          href="YOUR_SCHEDULING_LINK_HERE" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free AI Call Now
        </a>
      </section>
    </div>
  );
}
