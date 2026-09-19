// The run: Nights, pouch and hand, placements, Glints, the Lapidary, Eclipse rewards, endless.
// State is plain JSON; step(state, action) mutates it deterministically and appends the action to
// state.log, so replay(options, log) rebuilds any run exactly (saves, Daily Cast verification).
import { DATA } from './data.js';
import { rng } from './rng.js';
import { grid } from './hex.js';
import { cast } from './cast.js';
import { generateBoard, lanternColorsOf } from './boardgen.js';
import { runModifiers, inclusionFlags } from './settings.js';
import { gemIdFor, gemName, parseGemSpec, sameKind, gemPrice, sellPrice, settingPrice } from './gems.js';
import { legendFor, validLoans } from './meta.js';

export const RUN_VERSION = 1;

export class RuleError extends Error {}
const fail = (msg) => { throw new RuleError(msg); };

// ------------------------------------------------------------------ run creation

export function newRun(opts = {}, data = DATA) {
  const seed = String(opts.seed ?? 'lumen');
  const lanternId = opts.lantern || 'candle';
  const deck = data.lantern[lanternId];
  if (!deck) fail(`unknown lantern ${lanternId}`);
  const state = {
    v: RUN_VERSION, seed, lantern: lanternId, vigil: opts.vigil | 0, daily: !!opts.daily,
    phase: 'night', night: 0, endless: false,
    glints: data.rules.run.startGlints, settings: [],
    gems: {}, pouch: [], nextUid: 1, dropIndex: 0,
    carry: [], offeredSettings: [], n: null, shop: null, reward: null,
    history: [], log: [],
    stats: { totalLux: 0, bestCast: null, casts: 0, dawns: 0, eclipsesBeaten: 0, inclusionGems: [], nightsCleared: 0, mirrorsPlaced: 0, maxBeamStrikes: 0, dawnBothApertures: false },
    opts: { seed, lantern: lanternId, vigil: opts.vigil | 0, daily: !!opts.daily, loans: opts.loans || [], measure: !!opts.measure, anyLibraryKey: !!opts.anyLibraryKey },
  };
  // Starter pouch for this Lantern: base list, minus removals, plus additions.
  const list = data.pouches[deck.pouch.base].slice();
  for (const r of deck.pouch.remove) { const i = list.indexOf(r); if (i >= 0) list.splice(i, 1); }
  list.push(...deck.pouch.add);
  for (const spec of list) addGem(state, { ...parseGemSpec(spec), tier: 0, inclusion: null, origin: 'starter' }, data);
  for (const loan of opts.loans || []) addGem(state, { ...loan, origin: 'loan', loaned: true, keepId: true }, data);
  startNight(state, 1, data);
  return state;
}

function addGem(state, spec, data) {
  const uid = state.nextUid++;
  const gemId = spec.keepId && spec.gemId !== undefined ? spec.gemId >>> 0 : gemIdFor(state.seed, state.dropIndex++);
  const gem = {
    uid, gemId, cut: spec.cut, stone: spec.stone, tier: spec.tier | 0, inclusion: spec.inclusion || null,
    nightsSurvived: spec.nightsSurvived | 0, origin: spec.origin || 'shop', loaned: !!spec.loaned, cabinetId: spec.cabinetId ?? null,
    legend: spec.legend || null, bestLux: 0,
  };
  // A Legend keeps its own name (fixed, like its ID) until a service changes the gem.
  gem.name = spec.legend && spec.name ? spec.name : gemName(gem, data);
  state.gems[uid] = gem;
  state.pouch.push(uid);
  return gem;
}

function removeGem(state, uid) {
  delete state.gems[uid];
  state.pouch = state.pouch.filter((u) => u !== uid);
  state.carry = state.carry.filter((u) => u !== uid);
}

// ------------------------------------------------------------------ derived values

export function modifiers(state, data = DATA) {
  return runModifiers(state.settings, state.n ? state.n.eclipse : null, data);
}

export function eclipseFor(state, night, data = DATA) {
  const R = data.rules;
  const nights = vigilEffects(state.vigil, data).eclipseNights || R.run.eclipseNights;
  const isEclipse = nights.includes(night) || (night > R.run.nights && night % 4 === 0);
  if (!isEclipse) return null;
  const pool = data.eclipses.filter((e) => night <= R.run.eclipseNights[0] ? e.pool <= R.run.eclipseNights[0] : true).map((e) => e.id);
  return rng(state.seed, 'eclipse', night).pick(pool);
}

