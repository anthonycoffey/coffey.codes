import ContactForm from '../../components/ContactForm';
import RetroWindow from '../../components/ui/RetroWindow';
import Button from '../../components/ui/Button';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { EnvelopeOpenIcon } from '@heroicons/react/24/solid';

import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hire an Austin Software Engineer',
  description:
    'Get in touch with Anthony Coffey, an Austin software engineer and AI consultant, for web, mobile, or AI/ML work. Book a free 30-minute consultation.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  return (
    <section className="bg-bg min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="border-b border-border pb-4 mb-10">
          <h1 className="font-outfit font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center text-c-heading">
            <EnvelopeOpenIcon className="w-8 h-8 inline mr-3 text-accent1-dark" />
            Contact Me
          </h1>
          <p className="text-c-muted">
            Have a project in mind or need technical expertise? Let&apos;s chat!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left column: info boxes */}
          <div className="flex flex-col gap-4">
            <RetroWindow title="phone.txt">
              <div className="p-5 flex items-center gap-4">
                <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                  <PhoneIcon className="h-5 w-5 text-accent1-dark" />
                </div>
                <div>
                  <p className="font-semibold text-c-heading text-sm">Phone</p>
                  <p className="text-c-text">(737) 932-4565</p>
                </div>
              </div>
            </RetroWindow>

            <RetroWindow title="email.txt">
              <div className="p-5 flex items-center gap-4">
                <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-accent1-dark" />
                </div>
                <div>
                  <p className="font-semibold text-c-heading text-sm">Email</p>
                  <p className="text-c-text">anthony@coffey.codes</p>
                </div>
              </div>
            </RetroWindow>

            <RetroWindow title="location.txt">
              <div className="p-5 flex items-center gap-4">
                <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                  <MapPinIcon className="h-5 w-5 text-accent1-dark" />
                </div>
                <div>
                  <p className="font-semibold text-c-heading text-sm">Location</p>
                  <p className="text-c-text">Austin, Texas</p>
                </div>
              </div>
            </RetroWindow>

            <RetroWindow title="calendar.txt">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                    <CalendarDaysIcon className="h-5 w-5 text-accent1-dark" />
                  </div>
                  <p className="font-semibold text-c-heading text-sm">Schedule a Free Consultation</p>
                </div>
                <p className="text-c-muted text-sm mb-4 leading-relaxed">
                  The fastest way to discuss your project is to book a free 30-minute consultation. We can discuss your needs and determine if my expertise is the right fit.
                </p>
                <Button as="a" href="https://calendly.com/antcoffpersonal/meet" variant="primary" size="sm" target="_blank" rel="noopener noreferrer">
                  <CalendarDaysIcon className="h-4 w-4" />
                  Book Your Free Session
                </Button>
              </div>
            </RetroWindow>
          </div>

          {/* Right column: contact form */}
          <RetroWindow title="send-message.txt">
            <div className="p-6">
              <ContactForm />
            </div>
          </RetroWindow>
        </div>
      </div>
    </section>
  );
}
