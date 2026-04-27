import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('next/link', () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string
    children: React.ReactNode
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}))

vi.mock('@heroicons/react/20/solid', () => ({
  ClipboardDocumentCheckIcon: () => null,
  ArrowDownTrayIcon: () => null,
  CpuChipIcon: () => null,
}))

import CaseStudiesPage from '@/app/case-studies/page'

describe('CaseStudiesPage', () => {
  it('renders the page heading', async () => {
    const jsx = await CaseStudiesPage()
    render(jsx as React.ReactElement)
    expect(
      screen.getByRole('heading', { level: 1, name: /case studies/i }),
    ).toBeInTheDocument()
  })

  it('renders the case study cards with their titles and tags', async () => {
    const jsx = await CaseStudiesPage()
    render(jsx as React.ReactElement)
    // Title pulled directly from the page's hard-coded data.
    expect(
      screen.getByText(/PostGIS in Action: Streamlining Fleet Operations/i),
    ).toBeInTheDocument()
    // A representative tag from the same case study
    expect(screen.getByText('PostGIS')).toBeInTheDocument()
  })

  it('renders a download link for each case study PDF', async () => {
    const jsx = await CaseStudiesPage()
    render(jsx as React.ReactElement)
    const download = screen.getByRole('link', { name: /download/i })
    expect(download).toHaveAttribute(
      'href',
      expect.stringMatching(/\.pdf$/),
    )
  })

  it('renders a "Get in touch" CTA pointing to /contact', async () => {
    const jsx = await CaseStudiesPage()
    render(jsx as React.ReactElement)
    const cta = screen.getByRole('link', { name: /get in touch/i })
    expect(cta).toHaveAttribute('href', '/contact')
  })
})