export function vigilEffects(level, data = DATA) {
  // Section 10 ladder (data/vigils.json), stacking: every row up to the level applies.
  const v = { targetPct: 0, redrawsLess: 0, eclipseNights: null, shopAdd: 0, handSizeSet: null, commonCap: null, noPreviewOnEclipse: false };
  for (const row of data.vigils.levels) {
    if (row.level > level) continue;
    for (const e of row.effects) {
      switch (e.kind) {
        case 'targetPct': v.targetPct += e.value; break;
        case 'redrawsLess': v.redrawsLess += e.value; break;
        case 'eclipseNights': v.eclipseNights = e.value; break;
        case 'shopAdd': v.shopAdd += e.value; break;
        case 'handSizeSet': v.handSizeSet = v.handSizeSet === null ? e.value : Math.min(v.handSizeSet, e.value); break;
        case 'commonCap': v.commonCap = v.commonCap === null ? e.value : Math.min(v.commonCap, e.value); break;
        case 'noPreviewOnEclipse': v.noPreviewOnEclipse = true; break;
        default: throw new Error(`unknown vigil effect ${e.kind}`);
      }
    }
  }
  return v;
}

// Redraws allowed per cast: one, less the Vigil's (section 10 "one fewer reroll": the less-Lux reading).
export function redrawsPerCast(state, data = DATA) {
  return Math.max(0, data.rules.night.redrawsPerCast - vigilEffects(state.vigil, data).redrawsLess);
}

export function targetFor(state, night, data = DATA) {
  const T = data.targets.nights;
  let base;
  if (night <= T.length) base = T[night - 1];
  else { base = T[T.length - 1]; for (let k = T.length; k < night; k++) base = Math.ceil(base * data.targets.endlessGrowth); }
  const pct = runModifiers(state.settings, null, data).targetPct + vigilEffects(state.vigil, data).targetPct;
  return Math.ceil((base * (100 + pct)) / 100);
}

export function handSize(state, data = DATA) {
  const m = modifiers(state, data);
  let size = data.rules.night.handSize;
  const set = [m.handSizeSet, vigilEffects(state.vigil, data).handSizeSet].filter((x) => x !== null);
  if (set.length) size = Math.min(...set);
  if (m.handSizeAddIfPouchAtMost && state.pouch.length <= m.handSizeAddIfPouchAtMost.pouch) size += m.handSizeAddIfPouchAtMost.value;
  return size;
}

export function placementLimit(state, data = DATA) {
  const n = state.n;
  const m = modifiers(state, data);
  const castNo = n.castIndex + 1;
  let lim = n.castIndex === 0 ? data.rules.night.placementsFirst : data.rules.night.placementsLater;
  for (const e of m.placementsAdd) if (e.casts.includes(castNo)) lim += e.value;
  if (m.placementsMax !== null) lim = Math.min(lim, m.placementsMax);
  return lim;
}

export function castsThisNight(state, data = DATA) {
  return data.rules.night.casts + modifiers(state, data).castsAdd;
}

function gemCountOnBoard(state, data) {
  const n = state.n;
  let c = 0;
  const all = [...n.placed.map((p) => state.gems[p.uid]), ...n.board.fixed];
  for (const gm of all) c += inclusionFlags(gm.inclusion || null, data).countsDouble?.includes('firefly') ? 2 : 1;
  return c;
}

// Emitter beams for the current cast from the Lantern deck and the board's lantern cells.
export function emittersFor(state, data = DATA) {
  const n = state.n;
  const deck = data.lantern[state.lantern];
  const g = grid(n.board.radius);
  const groups = deck.emitters;
  const out = [];
  const halve = groups.length === 1 && n.board.lanterns.length > 1; // Twin Lantern feature
  n.board.lanterns.forEach((l, i) => {
    let dir = l.dir;
    if (deck.rotatesPerCast) {
      for (let k = 0; k < n.castIndex; k++) {
        do dir = (dir + 1) % 6; while (g.neighbor[l.cell * 6 + dir] < 0);
      }
    }
    for (const beam of groups[i % groups.length]) {
      let I = beam.intensity + (deck.perGem ? deck.perGem * gemCountOnBoard(state, data) : 0);
      if (halve) I = Math.max(1, Math.floor(I / 2));
      out.push({ cell: l.cell, dir, color: beam.color, intensity: I, focus10: beam.focus10 });
    }
  });
  return out;
}

