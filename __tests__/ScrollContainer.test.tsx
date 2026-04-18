import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

// GSAP touches the DOM — mock it entirely in jsdom
const mockTrigger = { kill: vi.fn() }
vi.mock('gsap', () => ({
  gsap: { registerPlugin: vi.fn() },
  default: { registerPlugin: vi.fn() },
}))
vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: {
    create: vi.fn(() => mockTrigger),
    kill: vi.fn(),
    getAll: vi.fn(() => []),
  },
}))

import ScrollContainer from '@/components/ScrollContainer'

describe('ScrollContainer', () => {
  it('renders the scroll container', () => {
    render(<ScrollContainer />)
    expect(document.getElementById('scroll-container')).toBeInTheDocument()
  })

  it('renders the HUD overlay layer', () => {
    const { container } = render(<ScrollContainer />)
    // The overlay div should be present (from HUDOverlay)
    const overlayDivs = container.querySelectorAll('[class*="overlay"]')
    expect(overlayDivs.length).toBeGreaterThan(0)
  })

  it('does not render a scroll track', () => {
    render(<ScrollContainer />)
    expect(document.getElementById('scroll-track')).toBeNull()
  })
})
