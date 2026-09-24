// THE HERO BUDGET PER LOAD (DESIGN-T2 4.2): "with ten packs owned, heroes must neither vanish nor crowd out the
// matching game. At most 1 hero pair per 10 pairs, and a pack bought in the last ten Loads gets first call.
// Fixture over 200 generated Loads."
//
// What the old rule did, measured when this was written: `max(1, round(pairs * 0.1))` gave a Heavy Load (35 pairs)
// FOUR heroes, and heroes could only stand where `i % 7 === 3` among the base pairs, so at a high tier, when decoys
// take most of a Small Load, there was no such place and the heroes she bought vanished.
import { suite } from './lib.mjs';
import { readFileSync } from 'fs';
import { generateLoad, dailyLoad, SIZES } from '../src/loadgen.js';
import { freshSave, validate } from '../src/save.js';
import { buy, ownedHeroes, recentPacks } from '../src/economy.js';

const { ok, done } = suite('herobudget');
const read = (f) => JSON.parse(readFileSync(new URL('../data/' + f, import.meta.url), 'utf8'));
const cat = read('hero-socks.json');
const unlocks = read('unlocks.json');
const shopPacks = new Set(unlocks.items.filter((i) => i.cat === 'pack').map((i) => i.look.pack));
const ALL = cat.heroes.filter((h) => shopPacks.has(h.pack));          // every pack owned: 100 heroes
const cap = (n) => Math.max(1, Math.floor(n / 10));
const heroesIn = (L) => L.pairs.filter((p) => p.hero);
const N = 200;

// ---------- neither vanish nor crowd out, at every size and every tier ----------
for (const size of Object.keys(SIZES)) {
  let over = 0, vanished = 0, total = 0, minH = 99, maxH = 0;
  for (let i = 0; i < N; i++) {
    const L = generateLoad({ seed: `budget-${size}-${i}`, mode: 'laundry', size, tier: i % 9, heroes: ALL });
    const h = heroesIn(L).length, n = L.pairs.length;
    total += h; minH = Math.min(minH, h); maxH = Math.max(maxH, h);
    if (h > cap(n)) over++;
    if (h < 1) vanished++;
  }
  ok(!over, `${size} (${SIZES[size]} pairs): never more than one hero pair in ten, ${cap(SIZES[size])} at most (${minH} to ${maxH} over ${N} Loads)`);
  ok(!vanished, `${size}: a hero turns up in every one of ${N} Loads, at every tier (${vanished} without one)`);
}

// ---------- a player who owns only a little still sees it ----------
{
  const one = cat.heroes.filter((h) => h.pack === 'plant-parents');
  let seen = 0;
  for (let i = 0; i < N; i++) if (heroesIn(generateLoad({ seed: 'small-owner-' + i, mode: 'laundry', size: 'small', tier: 8, heroes: one })).length) seen++;
  ok(seen === N, `with only the free pack, a Small Load at the top tier still holds one of its socks (${seen} of ${N})`);
  let none = 0;
  for (let i = 0; i < 40; i++) none += heroesIn(generateLoad({ seed: 'no-heroes-' + i, mode: 'laundry', size: 'heavy', tier: 3, heroes: [] })).length;
  ok(none === 0, 'and with no heroes owned there are none');
}

// ---------- a pack bought in the last ten Loads gets first call ----------
for (const size of ['small', 'regular', 'mountain']) {
  let first = 0;
  for (let i = 0; i < N; i++) {
    const L = generateLoad({ seed: `first-${size}-${i}`, mode: 'laundry', size, tier: i % 9, heroes: ALL, recentPacks: ['found-1998'] });
    const h = heroesIn(L).map((p) => cat.heroes.find((x) => x.id === p.hero));
    if (h.length && h[0].pack === 'found-1998') first++;
  }
  ok(first === N, `${size}: a pack bought lately gets the first hero place in every Load (${first} of ${N})`);
}
{
  // without the first call, a single pack among ten gets about its share, so the test above is not luck
  let first = 0;
  for (let i = 0; i < N; i++) {
    const L = generateLoad({ seed: `share-${i}`, mode: 'laundry', size: 'small', tier: 3, heroes: ALL });
    const h = heroesIn(L).map((p) => cat.heroes.find((x) => x.id === p.hero));
    if (h.length && h[0].pack === 'found-1998') first++;
  }
  ok(first < N * 0.3, `and without it that pack is just one of ten (${first} of ${N})`);
}

