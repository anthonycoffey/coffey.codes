import { render, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as THREE from 'three'

type FrameCallback = () => void

interface MutableFrameRef {
  current: FrameCallback | null
}

// Safely hold the callback in a mutable reference to prevent TS control flow from incorrectly narrowing it to `null`.
const capturedFrame: MutableFrameRef = { current: null }

const mockCamera = {
  position: new THREE.Vector3(0, 0, 4),
  lookAt: vi.fn<(target: THREE.Vector3) => void>(),
}

vi.mock('@react-three/fiber', () => ({
  useFrame: (cb: FrameCallback) => { capturedFrame.current = cb },
  useThree: () => ({ camera: mockCamera }),
}))

import CameraRig from '@/components/canvas/CameraRig'

describe('CameraRig', () => {
  beforeEach(() => {
    capturedFrame.current = null
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
    capturedFrame.current?.()
    expect(mockCamera.lookAt).toHaveBeenCalledOnce()
    const look = mockCamera.lookAt.mock.calls[0][0]
    expect(look.x).toBeCloseTo(0, 1)
    expect(look.y).toBeCloseTo(0, 1)
    expect(look.z).toBeCloseTo(0, 1)
  })

  it('at progress=1 calls lookAt toward final keyframe z=-80', () => {
    render(<CameraRig scrollProgress={{ current: 1 }} />)
    capturedFrame.current?.()
    expect(mockCamera.lookAt).toHaveBeenCalledOnce()
    const look = mockCamera.lookAt.mock.calls[0][0]
    expect(look.z).toBeCloseTo(-80, 0)
  })

  it('at progress=0.5 lookAt z is between 0 and -80', () => {
    render(<CameraRig scrollProgress={{ current: 0.5 }} />)
    capturedFrame.current?.()
    const look = mockCamera.lookAt.mock.calls[0][0]
    expect(look.z).toBeLessThan(0)
    expect(look.z).toBeGreaterThan(-80)
  })

  it('never produces NaN in lookAt target across the scroll range', () => {
    for (const p of [0, 0.15, 0.4, 0.52, 0.68, 0.82, 1.0]) {
      cleanup()
      capturedFrame.current = null
      mockCamera.lookAt.mockClear()
      render(<CameraRig scrollProgress={{ current: p }} />)
      capturedFrame.current?.()
      const look = mockCamera.lookAt.mock.calls[0][0]
      expect(isNaN(look.x)).toBe(false)
      expect(isNaN(look.y)).toBe(false)
      expect(isNaN(look.z)).toBe(false)
    }
  })
})
