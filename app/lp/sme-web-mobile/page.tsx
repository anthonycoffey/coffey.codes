import React from 'react';
import ContactForm from '@/components/ContactForm'; // Assuming ContactForm path
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Custom Web & Mobile Apps for Established SMEs | Coffey Codes',
  description: 'Reliable, scalable web and mobile applications built with senior-level expertise for established SMEs seeking long-term growth.',
};

export default function SmeWebMobileLandingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <section className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4 text-zinc-800 dark:text-zinc-100">
           Build Custom Web & Mobile Apps That Scale With Your Business
         </h1>
         <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-3xl mx-auto">
           For established SMEs seeking custom web and mobile applications they can trust to scale, Anthony Coffey provides a direct, senior-level partnership (your Fractional CTO) emphasizing Reliable Delivery.
         </p>
       </section>

      <section className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Leverage 12 Years of Experience</h2>
          <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-4">
            Benefit from over a decade of experience architecting sustainable, scalable solutions designed for long-term business growth and efficiency. Avoid the common pitfalls associated with junior teams or impersonal agency models.
          </p>
          <ul className="list-disc list-inside space-y-2 text-lg text-zinc-700 dark:text-zinc-300 mb-6">
            <li>Reliable project delivery, on time and on budget.</li>
            <li>Solutions architected for future growth and maintainability.</li>
            <li>Direct access to senior-level strategic guidance.</li>
            <li>Focus on tangible business outcomes, not just code.</li>
          </ul>
          <a
            href="#schedule-call" // Placeholder link/anchor
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg text-lg transition duration-300"
          >
            Schedule Your Free Strategy Call
          </a>
        </div>
        <div className="bg-zinc-100 dark:bg-zinc-800 p-8 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-6 text-center text-zinc-800 dark:text-zinc-100">Ready to Discuss Your Project?</h3>
          <ContactForm />
        </div>
      </section>

      {/* Placeholder section for scheduling call - could link to Calendly or similar */}
      <section id="schedule-call" className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4 text-zinc-800 dark:text-zinc-100">Let&apos;s Strategize Your Next Application</h2>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-6 max-w-2xl mx-auto">
          Book a complimentary 30-minute strategy call to discuss your specific needs and how we can build a reliable, scalable solution together.
        </p>
        <a
          href="YOUR_SCHEDULING_LINK_HERE" // Replace with actual scheduling link
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition duration-300"
        >
          Book Free Call Now
        </a>
      </section>
    </div>
  );
}