// ---------- THE DECK (24 Sep): no hero dealt again while others are unfound, then not while it rested ----------
// Stephen: "I got some duplicates in my first couple loads where I had two pairs of like the exact same sock ... It makes the
// game feel cheap." Measured before: 98 percent of fresh saves saw the same hero again inside five Loads.
{
  const one = cat.heroes.filter((h) => h.pack === 'plant-parents');
  let repeatSaves = 0, distinct = 0;
  for (let s = 0; s < 60; s++) {
    const found = new Set(); let recent = []; const seen = new Set(); let r = 0;
    for (let k = 0; k < 5; k++) {
      const L = generateLoad({ seed: `deck-${s}-${k}`, mode: 'laundry', size: k < 2 ? 'small' : 'regular', tier: [0, 0, 1, 1, 2][k], heroes: one, foundHeroes: found, recentHeroes: recent });
      const dealt = heroesIn(L).map((p) => p.hero);
      for (const h of dealt) { if (seen.has(h)) r++; seen.add(h); found.add(h); }
      recent = [...recent.filter((id) => !dealt.includes(id)), ...dealt].slice(-8);
    }
    if (r) repeatSaves++; distinct += seen.size;
  }
  ok(repeatSaves === 0, `a fresh save with the free pack never sees a hero twice in its first five Loads (${repeatSaves} of 60 did)`);
  ok(distinct / 60 >= 7.5, `and sees most of the ten (${(distinct / 60).toFixed(1)} distinct on average)`);
  // once every hero is found, the last eight rest: a Small Load's one hero is never one of the eight before it
  const found = new Set(one.map((h) => h.id)); let recent = one.slice(0, 8).map((h) => h.id), rested = 0;
  for (let k = 0; k < 40; k++) {
    const L = generateLoad({ seed: `rest-${k}`, mode: 'laundry', size: 'small', tier: 2, heroes: one, foundHeroes: found, recentHeroes: recent });
    const h = heroesIn(L)[0].hero;
    if (!recent.includes(h)) rested++;
    recent = [...recent.filter((id) => id !== h), h].slice(-8);
  }
  ok(rested === 40, `with all ten found, the hero dealt is never one of the last eight (${rested} of 40)`);
  // the deck changes nothing for a Load told nothing (the old draw), and the first call still wins
  const a = generateLoad({ seed: 'deck-plain', mode: 'laundry', size: 'regular', tier: 3, heroes: ALL });
  const b = generateLoad({ seed: 'deck-plain', mode: 'laundry', size: 'regular', tier: 3, heroes: ALL, foundHeroes: new Set(), recentHeroes: [] });
  ok(JSON.stringify(a.pairs) === JSON.stringify(b.pairs), 'with nothing found and nothing recent the deal is the old deal');
  const c = generateLoad({ seed: 'deck-first', mode: 'laundry', size: 'regular', tier: 3, heroes: ALL, recentPacks: ['found-1998'], foundHeroes: new Set(ALL.filter((h) => h.pack !== 'found-1998').map((h) => h.id)), recentHeroes: [] });
  ok(heroesIn(c).length && cat.heroes.find((x) => x.id === heroesIn(c)[0].hero).pack === 'found-1998', 'a pack bought lately still gets the first place, and its unfound socks come first');
}

// ---------- the Daily is the same Load for everybody: no heroes, and untouched by any of this ----------
{
  const a = dailyLoad('2026-09-23', 'laundry'), b = dailyLoad('2026-09-23', 'laundry');
  ok(heroesIn(a).length === 0 && JSON.stringify(a.pairs) === JSON.stringify(b.pairs), 'the Daily holds no heroes and is the same Load every time');
}

// ---------- the save knows when a pack was bought ----------
{
  const s = freshSave(0);
  s.economy.quarters = 30;
  s.stats.loads = 40;
  const item = unlocks.items.find((i) => i.id === 'pack-found-1998');
  ok(buy(s, item).ok && s.packBought && s.packBought['found-1998'] === 40, `buying a pack writes down the Load it was bought at (${JSON.stringify(s.packBought)})`);
  ok(recentPacks(s).includes('found-1998'), 'it gets first call straight away');
  s.stats.loads = 49;
  ok(recentPacks(s).includes('found-1998'), 'and for its first ten Loads');
  s.stats.loads = 50;
  ok(!recentPacks(s).includes('found-1998'), 'and not after');
  const back = validate(JSON.parse(JSON.stringify({ ...s, packBought: { 'found-1998': 40, 'x y': 3, junk: -2, also: 'no' } })));
  ok(JSON.stringify(back.packBought) === JSON.stringify({ 'found-1998': 40 }), `an imported save keeps real entries and drops the rest (${JSON.stringify(back.packBought)})`);
  ok(JSON.stringify(validate(JSON.parse(JSON.stringify({ ...freshSave(0), packBought: undefined }))).packBought) === '{}', 'and a save from before it had none starts empty');
}

// ---------- the free pack is owned by every reader, not just the app ----------
{
  const s = freshSave(0);
  const mine = ownedHeroes(s, cat.heroes, unlocks);
  ok(mine.length === 10 && mine.every((h) => h.pack === 'plant-parents'), `a brand new save owns the free pack's ten socks through ownedHeroes too (${mine.length})`);
}

done();
