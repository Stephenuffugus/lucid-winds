// SORTER LEVELS (Stephen, 24 Sep 2026): "there should be like an account leveling that just happens naturally like
// you're a level 3 sorter ... if they don't buy the hero socks then they get more duplicates in loads ... Some of them
// it'll unlock all the socks. Some of them it'll be you now will start finding socks from this pack." The ladder and the
// rewards are data/levels.json; the rules are economy.levelGifts. Also the doll basket's quarter more (the same day).
import { readFileSync } from 'fs';
import { suite } from './lib.mjs';
import { applyResults, levelFor, nextLevel, levelGifts, lintFor } from '../src/economy.js';
import { freshSave } from '../src/save.js';
import { generateLoad, tierFor } from '../src/loadgen.js';
import { Session } from '../src/session.js';

const { ok, done } = suite('levels');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const clothesline = read('clothesline.json'), unlocks = read('unlocks.json'), heroFile = read('hero-socks.json'), finds = read('finds.json'), lore = read('lore.json'), levels = read('levels.json');
const heroes = heroFile.heroes;
const packs = unlocks.items.filter((i) => i.cat === 'pack' && !i.start);
const ctx = { now: 1, hour: 12, clothesline, lore, heroes, unlocks, finds, levels };

function played(seed, opts = {}) {
  const L = generateLoad({ seed, tier: 0, size: 'small', mode: 'laundry' });
  const S = new Session(L, opts);
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

// 1. the ladder: ten levels on the difficulty ladder's own counts, level 1 at nothing, each with a title
{
  const L = levels.levels;
  ok(L.length === 10 && L[0].loads === 0 && L[0].level === 1, `ten levels, the first at no Loads (${L.length})`);
  ok(L.every((l, i) => i === 0 || l.loads > L[i - 1].loads), 'each level asks for more Loads than the one before');
  ok(L.every((l, i) => tierFor(l.loads, 99) === i), 'the level counts are the difficulty ladder\'s own (TIER_AT), so a level and a tier arrive together');
  ok(L.every((l) => l.title && !/[-!]/.test(l.title)), 'every level has a title, with no dash and no shout');
  ok(levelFor(0, levels).level === 1 && levelFor(3, levels).level === 2 && levelFor(4, levels).level === 3 && levelFor(999, levels).level === 10, 'levelFor reads the ladder');
  ok(nextLevel(0, levels).level === 2 && nextLevel(4, levels).loads === 7 && nextLevel(40, levels) === null, 'nextLevel says the next rung, and none past the top');
  const kinds = L.map((l) => (l.reward || {}).pack).filter(Boolean);
  ok(kinds.filter((k) => k === 'access').length === 2 && kinds.filter((k) => k === 'whole').length === 2, `two levels give pack access and two give a whole pack (${kinds.join(', ')})`);
}

// 2. a fresh save climbs: level 2 gives Lint, level 3 pack access (socks in the Loads, none in the Drawer), level 4 a
//    whole pack (all ten in the Drawer), each once, and the results sheet is told
{
  const s = freshSave();
  let out = applyResults(s, played('lv-1'), ctx);
  ok(out.level && out.level.level === 1 && out.nextLevel && out.nextLevel.loads === 2 && (out.levelUps || []).length === 0, 'the first Load: level 1, level 2 at 2 Loads, nothing given yet');
  const lint1 = s.economy.lint;
  out = applyResults(s, played('lv-2'), ctx);
  ok(out.level.level === 2 && out.levelUps.length === 1 && out.levelUps[0].lint === 40 && s.economy.lint >= lint1 + 40, `the second Load reaches level 2 and its Lint (${out.levelUps[0] && out.levelUps[0].lint})`);
  ok(s.levelGifts.includes('level-2') && s.levelGifts.includes('level-1'), 'the levels given are remembered');
  applyResults(s, played('lv-3'), ctx);
  const drawerBefore = s.drawer.filter((d) => d.heroId).length;
  out = applyResults(s, played('lv-4'), ctx);
  ok(out.level.level === 3 && out.levelUps.length === 1 && out.levelUps[0].pack && !out.levelUps[0].whole, `level 3 gives access to a pack (${out.levelUps[0] && out.levelUps[0].pack && out.levelUps[0].pack.name})`);
  ok(out.levelUps[0].pack.id === packs[0].id && s.unlocks.includes(packs[0].id) && s.packBought[packs[0].look.pack] === s.stats.loads, 'it is the first pack she does not own, hers, with first call on the next ten Loads');
  ok(s.drawer.filter((d) => d.heroId).length === drawerBefore, 'access puts no sock in the Drawer: they are found');
  for (const seed of ['lv-5', 'lv-6']) applyResults(s, played(seed), ctx);
  // the fifth Load hung Regular load: its peg gift took the next pack (packs[1]); level 4 at 7 takes the one after
  out = applyResults(s, played('lv-7'), ctx);
  const whole = out.levelUps.find((g) => g.whole);
  ok(out.level.level === 4 && whole && whole.pack, `level 4 gives a whole pack (${whole && whole.pack && whole.pack.name})`);
  const pid = whole.pack.look.pack;
  const tenIn = heroes.filter((h) => h.pack === pid && h.source !== 'reunion');
  ok(tenIn.length === 10 && tenIn.every((h) => s.drawer.some((d) => d.heroId === h.id)), `all ${tenIn.length} of its socks are in the Drawer at once`);
  ok(s.unlocks.includes(whole.pack.id) && whole.pack.id !== packs[0].id && whole.pack.id !== packs[1].id, 'and it is a pack she did not have (the peg at five took the one before)');
  const again = levelGifts(s, levels, unlocks, heroes, 2);
  ok(again.length === 0, 'a level that gave is never asked twice');
}

// 3. seven packs are free by fifty Loads (three pegs, four levels) and two remain for sale; a save that jumps the
//    ladder gets every level's reward, one after another
{
  const s = freshSave();
  s.stats.loads = 49;
  const out = applyResults(s, played('lv-50'), ctx);
  const freePacks = s.unlocks.filter((id) => packs.some((p) => p.id === id));
  ok(freePacks.length === 7, `by fifty Loads seven paid packs are hers for nothing (${freePacks.length})`);
  const forSale = packs.filter((p) => !s.unlocks.includes(p.id));
  ok(forSale.length === 2 && forSale.every((p) => p.cost && p.cost.quarters), `two stay in the shop for Quarters (${forSale.map((p) => p.name).join(', ')})`);
  ok(out.levelUps.length === 9 && s.levelGifts.length === 10, `a save that jumps to fifty gets every level's reward at once (${out.levelUps.length} rewards, ${s.levelGifts.length} levels)`);
  const whole = out.levelUps.filter((g) => g.whole);
  ok(whole.length === 2 && whole.every((g) => heroes.filter((h) => h.pack === g.pack.look.pack && h.source !== 'reunion').every((h) => s.drawer.some((d) => d.heroId === h.id))), 'both whole packs are in the Drawer entire');
  ok(out.level.level === 10 && out.nextLevel === null, 'level 10 is the top');
}

// 4. with every pack owned (the tester), a pack level gives nothing and nothing breaks; Lint levels still pay
{
  const s = freshSave();
  for (const p of packs) s.unlocks.push(p.id);
  s.stats.loads = 6;
  const lint = s.economy.lint;
  const out = applyResults(s, played('lv-all'), ctx);
  ok(out.levelUps.every((g) => !g.pack) && s.economy.lint > lint, 'no pack to give, the Lint levels still pay, nothing throws');
}

// 5. THE DOLL BASKET pays a quarter more, in Rush points and in Lint (Stephen, 24 Sep); every other basket pays as before
{
  const doll = unlocks.items.find((i) => i.id === 'basket-doll');
  ok(doll && doll.look.bonus === 1.25, `the doll basket carries a bonus of a quarter (${doll && doll.look.bonus})`);
  ok(unlocks.items.filter((i) => i.cat === 'basket' && i.look && i.look.bonus).length === 1, 'and it is the only basket that does');
  const plain = played('doll-a'), bonus = played('doll-a', { basketBonus: 1.25 });
  const lp = lintFor(plain), lb = lintFor(bonus);
  ok(lp.basket === 0 && lb.basket === Math.round((lp.base + lp.shots + lp.bonus) * 0.25) && lb.total === lp.total + lb.basket, `Laundry Day Lint: ${lp.total} plain, ${lb.total} with the doll (+${lb.basket})`);
  const rushL = generateLoad({ seed: 'doll-rush', tier: 0, size: 'small', mode: 'rush' });
  const R1 = new Session(rushL, { sub: 'timed' }), R2 = new Session(rushL, { sub: 'timed', basketBonus: 1.25 });
  for (const S of [R1, R2]) {
    rushL.socks.forEach((s, i) => S.addSock(i + 1, s)); S.startClock();
    const byKey = new Map();
    for (const s of S.socks.values()) if (s.state === 'table' && s.pair !== null && s.pair !== undefined) byKey.set(s.key, [...(byKey.get(s.key) || []), s.id]);
    const pair = [...byKey.values()].find((v) => v.length === 2);
    const r = S.match(pair[0], pair[1]); S.shoot(r.ball, { tap: true }); S.shotResult(r.ball, true);
  }
  ok(R2.stats.rushPoints === Math.round(R1.stats.rushPoints * 1.25), `a basketed pair pays ${R1.stats.rushPoints} points plain and ${R2.stats.rushPoints} with the doll`);
}

done();
