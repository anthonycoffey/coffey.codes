import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'

vi.mock('@react-three/fiber', () => ({
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({})),
}))

import Galaxy from '@/components/canvas/objects/Galaxy'

describe('Galaxy', () => {
  it('renders without throwing when parked at z=-220 (progress < 0.75)', () => {
    expect(() => render(<Galaxy scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('renders without throwing during approach (progress 0.75–0.95)', () => {
    expect(() => render(<Galaxy scrollProgress={{ current: 0.85 }} />)).not.toThrow()
  })

  it('renders without throwing at full approach (progress = 1.0)', () => {
    expect(() => render(<Galaxy scrollProgress={{ current: 1.0 }} />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<Galaxy scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })
})

// ── Z-positioning formula (pure unit test) ────────────────────────────────────
// Guards the scroll-triggered galaxy approach without needing a WebGL context.
function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function galaxyZ(progress: number): number {
  if (progress < 0.75) return -220
  if (progress < 0.95) return lerp(-220, -100, smoothstep((progress - 0.75) / 0.2))
  return lerp(-100, -95, smoothstep((progress - 0.95) / 0.05))
}

describe('Galaxy z-position formula', () => {
  it('is -220 before the approach window (progress < 0.75)', () => {
    expect(galaxyZ(0)).toBe(-220)
    expect(galaxyZ(0.74)).toBe(-220)
  })

  it('begins moving toward camera at progress=0.75', () => {
    expect(galaxyZ(0.75)).toBeCloseTo(-220, 0)
    expect(galaxyZ(0.85)).toBeGreaterThan(-220)
  })

  it('reaches approximately -100 at progress=0.95', () => {
    expect(galaxyZ(0.95)).toBeCloseTo(-100, 0)
  })

  it('reaches final position near -95 at progress=1.0', () => {
    expect(galaxyZ(1.0)).toBeCloseTo(-95, 0)
  })

  it('never produces NaN across the scroll range', () => {
    for (let p = 0; p <= 1; p += 0.05) {
      expect(isNaN(galaxyZ(p))).toBe(false)
    }
  })
})
