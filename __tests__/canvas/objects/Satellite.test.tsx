import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

import Satellite from '@/components/canvas/objects/Satellite'

describe('Satellite', () => {
  it('renders without throwing', () => {
    expect(() => render(<Satellite scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('accepts any scroll progress value without throwing', () => {
    for (const p of [0, 0.25, 0.5, 0.75, 1.0]) {
      expect(() => render(<Satellite scrollProgress={{ current: p }} />)).not.toThrow()
    }
  })

  it('the scrollProgress prop is accepted (unused per ADR-003) without throwing', () => {
    // ADR-003: scroll prop is threaded for API consistency but unused in the
    // render loop — the satellite runs on clock time only.
    const ref = { current: 0.5 }
    expect(() => render(<Satellite scrollProgress={ref} />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<Satellite scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })
})
