'use client';
import React, { useState } from 'react';
import {
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  CodeBracketSquareIcon,
} from '@heroicons/react/24/solid';

import Image from 'next/image';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  mainImage: string;
  gallery: string[];
  link: string;
  client: string;
  challenge: string;
  solution: string;
  results: string[];
  year: string;
  featured: boolean;
}

const PortfolioSection: React.FC = () => {
  const portfolioProjects: Project[] = [
    {
      id: 1,
      title: 'Personal Blog & Portfolio',
      description: 'MDX-powered blog with advanced SEO features and modern design',
      tags: ['Next.js', 'TypeScript', 'MDX', 'Tailwind CSS', 'React'],
      mainImage: '/portfolio/coffey.codes-portfolio.png',
      gallery: ['/portfolio/coffey.codes-articles.png','/portfolio/coffey.codes-home.png', '/portfolio/coffey.codes-contact.png'],
      link: 'https://coffey.codes',
      client: 'Personal Project',
      challenge:
        'Build a performant, SEO-friendly blog and portfolio site with dynamic content, image optimization, and a modern design. Implement features like search, taxonomy (categories/tags), and pagination.',
      solution:
        'Leveraged Next.js App Router architecture with server components and MDX for content management. Implemented a custom hook-based pagination system, search API, and dynamic OpenGraph image generation.',
      results: [
        'Fast page loads with server-side rendering and static generation',
        'Semantic HTML and accessibility features for better SEO',
        'Full-text search across all blog content',
        'Taxonomy system with categories and tags',
        'Responsive design that works on all devices',
      ],
      year: '2023',
      featured: true,
    },
    {
      id: 2,
      title: 'React Drum Machine',
      description: 'A retro-inspired step sequencer built with React.js',
      tags: ['React', 'Node.js', 'Vite', 'Tailwind'],
      mainImage: 'portfolio/drum-machine-2.jpg',
      gallery: [],
      link: 'https://anthonycoffey.github.io/React-Drum-Kit',
      client: 'Hobby Project',
      challenge:
        'Originally built in 2016, this drum kit needed an update to become a fully functional step sequencer drum machine.',
      solution:
        'Implemented Howler.js for audio playback and used a two-dimensional array to manage the step sequencer functionality.',
      results: [
        'Fully functional step sequencer with tempo and volume controls',
        'Includes a demo pattern',
        'Reset button for easy restarting',
      ],
      year: '2025',
      featured: true,
    },
    {
      id: 3,
      title: 'Simply Voice',
      description: 'No Fuss Speech-to-Text app',
      tags: [
        'React',
        'Supabase',
        'Firebase',
        'Cloud Functions',
        'Google Cloud Text-to-Speech API',
      ],
      mainImage: 'portfolio/tts-home.jpg',
      gallery: ['portfolio/tts-created.jpg', 'portfolio/tts-history.jpg'],
      link: 'https://simply-voice-452800.web.app/',
      client: 'Hobby Project',
      challenge:
        'Create a simple web app that allows users to generate .wav files from text input using Google Cloud Text-to-Speech API, with user authentication and storage.',
      solution:
        'Implemented Supabase for Auth, Storage, and Database. Used Firebase Hosting and Functions for easy service account management and Google Cloud API integration.',
      results: [
        'User authentication and storage with Supabase',
        'Text to Speech conversion using Google Cloud Text-to-Speech API',
        'Downloadable .wav files',
        'History feature to view, play, download, or delete generated files',
      ],
      year: '2025',
      featured: true,
    },
    {
      id: 4,
      title: 'Piano Scale Visualizer',
      description:
        'Interactive musical scale visualizer for learning piano scales',
      tags: ['React', 'TailwindCSS', 'Howler.js'],
      mainImage: 'portfolio/piano-scale-visualizer.png',
      gallery: [],
      link: 'https://anthonycoffey.github.io/piano-scale-visualizer/',
      client: 'Hobby Project',
      challenge:
        'Create an educational tool for musicians to visualize and interact with various piano scales in an intuitive, engaging interface.',
      solution:
        'Developed an interactive virtual piano with visual highlighting for scales and real-time audio feedback using the Web Audio API.',
      results: [
        'Visual representation of scales in all 12 keys',
        'Interactive piano keyboard with audio playback',
        'Support for common scales, jazz scales, blues scales, and modes',
      ],
      year: '2025',
      featured: true,
    },
  ];

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // const [showAllProjects, setShowAllProjects] = useState(false);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  // const displayedProjects = showAllProjects
  //   ? portfolioProjects
  //   : portfolioProjects.filter((project) => project.featured);  
    const displayedProjects = portfolioProjects


  return (
    <section>
      <div className="page-content">

        <div className="border-b border-gray-300 pb-6 mb-8 max-w-6xl mx-auto">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
            <CodeBracketSquareIcon className="w-8 h-8 inline mr-3 text-blue-600" />
            Portfolio
          </h1>
          <p className="text-gray-600">Check out some of my recent work!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-6xl mx-auto">
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="border border-gray-200 bg-gray-50 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => openProject(project)}
            >
              <div className="h-64 overflow-hidden">
                <Image
                  src={project.mainImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {project.title}
                </h3>
                <p className="text-gray-600 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span className="flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    {project.client}
                  </span>
                  <span className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    {project.year}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View More/Less Button */}
        {/* {!showAllProjects && (
          <div className="text-center mb-12">
            <button
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="px-6 py-3 border border-blue-600 text-base rounded-md text-blue-600 bg-transparent font-medium flex items-center mx-auto justify-center hover:bg-blue-50 transition-colors"
            >
              {showAllProjects ? 'Show Featured Projects' : 'View All Projects'}
            </button>
          </div>
        )} */}

        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm transition-all duration-300"
            onClick={closeProject}
          >
            <div
              className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700 custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
                <h3 className="text-2xl font-bold tracking-tight">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={closeProject}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Close modal"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                <div className="lg:col-span-3 space-y-6">
                  <div className="overflow-hidden rounded-lg shadow-lg">
                    <Image
                      src={
                        activeImageIndex === 0
                          ? selectedProject.mainImage
                          : selectedProject.gallery[activeImageIndex - 1]
                      }
                      alt={selectedProject.title}
                      className="w-full h-auto object-fit"
                    />
                  </div>

                  {(selectedProject.gallery.length > 0) && (
                    <div className="grid grid-cols-4 gap-3">
                      <div
                        className={`cursor-pointer rounded-lg overflow-hidden shadow transition-all duration-200 ${
                          activeImageIndex === 0 
                            ? 'ring-2 ring-blue-600 scale-[1.02]' 
                            : 'opacity-80 hover:opacity-100'
                        }`}
                        onClick={() => setActiveImageIndex(0)}
                      >
                        <Image
                          src={selectedProject.mainImage}
                          alt="Main"
                          className="w-full h-20 object-cover"
                        />
                      </div>

                      {selectedProject.gallery.map((image, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer rounded-lg overflow-hidden shadow transition-all duration-200 ${
                            activeImageIndex === index + 1 
                              ? 'ring-2 ring-blue-600 scale-[1.02]' 
                              : 'opacity-80 hover:opacity-100'
                          }`}
                          onClick={() => setActiveImageIndex(index + 1)}
                        >
                          <Image
                            src={image}
                            alt={`Detail ${index + 1}`}
                            className="w-full h-20 object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-6 bg-gray-50 dark:bg-gray-800 p-6 rounded-xl">
                    <div>
                      <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Challenge
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedProject.challenge}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Solution
                      </h4>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedProject.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-blue-600 dark:text-blue-400 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Results
                      </h4>
                      <ul className="space-y-3">
                        {selectedProject.results.map((result, index) => (
                          <li key={index} className="flex items-start bg-white dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 dark:text-green-400 mr-3 flex-shrink-0 mt-0.5" />
                            <span className="text-gray-700 dark:text-gray-300">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Project Details
                    </h4>

                    <div className="space-y-5">
                      <div>
                        {selectedProject.link && (
                          <a
                            href={selectedProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-6 py-3 border border-blue-500 text-blue-700 dark:text-blue-400 text-base rounded-lg font-medium no-underline flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors shadow-sm"
                          >
                            <ArrowTopRightOnSquareIcon className="mr-2 h-5 w-5" />
                            View Live Project
                          </a>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Client:
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold">
                            {selectedProject.client}
                          </p>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                          <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Year:
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 font-semibold">
                            {selectedProject.year}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Technologies:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedProject.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center shadow-sm"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600 opacity-10 mix-blend-multiply"></div>
                    <div className="relative z-10">
                      <h4 className="text-xl font-bold mb-4 tracking-tight">
                        Interested in a similar solution?
                      </h4>
                      <p className="mb-6 text-gray-200 leading-relaxed">
                        Let&apos;s discuss how I can help you achieve similar results
                        for your business.
                      </p>

                      <div className="space-y-3">
                        <a
                          href="/contact"
                          className="w-full px-6 py-3 border border-transparent text-base rounded-lg text-white bg-blue-600 font-medium no-underline flex items-center justify-center hover:bg-blue-700 transition-colors shadow-md"
                        >
                          <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
                          Discuss Your Project
                        </a>

                        <a
                          target="_blank"
                          href="https://calendly.com/antcoffpersonal/meet"
                          rel="noopener noreferrer"
                          className="w-full px-6 py-3 border border-gray-300 text-base rounded-lg text-white bg-transparent font-medium no-underline flex items-center justify-center hover:bg-white/10 transition-colors shadow-md"
                        >
                          <CalendarDaysIcon className="mr-2 h-5 w-5" />
                          Schedule Consultation
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-600 p-8 rounded-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Ready to Build Your Next Great Project?
          </h2>
          <p className="text-center text-xl mb-8">
            Let&apos;s create a custom solution that achieves your business goals
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="/contact"
              className="px-6 py-3 border border-transparent text-base rounded-md text-blue-600 bg-white font-medium no-underline flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
              Start Your Project
            </a>
            <a
              target="_blank"
              href="https://calendly.com/antcoffpersonal/meet"
              className="px-6 py-3 border border-white text-base rounded-md text-white bg-transparent no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
            >
              <CalendarDaysIcon className="mr-2 h-5 w-5" />
              Book Free Consultation
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
