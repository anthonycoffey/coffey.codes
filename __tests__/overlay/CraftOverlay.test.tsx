import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import CraftOverlay from '@/components/overlay/CraftOverlay'

describe('CraftOverlay', () => {
  it('renders the lead line', () => {
    render(<CraftOverlay visible={true} />)
    expect(screen.getByText(/I solve big problems/)).toBeInTheDocument()
  })

  it('renders the body line', () => {
    render(<CraftOverlay visible={true} />)
    expect(
      screen.getByText(/The trends and tools change, but my role does not/),
    ).toBeInTheDocument()
  })

  it('applies visible class when visible', () => {
    const { container } = render(<CraftOverlay visible={true} />)
    expect(container.firstElementChild?.className).toMatch(/visible/)
  })

  it('does not apply visible class when hidden', () => {
    const { container } = render(<CraftOverlay visible={false} />)
    expect(container.firstElementChild?.className).not.toMatch(/visible/)
  })
})
