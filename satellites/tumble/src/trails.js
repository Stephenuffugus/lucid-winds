// SHOT TRAILS (DESIGN 9.5, DESIGN-T2 phase 8). Pure: tests/balltrail.test.mjs holds it without a browser.
//
// A trail is a spray of camera facing sprites left behind a ball in the air: each kind has its sprite (textures.js
// particleTexture), a colour and a size, how long each one lives, how it drifts, how its brightness moves while it
// fades, and how many a flying ball leaves each frame. Build 1's three are written out by hand in the test.

export const TRAILS = {
  sparkle: { color: 0xfff2c8, size: 50, life: 0.6, rise: 0.02, twinkle: 40 },
  dust: { color: 0xcfc6b8, size: 90, life: 0.9, rise: 0.02 },
  hearts: { color: 0xff9fb2, size: 70, life: 0.6, rise: 0.15 },
  // phase 8's six, the answers' names. `rate` sprites a frame (a fraction is a chance), `drag` how much of the
  // ball's speed they keep going backwards, `dashed` every other one dark (a line of thread), `flicker` on and off at
  // that speed, `soft` their brightest. The answers NAMED three of them by a count (Three Bubbles, Two Falling
  // Petals, One Firefly), and a count a frame is a different count on every phone (120 Hz leaves twice what 60 Hz
  // does), so those three are counted per SHOT instead: `at` the moments of its flight when one leaves, and
  // `follow` one that trails the ball that far behind it and fades when it lands.
  stitch: { color: 0xb8322c, size: 64, life: 0.8, rise: 0, drag: 0, rate: 1, dashed: true },
  bubbles: { color: 0xe4f4ff, size: 76, life: 1.1, rise: 0.11, drag: 0.01, rate: 0, at: [0.08, 0.2, 0.34] },
  static: { color: 0x7fb8ff, size: 72, life: 0.35, rise: 0, drag: 0.02, rate: 1, flicker: 90 },
  firefly: { color: 0xffd84a, size: 96, life: 0.8, rise: 0, drag: 0, rate: 0, follow: 0.12, twinkle: 14 },
  petals: { color: 0xee86a8, size: 78, life: 1.2, rise: -0.1, drag: 0.02, rate: 0, at: [0.12, 0.3] },
  steam: { color: 0xfaf7f2, size: 136, life: 0.9, rise: 0.09, drag: 0.02, rate: 1, soft: 0.85 },
};

const BUILD1_RATE = 1.5;     // one a frame, and half the time a second (app.js as it was)

// how many sprites a flying ball leaves this frame: a whole part, and a chance of one more
export function trailCount(kind, rnd) {
  const T = TRAILS[kind];
  const rate = T && T.rate !== undefined ? T.rate : BUILD1_RATE;
  return Math.floor(rate) + (rnd < rate - Math.floor(rate) ? 1 : 0);
}

// how many a shot leaves on a schedule as its flight time passes from t0 to t1 (Three Bubbles, Two Falling Petals)
export function trailDue(kind, t0, t1) {
  const T = TRAILS[kind];
  return T && T.at ? T.at.filter((a) => a > t0 && a <= t1).length : 0;
}

// how many sprites one shot leaves in all, for a trail counted per shot (null for a trail counted per frame)
export function trailPerShot(kind) {
  const T = TRAILS[kind];
  if (!T) return null;
  if (T.at) return T.at.length;
  if (T.follow) return 1;
  return null;
}

// a new sprite at the ball: its life and its drift, from the ball's velocity v and a jitter j()
export function trailSpawn(kind, v, j) {
  const T = TRAILS[kind] || TRAILS.sparkle;
  const drag = T.drag !== undefined ? T.drag : 0.05;
  return { life: T.life, vx: -v.x * drag + j(), vy: T.rise, vz: -v.z * drag + j() };
}

// how bright a sprite is, k of the way through its life (0 to 1), at age seconds, the i-th in the ring
export function trailAlpha(kind, k, age, i) {
  if (k >= 1) return 0;
  const T = TRAILS[kind] || TRAILS.sparkle;
  let a = 1 - k;
  if (T.twinkle) a *= 0.6 + 0.4 * Math.sin(age * T.twinkle);
  if (T.dashed && i % 2) return 0;
  if (T.flicker) a *= Math.sin(age * T.flicker) > 0 ? 1 : 0.15;
  if (T.soft) a *= T.soft;
  return a;
}
