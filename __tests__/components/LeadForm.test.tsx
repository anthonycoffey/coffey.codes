import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import LeadForm, {
  composeLeadMessage,
  PROJECT_STAGE_OPTIONS,
  TIMELINE_OPTIONS,
  BUDGET_OPTIONS,
} from '@/components/LeadForm';

const dataLayer = () =>
  ((window as Window & { dataLayer?: Array<Record<string, unknown>> })
    .dataLayer ?? []) as Array<Record<string, unknown>>;

function okResponse() {
  return { ok: true, json: async () => ({}) } as Response;
}

// Fill every required field with valid values so a submit reaches the backend.
async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/name/i), 'Ada Lovelace');
  await user.type(screen.getByLabelText(/email/i), 'ada@example.com');
  await user.type(
    screen.getByLabelText(/project brief/i),
    'Need an internal analytics dashboard.',
  );
  await user.selectOptions(
    screen.getByLabelText(/project stage/i),
    PROJECT_STAGE_OPTIONS[1],
  );
  await user.selectOptions(
    screen.getByLabelText(/timeline/i),
    TIMELINE_OPTIONS[1],
  );
  await user.selectOptions(screen.getByLabelText(/budget/i), BUDGET_OPTIONS[2]);
  await user.click(screen.getByLabelText(/consent to contact/i));
}

describe('<LeadForm />', () => {
  beforeEach(() => {
    (window as Window & { dataLayer?: unknown[] }).dataLayer = [];
    global.fetch = vi.fn(() =>
      Promise.resolve(okResponse()),
    ) as unknown as typeof fetch;
  });

  it('composeLeadMessage embeds the brief and all three dropdown selections', () => {
    const message = composeLeadMessage({
      name: 'Ada',
      email: 'ada@example.com',
      company: 'Analytical Engines',
      phone: '555-0100',
      projectBrief: 'Build a dashboard',
      projectStage: PROJECT_STAGE_OPTIONS[0],
      timeline: TIMELINE_OPTIONS[0],
      budget: BUDGET_OPTIONS[0],
      consent: true,
    });
    expect(message).toContain('Build a dashboard');
    expect(message).toContain(PROJECT_STAGE_OPTIONS[0]);
    expect(message).toContain(TIMELINE_OPTIONS[0]);
    expect(message).toContain(BUDGET_OPTIONS[0]);
    expect(message).toContain('Analytical Engines');
    expect(message).toContain('555-0100');
  });

  it('blocks submission and shows validation errors when required fields are empty', async () => {
    const user = userEvent.setup();
    render(<LeadForm formName="lp_test" />);

    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(await screen.findByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    expect(
      screen.getByText(/a short project brief is required/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/please select a project stage/i)).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('submits to the backend, shows success, and pushes form_submit with the formName', async () => {
    const user = userEvent.setup();
    render(<LeadForm formName="lp_practical_ai" />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    const [url, init] = vi.mocked(global.fetch).mock.calls[0];
    expect(url).toBe('/functions/sendContactFormEmail');
    const payload = JSON.parse((init as RequestInit).body as string);
    expect(payload.formName).toBe('lp_practical_ai');
    expect(payload.projectStage).toBe(PROJECT_STAGE_OPTIONS[1]);
    // Composed message carries the brief and every dropdown selection.
    expect(payload.message).toContain('internal analytics dashboard');
    expect(payload.message).toContain(PROJECT_STAGE_OPTIONS[1]);
    expect(payload.message).toContain(TIMELINE_OPTIONS[1]);
    expect(payload.message).toContain(BUDGET_OPTIONS[2]);

    expect(
      await screen.findByText(/your message has been sent/i),
    ).toBeInTheDocument();

    const event = dataLayer().find((e) => e.event === 'form_submit');
    expect(event).toMatchObject({
      event: 'form_submit',
      formName: 'lp_practical_ai',
    });
  });

  it('shows the backend error message on a non-2xx response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: async () => ({ message: 'Backend rejected the request' }),
      } as Response),
    ) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<LeadForm formName="lp_test" />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/backend rejected the request/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/your message has been sent/i)).toBeNull();
  });

  it('shows a fallback error when the request throws', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('network down')),
    ) as unknown as typeof fetch;

    const user = userEvent.setup();
    render(<LeadForm formName="lp_test" />);

    await fillValidForm(user);
    await user.click(screen.getByRole('button', { name: /send message/i }));

    expect(
      await screen.findByText(/an error occurred while sending your message/i),
    ).toBeInTheDocument();
  });

  it('links to case studies and portfolio in a new tab', () => {
    render(<LeadForm formName="lp_test" />);
    const caseStudies = screen.getByRole('link', { name: /case studies/i });
    const portfolio = screen.getByRole('link', { name: /portfolio/i });
    expect(caseStudies).toHaveAttribute('href', '/case-studies');
    expect(caseStudies).toHaveAttribute('target', '_blank');
    expect(portfolio).toHaveAttribute('href', '/portfolio');
    expect(portfolio).toHaveAttribute('target', '_blank');
  });
});
