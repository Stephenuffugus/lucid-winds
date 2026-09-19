// cast(board, ctx) -> { lux, events[], ... }. The pure, deterministic beam resolver.
// Rules: docs/LUMEN_DESIGN.md section 2; readings pinned in docs/SIM_SPEC.md (R1..R14 cited below).
// The renderer and audio only play back `events`; they never recompute a score.
import { DATA } from './data.js';
import { grid } from './hex.js';
import { compileCastRules, inclusionFlags, whenHolds, popcount } from './settings.js';
import { CUT_FNS, mirrorStrikes } from './cuts.js';

const EMPTY = 0, WALL = 1, EMITTER = 2, APERTURE = 3;
const STOP = { stop: true };

export class EventCapError extends Error {}

// Per-cast gem records: stone this cast, effective tier, strike cap, adjacency.
function prepareGems(board, ctx, h, g, kind, data) {
  const R = data.rules;
  const castNumber = ctx.castNumber || 1;
  const gemAt = new Int16Array(g.n).fill(-1);
  const gems = [];
  const bright = new Uint8Array(g.n);
  for (const c of board.bright || []) bright[c] = 1;
  for (const src of board.gems || []) {
    const def = data.cut[src.cut];
    if (!def) throw new Error(`unknown cut: ${src.cut}`);
    if (!data.stone[src.stone]) throw new Error(`unknown stone: ${src.stone}`);
    if (src.cell < 0 || src.cell >= g.n || kind[src.cell] !== EMPTY || gemAt[src.cell] !== -1) throw new Error(`gem on an occupied or invalid cell ${src.cell}`);
    const f = inclusionFlags(src.inclusion || null, data);
    let stoneId = src.stone;
    if (f.stoneCycle) stoneId = f.stoneCycle[(castNumber - 1) % f.stoneCycle.length];
    let sc = data.stone[stoneId].channels;
    if (f.extraChannel && sc !== 7) {
      const missing = [1, 2, 4].filter((b) => (sc & b) === 0);
      sc |= missing[(src.gemId >>> 0) % missing.length];
    }
    const ign = f.ignoreEclipseKinds || [];
    const dbl = f.countsDouble || [];
    gemAt[src.cell] = gems.length;
    gems.push({
      cell: src.cell, def, fn: def.fn, cutId: def.id, stoneId, sc,
      baseSc: data.stone[src.stone].channels, baseTier: src.tier | 0, tier: 0, f,
      facing: (((src.facing | 0) % 6) + 6) % 6, gemId: src.gemId >>> 0, nightsSurvived: src.nightsSurvived | 0,
      strikes: 0, cap: 0, firesUsed: 0, charges: [], dawned: false, spawned: false,
      adjacent: 0, denseAdj: 0, disabled: false,
      ignores: (k) => ign.includes(k), countsDouble: (k) => dbl.includes(k),
    });
  }
  // Purist: every gem on the board shares one common channel.
  let shared = 7;
  for (const gem of gems) shared &= gem.sc;
  const purist = h.tierAddShared && gems.length > 0 && shared !== 0 ? h.tierAddShared : 0;
  for (const gem of gems) {
    gem.tier = Math.min(R.tierMax, gem.baseTier + gem.f.tierAdd + (bright[gem.cell] ? R.brightCell.tierAdd : 0) + purist);
    for (let d = 0; d < 6; d++) {
      const nb = g.neighbor[gem.cell * 6 + d];
      if (nb < 0 || gemAt[nb] < 0) continue;
      const o = gems[gemAt[nb]];
      gem.adjacent += o.countsDouble('adjacency') ? 2 : 1;
      gem.denseAdj += o.f.adjacentSympathy;
    }
    // Strike cap: base (Starred), additive bonuses, then clamps (Short Night unless Veiled; Vigil).
    let cap = gem.f.capBase ?? R.strike.capBase;
    for (const e of h.capAdd) if (whenHolds(e.when, gem, 0, 0, g.center)) cap += e.value;
    if (h.capClamp !== null && !gem.ignores('strikeCapClamp')) cap = Math.min(cap, h.capClamp);
    if (h.vigilCommonCap !== null && gem.def.rarity === 'common') cap = Math.min(cap, h.vigilCommonCap); // R25
    gem.cap = cap;
    gem.disabled = h.disableCut !== null && gem.cutId === h.disableCut && !gem.ignores('disableCut');
  }
  return { gems, gemAt };
}

