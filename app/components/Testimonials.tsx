'use client';
import React, { useState, useEffect } from 'react';
import {
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/20/solid';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const testimonials = [
    {
      text: 'Anthony is highly professional, has a great sense of urgency and over-delivered on my project. He was very responsive on some tight deadlines and helped me resolve multiple WordPress site improvements and optimization. I highly recommend Anthony. His work and finished product was my best Upwork/Elance experience to date.',
      author: 'Doug Wilks',
      link: 'strengthslauncher.com',
    },
    {
      text: 'Fantastic work! Anthony had my site up and running within a few hours. Extremely professional and highly recommended. I will definitely do business with him again in the future. Thanks again!',
      author: 'Jonathan - Owner Plane Schemer LLC',
      link: 'planeschemer.com',
    },
    {
      text: 'Anthony was awesome. He did a great job. He has a good command of the required skills and what he did not have at the tip of his fingers - he took the time to research and was a quick study. Takes instruction well - no ego issues. Just wants the job done well. I recommend him for your next gig!',
      author: 'YourWorkBuddy',
    },
    {
      text: "Anthony was AWESOME to work with. He got the job done quickly and actually communicated with me regularly. I was pleasantly surprised to finally find a programmer that knew what he was talking about. I'll definitely be using Anthony again in the future.",
      author: 'Doug Hermansen',
    },
  ];

  const next = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length,
    );
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      next();
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  return (
    <section className="bg-gradient-to-b from-gray-800 to-gray-900 pt-4 rounded-xl -mx-0 md:-mx-20 border-2 border-blue-600">
      <div className="relative py-12 px-4">
        <button
          onClick={() => {
            prev();
            setIsAutoPlaying(false);
          }}
          className="absolute z-50 left-4 top-3/4 -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Previous testimonial"
        >
          <ChevronLeftIcon className="h-6 w-6 text-white" />
        </button>

        <button
          onClick={() => {
            next();
            setIsAutoPlaying(false);
          }}
          className="absolute z-50 right-4 top-3/4 -translate-y-1/2 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Next testimonial"
        >
          <ChevronRightIcon className="h-6 w-6 text-white" />
        </button>

        {/* Testimonials */}
        <div className="relative">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-all duration-500 ${
                index === currentIndex
                  ? 'relative opacity-100 translate-y-0'
                  : 'absolute top-0 left-0 right-0 opacity-0 -translate-y-4'
              }`}
            >
              <figure className="max-w-screen-md mx-auto">
                <blockquote>
                  <p className="text-xl font-medium text-white text-center">
                    "{testimonial.text}"
                  </p>
                </blockquote>
                <figcaption className="flex flex-col items-center justify-center mt-6 space-y-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-500" />
                    ))}
                  </div>
                  <div className="font-medium text-white">
                    {testimonial.author}
                  </div>
                  {testimonial.link && (
                    <div className="text-sm font-light text-gray-400">
                      <a
                        href={`https://${testimonial.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors"
                      >
                        {testimonial.link}
                      </a>
                    </div>
                  )}
                </figcaption>
              </figure>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-500' : 'bg-gray-500'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
