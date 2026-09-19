// Hook registry. Settings, Eclipses and Lantern rules are data rows whose effects[].kind this file
// compiles into flat per-cast hooks (onStrike, onLensFire, onAperture, onTravel, onCastEnd) and
// per-run modifiers (hand size, casts, placements, targets, shop, Glints). No content ids here.
import { DATA } from './data.js';

export const popcount = (c) => (c & 1) + ((c >> 1) & 1) + ((c >> 2) & 1);

// Does an effect's `when` condition hold? gem may be null for beam-only conditions.
export function whenHolds(w, gem, color, strikeNumber, center) {
  if (!w) return true;
  if (w.cut !== undefined && (!gem || gem.cutId !== w.cut)) return false;
  if (w.stone !== undefined && (!gem || gem.stoneId !== w.stone)) return false;
  if (w.beamHas !== undefined && (color & w.beamHas) === 0) return false;
  if (w.beamColor !== undefined && color !== w.beamColor) return false;
  if (w.beamChannels !== undefined && popcount(color) !== w.beamChannels) return false;
  if (w.strikeNumber !== undefined && strikeNumber !== w.strikeNumber) return false;
  if (w.centerCell && (!gem || gem.cell !== center)) return false;
  if (w.adjacentGemsAtLeast !== undefined && (!gem || gem.adjacent < w.adjacentGemsAtLeast)) return false;
  return true;
}

function effectsOf(rows, ids) {
  const out = [];
  for (const id of ids || []) {
    const row = rows[id];
    if (!row) throw new Error(`unknown content id: ${id}`);
    for (const e of row.effects) out.push(e);
  }
  return out;
}

const cache = new Map();

// Flat cast hooks for one (settings, eclipse, lantern rules) combination. Cached by key.
export function compileCastRules(ctx, data = DATA) {
  const settings = ctx.settings || [];
  const eclipse = ctx.eclipse || null;
  const lanternRules = ctx.lanternRules || [];
  const key = data === DATA ? settings.join(',') + '|' + (eclipse || '') + '|' + JSON.stringify(lanternRules) + '|' + (ctx.vigilCommonCap ?? '') : null;
  if (key !== null && cache.has(key)) return cache.get(key);
  const R = data.rules;
  const h = {
    weight: [], capAdd: [], strikeAdd: [], sympathyBase: [], sympathyAlways: [], prismEmitAdd: 0,
    splitColors: null, splitFraction: null,
    dawnMult: R.dawn.mult, dawnLimit: R.dawn.limit, lensFires: R.lens.fires, lensFocusToMax: null,
    lanternColor: null, lanternIntensity: null, emptyCellAdd: [], lapFocusMult: null, lapGlint: null,
    cappedPassAdd: null, wrapOnce: false, tierAddShared: 0, apertureMult: [], whiteBalance: false,
    castMultAllStones: 0, apertureWiden: false,
    // Eclipse
    stripMask: 0, capClamp: null, disableCut: null, luxPerGem: 0, invertColumn: null, onlyDawnWhite: 0,
    // Lantern rules
    noSympathy: false, resonatorFocusAdd: 0,
    // Vigil
    vigilCommonCap: ctx.vigilCommonCap ?? null,
  };
  for (const e of effectsOf(data.setting, settings)) {
    switch (e.kind) {
      case 'weight': h.weight.push(e); break;
      case 'strikeCapAdd': h.capAdd.push(e); break;
      case 'strikeAdd': h.strikeAdd.push(e); break;
      case 'sympathyBase': h.sympathyBase.push(e); break;
      case 'sympathyAlways': h.sympathyAlways.push(e); break;
      case 'prismEmitAdd': h.prismEmitAdd += e.value; break;
      case 'splitColors': h.splitColors = e; break;
      case 'splitFraction': h.splitFraction = e; break;
      case 'dawnMult': h.dawnMult = e.value; break;
      case 'dawnLimit': h.dawnLimit = e.value; break;
      case 'lensFires': h.lensFires = e.value; break;
      case 'lensFocusToMax': h.lensFocusToMax = e; break;
      case 'lanternColor': h.lanternColor = e; break;
      case 'emptyCellAdd': h.emptyCellAdd.push(e); break;
      case 'lapFocusMult': h.lapFocusMult = e; break;
      case 'lapGlint': h.lapGlint = e; break;
      case 'cappedPassAdd': h.cappedPassAdd = e; break;
      case 'wrapOnce': h.wrapOnce = true; break;
      case 'tierAddIfSharedChannel': h.tierAddShared += e.value; break;
      case 'apertureMult': h.apertureMult.push(e); break;
      case 'whiteBalance': h.whiteBalance = true; break;
      case 'castMultIfAllStones': h.castMultAllStones = e.value; break;
      case 'apertureWiden': h.apertureWiden = true; break;
      default: break; // run-level kinds are read by runModifiers()
    }
  }
  if (eclipse) {
    for (const e of effectsOf(data.eclipse, [eclipse])) {
      switch (e.kind) {
        case 'stripChannels': h.stripMask |= e.mask; break;
        case 'strikeCapClamp': h.capClamp = e.value; break;
        case 'disableCut': h.disableCut = e.cut; break;
        case 'luxPerGem': h.luxPerGem = e.value; break;
        case 'invertAtColumn': h.invertColumn = e.q; break;
        case 'onlyDawnWhite': h.onlyDawnWhite = e.mult; break;
        case 'lanternIntensity': h.lanternIntensity = e.value; break;
        default: break;
      }
    }
  }
  for (const e of lanternRules) {
    if (e.kind === 'noSympathy') h.noSympathy = true;
    else if (e.kind === 'resonatorFocusAdd') h.resonatorFocusAdd += e.value;
  }
  if (key !== null) cache.set(key, h);
  return h;
}

