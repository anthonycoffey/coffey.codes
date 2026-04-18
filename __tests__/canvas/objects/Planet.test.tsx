import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

import Planet from '@/components/canvas/objects/Planet'

describe('Planet', () => {
  it('renders without throwing at progress=0', () => {
    expect(() => render(<Planet scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('renders without throwing across the full scroll range', () => {
    for (const p of [0.35, 0.45, 0.55, 1.0]) {
      expect(() => render(<Planet scrollProgress={{ current: p }} />)).not.toThrow()
    }
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<Planet scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })
})
