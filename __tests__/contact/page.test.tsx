import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/components/ContactForm', () => ({
  default: () => <form data-testid="contact-form" />,
}));

vi.mock('@/components/ui/RetroWindow', () => ({
  default: ({
    title,
    children,
  }: {
    title?: string;
    children: React.ReactNode;
  }) => (
    <section data-testid="retro-window" data-title={title}>
      {children}
    </section>
  ),
}));

vi.mock('@/components/ui/Button', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href?: string;
    children: React.ReactNode;
  }) =>
    href ? (
      <a href={href} {...rest}>
        {children}
      </a>
    ) : (
      <button {...rest}>{children}</button>
    ),
}));

vi.mock('@heroicons/react/24/outline', () => ({
  CalendarDaysIcon: () => null,
  EnvelopeIcon: () => null,
  PhoneIcon: () => null,
  MapPinIcon: () => null,
}));

vi.mock('@heroicons/react/24/solid', () => ({
  EnvelopeOpenIcon: () => null,
}));

import ContactPage from '@/app/(site)/contact/page';

describe('ContactPage', () => {
  it('renders the page heading', async () => {
    const jsx = await ContactPage();
    render(jsx as React.ReactElement);
    expect(
      screen.getByRole('heading', { level: 1, name: /contact me/i }),
    ).toBeInTheDocument();
  });

  it('renders the contact form', async () => {
    const jsx = await ContactPage();
    render(jsx as React.ReactElement);
    expect(screen.getByTestId('contact-form')).toBeInTheDocument();
  });

  it('renders the phone, email, and location info blocks', async () => {
    const jsx = await ContactPage();
    render(jsx as React.ReactElement);
    expect(screen.getByText('Phone')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Austin, Texas')).toBeInTheDocument();
  });

  it('renders the Calendly booking link', async () => {
    const jsx = await ContactPage();
    render(jsx as React.ReactElement);
    const link = screen.getByRole('link', { name: /book your free session/i });
    expect(link).toHaveAttribute(
      'href',
      'https://calendly.com/antcoffpersonal/meet',
    );
    expect(link).toHaveAttribute('target', '_blank');
  });
});