// Run-level modifiers from held Settings and the Night's Eclipse (hand, casts, placements, shop, Glints).
export function runModifiers(settingIds, eclipseId, data = DATA) {
  const m = {
    castsAdd: 0, handSizeSet: null, targetPct: 0, placementsAdd: [], placementsMax: null,
    shopGems: null, sellFraction: null, interest: null, overkillMult: null, freeService: null,
    inclusionOddsMult: 1, handSizeAddIfPouchAtMost: null, loans: null, glintsPerDistinctColor: null,
    apertureDrift: false, rotateRandomGem: false, noPreview: false, darkHalf: false,
  };
  const all = effectsOf(data.setting, settingIds);
  if (eclipseId) all.push(...effectsOf(data.eclipse, [eclipseId]));
  for (const e of all) {
    switch (e.kind) {
      case 'castsAdd': m.castsAdd += e.value; break;
      case 'handSizeSet': m.handSizeSet = m.handSizeSet === null ? e.value : Math.min(m.handSizeSet, e.value); break;
      case 'targetPct': m.targetPct += e.value; break;
      case 'placementsAdd': m.placementsAdd.push(e); break;
      case 'placementsMax': m.placementsMax = e.value; break;
      case 'shopGems': m.shopGems = e.value; break;
      case 'sellFraction': m.sellFraction = e; break;
      case 'interest': m.interest = e; break;
      case 'overkillMult': m.overkillMult = e; break;
      case 'freeService': m.freeService = e; break;
      case 'inclusionOddsMult': m.inclusionOddsMult *= e.value; break;
      case 'handSizeAddIfPouchAtMost': m.handSizeAddIfPouchAtMost = e; break;
      case 'loans': m.loans = e.value; break;
      case 'glintsPerDistinctColor': m.glintsPerDistinctColor = e; break;
      case 'apertureDrift': m.apertureDrift = true; break;
      case 'rotateRandomGem': m.rotateRandomGem = true; break;
      case 'noPreview': m.noPreview = true; break;
      case 'darkHalf': m.darkHalf = true; break;
      default: break;
    }
  }
  return m;
}

// Inclusion effects for one gem, flattened (cached for the shipped data tables).
const inclCache = new Map();
export function inclusionFlags(inclusionId, data = DATA) {
  if (data === DATA && inclCache.has(inclusionId)) return inclCache.get(inclusionId);
  const f = buildInclusionFlags(inclusionId, data);
  if (data === DATA) inclCache.set(inclusionId, f);
  return f;
}
function buildInclusionFlags(inclusionId, data) {
  const f = {
    w10: 0, capBase: null, extraChannel: false, perDistinct: 0, sympathyBase: null, firstStrikeGlint: 0,
    ignoreEclipseKinds: null, tierAdd: 0, spawnRing: null, rotateAfterStrike: false, countsDouble: null,
    sympathyPerNight: 0, skipCut: false, stoneCycle: null, allFaces: false, immuneEclipseKinds: null,
    adjacentSympathy: 0, emitAtStart: null, freePlacement: false, keepInHand: false, destroyAtDawn: false,
  };
  if (!inclusionId) return f;
  const row = data.inclusion[inclusionId];
  if (!row) throw new Error(`unknown inclusion: ${inclusionId}`);
  for (const e of row.effects) {
    switch (e.kind) {
      case 'weight': f.w10 += e.w10; break;
      case 'strikeCapBase': f.capBase = e.value; break;
      case 'extraChannel': f.extraChannel = true; break;
      case 'strikeAddPerDistinct': f.perDistinct += e.value; break;
      case 'sympathyBase': f.sympathyBase = e.value; break;
      case 'firstStrikeGlint': f.firstStrikeGlint += e.value; break;
      case 'ignoreEclipseKinds': f.ignoreEclipseKinds = e.kinds; break;
      case 'tierAdd': f.tierAdd += e.value; break;
      case 'spawnRing': f.spawnRing = e; break;
      case 'rotateAfterStrike': f.rotateAfterStrike = true; break;
      case 'countsDouble': f.countsDouble = e.for; break;
      case 'sympathyPerNight': f.sympathyPerNight += e.value; break;
      case 'skipCut': f.skipCut = true; break;
      case 'stoneCycle': f.stoneCycle = e.stones; break;
      case 'allFaces': f.allFaces = true; break;
      case 'immuneEclipseKinds': f.immuneEclipseKinds = e.kinds; break;
      case 'adjacentSympathy': f.adjacentSympathy += e.value; break;
      case 'emitAtStart': f.emitAtStart = e; break;
      case 'freePlacement': f.freePlacement = true; break;
      case 'keepInHand': f.keepInHand = true; break;
      case 'destroyAtDawn': f.destroyAtDawn = true; break;
      default: break;
    }
  }
  return f;
}

// Stone channels of a gem this cast: Pleochroic cycles the stone by cast number, Phantom adds one
// channel the stone lacks (missing channels in bit order, index gemId mod count).
export function stoneThisCast(gem, castNumber, data = DATA) {
  const f = inclusionFlags(gem.inclusion, data);
  let stoneId = gem.stone;
  if (f.stoneCycle) stoneId = f.stoneCycle[(((castNumber || 1) - 1) % f.stoneCycle.length + f.stoneCycle.length) % f.stoneCycle.length];
  let ch = data.stone[stoneId].channels;
  if (f.extraChannel && ch !== 7) {
    const missing = [1, 2, 4].filter((b) => (ch & b) === 0);
    ch |= missing[(gem.gemId >>> 0) % missing.length];
  }
  return { stoneId, channels: ch };
}
