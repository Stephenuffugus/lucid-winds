// Economy (DESIGN 9.5): Lint, Quarters, Reunions. Cosmetics and comforts only, never advantage.
// Pure functions over the save object, so Node can test the calibration (DESIGN 15.6).

import { decode, specKey } from '../engine/sockgen.js';
import { tierFor, SIZES } from './loadgen.js';
import { addCents } from './coins.js';
import { completedSets, setById } from './finds.js';

// Regular Load calibration (DESIGN 9.5): Lint 40 to 80; a relaxed player doing 3 Loads a day
// earns about 200 Lint and about 3 Quarters.
export const CAL = {
  lintPerPair: 2.2,
  lintPerMade: 1,
  tidy: { spotless: 0.3, tidy: 0.12, 'lived-in': 0 },
  rushPointsPerLint: 180,
  impossibleAt: [10, 30, 75],
};

export function lintFor(session) {
  const st = session.stats;
  const pairs = st.matches;
  const base = Math.round(pairs * CAL.lintPerPair);
  const shots = st.shotsMade * CAL.lintPerMade;
  let bonus = 0;
  if (session.mode === 'laundry') bonus = Math.round(base * CAL.tidy[session.tidy()]);
  else bonus = Math.round(st.rushPoints / CAL.rushPointsPerLint);
  return { base, shots, bonus, total: base + shots + bonus };
}

// Quarters now come from ONE place: the coin jar rolling 25 cents (DESIGN-T2 phase 1.1). A Clean Load and a
// Spotless one still pay for themselves, as a quarter COIN into the jar (the `clean` and `spotless` moments in
// coins.js), so nothing is paid twice and nothing is awarded for failing less.
export function coinsFound(session) {
  const by = {};
  for (const c of session.coins || []) by[c.kind] = (by[c.kind] || 0) + 1;
  return { coins: session.coins || [], cents: session.cents || 0, byKind: by };
}

export function eyesCount(save, clothesline) {
  const eyes = new Set((clothesline.pegs || []).filter((p) => p.eyes).map((p) => p.id));
  return save.clothesline.filter((id) => eyes.has(id)).length;
}

export function comfortsOf(save, clothesline) {
  const by = new Map((clothesline.pegs || []).map((p) => [p.id, p]));
  const out = new Set();
  for (const id of save.clothesline) { const p = by.get(id); if (p && p.comfort && p.comfort !== 'blank') out.add(p.comfort); }
  return out;
}

export function sizesUnlocked(save, clothesline) {
  const c = comfortsOf(save, clothesline);
  const out = ['small'];
  if (c.has('sizeRegular')) out.push('regular');
  if (c.has('sizeHeavy')) out.push('heavy');
  if (c.has('sizeMountain')) out.push('mountain');
  return out;
}

export function tierNow(save, clothesline, mode) {
  return tierFor(save.stats.loadsByMode[mode] || 0, eyesCount(save, clothesline));
}

// Pegs unlock by doing, never by buying (DESIGN 9.4).
export function evaluatePegs(save, clothesline) {
  const earned = [];
  for (const p of clothesline.pegs || []) {
    if (save.clothesline.includes(p.id) || !p.earn) continue;
    const v = save.stats[p.earn.stat] || 0;
    if (v >= p.earn.gte) { save.clothesline.push(p.id); earned.push(p); }
  }
  return earned;
}

function drawerAdd(save, seed, now, odd) {
  const sp = decode(seed);
  const key = sp.hero ? 'hero:' + sp.hero : seed;
  let d = save.drawer.find((x) => (x.heroId ? 'hero:' + x.heroId : x.sockSeed) === key);
  const fresh = !d;
  if (!d) {
    d = sp.hero ? { heroId: sp.hero, foundAt: now, count: 0, odd: !!odd } : { sockSeed: seed, foundAt: now, count: 0, odd: !!odd };
    save.drawer.push(d);
  }
  if (!odd) { d.count++; d.odd = false; }
  return fresh ? d : null;
}

