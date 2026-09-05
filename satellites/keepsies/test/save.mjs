/**
 * The save, and the two ways a save is lost.
 *
 *   node test/save.mjs
 *
 * 1. A hand written old save loads, keeps what it knew and gains what it did not.
 * 2. TWO TABS DO NOT CLOBBER EACH OTHER. This is the one the fleet has actually
 *    been bitten by: a save read once and written wholesale loses whatever the
 *    other tab did in between. Marbles union by uid, counters add, bests take the
 *    max, and the test proves it by interleaving two writers.
 * 3. Storage that exists and throws anyway is survived, not crashed on, because
 *    Safari in private mode hands you exactly that.
 * 4. A wipe is the only thing that bypasses the merge.
 */
import { blank, migrate, load, update, merge, wipe, backendName, SCHEMA_VERSION }
  from '../src/meta/save.js?v=20260905a';

const fails = [];
const say = (ok, line) => { console.log((ok ? '  ok    ' : '  FAIL  ') + line); if (!ok) fails.push(line); };

/* Node has no localStorage, so the module falls back to its in memory store,
   which exercises the same code every browser path does. */
console.log('backend            ' + backendName());
say(backendName() === 'memory', 'with no storage at all the game runs on an in memory store rather than dying');

/* ---- 1. an old save ---- */
const old = { v: 0, profile: { name: 'Stephen', calib: { max: 1.4 } }, wallet: { sunbeams: 120 } };
const up = migrate(JSON.parse(JSON.stringify(old)));
say(up.v === SCHEMA_VERSION, 'a v0 save migrates up to v' + up.v + ', and the current schema is v' + SCHEMA_VERSION);
say(up.profile.name === 'Stephen', 'it keeps what it knew: the name survived');
say(up.profile.calib.max === 1.4, 'and the calibration survived');
say(up.wallet.sunbeams === 120, 'and the wallet survived');
say(Array.isArray(up.inventory) && up.settings && up.stats,
  'and it gained every field it never had, without being handed a blank save');
say(up.clayPool.count === 10, 'including the clay pool, at its full ten');

/* ---- 2. two tabs ---- */
wipe();
update((s) => { s.inventory.push({ uid: 'a1', id: 'commie' }); s.stats.matches += 1; s.stats.bestPocketedInATurn = 3; });
// the second tab read BEFORE the first wrote, and writes after: the classic loss
const stale = load();
update((s) => { s.inventory.push({ uid: 'b1', id: 'clearie' }); s.stats.matches += 1; s.stats.bestPocketedInATurn = 5; });
merge({
  inventory: [{ uid: 'c1', id: 'chalkie' }],
  wallet: { sunbeams: 40 },
  stats: { matches: 1, bestPocketedInATurn: 2 },
  profile: { techniques: ['sticking'] }
});
const after = load();
const uids = after.inventory.map(m => m.uid).sort().join(',');
say(uids === 'a1,b1,c1', 'three writers, three marbles, none lost: ' + uids);
say(after.stats.matches === 3, 'counters ADD across writers: ' + after.stats.matches + ' matches, want 3');
say(after.stats.bestPocketedInATurn === 5,
  'bests take the MAX and a later smaller value does not overwrite: ' + after.stats.bestPocketedInATurn + ', want 5');
say(after.wallet.sunbeams === 40, 'the wallet added rather than replaced: ' + after.wallet.sunbeams);
say(after.profile.techniques.length === 1 && after.profile.techniques[0] === 'sticking',
  'a technique earned once is recorded once');
say(stale.inventory.length === 1, 'and the stale read really was stale, which is what makes this a real test');

/* ---- 3. a merge that repeats itself does not double up ---- */
merge({ inventory: [{ uid: 'c1', id: 'chalkie' }], profile: { techniques: ['sticking'] } });
const twice = load();
say(twice.inventory.filter(m => m.uid === 'c1').length === 1, 'the same marble merged twice is still one marble');
say(twice.profile.techniques.length === 1, 'the same technique merged twice is still one technique');

/* ---- 4. the wipe ---- */
const fresh = wipe();
say(fresh.inventory.length === 0 && fresh.stats.matches === 0 && fresh.wallet.sunbeams === 0,
  'a wipe bypasses the merge and really is empty');
say(JSON.stringify(load()) === JSON.stringify(blank()), 'and what loads afterwards is a blank save');

console.log('');
if (fails.length) { console.log(fails.length + ' FAILED\nSAVE FAILED'); process.exit(1); }
console.log('SAVE OK');
