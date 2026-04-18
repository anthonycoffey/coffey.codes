import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import BlogLayout from '@/app/articles/layout'

describe('BlogLayout', () => {
  it('renders children inside the layout wrapper', () => {
    const { getByText } = render(<BlogLayout>Hello</BlogLayout>)
    expect(getByText('Hello')).toBeInTheDocument()
  })

  it('renders a wrapper div with expected classes', () => {
    const { container } = render(<BlogLayout>content</BlogLayout>)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toContain('max-w-4xl')
  })

  it('matches snapshot', () => {
    const { container } = render(<BlogLayout>snap</BlogLayout>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
