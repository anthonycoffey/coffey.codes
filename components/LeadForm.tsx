'use client';
import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import {
  ChatBubbleOvalLeftIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/solid';
import { useLeadFormSubmit } from '@/hooks/useLeadFormSubmit';

// Qualifying dropdown options. Exported so tests and future config can reuse the
// exact option sets. Order matters: it reads as the delivery lifecycle.
export const PROJECT_STAGE_OPTIONS = [
  'Idea / discovery',
  'Prototype / MVP',
  'Live product needing improvement',
  'Rescue / take over an existing codebase',
  'Scaling / performance',
] as const;

export const TIMELINE_OPTIONS = [
  'ASAP',
  '1-3 months',
  '3-6 months',
  'Just exploring',
] as const;

export const BUDGET_OPTIONS = [
  'Under $5k',
  '$5k - $15k',
  '$15k - $50k',
  '$50k+',
  'Not sure yet',
] as const;

const LeadSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  company: Yup.string(),
  phone: Yup.string(),
  projectBrief: Yup.string().required('A short project brief is required'),
  projectStage: Yup.string().required('Please select a project stage'),
  timeline: Yup.string().required('Please select a timeline'),
  budget: Yup.string().required('Please select a budget range'),
  consent: Yup.boolean()
    .oneOf([true], 'You must consent to data collection and contact')
    .required('You must consent to data collection and contact'),
});

export interface LeadFormValues {
  name: string;
  email: string;
  company: string;
  phone: string;
  projectBrief: string;
  projectStage: string;
  timeline: string;
  budget: string;
  consent: boolean;
}

const INITIAL_VALUES: LeadFormValues = {
  name: '',
  email: '',
  company: '',
  phone: '',
  projectBrief: '',
  projectStage: '',
  timeline: '',
  budget: '',
  consent: false,
};

// Compose a human-readable message that embeds every structured field. This
// guarantees the backend email contains the full inquiry even if the Google
// Cloud Function only reads name/email/message (see SPEC-032, requirement 3).
export function composeLeadMessage(values: LeadFormValues): string {
  return [
    `Project brief: ${values.projectBrief}`,
    values.company ? `Company: ${values.company}` : null,
    values.phone ? `Phone: ${values.phone}` : null,
    `Project stage: ${values.projectStage}`,
    `Timeline: ${values.timeline}`,
    `Budget: ${values.budget}`,
  ]
    .filter(Boolean)
    .join('\n');
}

export interface LeadFormProps {
  /** Identifies the landing page for GA4 attribution, e.g. `lp_practical_ai`. */
  formName: string;
  /** Submit button label. Defaults to "Send Message". */
  submitLabel?: string;
}

