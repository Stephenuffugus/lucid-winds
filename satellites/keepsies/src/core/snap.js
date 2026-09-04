/**
 * The only place an AimSource becomes an impulse.
 *
 * Touch, the pull back fallback, the replay log, the AI and (Phase 5) a Quest
 * controller all produce the same struct and all arrive here. Game code never
 * sees a raw pointer (HANDOFF-KEEPSIES 5.3).
 *
 * AimSource: `{origin, dir, power01, contactOffset:{x,y}, pathCurvature,
 * wildness01, braced01, warmed}`. `dir` is a unit vector on the floor plane;
 * `contactOffset` is where the snap path crossed the marble's screen disc, in
 * marble radii, x to the side and y up, both in -1 to 1. Below centre is
 * backspin, above is top.
 *
 * Spin is expressed as a MULTIPLE OF THE NATURAL ROLLING RATE (speed / radius),
 * so the constants in tuning.json mean the same thing for a 12 mm Peewee and a
 * 35 mm arena marble.
 */
import { sin, cos, normalize, rotateAxis, clamp, DEG, len2, powSixteenths, invertMonotone } from './dmath.js?v=20260904b';

const UP = { x: 0, y: 1, z: 0 };

/** Cross product. */
function cross(a, b) {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * Launch speed from the normalised power. The ease out is what makes the top of
 * a human's effort buy the last sliver of power (DESIGN 7.2).
 */
export function launchSpeed(power01, tuning) {
  const t = tuning.snap;
  const p = clamp(power01, 0, 1);
  const eased = 1 - powSixteenths(1 - p, t.powerEaseSixteenths);
  return t.launchMin + (t.launchMax - t.launchMin) * eased;
}

/**
 * The accuracy cone half angle in radians, before dispersion is sampled.
 * A steadier brace tightens it; wildness opens it back up.
 */
export function coneHalfAngle(aim, tuning) {
  const t = tuning.snap;
  // A scenario or an AI candidate may state the cone outright, because a physics
  // gate wants to measure the physics and not the player's aim. Nothing the input
  // layer produces ever sets this.
  if (aim.coneDegOverride != null) return aim.coneDegOverride * DEG;
  const braced = clamp(aim.braced01 == null ? 1 : aim.braced01, 0, 1);
  const wide = t.coneWideDeg, tight = t.coneTightDeg;
  const deg = (wide + (tight - wide) * braced) * (1 + clamp(aim.wildness01 || 0, 0, 1));
  return deg * DEG;
}

/**
 * Turn an AimSource into the impulses physics.impulse wants.
 *
 * @param {object} aim the AimSource
 * @param {{mass:number, inertia:number, radius:number}} spec from marbleBody
 * @param {object} tuning
 * @param {{next:()=>number}} rng the `match` stream, never Math.random
 * @returns {{lin:{x,y,z}, ang:{x,y,z}, speed:number, coneDeg:number, spinRate:number}}
 */
export function aimToImpulse(aim, spec, tuning, rng) {
  const t = tuning.snap;
  const speed = launchSpeed(aim.power01, tuning);

  // direction, dispersed inside the cone. The dispersion is a rotation about the
  // world up axis: marbles are launched along the floor, not into the air.
  const half = coneHalfAngle(aim, tuning);
  const spread = half * (rng.next() * 2 - 1);
  let dir = normalize({ x: aim.dir.x, y: 0, z: aim.dir.z });
  if (dir.x === 0 && dir.z === 0) dir = { x: 0, y: 0, z: 1 };
  dir = rotateAxis(dir, UP, spread);

  const lift = aim.bomb ? clamp(aim.bombLift == null ? 1 : aim.bombLift, 0, 1) : 0;
  const vy = lift > 0 ? -speed * lift : 0;
  const vh = lift > 0 ? speed * (1 - lift) : speed;

  // spin. side axis is up cross dir, which is the axis a marble rolls about when
  // it travels along dir (derived, not guessed: contact point velocity is zero).
  const side = cross(UP, dir);
  const offY = clamp(aim.contactOffset ? aim.contactOffset.y : 0, -1, 1);
  const offX = clamp(aim.contactOffset ? aim.contactOffset.x : 0, -1, 1);
  const natural = speed / spec.radius;
  const forward = offY >= 0 ? offY * t.kTop : offY * t.kBack; // above centre tops, below backs
  const wild = clamp(aim.wildness01 || 0, 0, 1);

  let w = {
    x: side.x * forward * natural + UP.x * offX * t.kSide * natural,
    y: side.y * forward * natural + UP.y * offX * t.kSide * natural,
    z: side.z * forward * natural + UP.z * offX * t.kSide * natural
  };

  if (wild > 0) {
    const mag = len2(len2(w.x, w.y), w.z);
    if (mag > 1e-9) {
      const boosted = mag + wild * t.kWildSpin * natural;
      const k = boosted / mag;
      w = { x: w.x * k, y: w.y * k, z: w.z * k };
    } else {
      const boost = wild * t.kWildSpin * natural;
      w = { x: side.x * boost, y: side.y * boost, z: side.z * boost };
    }
    const ang = wild * t.wildAxisMaxDeg * DEG * (rng.next() * 2 - 1);
    w = rotateAxis(w, dir, ang);
  }

  return {
    lin: { x: dir.x * vh * spec.mass, y: vy * spec.mass, z: dir.z * vh * spec.mass },
    ang: { x: w.x * spec.inertia, y: w.y * spec.inertia, z: w.z * spec.inertia },
    speed, coneDeg: half / DEG, spinRate: len2(len2(w.x, w.y), w.z)
  };
}

/**
 * A direction from an angle in the floor plane, degrees, 0 pointing at +z.
 * Used by scenarios and the AI so nobody writes trig at the call site.
 */
export function dirFromDeg(deg) {
  const r = deg * DEG;
  return { x: sin(r), y: 0, z: cos(r) };
}

/** An AimSource with every field filled in, so a partial scenario cannot be ambiguous. */
export function makeAim(partial) {
  return {
    origin: partial.origin || { x: 0, y: 0, z: 0 },
    dir: partial.dir || { x: 0, y: 0, z: 1 },
    power01: partial.power01 == null ? 0.5 : partial.power01,
    contactOffset: partial.contactOffset || { x: 0, y: 0 },
    pathCurvature: partial.pathCurvature || 0,
    wildness01: partial.wildness01 || 0,
    braced01: partial.braced01 == null ? 1 : partial.braced01,
    warmed: !!partial.warmed,
    bomb: !!partial.bomb,
    bombLift: partial.bombLift,
    coneDegOverride: partial.coneDegOverride == null ? null : partial.coneDegOverride,
    assist: partial.assist || null
  };
}

/**
 * The power01 that produces a given launch speed. Bisection rather than a
 * fractional root, because the root would need Math.pow and core does not have it.
 */
export function powerForSpeed(mps, tuning) {
  return invertMonotone((p) => launchSpeed(p, tuning), mps, 0, 1);
}
