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
  const [showForm, setShowForm] = useState<boolean>(false);
  const [showMessage, setShowMessage] = useState<boolean>(true);
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
    event.preventDefault();
    try {
      const response = await fetch(
        'https://us-central1-coffeywebdev-d0487.cloudfunctions.net/sendContactFormEmail',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
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
        console.log('Email sent successfully');
        setMessageSent(true);
      } else {
        console.error('Failed to send email');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFormToggle = () => {
    setShowForm(!showForm);
  };

  const handleDismiss = () => {
    setShowMessage(false);
  };

  return (
    <>
      {!showForm && (
        <button
          onClick={handleFormToggle}
          className="flex justify-center items-center cursor-pointer border-2 border-blue-500 hover:bg-blue-500 hover:text-white text-blue-500 font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline"
        >
          <ChatBubbleOvalLeftIcon className="mr-2 h-6 w-6" />
          Send Message
        </button>
      )}
      {showForm && (
        <div className="rounded overflow-hidden shadow-lg p-4">
          {!messageSent ? (
            <form onSubmit={handleFormSubmit}>
              <div className="grid md:grid-cols-2 text-left">
                <div className="pr-2">
                  <label
                    className="text-sm block font-bold mb-2"
                    htmlFor="name"
                  >
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
                  />
                </div>
                <div className="mb-2">
                  <label
                    className="text-sm block font-bold mb-2"
                    htmlFor="email"
                  >
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
                  />
                </div>
              </div>

              <div className="mb-2 text-left">
                <label
                  className="text-sm block font-bold mb-2"
                  htmlFor="message"
                >
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
                  <span className="ml-2 pl-2 text-neutral-200">
                    I consent to the collection of my data and to being
                    contacted via email.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-center">
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
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
                    className="cursor-pointer bg-blue-600 text-white font-bold py-4 px-6 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-600 flex justify-center items-center disabled:opacity-50"
                    type="submit"
                    disabled={!consentChecked}
                  >
                    <ChatBubbleOvalLeftIcon className="mr-4 h-6 w-6" />
                    Send Message
                  </button>
                )}
              </div>
            </form>
          ) : (
            showMessage && (
              <div
                className="w-full flex bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <span>Your message has been successfully delivered!</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <svg
                    onClick={handleDismiss}
                    className="fill-current h-6 w-6 text-green-500 cursor-pointer"
                    role="button"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <title>Close</title>
                    <path d="M14.348 5.652a.999.999 0 0 0-1.414 0L10 8.586 6.066 4.652a.999.999 0 1 0-1.414 1.414L8.586 10l-3.934 3.934a.999.999 0 1 0 1.414 1.414L10 11.414l3.934 3.934a.999.999 0 1 0 1.414-1.414L11.414 10l3.934-3.934a.999.999 0 0 0 0-1.414z" />
                  </svg>
                </span>
              </div>
            )
          )}
        </div>
      )}
    </>
  );
}
