/**
 * The curve, walked from level 1 to the cap and past it.
 *
 *   node test/progression.mjs
 *
 * A level is the one number in the game a player watches go up and never expects
 * to see go down, so this gate is mostly about things NOT happening: XP is never
 * lost, a level is never lost, a bonus is never paid twice and never skipped, and
 * the cap does not quietly become a bin.
 *
 * Six things are asserted:
 *   1. THE CURVE IS THE DESIGN'S and it only ever goes up.
 *   2. LOSING PAYS. DESIGN 12: progression never requires keepsies, and a loss is
 *      worth 40, so a player who stakes nothing still climbs.
 *   3. ONE AWARD CAN CROSS SEVERAL LEVELS, and each crossed level pays its own
 *      bonus exactly once. Paying only the last level and paying one twice are
 *      the two ways this goes wrong.
 *   4. AT THE CAP THE XP IS KEPT. Raising the cap later must hand a player the
 *      levels they already earned rather than nothing.
 *   5. A LEVEL IS NEVER LOST across a thousand random awards.
 *   6. THE UNLOCK TABLE IS THE DESIGN'S, and it is asked rather than copied.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

/* a memory backed save, the way save.js falls back in Node */
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const T = JSON.parse(readFileSync(join(ROOT, 'src/data/tuning.json'), 'utf8'));
const SAVE = await import(join(ROOT, 'src/meta/save.js') + '?v=20260904b');
const P = await import(join(ROOT, 'src/meta/progression.js') + '?v=20260904b');

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* a wallet that only records, so a double payment is visible rather than merged */
const paid = [];
const econ = { earn(n, reason) { paid.push({ n, reason }); return n; } };
const reset = () => { SAVE.wipe(); paid.length = 0; };

/* ---- 1: the curve ---- */
reset();
const costs = [];
for (let l = 1; l <= 6; l++) costs.push(P.costOfLevel(l, T));
say(costs[0] === 120 && costs[1] === 240 && costs[2] === 360,
  '1. the curve is 120 times the level you are leaving: ' + costs.slice(0, 4).join(', '));
let rises = true;
for (let l = 2; l <= T.progression.levelCap; l++) {
  if (P.costOfLevel(l, T) <= P.costOfLevel(l - 1, T)) rises = false;
}
say(rises, '   and it only ever goes up, all the way to the cap of ' + T.progression.levelCap);
say(P.xpFor('win', T) === 100 && P.xpFor('loss', T) === 40 && P.xpFor('bossWin', T) === 300,
  '   and a match is worth what the design says: win ' + P.xpFor('win', T)
  + ', loss ' + P.xpFor('loss', T) + ', boss ' + P.xpFor('bossWin', T));

/* ---- 2: losing pays ---- */
reset();
const lost = P.awardMatch(false, T, econ);
say(lost.gained === 40, '2. losing pays 40 XP, because progression never requires keepsies: ' + lost.gained);
say(P.snapshot(T).level === 1 && P.snapshot(T).xp === 40,
  '   and it banks: level ' + P.snapshot(T).level + ', ' + P.snapshot(T).xp + ' XP in');
let n = 1;
while (P.snapshot(T).level === 1 && n < 20) { P.awardMatch(false, T, econ); n++; }
say(P.snapshot(T).level === 2, '   and three losses alone reach level 2: ' + n + ' losses');

/* ---- 3: one award, several levels, each paid once ---- */
reset();
const big = P.award(2000, 'a gate said so', T, econ);
say(big.levels.length >= 3, '3. two thousand XP crosses ' + big.levels.length + ' levels at once: '
  + big.levels.join(', '));
const wanted = big.levels.reduce((a, lv) => a + lv * T.progression.levelUpSunbeams, 0);
say(big.paid === wanted, '   and the bonus is level times 20 for EVERY level crossed: '
  + big.paid + ', wanted ' + wanted);
