import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ShineOverlay from '@/components/overlay/ShineOverlay'

describe('ShineOverlay', () => {
  it('renders the headline text', () => {
    render(<ShineOverlay visible={true} />)
    expect(screen.getByText(/Want to know more/)).toBeInTheDocument()
  })

  it('renders the contact link', () => {
    render(<ShineOverlay visible={true} />)
    expect(screen.getByRole('link', { name: /contact me/i })).toBeInTheDocument()
  })

  it('applies visible CSS class when visible=true', () => {
    const { container } = render(<ShineOverlay visible={true} />)
    expect(container.firstElementChild?.className).toMatch(/visible/)
  })

  it('does not apply visible CSS class when visible=false', () => {
    const { container } = render(<ShineOverlay visible={false} />)
    expect(container.firstElementChild?.className).not.toMatch(/visible/)
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<ShineOverlay visible={true} />)
    expect(() => unmount()).not.toThrow()
  })
})