// Which placed gem Tremor turns before this cast (seeded, previewed); null if none.
export function tremorTarget(state, data = DATA) {
  const n = state.n;
  if (!modifiers(state, data).rotateRandomGem) return null;
  const eligible = n.placed.filter((p) => {
    const f = inclusionFlags(state.gems[p.uid].inclusion || null, data);
    return !(f.immuneEclipseKinds || []).includes('rotateRandomGem') && !(f.ignoreEclipseKinds || []).includes('rotateRandomGem');
  }).map((p) => p.cell).sort((a, b) => a - b);
  if (!eligible.length) return null;
  return eligible[rng(state.seed, 'tremor', n.night, n.castIndex).int(eligible.length)];
}

// The board handed to cast() for the coming cast (tremor applied when `withTremor`).
export function castBoard(state, withTremor = true, data = DATA) {
  const n = state.n;
  const b = n.board;
  const tremor = withTremor ? tremorTarget(state, data) : null;
  const gems = [];
  for (const f of b.fixed) gems.push({ cell: f.cell, cut: f.cut, stone: f.stone, tier: 0, inclusion: null, facing: n.fixedFacing[f.cell] ?? f.facing, gemId: f.gemId ?? f.cell, nightsSurvived: 0, fixed: true });
  for (const p of n.placed) {
    const gm = state.gems[p.uid];
    gems.push({ cell: p.cell, cut: gm.cut, stone: gm.stone, tier: gm.tier, inclusion: gm.inclusion, facing: (p.facing + (p.cell === tremor ? 1 : 0)) % 6, gemId: gm.gemId, nightsSurvived: gm.nightsSurvived, uid: gm.uid });
  }
  return { radius: b.radius, walls: b.walls, dark: b.dark, bright: b.bright, fog: b.fog, emitters: emittersFor(state, data), apertures: n.apertures, gems };
}

export function castContext(state, data = DATA) {
  const n = state.n;
  const deck = data.lantern[state.lantern];
  return { settings: state.settings, eclipse: n.eclipse, lanternRules: deck.rules || [], castNumber: n.castIndex + 1, vigilCommonCap: vigilEffects(state.vigil, data).commonCap };
}

// Preview of the coming cast (same function the Cast button runs).
export function preview(state, opts = {}, data = DATA) {
  return cast(castBoard(state, true, data), { ...castContext(state, data), events: opts.events !== false }, data);
}

export function occupied(state, cell) {
  const n = state.n;
  const b = n.board;
  return b.walls.includes(cell) || b.lanterns.some((l) => l.cell === cell) || n.apertures.some((a) => a.cell === cell)
    || b.fixed.some((f) => f.cell === cell) || n.placed.some((p) => p.cell === cell);
}

// ------------------------------------------------------------------ Night flow

function makeBoard(state, night, eclipse, data) {
  const deck = data.lantern[state.lantern];
  const m = runModifiers([], eclipse, data);
  const opts = { lantern: state.lantern, emitterGroups: deck.emitters.length, darkHalf: m.darkHalf, lanternColors: lanternColorsOf(state.lantern, data), anyLibraryKey: !!state.opts.anyLibraryKey };
  const b = generateBoard(state.seed, night, opts, data);
  b.fixed.forEach((f, i) => { f.gemId = (gemIdFor(state.seed, `fixed:${night}:${i}`)); });
  return b;
}

function startNight(state, night, data, board = null) {
  const eclipse = eclipseFor(state, night, data);
  state.night = night;
  state.phase = 'night';
  state.shop = null;
  state.reward = null;
  const b = board || makeBoard(state, night, eclipse, data);
  state.n = {
    night, eclipse, board: b, apertures: b.apertures.map((a) => ({ ...a })),
    target: targetFor(state, night, data), casts: 0, castIndex: 0, lux: 0, castLux: [],
    draw: [], discard: [], hand: [], placed: [], fixedFacing: {},
    redrawn: false, placedThisCast: 0, silkedUsed: false, colorsSeen: [], glints: 0, reshuffles: 0, cleared: false, reachedAt: null,
  };
  state.n.casts = castsThisNight(state, data);
  const carry = state.carry.filter((u) => state.gems[u]);
  state.carry = [];
  const pile = state.pouch.filter((u) => !carry.includes(u));
  rng(state.seed, 'shuffle', night).shuffle(pile);
  state.n.draw = pile;
  state.n.hand = carry.slice();
  drawUp(state, data);
  // Opening hand: at least openingMirrors Mirrors while the pouch holds them.
  const need = data.rules.night.openingMirrors;
  const isMirror = (u) => data.cut[state.gems[u].cut].fn === 'reflect';
  let have = state.n.hand.filter(isMirror).length;
  while (have < need) {
    const j = state.n.draw.findIndex(isMirror);
    if (j < 0) break;
    let i = -1;
    for (let k = state.n.hand.length - 1; k >= 0; k--) if (!isMirror(state.n.hand[k]) && !carry.includes(state.n.hand[k])) { i = k; break; }
    if (i < 0) break;
    const t = state.n.hand[i]; state.n.hand[i] = state.n.draw[j]; state.n.draw[j] = t;
    have++;
  }
}

