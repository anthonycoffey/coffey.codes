import { render } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { useRef } from 'react'

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: vi.fn(),
  useThree: vi.fn(() => ({ size: { width: 800, height: 600 } })),
}))
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Bloom: () => null,
  Vignette: () => null,
}))
// Spaceship's useEffect calls setMatrixAt on an InstancedMesh ref that jsdom
// cannot satisfy — stub the whole component for the WorldCanvas smoke test.
vi.mock('@/components/canvas/objects/Spaceship', () => ({ default: () => null }))

import WorldCanvas from '@/components/canvas/WorldCanvas'

function Wrapper() {
  const ref = useRef(0)
  return <WorldCanvas scrollProgress={ref} />
}

describe('WorldCanvas', () => {
  it('renders a full-viewport container', () => {
    const { container } = render(<Wrapper />)
    expect(container.firstChild).toBeInTheDocument()
  })

  it('renders the R3F canvas', () => {
    const { getByTestId } = render(<Wrapper />)
    expect(getByTestId('r3f-canvas')).toBeInTheDocument()
  })

  it('accepts a scrollProgress ref without throwing', () => {
    expect(() => render(<Wrapper />)).not.toThrow()
  })

  it('unmounts cleanly', () => {
    const { unmount } = render(<Wrapper />)
    expect(() => unmount()).not.toThrow()
  })
})
