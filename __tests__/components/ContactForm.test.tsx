import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import ContactForm from '@/components/ContactForm';

const dataLayer = () =>
  ((window as Window & { dataLayer?: Array<Record<string, unknown>> })
    .dataLayer ?? []) as Array<Record<string, unknown>>;

// Locks the useLeadFormSubmit refactor: ContactForm must still POST to the same
// endpoint and fire form_submit with formName 'contact'.
describe('<ContactForm /> (post-refactor behavior)', () => {
  beforeEach(() => {
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
    global.fetch = vi.fn(() =>
      Promise.resolve({ ok: true, json: async () => ({}) } as Response),
    ) as unknown as typeof fetch;
  });

  it('submits to /functions/sendContactFormEmail and fires form_submit(contact)', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email/i), 'grace@example.com');
    await user.type(screen.getByLabelText(/^message/i), 'Hello there.');
    await user.click(screen.getByLabelText(/consent to contact/i));
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
    const [url] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe('/functions/sendContactFormEmail');

    expect(
      await screen.findByText(/your message has been sent successfully/i),
    ).toBeInTheDocument();

    expect(dataLayer().find((e) => e.event === 'form_submit')).toMatchObject({
      event: 'form_submit',
      formName: 'contact',
    });
  });

  it('does not submit when consent is unchecked', async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), 'Grace Hopper');
    await user.type(screen.getByLabelText(/email/i), 'grace@example.com');
    await user.type(screen.getByLabelText(/^message/i), 'Hello there.');
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/you must consent to data collection/i),
    ).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