function drawCards(state, count, data) {
  const n = state.n;
  for (let k = 0; k < count; k++) {
    if (!n.draw.length) {
      if (!n.discard.length) return;
      n.draw = n.discard.splice(0);
      rng(state.seed, 'reshuffle', n.night, n.reshuffles++).shuffle(n.draw);
    }
    n.hand.push(n.draw.shift());
  }
}

function drawUp(state, data) {
  const size = handSize(state, data);
  drawCards(state, Math.max(0, size - state.n.hand.length), data);
}

function doCast(state, data) {
  const n = state.n;
  const tremor = tremorTarget(state, data);
  if (tremor !== null) { const p = n.placed.find((x) => x.cell === tremor); p.facing = (p.facing + 1) % 6; }
  const board = castBoard(state, false, data);
  const res = cast(board, { ...castContext(state, data), events: true }, data);
  if (typeof state._onCast === 'function') state._onCast(res, board); // harness hook (not saved)
  if (state.opts.tutorial) {
    // Night 0: each cast stands alone; reaching the goal in one cast finishes the board.
    n.lux = res.lux;
    n.castLux.push(res.lux);
    n.castIndex++;
    n.placedThisCast = 0; n.silkedUsed = false;
    if (res.lux >= n.target) { n.cleared = true; state.phase = 'tutorialDone'; }
    return { ...res, tremor: null };
  }
  n.lux = Math.max(0, n.lux + res.lux - (res.unpaidTax || 0)); // Glass Tax shortfall comes off the Night (R17)
  n.castLux.push(res.lux);
  n.glints += res.glints;
  state.glints += res.glints;
  for (const s of res.scores) if (s.kind === 'aperture' && !n.colorsSeen.includes(s.color)) n.colorsSeen.push(s.color);
  // Gems keep any rotation the cast gave them (Chatoyant).
  for (const p of n.placed) if (res.facings[p.cell] !== undefined) p.facing = res.facings[p.cell];
  for (const f of n.board.fixed) if (res.facings[f.cell] !== undefined) n.fixedFacing[f.cell] = res.facings[f.cell];
  state.stats.totalLux += res.lux;
  state.stats.casts++;
  state.stats.dawns += res.dawns;
  if (!state.stats.bestCast || res.lux > state.stats.bestCast.lux) state.stats.bestCast = { lux: res.lux, night: n.night, cast: n.castIndex + 1, log: state.log.length };
  // Long-game tracking: each gem's best cast, the most strikes one beam made, Dawn with both Apertures lit.
  for (const p of n.placed) { const gm = state.gems[p.uid]; if (gm) gm.bestLux = Math.max(gm.bestLux || 0, res.lux); }
  const perBeam = {};
  for (const e of res.events) if (e.strike && e.beamId >= 0) perBeam[e.beamId] = (perBeam[e.beamId] || 0) + 1;
  for (const v of Object.values(perBeam)) if (v > state.stats.maxBeamStrikes) state.stats.maxBeamStrikes = v;
  if (res.dawns > 0 && n.apertures.length >= 2 && new Set(res.scores.filter((s) => s.kind === 'aperture').map((s) => s.cell)).size >= 2) state.stats.dawnBothApertures = true;
  n.castIndex++;
  n.redrawn = false; n.placedThisCast = 0; n.silkedUsed = false;
  if (modifiers(state, data).apertureDrift) drift(state, data);
  if (n.lux >= n.target && n.reachedAt === null) n.reachedAt = n.castIndex;
  if (state.opts.measure) {
    // Harness measurement: play every cast; the Night counts as cleared for progression.
    if (n.castIndex >= n.casts) endNight(state, n.reachedAt !== null, data);
    else drawUp(state, data);
  } else if (n.lux >= n.target) endNight(state, true, data);
  else if (n.castIndex >= n.casts) endNight(state, false, data);
  else drawUp(state, data);
  return { ...res, tremor };
}

