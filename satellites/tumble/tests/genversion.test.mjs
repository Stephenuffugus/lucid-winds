// THE GENERATOR VERSION (DESIGN-T2 5.1): "a seed minted by this build carries a version mark in its string (the
// smallest change to encode/decode that old seeds cannot collide with); a seed WITHOUT the mark decodes exactly as
// today, modulo ten and all. tests/golden-seeds passes unchanged. The Daily stores the generator version with its date."
//
// The mark is one more mutation, `~g.2`. No seed has ever carried a `g` key, so none can collide, and an older client
// that meets one ignores a key it does not know rather than failing. The golden seeds hold the "exactly as today".
// This file holds the rest, and pins every past Daily so that turning version 2 on (5.2) cannot change a Load that
// somebody already played.
//   node tests/genversion.test.mjs --update-dailies    records tests/golden-dailies.json (only for past dates)
import { suite } from './lib.mjs';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { decode, mutate, specKey, seedFrom, withGen, MINT_GEN, GEN_FAMILIES, FAMILIES, bytesHash } from '../engine/sockgen.js';
import { generateLoad, dailyLoad, dailyGen, DAILY_GEN2_FROM } from '../src/loadgen.js';
import { freshSave, validate } from '../src/save.js';
import { sha256 } from '../engine/sha256.js';

const { ok, done } = suite('genversion');
const hex = seedFrom('genversion-test');

// ---------- the mark ----------
{
  const plain = decode(hex), marked = decode(hex + '~g.2');
  ok(plain.gen === 1 && marked.gen === 2, `an unmarked seed is version 1 and a marked one version 2 (${plain.gen}, ${marked.gen})`);
  ok(specKey(marked) === specKey(plain) + '|g2' && !specKey(plain).includes('|g'), 'a marked seed says so in its key; an unmarked key is the key it always was');
  ok(decode(hex + '~g.9').gen === 1, 'a version this build does not know decodes as version 1 rather than failing');
  ok(familiesOk(), `version 2 lists version 1's families first and in the same order (${GEN_FAMILIES[2].length} families)`);
  const d = mutate(hex + '~g.2', 'palette', 17);
  ok(decode(d).gen === 2 && decode(d).palette === 17 && d.includes('~g.2'), `a decoy keeps its base's mark (${d.slice(64)})`);
  ok(withGen(hex, 1) === hex && withGen(hex, 2) === hex + '~g.2', 'withGen marks version 2 and leaves version 1 alone');
}
function familiesOk() { return FAMILIES.every((f, i) => GEN_FAMILIES[2][i] === f) && GEN_FAMILIES[1] === FAMILIES; }

// ---------- what this build mints ----------
{
  const seeds = (L) => [...L.pairs.map((p) => p.seed), ...L.odd.map((o) => o.seed)].filter((s) => !s.startsWith('hero:'));
  const now = generateLoad({ seed: 'gv-now', mode: 'laundry', size: 'heavy', tier: 7 });
  ok(MINT_GEN === 1 && seeds(now).every((s) => !s.includes('~g.')), `version 2 has no families of its own yet, so nothing is minted marked (MINT_GEN ${MINT_GEN}, ${seeds(now).length} seeds)`);
  const two = generateLoad({ seed: 'gv-two', mode: 'laundry', size: 'heavy', tier: 7, gen: 2 });
  ok(seeds(two).length > 0 && seeds(two).every((s) => s.includes('~g.2') && decode(s).gen === 2), `a Load asked for version 2 marks every base, decoy and odd sock (${seeds(two).length})`);
  ok(two.pairs.filter((p) => p.decoyOf !== null).length > 0, 'and it has decoys to prove it on');
}

// ---------- the Daily keeps its version with its date, and a past Daily never changes ----------
{
  ok(DAILY_GEN2_FROM === null ? dailyGen('2099-01-01') === 1 : dailyGen(DAILY_GEN2_FROM) === 2, `the Daily's version comes from its date (${DAILY_GEN2_FROM || 'version 1 for every date until 5.2'})`);
  const L = dailyLoad('2026-09-23', 'rush');
  ok(L.gen === dailyGen('2026-09-23'), 'a Daily Load says which version built it');
  const FILE = new URL('./golden-dailies.json', import.meta.url).pathname;
  const dates = [];
  for (let d = 1; d <= 23; d++) dates.push(`2026-09-${String(d).padStart(2, '0')}`);
  const hashOf = (date, mode) => sha256(JSON.stringify(dailyLoad(date, mode).pairs)).slice(0, 16);
  const now = {};
  for (const date of dates) for (const mode of ['laundry', 'rush']) now[date + '|' + mode] = hashOf(date, mode);
  if (process.argv.includes('--update-dailies') || !existsSync(FILE)) {
    writeFileSync(FILE, JSON.stringify(now, null, 1) + '\n');
    ok(true, `recorded ${Object.keys(now).length} past Dailies in tests/golden-dailies.json`);
  } else {
    const was = JSON.parse(readFileSync(FILE, 'utf8'));
    const moved = Object.keys(was).filter((k) => was[k] !== now[k]);
    ok(!moved.length && Object.keys(was).length === 46, `every Daily from 1 to 23 September is the Load it was (${moved.length ? 'MOVED: ' + moved.join(', ') : '46 of 46'})`);
  }
}

// ---------- the save keeps marked seeds and the Daily's version ----------
{
  const s = freshSave(0);
  s.drawer.push({ sockSeed: hex + '~g.2', foundAt: 1, count: 1, odd: false });
  s.oddBin.push({ sockSeed: hex + '~g.2~palette.3', waitingSince: 1, loadsWaited: 0 });
  s.daily = { ...s.daily, date: '2026-09-23', gen: 2 };
  s.dailyHistory = [{ date: '2026-09-23', gen: 2, score: 10, rare: [] }, { date: '2026-09-22', score: 5, rare: [] }];
  const v = validate(JSON.parse(JSON.stringify(s)));
  ok(v.drawer.some((d) => d.sockSeed === hex + '~g.2') && v.oddBin.some((d) => d.sockSeed.includes('~g.2')), 'a marked sock survives the save validator in the Drawer and the Odd Bin');
  ok(v.daily.gen === 2 && v.dailyHistory[0].gen === 2 && v.dailyHistory[1].gen === 1, 'the Daily keeps its version, and one saved before versions existed is version 1');
  ok(validate(JSON.parse(JSON.stringify({ ...freshSave(0), daily: { date: '2026-09-01', gen: 'x' } }))).daily.gen === 1, 'a nonsense version is read as 1');
}

done();
