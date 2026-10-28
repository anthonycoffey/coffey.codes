import { render, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRef } from 'react';

// Collect the frame callbacks so the test can drive the render loop by hand.
const frameCallbacks: Array<(state: unknown, delta: number) => void> = [];

// Stand-ins for the three.js objects r3f hands out. Identity is what matters:
// the warm-up must compile THIS scene against THIS camera, or it warms programs
// the renderer will never look up.
const scene = { isScene: true };
const camera = { isCamera: true };

let compileAsync: ReturnType<typeof vi.fn>;
let gl: {
  compileAsync?: ReturnType<typeof vi.fn>;
  getRenderTarget?: ReturnType<typeof vi.fn>;
  setRenderTarget?: ReturnType<typeof vi.fn>;
};
// What the renderer had bound at the moment the compile was requested. The
// program cache key depends on it, so this is the difference between warming
// the programs the scene will use and warming a set nothing looks up.
let targetDuringCompile: unknown;
let boundTarget: unknown;

/** A renderer stub that tracks the bound render target like the real one. */
function makeGl(compile: ReturnType<typeof vi.fn>) {
  boundTarget = null;
  targetDuringCompile = undefined;
  return {
    compileAsync: compile,
    getRenderTarget: vi.fn(() => boundTarget),
    setRenderTarget: vi.fn((target: unknown) => {
      boundTarget = target;
    }),
  };
}

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="r3f-canvas">{children}</div>
  ),
  useFrame: (cb: (state: unknown, delta: number) => void) => {
    frameCallbacks.push(cb);
  },
  useThree: () => ({ gl, scene, camera, size: { width: 800, height: 600 } }),
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

// The scene's objects drive three.js refs that jsdom cannot satisfy, and this
// suite is about the readiness contract rather than the scene. Stub them so the
// only frame callbacks in play are the two under test.
vi.mock('@/components/canvas/CameraRig', () => ({ default: () => null }));
vi.mock('@/components/canvas/objects/UFO', () => ({ default: () => null }));
vi.mock('@/components/canvas/objects/Planet', () => ({ default: () => null }));
vi.mock('@/components/canvas/objects/Satellite', () => ({
  default: () => null,
}));
vi.mock('@/components/canvas/objects/Galaxy', () => ({ default: () => null }));
vi.mock('@/components/canvas/objects/Spaceship', () => ({
  default: () => null,
}));

import WorldCanvas, {
  SceneWarmup,
  WARMUP_CAP_MS,
} from '@/components/canvas/WorldCanvas';

/** Run one iteration of the mocked render loop. */
function frame() {
  frameCallbacks.forEach((cb) =>
    cb({ clock: { getElapsedTime: () => 0 } }, 0.016),
  );
}