// Drift: each aperture moves one edge cell clockwise, skipping walls, lanterns, other apertures and
// Dense gems; a non-Dense gem in the way returns to the pouch (bottom of the draw pile).
function drift(state, data) {
  const n = state.n;
  const g = grid(n.board.radius);
  const E = g.edge;
  for (const a of n.apertures) {
    let i = E.indexOf(a.cell);
    for (let k = 0; k < E.length; k++) {
      i = (i + 1) % E.length;
      const c = E[i];
      if (n.board.walls.includes(c) || n.board.lanterns.some((l) => l.cell === c) || n.apertures.some((o) => o !== a && o.cell === c) || n.board.fixed.some((f) => f.cell === c)) continue;
      const p = n.placed.find((x) => x.cell === c);
      if (p) {
        const f = inclusionFlags(state.gems[p.uid].inclusion || null, data);
        if ((f.immuneEclipseKinds || []).includes('apertureDrift')) continue;
        n.placed = n.placed.filter((x) => x !== p);
        n.draw.push(p.uid);
      }
      a.cell = c;
      break;
    }
  }
}

function endNight(state, cleared, data) {
  const n = state.n;
  const R = data.rules;
  const m = modifiers(state, data);
  n.cleared = cleared;
  const pay = { clear: 0, unused: 0, overkill: 0, rainbow: 0, interest: 0, casts: n.glints };
  const measure = !!state.opts.measure;
  if (cleared) {
    pay.clear = n.eclipse ? R.glints.clearEclipse : R.glints.clear;
    pay.unused = R.glints.unusedCast * (n.casts - (measure ? n.reachedAt : n.castIndex));
    let over = Math.floor(((n.lux - n.target) * 100) / (n.target * R.glints.overkillStepPct));
    over = Math.max(0, Math.min(R.glints.overkillMax, over));
    if (m.overkillMult) over = Math.min(m.overkillMult.max, over * m.overkillMult.value);
    pay.overkill = over;
    if (m.glintsPerDistinctColor) pay.rainbow = Math.min(m.glintsPerDistinctColor.max, n.colorsSeen.length);
    state.glints += pay.clear + pay.unused + pay.overkill + pay.rainbow;
    if (m.interest) { pay.interest = Math.min(m.interest.max, Math.floor(state.glints / m.interest.per)); state.glints += pay.interest; }
    state.stats.nightsCleared++;
    if (n.eclipse) state.stats.eclipsesBeaten++;
  }
  // Dawn: board and hand return to the pouch; Feathered gems carry to the next opening hand;
  // Fractured gems are destroyed; every surviving gem has survived one more Night.
  const onBoardOrHand = [...n.placed.map((p) => p.uid), ...n.hand];
  state.carry = onBoardOrHand.filter((u) => inclusionFlags(state.gems[u].inclusion || null, data).keepInHand);
  for (const u of state.pouch.slice()) if (inclusionFlags(state.gems[u].inclusion || null, data).destroyAtDawn) removeGem(state, u);
  for (const u of state.pouch) state.gems[u].nightsSurvived++;
  state.history.push({ night: n.night, target: n.target, lux: n.lux, castLux: n.castLux.slice(), cleared, reachedAt: n.reachedAt, eclipse: n.eclipse, pay, board: { features: n.board.features, sub: n.board.sub } });
  state.lastPay = pay;
  if (!cleared && !(measure && n.night < R.run.nights)) { state.phase = 'lost'; return; }
  if (n.night === R.run.nights && !state.endless) { state.phase = 'won'; return; }
  if (n.eclipse) { openReward(state, data); return; }
  openShop(state, data);
}

// ------------------------------------------------------------------ Lapidary

function band(night, data) {
  return data.shop.bands.find((b) => night >= b.fromNight && night <= b.toNight) || data.shop.bands[data.shop.bands.length - 1];
}

