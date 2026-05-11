import ContactForm from '@/components/ContactForm';
import RetroWindow from '@/components/ui/RetroWindow';
import Button from '@/components/ui/Button';
import PageHeader from '@/components/PageHeader';
import Testimonials from '@/components/Testimonials';
import ResumePdfCta from '@/components/ResumePdfCta';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { EnvelopeOpenIcon } from '@heroicons/react/24/solid';

import type { Metadata } from 'next';
import { baseUrl } from '@/app/sitemap';

const CONTACT_DESCRIPTION =
  'Get in touch with Anthony Coffey, an AI consultant and software engineer in Austin, TX, for web, mobile, or AI/ML work. Book a free 30-minute consultation.';
const CONTACT_OG_IMAGE = `${baseUrl}/og?title=${encodeURIComponent('Contact')}&category=${encodeURIComponent('Anthony Coffey')}`;

export const metadata: Metadata = {
  title: 'Contact',
  description: CONTACT_DESCRIPTION,
  alternates: { canonical: '/contact' },
  openGraph: {
    type: 'website',
    url: '/contact',
    title: 'Contact Anthony Coffey',
    description: CONTACT_DESCRIPTION,
    images: [{ url: CONTACT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Anthony Coffey',
    description: CONTACT_DESCRIPTION,
    images: [CONTACT_OG_IMAGE],
  },
};

export default async function ContactPage() {
  return (
    <>
      <PageHeader
        title="Contact Me"
        icon={EnvelopeOpenIcon}
        description={
          <>
            Have a project in mind or need technical expertise? Let&apos;s chat!
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left column: everything in one window */}
        <RetroWindow title="contact_info.exe">
          <div className="p-5 flex flex-col gap-5">
            {/* Phone */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                <PhoneIcon className="h-5 w-5 text-accent1-dark" />
              </div>
              <div>
                <p className="font-semibold text-c-heading text-sm">Phone</p>
                <p className="text-c-text">(737) 932-4565</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                <EnvelopeIcon className="h-5 w-5 text-accent1-dark" />
              </div>
              <div>
                <p className="font-semibold text-c-heading text-sm">Email</p>
                <p className="text-c-text">anthony@coffey.codes</p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                <MapPinIcon className="h-5 w-5 text-accent1-dark" />
              </div>
              <div>
                <p className="font-semibold text-c-heading text-sm">Location</p>
                <p className="text-c-text">Austin, Texas</p>
              </div>
            </div>

            <hr className="border-border" />

            {/* Schedule */}
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-bg-alt rounded-full border border-border flex-shrink-0">
                  <CalendarDaysIcon className="h-5 w-5 text-accent1-dark" />
                </div>
                <p className="font-semibold text-c-heading text-sm">
                  Schedule a Free Consultation
                </p>
              </div>
              <p className="text-c-muted text-sm mb-4 leading-relaxed">
                The fastest way to discuss your project is to book a free
                30-minute consultation. We can discuss your needs and determine
                if my expertise is the right fit.
              </p>
              <Button
                as="a"
                href="https://calendly.com/antcoffpersonal/meet"
                variant="primary"
                size="sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                Book Your Free Session
              </Button>
            </div>
          </div>
        </RetroWindow>

        {/* Right column: contact form */}
        <RetroWindow title="send_message.exe">
          <div className="p-6">
            <ContactForm />
          </div>
        </RetroWindow>
      </div>

      <ResumePdfCta />

      <section className="mt-12">
        <h2 className="font-outfit text-2xl md:text-3xl font-bold mb-4 text-c-heading">
          What other clients have said
        </h2>
        <Testimonials />
      </section>
    </>
  );
}
