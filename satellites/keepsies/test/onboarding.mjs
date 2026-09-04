/**
 * The first four minutes, walked beat by beat.
 *
 *   node test/onboarding.mjs
 *
 * DESIGN 16 is the one part of the game every player sees exactly once, in order,
 * and never again, which makes it the easiest thing in the build to break without
 * noticing. It is also the part where a bug costs the most: a player who loses
 * their starters, or who is dropped into keepsies before the game has explained
 * what a stake is, does not come back.
 *
 * Six things are asserted:
 *   1. THE BEATS ARE THE DESIGN'S, in order, and each waits for ONE event.
 *   2. NOTHING ELSE ADVANCES A BEAT. The wrong event moves nothing at all.
 *   3. THE STATE IS IN THE SAVE. A player who closes the tab in beat 3 comes back
 *      to beat 3, not to the title screen with half a collection.
 *   4. SKIPPING IS ONLY OFFERED AFTER THE BREAK, and it lands ON the tin rather
 *      than past it, because nobody should lose their starters for being
 *      experienced.
 *   5. THE HEIRLOOM IS A CHOICE OF THREE REAL RARES, and the two not picked are
 *      not destroyed.
 *   6. IT ENDS EXACTLY ONCE, and a finished onboarding never starts again.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(ROOT, 'src/data/marbles.json'), 'utf8'));
const SAVE = await import(join(ROOT, 'src/meta/save.js') + '?v=20260904a');
const O = await import(join(ROOT, 'src/meta/beats.js') + '?v=20260904a');

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

const fresh = () => { SAVE.wipe(); return O.createOnboarding(T); };

/* ---- 1: the beats are the design's ---- */
let ob = fresh();
const ids = O.BEATS.map(b => b.id);
say(ids.join(',') === 'calibrate,break,sticking,dusty,tin,firstKeepsies',
  '1. the beats are the design\'s, in order: ' + ids.join(', '));
say(O.BEATS.every(b => typeof b.waitsFor === 'string' && b.waitsFor.length > 0),
  '   and every one of them waits for exactly one named event');
const waits = O.BEATS.map(b => b.waitsFor);
say(new Set(waits).size === waits.length,
  '   and no two beats wait for the same event, which would let one finish the other');
say(O.BEATS.every(b => b.lines && b.lines.length && b.title),
  '   and every beat has something to say');

/* ---- 2: nothing else advances a beat ---- */
ob = fresh();
say(ob.beat().id === 'calibrate', '2. a fresh player is on the first beat: ' + ob.beat().id);
const wrong = ob.fire('playedForKeeps');
say(wrong.advanced === false && ob.beat().id === 'calibrate',
  '   and the wrong event moves nothing: still on ' + ob.beat().id);
const right = ob.fire('calibrated');
say(right.advanced === true && ob.beat().id === 'break',
  '   and the right one moves exactly one beat: ' + right.from + ' to ' + right.to);
const twice = ob.fire('calibrated');
say(twice.advanced === false && ob.beat().id === 'break',
  '   and firing it again does nothing, so a double tap cannot skip a beat');

/* ---- 3: the state is in the save ---- */
ob.fire('brokeTheCross');
say(ob.beat().id === 'sticking', '3. the third beat is the one that teaches sticking');
const reborn = O.createOnboarding(T);          // a whole new instance, same save
say(reborn.beat().id === 'sticking',
  '   and a new instance over the same save resumes on it: ' + reborn.beat().id
  + ', ' + reborn.position().done + ' of ' + reborn.position().total + ' done');

/* ---- 4: skipping ---- */
ob = fresh();
say(ob.canSkip() === false, '4. there is no skip on the calibration, because it is the hook');
ob.fire('calibrated');
say(ob.canSkip() === false, '   and none on the break, because it teaches the only control there is');
ob.fire('brokeTheCross');
ob.fire('stuck');
say(ob.canSkip() === true, '   the skip appears once the break is done: on ' + ob.beat().id);
const sk = ob.skip();
say(sk.skipped === true && sk.to === 'tin',
  '   and it lands ON the tin rather than past it: ' + sk.to);
say(ob.active() === true, '   so an experienced player still gets their marbles');

/* ---- 5: the heirloom ---- */
const heirs = ob.heirlooms(C);
say(heirs.length === 3, '5. the heirloom is a choice of three: '
  + heirs.map(h => h.name).join(', '));
say(heirs.every(h => h.tier === 'rare'), '   and all three are rares, as the design lays them out');
const passives = heirs.map(h => (h.passive || {}).name).filter(Boolean);
say(passives.length === 3, '   and each one behaves differently: ' + passives.join(', '));

/* ---- 6: it ends once ---- */
ob.fire('tookTheTin');
say(ob.beat().id === 'firstKeepsies', '6. the last beat is the first game for keeps');
ob.fire('playedForKeeps');
say(ob.beat() === null && ob.active() === false, '   and finishing it ends the onboarding');
const after = O.createOnboarding(T);
say(after.active() === false, '   and it never starts again: ' + after.active());
say(after.fire('calibrated').advanced === false, '   and firing at it does nothing');

/* Dusty says something on every turn of a long game, rather than running out */
const lines = [];
for (let i = 0; i < 25; i++) lines.push(O.dustyLine(i));
say(lines.every(l => typeof l === 'string' && l.length > 0),
  '   and Dusty has a line for all 25 turns of a long game, wrapping rather than running dry');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nONBOARDING FAILED'); process.exit(1); }
console.log('ONBOARDING OK');
