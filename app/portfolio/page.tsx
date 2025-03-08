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
  // Sample portfolio data - replace with your actual projects
  const portfolioProjects: Project[] = [
    {
      id: 1,
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
      id: 2,
      title: 'Simply Voice',
      description: 'No Fuss Speech-to-Text app',
      tags: [
        'React',
        'Supabase',
        'Firebase',
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
  ];

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showAllProjects, setShowAllProjects] = useState(false);

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  // Filter projects based on featured status and showAllProjects state
  const displayedProjects = showAllProjects
    ? portfolioProjects
    : portfolioProjects.filter((project) => project.featured);

  return (
    <section>
      <div className="page-content">
        {/* Portfolio Section Header */}

        <div className="border-b pb-4 mb-8 max-w-6xl mx-auto">
          <h1 className="font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center">
            <CodeBracketSquareIcon className="w-8 h-8 inline mr-3 text-blue-600" />
            Portfolio
          </h1>
          <p className="text-gray-600">Check out some of my recent work!</p>
        </div>

        {/* Portfolio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-6xl mx-auto">
          {displayedProjects.map((project) => (
            <div
              key={project.id}
              className="border bg-gray-50 rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:shadow-lg cursor-pointer"
              onClick={() => openProject(project)}
            >
              <div className="h-64 overflow-hidden">
                <img
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

        {/* Project Detail Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
            onClick={closeProject}
          >
            <div
              className="bg-white rounded-lg overflow-hidden max-w-6xl w-full max-h-screen overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b">
                <h3 className="text-2xl font-bold text-gray-800">
                  {selectedProject.title}
                </h3>
                <button
                  onClick={closeProject}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
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
                {/* Main Content - 3 columns */}
                <div className="lg:col-span-3">
                  {/* Main Image */}
                  <div className="mb-6">
                    <img
                      src={
                        activeImageIndex === 0
                          ? selectedProject.mainImage
                          : selectedProject.gallery[activeImageIndex - 1]
                      }
                      alt={selectedProject.title}
                      className="w-full h-auto object-fit"
                    />
                  </div>

                  {/* Thumbnail Gallery */}
                  <div className="grid grid-cols-3 gap-2">
                    <div
                      className={`cursor-pointer rounded overflow-hidden border-2 ${activeImageIndex === 0 ? 'border-blue-600' : 'border-transparent'}`}
                      onClick={() => setActiveImageIndex(0)}
                    >
                      <img
                        src={selectedProject.mainImage}
                        alt="Main"
                        className="w-full h-32 object-fit"
                      />
                    </div>

                    {selectedProject.gallery.map((image, index) => (
                      <div
                        key={index}
                        className={`cursor-pointer rounded overflow-hidden border-2 ${activeImageIndex === index + 1 ? 'border-blue-600' : 'border-transparent'}`}
                        onClick={() => setActiveImageIndex(index + 1)}
                      >
                        <img
                          src={image}
                          alt={`Detail ${index + 1}`}
                          className="w-full h-32 object-fit"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Challenge & Solution Section */}
                  <div className="mt-8">
                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-blue-600 mb-2">
                        Challenge
                      </h4>
                      <p className="text-gray-700">
                        {selectedProject.challenge}
                      </p>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-blue-600 mb-2">
                        Solution
                      </h4>
                      <p className="text-gray-700">
                        {selectedProject.solution}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-blue-600 mb-2">
                        Results
                      </h4>
                      <ul className="space-y-2">
                        {selectedProject.results.map((result, index) => (
                          <li key={index} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                            <span>{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Project Details - 2 columns */}
                <div className="lg:col-span-2">
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <h4 className="text-lg font-bold text-gray-800 mb-4">
                      Project Details
                    </h4>

                    <div className="space-y-4">
                      <div>
                        {selectedProject.link && (
                          <a
                            href={selectedProject.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full px-6 py-3 border border-blue-500 text-blue-700 text-base rounded-md font-medium no-underline flex items-center justify-center  transition-colors"
                          >
                            <ArrowTopRightOnSquareIcon className="mr-2 h-5 w-5" />
                            View Live Project
                          </a>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-700 mb-1">
                          Client:
                        </p>
                        <p className="text-gray-600">
                          {selectedProject.client}
                        </p>
                      </div>

                      <div>
                        <p className="font-medium text-gray-700 mb-1">Year:</p>
                        <p className="text-gray-600">{selectedProject.year}</p>
                      </div>

                      <div>
                        <p className="font-medium text-gray-700 mb-1">
                          Technologies:
                        </p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedProject.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-blue-100 text-blue-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center"
                            >
                              <TagIcon className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-800 p-6 rounded-lg text-white ">
                    <h4 className="text-lg font-bold mb-4">
                      Interested in a similar solution?
                    </h4>
                    <p className="mb-6">
                      Let's discuss how I can help you achieve similar results
                      for your business.
                    </p>

                    <div className="space-y-3">
                      <a
                        href="/contact"
                        className="w-full px-6 py-3 border border-transparent text-base rounded-md text-white bg-blue-600 font-medium no-underline flex items-center justify-center hover:bg-blue-700 transition-colors"
                      >
                        <ChatBubbleOvalLeftIcon className="mr-2 h-5 w-5" />
                        Discuss Your Project
                      </a>

                      <a
                        target="_blank"
                        href="https://calendly.com/antcoffpersonal/meet"
                        rel="noopener noreferrer"
                        className="w-full px-6 py-3 border border-gray-500 text-base rounded-md text-white bg-transparent font-medium no-underline flex items-center justify-center hover:bg-gray-700 transition-colors"
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
        )}

        {/* CTA Section */}
        <div className="bg-blue-600 p-8 rounded-lg text-white">
          <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
            Ready to Build Your Next Great Project?
          </h2>
          <p className="text-center text-xl mb-8">
            Let's create a custom solution that achieves your business goals
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
