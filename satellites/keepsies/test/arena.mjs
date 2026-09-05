/**
 * The Arena referee, played through.
 *
 *   node test/arena.mjs
 *
 * DESIGN 9 gives the mode two win textures and they are not the same thing: a
 * shattered marble is gone for the match, a rung out one comes back keeping its
 * integrity. Everything else in the mode is built on that difference, so most of
 * this gate is about it.
 *
 * Seven things are asserted:
 *   1. THE ARENA IS A DEVELOPING SITUATION. Integrity, charge and hazard counters
 *      survive the turn passing, because a hazard indicator that promises "fires
 *      in 1 turn" has to be telling the truth.
 *   2. ONE POSITIONING ACT PER TURN, and a swap really costs its momentum.
 *   3. RING OUT IS NOT A LOSS. All three of your marbles rung out and you are
 *      still playing; all three shattered and you are not.
 *   4. YOUR OWN MARBLES DO NOT DAMAGE EACH OTHER.
 *   5. AN ACTIVE FIRES ONCE, spends the meter, and is read AFTER the damage, so a
 *      "when cracked" condition can answer the hit that cracked it.
 *   6. VENGEANCE IS A PLAN: a shattered bagmate is a fact the survivors can read.
 *   7. THE MATCH ENDS EXACTLY ONCE, with the right winner.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import * as A from '../src/core/rules-arena.js?v=20260905a';
import * as D from '../src/core/damage.js?v=20260905a';
import { bodySpec } from '../src/core/marbleBody.js?v=20260905a';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(ROOT, 'src/data/marbles.json'), 'utf8'));

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const entry = (id) => C.marbles.find(m => m.id === id);
function bagOf(ids, who) {
  return ids.map((id, i) => {
    const e = entry(id);
    const m = D.freshMarble(Object.assign({}, e, { uid: who + '-' + i }), bodySpec(e, T), T);
    return m;
  });
}
function match(aIds, bIds) {
  return A.createMatch({
    tuning: T, arena: 'ring',
    players: [
      { name: 'You', bag: bagOf(aIds, 'a') },
      { name: 'Dusty Coyle', bag: bagOf(bIds, 'b') }
    ]
  });
}
const hit = (att, def, rel) => ({ contacts: [{ attacker: att, defender: def, relSpeed: rel }] });

/* ---- 1: it develops ---- */
let M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
say(M.players[0].active === 'a-0' && M.players[1].active === 'b-0',
  '1. both sides roll a marble in before anybody shoots');
A.fireShot(M);
A.resolveShot(M, hit('a-0', 'b-0', 4.0));
const hurt = A.marbleOf(M.players[1], 'b-0');
say(hurt.integrity < 100, 'a hit takes integrity off: b-0 is at ' + hurt.integrity.toFixed(1));
say(M.turn === 1, 'and the turn passed');
A.fireShot(M);
A.resolveShot(M, { contacts: [] });
say(A.marbleOf(M.players[1], 'b-0').integrity === hurt.integrity,
  '   the damage is still there a turn later, because the arena is a developing situation');
/* ⛔ a hazard indicator that promises "fires in 1 turn" has to be telling the
   truth, so the count is asserted as a SEQUENCE rather than as one number */
const cycle = [];
for (let i = 0; i < 5; i++) {
  cycle.push(A.hazardIn(M, 2));
  A.fireShot(M); A.resolveShot(M, { contacts: [] });
  A.fireShot(M); A.resolveShot(M, { contacts: [] });
}
say(cycle.join(',') === '1,2,1,2,1' || cycle.join(',') === '2,1,2,1,2',
  '   and the hazard cycle counts TURNS rather than seconds, and never skips: ' + cycle.join(', '));

/* ---- 2: one act a turn ---- */
M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
let r = A.act(M, A.ACT.SWAP, 'a-1');
say(r.ok === true && M.players[0].active === 'a-1', '2. a swap rolls a benched marble in: ' + M.players[0].active);
r = A.act(M, A.ACT.REPERCH, 1);
say(r.ok === false, '   and a second act in the same turn is refused: ' + r.reason);
const shot = A.fireShot(M);
say(shot.noMomentum === true,
  '   and the marble that just entered shoots with no attack momentum, which IS the cost');
