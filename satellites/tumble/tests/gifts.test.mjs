// TIER GIFTS (Stephen, 23 Sep 2026): "when youve done 10 loads and unlock the larger load you should unlock one hero
// pack for free and it should do that each tier. it should also unlock a song each tier too." The tiers are the three
// Load size pegs on the Clothesline (Regular, Heavy, Mountain: data/clothesline.json says 5, 20 and 50 Loads). With
// each peg comes the next hero pack she does not own and the next song she does not own, in catalogue order, free.
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { applyResults, tierGifts } from '../src/economy.js';
import { freshSave } from '../src/save.js';
import { generateLoad } from '../src/loadgen.js';
import { Session } from '../src/session.js';
import { songs } from '../src/radio.js';

const { ok, done } = suite('gifts');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const clothesline = read('clothesline.json'), unlocks = read('unlocks.json'), heroes = read('hero-socks.json'), finds = read('finds.json'), lore = read('lore.json');
const packs = unlocks.items.filter((i) => i.cat === 'pack' && !i.start);
const songList = songs(unlocks.items);

// a Small Load played to the end: every pair balled and basketed, every odd sock binned
function played(seed) {
  const L = generateLoad({ seed, tier: 0, size: 'small', mode: 'laundry' });
  const S = new Session(L);
  L.socks.forEach((s, i) => S.addSock(i + 1, s));
  S.startClock();
  while (true) {
    const byKey = new Map();
    for (const s of S.socks.values()) if (s.state === 'table' && s.pair !== null && s.pair !== undefined) byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
    const pair = [...byKey.values()].find((v) => v.length === 2);
    if (!pair) break;
    const r = S.match(pair[0], pair[1]);
    S.shoot(r.ball, { tap: true });
    S.shotResult(r.ball, true);
  }
  for (const s of S.socks.values()) if (s.state === 'table') S.bin(s.id);
  S.startSweep();
  return S;
}
const ctx = { now: 1, hour: 12, clothesline, lore, heroes: heroes.heroes, unlocks, finds };

// 1. the fifth Load hangs Regular load and brings the first pack and the first song, free
{
  const s = freshSave();
  s.stats.loads = 4;
  const lintBefore = s.economy.lint;
  const out = applyResults(s, played('gift-5'), ctx);
  ok(out.pegs.some((p) => p.id === 'regular-load'), 'the fifth Load hangs Regular load');
  ok(out.gifts && out.gifts.length === 1 && out.gifts[0].peg === 'regular-load', `and one gift comes with it (${JSON.stringify((out.gifts || []).map((g) => g.peg))})`);
  const g = out.gifts[0];
  ok(g.pack && g.pack.id === packs[0].id && s.unlocks.includes(packs[0].id), `the first pack she does not own is hers: ${g.pack && g.pack.name}`);
  ok(g.song && g.song.id === songList[0].id && s.unlocks.includes(songList[0].id), `and the first song she does not own: ${g.song && g.song.name}`);
  ok(s.economy.lint >= lintBefore, 'nothing was paid');
  ok(s.packBought && s.packBought[packs[0].look.pack] === s.stats.loads, 'the gift pack has first call on the next ten Loads, like a bought one');
  ok(s.equipped.radio === songList[0].id, 'a radio that had never played starts on the gift song');
  ok(Array.isArray(s.tierGifts) && s.tierGifts.includes('regular-load'), 'the gift is remembered against its peg');
  // the sixth Load brings nothing more
  const out2 = applyResults(s, played('gift-6'), ctx);
  ok((out2.gifts || []).length === 0 && s.unlocks.filter((id) => id === packs[0].id).length === 1, 'the sixth Load brings no second gift');
}

// 2. a pack she already bought is skipped: the gift is the next one; a song she owns likewise
{
  const s = freshSave();
  s.stats.loads = 4;
  s.unlocks.push(packs[0].id, songList[0].id);
  const out = applyResults(s, played('gift-5b'), ctx);
  const g = out.gifts[0];
  ok(g.pack.id === packs[1].id && g.song.id === songList[1].id, `she owned the first of each, so the gift is the second of each (${g.pack.name}, ${g.song.name})`);
}

// 3. each tier once: Heavy at 20 brings the next pair, Mountain at 50 the next; the pure function agrees
{
  const s = freshSave();
  s.stats.loads = 19;
  applyResults(s, played('gift-20'), ctx);
  const s2 = { ...s, stats: { ...s.stats, loads: 49 } };
  applyResults(s2, played('gift-50'), ctx);
  // a save that jumps to 20 hangs Regular AND Heavy at once (each with its gift), then Mountain at 50: three tiers
  ok(s2.tierGifts.length === 3 && s2.tierGifts.includes('heavy-load') && s2.tierGifts.includes('mountain-load'), `every tier crossed brought a gift, each once (${s2.tierGifts.join(', ')})`);
  ok(s2.unlocks.filter((id) => packs.some((p) => p.id === id)).length === 3 && s2.unlocks.filter((id) => songList.some((x) => x.id === id)).length === 3, 'three packs and three songs, one a tier');
  const again = tierGifts(s2, [{ id: 'heavy-load' }], unlocks);
  ok(again.length === 0, 'a peg that already gave is never asked twice');
}

// 4. when every pack and every song is hers, the peg brings nothing and nothing breaks
{
  const s = freshSave();
  s.stats.loads = 4;
  for (const p of packs) s.unlocks.push(p.id);
  for (const x of songList) s.unlocks.push(x.id);
  const out = applyResults(s, played('gift-all'), ctx);
  ok(out.pegs.some((p) => p.id === 'regular-load') && (out.gifts || []).length === 0, 'with everything owned the peg hangs and no gift is claimed');
}

// 5. the peg's own words say the gift, so the results note and the Clothesline page do too
{
  const bad = clothesline.pegs.filter((p) => /^size/.test(p.comfort || '') && !/hero pack and a song/.test(p.effect));
  ok(!bad.length, `each size peg says a hero pack and a song come with it${bad.length ? ': ' + bad.map((p) => p.id).join(', ') : ''}`);
}

done();
