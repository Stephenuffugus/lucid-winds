#!/usr/bin/env node
/* NOTCH P0: the hand rolled projection against a second implementation (plans/notch/HANDOFF-NOTCH.md 3.4; the handoff's "project()
 * matches a reference implementation within 0.5px across 100 random matrices").
 *
 *   node test/project.mjs
 *
 * The reference lives here: a quaternion rotation and its own perspective divide, sharing no code with project.js. Asserted,
 * each watched to fail on a planted fault:
 *   1. rotation matrices built from 100 random axes and angles, composed three at a time on 20 seeds, project 12 points each
 *      within 0.5 px of the reference at a 400 px scale
 *   2. rotationZ(theta) turns the point (1, 0, 0) to (cos theta, sin theta, 0), and a turn then its inverse is the identity
 *   3. multiply is associative and the identity is its unit, within 1e-9
 *   4. a point at the camera's depth is never divided by zero: projecting it returns null
 */
import { rng } from '../../math/core/pure.js';

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
let J = null;
try { J = await import('../project.js'); say(true, 'project.js loads as an ES module'); }
catch (e) { say(false, 'project.js loads as an ES module (' + e.message.split('\n')[0] + ')'); }

const SEEDS = Array.from({ length: 20 }, (_, i) => 5000 + i * 7919);
const FOCAL = 4, SCALE = 400, CX = 200, CY = 200;

/* the reference: quaternions */
const qAxis = (axis, deg) => { const n = Math.hypot(...axis), h = deg * Math.PI / 360, s = Math.sin(h) / n; return [Math.cos(h), axis[0] * s, axis[1] * s, axis[2] * s]; };
const qMul = (a, b) => [a[0] * b[0] - a[1] * b[1] - a[2] * b[2] - a[3] * b[3], a[0] * b[1] + a[1] * b[0] + a[2] * b[3] - a[3] * b[2], a[0] * b[2] - a[1] * b[3] + a[2] * b[0] + a[3] * b[1], a[0] * b[3] + a[1] * b[2] - a[2] * b[1] + a[3] * b[0]];
const qRotate = (q, p) => { const r = qMul(qMul(q, [0, p[0], p[1], p[2]]), [q[0], -q[1], -q[2], -q[3]]); return [r[1], r[2], r[3]]; };
const refProject = p => { const z = FOCAL - p[2]; return [CX + SCALE * p[0] / z, CY - SCALE * p[1] / z]; };

if (J) {
  /* 1 */
  {
    let worst = 0, n = 0;
    const bad = [];
    for (const seed of SEEDS) {
      const r = rng(seed >>> 0);
      for (let t = 0; t < 5; t++) {
        let m = J.identity(), q = [1, 0, 0, 0];
        for (let k = 0; k < 3; k++) {
          const axis = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1], deg = r() * 360;
          if (Math.hypot(...axis) < 1e-3) axis[2] = 1;
          m = J.multiply(J.rotationAxis(axis, deg), m);
          q = qMul(qAxis(axis, deg), q);
        }
        for (let i = 0; i < 12; i++) {
          const p = [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1];
          const got = J.projectPoint(m, p, { focal: FOCAL, scale: SCALE, cx: CX, cy: CY }), want = refProject(qRotate(q, p));
          const d = got ? Math.hypot(got[0] - want[0], got[1] - want[1]) : Infinity;
          worst = Math.max(worst, d); n++;
          if (!(d <= 0.5)) bad.push(seed + '/' + t + '/' + i + ' off ' + d.toFixed(3));
        }
      }
    }
    say(bad.length === 0, 'rotations from 100 random axes and angles, three composed, project within 0.5 px of a quaternion reference (' + n + ' points, worst ' + worst.toFixed(6) + ' px)' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 2 */
  {
    const bad = [];
    for (let deg = 0; deg < 360; deg += 7) {
      const p = J.transform(J.rotationZ(deg), [1, 0, 0]), a = deg * Math.PI / 180;
      if (Math.abs(p[0] - Math.cos(a)) > 1e-9 || Math.abs(p[1] - Math.sin(a)) > 1e-9 || Math.abs(p[2]) > 1e-9) bad.push(deg + ' gave ' + p.map(v => v.toFixed(4)).join(','));
      const back = J.multiply(J.rotationZ(-deg), J.rotationZ(deg)), id = J.identity();
      if (back.some((v, i) => Math.abs(v - id[i]) > 1e-9)) bad.push(deg + ' and back is not the identity');
    }
    say(bad.length === 0, 'rotationZ turns (1, 0, 0) to (cos, sin, 0) counterclockwise, and a turn then its inverse is the identity' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  }
  /* 3 */
  {
    const r = rng(77), rand = () => Array.from({ length: 16 }, () => r() * 2 - 1);
    let worst = 0;
    for (let t = 0; t < 50; t++) {
      const a = rand(), b = rand(), c = rand();
      const l = J.multiply(J.multiply(a, b), c), rr = J.multiply(a, J.multiply(b, c));
      l.forEach((v, i) => { worst = Math.max(worst, Math.abs(v - rr[i])); });
      J.multiply(a, J.identity()).forEach((v, i) => { worst = Math.max(worst, Math.abs(v - a[i])); });
    }
    say(worst < 1e-9, 'multiply is associative and the identity is its unit (worst ' + worst.toExponential(2) + ')');
  }
  /* 4 */
  say(J.projectPoint(J.identity(), [0, 0, FOCAL], { focal: FOCAL, scale: SCALE, cx: CX, cy: CY }) === null, 'a point at the camera\'s depth projects to null, never a division by zero');
}

console.log('');
if (fails.length) { console.log(fails.length + ' PROJECT FAILURE(S)'); process.exit(1); }
console.log('PROJECT OK');
