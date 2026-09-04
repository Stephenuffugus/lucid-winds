/**
 * The spyglass gate.
 *
 *   node test/spyglass.mjs
 *
 * Pure maths against core/spyglass.js, no world. What it asserts, each watched to fail:
 *   - dead ahead, the scope looks at the mib on the aim line at its range
 *   - the mib nearest the LINE wins over the nearest mib once the line is turned onto it
 *   - nothing ahead of the shooter means no scope
 *   - the bracket is the cone's half angle at the target's range, and widens with both
 *   - at the scope's lens a 16 mm mib 2.5 m off is a readable size and the settled bracket fits
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { spyglassFor, scopePxPerM } from '../src/core/spyglass.js?v=20260904d';

const HERE = dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(readFileSync(join(HERE, '..', 'src', 'data', 'tuning.json'), 'utf8'));
const C = T.render.spyglass;
const DEG = Math.PI / 180;
const fails = [];
const ok = (cond, msg) => { if (!cond) fails.push(msg); };
const near = (a, b, tol) => Math.abs(a - b) <= tol;

const TAW = { tawX: 0, tawZ: -1.525 };
const live = [{ x: 0, z: 0, uid: 'centre' }, { x: 0.3, z: 0.2, uid: 'right' }, { x: -0.05, z: -1.9, uid: 'behind' }];

/* 1. dead ahead (azimuth 0 runs the line along +z) */
{
  const s = spyglassFor({ ...TAW, azimuth: 0, live, coneDeg: 1.5 }, C);
  ok(s && s.mib.uid === 'centre', `ahead: should look at the centre mib, got ${s && s.mib.uid}`);
  ok(s && near(s.range, 1.525, 1e-9), `ahead: range should be 1.525, got ${s && s.range}`);
  ok(s && near(s.tx, 0, 1e-9) && near(s.tz, 0, 1e-9), 'ahead: the look point should be the mib itself');
  ok(s && near(s.lateral, 0, 1e-9), 'ahead: the centre mib is on the line');
  ok(s && near(s.coneHalfM, 1.525 * Math.tan(1.5 * DEG), 1e-6), `ahead: cone half width should be ${(1.525 * Math.tan(1.5 * DEG)).toFixed(4)} m, got ${s && s.coneHalfM}`);
}

/* 2. turned 5 degrees the centre mib is still nearest the line; at 10 the right one is */
{
  const five = spyglassFor({ ...TAW, azimuth: 5 * DEG, live, coneDeg: 1.5 }, C);
  ok(five && five.mib.uid === 'centre', `5 deg: centre mib should still be nearest the line, got ${five && five.mib.uid}`);
  const ten = spyglassFor({ ...TAW, azimuth: 10 * DEG, live, coneDeg: 1.5 }, C);
  ok(ten && ten.mib.uid === 'right', `10 deg: the line now runs onto the right mib (0.004 m off) and it must win over the nearer centre mib (0.26 m off), got ${ten && ten.mib.uid}`);
  ok(ten && Math.abs(ten.lateral) < 0.01, `10 deg: lateral should be under a centimetre, got ${ten && ten.lateral}`);
}

/* 3. nothing ahead */
{
  const s = spyglassFor({ ...TAW, azimuth: Math.PI, live: [live[0]], coneDeg: 1.5 }, C);
  ok(s === null, 'behind: a mib behind the shooter opens no scope');
  ok(spyglassFor({ ...TAW, azimuth: 0, live: [], coneDeg: 1.5 }, C) === null, 'empty: no mibs, no scope');
}

/* 4. the bracket widens with the hold and with the range */
{
  const tight = spyglassFor({ ...TAW, azimuth: 0, live: [live[0]], coneDeg: 1.5 }, C);
  const wide = spyglassFor({ ...TAW, azimuth: 0, live: [live[0]], coneDeg: 6 }, C);
  const far = spyglassFor({ tawX: 0, tawZ: -3.05, azimuth: 0, live: [live[0]], coneDeg: 1.5 }, C);
  ok(near(wide.coneHalfM / tight.coneHalfM, Math.tan(6 * DEG) / Math.tan(1.5 * DEG), 1e-6), 'cone: the bracket follows tan of the half angle');
  ok(near(far.coneHalfM / tight.coneHalfM, 2, 1e-6), 'cone: twice the range, twice the bracket');
}

/* 5. the scope's lens: a 16 mm mib 2.5 m from the camera is readable, and the settled bracket fits */
{
  const ppm = scopePxPerM(2.5, C);
  const mibPx = 0.016 * ppm;
  const bracketPx = 2 * 1.525 * Math.tan(1.5 * DEG) * ppm;
  ok(mibPx >= 12, `lens: a 16 mm mib at 2.5 m should be at least 12 px in the scope, got ${mibPx.toFixed(1)}`);
  ok(bracketPx <= C.sizePx - 10, `lens: the settled bracket ${bracketPx.toFixed(0)} px must fit a ${C.sizePx} px scope`);
  ok(bracketPx >= 3 * mibPx, `lens: the settled bracket (${bracketPx.toFixed(0)} px) should be several mibs wide (${mibPx.toFixed(1)} px), or the scope shows nothing the main screen did not`);
}

if (fails.length) {
  console.log('SPYGLASS FAILED');
  for (const f of fails) console.log('  - ' + f);
  process.exit(1);
}
const ppm = scopePxPerM(2.5, C);
console.log(`SPYGLASS OK  at 2.5 m a 16 mm mib is ${(0.016 * ppm).toFixed(1)} px in the scope, the settled bracket ${(2 * 1.525 * Math.tan(1.5 * DEG) * ppm).toFixed(0)} px`);
