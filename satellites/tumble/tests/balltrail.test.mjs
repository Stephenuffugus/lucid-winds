// PHASE 8, BALLS AND TRAILS (DESIGN-T2): "Six ball styles and six trails from the answers, names first."
//
// The names are the four outside answers' own (plans/tumble/exp1/all-ideas.json, lane E): the round ones, because in
// the physics every ball is ONE sphere and a style is only the look of the bundle, so a boxy fold (the Square
// Parcel, the Drawer Brick, the Hotel Fold) would roll like a brick shaped ball. This holds: the six and six by name,
// Build 1's four balls and three trails exactly as they were, every new ball inside what the old four already do
// (how far a style floats on its flat side or sinks on its lumps, measured on its real outline in every direction),
// no two ball styles alike, and every trail fading inside a second without flooding the screen.
// dev/shots-balls.mjs holds what the page draws (a sprite of its own for each trail, the icons in the shop).
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { BALL_STYLES, ballVertex, ballShade } from '../src/balls.js';
import { TRAILS, trailCount, trailSpawn, trailAlpha, trailDue, trailPerShot } from '../src/trails.js';

const { ok, done } = suite('balltrail');
const unlocks = JSON.parse(readFileSync(new URL('../data/unlocks.json', import.meta.url)));
const items = (cat) => unlocks.items.filter((i) => i.cat === cat);

const BALLS = { 'Sock Rose': 'rose', 'The Burrito': 'burrito', 'Figure Eight': 'eight', 'The Soft Knot': 'knot', 'Crossed Ankles': 'crossed', 'Cuffed Donut': 'donut' };
const TRAILS6 = { 'Running Stitch': 'stitch', 'Three Bubbles': 'bubbles', 'Dryer Static': 'static', 'One Firefly': 'firefly', 'Two Falling Petals': 'petals', 'Soft Steam': 'steam' };

// ---------- the six and six, earned with Lint ----------
for (const [cat, want, key] of [['ball', BALLS, 'roll'], ['trail', TRAILS6, 'trail']]) {
  const have = new Map(items(cat).map((i) => [i.name, i]));
  const bad = [];
  for (const [name, kind] of Object.entries(want)) {
    const it = have.get(name);
    if (!it) { bad.push(`${name} missing`); continue; }
    if (it.look[key] !== kind) bad.push(`${name} is ${it.look[key]}`);
    if (!(it.cost && it.cost.lint >= 150 && it.cost.lint <= 400 && Object.keys(it.cost).length === 1) || it.start) bad.push(`${name} costs ${JSON.stringify(it.cost)}`);
  }
  ok(!bad.length, `the six ${cat === 'ball' ? 'ball styles' : 'trails'} from the answers are in the shop, 150 to 400 Lint each${bad.length ? ': ' + bad.join('; ') : ''}`);
}
{
  const missing = [...Object.values(BALLS).filter((k) => !BALL_STYLES.includes(k)).map((k) => 'ball ' + k), ...Object.values(TRAILS6).filter((k) => !TRAILS[k]).map((k) => 'trail ' + k)];
  ok(!missing.length, `every new style and trail has its own entry (a kind with none draws the Tight Roll or the sparkle)${missing.length ? ': none for ' + missing.join(', ') : ''}`);
}