function rollGemSpec(R, night, mods, forceInclusion, data) {
  const bd = band(night, data);
  const rarity = R.weighted([['common', bd.common], ['uncommon', bd.uncommon], ['rare', bd.rare]]);
  const cut = R.pick(data.cuts.filter((c) => c.rarity === rarity)).id;
  const stone = R.weighted(data.stones.filter((s) => !s.neutral && s.shopWeight > 0).map((s) => [s.id, s.shopWeight]));
  const pct = Math.min(100, bd.inclusionPct * (mods ? mods.inclusionOddsMult : 1));
  const inclusion = forceInclusion || R.chance(pct / 100) ? R.pick(data.inclusions).id : null;
  return { cut, stone, tier: 0, inclusion };
}

function stockShop(state, data) {
  const s = state.shop;
  const m = modifiers(state, data);
  const R = rng(state.seed, 'shop', state.night, s.rerolls);
  const count = (m.shopGems ?? data.shop.gemsOffered);
  s.gems = [];
  for (let i = 0; i < count; i++) {
    const spec = rollGemSpec(R, state.night, m, false, data);
    const gemId = gemIdFor(state.seed, state.dropIndex++);
    s.gems.push({ ...spec, gemId, name: gemName({ ...spec, gemId }, data), price: gemPrice(spec, data) + vigilEffects(state.vigil, data).shopAdd, sold: false });
  }
  // Guarantee one offer related to the pouch (shares a stone or a cut).
  const pouchGems = state.pouch.map((u) => state.gems[u]);
  if (data.shop.guaranteeRelated && pouchGems.length && !s.gems.some((o) => pouchGems.some((p) => p.cut === o.cut || p.stone === o.stone))) {
    const o = s.gems[0];
    o.stone = R.pick(pouchGems).stone;
    o.name = gemName(o, data);
  }
  const unseen = data.settings.map((x) => x.id).filter((id) => !state.offeredSettings.includes(id) && !state.settings.includes(id));
  s.settings = [];
  for (let i = 0; i < data.shop.settingsOffered && unseen.length; i++) {
    const id = unseen.splice(R.int(unseen.length), 1)[0];
    state.offeredSettings.push(id);
    s.settings.push({ id, price: settingPrice(id, data) + vigilEffects(state.vigil, data).shopAdd, sold: false });
  }
}

function openShop(state, data) {
  state.phase = 'shop';
  state.reward = null;
  state.shop = { night: state.night, rerolls: 0, freeUsed: false, gems: [], settings: [] };
  stockShop(state, data);
  // The next Night's board and Eclipse are fixed now and shown at the Lapidary.
  const next = state.night + 1;
  state.shop.nextEclipse = eclipseFor(state, next, data);
  state.shop.nextBoard = makeBoard(state, next, state.shop.nextEclipse, data);
  state.shop.nextTarget = targetFor(state, next, data);
}

function openReward(state, data) {
  state.phase = 'reward';
  const R = rng(state.seed, 'reward', state.night);
  const offers = [];
  for (let i = 0; i < data.shop.eclipseRewardChoices; i++) {
    const spec = rollGemSpec(R, state.night, null, true, data);
    const gemId = gemIdFor(state.seed, state.dropIndex++);
    offers.push({ ...spec, gemId, name: gemName({ ...spec, gemId }, data) });
  }
  // A Legend gem drops only from its own Eclipse in Endless.
  const legend = legendFor(state.n.eclipse, state.night, data);
  if (legend) offers[0] = { cut: legend.cut, stone: legend.stone, tier: legend.tier, inclusion: legend.inclusion, gemId: legend.gemId, name: legend.name, legend: legend.id };
  state.reward = { offers };
}

function spend(state, cost, what) {
  if (state.glints < cost) fail(`not enough Glints for ${what} (${cost})`);
  state.glints -= cost;
}

function serviceCost(state, kind, data) {
  const m = modifiers(state, data);
  if (m.freeService && !state.shop.freeUsed && m.freeService.services.includes(kind)) return { cost: 0, free: true };
  return { cost: data.prices.services[kind], free: false };
}

const RARITY_RANK = { common: 0, uncommon: 1, rare: 2 };

// ------------------------------------------------------------------ actions

export function step(state, action, data = DATA) {
  const res = apply(state, action, data);
  state.log.push(action);
  return res;
}

