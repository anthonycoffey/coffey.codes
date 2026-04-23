import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'

// Capture the useFrame callback so we can invoke it manually with test scroll values.
let capturedFrameCb: (() => void) | null = null

const mockCamera = {
  position: new THREE.Vector3(0, 0, 4),
  lookAt: vi.fn(),
}

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: () => void) => { capturedFrameCb = cb },
  useThree: () => ({ camera: mockCamera }),
}))

import CameraRig from '@/components/canvas/CameraRig'

describe('CameraRig', () => {
  beforeEach(() => {
    capturedFrameCb = null
    mockCamera.lookAt.mockClear()
    mockCamera.position.set(0, 0, 4)
  })

  afterEach(() => {
    cleanup()
  })

  it('renders null without throwing', () => {
    expect(() => render(<CameraRig scrollProgress={{ current: 0 }} />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<CameraRig scrollProgress={{ current: 0 }} />)
    expect(() => unmount()).not.toThrow()
  })

  it('at progress=0 calls lookAt toward origin [0,0,0]', () => {
    render(<CameraRig scrollProgress={{ current: 0 }} />)
    ;(capturedFrameCb as (() => void) | null)?.()
    expect(mockCamera.lookAt).toHaveBeenCalledOnce()
    const look = mockCamera.lookAt.mock.calls[0][0] as THREE.Vector3
    expect(look.x).toBeCloseTo(0, 1)
    expect(look.y).toBeCloseTo(0, 1)
    expect(look.z).toBeCloseTo(0, 1)
  })

  it('at progress=1 calls lookAt toward final keyframe z=-80', () => {
    render(<CameraRig scrollProgress={{ current: 1 }} />)
    ;(capturedFrameCb as (() => void) | null)?.()
    expect(mockCamera.lookAt).toHaveBeenCalledOnce()
    const look = mockCamera.lookAt.mock.calls[0][0] as THREE.Vector3
    expect(look.z).toBeCloseTo(-80, 0)
  })

  it('at progress=0.5 lookAt z is between 0 and -80', () => {
    render(<CameraRig scrollProgress={{ current: 0.5 }} />)
    ;(capturedFrameCb as (() => void) | null)?.()
    const look = mockCamera.lookAt.mock.calls[0][0] as THREE.Vector3
    expect(look.z).toBeLessThan(0)
    expect(look.z).toBeGreaterThan(-80)
  })

  it('never produces NaN in lookAt target across the scroll range', () => {
    for (const p of [0, 0.15, 0.4, 0.52, 0.68, 0.82, 1.0]) {
      cleanup()
      capturedFrameCb = null
      mockCamera.lookAt.mockClear()
      render(<CameraRig scrollProgress={{ current: p }} />)
      ;(capturedFrameCb as (() => void) | null)?.()
      const look = mockCamera.lookAt.mock.calls[0][0] as THREE.Vector3
      expect(isNaN(look.x)).toBe(false)
      expect(isNaN(look.y)).toBe(false)
      expect(isNaN(look.z)).toBe(false)
    }
  })
})
