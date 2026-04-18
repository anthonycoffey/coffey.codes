import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

// Spaceship's useEffect zero-scales InstancedMesh instances on mount.
// In jsdom the ref resolves to an HTMLElement with no Three.js methods, so we
// suppress useEffect to prevent "setMatrixAt is not a function" in the smoke test.
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>()
  return { ...actual, useEffect: vi.fn() }
})

import Spaceship from '@/components/canvas/objects/Spaceship'

describe('Spaceship', () => {
  it('renders without throwing when scroll is below trigger (< 0.62)', () => {
    expect(() => render(<Spaceship scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('renders without throwing at the trigger threshold (0.62)', () => {
    expect(() => render(<Spaceship scrollProgress={{ current: 0.62 }} />)).not.toThrow()
  })

  it('renders without throwing after trigger (> 0.62)', () => {
    expect(() => render(<Spaceship scrollProgress={{ current: 0.8 }} />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<Spaceship scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })
})