// ---------- Build 1, exactly as it was ----------
{
  // ballGeometry's old formula, written out: a style is a lathe of ridges and lumps round a squashed sphere
  const OLD = { tight: [1, 0.025, 0.9, 0.07, 0], loose: [1.1, 0.08, 0.95, 0.05, 0], tucked: [0.93, 0.015, 0.78, 0.09, 0], mom: [1.02, 0.03, 0.88, 0.08, 0.07] };
  const r = 0.042, bad = [];
  for (const [roll, [size, lump, squash, ridge, ridge2]] of Object.entries(OLD)) {
    for (let i = 0; i < 400; i++) {
      const th = (i * 2.399963) % (2 * Math.PI), y = r * (1 - 2 * ((i + 0.5) / 400)), q = Math.sqrt(r * r - y * y);
      const x = q * Math.cos(th), z = q * Math.sin(th);
      const lat = Math.asin(Math.max(-1, Math.min(1, y / r))), lon = Math.atan2(z, x);
      let k = 1 + ridge * Math.exp(-Math.pow((lat - 0.55) / 0.09, 2)) - 0.03 * Math.exp(-Math.pow((lat - 0.72) / 0.12, 2));
      k += ridge2 * Math.exp(-Math.pow((lat - 0.15) / 0.08, 2));
      k += lump * Math.sin(lon * 3 + lat * 5) * Math.cos(lat * 2) + lump * 0.5 * Math.sin(lon * 7 - lat * 3);
      k *= size;
      const v = ballVertex(roll, x, y, z, r), w = [x * k, y * k * squash, z * k];
      if (v.some((c, n) => c !== w[n])) { bad.push(roll); break; }
    }
  }
  ok(!bad.length, `Build 1's four ball styles are exactly the shapes they were${bad.length ? ': ' + bad.join(', ') : ''}`);
}
{
  // the old trails: sparkle 50 px cream twinkling at 40, dust 90 px lasting 0.9 s, hearts 70 px rising at 0.15
  const bad = [];
  const want = { sparkle: [0xfff2c8, 50, 0.6, 0.02], dust: [0xcfc6b8, 90, 0.9, 0.02], hearts: [0xff9fb2, 70, 0.6, 0.15] };
  for (const [k, [color, size, life, rise]] of Object.entries(want)) {
    const T = TRAILS[k], s = trailSpawn(k, { x: 1, y: 0, z: 2 }, () => 0);
    if (!T || T.color !== color || T.size !== size || s.life !== life || s.vy !== rise || s.vx !== -0.05 || s.vz !== -0.1) bad.push(k);
    for (const [kk, age] of [[0, 0.1], [0.4, 0.23], [0.99, 0.5]]) {
      const old = (1 - kk) * (k === 'sparkle' ? 0.6 + 0.4 * Math.sin(age * 40) : 1);
      if (Math.abs(trailAlpha(k, kk, age, 3) - old) > 1e-12) { bad.push(k + ' alpha'); break; }
    }
    // one a frame and half the time a second
    if (trailCount(k, 0.2) !== 2 || trailCount(k, 0.7) !== 1) bad.push(k + ' count');
  }
  ok(!bad.length, `Build 1's three trails are exactly what they were${bad.length ? ': ' + bad.join(', ') : ''}`);
}

// ---------- every ball style inside what Build 1 already does ----------
// a style's outline: how far its surface reaches from the ball's middle in each direction (its support). The
// physics ball reaches r everywhere, so a support under r floats that much when she rests on that side and one
// over r sinks that much into the table or the basket's floor.
const r = 0.042;
const DIRS = [];
for (let i = 0; i < 300; i++) { const y = 1 - 2 * ((i + 0.5) / 300), q = Math.sqrt(1 - y * y), th = i * 2.399963; DIRS.push([q * Math.cos(th), y, q * Math.sin(th)]); }
const support = (roll) => {
  const pts = [];
  for (let a = 0; a < 36; a++) for (let b = 1; b < 24; b++) {
    const th = (a / 36) * Math.PI * 2, ph = (b / 24) * Math.PI;
    pts.push(ballVertex(roll, r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th), r));
  }
  return DIRS.map((d) => Math.max(...pts.map((p) => p[0] * d[0] + p[1] * d[1] + p[2] * d[2])) / r);
};
const SUP = Object.fromEntries(BALL_STYLES.map((k) => [k, support(k)]));
const old = ['tight', 'loose', 'tucked', 'mom'];
const lo = Math.min(...old.map((k) => Math.min(...SUP[k]))), hi = Math.max(...old.map((k) => Math.max(...SUP[k])));
{
  const bad = [];
  for (const k of Object.values(BALLS)) {
    if (!SUP[k]) continue;
    const a = Math.min(...SUP[k]), b = Math.max(...SUP[k]);
    if (a < lo - 0.02 || b > hi + 0.02) bad.push(`${k} ${a.toFixed(2)} to ${b.toFixed(2)}`);
  }
  ok(Object.values(BALLS).every((k) => SUP[k]) && !bad.length, `every new ball floats and sinks no more than Build 1's already do (they reach ${lo.toFixed(2)} to ${hi.toFixed(2)} of the sphere)${bad.length ? ': ' + bad.join('; ') : ''}`);
}
{
  // NOT by outline: an outline cannot see a hollow, and the Figure Eight IS its waist (by outline it came within
  // 2.4 percent of the Burrito). Point by point instead: where each point of the sphere goes, as a fraction of r.
  const surf = (roll) => DIRS.map((d) => ballVertex(roll, d[0] * r, d[1] * r, d[2] * r, r).map((c) => c / r));
  const SURF = Object.fromEntries(BALL_STYLES.map((k) => [k, surf(k)]));
  const keys = BALL_STYLES, bad = [];
  let closest = [9, ''];
  for (let i = 0; i < keys.length; i++) for (let j = i + 1; j < keys.length; j++) {
    const A = SURF[keys[i]], B = SURF[keys[j]];
    const d = A.reduce((s, p, n) => s + Math.hypot(p[0] - B[n][0], p[1] - B[n][1], p[2] - B[n][2]), 0) / DIRS.length;
    if (d < closest[0]) closest = [d, `${keys[i]} and ${keys[j]}`];
    // Build 1's own closest pair, the Tight Roll and The Way Your Mom Did It, differ by 2.2 percent: a NEW style must
    // stand clearly further from every other than that
    const isNew = Object.values(BALLS).includes(keys[i]) || Object.values(BALLS).includes(keys[j]);
    if (isNew && d < 0.03) bad.push(`${keys[i]} and ${keys[j]} (${d.toFixed(3)})`);
  }
  ok(Object.values(BALLS).every((k) => keys.includes(k)) && !bad.length, `no new ball style comes within 3 percent of another, point by point (the closest pair of all, ${closest[1]}, differ by ${(closest[0] * 100).toFixed(1)})${bad.length ? ': ' + bad.join('; ') : ''}`);
}

