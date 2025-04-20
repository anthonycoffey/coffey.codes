import ContactForm from '../../components/ContactForm';
import {
  CalendarDaysIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { EnvelopeOpenIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Contact Anthony Coffey | Software Development & Consulting',
  description:
    'Get in touch with Anthony Coffey for software development, AI integration, or consulting services. Send a message or schedule a free consultation.',
};

export default async function ContactPage() {
  return (
    <section className="contact-page">
      <div className="page-content">
        {/* Style header border, title, paragraph */}
        <div className="border-b border-gray-300 dark:border-neutral-700 pb-4 mb-4 max-w-6xl mx-auto">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center dark:text-white">
            <EnvelopeOpenIcon className="w-8 h-8 inline mr-3 text-blue-600" />
            Contact Me
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Have a project in mind or need technical expertise? Let&apos;s chat!
          </p>
        </div>

        {/* Style Contact Info section */}
        <div className="bg-gray-50 dark:bg-neutral-900 rounded-lg p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Contact Information</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Interested in connecting? Feel free to reach out!
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Style Phone section */}
            <div className="text-center p-4">
              <div className="mx-auto p-3 bg-white dark:bg-neutral-800 rounded-full w-12 h-12 flex items-center justify-center mb-3 shadow-sm">
                <PhoneIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1 dark:text-white">Phone</h3>
              <p className="text-gray-600 dark:text-gray-400">(737) 932-4565</p>
            </div>

            {/* Style Email section */}
            <div className="text-center p-4">
              <div className="mx-auto p-3 bg-white dark:bg-neutral-800 rounded-full w-12 h-12 flex items-center justify-center mb-3 shadow-sm">
                <EnvelopeIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1 dark:text-white">Email</h3>
              <p className="text-gray-600 dark:text-gray-400">anthony@coffey.codes</p>
            </div>

            {/* Style Location section */}
            <div className="text-center p-4">
              <div className="mx-auto p-3 bg-white dark:bg-neutral-800 rounded-full w-12 h-12 flex items-center justify-center mb-3 shadow-sm">
                <MapPinIcon className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-medium mb-1 dark:text-white">Location</h3>
              <p className="text-gray-600 dark:text-gray-400">Austin, Texas</p>
            </div>
          </div>
        </div>

        {/* Style Contact Form section container, heading, paragraph */}
        <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-gray-200 dark:border-neutral-800 p-6 md:p-8 mb-8">
          <div className="flex items-center mb-4">
            <EnvelopeIcon className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <h2 className="text-xl font-semibold dark:text-white">Send a Message</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Prefer to send a message? Fill out the form below to contact me
            directly. I typically respond to all inquiries within 24 hours.
          </p>
          {/* Add wrapper to center and constrain width, plus add title */}
          <div className="w-full max-w-lg mx-auto">
            <h3 className="text-xl font-semibold text-center text-neutral-800 dark:text-neutral-200 mb-4">
              Get in Touch
            </h3>
            <ContactForm />
          </div>
        </div>

        {/* Style Calendar Section container, heading, paragraph */}
        <div className="bg-blue-50 dark:bg-blue-950 border border-blue-100 dark:border-blue-900 rounded-lg shadow-sm p-6 md:p-8 mb-8">
          <div className="flex items-center mb-4">
            <CalendarDaysIcon className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
            <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-200">
              Schedule a Free Consultation
            </h2>
          </div>
          <p className="text-blue-700 dark:text-blue-300 mb-6">
            The fastest way to discuss your project is to book a free 30-minute
            consultation. We can discuss your needs and determine if my
            expertise is the right fit for your goals.
          </p>
          <div className="flex justify-center">
            <a
              href="https://calendly.com/antcoffpersonal/meet"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              <CalendarDaysIcon className="h-5 w-5 mr-2" />
              Book Your Free Session
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
