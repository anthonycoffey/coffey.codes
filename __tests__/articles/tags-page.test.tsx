import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/articles/utils', () => ({
  getAllTags: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { getAllTags } from '@/app/articles/utils'
import TagsPage from '@/app/articles/tags/page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('TagsPage', () => {
  it('renders a link for each tag', () => {
    vi.mocked(getAllTags).mockReturnValue(['react', 'typescript', 'node'])
    render(<TagsPage />)
    expect(screen.getByText('react')).toBeInTheDocument()
    expect(screen.getByText('typescript')).toBeInTheDocument()
    expect(screen.getByText('node')).toBeInTheDocument()
  })

  it('renders tag links with correct hrefs', () => {
    vi.mocked(getAllTags).mockReturnValue(['react'])
    render(<TagsPage />)
    const link = screen.getByRole('link', { name: /react/i })
    expect(link).toHaveAttribute('href', '/articles/tag/react')
  })

  it('renders the "No tags available" message when tags list is empty', () => {
    vi.mocked(getAllTags).mockReturnValue([])
    render(<TagsPage />)
    expect(screen.getByText(/no tags available/i)).toBeInTheDocument()
  })

  it('renders the page heading', () => {
    vi.mocked(getAllTags).mockReturnValue([])
    render(<TagsPage />)
    expect(screen.getByText('All Tags')).toBeInTheDocument()
  })
})
