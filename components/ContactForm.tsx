'use client';
import React, { useState } from 'react';
import {
  ChatBubbleOvalLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';

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
      const response = await fetch('/functions/sendContactFormEmail', {
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
      });

      if (response.ok) {
        setMessageSent(true);
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'form_submit',
          formName: 'contact',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(
          errorData.message ||
            `An error occurred: ${response.statusText} (${response.status})`,
        );
      }
    } catch (error) {
      setError(
        'An error occurred while sending your message, please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'mt-1 block w-full rounded-md border border-neutral-300 dark:border-neutral-600 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500';
  const labelClasses =
    'block text-sm font-medium text-neutral-700 dark:text-neutral-300';

  return (
    <>
      {!messageSent ? (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className={labelClasses}>
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                id="name"
                className={inputClasses}
                placeholder="Your Name"
                value={formData.name}
                onChange={handleInputChange}
                required={true}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClasses}>
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                id="email"
                className={inputClasses}
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={handleInputChange}
                required={true}
                autoComplete="email"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className={labelClasses}>
              Message <span className="text-red-500">*</span>
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className={inputClasses}
              placeholder="How can I help you?"
              value={formData.message}
              onChange={handleTextAreaChange}
              required={true}
              autoComplete="off"
            ></textarea>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="consent"
                name="consent"
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-neutral-300 dark:border-neutral-600 rounded bg-neutral-100 dark:bg-neutral-700 dark:focus:ring-offset-neutral-800"
                checked={consentChecked}
                onChange={handleConsentChange}
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="consent"
                className="font-medium text-neutral-700 dark:text-neutral-300"
              >
                I consent <span className="text-red-500">*</span>
              </label>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                to the collection of my data and to being contacted via email
                regarding this inquiry.
              </p>
            </div>
          </div>

          {error && (
            <div
              className="flex items-center p-3 rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50"
              role="alert"
            >
              <ExclamationCircleIcon
                className="h-5 w-5 text-red-500 dark:text-red-400 mr-2 flex-shrink-0"
                aria-hidden="true"
              />
              <span className="text-sm text-red-700 dark:text-red-300">
                {error}
              </span>
            </div>
          )}

          <div className="flex items-center justify-center pt-2">
            <button
              type="submit"
              disabled={loading || !consentChecked}
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:focus:ring-offset-neutral-900"
              aria-label="Send Message"
            >
              {loading ? (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <ChatBubbleOvalLeftIcon
                  className="-ml-1 mr-2 h-5 w-5"
                  aria-hidden="true"
                />
              )}
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="flex items-center p-4 rounded-md bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50"
          role="alert"
        >
          <CheckCircleIcon
            className="h-6 w-6 text-green-500 dark:text-green-400 mr-3 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-base font-medium text-green-800 dark:text-green-200">
            Your message has been sent successfully!
          </span>
        </div>
      )}
    </>
  );
}
