/**
 * The craft's flight has to be a pure function of scroll (BUG-003).
 *
 * It used to run on `clock.getElapsedTime()`: crossing 0.62 started a 4.5s
 * animation that ran to completion and parked the craft off screen, so the
 * section built around the craft showed an empty sky for every second past the
 * third. Scrolling back below the trigger re-armed it and replayed the same
 * 4.5s. Every other staged entrance in the scene — UFO, Galaxy, Planet, the
 * merkaba dispersal — is a function of scroll; these tests pin the craft to the
 * same contract.
 */
import { describe, it, expect } from 'vitest';
import {
  CRAFT_FLY_START,
  CRAFT_FLY_END,
  craftFlightProgress,
  craftPosition,
} from '@/utils/craftFlight';

const MID = (CRAFT_FLY_START + CRAFT_FLY_END) / 2;

describe('craftFlightProgress', () => {
  it('has not started before the band', () => {
    expect(craftFlightProgress(0)).toBe(0);
    expect(craftFlightProgress(CRAFT_FLY_START - 0.1)).toBe(0);
    expect(craftFlightProgress(CRAFT_FLY_START)).toBe(0);
  });

  it('is complete after the band', () => {
    expect(craftFlightProgress(CRAFT_FLY_END)).toBe(1);
    expect(craftFlightProgress(CRAFT_FLY_END + 0.1)).toBe(1);
    expect(craftFlightProgress(1)).toBe(1);
  });

  it('advances monotonically across the band', () => {
    let previous = -Infinity;
    for (let i = 0; i <= 20; i++) {
      const scroll =
        CRAFT_FLY_START + ((CRAFT_FLY_END - CRAFT_FLY_START) * i) / 20;
      const f = craftFlightProgress(scroll);
      expect(f).toBeGreaterThanOrEqual(previous);
      previous = f;
    }
    expect(previous).toBe(1);
  });

  it('stays within 0..1 for any scroll value', () => {
    for (const scroll of [-1, 0, 0.3, MID, 0.9, 1, 2]) {
      const f = craftFlightProgress(scroll);
      expect(f).toBeGreaterThanOrEqual(0);
      expect(f).toBeLessThanOrEqual(1);
    }
  });
});

describe('craftPosition', () => {
  // The regression, stated directly: the old implementation's answer depended
  // on how long ago the trigger fired, so the same scroll position gave a
  // different craft position every time you came back to it.

  it('gives the same position for the same scroll, every time', () => {
    const first = craftPosition(MID);
    for (let i = 0; i < 50; i++) {
      expect(craftPosition(MID)).toEqual(first);
    }
  });

  it('returns to the same position after scrubbing away and back', () => {
    const before = craftPosition(MID);
    // Walk the whole track, forwards and back, as a scrubbing visitor would.
    for (const scroll of [0, 0.3, 0.62, 0.9, 1, 0.5, 0.2, 0]) {
      craftPosition(scroll);
    }
    expect(craftPosition(MID)).toEqual(before);
  });

  it('is continuous at the start of the band', () => {
    const before = craftPosition(CRAFT_FLY_START - 0.0001);
    const at = craftPosition(CRAFT_FLY_START);
    at.forEach((v, i) => expect(v).toBeCloseTo(before[i], 2));
  });

  it('is continuous at the end of the band', () => {
    const at = craftPosition(CRAFT_FLY_END);
    const after = craftPosition(CRAFT_FLY_END + 0.0001);
    after.forEach((v, i) => expect(v).toBeCloseTo(at[i], 2));
  });

  it('holds still outside the band', () => {
    expect(craftPosition(0)).toEqual(craftPosition(CRAFT_FLY_START));
    expect(craftPosition(1)).toEqual(craftPosition(CRAFT_FLY_END));
  });

  it('flies toward the camera and across the frame', () => {
    const [x0, , z0] = craftPosition(CRAFT_FLY_START);
    const [x1, , z1] = craftPosition(CRAFT_FLY_END);
    // Approaches: z climbs from far behind the scene toward the camera.
    expect(z1).toBeGreaterThan(z0);
    // Crosses: starts off to the right, ends off to the left.
    expect(x0).toBeGreaterThan(0);
    expect(x1).toBeLessThan(0);
  });

  it('crosses the frame rather than stopping inside it', () => {
    const [xStart] = craftPosition(CRAFT_FLY_START);
    const [xEnd] = craftPosition(CRAFT_FLY_END);
    // Deliberately no distance thresholds. Whether a given x is clear of the
    // frustum depends on the craft's z and on where the camera is at that
    // scroll position, which this module does not know and a unit test cannot
    // check — the e2e test covers it by asserting the craft is not drawn
    // before its section. Pinning magic numbers here would only break every
    // time the choreography is tuned, which it is expected to be.
    expect(xStart).toBeGreaterThan(0);
    expect(xEnd).toBeLessThan(0);
    expect(Math.abs(xStart - xEnd)).toBeGreaterThan(100);
  });

  it('covers the craft section rather than ending before it', () => {
    // The craft HUD panel runs 0.52 to 0.68. The flight must still be going
    // when the panel is up, or the section shows an empty sky again.
    expect(craftFlightProgress(0.68)).toBeLessThan(1);
    expect(craftFlightProgress(0.68)).toBeGreaterThan(0);
  });
});
