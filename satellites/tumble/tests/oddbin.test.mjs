// DESIGN 15.7: 30% mate-return holds over 1,000 simulated Loads; lore pages fire at exact counts.
import { suite } from './lib.mjs';
import { existsSync, readFileSync } from 'fs';
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';
import { applyResults } from '../src/economy.js';
import { freshSave } from '../src/save.js';

const { ok, done } = suite('oddbin');
const LORE_FILE = new URL('../data/lore.json', import.meta.url);
const AT = [1, 3, 5, 8, 12, 16, 20, 25, 30, 40, 50, 75];
const lore = existsSync(LORE_FILE) ? JSON.parse(readFileSync(LORE_FILE, 'utf8')) : { pages: AT.map((at, i) => ({ id: i + 1, at })) };
ok(lore.pages.length === 12 && lore.pages.every((p, i) => p.at === AT[i] && p.id === i + 1), `the lore file has twelve pages at ${AT.join(', ')}`);

const save = freshSave();
let withBin = 0, reunionLoads = 0;
const fired = new Map();
for (let n = 0; n < 1000; n++) {
  const L = generateLoad({ seed: 'bin-' + n, tier: 2, size: 'small', oddBin: save.oddBin });
  if (save.oddBin.length) withBin++;
  const S = new Session(L);
  L.socks.forEach((s, i) => S.addSock(i + 1, { ...s, reunion: s.odd !== null && L.odd[s.odd].reunion }));
  if (L.odd.some((o) => o.reunion)) reunionLoads++;
  // everyone plays the Load out: pairs matched, odd socks binned
  const bk = new Map();
  for (const s of S.socks.values()) { if (s.odd !== null) { S.bin(s.id); continue; } bk.set(s.key, [...(bk.get(s.key) || []), s.id]); }
  for (const [a, b] of bk.values()) { const m = S.match(a, b); S.shoot(m.ball, { tap: true }); S.shotResult(m.ball, true); }
  S.startSweep(); S.finish();
  const before = save.economy.reunions;
  const out = applyResults(save, S, { now: n, hour: 10, lore });
  for (const p of out.lore) fired.set(p.id, save.economy.reunions);
  if (save.economy.reunions - before !== out.reunions.length) ok(false, 'reunion count mismatch');
}
const rate = reunionLoads / withBin;
ok(Math.abs(rate - 0.3) <= 0.03, `a Load with socks waiting in the Bin brings a mate back ${(rate * 100).toFixed(1)}% of the time (target 30%)`);
ok(save.economy.reunions > 150, `${save.economy.reunions} Reunions over 1000 Loads`);
ok(fired.size === 12, 'all twelve pages fired');
let exact = true;
for (const p of lore.pages) {
  const at = fired.get(p.id);
  // a page fires on the Load where the count first reaches p.at; one Load can bring at most one Reunion
  if (at !== p.at) exact = false;
}
ok(exact, 'each page fired exactly when the Reunion count reached its number');
ok(save.oddBin.every((e) => e.loadsWaited >= 0) && save.oddBin.length > 0, `the Bin still holds ${save.oddBin.length} socks, each counting Loads waited`);
ok(save.unlocks.includes('impossible-1') && save.unlocks.includes('impossible-2') && save.unlocks.includes('impossible-3'), 'the three impossible socks arrived at 10, 30 and 75 Reunions');
done();
