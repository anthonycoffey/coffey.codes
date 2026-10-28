/**
 * The craft's flight across the homepage scroll.
 *
 * Every staged entrance in the scene is a pure function of scroll position —
 * the UFO's approach and flyby, the galaxy closing in, the planet rising, the
 * merkaba dispersing. The clock is reserved for idle motion that never
 * finishes: bobbing, spinning, orbiting.
 *
 * The craft used to have those two swapped (BUG-003). Its arrival ran on
 * `clock.getElapsedTime()`, so crossing the trigger started a 4.5s animation
 * that ran to completion and parked the craft off screen — leaving an empty
 * sky behind the panel that introduces it for every second past the third, and
 * replaying from the beginning if you scrolled back and returned. These
 * functions put the arrival back on the scroll, where the rest of the scene
 * keeps theirs.
 */

/**
 * The scroll band the flight occupies — deliberately narrow.
 *
 * A wider band spreads the pass over more scrolling, and a fly-by spread thin
 * stops being a fly-by: the craft drifts instead of tearing past. Keeping the
 * band short is what preserves the speed. The cost is that the craft is in
 * frame for a slice of the section rather than all of it, which is the right
 * trade — the UFO's flyby earlier in the scroll works the same way.
 *
 * Centred near 0.62, where the flight used to be triggered, so the craft shows
 * up where it always did.
 */
export const CRAFT_FLY_START = 0.6;
export const CRAFT_FLY_END = 0.72;

/**
 * Where the flight begins and ends, in world space.
 *
 * These are the original path's endpoints, unchanged. The craft charges in
 * from far off to the right and passes the camera — that drive toward the
 * viewer is the whole point of the move, and flattening it into a sideways
 * drift to keep the craft in frame longer trades away the thing worth having.
 *
 * Choreography, not mechanism: tune these and the band by eye. Nothing in the
 * tests pins them.
 */
const FLY_FROM = [150, 1, -180] as const;
const FLY_TO = [-120, 6, 0] as const;

function clamp01(t: number): number {
  return Math.max(0, Math.min(1, t));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Flight progress for a scroll position: 0 before the band, 1 after it, eased
 * in between. Pure — the same scroll always gives the same answer, with no
 * dependence on elapsed time or on how the visitor got here.
 */
export function craftFlightProgress(scroll: number): number {
  // Linear, deliberately. The original flight was linear in time
  // (`elapsed / 4.5`), so a linear map from scroll reproduces its motion
  // exactly for anyone scrolling at a steady rate. Easing here would ease a
  // move that never had any.
  return clamp01(
    (scroll - CRAFT_FLY_START) / (CRAFT_FLY_END - CRAFT_FLY_START),
  );
}

/** The craft's world position for a scroll position. */
export function craftPosition(scroll: number): [number, number, number] {
  const f = craftFlightProgress(scroll);
  return [
    lerp(FLY_FROM[0], FLY_TO[0], f),
    lerp(FLY_FROM[1], FLY_TO[1], f),
    lerp(FLY_FROM[2], FLY_TO[2], f),
  ];
}
