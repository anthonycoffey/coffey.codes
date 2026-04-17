import { describe, it, expect } from 'vitest'
import { sampleMerkaba } from '@/utils/merkaba'

describe('sampleMerkaba', () => {
  it('returns a Float32Array of length count * 3', () => {
    const result = sampleMerkaba(1.5, 1800)
    expect(result).toBeInstanceOf(Float32Array)
    expect(result.length).toBe(1800 * 3)
  })

  it('all positions are within a reasonable bounding sphere', () => {
    const radius = 1.5
    const result = sampleMerkaba(radius, 1800)
    for (let i = 0; i < 1800; i++) {
      const x = result[i * 3]
      const y = result[i * 3 + 1]
      const z = result[i * 3 + 2]
      const dist = Math.sqrt(x * x + y * y + z * z)
      // All points should be on or inside the tetrahedra edges (≤ radius)
      expect(dist).toBeLessThanOrEqual(radius + 0.001)
    }
  })

  it('produces positions spread across both tetrahedra (y values span positive and negative)', () => {
    const result = sampleMerkaba(1.5, 1800)
    let hasPositiveY = false
    let hasNegativeY = false
    for (let i = 0; i < 1800; i++) {
      const y = result[i * 3 + 1]
      if (y > 0.1) hasPositiveY = true
      if (y < -0.1) hasNegativeY = true
    }
    expect(hasPositiveY).toBe(true)
    expect(hasNegativeY).toBe(true)
  })

  it('works with different radii and counts', () => {
    const small = sampleMerkaba(0.5, 120)
    expect(small.length).toBe(360)
    const large = sampleMerkaba(3.0, 3600)
    expect(large.length).toBe(10800)
  })
})
