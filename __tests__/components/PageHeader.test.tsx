import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import PageHeader from '@/components/PageHeader'

const StubIcon = ({ className }: { className?: string }) => (
  <svg data-testid="stub-icon" className={className} />
)

describe('PageHeader', () => {
  it('renders the title as an h1', () => {
    render(<PageHeader title="My Page" />)
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading).toHaveTextContent('My Page')
  })

  it('renders the description when provided', () => {
    render(<PageHeader title="My Page" description="Some description" />)
    expect(screen.getByText('Some description')).toBeInTheDocument()
  })

  it('omits the description paragraph when none is provided', () => {
    const { container } = render(<PageHeader title="My Page" />)
    // The description renders as the only <p> inside the <header> when present;
    // its absence means there should be no <p> inside the header.
    expect(container.querySelector('header p')).toBeNull()
  })

  it('renders the icon when provided', () => {
    render(<PageHeader title="My Page" icon={StubIcon} />)
    expect(screen.getByTestId('stub-icon')).toBeInTheDocument()
  })

  it('omits the icon when none is provided', () => {
    render(<PageHeader title="My Page" />)
    expect(screen.queryByTestId('stub-icon')).not.toBeInTheDocument()
  })

  it('renders children inside the header (extra slot)', () => {
    render(
      <PageHeader title="My Page">
        <a href="/somewhere">extra link</a>
      </PageHeader>,
    )
    const link = screen.getByRole('link', { name: /extra link/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/somewhere')
  })

  it('accepts ReactNode for the title (not just strings)', () => {
    render(
      <PageHeader
        title={
          <>
            Articles in category &quot;Backend&quot;
          </>
        }
      />,
    )
    const heading = screen.getByRole('heading', { level: 1 })
    expect(heading.textContent).toContain('Articles in category')
    expect(heading.textContent).toContain('Backend')
  })

  it('accepts ReactNode for the description', () => {
    render(
      <PageHeader
        title="My Page"
        description={
          <>
            Click <a href="/here">here</a> for details.
          </>
        }
      />,
    )
    expect(screen.getByRole('link', { name: /here/i })).toHaveAttribute(
      'href',
      '/here',
    )
  })

  it('renders the structural border + padding classes', () => {
    const { container } = render(<PageHeader title="My Page" />)
    const header = container.querySelector('header') as HTMLElement
    expect(header).not.toBeNull()
    // Tailwind classes that establish the canonical title-block chrome.
    // If these change, the visual contract has broken — update this test
    // intentionally alongside the component change.
    expect(header.className).toContain('pt-6')
    expect(header.className).toContain('sm:pt-8')
    expect(header.className).toContain('border-b')
    expect(header.className).toContain('border-border')
    expect(header.className).toContain('mb-6')
  })

  it('matches snapshot with all features', () => {
    const { container } = render(
      <PageHeader
        title="Articles"
        description="A description."
        icon={StubIcon}
      >
        <a href="https://example.com/extra">extra</a>
      </PageHeader>,
    )
    expect(container.firstChild).toMatchSnapshot()
  })
})