// ---------- the shape shows ----------
// Pictured on 23 Sep: held in her hand the camera looks straight down on the ball, and every style read as the same
// green lump (the rose's spiral and the donut's hollow face the camera, where soft light flattens them). A knit
// bundle reads by its SHADOWS, so each new style darkens its folds (ballShade, into the shader's aShade); Build 1's four
// carry none, so they draw exactly as they did.
{
  const bad = [];
  for (const k of BALL_STYLES) {
    let lo2 = 1, hi2 = 0;
    for (const d of DIRS) { const v = ballShade(k, d[0] * r, d[1] * r, d[2] * r, r); lo2 = Math.min(lo2, v); hi2 = Math.max(hi2, v); }
    const isNew = Object.values(BALLS).includes(k);
    if (!isNew && (lo2 !== 1 || hi2 !== 1)) bad.push(`${k} is shaded (${lo2.toFixed(2)})`);
    if (isNew && !(lo2 <= 0.75 && lo2 >= 0.45 && hi2 <= 1)) bad.push(`${k} shades ${lo2.toFixed(2)} to ${hi2.toFixed(2)}`);
  }
  ok(!bad.length, `each new ball style darkens its folds (to between 0.45 and 0.75), Build 1's four darken nothing${bad.length ? ': ' + bad.join('; ') : ''}`);
}

// ---------- every trail fades, and none floods ----------
{
  const bad = [];
  for (const k of Object.values(TRAILS6)) {
    const T = TRAILS[k];
    if (!T) continue;
    if (!(T.life > 0.15 && T.life <= 1.2)) bad.push(`${k} lives ${T.life} s`);
    let n = 0; for (let i = 0; i < 1000; i++) n += trailCount(k, (i + 0.5) / 1000);
    // a trail counted per frame leaves some and never floods; one counted per shot leaves none a frame
    if (trailPerShot(k) === null ? !(n / 1000 >= 0.15 && n / 1000 <= 1.5) : n !== 0) bad.push(`${k} leaves ${(n / 1000).toFixed(2)} a frame`);
    if (!(T.size >= 24 && T.size <= 140)) bad.push(`${k} is ${T.size} px`);
  }
  ok(Object.values(TRAILS6).every((k) => TRAILS[k]) && !bad.length, `every trail fades inside 1.2 s and leaves at most one and a half sprites a frame${bad.length ? ': ' + bad.join('; ') : ''}`);
  // THE COUNTS IN THEIR NAMES, per shot and never per frame (a frame count doubles on a 120 Hz phone): Three Bubbles
  // leaves three, Two Falling Petals two, One Firefly one, all inside the quickest shot's flight (0.4 s)
  const want = { bubbles: 3, petals: 2, firefly: 1 }, wrong = [];
  for (const [k, n] of Object.entries(want)) {
    let due = 0; for (let t = 0; t < 0.4; t += 0.004) due += trailDue(k, t, t + 0.004);
    const emitted = TRAILS[k] && TRAILS[k].follow ? 1 : due;
    if (trailPerShot(k) !== n || emitted !== n) wrong.push(`${k} leaves ${emitted} (${trailPerShot(k)}) a shot`);
  }
  ok(!wrong.length, `the counted trails leave what their names say, once a shot inside 0.4 s of flight${wrong.length ? ': ' + wrong.join('; ') : ''}`);
  const colours = Object.values(TRAILS).map((T) => T.color);
  ok(new Set(colours).size === colours.length, `no two trails share a colour (${colours.length})`);
}

done();
