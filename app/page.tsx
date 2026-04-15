import { backend, frontend } from './logos';
import LogoGrid from '../components/LogoGrid';
import Testimonials from '../components/Testimonials';
import SocialIcons from '../components/SocialIcons';
import RetroWindow from '../components/ui/RetroWindow';
import Button from '../components/ui/Button';
import {
  ChatBubbleOvalLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  BoltIcon,
  ShieldCheckIcon,
  CodeBracketIcon,
  ServerIcon,
  CommandLineIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/solid';
import Image from 'next/image';

export const metadata = {
  title: 'Anthony Coffey | Full Stack Software Engineer',
  description:
    'Build reliable, scalable software with Anthony Coffey. 12+ years of full stack engineering expertise in React, Node.js, and cloud architecture.',
};

const services = [
  {
    icon: <BoltIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'Performance & Optimization',
    desc: 'Optimize application speed and efficiency through code-level improvements, database tuning, and efficient resource management.',
  },
  {
    icon: <ShieldCheckIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'Secure App Development',
    desc: 'Implement robust security measures (OWASP Top 10, XSS/CSRF protection) to safeguard your applications and user data.',
  },
  {
    icon: <CodeBracketIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'Full Stack Development',
    desc: 'Build custom, production-ready web and mobile applications using React, React Native, Next.js, and Node.js.',
  },
  {
    icon: <ServerIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'Cloud Architecture',
    desc: 'Design and implement resilient, cost-effective cloud solutions on AWS and Google Cloud (GCP) that support sustainable growth.',
  },
  {
    icon: <AdjustmentsHorizontalIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'AI-Powered Solutions',
    desc: 'Integrate practical AI/ML capabilities (Gemini, Cloud Vision) into applications to solve complex problems and enhance user experience.',
  },
  {
    icon: <CommandLineIcon className="h-6 w-6 text-accent1-dark" />,
    title: 'DevOps & Infrastructure',
    desc: 'Implement efficient CI/CD pipelines, containerization (Docker/Kubernetes), and infrastructure as code (Terraform) for reliable deployments.',
  },
];

const principles = [
  { title: 'Clean Code', desc: 'Writing maintainable, self-documenting code that is easy to extend.' },
  { title: 'High Test Coverage', desc: 'Ensuring reliability with comprehensive unit and integration tests.' },
  { title: 'Modern Tech Stack', desc: 'Leveraging the latest tools like React, Next.js, and TypeScript.' },
  { title: 'Practical AI Integration', desc: 'Implementing AI/ML solutions that solve real-world problems.' },
  { title: 'Production-Ready Focus', desc: 'Delivering robust, secure, and deployable software.' },
  { title: 'Clear Communication', desc: 'Transparent updates and collaboration throughout the development process.' },
];

export default function Page() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="hero" className="bg-bg py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 items-center gap-12">
          <div>
            <h1 className="font-fraunces leading-tight text-3xl md:text-5xl font-bold mb-4 text-c-heading">
              Reliable, Scalable, Cutting Edge A.I. Solutions 
            </h1>
            <p className="text-lg text-c-text mb-8">
              Full Stack Engineer with 12+ years of experience shipping
              production-ready applications. Specializing in React, Node.js, and
              Cloud Architecture.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
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

          <div className="hidden md:flex justify-center">
            <RetroWindow title="anthony-coffey.jpg" className="w-72">
              <div className="p-4">
                <Image
                  width={330}
                  height={330}
                  src="/headshot.png"
                  alt="Anthony Coffey"
                  className="w-full h-auto object-cover rounded"
                />
                <div className="mt-3">
                  <p className="font-fraunces font-bold text-link text-base m-0">Anthony Coffey</p>
                  <p className="text-c-text text-sm m-0 font-semibold">Full Stack Software Engineer</p>
                  <p className="text-c-muted text-xs m-0">Austin, Texas</p>
                  <SocialIcons />
                </div>
              </div>
            </RetroWindow>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="bg-bg-alt py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-center text-c-heading mb-10">
            Technical Expertise
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s) => (
              <div key={s.title} className="bg-surface border border-border rounded-2xl p-6 hover:bg-surface-hover transition-colors">
                <div className="flex items-center gap-3 mb-3">
                  {s.icon}
                  <h3 className="text-base font-bold text-c-heading">{s.title}</h3>
                </div>
                <p className="text-c-text text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Engineering Principles ───────────────────────────────────────── */}
      <section id="principles" className="bg-bg py-16">
        <div className="max-w-3xl mx-auto px-4">
          <RetroWindow title="engineering-principles.txt">
            <div className="p-6">
              <h2 className="font-fraunces text-2xl font-bold text-c-heading mb-6 text-center">
                Engineering Principles
              </h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {principles.map((item) => (
                  <li key={item.title} className="flex items-start gap-3">
                    <CheckCircleIcon className="h-5 w-5 text-accent1-dark mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="block font-semibold text-c-heading text-sm">{item.title}</span>
                      <span className="block text-c-muted text-sm">{item.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </RetroWindow>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────────────────────────────────────── */}
      <section id="tech-stack" className="bg-bg-alt py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-center text-c-heading mb-8">
            Tech Stack
          </h2>
          <div className="bg-bg rounded-2xl border border-border p-8">
            <LogoGrid logos={[...frontend, ...backend]} />
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section id="testimonials" className="bg-bg py-16">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-fraunces text-2xl md:text-3xl font-bold mb-10 text-center text-c-heading">
            Don&apos;t Just Take My Word For It!
          </h2>
          <Testimonials />
        </div>
      </section>

      {/* ── CTA Strip ────────────────────────────────────────────────────── */}
      <section id="cta" className="bg-accent2 border-y-2 border-border py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-fraunces text-2xl md:text-3xl font-bold text-c-heading mb-4">
            Ready to Build Your Next Project?
          </h2>
          <p className="text-c-text mb-8">
            Let&apos;s discuss how I can help you ship reliable, high-quality software.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button as="a" href="/contact" variant="primary">
              <ChatBubbleOvalLeftIcon className="h-5 w-5" />
              Start a Conversation
            </Button>
            <Button as="a" href="https://calendly.com/antcoffpersonal/meet" variant="secondary" target="_blank" rel="noopener noreferrer">
              <CalendarDaysIcon className="h-5 w-5" />
              Schedule 30-Min Consultation
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
