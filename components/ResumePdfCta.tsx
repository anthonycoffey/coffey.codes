import {
  ArrowDownTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/20/solid';

// Public path in /public, URL-encoded for the space in the filename.
const RESUME_HREF = '/Anthony%20Coffey%20-%20Resume.pdf';

/**
 * Resume download CTA. Gradient stripe, stacked-document hover
 * affordance, editorial headline, pill button.
 *
 * GA4's enhanced-measurement file_download event fires automatically
 * on click (keyed as a soft lead per docs/strategy/ga4-events.md).
 */
export default function ResumePdfCta() {
  return (
    <aside
      data-testid="resume-pdf-cta"
      className="group not-prose relative mt-12 overflow-hidden rounded-2xl border border-border bg-surface"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[3px]"
        style={{
          background:
            'linear-gradient(90deg, var(--color-accent-1) 0%, #BD93F9 50%, var(--color-accent-3) 100%)',
        }}
      />

      <div className="grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:gap-10">
        <div
          aria-hidden="true"
          className="relative mx-auto h-28 w-24 shrink-0 md:mx-0"
        >
          <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-lg border border-border bg-bg-alt opacity-60 transition-transform duration-300 group-hover:translate-x-3 group-hover:translate-y-3" />
          <div className="absolute inset-0 translate-x-1 translate-y-1 rounded-lg border border-border bg-bg-alt opacity-80 transition-transform duration-300 group-hover:translate-x-[6px] group-hover:translate-y-[6px]" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-border bg-bg shadow-sm transition-transform duration-300 group-hover:-rotate-2">
            <DocumentTextIcon className="h-8 w-8 text-accent1-dark" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-c-muted">
              PDF
            </span>
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.28em] text-accent1-dark">
            Work Experience
          </p>
          <h2
            className="font-editorial text-2xl leading-tight text-c-heading sm:text-3xl"
            style={{ letterSpacing: '0.005em' }}
          >
            Take my resume with you.
          </h2>
          <p className="mx-auto mt-3 mb-6 max-w-xl leading-relaxed text-c-muted md:mx-0">
            Download my resume to read offline or share with the hiring team.
          </p>
          <a
            href={RESUME_HREF}
            download
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Resume PDF"
            className="inline-flex items-center gap-2 rounded-full bg-accent1-dark px-5 py-2.5 text-sm font-semibold text-surface no-underline transition-opacity hover:opacity-90"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            Download Resume
          </a>
        </div>
      </div>
    </aside>
  );
}
