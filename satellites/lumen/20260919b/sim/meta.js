// The long game (section 10), pure: what a finished run does to the save. Cabinet (drawers by stone,
// capacity, Dust, Inclusion rerolls), loans (a loaned gem that is Fractured or sold is gone for good),
// Lantern unlocks, the Vigil ladder, the 40 achievements. Every rule is a data row read by kind.
import { DATA } from './data.js';
import { hash } from './rng.js';
import { gemName } from './gems.js';
import CABINET from '../data/cabinet.json' with { type: 'json' };
import ACHIEVEMENTS from '../data/achievements.json' with { type: 'json' };
import LEGENDS from '../data/legends.json' with { type: 'json' };

export { CABINET, ACHIEVEMENTS, LEGENDS };

// Loans: up to 2 Cabinet gems (3 with Heirloom), no two sharing an Inclusion (section 3).
export function validLoans(gems, limit = DATA.rules.run.loans) {
  if (gems.length > limit) return `at most ${limit} loans`;
  const incl = gems.map((g) => g.inclusion).filter(Boolean);
  if (new Set(incl).size !== incl.length) return 'loaned gems may not share an Inclusion';
  return null;
}

export function runSummary(state, data = DATA) {
  const s = state.stats;
  const cleared = state.history.filter((h) => h.cleared);
  const inPouch = state.pouch.map((u) => state.gems[u]);
  const archCount = {};
  for (const id of state.settings) { const a = data.setting[id].archetype; archCount[a] = (archCount[a] || 0) + 1; }
  const loanedIn = (state.opts.loans || []).map((l) => l.cabinetId).filter((x) => x !== undefined && x !== null);
  const loanedStill = new Set(inPouch.filter((g) => g.loaned).map((g) => g.cabinetId));
  return {
    seed: state.seed, lantern: state.lantern, vigil: state.vigil, won: state.phase === 'won' || state.endless,
    totalLux: s.totalLux, bestCast: s.bestCast ? s.bestCast.lux : 0, dawns: s.dawns, eclipsesBeaten: s.eclipsesBeaten,
    nightsCleared: cleared.length, endlessNight: cleared.length ? Math.max(...cleared.map((h) => h.night)) : 0,
    settings: state.settings.slice(), archCount, pouchSize: state.pouch.length,
    mirrorsPlaced: s.mirrorsPlaced || 0, maxBeamStrikes: s.maxBeamStrikes || 0, dawnBothApertures: !!s.dawnBothApertures,
    maxOverkill: Math.max(0, ...state.history.map((h) => (h.target ? h.lux / h.target : 0))),
    kept: inPouch.filter((g) => g.inclusion && !g.loaned).map((g) => ({ ...g })),
    loansLost: loanedIn.filter((id) => !loanedStill.has(id)),
    loanBest: inPouch.filter((g) => g.loaned).map((g) => ({ cabinetId: g.cabinetId, bestLux: g.bestLux || 0 })),
  };
}

function drawers(cabinet) {
  const d = {};
  for (const g of cabinet) d[g.stone] = (d[g.stone] || 0) + 1;
  return d;
}

export function cabinetAdd(save, gems, run) {
  const added = [];
  let ground = 0;
  for (const g of gems) {
    const entry = {
      cabinetId: hash('cab', g.gemId, save.cabinet.length, run.seed) >>> 0, gemId: g.gemId, name: g.name, cut: g.cut, stone: g.stone, tier: g.tier,
      inclusion: g.inclusion, fromRun: run.seed, lantern: run.lantern, bestLux: g.bestLux || 0, legend: g.legend || null, rerolls: 0,
    };
    if (save.cabinet.length >= CABINET.capacity) { save.dust += CABINET.dustPerGem; ground++; continue; }
    save.cabinet.push(entry);
    added.push(entry);
  }
  return { added, ground };
}

export function grind(save, cabinetId) {
  const i = save.cabinet.findIndex((g) => g.cabinetId === cabinetId);
  if (i < 0) return false;
  save.cabinet.splice(i, 1);
  save.dust += CABINET.dustPerGem;
  return true;
}

// 100 Dust re-rolls the Inclusion on one Cabinet gem (seeded: the same gem and roll count give the same result).
export function rerollInclusion(save, cabinetId, data = DATA) {
  const g = save.cabinet.find((x) => x.cabinetId === cabinetId);
  if (!g || save.dust < CABINET.rerollCost) return null;
  const pool = data.inclusions.map((x) => x.id).filter((id) => id !== g.inclusion);
  g.inclusion = pool[hash('reroll', g.cabinetId, g.rerolls) % pool.length];
  g.rerolls++;
  g.name = gemName(g, data);
  save.dust -= CABINET.rerollCost;
  save.stats.rerolls = (save.stats.rerolls || 0) + 1;
  return g;
}