export default function LeadForm({
  formName,
  submitLabel = 'Send Message',
}: LeadFormProps) {
  const { submit, isSent, error: apiError } = useLeadFormSubmit(formName);

  const inputClasses =
    'mt-1 block w-full rounded-md border border-border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent1-dark focus:ring-offset-2 bg-surface text-c-text placeholder-c-muted';
  const labelClasses = 'block text-sm font-medium text-c-text';
  const errorClasses = 'text-red-500 text-xs mt-1';

  return (
    <>
      {!isSent ? (
        <Formik
          initialValues={INITIAL_VALUES}
          validationSchema={LeadSchema}
          onSubmit={async (values, { resetForm }) => {
            // Keep name/email/consent intact; also send the structured fields and
            // a composed message so nothing is lost regardless of the backend.
            const payload = {
              ...values,
              formName,
              message: composeLeadMessage(values),
            };
            const ok = await submit(payload);
            if (ok) {
              resetForm();
            }
          }}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className={labelClasses}>
                    Name <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="text"
                    name="name"
                    id="name"
                    className={`${inputClasses} ${
                      errors.name && touched.name ? 'border-red-500' : ''
                    }`}
                    placeholder="Your Name"
                    autoComplete="name"
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className={errorClasses}
                  />
                </div>
                <div>
                  <label htmlFor="email" className={labelClasses}>
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Field
                    type="email"
                    name="email"
                    id="email"
                    className={`${inputClasses} ${
                      errors.email && touched.email ? 'border-red-500' : ''
                    }`}
                    placeholder="your.email@example.com"
                    autoComplete="email"
                  />
                  <ErrorMessage
                    name="email"
                    component="div"
                    className={errorClasses}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="company" className={labelClasses}>
                    Company
                  </label>
                  <Field
                    type="text"
                    name="company"
                    id="company"
                    className={inputClasses}
                    placeholder="Your Company"
                    autoComplete="organization"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClasses}>
                    Phone
                  </label>
                  <Field
                    type="tel"
                    name="phone"
                    id="phone"
                    className={inputClasses}
                    placeholder="(optional)"
                    autoComplete="tel"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="projectBrief" className={labelClasses}>
                  Project brief <span className="text-red-500">*</span>
                </label>
                <Field
                  as="textarea"
                  id="projectBrief"
                  name="projectBrief"
                  rows={4}
                  className={`${inputClasses} ${
                    errors.projectBrief && touched.projectBrief
                      ? 'border-red-500'
                      : ''
                  }`}
                  placeholder="What are you trying to build or fix? A few sentences is plenty."
                  autoComplete="off"
                />
                <ErrorMessage
                  name="projectBrief"
                  component="div"
                  className={errorClasses}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="projectStage" className={labelClasses}>
                    Project stage <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="projectStage"
                    name="projectStage"
                    className={`${inputClasses} ${
                      errors.projectStage && touched.projectStage
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="" disabled>
                      Select stage
                    </option>
                    {PROJECT_STAGE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="projectStage"
                    component="div"
                    className={errorClasses}
                  />
                </div>
                <div>
                  <label htmlFor="timeline" className={labelClasses}>
                    Timeline <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="timeline"
                    name="timeline"
                    className={`${inputClasses} ${
                      errors.timeline && touched.timeline
                        ? 'border-red-500'
                        : ''
                    }`}
                  >
                    <option value="" disabled>
                      Select timeline
                    </option>
                    {TIMELINE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="timeline"
                    component="div"
                    className={errorClasses}
                  />
                </div>
                <div>
                  <label htmlFor="budget" className={labelClasses}>
                    Budget <span className="text-red-500">*</span>
                  </label>
                  <Field
                    as="select"
                    id="budget"
                    name="budget"
                    className={`${inputClasses} ${
                      errors.budget && touched.budget ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="" disabled>
                      Select budget
                    </option>
                    {BUDGET_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="budget"
                    component="div"
                    className={errorClasses}
                  />
                </div>
              </div>

              <p className="text-sm text-c-muted">
                Not sure yet? See how I&apos;ve delivered on time and to spec:{' '}
                <a
                  href="/case-studies"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline"
                >
                  case studies
                </a>{' '}
                and{' '}
                <a
                  href="/portfolio"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline"
                >
                  portfolio
                </a>
                .
              </p>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <Field
                    id="consent"
                    name="consent"
                    type="checkbox"
                    className={`focus:ring-accent1-dark h-4 w-4 accent-accent1-dark border-border rounded bg-surface ${
                      errors.consent && touched.consent ? 'border-red-500' : ''
                    }`}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="consent" className="font-medium text-c-text">
                    Consent to Contact <span className="text-red-500">*</span>
                  </label>
                  <p className="text-c-muted text-xs">
                    I understand my information will be used to respond to this
                    inquiry via email.
                  </p>
                  <ErrorMessage
                    name="consent"
                    component="div"
                    className={errorClasses}
                  />
                </div>
              </div>

              {apiError && (
                <div
                  className="flex items-center p-3 rounded-md bg-surface border border-border"
                  role="alert"
                >
                  <ExclamationCircleIcon
                    className="h-5 w-5 text-red-500 mr-2 flex-shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-red-500">{apiError}</span>
                </div>
              )}

              <div className="flex items-center justify-center pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 rounded-full text-base font-semibold bg-accent1-dark text-surface hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent1-dark disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  aria-label={submitLabel}
                >
                  {isSubmitting ? (
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
                  {isSubmitting ? 'Sending...' : submitLabel}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      ) : (
        <div
          className="flex items-center p-4 rounded-md bg-surface border border-border"
          role="alert"
        >
          <CheckCircleIcon
            className="h-6 w-6 text-accent1-dark mr-3 flex-shrink-0"
            aria-hidden="true"
          />
          <span className="text-base font-medium text-c-heading">
            Thanks. Your message has been sent. I&apos;ll get back to you within
            one business day.
          </span>
        </div>
      )}
    </>
  );
}