A.resolveShot(M, { contacts: [] });
r = A.act(M, A.ACT.SWAP, 'a-0');
say(r.ok === false, '   and the other player cannot move your marbles: ' + r.reason);

/* ---- 3: ring out is not a loss ---- */
M = match(['clearie', 'peppermint', 'bearing'], ['old_ironsides', 'bearing', 'clearie']);
A.marbleOf(M.players[0], 'a-0').integrity = 61;
A.fireShot(M);
A.resolveShot(M, { contacts: [], ringOuts: ['a-0'] });
const rung = A.marbleOf(M.players[0], 'a-0');
say(rung.benched === true && rung.integrity === 61,
  '3. a rung out marble goes to the rack KEEPING its integrity: ' + rung.integrity);
say(M.players[0].active && M.players[0].active !== 'a-0',
  '   and a fresh one enters immediately: ' + M.players[0].active);
say(M.over === false, '   and nobody has lost anything permanent');
say(A.legalMarbles(M.players[0]).length === 3,
  '   all three are still legal to play: ' + A.legalMarbles(M.players[0]).length);
/* ⛔ the rule stated at its limit: ALL THREE rung out, nothing shattered, and the
   match is still going. This is the difference between the two win textures and
   the gate says so with the strongest case rather than the mildest. */
for (const m of M.players[0].bag) { m.benched = true; m.integrity = 20; }
M.players[0].active = null;
A.checkOver(M);
say(M.over === false,
  '   and with ALL THREE rung out and none shattered the match is STILL going, '
  + 'which is the whole difference between the two ways to win');
A.endTurn(M);
say(M.players[0].active !== null,
  '   because one of them simply rolls back in: ' + M.players[0].active);

/* ---- 4: friendly fire does nothing ---- */
M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
A.fireShot(M);
A.resolveShot(M, hit('a-0', 'a-1', 6.0));
say(A.marbleOf(M.players[0], 'a-1').integrity === 100,
  '4. your own marbles do not damage each other: a-1 is at '
  + A.marbleOf(M.players[0], 'a-1').integrity);

/* ---- 5: an active fires once, after the damage ---- */
M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
const def = A.marbleOf(M.players[1], 'b-0');
def.condition = { id: 'whenCracked', params: {} };
def.charge = 100;
def.integrity = 42;                                  // chipped, one hit from cracked
A.fireShot(M);
let out = A.resolveShot(M, hit('a-0', 'b-0', 5.0));
const fired = out.events.filter(e => e.kind === 'active');
say(fired.length === 1 && fired[0].uid === 'b-0',
  '5. the active is read AFTER the damage, so "when it cracks" answers the hit that cracked it: '
  + (fired[0] || {}).why);
say(def.charge === 0 && def.firedActive === true, '   it spends the meter and is marked as gone');
def.charge = 100;
A.fireShot(M);
out = A.resolveShot(M, { contacts: [] });
say(out.events.filter(e => e.kind === 'active').length === 0,
  '   and a full meter does not fire it a second time');

/* ---- 6: vengeance ---- */
M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
const avenger = A.marbleOf(M.players[1], 'b-1');
avenger.condition = { id: 'vengeance', params: {} };
avenger.charge = 100;
A.marbleOf(M.players[1], 'b-0').integrity = 3;
A.fireShot(M);
A.resolveShot(M, hit('a-0', 'b-0', 6.0));
say(A.marbleOf(M.players[1], 'b-0').shattered === true, '6. a bagmate shatters');
say(avenger.bagmateShattered === true,
  '   and the survivors can read it, which is what makes vengeance a plan rather than a surprise');

