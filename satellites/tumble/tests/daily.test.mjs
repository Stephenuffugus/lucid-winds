// DESIGN 15.10: same date -> identical Load on two devices (two separate processes here).
import { suite } from './lib.mjs';
import { spawnSync } from 'child_process';
import { dailyLoad } from '../src/loadgen.js';

const me = new URL(import.meta.url).pathname;
if (process.argv[2] === '--print') {
  const L = dailyLoad(process.argv[3], process.argv[4]);
  console.log(JSON.stringify({ seed: L.seed, tier: L.tier, socks: L.socks.map((s) => [s.seed, s.pair, s.odd, s.insideOut]) }));
  process.exit(0);
}
const { ok, done } = suite('daily');
const run = (date, mode) => spawnSync(process.execPath, [me, '--print', date, mode], { encoding: 'utf8' }).stdout.trim();
for (const mode of ['rush', 'laundry']) {
  const a = run('2026-09-17', mode), b = run('2026-09-17', mode);
  ok(a.length > 100 && a === b, `${mode}: two devices build the same Daily for 2026-09-17`);
}
const x = JSON.parse(run('2026-09-17', 'rush')), y = JSON.parse(run('2026-09-18', 'rush'));
ok(x.seed !== y.seed && JSON.stringify(x.socks) !== JSON.stringify(y.socks), 'the next day is a different Load');
ok(x.tier >= 3 && x.tier <= 6, `the Daily sits in the middle tiers (${x.tier})`);
const L = dailyLoad('2026-09-17', 'rush');
ok(L.pairs.length === 20 && L.odd.every((o) => !o.reunion) && L.pairs.every((p) => !p.hero), 'a Daily is a Regular Load with no personal Odd Bin or hero packs in it');
done();
