// THE SHAPE OF A ROLLED PAIR (DESIGN 9.5, DESIGN-T2 phase 8). Pure: tests/balltrail.test.mjs holds it without a
// browser, render.js builds the ball mesh from it.
//
// In the physics every ball is the same sphere (PHYS.ball.radius), so a ball STYLE is only the look of the bundle:
// each point of a sphere of radius r is moved to where the style's surface is. It rolls, rests and lands like the
// sphere, so a flatter style floats a little on its flat side and a lumpier one sinks a little: the test holds
// every style inside what the four Build 1 styles already do.

// Build 1's four, as ballGeometry had them (their numbers are held by hand in the test)
export const ROLLS = {
  tight: { size: 1, lump: 0.025, squash: 0.9, ridge: 0.07, ridge2: 0 },
  loose: { size: 1.1, lump: 0.08, squash: 0.95, ridge: 0.05, ridge2: 0 },
  tucked: { size: 0.93, lump: 0.015, squash: 0.78, ridge: 0.09, ridge2: 0 },
  mom: { size: 1.02, lump: 0.03, squash: 0.88, ridge: 0.08, ridge2: 0.07 },
};

// Phase 8's six, the answers' names (lane E). Each is a surface over the direction from the middle: `k` how far out it
// reaches there, and the whole thing stretched by s = [x, y, z]. n is the unit direction, lat and lon its angles.
const gauss = (v, w) => Math.exp(-(v / w) * (v / w));
const unit = (x, y, z) => { const L = Math.hypot(x, y, z); return [x / L, y / L, z / L]; };
const KNOT = unit(0.8, 0.2, 0.55), ANK1 = unit(Math.cos(0.6), 0, Math.sin(0.6)), ANK2 = unit(Math.cos(0.6), 0, -Math.sin(0.6));
const dot = (n, a) => n[0] * a[0] + n[1] * a[1] + n[2] * a[2];
export const SHAPES = {
  // SOCK ROSE: coiled flat, a spiral groove winding in from the rim across the top, a rolled edge
  // (on BOTH faces: held in her hand the ball shows the camera its underside, and a coil looks the same from either)
  rose: { s: [1, 0.8, 1], k: (n, lat, lon) => 1.04 * (1 + 0.075 * Math.min(1, Math.abs(lat) / 0.5) * Math.cos(lon - (Math.PI / 2 - Math.abs(lat)) * 10) + 0.03 * gauss(lat, 0.25)) },
  // THE BURRITO: rolled long, both cuffs folded over the ends
  burrito: { s: [1.13, 0.88, 0.88], k: (n, lat, lon) => 1 + 0.07 * gauss(Math.abs(n[0]) - 0.72, 0.08) + 0.02 * Math.sin(lon * 5 + lat * 3) },
  // FIGURE EIGHT: crossed once and tucked into two soft loops, a waist between them
  eight: { s: [1.12, 0.94, 0.94], k: (n, lat, lon) => 1 - 0.13 * gauss(n[0], 0.28) + 0.02 * Math.sin(lon * 4 - lat * 3) },
  // THE SOFT KNOT: one loose overhand knot, a fat twisted band round it on a slant, passing close to both poles (so
  // she sees it from whichever side the ball shows her)
  knot: { s: [1, 0.93, 1], k: (n, lat, lon) => { const t = Math.atan2(n[2] - KNOT[2] * dot(n, KNOT), n[0] - KNOT[0] * dot(n, KNOT)); return 1 + 0.09 * gauss(dot(n, KNOT), 0.2) * (0.8 + 0.2 * Math.sin(8 * t)) + 0.04 * Math.sin(lon * 4 + lat * 6); } },
  // CROSSED ANKLES: rolled once with the two legs crossed over the top in an X
  crossed: { s: [1, 0.88, 1], k: (n, lat, lon) => 1 + 0.11 * gauss(dot(n, ANK1), 0.14) + 0.11 * gauss(dot(n, ANK2), 0.14) + 0.015 * Math.sin(lon * 3 + lat * 5) },
  // CUFFED DONUT: rolled into a ring, dimpled top and bottom, one cuff round the outside
  donut: { s: [1, 0.84, 1], k: (n, lat) => 1.06 * (1 - 0.28 * gauss(Math.PI / 2 - Math.abs(lat), 0.4) + 0.05 * gauss(lat, 0.14)) },
};

export const BALL_STYLES = [...Object.keys(ROLLS), ...Object.keys(SHAPES)];

// HOW MUCH LIGHT a point of the bundle gets (1 = all of it; into the shader's aShade). A knit bundle reads by its
// shadows: held in her hand the camera looks straight down on the ball, and without these every style was the same
// green lump (the pictures of 23 Sep). Build 1's four have none and draw exactly as they did.
const shades = {
  // the groove between the coils of the spiral, across the top
  rose: (n, lat, lon) => 1 - 0.4 * Math.min(1, Math.abs(lat) / 0.5) * Math.max(0, -Math.cos(lon - (Math.PI / 2 - Math.abs(lat)) * 10)),
  // the fold where each cuff turns over the end
  burrito: (n) => 1 - 0.42 * gauss(Math.abs(n[0]) - 0.6, 0.05),
  // the crease at the waist between the two loops
  eight: (n) => 1 - 0.48 * gauss(n[0], 0.11),
  // both edges of the twisted band
  knot: (n) => 1 - 0.36 * gauss(Math.abs(dot(n, KNOT)) - 0.2, 0.05),
  // both edges of each leg of the X
  crossed: (n) => 1 - 0.34 * Math.min(1, gauss(Math.abs(dot(n, ANK1)) - 0.15, 0.045) + gauss(Math.abs(dot(n, ANK2)) - 0.15, 0.045)),
  // the hollow in the middle, and the line where the cuff goes round
  donut: (n, lat) => 1 - Math.min(0.5, 0.5 * gauss(Math.PI / 2 - Math.abs(lat), 0.35) + 0.3 * gauss(Math.abs(lat) - 0.28, 0.05)),
};
export function ballShade(roll, x, y, z, r) {
  const f = shades[roll];
  if (!f) return 1;
  const lat = Math.asin(Math.max(-1, Math.min(1, y / r))), lon = Math.atan2(z, x);
  return Math.max(0.45, Math.min(1, f([x / r, y / r, z / r], lat, lon)));
}

// where the point (x, y, z) of a sphere of radius r goes for a style
export function ballVertex(roll, x, y, z, r) {
  const Q = SHAPES[roll];
  if (Q) {
    const lat = Math.asin(Math.max(-1, Math.min(1, y / r))), lon = Math.atan2(z, x);
    const k = Q.k([x / r, y / r, z / r], lat, lon);
    return [x * k * Q.s[0], y * k * Q.s[1], z * k * Q.s[2]];
  }
  const S = ROLLS[roll] || ROLLS.tight;
  const lat = Math.asin(Math.max(-1, Math.min(1, y / r)));
  const lon = Math.atan2(z, x);
  let k = 1 + S.ridge * Math.exp(-Math.pow((lat - 0.55) / 0.09, 2)) - 0.03 * Math.exp(-Math.pow((lat - 0.72) / 0.12, 2));
  k += S.ridge2 * Math.exp(-Math.pow((lat - 0.15) / 0.08, 2));
  k += S.lump * Math.sin(lon * 3 + lat * 5) * Math.cos(lat * 2) + S.lump * 0.5 * Math.sin(lon * 7 - lat * 3);
  k *= S.size;
  return [x * k, y * k * S.squash, z * k];
}
