import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import AboutOverlay from '@/components/overlay/AboutOverlay'

describe('AboutOverlay', () => {
  it('renders the lead line', () => {
    render(<AboutOverlay visible={true} />)
    expect(screen.getByText(/Musician/)).toBeInTheDocument()
  })

  it('renders the body line', () => {
    render(<AboutOverlay visible={true} />)
    expect(screen.getByText(/Creativity is at the core/)).toBeInTheDocument()
  })

  it('applies visible class when visible', () => {
    const { container } = render(<AboutOverlay visible={true} />)
    expect(container.firstElementChild?.className).toMatch(/visible/)
  })

  it('does not apply visible class when hidden', () => {
    const { container } = render(<AboutOverlay visible={false} />)
    expect(container.firstElementChild?.className).not.toMatch(/visible/)
  })
})
