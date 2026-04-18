import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

import UFO from '@/components/canvas/objects/UFO'

describe('UFO', () => {
  it('renders without throwing before entry (progress < 0.15)', () => {
    expect(() => render(<UFO scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('renders without throwing during phase 1 hover (0.15–0.38)', () => {
    expect(() => render(<UFO scrollProgress={{ current: 0.25 }} />)).not.toThrow()
  })

  it('renders without throwing during phase 2 flyby (0.38–0.52)', () => {
    expect(() => render(<UFO scrollProgress={{ current: 0.45 }} />)).not.toThrow()
  })

  it('renders without throwing when parked after flyby (> 0.52)', () => {
    expect(() => render(<UFO scrollProgress={{ current: 0.8 }} />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<UFO scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })
})