// Apply a finished Load to the save. Returns everything the Results screen shows.
// ctx: { now, hour, clothesline, lore, heroes }
export function applyResults(save, session, ctx) {
  const now = ctx.now || Date.now();
  const load = session.load;
  const st = session.stats;
  const out = { lint: lintFor(session), coins: coinsFound(session), newDrawer: [], reunions: [], lore: [], pegs: [], impossible: [], oddAdded: [], find: null, sets: [], tidy: session.tidy(), clean: st.cleanLoad };
  // currencies. The coins she found go into the jar; every 25 cents in there rolls itself into a Quarter.
  save.economy.lint += out.lint.total;
  if (save.economy.cents === undefined) save.economy.cents = 0;
  out.jar = addCents(save.economy, out.coins.cents);
  out.quarters = { total: out.jar.rolled, rolled: out.jar.rolled, cents: out.jar.cents };
  // stats
  const S = save.stats;
  if (!S.coins) S.coins = { penny: 0, nickel: 0, dime: 0, quarter: 0 };
  for (const c of out.coins.coins) S.coins[c.kind] = (S.coins[c.kind] || 0) + 1;
  S.loads++;
  S.loadsByMode[session.mode] = (S.loadsByMode[session.mode] || 0) + 1;
  S.pairs += st.matches;
  S.shotsMade += st.shotsMade;
  S.shotsMissed += st.shotsMissed;
  S.flips += st.flips;
  S.binned += st.binned;
  if (st.cleanLoad) S.cleanLoads++;
  if (out.tidy === 'spotless' && session.mode === 'laundry') S.spotless++;
  S.bestStreak = Math.max(S.bestStreak, session.bestStreak || 0);
  if (session.mode === 'rush') { S.rushLoads++; S.rushPairs += st.matches; S.powersUsed += st.powersUsed; }
  const hour = ctx.hour !== undefined ? ctx.hour : new Date(now).getHours();
  if (hour >= 20 || hour < 5) S.nightLoads++;
  // drawer: every pair balled, and odd socks as "missing mate" entries
  const seenPairs = new Set();
  for (const b of session.balls.values()) {
    if (seenPairs.has(b.key)) continue;
    seenPairs.add(b.key);
    const d = drawerAdd(save, b.seed, now, false);
    if (d) out.newDrawer.push(b.seed);
  }
  // the Odd Bin (DESIGN 9.3)
  for (const e of save.oddBin) e.loadsWaited++;
  for (const r of st.reunions) {
    const i = save.oddBin.findIndex((e) => e.sockSeed === r.seed);
    const waited = i >= 0 ? save.oddBin[i].loadsWaited : 0;
    if (i >= 0) save.oddBin.splice(i, 1);
    save.economy.reunions++;
    S.reunions++;
    drawerAdd(save, r.seed, now, false);
    out.reunions.push({ seed: r.seed, waited });
  }
  for (const s of session.socks.values()) {
    if (s.state !== 'binned' || s.reunion) continue;
    // Daily Loads are shared puzzles: their odd socks do not move into your Odd Bin
    if (ctx.daily) continue;
    const i = save.oddBin.findIndex((e) => e.sockSeed === s.seed);
    if (i >= 0) {
      // its twin was already waiting (the generator should have flagged it; count it anyway)
      const waited = save.oddBin[i].loadsWaited;
      save.oddBin.splice(i, 1);
      save.economy.reunions++;
      S.reunions++;
      drawerAdd(save, s.seed, now, false);
      out.reunions.push({ seed: s.seed, waited });
      continue;
    }
    save.oddBin.push({ sockSeed: s.seed, waitingSince: now, loadsWaited: 0 });
    drawerAdd(save, s.seed, now, true);
    out.oddAdded.push(s.seed);
  }
  // lore pages arrive because you played (DESIGN 9.6)
  for (const p of (ctx.lore && ctx.lore.pages) || []) {
    if (save.economy.reunions >= p.at && !save.lore.includes(p.id)) { save.lore.push(p.id); out.lore.push(p); }
  }
  // impossible socks
  CAL.impossibleAt.forEach((at, i) => {
    const id = 'impossible-' + (i + 1);
    if (save.economy.reunions >= at && !save.unlocks.includes(id)) {
      save.unlocks.push(id);
      const hero = (ctx.heroes || []).find((h) => h.source === 'reunion' && (h.reunions === at));
      if (hero) drawerAdd(save, 'hero:' + hero.id, now, false);
      out.impossible.push({ at, hero: hero || null });
    }
  });
  // the pocket find this Load turned up (DESIGN-T2 2.2). It is a collection entry, never a payout: nothing
  // about it touches Lint, the jar or the Quarters. Named finds are UNIQUE, so a second copy is never kept.
  if (session.found && ctx.finds) {
    const id = session.found.id;
    if (!save.finds.includes(id)) {
      save.finds.push(id);
      out.find = session.found;
      const before = new Set(save.sets);
      for (const sid of completedSets(ctx.finds, save.finds)) {
        if (before.has(sid)) continue;
        save.sets.push(sid);
        out.sets.push(setById(ctx.finds, sid) || { id: sid });
      }
    }
  }
  // pegs and tier
  if (ctx.clothesline) {
    out.pegs = evaluatePegs(save, ctx.clothesline);
    for (const m of ['laundry', 'rush']) S.tierByMode[m] = tierNow(save, ctx.clothesline, m);
  }
  // reunion only unlocks keyed by count (lore items, odd eye lamp, frames)
  for (const it of (ctx.unlocks && ctx.unlocks.items) || []) {
    if (it.cost && it.cost.reunions !== undefined && !save.unlocks.includes(it.id) && save.economy.reunions >= it.cost.reunions && (!it.requires || requirementMet(save, it.requires))) save.unlocks.push(it.id);
  }
  return out;
}

export function requirementMet(save, req) {
  if (!req) return true;
  const [kind, val] = String(req).split(':');
  if (kind === 'lore') return save.lore.includes(Number(val));
  if (kind === 'peg') return save.clothesline.includes(val);
  return true;
}

export function owns(save, item) {
  return !!item && (item.start || save.unlocks.includes(item.id));
}