describe('SceneWarmup', () => {
  // Why this exists (BUG-002): three.js compiles a material's program on the
  // first frame that DRAWS it. The spaceship is parked outside the frustum
  // until scroll 0.62, so its four programs — two of them ~76KB of generated
  // fragment source — were all compiled on the single frame it flew in, which
  // stalled the render loop for roughly 3x the surrounding frame budget.
  // Warming them while the loading splash is still up moves that cost to a
  // moment where nothing is animating.

  beforeEach(() => {
    frameCallbacks.length = 0;
    compileAsync = vi.fn(() => {
      targetDuringCompile = boundTarget;
      return Promise.resolve();
    });
    gl = makeGl(compileAsync);
  });

  it('does not compile before the render loop has run', () => {
    render(<SceneWarmup />);

    // Mounted and subscribed, but nothing compiled yet.
    expect(frameCallbacks).toHaveLength(1);
    expect(compileAsync).not.toHaveBeenCalled();
  });

  it('warms the scene on the first frame, against the render camera', () => {
    render(<SceneWarmup />);

    frame();

    // Deliberately frame-driven rather than effect-driven: by the first frame
    // every mount effect has run, so the light state the programs are keyed
    // against matches the one the renderer will use.
    expect(compileAsync).toHaveBeenCalledTimes(1);
    expect(compileAsync).toHaveBeenCalledWith(scene, camera);
  });

  it('compiles against a bound render target, then restores it', () => {
    render(<SceneWarmup />);

    frame();

    // The scene is drawn through EffectComposer, i.e. into a buffer. Programs
    // built with no target bound are keyed for the screen instead (tone
    // mapping, output color space) and the renderer never looks them up — the
    // warm-up silently does nothing and the mid-scroll stall comes back.
    expect(targetDuringCompile).not.toBeNull();
    expect(targetDuringCompile).toBeDefined();
    // ...and the frame that follows must render exactly as it would have.
    expect(boundTarget).toBeNull();
  });

  it('compiles once however long the loop runs', () => {
    render(<SceneWarmup />);

    for (let i = 0; i < 20; i++) frame();

    expect(compileAsync).toHaveBeenCalledTimes(1);
  });

  it('reports warm once the compile resolves', async () => {
    const onWarm = vi.fn();
    render(<SceneWarmup onWarm={onWarm} />);

    frame();
    expect(onWarm).not.toHaveBeenCalled();

    await act(async () => {});
    expect(onWarm).toHaveBeenCalledTimes(1);
  });

  it('reports warm even when the compile rejects', async () => {
    compileAsync.mockRejectedValueOnce(new Error('driver said no'));
    const onWarm = vi.fn();
    render(<SceneWarmup onWarm={onWarm} />);

    frame();
    await act(async () => {});

    // A failed warm-up costs smoothness, never entry: the gate unlocks off
    // this signal, and a visitor must not be trapped behind it.
    expect(onWarm).toHaveBeenCalledTimes(1);
  });

  it('reports warm even when the renderer cannot compile ahead of time', () => {
    gl = {}; // an older renderer, with no compileAsync at all
    const onWarm = vi.fn();
    render(<SceneWarmup onWarm={onWarm} />);

    frame();

    expect(onWarm).toHaveBeenCalledTimes(1);
  });

  it('does not throw without an onWarm handler', () => {
    expect(() => {
      render(<SceneWarmup />);
      frame();
      frame();
    }).not.toThrow();
  });

  describe('when the compile never settles', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });
    afterEach(() => {
      vi.useRealTimers();
    });

    it('reports warm on the cap', () => {
      compileAsync.mockReturnValueOnce(new Promise(() => {}));
      const onWarm = vi.fn();
      render(<SceneWarmup onWarm={onWarm} />);

      frame();
      expect(onWarm).not.toHaveBeenCalled();

      act(() => {
        vi.advanceTimersByTime(WARMUP_CAP_MS);
      });
      expect(onWarm).toHaveBeenCalledTimes(1);
    });

    it('does not report warm twice if the compile settles after the cap', async () => {
      let settle: () => void = () => {};
      compileAsync.mockReturnValueOnce(
        new Promise<void>((resolve) => {
          settle = resolve;
        }),
      );
      const onWarm = vi.fn();
      render(<SceneWarmup onWarm={onWarm} />);

      frame();
      act(() => {
        vi.advanceTimersByTime(WARMUP_CAP_MS);
      });
      await act(async () => {
        settle();
      });

      expect(onWarm).toHaveBeenCalledTimes(1);
    });
  });
});

describe('WorldCanvas readiness contract', () => {
  // BUG-001 made `onReady` mean "a frame has been painted". BUG-002 tightens it
  // to "a frame has been painted AND nothing is left to compile mid-scroll" —
  // the loading splash should cover both, since covering real work is the whole
  // point of the loading animation.

  // Past the merkaba's dispersal window, so WorldCanvas's private
  // ParticleSystem takes its early return instead of reaching for a three.js
  // geometry that jsdom's stand-in element does not have.
  function Wrapper({ onReady }: { onReady?: () => void }) {
    const ref = useRef(0.3);
    return <WorldCanvas scrollProgress={ref} onReady={onReady} />;
  }

  beforeEach(() => {
    frameCallbacks.length = 0;
    compileAsync = vi.fn(() => Promise.resolve());
    gl = makeGl(compileAsync);
  });

  it('does not report ready on a painted frame alone', () => {
    let settle: () => void = () => {};
    compileAsync.mockReturnValueOnce(
      new Promise<void>((resolve) => {
        settle = resolve;
      }),
    );
    const onReady = vi.fn();
    render(<Wrapper onReady={onReady} />);

    frame(); // frame 1 renders after this callback
    frame(); // entering frame 2 — frame 1 is on screen

    expect(onReady).not.toHaveBeenCalled();
    settle();
  });

  it('reports ready once the scene is both painted and warm', async () => {
    const onReady = vi.fn();
    render(<Wrapper onReady={onReady} />);

    await act(async () => {
      frame();
      frame();
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('reports ready only once no matter how long the loop runs', async () => {
    const onReady = vi.fn();
    render(<Wrapper onReady={onReady} />);

    await act(async () => {
      for (let i = 0; i < 20; i++) frame();
    });

    expect(onReady).toHaveBeenCalledTimes(1);
  });
});