export function cast(board, ctx = {}, data = DATA) {
  const R = data.rules;
  const g = grid(board.radius ?? R.board.radius);
  const h = compileCastRules(ctx, data);
  const record = ctx.events !== false;
  const strict = !!ctx.strict;
  const maxLive = R.beam.maxLive, maxEvents = R.beam.maxEvents;

  const kind = new Uint8Array(g.n);
  const apColor = new Int8Array(g.n).fill(-1);
  const dark = new Uint8Array(g.n);
  for (const c of board.walls || []) kind[c] = WALL;
  for (const e of board.emitters || []) kind[e.cell] = EMITTER;
  for (const a of board.apertures || []) { kind[a.cell] = APERTURE; apColor[a.cell] = a.color; }
  for (const c of board.dark || []) dark[c] = 1;
  const { gems, gemAt } = prepareGems(board, ctx, h, g, kind, data);
  // Wide Aperture: each aperture also covers its two neighbouring edge cells when they are empty.
  const covered = [];
  if (h.apertureWiden) {
    const E = g.edge;
    for (const a of board.apertures || []) {
      const i = E.indexOf(a.cell);
      if (i < 0) continue;
      for (const nb of [E[(i + E.length - 1) % E.length], E[(i + 1) % E.length]]) {
        if ((kind[nb] === EMPTY || covered[nb]) && gemAt[nb] < 0) {
          kind[nb] = APERTURE;
          if (covered[nb]) covered[nb].push(a.color); else { covered[nb] = [a.color]; apColor[nb] = a.color; }
        }
      }
    }
  }

  const events = [];
  let evCount = 0, truncated = false, t = 0, nextId = 0, liveCount = 0;
  let glints = 0, orbitPaid = 0, dawns = 0, castMaxFocus = 0;
  const scores = [];
  const strip = h.stripMask;

  function ev(type, b, extra) {
    if (b && b.focus10 > castMaxFocus) castMaxFocus = b.focus10;
    if (++evCount > maxEvents) {
      if (strict) throw new EventCapError(`event cap ${maxEvents} exceeded`);
      truncated = true;
      throw STOP;
    }
    if (!record) return;
    const e = { t, type, beamId: b.id, cell: b.cell, dir: b.dir, color: b.color, intensity: b.intensity, focus10: b.focus10, gemId: null };
    if (extra) Object.assign(e, extra);
    events.push(e);
  }

  // Fresh beams (emitters, Luminous, Asteriated, Lens fire) start with empty history and visited (R2).
  function newBeam(cell, dir, color, intensity, focus10, origin) {
    color &= ~strip;
    if (color === 0 || liveCount >= maxLive) return null;
    liveCount++;
    return {
      id: nextId++, cell, dir, color, intensity, focus10, hasWrapped: false, visited: new Set(), history: [],
      persist: 0, longShot: 0, deepBlue: 0, origin, dawn: false, prevCell: cell, alive: true, wrappedNow: false, endReason: null,
    };
  }
  // Children inherit visited, hasWrapped, counters and origin; history empty, no Dawn (R1).
  function makeChild(parent, dir, color, intensity) {
    color &= ~strip;
    if (color === 0 || liveCount >= maxLive) return null;
    liveCount++;
    return {
      id: nextId++, cell: parent.cell, dir, color, intensity, focus10: parent.focus10, hasWrapped: parent.hasWrapped,
      visited: new Set(parent.visited), history: [], persist: parent.persist,
      longShot: parent.longShot, deepBlue: parent.deepBlue, origin: parent.origin, dawn: false,
      prevCell: parent.cell, alive: true, wrappedNow: false, endReason: null,
    };
  }
  function kill(b, reason) { if (b.alive) { b.alive = false; liveCount--; b.endReason = reason; } }
  function setColor(b, c) { b.color = c & ~strip; return b.color !== 0; }
  let geodeLux = 0;
  function scoreGeode(b, gem) {
    geodeLux = Math.floor(pipeline(b, gem.sc, true) / gem.def.divisor);
    scores.push({ kind: 'geode', cell: gem.cell, color: b.color, intensity: b.intensity, focus10: b.focus10, lux: geodeLux, beamId: b.id, t });
  }
  const k = { h, makeChild, kill, setColor, scoreGeode };

  // Aperture pipeline (section 2; SIM_SPEC 8). forGeode: no Aperture Settings, no White Balance (R14).
  function pipeline(b, A, forGeode) {
    const c = b.color;
    let I = b.intensity;
    let after = c; // colour after channel removal
    if (A !== 7 && !(!forGeode && h.whiteBalance && c === 7)) {
      const m = popcount(c & A);
      I = m ? Math.floor((I * m) / popcount(c)) : 0;
      after = c & A;
    }
    let lux = Math.floor((I * b.focus10) / 10);
    if (!forGeode) for (const r of h.apertureMult) if (whenHolds(r.when, null, c, 0, g.center) && whenHolds(r.when, null, after, 0, g.center)) lux = Math.floor((lux * r.num) / r.den); // R16
    if (h.onlyDawnWhite) lux = b.dawn && after === 7 ? lux * h.onlyDawnWhite : 0; // R13
    return lux;
  }

  let live = [];
  const keep = (b) => { live.push(b); };

  // Sympathy for this strike (SIM_SPEC 6.7); 0 when it does not apply.
  function sympathy(gem, color, W10, n) {
    if (h.noSympathy) return 0;
    let applies = (color & gem.sc) !== 0;
    if (!applies) for (const e of h.sympathyAlways) if (whenHolds(e.when, gem, color, n, g.center)) { applies = true; break; }
    if (!applies) return 0;
    let replaced = gem.f.sympathyBase; // R9: the lowest replacement wins
    for (const e of h.sympathyBase) if (whenHolds(e.when, gem, color, n, g.center)) replaced = replaced === null ? e.value : Math.min(replaced, e.value);
    const base = replaced === null ? R.sympathy.base : replaced;
    let v = gem.def.param === 'sympathy' ? Math.floor(((gem.def.values[gem.tier] + base - R.sympathy.base) * (10 + W10)) / 10) : base; // R28
    v += gem.f.sympathyPerNight * gem.nightsSurvived + gem.denseAdj;
    return v;
  }

  // Effective parameter (modifier grammar): tier value x (1 + weights), floored to the unit.
  function effParam(def, tierIdx, W10, color, sc) {
    if (def.fn === 'resonate') {
      let v = 0;
      if (color === sc) v = def.exact[tierIdx];
      else if ((color & sc) !== 0) v = def.shared[tierIdx];
      return v ? Math.floor((v * (10 + W10)) / 10) : 0;
    }
    if (def.values) return Math.floor((def.values[tierIdx] * (10 + W10)) / 10);
    return 0;
  }

  function strike(b, gem) {
    gem.strikes += 1;
    const n = gem.strikes;
    const inColor = b.color, inDir = b.dir, inI = b.intensity, inF = b.focus10;
    const histBefore = b.history;
    let W10 = gem.f.w10;
    for (const e of h.weight) if (whenHolds(e.when, gem, inColor, n, g.center)) W10 += e.w10;
    const distinct = gem.f.perDistinct ? new Set(histBefore).size : 0;
    let echoTarget = null;
    if (gem.fn === 'echo' && !gem.f.skipCut) {
      for (let i = histBefore.length - 1; i >= 0; i--) {
        const pg = gems[gemAt[histBefore[i]]];
        if (pg.fn !== 'echo') { echoTarget = pg; break; }
      }
    }
    b.history = histBefore.concat(gem.cell); // children inherit history including this strike (R1)

    let outputs;
    if (gem.f.skipCut) {
      outputs = [{ b, route: 'move', emitted: false }]; // Hollow
    } else if (gem.fn === 'echo') {
      outputs = [{ b, route: 'move', emitted: false }];
      if (echoTarget && echoTarget.fn !== 'store' && echoTarget.fn !== 'absorb') {
        const pdef = echoTarget.def;
        const disabled = h.disableCut !== null && echoTarget.cutId === h.disableCut; // R24
        const faceOk = pdef.fn !== 'reflect' || mirrorStrikes(b.dir, echoTarget.facing, false);
        if (!disabled && faceOk) {
          const p = { eff: effParam(pdef, 0, 0, b.color, echoTarget.baseSc), sc: echoTarget.baseSc, facing: echoTarget.facing, headOn: pdef.headOn, useSettings: false };
          outputs = CUT_FNS[pdef.fn](k, b, gem, p);
        }
      }
    } else {
      let eff = effParam(gem.def, gem.tier, W10, inColor, gem.sc);
      if (gem.fn === 'resonate' && (inColor & gem.sc) !== 0) eff += h.resonatorFocusAdd;
      outputs = CUT_FNS[gem.fn](k, b, gem, { eff, sc: gem.sc, facing: gem.facing, headOn: gem.def.headOn, useSettings: true });
    }

    // Per-strike additions, once, to the first output (R8); Triad to every Prism emission.
    let add = sympathy(gem, inColor, W10, n);
    for (const e of h.strikeAdd) if (whenHolds(e.when, gem, inColor, n, g.center)) add += e.value;
    add += gem.f.perDistinct * distinct;
    if (outputs.length) outputs[0].b.intensity += add;
    if (h.prismEmitAdd) for (const o of outputs) if (o.emitted) o.b.intensity += h.prismEmitAdd;

    // Post-strike Inclusion effects, in order: Clouded, Chatoyant, Asteriated (SIM_SPEC 6.8).
    let glint = 0;
    if (gem.f.firstStrikeGlint && n === 1) { glint = gem.f.firstStrikeGlint; glints += glint; }
    if (gem.f.rotateAfterStrike) gem.facing = (gem.facing + 1) % 6;
    const ring = [];
    if (gem.f.spawnRing && !gem.spawned) {
      gem.spawned = true;
      for (let dd = 0; dd < 6; dd++) {
        const nb = g.neighbor[gem.cell * 6 + dd];
        if (nb < 0 || kind[nb] === WALL || kind[nb] === EMITTER) continue;
        const rb = newBeam(nb, dd, gem.sc, gem.f.spawnRing.intensity, gem.f.spawnRing.focus10, gem.cell); // R10
        if (rb) ring.push(rb);
      }
    }

    // Route outputs, then report: one primary event for the arriving beam, then children, then the ring.
    const tag = { gemId: gem.gemId, strike: n };
    if (glint) tag.glints = glint;
    const self = outputs.find((o) => o.b === b);
    if (self && self.route === 'move') {
      ev('strike', b, tag);
      keep(b);
    } else if (self && self.route === 'store') {
      b.alive = false; b.endReason = 'stored'; // stays counted as live until its Lens fires (R22)
      gem.charges.push({ intensity: b.intensity, focus10: b.focus10, color: b.color, hasWrapped: b.hasWrapped, persist: b.persist, longShot: b.longShot, deepBlue: b.deepBlue });
      ev('charge', b, tag);
    } else {
      // The arriving beam ended inside the gem: split, absorbed (Mirror head-on or Geode), lost to a
      // spent Lens, filtered out, or colourless. Reported with the values it arrived with.
      const pre = { color: inColor, intensity: inI, focus10: inF, dir: inDir };
      const r = b.endReason;
      const type = r === 'split' ? 'split' : r === 'lost' ? 'charge' : r === 'absorbed' || r === 'geode' ? 'absorb' : 'end';
      const extra = Object.assign({}, tag, type === 'end' ? { reason: r } : null, r === 'lost' ? { lost: true } : null,
        r === 'absorbed' ? { absorbed: true, lux: 0 } : null, r === 'geode' ? { lux: geodeLux } : null);
      const saved = { color: b.color, intensity: b.intensity, focus10: b.focus10, dir: b.dir };
      Object.assign(b, pre);
      ev(type, b, extra);
      Object.assign(b, saved);
    }
    for (const o of outputs) if (o.b !== b) { ev('emit', o.b, { gemId: gem.gemId, parent: b.id }); keep(o.b); }
    for (const rb of ring) { ev('emit', rb, { gemId: gem.gemId, ring: true }); keep(rb); }
  }

  function enter(b) {
    const c = b.cell;
    if (b.wrappedNow) { b.wrappedNow = false; ev('travel', b, { reason: 'wrap', from: b.prevCell }); }
    const kc = kind[c];
    if (kc === WALL || kc === EMITTER) { kill(b, 'wall'); ev('end', b, { reason: 'wall' }); return; }
    // Lap check on every entry, before anything else in the cell (R4).
    const key = c * 6 + b.dir;
    if (b.visited.has(key)) {
      let paid = 0;
      if (h.lapFocusMult) b.focus10 = Math.floor((b.focus10 * h.lapFocusMult.num) / h.lapFocusMult.den);
      if (h.lapGlint && orbitPaid < h.lapGlint.maxPerCast) { paid = Math.min(h.lapGlint.value, h.lapGlint.maxPerCast - orbitPaid); orbitPaid += paid; glints += paid; }
      b.visited = new Set(); // R4: cleared
      ev('travel', b, paid ? { reason: 'lap', glints: paid } : { reason: 'lap' });
    } else b.visited.add(key);
    if (h.invertColumn !== null && g.col[c] === h.invertColumn && g.col[b.prevCell] !== h.invertColumn) {
      if (!setColor(b, 7 - b.color)) { kill(b, 'color'); ev('end', b, { reason: 'color' }); return; }
      ev('travel', b, { reason: 'invert' });
    }
    if (dark[c]) {
      b.intensity = Math.max(0, b.intensity - R.darkCell.penalty);
      ev('travel', b, { reason: 'dark' });
    }
    if (kc === APERTURE) {
      let lux = pipeline(b, apColor[c], false);
      if (covered[c]) for (const col of covered[c]) lux = Math.min(lux, pipeline(b, col, false)); // R15
      scores.push({ kind: 'aperture', cell: c, color: b.color, intensity: b.intensity, focus10: b.focus10, lux, beamId: b.id, t });
      kill(b, 'aperture');
      ev('aperture', b, { lux });
      return;
    }
    const gi = gemAt[c];
    if (gi >= 0) {
      const gem = gems[gi];
      if (b.origin === c || gem.disabled || (gem.fn === 'reflect' && !mirrorStrikes(b.dir, gem.facing, gem.f.allFaces))) { keep(b); return; }
      if (gem.strikes >= gem.cap) {
        if (h.cappedPassAdd && b.persist < h.cappedPassAdd.maxPerBeam) { b.persist++; b.intensity += h.cappedPassAdd.value; }
        ev('travel', b, { reason: 'pass', gemId: gem.gemId });
        keep(b);
        return;
      }
      strike(b, gem);
      return;
    }
    let changed = false;
    for (const e of h.emptyCellAdd) {
      if (!whenHolds(e.when, null, b.color, 0, g.center) || b[e.counter] >= e.max) continue;
      const v = Math.min(e.value, e.max - b[e.counter]);
      b[e.counter] += v; b.intensity += v; changed = true;
    }
    if (changed) ev('travel', b, { reason: 'bonus' });
    keep(b);
  }

  function fire(lens) {
    const ch = lens.charges;
    lens.charges = [];
    lens.firesUsed++;
    let I = 0, F = 0, C = 0, wrapped = false, persist = 0, longShot = 0, deepBlue = 0, anyWhite = false;
    for (const c of ch) {
      I += c.intensity; F = Math.max(F, c.focus10); C |= c.color; wrapped = wrapped || c.hasWrapped;
      persist += c.persist; longShot += c.longShot; deepBlue += c.deepBlue;
      if (c.color === 7) anyWhite = true;
    }
    liveCount -= ch.length; // the charges are released before the fired beam is created (R22)
    const b = newBeam(lens.cell, lens.facing, C, I, F, null);
    if (!b) return;
    // R11: counters are the sum over charges, capped at each counter's maximum.
    const cap = (name, v) => { for (const e of h.emptyCellAdd) if (e.counter === name) return Math.min(v, e.max); return v; };
    b.hasWrapped = wrapped;
    b.persist = h.cappedPassAdd ? Math.min(persist, h.cappedPassAdd.maxPerBeam) : persist;
    b.longShot = cap('longShot', longShot); b.deepBlue = cap('deepBlue', deepBlue);
    ev('fire', b, { gemId: lens.gemId, charges: ch.length });
    if (C === 7 && ch.length >= R.dawn.minBeams && !anyWhite && dawns < h.dawnLimit && !lens.dawned) {
      b.focus10 *= h.dawnMult;
      b.dawn = true;
      lens.dawned = true;
      dawns++;
      ev('dawn', b, { gemId: lens.gemId });
    }
    if (h.lensFocusToMax && whenHolds(h.lensFocusToMax.when, null, b.color, 0, g.center) && castMaxFocus > b.focus10) { // R12
      b.focus10 = castMaxFocus;
      ev('travel', b, { reason: 'envy', gemId: lens.gemId });
    }
    keep(b);
  }

  try {
    // Tick 0: emitter beams in ascending cell index (listed order within a cell), then Luminous gems.
    const em = (board.emitters || []).map((e, i) => ({ e, i })).sort((a, b) => a.e.cell - b.e.cell || a.i - b.i);
    em.forEach(({ e }, idx) => {
      let color = e.color;
      if (h.lanternColor && color === h.lanternColor.from) color = h.lanternColor.to;
      const intensity = h.lanternIntensity !== null ? (idx === 0 ? h.lanternIntensity : 0) : e.intensity; // R21
      const b = newBeam(e.cell, e.dir, color, intensity, e.focus10 ?? 10, null);
      if (b) { ev('emit', b, { lantern: true }); keep(b); }
    });
    for (const gm of gems.filter((x) => x.f.emitAtStart).sort((a, b) => a.cell - b.cell)) {
      const b = newBeam(gm.cell, gm.facing, gm.sc, gm.f.emitAtStart.intensity, gm.f.emitAtStart.focus10, gm.cell);
      if (b) { ev('emit', b, { gemId: gm.gemId, luminous: true }); keep(b); }
    }
    const lenses = gems.filter((x) => x.fn === 'store').sort((a, b) => a.cell - b.cell);
    for (;;) {
      while (live.length) {
        t++;
        const moving = live;
        live = [];
        const arrivals = [];
        for (const b of moving) {
          if (!b.alive) continue;
          const nb = g.neighbor[b.cell * 6 + b.dir];
          if (nb >= 0) { b.prevCell = b.cell; b.cell = nb; arrivals.push(b); }
          else if (h.wrapOnce && !b.hasWrapped) { b.hasWrapped = true; b.prevCell = b.cell; b.cell = g.wrap[b.cell * 6 + b.dir]; b.wrappedNow = true; arrivals.push(b); }
          else { kill(b, 'edge'); ev('end', b, { reason: 'edge' }); }
        }
        arrivals.sort((a, b) => a.cell - b.cell || a.dir - b.dir || a.id - b.id); // R3
        for (const b of arrivals) if (b.alive) enter(b);
      }
      let lens = null;
      for (const L of lenses) if (L.charges.length > 0 && L.firesUsed < h.lensFires) { lens = L; break; }
      if (!lens) break;
      fire(lens);
    }
  } catch (err) {
    if (err !== STOP) throw err;
  }

  // Cast total: scores, then Full House, then Glass Tax, clamped at 0.
  // R17: Glass Tax first (a shortfall is carried as unpaidTax), then Full House.
  let raw = 0;
  for (const s of scores) raw += s.lux;
  let tax = 0;
  if (h.luxPerGem) for (const gm of gems) if (!gm.ignores('luxPerGem')) tax += h.luxPerGem * (gm.countsDouble('luxPerGem') ? 2 : 1);
  let total = raw - tax;
  const unpaidTax = total < 0 ? -total : 0;
  if (total < 0) total = 0;
  let fullHouse = false;
  if (h.castMultAllStones) {
    const stones = new Set();
    for (const gm of gems) if (!data.stone[gm.stoneId].neutral) stones.add(gm.stoneId);
    if (stones.size >= data.stones.filter((s) => !s.neutral).length) { total *= h.castMultAllStones; fullHouse = true; }
  }
  const facings = {};
  const strikes = {};
  for (const gm of gems) { facings[gm.cell] = gm.facing; if (gm.strikes) strikes[gm.cell] = gm.strikes; }
  if (record) events.push({ t: t + 1, type: 'end', beamId: -1, cell: -1, dir: -1, color: 0, intensity: 0, focus10: 0, gemId: null, reason: 'cast', lux: total, raw, fullHouse, tax, unpaidTax, glints, truncated });
  return { lux: total, raw, events, glints, scores, strikes, dawns, facings, truncated, ticks: t, fullHouse, tax, unpaidTax };
}

// Canonical comparison shape, shared with harness/reference.js checks.
export function summarize(res) {
  const scores = res.scores.map((s) => ({ kind: s.kind, cell: s.cell, color: s.color, intensity: s.intensity, focus10: s.focus10, lux: s.lux }));
  scores.sort((a, b) => a.cell - b.cell || a.lux - b.lux || a.intensity - b.intensity || a.focus10 - b.focus10 || a.color - b.color || (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : 0));
  const strikes = {};
  for (const key of Object.keys(res.strikes).sort((a, b) => a - b)) if (res.strikes[key]) strikes[key] = res.strikes[key];
  const facings = {};
  for (const key of Object.keys(res.facings).sort((a, b) => a - b)) facings[key] = res.facings[key];
  return { lux: res.lux, glints: res.glints, scores, strikes, dawns: res.dawns, facings, truncated: !!res.truncated, unpaidTax: res.unpaidTax || 0 };
}
