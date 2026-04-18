import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

import TumblingRock from '@/components/canvas/objects/TumblingRock'

describe('TumblingRock', () => {
  it('renders without throwing', () => {
    expect(() => render(<TumblingRock />)).not.toThrow()
  })

  it('accepts no props (clock-driven, no scroll dependency)', () => {
    // TumblingRock has no props — it orbits purely on clock.getElapsedTime().
    const { container } = render(<TumblingRock />)
    expect(container.firstChild).toBeTruthy()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<TumblingRock />)
    expect(() => unmount()).not.toThrow()
  })
})