/* ---- 7: the match ends once ---- */
M = match(['old_ironsides', 'bearing', 'clearie'], ['clearie', 'peppermint', 'bearing']);
let guard = 0;
while (!M.over && guard++ < 40) {
  const target = A.legalMarbles(M.players[1])[0];
  if (target) {
    target.integrity = 1;
    if (M.players[1].active !== target.uid) M.players[1].active = target.uid;
  }
  A.fireShot(M);
  A.resolveShot(M, hit(M.players[0].active, target ? target.uid : 'b-0', 8.0));
  if (M.over) break;
  A.fireShot(M);
  A.resolveShot(M, { contacts: [] });
}
say(M.over === true && M.winner === 0,
  '7. shattering all three ends it, with the right winner: player ' + M.winner
  + ' after ' + M.turnNumber + ' turns');
say(A.legalMarbles(M.players[1]).length === 0,
  '   and the loser has no legal marble left: ' + A.legalMarbles(M.players[1]).length);
let threw = false;
try { A.fireShot(M); } catch (e) { threw = true; }
say(threw, '   and a shot after the end throws rather than quietly playing on');
say(M.log.filter(e => e.kind === 'over').length === 1,
  '   and the match ended exactly once: ' + M.log.filter(e => e.kind === 'over').length);

const s = A.summary(M);
say(s.players[1].shattered === 3 && s.players[0].left === 3,
  '   the summary reads: ' + s.players[0].name + ' kept ' + s.players[0].left
  + ', ' + s.players[1].name + ' lost ' + s.players[1].shattered);

/* ---- 8: the mode on a real board, headless ---- */
console.log('');
const P = await import('../src/core/physics.js?v=20260905a');
await P.initPhysics();
const { createArena } = await import('../src/game/arena.js?v=20260905a');
const live = createArena({
  tuning: T, catalog: C, seed: 4242, arena: 'ring',
  players: [
    { name: 'A', ai: 'sharp', bag: ['old_ironsides', 'bearing', 'clearie'] },
    { name: 'B', ai: 'sharp', bag: ['clearie', 'peppermint', 'bearing'] }
  ]
});
say(live.bodies.size === 2,
  '8. the mode puts exactly the two ACTIVE marbles on the floor: ' + live.bodies.size
  + ' of six, because a benched marble is on a rack and cannot be hit');
let shots = 0, touched = 0, moved = 0;
for (let i = 0; i < 24 && !live.match.over; i++) {
  const p = live.match.turn;
  const before = live.activePos(p);
  const ringOutsBefore = live.match.log.filter(e => e.kind === 'ringout').length;
  live.aiTurn();
  live.settle();
  shots++;
  if (live.state.contacts.length) touched++;
  const after = live.activePos(p) || { x: 99, z: 99 };
  const rangOut = live.match.log.filter(e => e.kind === 'ringout').length > ringOutsBefore;
  /* ⛔ A RING OUT IS ALSO "IT WENT SOMEWHERE", and it is the case that hides the
     bug: a marble that leaves the ring is despawned and re enters at the SAME
     rack position, so its coordinates are identical to a marble that never moved
     at all. Counting only the coordinates would let a dead settle loop through on
     every ring out. */
  if (rangOut || (before && Math.abs(after.x - before.x) + Math.abs(after.z - before.z) > 0.01)) moved++;
}
say(moved === shots,
  '   EVERY shot moves its marble or rings it out: ' + moved + ' of ' + shots
  + '. ⛔ This is the assertion that catches a settle loop whose step count is NaN, '
  + 'which fired 720 shots without turning the world over once');
say(touched > 0,
  '   and the AI connects: ' + touched + ' of ' + shots + ' shots touched an enemy marble');
let conserved = true;
for (const pl of live.match.players) {
  const uids = pl.bag.map(m => m.uid);
  if (new Set(uids).size !== 3) conserved = false;
  for (const m of pl.bag) if (m.integrity < 0 || m.integrity > 100) conserved = false;
}
say(conserved,
  '   and after ' + shots + ' shots every marble is still exactly one marble with a legal integrity');
say(live.match.players.every(pl => pl.active === null || pl.bag.some(m => m.uid === pl.active)),
  '   and nobody is holding a marble that is not in their bag');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nARENA FAILED'); process.exit(1); }
console.log('ARENA OK');
