'use client';
import React, { useState } from 'react';
import { ChatBubbleOvalLeftIcon } from '@heroicons/react/24/solid';

type FormData = {
  name: string;
  email: string;
  message: string;
};

export default function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: '',
  });
  const [messageSent, setMessageSent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [consentChecked, setConsentChecked] = useState<boolean>(false);

  const handleInputChange = (event: React.FormEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [event.currentTarget.name]: event.currentTarget.value,
    });
  };

  const handleTextAreaChange = (
    event: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    setFormData({
      ...formData,
      message: event.currentTarget.value,
    });
  };

  const handleConsentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setConsentChecked(event.target.checked);
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    setLoading(true);
    setError(null);
    event.preventDefault();
    try {
      const response = await fetch(
        '/functions/sendContactFormEmail',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            consent: consentChecked,
          }),
        },
      );

      if (response.ok) {
        setMessageSent(true);
        // Push event to dataLayer for GTM
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submit',
          // Optionally include form data if needed, but be mindful of PII
          formName: 'contact', // Added formName for potential differentiation later
        });
      }
    } catch (error) {
      console.log(error);
      setError(
        'An error occurred while sending your message, please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {!messageSent ? (
        <form onSubmit={handleFormSubmit}>
          <div className="grid md:grid-cols-2 text-left">
            <div className="pr-2">
              <label className="text-sm block font-bold mb-2" htmlFor="name">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-black"
                id="name"
                name="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={handleInputChange}
                required={true}
                autoComplete="name"
              />
            </div>
            <div className="mb-2">
              <label className="text-sm block font-bold mb-2" htmlFor="email">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-black"
                id="email"
                name="email"
                type="email"
                placeholder="Your email address"
                value={formData.email}
                onChange={handleInputChange}
                required={true}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mb-2 text-left">
            <label className="text-sm block font-bold mb-2" htmlFor="message">
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              className="appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline text-black"
              id="message"
              name="message"
              placeholder="Your message"
              value={formData.message}
              onChange={handleTextAreaChange}
              required={true}
              autoComplete="off"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                className="form-checkbox"
                checked={consentChecked}
                onChange={handleConsentChange}
                required
              />
              <span className="ml-2 pl-2">
                I consent to the collection of my data and to being contacted
                via email.
              </span>
            </label>
          </div>

          {error && (
            <div
              className="w-full flex bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
              role="alert"
            >
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-center">
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-label="Loading"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              </div>
            ) : (
              <button
                className="cursor-pointer bg-blue-600 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-600 flex justify-center items-center disabled:opacity-75 disabled:cursor-not-allowed"
                type="submit"
                aria-label="Send Message"
              >
                <ChatBubbleOvalLeftIcon
                  className="mr-4 h-6 w-6"
                  aria-hidden="true"
                />
                Send Message
              </button>
            )}
          </div>
        </form>
      ) : (
        <div
          className="w-full flex bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <span>Your message has been successfully delivered!</span>
        </div>
      )}
    </>
  );
}