const perLevel = {};
for (const p of paid) perLevel[p.reason] = (perLevel[p.reason] || 0) + 1;
const twice = Object.keys(perLevel).filter(k => perLevel[k] > 1);
say(twice.length === 0, '   and no level was paid twice: ' + (twice.join(', ') || 'none was'));
const spent = big.levels.reduce((a, lv) => a + P.costOfLevel(lv - 1, T), 0);
say(P.snapshot(T).xp === 2000 - spent,
  '   and the leftover XP is exact: ' + P.snapshot(T).xp + ' of 2000 after ' + spent + ' spent');

/* ---- 4: the cap keeps the XP ---- */
reset();
P.award(500000, 'straight to the cap', T, econ);
const atCap = P.snapshot(T);
say(atCap.level === T.progression.levelCap, '4. the cap holds at ' + atCap.level);
const before = P.snapshot(T).xp;
P.awardMatch(true, T, econ);
const after = P.snapshot(T).xp;
say(after === before + 100,
  '   and XP at the cap is KEPT rather than dropped, so raising the cap later pays it back: '
  + before + ' became ' + after);
say(P.snapshot(T).level === T.progression.levelCap, '   and the level did not move past the cap');

/* ---- 5: a level is never lost ---- */
reset();
let low = 1, seen = 1;
for (let i = 0; i < 1000; i++) {
  P.award(1 + ((i * 37) % 400), 'noise', T, econ);
  const lv = P.snapshot(T).level;
  if (lv < seen) low = 0;
  seen = lv;
}
say(low === 1, '5. across a thousand awards a level is never lost, ending at ' + seen);

/* ---- 6: the unlock table ---- */
reset();
say(P.unlockLevel('pouches', T) === 2 && P.unlockLevel('arena', T) === 3
  && P.unlockLevel('practiceRing', T) === 4 && P.unlockLevel('passAndPlay', T) === 5,
  '6. the unlocks are the design\'s: pouches ' + P.unlockLevel('pouches', T)
  + ', arena ' + P.unlockLevel('arena', T) + ', practice ' + P.unlockLevel('practiceRing', T)
  + ', pass and play ' + P.unlockLevel('passAndPlay', T));
say(P.unlocked('ringer', T) === true && P.unlocked('pouches', T) === false,
  '   a fresh player has Ringer and does not have pouches');
P.award(200, 'to level two', T, econ);
say(P.unlocked('pouches', T) === true, '   and level 2 opens them: level ' + P.snapshot(T).level);
say(P.unlocked('somethingNobodyGated', T) === true,
  '   and a key with no gate is open, rather than closed by accident');
say(P.unlocksAt(9, T, { all: true }).join(',').indexOf('leagueII') >= 0,
  '   and the level up card can ask what opens at 9: '
  + P.unlocksAt(9, T, { all: true }).join(', '));
say(P.unlocksAt(2, T).join(',') === 'pouches',
  '   and today the only unlock that exists to announce is the pouches at 2: ['
  + P.unlocksAt(2, T).join(', ') + ']');
/* ⛔ the card announces only what SHIPPED. Human keepsies is a Phase 4 unlock and
   there is no online in this build, so a level up that names it sends the player
   looking for a screen that does not exist. */
say(P.unlocksAt(5, T, { all: true }).indexOf('humanKeepsies') >= 0,
  '   the design\'s table still holds human keepsies at 5: ' + P.unlocksAt(5, T, { all: true }).join(', '));
say(P.unlocksAt(5, T).indexOf('humanKeepsies') < 0,
  '   and the card does NOT announce it, because it has not shipped: ['
  + P.unlocksAt(5, T).join(', ') + ']');
for (const k of T.progression.announce) {
  if (T.progression.unlocks[k] == null) say(false, '   announce names a key with no unlock level: ' + k);
}
say(T.progression.announce.every(k => T.progression.unlocks[k] != null),
  '   and every announced key is really in the unlock table');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nPROGRESSION FAILED'); process.exit(1); }
console.log('PROGRESSION OK');
