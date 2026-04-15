'use client';
import React, { useState, useEffect } from 'react';
import {
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  TagIcon,
  UserIcon,
  ClockIcon,
  CodeBracketSquareIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import RetroWindow from '../../components/ui/RetroWindow';
import Button from '../../components/ui/Button';

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
      description:
        'MDX-powered blog with advanced SEO features and modern design',
      tags: ['Next.js', 'TypeScript', 'MDX', 'Tailwind CSS', 'React'],
      mainImage: '/portfolio/coffey.codes-portfolio.png',
      gallery: [
        '/portfolio/coffey.codes-articles.png',
        '/portfolio/coffey.codes-home.png',
        '/portfolio/coffey.codes-contact.png',
      ],
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
      mainImage: '/portfolio/drum-machine-2.jpg',
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
      mainImage: '/portfolio/tts-home.jpg',
      gallery: ['/portfolio/tts-created.jpg', '/portfolio/tts-history.jpg'],
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
      mainImage: '/portfolio/piano-scale-visualizer.png',
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

  const openProject = (project: Project) => {
    setSelectedProject(project);
    setActiveImageIndex(0);
  };

  const closeProject = () => {
    setSelectedProject(null);
  };

  // Scroll lock when modal open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [selectedProject]);

  const tiltAngles = [-1.5, 1, -2, 0.5];
  const displayedProjects = portfolioProjects;

  return (
    <section className="bg-bg min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="border-b border-border pb-6 mb-10">
          <h1 className="font-fraunces font-bold text-3xl lg:text-4xl tracking-tighter mb-2 flex items-center text-c-heading">
            <CodeBracketSquareIcon className="w-8 h-8 inline mr-3 text-accent1-dark" />
            Portfolio
          </h1>
          <p className="text-c-muted">Check out some of my recent work!</p>
        </div>

        {/* Polaroid grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
          {displayedProjects.map((project, i) => (
            <div
              key={project.id}
              className="polaroid-card vhs-card cursor-pointer"
              style={{ '--card-tilt': `${tiltAngles[i % tiltAngles.length]}deg` } as React.CSSProperties}
              onClick={() => openProject(project)}
            >
              <div className="h-56 overflow-hidden">
                <Image
                  width={1200}
                  height={1200}
                  src={project.mainImage}
                  alt={project.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="pt-3 px-1">
                <h3 className="font-fraunces text-lg font-bold text-c-heading mb-1">{project.title}</h3>
                <p className="text-c-muted text-sm mb-3">{project.description}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {project.tags.map((tag, idx) => (
                    <span key={idx} className="bg-accent2 text-c-heading text-xs font-semibold px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-c-muted">
                  <span className="flex items-center gap-1"><UserIcon className="h-3 w-3" />{project.client}</span>
                  <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{project.year}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProject && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 bg-black/80 backdrop-blur-sm"
            onClick={closeProject}
          >
            <div
              className="bg-surface rounded-xl shadow-2xl overflow-hidden max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-border custom-scrollbar"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex justify-between items-center p-4 bg-accent2 border-b-2 border-border">
                <h3 className="font-fraunces text-xl font-bold text-c-heading">{selectedProject.title}</h3>
                <button
                  onClick={closeProject}
                  className="p-1.5 rounded-full hover:bg-surface-hover transition-colors text-c-muted"
                  aria-label="Close modal"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 p-6">
                {/* Left: image + details */}
                <div className="lg:col-span-3 space-y-6">
                  <RetroWindow title={selectedProject.title}>
                    <Image
                      width={1200}
                      height={1200}
                      src={activeImageIndex === 0 ? selectedProject.mainImage : selectedProject.gallery[activeImageIndex - 1]}
                      alt={selectedProject.title}
                      className="w-full h-auto object-fit"
                    />
                  </RetroWindow>

                  {selectedProject.gallery.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      <div
                        className={`cursor-pointer rounded overflow-hidden transition-all duration-200 ${activeImageIndex === 0 ? 'ring-2 ring-accent1-dark scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
                        onClick={() => setActiveImageIndex(0)}
                      >
                        <Image width={300} height={300} src={selectedProject.mainImage} alt="Main" className="w-full h-16 object-cover" />
                      </div>
                      {selectedProject.gallery.map((image, index) => (
                        <div
                          key={index}
                          className={`cursor-pointer rounded overflow-hidden transition-all duration-200 ${activeImageIndex === index + 1 ? 'ring-2 ring-accent1-dark scale-[1.02]' : 'opacity-70 hover:opacity-100'}`}
                          onClick={() => setActiveImageIndex(index + 1)}
                        >
                          <Image width={300} height={300} src={image} alt={`Detail ${index + 1}`} className="w-full h-16 object-cover" />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-5 bg-bg-alt p-6 rounded-xl border border-border">
                    <div>
                      <h4 className="font-fraunces text-base font-bold text-link mb-2">Challenge</h4>
                      <p className="text-c-text leading-relaxed text-sm">{selectedProject.challenge}</p>
                    </div>
                    <div>
                      <h4 className="font-fraunces text-base font-bold text-link mb-2">Solution</h4>
                      <p className="text-c-text leading-relaxed text-sm">{selectedProject.solution}</p>
                    </div>
                    <div>
                      <h4 className="font-fraunces text-base font-bold text-link mb-2">Results</h4>
                      <ul className="space-y-2">
                        {selectedProject.results.map((result, index) => (
                          <li key={index} className="flex items-start bg-surface p-3 rounded-lg border border-border">
                            <CheckCircleIcon className="h-4 w-4 text-accent1-dark mr-2 flex-shrink-0 mt-0.5" />
                            <span className="text-c-text text-sm">{result}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Right: sidebar */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-surface border border-border p-5 rounded-xl">
                    <h4 className="font-fraunces text-base font-bold text-c-heading mb-4">Project Details</h4>
                    <div className="space-y-4">
                      {selectedProject.link && (
                        <Button as="a" href={selectedProject.link} variant="secondary" size="sm" target="_blank" rel="noopener noreferrer" className="w-full justify-center">
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                          View Live Project
                        </Button>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-bg-alt p-3 rounded-lg border border-border">
                          <p className="text-c-muted text-xs mb-1">Client</p>
                          <p className="text-c-text text-sm font-semibold">{selectedProject.client}</p>
                        </div>
                        <div className="bg-bg-alt p-3 rounded-lg border border-border">
                          <p className="text-c-muted text-xs mb-1">Year</p>
                          <p className="text-c-text text-sm font-semibold">{selectedProject.year}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-c-muted text-xs mb-2">Technologies</p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProject.tags.map((tag, index) => (
                            <span key={index} className="bg-accent2 text-c-heading text-xs font-semibold px-2 py-1 rounded flex items-center gap-1">
                              <TagIcon className="h-3 w-3" />{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-bg-alt border border-border p-5 rounded-xl">
                    <h4 className="font-fraunces text-base font-bold text-c-heading mb-3">Interested in a similar solution?</h4>
                    <p className="text-c-muted text-sm mb-5 leading-relaxed">
                      Let&apos;s discuss how I can help you achieve similar results for your business.
                    </p>
                    <div className="space-y-3">
                      <Button as="a" href="/contact" variant="primary" size="sm" className="w-full justify-center">
                        <ChatBubbleOvalLeftIcon className="h-4 w-4" />
                        Discuss Your Project
                      </Button>
                      <Button as="a" href="https://calendly.com/antcoffpersonal/meet" variant="secondary" size="sm" target="_blank" rel="noopener noreferrer" className="w-full justify-center">
                        <CalendarDaysIcon className="h-4 w-4" />
                        Schedule Consultation
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="bg-accent2 border-2 border-border p-8 rounded-2xl text-center mt-4">
          <h2 className="font-fraunces text-2xl md:text-3xl font-bold mb-3 text-c-heading">
            Ready to Build Your Next Great Project?
          </h2>
          <p className="text-c-text mb-8">Let&apos;s create a custom solution that achieves your business goals</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button as="a" href="/contact" variant="primary">
              <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              Start Your Project
            </Button>
            <Button as="a" href="https://calendly.com/antcoffpersonal/meet" variant="secondary" target="_blank" rel="noopener noreferrer">
              <CalendarDaysIcon className="h-5 w-5" />
              Book Free Consultation
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PortfolioSection;