function unlockMet(u, sum, save, data) {
  switch (u.kind) {
    case 'start': return true;
    case 'winRun': return sum.won;
    case 'dawnWithBothApertures': return sum.dawnBothApertures;
    case 'winWithArchetype': return sum.won && (sum.archCount[u.archetype] || 0) >= u.count;
    case 'cabinetAllStones': return data.stones.filter((s) => !s.neutral).every((s) => save.cabinet.some((g) => g.stone === s.id));
    case 'winWithPouchAtMost': return sum.won && sum.pouchSize <= u.pouch;
    case 'reachEndlessNight': return sum.endlessNight >= u.night;
    default: return false;
  }
}

function achievementMet(a, sum, save, data) {
  const st = save.stats;
  switch (a.kind) {
    case 'nightsClearedTotal': return (st.nightsCleared || 0) >= a.value;
    case 'dawnsTotal': return st.dawns >= a.value;
    case 'bestCast': return st.bestCast >= a.value;
    case 'eclipsesTotal': return st.eclipsesBeaten >= a.value;
    case 'wins': return st.wins >= a.value;
    case 'winWithLantern': return sum.won && sum.lantern === a.lantern;
    case 'winNoMirrors': return sum.won && sum.mirrorsPlaced === 0;
    case 'beamStrikes': return sum.maxBeamStrikes >= a.value;
    case 'winArchetype': return sum.won && (sum.archCount[a.archetype] || 0) >= a.value;
    case 'winPouchAtMost': return sum.won && sum.pouchSize <= a.value;
    case 'dawnBothApertures': return sum.dawnBothApertures;
    case 'endlessNight': return sum.endlessNight >= a.value;
    case 'cabinetGems': return save.cabinet.length >= a.value;
    case 'cabinetDrawer': return Object.values(drawers(save.cabinet)).some((n) => n >= CABINET.drawerSize);
    case 'cabinetInclusions': return new Set(save.cabinet.map((g) => g.inclusion).filter(Boolean)).size >= a.value;
    case 'legends': return save.cabinet.filter((g) => g.legend).length >= a.value;
    case 'vigil': return sum.won && sum.vigil >= a.value;
    case 'overkillRatio': return sum.maxOverkill >= a.value;
    default: void data; return false;
  }
}

// Fold a finished run into the save. Returns what changed, for the run summary screen.
export function applyRun(save, state, data = DATA, now = 0) {
  const sum = runSummary(state, data);
  const st = save.stats;
  st.runs++;
  if (sum.won) st.wins++;
  st.totalLux += sum.totalLux;
  st.bestCast = Math.max(st.bestCast, sum.bestCast);
  st.dawns += sum.dawns;
  st.eclipsesBeaten += sum.eclipsesBeaten;
  st.nightsCleared = (st.nightsCleared || 0) + sum.nightsCleared;
  st.endlessBest = Math.max(st.endlessBest || 0, sum.endlessNight);
  // Loans: lost for good if Fractured or sold; the rest keep their best Lux.
  save.cabinet = save.cabinet.filter((g) => !sum.loansLost.includes(g.cabinetId));
  for (const l of sum.loanBest) { const g = save.cabinet.find((x) => x.cabinetId === l.cabinetId); if (g) g.bestLux = Math.max(g.bestLux, l.bestLux); }
  const { added, ground } = cabinetAdd(save, sum.kept, state);
  // Lantern unlocks and the Vigil ladder.
  const unlocked = [];
  for (const L of data.lanterns) {
    if (!save.unlocks.lanterns.includes(L.id) && unlockMet(L.unlock, sum, save, data)) { save.unlocks.lanterns.push(L.id); unlocked.push(L.id); }
  }
  let vigilCleared = null;
  if (sum.won) {
    const prev = save.unlocks.vigil[sum.lantern] ?? -1;
    if (sum.vigil > prev) { save.unlocks.vigil[sum.lantern] = Math.min(CABINET.vigilMax, sum.vigil); vigilCleared = sum.vigil; }
  }
  const earned = [];
  for (const a of ACHIEVEMENTS.achievements) {
    if (save.achievements[a.id]) continue;
    if (achievementMet(a, sum, save, data)) { save.achievements[a.id] = now || 1; earned.push(a.id); }
  }
  return { summary: sum, added, ground, lost: sum.loansLost, unlocked, vigilCleared, earned };
}

// Highest Vigil a player may start on with a Lantern: one above the highest cleared, from 0.
export function vigilAvailable(save, lantern) {
  const c = save.unlocks.vigil[lantern];
  return c === undefined ? 0 : Math.min(CABINET.vigilMax, c + 1);
}

export function legendFor(eclipse, night, data = DATA) {
  if (night <= data.rules.run.nights) return null;
  return LEGENDS.legends.find((l) => l.eclipse === eclipse) || null;
}
