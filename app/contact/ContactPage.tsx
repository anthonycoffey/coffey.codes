import React, { useState } from "react";
import ContactForm from "./ContactForm";

export default function ContactPage() {
  const [showForm, setShowForm] = useState<boolean>(false);
  const handleFormToggle = () => {
    setShowForm(!showForm);
  };
  return (
    <div className="page grid grid-cols-1 lg:grid-cols-2 min-h-screen">
      <div className="col-span-1 lg:col-span-1 p-10 flex flex-col justify-center items-center">
        <h1 className="text-3xl font-bold mb-6">Drop a Line!</h1>
        <p className="mb-4 text-gray-600">
          Have a question? Click below to drop me a line and I'll get back to
          you as soon as possible!
        </p>
        {!showForm && (
          <button
            onClick={handleFormToggle}
            className="border-2 border-blue-500 hover:bg-blue-500  hover:text-white  text-blue-500 font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Send Message
          </button>
        )}
        {showForm && <ContactForm />}
      </div>
      <div className="col-span-1 lg:col-span-1 p-10 flex flex-col justify-center items-center bg-gray-100">
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
          <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline">
            Book Now
          </button>
        </a>
      </div>
    </div>
  );
}
