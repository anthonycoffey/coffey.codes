import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import IntroOverlay from '@/components/overlay/IntroOverlay'

describe('IntroOverlay', () => {
  it('renders the headline', () => {
    render(<IntroOverlay visible={true} />)
    expect(screen.getByText(/Art is the point/)).toBeInTheDocument()
  })

  it('renders the byline', () => {
    render(<IntroOverlay visible={true} />)
    expect(screen.getByText(/Anthony Coffey/)).toBeInTheDocument()
  })

  it('applies visible class when visible', () => {
    const { container } = render(<IntroOverlay visible={true} />)
    const panel = container.firstElementChild
    expect(panel?.className).toMatch(/visible/)
  })

  it('does not apply visible class when hidden', () => {
    const { container } = render(<IntroOverlay visible={false} />)
    const panel = container.firstElementChild
    expect(panel?.className).not.toMatch(/visible/)
  })
})
