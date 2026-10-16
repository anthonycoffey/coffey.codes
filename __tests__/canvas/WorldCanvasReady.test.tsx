import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Collect the frame callbacks so the test can drive the render loop by hand.
const frameCallbacks: Array<(state: unknown, delta: number) => void> = [];

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: (cb: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(cb);
  },
  useThree: vi.fn(() => ({ size: { width: 800, height: 600 } })),
}));
vi.mock('@react-three/drei', () => ({
  Html: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@react-three/postprocessing', () => ({
  EffectComposer: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Bloom: () => null,
  Vignette: () => null,
}));

import { FirstFrameSignal } from '@/components/canvas/WorldCanvas';

/** Run one iteration of the mocked render loop. */
function frame() {
  frameCallbacks.forEach((cb) => cb({}, 0.016));
}

describe('FirstFrameSignal', () => {
  beforeEach(() => {
    frameCallbacks.length = 0;
  });

  // Why this exists (BUG-001): `onReady` used to be wired to r3f's `onCreated`,
  // which fires when the WebGL context is created — before geometry upload,
  // shader compile, and the first painted frame. The loader then announced
  // "SCENE LOADED." over an empty scene.

  it('does not report ready before a frame has rendered', () => {
    const onReady = vi.fn();
    render(<FirstFrameSignal onReady={onReady} />);

    // Mounted, callback registered, but the loop has not run.
    expect(frameCallbacks).toHaveLength(1);
    expect(onReady).not.toHaveBeenCalled();
  });

  it('does not report ready during the first frame', () => {
    const onReady = vi.fn();
    render(<FirstFrameSignal onReady={onReady} />);

    // r3f runs frame callbacks BEFORE the draw, so at this point frame 1 has
    // not been painted yet.
    frame();
    expect(onReady).not.toHaveBeenCalled();
  });

  it('reports ready once the first frame has been rendered', () => {
    const onReady = vi.fn();
    render(<FirstFrameSignal onReady={onReady} />);

    frame(); // frame 1 renders after this callback
    frame(); // entering frame 2 — frame 1 is on screen
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('reports ready only once no matter how long the loop runs', () => {
    const onReady = vi.fn();
    render(<FirstFrameSignal onReady={onReady} />);

    for (let i = 0; i < 20; i++) frame();
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('does not throw without an onReady handler', () => {
    render(<FirstFrameSignal />);
    expect(() => {
      frame();
      frame();
    }).not.toThrow();
  });
});
