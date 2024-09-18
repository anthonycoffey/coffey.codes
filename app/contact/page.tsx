import ContactForm from '../components/ContactForm';

export const metadata = {
  title: 'Contact',
  description: 'Need a hand with a project? Get in touch with me here.',
};

export default async function Page({ searchParams }) {
  return (
    <section className="contact-page">
      <div className="page flex flex-col">
        <div className="p-10 flex flex-col justify-center items-center">
          <h1 className="text-3xl font-bold mb-6">Drop a Line!</h1>
          <p className="mb-4">
            Have a question? Click below to drop me a line and I'll get back to
            you as soon as possible!
          </p>
          <ContactForm />
        </div>
        <div className="p-10 flex flex-col justify-center items-center bg-gray-100 rounded">
          <h1 className="text-3xl font-bold mb-6 text-blue-500">
            Schedule a Meeting!
          </h1>
          <p className="mb-4 text-gray-600">
            Interested in Connecting? Check out my availability and book a time
            that suits you!
          </p>
          <a
            href="https://calendly.com/antcoffpersonal/meet"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline cursor-pointer">
              Book Now
            </button>
          </a>
        </div>
      </div>
    </section>
  );
}
