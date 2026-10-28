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
 * The scroll band the flight occupies.
 *
 * The craft's HUD panel runs 0.52 → 0.68 and the camera's "HOLD — craft +
 * satellite" keyframe sits at 0.68, so the band starts just inside the panel
 * and runs past it: the craft is approaching as the panel opens and is still
 * crossing as the camera levels off for the galaxy.
 */
export const CRAFT_FLY_START = 0.54;
export const CRAFT_FLY_END = 0.82;

/**
 * Where the flight begins and ends, in world space.
 *
 * Two constraints shape this, and they pull against each other. The start has
 * to sit outside the camera frustum for the whole stretch before the band — at
 * 70° fov the frustum is very wide this far out, so "off to the right" means a
 * long way off. And the craft has to stay in frame for a decent share of the
 * band, which the old path did not: charging from z = -180 to z = 0 put it
 * past the camera a third of the way in, visible for only about 1.7s of a 4.5s
 * flight. This path approaches less far and crosses more, so the craft is in
 * frame for most of its section.
 *
 * These numbers are choreography, not mechanism — tune them by eye against the
 * real scene. The band and the path only have to agree that the craft starts
 * and ends outside the frustum.
 */
const FLY_FROM = [110, 1, -120] as const;
const FLY_TO = [-70, 6, -78] as const;

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
  // Linear, deliberately. Easing the ends compresses the middle of the path —
  // which is exactly the stretch where the craft is close enough to read — into
  // a narrow band of scroll, so the section goes back to being mostly empty
  // sky. The clamp is all that is needed here.
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