function apply(state, a, data) {
  const R = data.rules;
  switch (state.phase) {
    case 'night': {
      const n = state.n;
      switch (a.type) {
        case 'redraw': {
          if (redrawsPerCast(state, data) < 1) fail('no redraws on this Vigil');
          if (n.redrawn) fail('already redrew this cast');
          const uids = a.uids || [];
          for (const u of uids) if (!n.hand.includes(u)) fail(`gem ${u} not in hand`);
          n.hand = n.hand.filter((u) => !uids.includes(u));
          n.discard.push(...uids);
          drawCards(state, uids.length, data);
          n.redrawn = true;
          return {};
        }
        case 'place': {
          if (!n.hand.includes(a.uid)) fail(`gem ${a.uid} not in hand`);
          const g = grid(n.board.radius);
          if (!(a.cell >= 0 && a.cell < g.n)) fail('no such cell');
          if (occupied(state, a.cell)) fail('cell is taken');
          const f = inclusionFlags(state.gems[a.uid].inclusion || null, data);
          let free = false;
          if (f.freePlacement && !n.silkedUsed) { free = true; n.silkedUsed = true; }
          else if (n.placedThisCast >= placementLimit(state, data)) fail('no placements left this cast');
          else n.placedThisCast++;
          n.hand = n.hand.filter((u) => u !== a.uid);
          n.placed.push({ uid: a.uid, cell: a.cell, facing: ((a.facing | 0) % 6 + 6) % 6, cast: n.castIndex, free });
          if (data.cut[state.gems[a.uid].cut].fn === 'reflect') state.stats.mirrorsPlaced = (state.stats.mirrorsPlaced || 0) + 1;
          return {};
        }
        case 'unplace': {
          const p = n.placed.find((x) => x.uid === a.uid);
          if (!p) fail('not on the board');
          if (p.locked) fail('this gem is set in place');
          if (p.cast !== n.castIndex && !state.opts.tutorial) fail('placed on an earlier cast: locked for the Night');
          n.placed = n.placed.filter((x) => x !== p);
          if (p.free) n.silkedUsed = false; else if (p.cast === n.castIndex) n.placedThisCast--;
          n.hand.push(a.uid);
          return {};
        }
        case 'move': {
          const p = n.placed.find((x) => x.uid === a.uid);
          if (!p) fail('not on the board');
          if (p.locked) fail('this gem is set in place');
          if (p.cast !== n.castIndex && !state.opts.tutorial) fail('locked for the Night');
          if (occupied(state, a.cell)) fail('cell is taken');
          p.cell = a.cell;
          return {};
        }
        case 'rotate': {
          const by = a.by === -1 ? 5 : 1;
          const p = n.placed.find((x) => x.cell === a.cell);
          if (p && p.locked) fail('this gem is set in place');
          if (p) { p.facing = (p.facing + by) % 6; return {}; }
          if (n.board.fixed.some((x) => x.cell === a.cell) && !data.features.gen.fixedGemsRotate) fail('fixed gems cannot be moved or turned');
          const f = n.board.fixed.find((x) => x.cell === a.cell);
          if (f) { n.fixedFacing[f.cell] = ((n.fixedFacing[f.cell] ?? f.facing) + by) % 6; return {}; }
          fail('nothing to rotate there');
          return {};
        }
        case 'cast':
          return { cast: doCast(state, data) };
        default: fail(`bad action ${a.type} at night`);
      }
      return {};
    }
    case 'reward': {
      if (a.type === 'pickReward') {
        const o = state.reward.offers[a.index];
        if (!o) fail('no such reward');
        if (state.pouch.length >= R.run.pouchCap) fail('pouch is full');
        const gem = addGem(state, { ...o, keepId: true, origin: 'reward' }, data);
        state.stats.inclusionGems.push(gem.uid);
        openShop(state, data);
        return {};
      }
      if (a.type === 'skipReward') { openShop(state, data); return {}; }
      fail(`bad action ${a.type} at reward`);
      return {};
    }
    case 'shop': {
      const s = state.shop;
      const m = modifiers(state, data);
      switch (a.type) {
        case 'buyGem': {
          const o = s.gems[a.index];
          if (!o || o.sold) fail('no such gem');
          if (state.pouch.length >= R.run.pouchCap) fail('pouch is full');
          spend(state, o.price, 'gem');
          o.sold = true;
          const gem = addGem(state, { ...o, keepId: true, origin: 'shop' }, data);
          if (gem.inclusion) state.stats.inclusionGems.push(gem.uid);
          return {};
        }
        case 'buySetting': {
          const o = s.settings[a.index];
          if (!o || o.sold) fail('no such Setting');
          if (state.settings.length >= R.run.maxSettings && !a.replace) fail('holding the maximum Settings');
          if (a.replace && !state.settings.includes(a.replace)) fail('replace a Setting you hold');
          spend(state, o.price, 'Setting');
          o.sold = true;
          if (a.replace) state.settings = state.settings.filter((x) => x !== a.replace);
          state.settings.push(o.id);
          return {};
        }
        case 'reroll': {
          const cost = data.prices.reroll.base + data.prices.reroll.step * s.rerolls;
          spend(state, cost, 'reroll');
          s.rerolls++;
          stockShop(state, data);
          return {};
        }
        case 'recut': {
          const gm = state.gems[a.uid];
          if (!gm) fail('no such gem');
          const to = data.cut[a.cut];
          if (!to || to.id === gm.cut || RARITY_RANK[to.rarity] > RARITY_RANK[data.cut[gm.cut].rarity]) fail('recut to a different cut of equal or lower rarity');
          const { cost, free } = serviceCost(state, 'recut', data);
          spend(state, cost, 'recut');
          if (free) s.freeUsed = true;
          gm.cut = to.id;
          gm.legend = null; // a recut or dyed Legend is no longer that Legend
          gm.name = gemName(gm, data);
          return {};
        }
        case 'dye': {
          const gm = state.gems[a.uid];
          if (!gm) fail('no such gem');
          if (!data.shop.dyeStones.includes(a.stone) || a.stone === gm.stone) fail('dye to another coloured stone');
          const { cost, free } = serviceCost(state, 'dye', data);
          spend(state, cost, 'dye');
          if (free) s.freeUsed = true;
          gm.stone = a.stone;
          gm.legend = null; // a recut or dyed Legend is no longer that Legend
          gm.name = gemName(gm, data);
          return {};
        }
        case 'fuse': {
          const [x, y] = (a.uids || []).map((u) => state.gems[u]);
          if (!x || !y || x === y) fail('fuse two gems');
          if (!sameKind(x, y)) fail('fuse needs identical gems');
          if (x.tier >= R.fuseMaxTier) fail('already Brilliant');
          spend(state, data.prices.services.fuse, 'fuse');
          x.tier++;
          removeGem(state, y.uid);
          return {};
        }
        case 'remove': {
          if (!state.gems[a.uid]) fail('no such gem');
          if (state.pouch.length <= 1) fail('the pouch cannot be empty');
          spend(state, data.prices.services.remove, 'remove');
          removeGem(state, a.uid);
          return {};
        }
        case 'sell': {
          const gm = state.gems[a.uid];
          if (!gm) fail('no such gem');
          if (state.pouch.length <= 1) fail('the pouch cannot be empty');
          state.glints += sellPrice(gm, m.sellFraction, data);
          removeGem(state, a.uid);
          return {};
        }
        case 'loan': {
          // Heirloom: one more Cabinet gem may join the pouch mid-run (the gem travels in the action).
          const limit = m.loans ?? R.run.loans;
          const loaned = state.pouch.map((u) => state.gems[u]).filter((g) => g.loaned);
          const g = a.gem;
          if (!g || g.cabinetId === undefined) fail('no such Cabinet gem');
          if (loaned.some((x) => x.cabinetId === g.cabinetId)) fail('already loaned');
          const err = validLoans([...loaned, g], limit);
          if (err) fail(err);
          if (state.pouch.length >= R.run.pouchCap) fail('pouch is full');
          addGem(state, { ...g, origin: 'loan', loaned: true, keepId: true }, data);
          return {};
        }
        case 'leave': {
          const next = state.night + 1;
          const board = s.nextBoard;
          startNight(state, next, data, board);
          return {};
        }
        default: fail(`bad action ${a.type} at the Lapidary`);
      }
      return {};
    }
    case 'won': {
      if (a.type === 'endless') { state.endless = true; openShop(state, data); return {}; }
      fail(`bad action ${a.type} after the win`);
      return {};
    }
    default:
      fail(`the run is over (${state.phase})`);
  }
  return {};
}

export function replay(opts, log, data = DATA) {
  const s = newRun(opts, data);
  for (const a of log) step(s, a, data);
  return s;
}

// Everything that matters in a run, as one string (determinism checks).
export const fingerprint = (state) => JSON.stringify(state);
