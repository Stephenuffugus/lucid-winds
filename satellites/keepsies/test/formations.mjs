/**
 * The lays gate.
 *
 *   node test/formations.mjs
 *
 * Every formation in game/ringer.js is a real lay of thirteen mibs, which is what every
 * other gate assumes: seven wins, marbles are conserved at thirteen, the AI samples live
 * positions. So each lay must be thirteen, no two mibs may overlap or sit closer than the
 * spacing the tuning promises, every mib must sit well inside the smallest ring, and the
 * lays must actually differ from one another. Each assertion has been watched to fail.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { FORMATIONS, FORMATION_NAMES } from '../src/game/ringer.js?v=20260905a';

const HERE = dirname(fileURLToPath(import.meta.url));
const T = JSON.parse(readFileSync(join(HERE, '..', 'src', 'data', 'tuning.json'), 'utf8'));
const SP = T.ringer.crossSpacing;
const SMALLEST_RING = T.ringer.ringSizeRadius['7ft'];

const fails = [];
const ok = (c, m) => { if (!c) fails.push(m); };
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

ok(FORMATION_NAMES.includes('cross'), 'the cross must exist, the tutorial and the sim depend on it');
ok(FORMATION_NAMES.length >= 4, `want at least four lays, have ${FORMATION_NAMES.length}`);

const shapes = {};
for (const name of FORMATION_NAMES) {
  const lay = FORMATIONS[name](SP);
  ok(lay.length === 13, `${name}: ${lay.length} mibs, must be thirteen`);
  let minPair = Infinity, maxR = 0, cx = 0, cz = 0;
  for (let i = 0; i < lay.length; i++) {
    cx += lay[i][0]; cz += lay[i][1];
    maxR = Math.max(maxR, Math.hypot(lay[i][0], lay[i][1]));
    for (let j = i + 1; j < lay.length; j++) minPair = Math.min(minPair, d2(lay[i], lay[j]));
  }
  cx /= lay.length; cz /= lay.length;
  ok(minPair >= SP * 0.999, `${name}: two mibs are ${minPair.toFixed(4)} m apart, spacing is ${SP}`);
  ok(maxR < SMALLEST_RING * 0.5, `${name}: a mib sits ${maxR.toFixed(3)} m out, past half the seven foot ring (${(SMALLEST_RING * 0.5).toFixed(3)})`);
  ok(Math.hypot(cx, cz) < 1e-6, `${name}: lay is off centre by ${Math.hypot(cx, cz).toFixed(4)} m`);
  // a shape signature: sorted pairwise distances, so a rotation of the same lay still reads as distinct only if it IS
  shapes[name] = lay.map(p => Math.hypot(p[0], p[1]).toFixed(4)).sort().join(',');
}
/* the cross and the x share radii (one is the other turned), so distinctness is by
   coordinates, not radii: no two lays may place all thirteen in the same spots */
for (let i = 0; i < FORMATION_NAMES.length; i++) for (let j = i + 1; j < FORMATION_NAMES.length; j++) {
  const a = FORMATIONS[FORMATION_NAMES[i]](SP).map(p => p.map(v => v.toFixed(3)).join(':')).sort().join('|');
  const b = FORMATIONS[FORMATION_NAMES[j]](SP).map(p => p.map(v => v.toFixed(3)).join(':')).sort().join('|');
  ok(a !== b, `${FORMATION_NAMES[i]} and ${FORMATION_NAMES[j]} are the same lay`);
}
/* the cross is exactly what it always was: arms of three along the axes */
{
  const c = FORMATIONS.cross(SP);
  ok(c.some(p => p[0] === 3 * SP && p[1] === 0) && c.some(p => p[0] === 0 && p[1] === -3 * SP), 'the cross has lost an arm');
}

if (fails.length) { console.log('FORMATIONS FAILED'); for (const f of fails) console.log('  - ' + f); process.exit(1); }
console.log(`FORMATIONS OK  ${FORMATION_NAMES.join(', ')}: thirteen each, ${SP} m apart, all inside half the seven foot ring`);
