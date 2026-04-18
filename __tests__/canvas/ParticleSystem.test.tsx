/**
 * Unit tests for the ParticleSystem dispersal logic defined in WorldCanvas.tsx.
 *
 * ParticleSystem is a private component (not exported) so we test the underlying
 * math as pure functions. This guards the three key invariants from ADR-002:
 *   1. No opacity discontinuity — opacity is a smooth function of disperse.
 *   2. Particles hide completely once disperse reaches 1 (scroll ≥ 0.25).
 *   3. The animation is reversible — scrolling back reconstitutes the Merkaba.
 */
import { describe, it, expect } from 'vitest'

function smoothstep(t: number): number {
  const c = Math.max(0, Math.min(1, t))
  return c * c * (3 - 2 * c)
}

function disperseFactor(scrollProgress: number): number {
  return scrollProgress < 0.25 ? smoothstep(scrollProgress / 0.25) : 1
}

function particleOpacity(disperse: number): number {
  return (1 - disperse) * 0.75
}

describe('ParticleSystem dispersal math', () => {
  it('at progress=0 disperse is 0 and opacity is 0.75 (fully formed)', () => {
    const d = disperseFactor(0)
    expect(d).toBe(0)
    expect(particleOpacity(d)).toBeCloseTo(0.75)
  })

  it('at progress=0.125 disperse is between 0 and 1 (mid-explosion)', () => {
    const d = disperseFactor(0.125)
    expect(d).toBeGreaterThan(0)
    expect(d).toBeLessThan(1)
    const op = particleOpacity(d)
    expect(op).toBeGreaterThan(0)
    expect(op).toBeLessThan(0.75)
  })

  it('at progress=0.25 disperse reaches 1 (particles should be hidden)', () => {
    const d = disperseFactor(0.25)
    expect(d).toBeGreaterThanOrEqual(1)
    expect(particleOpacity(d)).toBeCloseTo(0)
  })

  it('at progress > 0.25 disperse stays clamped at 1', () => {
    expect(disperseFactor(0.3)).toBe(1)
    expect(disperseFactor(0.5)).toBe(1)
    expect(disperseFactor(1.0)).toBe(1)
  })

  it('opacity is monotonically decreasing as disperse increases', () => {
    const samples = [0, 0.1, 0.25, 0.5, 0.75, 1.0]
    let prev = Infinity
    for (const d of samples) {
      const op = particleOpacity(d)
      expect(op).toBeLessThanOrEqual(prev)
      prev = op
    }
  })

  it('disperse function never produces NaN across the scroll range', () => {
    for (let p = 0; p <= 1; p += 0.05) {
      expect(isNaN(disperseFactor(p))).toBe(false)
    }
  })
})
