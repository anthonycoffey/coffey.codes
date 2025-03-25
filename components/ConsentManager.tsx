'use client';
import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckIcon } from '@heroicons/react/20/solid';

const ConsentManager = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);

  useEffect(() => {
    // Check if consent was previously given
    try {
      const existingConsent = localStorage.getItem('google-consent');

      // Initial consent setup
      window.dataLayer = window.dataLayer || [];

      // Default to denied
      gtag('consent', 'default', {
        ad_storage: 'denied',
        ad_personalization: 'denied',
        ad_user_data: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 3000,
      });

      // Show consent dialog if no previous consent
      if (!existingConsent) {
        setIsVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  const gtag = (...args: any[]) => {
    window.dataLayer?.push(args);
  };

  const handleAcceptConsent = () => {
    try {
      // Update consent state
      window.dataLayer?.push({
        consent: 'update',
        ad_storage: 'granted',
        ad_personalization: 'granted',
        ad_user_data: 'granted',
        analytics_storage: 'granted',
      });

      // Store consent preference
      localStorage.setItem('google-consent', 'accepted');

      setHasConsented(true);
      setIsVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleRejectConsent = () => {
    try {
      // Update consent state
      window.dataLayer?.push({
        consent: 'update',
        ad_storage: 'denied',
        ad_personalization: 'denied',
        ad_user_data: 'denied',
        analytics_storage: 'denied',
      });

      // Store consent preference
      localStorage.setItem('google-consent', 'rejected');

      setHasConsented(false);
      setIsVisible(false);
    } catch (error) {
      console.error(error);
    }
  };

  // Don't render if already consented or not visible
  if (hasConsented || !isVisible) return null;

  return (
    <div
      className="dark fixed bottom-0 left-0 right-0 z-50 p-3 bg-blue-600 shadow-2xl border-t-2 border-gray-200
      animate-slide-up transform transition-all duration-500 ease-in-out"
    >
      <div className="max-w-md mx-auto text-white">
        <div className="flex flex-col space-y-3 px-1">
          <h2 className="text-lg font-semibold text-neutral-1 text-center md:text-left mb-0">
            We use cookies to improve your experience
          </h2>

          <p className="text-sm text-neutral-2 text-center md:text-left">
            We use cookies to enhance site navigation, analyze site usage, and
            assist in marketing efforts.
          </p>

          <div className="flex space-x-3 mt-2">
            <button
              onClick={handleRejectConsent}
              className="flex-1 flex items-center justify-center
              bg-red-100 text-red-700 px-4 py-2 rounded-md
              hover:bg-red-500 transition-colors duration-200"
            >
              <XMarkIcon className="mr-2 h-5 w-5" /> Reject
            </button>

            <button
              onClick={handleAcceptConsent}
              className="flex-1 flex items-center justify-center
              bg-green-100 text-green-700 px-4 py-2 rounded-md
              hover:bg-green-500 transition-colors duration-200"
            >
              <CheckIcon className="mr-2 h-5 w-5" /> Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentManager;
