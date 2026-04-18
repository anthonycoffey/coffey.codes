import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/app/articles/utils', () => ({
  getAllCategories: vi.fn(),
}))

vi.mock('next/link', () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}))

import { getAllCategories } from '@/app/articles/utils'
import CategoriesPage from '@/app/articles/categories/page'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('CategoriesPage', () => {
  it('renders a link for each category', () => {
    vi.mocked(getAllCategories).mockReturnValue(['backend', 'web-development'])
    render(<CategoriesPage />)
    expect(screen.getByText('backend')).toBeInTheDocument()
    expect(screen.getByText('web-development')).toBeInTheDocument()
  })

  it('renders category links with correct hrefs', () => {
    vi.mocked(getAllCategories).mockReturnValue(['backend'])
    render(<CategoriesPage />)
    const link = screen.getByRole('link', { name: /backend/i })
    expect(link).toHaveAttribute('href', '/articles/category/backend')
  })

  it('renders the "No categories available" message when list is empty', () => {
    vi.mocked(getAllCategories).mockReturnValue([])
    render(<CategoriesPage />)
    expect(screen.getByText(/no categories available/i)).toBeInTheDocument()
  })

  it('renders the page heading', () => {
    vi.mocked(getAllCategories).mockReturnValue([])
    render(<CategoriesPage />)
    expect(screen.getByText('All Categories')).toBeInTheDocument()
  })
})