export function canBuy(save, item) {
  if (!item || owns(save, item)) return { ok: false, why: 'owned' };
  const c = item.cost || {};
  if (c.reunions !== undefined) return { ok: false, why: 'reunion' };
  if (item.requires && !requirementMet(save, item.requires)) return { ok: false, why: 'locked' };
  if (c.lint !== undefined && save.economy.lint < c.lint) return { ok: false, why: 'lint' };
  if (c.quarters !== undefined && save.economy.quarters < c.quarters) return { ok: false, why: 'quarters' };
  return { ok: true };
}

export function buy(save, item) {
  const can = canBuy(save, item);
  if (!can.ok) return can;
  const c = item.cost || {};
  if (c.lint) save.economy.lint -= c.lint;
  if (c.quarters) save.economy.quarters -= c.quarters;
  save.unlocks.push(item.id);
  // a pack remembers the Load it was bought at, so it can have first call on the next ten (DESIGN-T2 4.2)
  if (item.cat === 'pack' && item.look && item.look.pack) {
    if (!save.packBought || typeof save.packBought !== 'object') save.packBought = {};
    save.packBought[item.look.pack] = (save.stats && save.stats.loads) || 0;
  }
  return { ok: true };
}

// THE HERO BUDGET'S FIRST CALL (DESIGN-T2 4.2): the packs she bought within her last ten Loads, newest first.
export const FIRST_CALL_LOADS = 10;
export function recentPacks(save) {
  const loads = (save.stats && save.stats.loads) || 0;
  return Object.entries(save.packBought || {})
    .filter(([, at]) => loads - at < FIRST_CALL_LOADS)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);
}

// ⛔ This used to read the packs off `save.unlocks`, which never holds a `start: true` pack, so it would have
// said a brand new player owns NONE of the free pack's socks: the bug app.js fixed on 22 Sep, still alive in a
// second reader. It asks `owns` now, which needs the catalogue to know which packs are hers from the start.
export function ownedHeroes(save, heroes, unlocks) {
  const packs = new Set();
  for (const it of ((unlocks && unlocks.items) || [])) if (it.cat === 'pack' && it.look && owns(save, it)) packs.add(it.look.pack);
  for (const id of save.unlocks) if (id.startsWith('pack-')) packs.add(id.slice(5));
  return heroes.filter((h) => packs.has(h.pack));
}

// The tester switch (src/unlockall.js): own every item, page, peg and hero sock. Additive, and a second run changes
// nothing. Reunions are never faked, and the Load count (his difficulty) moves only when a tier is asked for.
// ctx: { unlocks, lore, clothesline, heroes }   opts: { now, tier }
export function grantEverything(save, ctx, opts = {}) {
  const now = opts.now || Date.now();
  const add = (list, id) => { if (!list.includes(id)) list.push(id); };
  for (const it of (ctx.unlocks && ctx.unlocks.items) || []) add(save.unlocks, it.id);
  CAL.impossibleAt.forEach((at, i) => add(save.unlocks, 'impossible-' + (i + 1)));
  for (const p of (ctx.lore && ctx.lore.pages) || []) add(save.lore, p.id);
  for (const p of (ctx.clothesline && ctx.clothesline.pegs) || []) add(save.clothesline, p.id);
  for (const h of ctx.heroes || []) if (!save.drawer.some((d) => d.heroId === h.id)) drawerAdd(save, 'hero:' + h.id, now, false);
  save.economy.lint = Math.max(save.economy.lint, 99999);
  save.economy.quarters = Math.max(save.economy.quarters, 999);
  // the save grew a coin jar and a coin count in v3, so the tester switch grows with it (law 13): a full jar,
  // one cent short of rolling, so she can watch the roll happen, and a coin of each kind on the record.
  save.economy.cents = Math.max(Number(save.economy.cents) || 0, 24);
  if (!save.stats.coins) save.stats.coins = { penny: 0, nickel: 0, dime: 0, quarter: 0 };
  for (const k of ['penny', 'nickel', 'dime', 'quarter']) save.stats.coins[k] = Math.max(Number(save.stats.coins[k]) || 0, 1);
  // every find there is, in the order the catalogue lists them, and every set that is then complete
  // (data/finds.json arrives in phase 2; until it does, ctx.finds is empty and this grants nothing)
  for (const f of (ctx.finds && ctx.finds.items) || []) add(save.finds, f.id);
  for (const st of (ctx.finds && ctx.finds.sets) || []) {
    const need = ((ctx.finds.items || []).filter((f) => f.set === st.id)).map((f) => f.id);
    if (need.length && need.every((id) => save.finds.includes(id))) add(save.sets, st.id);
  }
  if (Number.isInteger(opts.tier) && opts.tier >= 0 && opts.tier <= 9) {
    let loads = 0;
    while (loads < 1000 && tierFor(loads, 99) < opts.tier) loads++;
    for (const m of ['laundry', 'rush']) save.stats.loadsByMode[m] = loads;
  }
  if (ctx.clothesline) for (const m of ['laundry', 'rush']) save.stats.tierByMode[m] = tierNow(save, ctx.clothesline, m);
  return save;
}

export { SIZES, specKey };
