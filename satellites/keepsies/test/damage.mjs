/**
 * The damage model, and the six conditions, swept.
 *
 *   node test/damage.mjs
 *
 * DESIGN 22 asks for `condition_matrix`: "every condition x every active fires
 * exactly when specified". This is that gate, plus the arithmetic underneath it,
 * because a condition that fires correctly on a wrong damage number is still
 * wrong.
 *
 * Seven things are asserted:
 *   1. THE FORMULA IS THE DESIGN'S, at the floor, at the cap, and in between.
 *   2. A SOFT MARBLE TAKES MORE. Hardness divides, so Mercury at 0.8 really does
 *      take more from the same hit than a steelie at 1.4.
 *   3. THE TIERS ARE THE DESIGN'S BANDS and the boundaries land on the right side.
 *   4. THE SHATTER POINT RULE, and whether the bonus or the raw hit did it, which
 *      is what decides the camera.
 *   5. DEFENDERS CHARGE FASTER, and the last marble charges twice as fast again.
 *   6. BURN TICKS AT MOST ONCE PER HALF SECOND, however often it is called.
 *   7. THE CONDITION MATRIX: every shipped condition fires on exactly its own
 *      event and on no other, and never without a full meter.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as D from '../src/core/damage.js?v=20260904a';
import * as S from '../src/core/specials.js?v=20260904a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };
const near = (a, b, eps) => Math.abs(a - b) <= (eps == null ? 0.001 : eps);

/* ---- 1: the formula ---- */
const hit = (rel, mass, hard) => D.damageFor({ relSpeed: rel, attackerMassKg: mass, defenderHardness: hard }, T);
say(hit(1.2, 0.0054, 1) === 0 && hit(0.5, 0.0054, 1) === 0,
  '1. at or below the 1.2 m/s floor a hit does nothing at all');
const glassOnGlass = hit(3.0, 0.00536, 1.0);
say(near(glassOnGlass, (3.0 - 1.2) * 0.00536 * 55 / 1.0),
  '   and above it the formula is the design\'s: a 3 m/s glass hit does '
  + glassOnGlass.toFixed(2) + ' damage');
say(hit(400, 0.0167, 1) === T.arena.damageCap,
  '   and it caps at ' + T.arena.damageCap + ', however hard you hit');
const steelHit = hit(3.0, 0.0167, 1.0);
say(steelHit > glassOnGlass * 3,
  '   a steelie hits ' + (steelHit / glassOnGlass).toFixed(1) + ' times harder than glass at the same speed, '
  + 'because it is three times the mass');

/* ---- 2: hardness divides ---- */
const onMercury = hit(4, 0.0167, 0.8);
const onSteel = hit(4, 0.0167, 1.4);
say(onMercury > onSteel,
  '2. the same hit does ' + onMercury.toFixed(1) + ' to Mercury at 0.8 hardness and '
  + onSteel.toFixed(1) + ' to a steelie at 1.4');
say(near(onMercury / onSteel, 1.4 / 0.8, 0.02),
  '   and the ratio is exactly the ratio of their hardness: ' + (onMercury / onSteel).toFixed(3));

/* ---- 3: the tiers ---- */
say(D.tierOf(100, T) === 'pristine' && D.tierOf(70, T) === 'pristine' && D.tierOf(69, T) === 'chipped',
  '3. 70 is still pristine and 69 is chipped, which is the design\'s band');
say(D.tierOf(40, T) === 'chipped' && D.tierOf(39, T) === 'cracked',
  '   40 is still chipped and 39 is cracked');
say(D.tierOf(1, T) === 'cracked' && D.tierOf(0, T) === 'shattered',
  '   1 is cracked and 0 is shattered');

/* ---- 4: the shatter point ---- */
let c = D.shatterCheck(30, 25, 'glass', T);
say(c.lethal === true && c.byBonus === true,
  '4. glass finishes a cracked marble it could not otherwise reach: 25 damage into 30 integrity, '
  + 'effective ' + c.effective.toFixed(1) + ', and the bonus did it');
c = D.shatterCheck(30, 25, 'steel', T);
say(c.lethal === false, '   and steel does not, because the bonus is glass only');
c = D.shatterCheck(30, 35, 'glass', T);
say(c.lethal === true && c.byBonus === false,
  '   a hit that would have killed anyway reads as overwhelm rather than a placed killshot');
c = D.shatterCheck(80, 35, 'glass', T);
say(c.lethal === false && c.byBonus === false,
  '   and a pristine marble is not cracked, so no bonus applies to it at all');

/* ---- 5: charge ---- */
say(D.chargeFor('taken', 10, false, T) > D.chargeFor('dealt', 10, false, T),
  '5. defenders charge faster: ' + D.chargeFor('taken', 10, false, T) + ' taken against '
  + D.chargeFor('dealt', 10, false, T) + ' dealt, per ten damage');
say(D.chargeFor('dealt', 10, true, T) === D.chargeFor('dealt', 10, false, T) * 2,
  '   and the last marble in a bag charges twice as fast: '
  + D.chargeFor('dealt', 10, true, T));
