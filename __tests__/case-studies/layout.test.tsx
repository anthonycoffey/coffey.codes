import { render } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CaseStudiesLayout from '@/app/case-studies/layout'

describe('CaseStudiesLayout', () => {
  it('renders children inside the layout wrapper', () => {
    const { getByText } = render(<CaseStudiesLayout>Hello</CaseStudiesLayout>)
    expect(getByText('Hello')).toBeInTheDocument()
  })

  it('renders a wrapper div with the standardized chrome classes', () => {
    const { container } = render(<CaseStudiesLayout>content</CaseStudiesLayout>)
    const wrapper = container.firstChild as HTMLElement
    expect(wrapper.tagName).toBe('DIV')
    expect(wrapper.className).toContain('max-w-4xl')
    expect(wrapper.className).toContain('mx-auto')
    expect(wrapper.className).toContain('px-4')
    expect(wrapper.className).toContain('min-h-[900px]')
  })

  it('matches snapshot', () => {
    const { container } = render(<CaseStudiesLayout>snap</CaseStudiesLayout>)
    expect(container.firstChild).toMatchSnapshot()
  })
})
