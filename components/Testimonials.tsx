'use client';
import React, { useState, useEffect, useRef } from 'react';
import {
  StarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
} from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';

const Testimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const testimonials = [
    {
      text: 'Anthony is highly professional, has a great sense of urgency and over-delivered on my project. He was very responsive on some tight deadlines and helped me resolve multiple WordPress site improvements and optimization. I highly recommend Anthony. His work and finished product was my best Upwork/Elance experience to date.',
      author: 'Doug Wilks',
      link: 'strengthslauncher.com',
    },
    {
      text: 'Fantastic work! Anthony had my site up and running within a few hours. Extremely professional and highly recommended. I will definitely do business with him again in the future. Thanks again!',
      author: 'Jonathan Schemer',
      link: 'planeschemer.com',
    },
    {
      text: 'Anthony was awesome. He did a great job. He has a good command of the required skills and what he did not have at the tip of his fingers - he took the time to research and was a quick study. Takes instruction well - no ego issues. Just wants the job done well. I recommend him for your next gig!',
      author: 'YourWorkBuddy',
      link: 'yourworkbuddy.com',
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

  // Reset autoplay timer when currentIndex changes
  useEffect(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    if (isAutoPlaying && !isHovering) {
      autoPlayRef.current = setInterval(() => {
        next();
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [currentIndex, isAutoPlaying, isHovering, next]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
    exit: (direction) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.5,
        ease: 'easeIn',
      },
    }),
  };

  const [[page, direction], setPage] = useState([0, 0]);

  const paginate = (newDirection) => {
    if (newDirection > 0) {
      setPage([page + 1, newDirection]);
      next();
    } else {
      setPage([page - 1, newDirection]);
      prev();
    }
  };

  const goToSlide = (index) => {
    const newDirection = index > currentIndex ? 1 : -1;
    setPage([page + newDirection, newDirection]);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
  };

  return (
    <section
      className="bg-gradient-to-b from-gray-900 to-gray-800 pt-4 rounded-xl -mx-0 md:-mx-20 border border-blue-600/50 shadow-lg relative overflow-hidden"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/20 to-transparent"></div>

      <div className="relative py-12 px-4 md:px-8 lg:px-12">
        {/* Controls */}
        <div className="absolute z-10 top-1/2 left-0 right-0 flex justify-between px-2 md:px-4">
          <button
            onClick={() => {
              paginate(-1);
              setIsAutoPlaying(false);
            }}
            className="p-2 md:p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 border border-gray-700 transform hover:scale-105"
            aria-label="Previous testimonial"
          >
            <ChevronLeftIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
          </button>

          <button
            onClick={() => {
              paginate(1);
              setIsAutoPlaying(false);
            }}
            className="p-2 md:p-3 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 border border-gray-700 transform hover:scale-105"
            aria-label="Next testimonial"
          >
            <ChevronRightIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-400" />
          </button>
        </div>

        {/* Play/Pause button */}
        <button
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className="absolute z-10 top-4 right-4 p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 border border-gray-700"
          aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
        >
          {isAutoPlaying ? (
            <PauseIcon className="h-4 w-4 text-blue-400" />
          ) : (
            <PlayIcon className="h-4 w-4 text-blue-400" />
          )}
        </button>

        {/* Decorative quote mark */}
        <div className="absolute top-6 left-6 opacity-20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-300"
          >
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
          </svg>
        </div>

        {/* Testimonials */}
        <div className="min-h-[300px] sm:min-h-[250px] flex items-center justify-center">
          <AnimatePresence custom={direction} initial={false} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              <figure className="max-w-3xl mx-auto bg-gray-800/40 p-6 rounded-lg border-b border-blue-800/30">
                <blockquote>
                  <p className="text-lg md:text-xl italic font-light text-white text-center leading-relaxed">
                    "{testimonials[currentIndex].text}"
                  </p>
                </blockquote>
                <figcaption className="flex flex-col items-center justify-center mt-6 space-y-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>

                  <div className="mt-4">
                    <div className="font-medium text-white text-lg">
                      {testimonials[currentIndex].author}
                    </div>
                  </div>

                  {testimonials[currentIndex].link && (
                    <div className="text-sm font-light text-gray-400 mt-2">
                      <a
                        href={`https://${testimonials[currentIndex].link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        {testimonials[currentIndex].link}
                      </a>
                    </div>
                  )}
                </figcaption>
              </figure>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-3">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'bg-blue-500 scale-125'
                  : 'bg-gray-500 hover:bg-gray-400'
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