const m = { charge: 96 };
const r1 = D.addCharge(m, 8, T);
say(m.charge === 100 && r1.justFilled === true, '   the meter caps at 100 and says when it just filled');
const r2 = D.addCharge(m, 8, T);
say(m.charge === 100 && r2.justFilled === false && r2.full === true,
  '   and it does not announce itself twice');

/* an end to end hit, both meters moving */
const att = { massKg: 0.0167, materialClass: 'steel', charge: 0, integrity: 100 };
const def = { massKg: 0.00536, materialClass: 'glass', hardness: 1.0, charge: 0, integrity: 100, shattered: false };
const res = D.applyHit(att, def, 4.0, {}, T);
say(res.dmg > 0 && def.integrity === 100 - res.dmg,
  '   an impact takes exactly its damage off: 100 became ' + def.integrity.toFixed(1));
say(def.charge > att.charge,
  '   and the one that got hit came out with more charge: ' + def.charge.toFixed(1)
  + ' against ' + att.charge.toFixed(1));

/* overkill pays for what landed, not for what was rolled */
const att2 = { massKg: 0.0167, materialClass: 'steel', charge: 0 };
const def2 = { massKg: 0.005, materialClass: 'glass', hardness: 1, charge: 0, integrity: 5, shattered: false };
const over = D.applyHit(att2, def2, 8, {}, T);
say(over.dmg === 5 && over.rolled > 5,
  '   and an overkill pays for the 5 that landed, not the ' + over.rolled.toFixed(0) + ' that was rolled');

/* ---- 6: burn ---- */
const bs = { lastBurn: null };
let burned = 0;
for (let t = 0; t < 2.0001; t += 0.1) burned += D.burnTick(bs, t, T);
say(near(burned, 4 * 2, 0.01),
  '6. burn over two seconds is ' + burned.toFixed(1) + ' however often it is asked: '
  + T.arena.burnPerContactSecond + ' a second, ticking every ' + T.arena.burnTickSeconds);

/* ---- 7: the condition matrix ---- */
console.log('\n  condition x event');
const EVENTS = {
  cracked: { tier: 'cracked', enemyContacts: 0, touchedRail: false, nearestEnemyM: 9, bagmateShattered: false, justEntered: false },
  contact3: { tier: 'pristine', enemyContacts: 3, touchedRail: false, nearestEnemyM: 9, bagmateShattered: false, justEntered: false },
  rail: { tier: 'pristine', enemyContacts: 0, touchedRail: true, nearestEnemyM: 9, bagmateShattered: false, justEntered: false },
  close: { tier: 'pristine', enemyContacts: 0, touchedRail: false, nearestEnemyM: 0.2, bagmateShattered: false, justEntered: false },
  bagmate: { tier: 'pristine', enemyContacts: 0, touchedRail: false, nearestEnemyM: 9, bagmateShattered: true, justEntered: false },
  entered: { tier: 'pristine', enemyContacts: 0, touchedRail: false, nearestEnemyM: 9, bagmateShattered: false, justEntered: true },
  nothing: { tier: 'pristine', enemyContacts: 0, touchedRail: false, nearestEnemyM: 9, bagmateShattered: false, justEntered: false }
};
/* which event each shipped condition is SUPPOSED to answer, and only that one.
   `onFull` answers every event, which is the point of it: no waiting. */
const WANT = {
  whenCracked: ['cracked'],
  onFull: Object.keys(EVENTS),
  nthContact: ['contact3'],
  closeRange: ['close'],
  vengeance: ['bagmate'],
  onEntering: ['entered']
};
let matrixBad = 0;
for (const id of S.SHIPPED) {
  const row = [];
  for (const ev of Object.keys(EVENTS)) {
    const marble = { charge: 100, firedActive: false, condition: { id: id, params: { n: 3 } } };
    const got = S.shouldFire(marble, EVENTS[ev], T).fires;
    const want = WANT[id].indexOf(ev) >= 0;
    if (got !== want) matrixBad++;
    row.push((got ? '+' : '.') + ev);
  }
  console.log('    ' + id.padEnd(12) + row.join(' '));
}
say(matrixBad === 0, '7. every shipped condition fires on its own event and on no other: '
  + matrixBad + ' wrong cells in ' + (S.SHIPPED.length * Object.keys(EVENTS).length));

for (const id of S.SHIPPED) {
  const half = { charge: 99, firedActive: false, condition: { id: id, params: { n: 1 } } };
  if (S.shouldFire(half, EVENTS.cracked, T).fires) matrixBad++;
}
say(matrixBad === 0, '   and NONE of them fires on 99 charge, because it takes both halves');
const spent = { charge: 100, firedActive: true, condition: { id: 'onFull' } };
say(S.shouldFire(spent, EVENTS.nothing, T).fires === false,
  '   and an active that has already gone does not go twice');
say(S.SHIPPED.length === 6 && S.CONDITIONS.onRail.shipped === false,
  '   six ship and the seventh is held back, as the design\'s own margin allows: '
  + S.SHIPPED.join(', '));
say(S.categoryOf('nthContact') === 'contact' && S.categoryOf('closeRange') === 'position'
  && S.categoryOf('whenCracked') === 'state',
  '   and the Almanac reveals the category only: contact, position, state');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nDAMAGE FAILED'); process.exit(1); }
console.log('DAMAGE OK');
