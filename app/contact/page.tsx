import ContactForm from '../components/ContactForm';
import { CalendarDaysIcon } from '@heroicons/react/24/solid';

export const metadata = {
  title: 'Contact',
  description: 'Need a hand with a project? Get in touch with me here.',
};

export default async function Page({ searchParams }) {
  return (
    <section className="contact-page">
      <div className="page-content flex flex-col">
        <div className="p-6 md:p-10 flex flex-col justify-center items-center">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0 text-center">
            Have a question for me?
          </h1>
          <p className="mb-4 text-center">
            Fill out the form below and send a message straight to my inbox! 🎯
          </p>

          <ContactForm />
        </div>
        <div className="p-6 md:p-10 flex flex-col justify-center items-center bg-gray-100 rounded">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 md:mb-0 text-blue-500 text-center">
            Interested in Connecting?
          </h1>
          <p className="mb-4 text-gray-600 text-center">
            Check out my availability and book a time that suits you!
          </p>
          <a
            href="https://calendly.com/antcoffpersonal/meet"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="flex justify-center items-center bg-blue-500 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer">
              <CalendarDaysIcon className="mr-4 h-6 w-6" />
              Book Now
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
