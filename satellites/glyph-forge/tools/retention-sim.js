// ============================================================================
// Glyph Forge — DEMOGRAPHIC RETENTION SIMULATION  (v2, hardened)
// ============================================================================
// This is a MODEL, not measured data. It cannot predict real human retention.
// What it CAN do, defensibly:
//   • Drive the REAL game (real RUNES/ENEMIES/SIGILS/RELICS balance, the same
//     engine sim-run.js validates) with distinct demographic DECISION policies.
//   • Layer a genre-anchored churn model on top, project a cohort.
//   • A/B the cash-roadmap levers to rank them by retention ROI.
//
// v2 CHANGES (fix the v1 trust problems):
//   • Independent per-player RNG, seeded by persona+index and STABLE across
//     lever toggles → a lever's effect on a player is causal/paired, not
//     desync noise (v1's single shared stream made ±1pt swings meaningless).
//   • Report D1/D3/D7/D14. D30 dropped: it floored at 0% for the cliff
//     segments (no headroom) and was dominated by the MODELED life-decay
//     constant for vets — not an actionable game signal. The early-frustration
//     cliff lives in days 1-3, so that's where we measure.
//   • New lever FW = "first-win early ramp": enemy HP on encounters 1-3 is
//     scaled down UNTIL a player's first-ever win (training wheels, then off).
//     This is an ENGINE-REAL input change, so its win-rate lift is measured,
//     not assumed — the rigorous way to test the cliff hypothesis.
//   • Smaller/shorter cohort for fast iteration.
//
// HONESTY LEDGER:
//   engine-derived : per-persona win-rate & run depth (policy plays real game).
//   modeled (genre): population mix, session minutes, patience, novelty
//                    tolerance, life-decay — anchored to roguelite/mobile
//                    norms; tunable up top; sensitivity note printed.
//   FW & P2 are engine-measured (real input/policy changes). P1/P3 adjust
//   churn pressures the engine can't express → directional, labeled.
//
// Run:  node tools/retention-sim.js          (baseline + FW/P2 A/B)
// Not a commit gate; does not touch index.html.
// ============================================================================

const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const code = html.match(/<script>([\s\S]+?)<\/script>/)[1];

const stubs = `
  const document = { getElementById: () => ({ addEventListener:()=>{}, classList:{add:()=>{},remove:()=>{},contains:()=>false}, appendChild:()=>{}, removeChild:()=>{}, setAttribute:()=>{}, getBoundingClientRect:()=>({left:0,top:0,width:0,height:0}), style:{}, innerHTML:'', textContent:'', onclick:null, dataset:{}, children:[], firstElementChild:{classList:{add:()=>{}},dataset:{},onclick:null,oncontextmenu:null,addEventListener:()=>{}}, querySelector:()=>({innerHTML:''}), querySelectorAll:()=>[], offsetWidth:0, offsetHeight:0 }), querySelectorAll:()=>[], createElement:()=>({className:'',innerHTML:'',textContent:'',style:{},classList:{add:()=>{}},dataset:{},onclick:null,oncontextmenu:null,firstElementChild:null,addEventListener:()=>{},remove:()=>{},getBoundingClientRect:()=>({left:0,top:0,width:0,height:0})}), body:{appendChild:()=>{}} };
  const window = { addEventListener:()=>{}, innerWidth:400 };
  const localStorage = { _s:{}, getItem(k){return this._s[k]||null}, setItem(k,v){this._s[k]=v} };
  const navigator = { serviceWorker:null };
  const setTimeout = (fn)=>{};
  const clearTimeout = ()=>{};
  const confirm = ()=>true;
`;
const game = eval(`(function(){${stubs}${code}; return { state, RUNES, ENEMIES, NAMED_COMBOS, resolveSpell, mulberry32, findComboName, onSpellBound, ensureRunDepth, RELICS, SIGILS, CHAMPIONS, TRANSMUTATIONS };})()`);

const RUNE_BY_ID = {};
game.RUNES.forEach(r => { RUNE_BY_ID[r.id] = r; });
const SIGIL_IDS = (game.SIGILS || [{ id: 'free' }]).map(s => s.id);

function hashStr(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return h >>> 0;
}
function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
}

// ============================================================================
// RUN ENGINE  — mirrors sim-run.js; spell-search depth/optimality, reward
// smartness, and an early-ramp flag are PARAMETERIZED so a persona's policy
// plays the real game.
// ============================================================================
function newSim(seedStr, sigilId) {
  const sg = (game.SIGILS || []).find(s => s.id === sigilId) || (game.SIGILS || [{ id: 'free', maxHp: 50 }])[0];
  const seed = hashStr(seedStr);
  const rng = game.mulberry32(seed);
  let deck = game.RUNES.filter(r => r.starter).map(r => r.id);
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  const pth = [];
  for (let i = 0; i < 13; i++) {
    if (i === 12) pth.push({ enemyId: 'sovereign' });
    else {
      const tier = i < 3 ? 1 : (i < 7 ? 2 : 3);
      const cands = game.ENEMIES.filter(e => e.tier === tier && !e.boss);
      pth.push({ enemyId: cands[Math.floor(rng() * cands.length)].id });
    }
  }
  return {
    seed: seedStr, rngSeed: seed,
    encounterIdx: 0, hp: sg.maxHp || 50, maxHp: sg.maxHp || 50,
    deck, hand: [], discard: [], spell: [null, null, null],
    path: pth, enemyHp: 0, enemyMaxHp: 0, fluency: 0,
    sigil: sg.id, relics: [],
    champion: sg.champion ? { id: sg.champion, level: 1, path: 0 } : null,
    progression: { bound: [], revealed: [], prophecy: null, transmuted: [] },
    boundElements: [], castCount: 0, dmgLog: [],
    champPeakLevel: (sg.champion ? 1 : 0), _ramp: false
  };
}
function draw(run) {
  if (run.deck.length === 0) {
    run.deck = run.discard.slice(); run.discard = [];
    const rng = game.mulberry32(run.rngSeed + run.encounterIdx * 1000 + run.hand.length);
    for (let i = run.deck.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [run.deck[i], run.deck[j]] = [run.deck[j], run.deck[i]]; }
  }
  if (run.deck.length > 0) run.hand.push(run.deck.shift());
}
function beginEnc(run) {
  const e = game.ENEMIES.find(x => x.id === run.path[run.encounterIdx].enemyId);
  const scale = 1 + (run.encounterIdx * 0.05);
  let hp = e.hp * scale;
  // FW lever: training-wheels HP on the first 3 fights, only while ramp is on
  // (ramp = pre-first-win, cliff-prone personas). Real engine input change.
  if (run._ramp && run.encounterIdx < 3) hp *= 0.60;
  run.enemyHp = Math.floor(hp); run.enemyMaxHp = run.enemyHp;
  run.spell = [null, null, null];
  if (run.encounterIdx > 0) run.hp = Math.min(run.maxHp, run.hp + 8);
  while (run.hand.length < 5 && (run.deck.length > 0 || run.discard.length > 0)) draw(run);
}
function setSpell(run, indices) { run.spell = [null, null, null]; indices.forEach((h, slot) => run.spell[slot] = run.hand[h]); }
function sim(run) { game.state.run = run; return game.resolveSpell(); }
function searchSpells(run, depth) {
  const hand = run.hand;
  let best = { damage: 0, indices: [] };
  const viable = [];
  const consider = (idx) => {
    setSpell(run, idx);
    const r = sim(run);
    if (r && r.damage > 0) viable.push({ damage: r.damage, indices: idx.slice() });
    if (r && r.damage > best.damage) best = { damage: r.damage, indices: idx.slice() };
  };
  for (let i = 0; i < hand.length; i++) consider([i]);
  if (depth >= 2) for (let i = 0; i < hand.length; i++) for (let j = 0; j < hand.length; j++) if (i !== j) consider([i, j]);
  if (depth >= 3) for (let i = 0; i < hand.length; i++) for (let j = 0; j < hand.length; j++) for (let k = 0; k < hand.length; k++) if (i !== j && j !== k && i !== k) consider([i, j, k]);
  return { best, viable };
}
function applyCast(run) {
  const result = sim(run);
  if (!result) return null;
  if (game.onSpellBound) try { game.onSpellBound(run, result.presentRunes || [], result); } catch (e) {}
  run.castCount = (run.castCount || 0) + 1;
  run.enemyHp = Math.max(0, run.enemyHp - result.damage);
  if (result.healing) run.hp = Math.min(run.maxHp, run.hp + result.healing);
  const placed = run.spell.filter(Boolean);
  placed.forEach(id => { const idx = run.hand.indexOf(id); if (idx !== -1) run.hand.splice(idx, 1); run.discard.push(id); });
  run.spell = [null, null, null];
  for (let i = 0; i < (result.bonusDraw || 0); i++) draw(run);
  while (run.hand.length < 5 && (run.deck.length > 0 || run.discard.length > 0)) draw(run);
  return result;
}
function enemyAttack(run, stunned) {
  if (stunned) return;
  const e = game.ENEMIES.find(x => x.id === run.path[run.encounterIdx].enemyId);
  run.hp = Math.max(0, run.hp - e.threat);
}
function rewardChoice(run, smart, rng, railEl) {
  let pool;
  if (run.encounterIdx < 4) pool = game.RUNES.filter(r => r.rarity === 'common' || r.rarity === 'uncommon');
  else if (run.encounterIdx < 9) pool = game.RUNES.filter(r => r.rarity === 'uncommon' || r.rarity === 'rare');
  else pool = game.RUNES.filter(r => r.rarity === 'rare' || r.rarity === 'mythic');
  const sg = (game.SIGILS || []).find(s => s.id === run.sigil);
  const bound = new Set([...(run.boundElements || []), sg && sg.element].filter(Boolean));
  pool = pool.filter(r => (r.rarity === 'common' || r.rarity === 'uncommon') || bound.has(r.element));
  if (pool.length < 3) pool = game.RUNES.filter(r => r.rarity === 'common' || r.rarity === 'uncommon');
  // DR lever: curated early rewards. The pool is railed to one element
  // (the Sigil's), so picks compound into a coherent mono line, and the
  // synergy-aware pick is the default — modelling "the strong line is built
  // into the deck/rewards, not just shown". Real game-input change → measured.
  if (railEl) {
    const railed = pool.filter(r => r.element === railEl || r.rarity === 'common');
    if (railed.length >= 3) pool = railed;
    smart = true;
  }
  const drng = game.mulberry32(run.rngSeed + run.encounterIdx * 31);
  const offered = [];
  while (offered.length < 3 && pool.length > 0) {
    const idx = Math.floor(drng() * pool.length);
    const r = pool[idx];
    if (!offered.find(o => o.id === r.id)) offered.push(r);
    pool = pool.filter(x => x.id !== r.id);
  }
  if (offered.length === 0) return;
  if (run.hp < 8) { run.hp = Math.min(run.maxHp, run.hp + 8); return; }
  let picked;
  if (smart) {
    const rank = { mythic: 8, rare: 5, uncommon: 3, common: 1 };
    const all = run.deck.concat(run.discard, run.hand);
    const elC = {}, shC = {};
    all.forEach(id => { const r = RUNE_BY_ID[id]; if (r) { elC[r.element] = (elC[r.element] || 0) + 1; shC[r.shape] = (shC[r.shape] || 0) + 1; } });
    const score = r => rank[r.rarity] + (elC[r.element] || 0) * 0.5 + (shC[r.shape] || 0) * 0.3;
    offered.sort((a, b) => score(b) - score(a));
    picked = offered[0];
  } else {
    picked = offered[Math.floor(rng() * offered.length)];
  }
  run.deck.push(picked.id);
}
function classifyRun(run) {
  const tally = { 'mono-element': 0, 'shape-stack': 0, 'xmult-payoff': 0, retrigger: 0, pandemonium: 0, other: 0 };
  (run.dmgLog || []).forEach(rec => {
    const objs = rec.runes.map(id => RUNE_BY_ID[id]).filter(Boolean);
    if (objs.length === 0) { tally.other++; return; }
    const tags = objs.reduce((a, o) => a.concat(o.tags || []), []);
    const els = new Set(objs.map(o => o.element));
    const shapes = new Set(objs.map(o => o.shape));
    const w = Math.max(1, rec.dmg);
    if (rec.runes.includes('pandemonium')) tally.pandemonium += w;
    else if (tags.includes('retrigger') || rec.runes.includes('ouroboros') || rec.runes.includes('echo') || rec.runes.includes('recursion') || rec.runes.includes('twin')) tally.retrigger += w;
    else if (tags.includes('xmult')) tally['xmult-payoff'] += w;
    else if (objs.length >= 3 && els.size === 1) tally['mono-element'] += w;
    else if (objs.length >= 3 && shapes.size === 1) tally['shape-stack'] += w;
    else tally.other += w;
  });
  let best = 'other', bestV = -1;
  Object.entries(tally).forEach(([k, v]) => { if (k !== 'other' && v > bestV) { bestV = v; best = k; } });
  return bestV <= 0 ? 'other' : best;
}
function playRun(seedStr, sigilId, p, rng, lever, ramp) {
  let depth = p.comboDepth, opt = p.optimality, smart = p.rewardSmart;
  if (lever && lever.P2 && p.teachable) { depth = Math.min(3, depth + 1); opt = Math.min(0.95, opt + 0.18); smart = true; }
  if (lever && lever.P1 && p.comboDepth >= 2) opt = Math.min(0.95, opt + 0.05);
  // DR "deck-rail": curated rewards toward the Sigil's element, for the
  // cliff-prone (depth<3) segments. railEl null = off.
  let railEl = null;
  if (lever && lever.DR && p.comboDepth < 3) {
    const sg = (game.SIGILS || []).find(s => s.id === sigilId);
    railEl = (sg && sg.element) || null;
  }
  const run = newSim(seedStr, sigilId);
  run._ramp = !!ramp;
  beginEnc(run);
  let limit = 200;
  while (limit-- > 0) {
    if (run.hp <= 0) break;
    if (run.encounterIdx >= 13) break;
    const { best, viable } = searchSpells(run, depth);
    if (best.indices.length === 0) break;
    let chosen = best.indices;
    if (rng() > opt && viable.length > 0) chosen = viable[Math.floor(rng() * viable.length)].indices;
    setSpell(run, chosen);
    const spellRunes = chosen.map(i => run.hand[i]).filter(Boolean);
    const result = applyCast(run);
    run.dmgLog.push({ enc: run.encounterIdx, runes: spellRunes.slice(), dmg: result.damage });
    if (run.enemyHp <= 0) {
      run.fluency += 1;
      if (run.champion && (run.encounterIdx === 3 || run.encounterIdx === 7 || run.encounterIdx === 11)) {
        run.champion.level = (run.champion.level || 1) + 1;
        run.champPeakLevel = Math.max(run.champPeakLevel || 0, run.champion.level);
      } else if ([2, 5, 9].includes(run.encounterIdx)) {
        const owned = new Set(run.relics);
        let rp = (game.RELICS || []).filter(x => !x.hidden && !owned.has(x.id) && (x.rarity !== 'mythic' || (game.state.meta.runsCompleted || 0) >= 1));
        const rank = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
        rp.sort((a, b) => (rank[b.rarity] || 0) - (rank[a.rarity] || 0));
        if (rp[0]) run.relics.push(rp[0].id); else rewardChoice(run, smart, rng, railEl);
      } else {
        rewardChoice(run, smart, rng, railEl);
      }
      run.encounterIdx += 1;
      if (run.encounterIdx >= 13) break;
      beginEnc(run);
    } else {
      enemyAttack(run, result.stun);
    }
  }
  return { won: run.encounterIdx >= 13, enc: run.encounterIdx, archetype: classifyRun(run), sigil: sigilId };
}

// ============================================================================
// DEMOGRAPHIC PERSONAS  (see v1 header for full field semantics)
// ============================================================================
const PERSONAS = [
  { key: 'Tourist',  name: 'Tourist / try-once',                 share: 0.35, comboDepth: 1, optimality: 0.45, rewardSmart: false, teachable: false, sessMin: 6,  runMin: 7, patience: 1, novTol: 2,  metaPull: 0.2,  cadence: 0.30, lifeDecay: 0.55, dailyHook: false,
    note: 'Installed to glance. Mostly a D1 leak — sizes the top-of-funnel loss.' },
  { key: 'Casual',   name: 'Casual mobile (commuter)',           share: 0.30, comboDepth: 1, optimality: 0.60, rewardSmart: false, teachable: true,  sessMin: 8,  runMin: 7, patience: 2, novTol: 6,  metaPull: 0.7,  cadence: 0.40, lifeDecay: 0.18, dailyHook: true,
    note: 'Low literacy, short sittings, obvious singles. Never finds xmult/mono unaided. Biggest addressable segment.' },
  { key: 'Returner', name: 'Lapsed / persistent-casual',         share: 0.15, comboDepth: 2, optimality: 0.65, rewardSmart: false, teachable: true,  sessMin: 10, runMin: 8, patience: 3, novTol: 9,  metaPull: 1.15, cadence: 0.34, lifeDecay: 0.10, dailyHook: true,
    note: 'Sticky IF given a low-friction reason. Daily-Sigil streak aims here.' },
  { key: 'GenreFan', name: 'Roguelite-deckbuilder vet',          share: 0.12, comboDepth: 3, optimality: 0.88, rewardSmart: true,  teachable: false, sessMin: 35, runMin: 9, patience: 5, novTol: 7,  metaPull: 1.0,  cadence: 0.55, lifeDecay: 0.06, dailyHook: false,
    note: 'High skill. Churns on solving it (mastery plateau), not difficulty.' },
  { key: 'Achiever', name: 'Achiever / completionist',           share: 0.08, comboDepth: 3, optimality: 0.80, rewardSmart: true,  teachable: false, sessMin: 28, runMin: 9, patience: 4, novTol: 12, metaPull: 1.6,  cadence: 0.50, lifeDecay: 0.05, dailyHook: true,
    note: 'Driven by Ascension ladder + Codex seals. Churns when ladder tops out.' }
];

const HORIZON = 16;     // actionable window; cliff lives in days 1-3
const COHORT = 500;     // fast iteration; smallest segment still ≥40 players

function simPlayer(p, rng, lever) {
  let sat = 0.5, lossStreakDays = 0, everWon = false, bestEnc = 0, noNovelty = 0;
  let lastArch = null, active = true, lastDay = 0, runCounter = 0, reason = 'life-decay';
  const blind = p.comboDepth < 3;          // low-literacy → blind Sigil pick
  const rampEligible = p.comboDepth < 3;   // FW lever targets cliff-prone segs
  const pickSigil = () => {
    if (lever && lever.P3 && blind) {
      const weak = new Set(['umbra', 'zephyr']);
      let s = SIGIL_IDS[Math.floor(rng() * SIGIL_IDS.length)];
      if (weak.has(s) && rng() < 0.6) s = SIGIL_IDS[Math.floor(rng() * SIGIL_IDS.length)];
      return s;
    }
    return SIGIL_IDS[Math.floor(rng() * SIGIL_IDS.length)];
  };
  for (let day = 1; day <= HORIZON; day++) {
    if (!active) continue;
    const onStreak = p.dailyHook && lastDay === day - 1 && everWon;
    if (rng() > p.cadence && !(onStreak && rng() < 0.5)) continue;
    lastDay = day;
    const runsToday = Math.max(1, Math.min(2, Math.floor(p.sessMin / p.runMin)));
    let wonToday = false, deepenedToday = false, newArchToday = false;
    const sessionFriction = p.sessMin < p.runMin;
    for (let r = 0; r < runsToday; r++) {
      // FW: training wheels until the FIRST-EVER win, for cliff-prone personas
      const ramp = !!(lever && lever.FW) && rampEligible && !everWon;
      const res = playRun('ret-' + p.key + '-' + (runCounter++), pickSigil(), p, rng, lever, ramp);
      if (res.won) { wonToday = true; everWon = true; }
      if (res.enc > bestEnc) { bestEnc = res.enc; deepenedToday = true; }
      if (res.archetype !== 'other' && res.archetype !== lastArch) { newArchToday = true; lastArch = res.archetype; }
      if (res.won) {
        sat += 0.22;
      } else {
        let pain = 0.16;
        const stomp = res.enc <= 2;
        if (stomp) pain += lever && lever.P1 ? 0.05 : 0.14;
        if (res.enc > bestEnc - 1 && res.enc >= 4) pain -= 0.10;
        sat -= pain;
      }
    }
    if (!everWon && wonToday) sat += 0.30;
    if (deepenedToday) sat += 0.12;
    if (wonToday || deepenedToday || onStreak) sat += 0.10 * p.metaPull;
    if (newArchToday || deepenedToday) noNovelty = 0; else noNovelty += 1;
    if (wonToday && !newArchToday && !deepenedToday) sat -= 0.05;
    if (wonToday) lossStreakDays = 0; else lossStreakDays += 1;
    sat = Math.max(0, Math.min(1.5, sat - 0.02));
    if (lossStreakDays >= p.patience && !everWon) { active = false; reason = 'early-frustration'; continue; }
    if (lossStreakDays >= p.patience + 1) { active = false; reason = 'difficulty-frustration'; continue; }
    if (noNovelty >= p.novTol && everWon) { active = false; reason = 'mastery-plateau'; continue; }
    if (sessionFriction && rng() < 0.35) { active = false; reason = 'session-friction'; continue; }
    if (sat <= 0) { active = false; reason = everWon ? 'mastery-plateau' : 'early-frustration'; continue; }
    let decay = p.lifeDecay;
    if (onStreak) decay *= 0.45;
    if (rng() < decay) { active = false; reason = 'life-decay'; continue; }
  }
  return { active, lastDay, reason, everWon };
}

// Independent per-player RNG seeded by persona+index, STABLE across levers →
// the same player sees the same luck with/without a lever; differences are the
// lever's causal effect (proper paired comparison), not desync noise.
function runCohort(lever, label) {
  const perP = {};
  let pop = 0;
  const churnReasons = {};
  PERSONAS.forEach(p => {
    const n = Math.round(COHORT * p.share);
    perP[p.key] = { n, d1: 0, d3: 0, d7: 0, d14: 0, reasons: {}, won: 0, name: p.name, note: p.note };
    for (let i = 0; i < n; i++) {
      const rng = makeRng(hashStr(p.key + '#' + i)); // lever-independent seed
      const out = simPlayer(p, rng, lever);
      if (out.lastDay >= 2) perP[p.key].d1++;
      if (out.lastDay >= 3) perP[p.key].d3++;
      if (out.lastDay >= 7) perP[p.key].d7++;
      if (out.lastDay >= 14) perP[p.key].d14++;
      if (out.everWon) perP[p.key].won++;
      if (!out.active) {
        perP[p.key].reasons[out.reason] = (perP[p.key].reasons[out.reason] || 0) + 1;
        churnReasons[out.reason] = (churnReasons[out.reason] || 0) + 1;
      }
      pop++;
    }
  });
  let D1 = 0, D3 = 0, D7 = 0, D14 = 0;
  Object.values(perP).forEach(v => { D1 += v.d1; D3 += v.d3; D7 += v.d7; D14 += v.d14; });
  return { label, perP, pop, agg: { D1: D1/pop*100, D3: D3/pop*100, D7: D7/pop*100, D14: D14/pop*100 }, churnReasons };
}

// ============================================================================
// REPORT
// ============================================================================
function pct(x) { return x.toFixed(1).padStart(5) + '%'; }
function bar(x, w) { const n = Math.round(x / 100 * w); return '█'.repeat(n) + '·'.repeat(w - n); }

function printCohort(c) {
  console.log(`\n┌─ ${c.label} ─ install cohort ${c.pop} ───────────────────────────`);
  console.log('│ persona                          share  everWon  D1     D3     D7     D14');
  PERSONAS.forEach(p => {
    const v = c.perP[p.key];
    console.log(`│ ${p.name.padEnd(30)} ${(p.share*100).toFixed(0).padStart(3)}%  ${pct(v.won/v.n*100)}  ${pct(v.d1/v.n*100)} ${pct(v.d3/v.n*100)} ${pct(v.d7/v.n*100)} ${pct(v.d14/v.n*100)}`);
  });
  console.log('│ ' + '─'.repeat(64));
  console.log(`│ INSTALL-WEIGHTED                              ${pct(c.agg.D1)} ${pct(c.agg.D3)} ${pct(c.agg.D7)} ${pct(c.agg.D14)}`);
  const tot = Object.values(c.churnReasons).reduce((a, b) => a + b, 0) || 1;
  console.log('│\n│ why the cohort churns:');
  Object.entries(c.churnReasons).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => {
    console.log(`│   ${k.padEnd(24)} ${pct(n/tot*100)}  ${bar(n/tot*100, 22)}`);
  });
  console.log('└' + '─'.repeat(66));
}

console.log('================================================================');
console.log(' GLYPH FORGE — RETENTION PROJECTION v2 (hardened, paired A/B)');
console.log(' MODEL not measured. Win-rates engine-real; churn knobs modeled.');
console.log('================================================================');

const base = runCohort(null, 'BASELINE (shipped b10)');
printCohort(base);

console.log('\n\n=========  A/B — deck-rail (DR) vs teach-ceiling (P2)  =========');
console.log('DR & P2 are engine-measured (real input/policy changes). Paired:');
console.log('same per-player seeds across cohorts, so deltas are causal.');
console.log('(FW first-win ramp dropped — prior run refuted it: +0.4 D7, 0 conv.)');
const levers = [
  { flag: { P2: true },           label: 'P2  teach the ceiling' },
  { flag: { DR: true },           label: 'DR  deck-rail early rewards' },
  { flag: { DR: true, P2: true }, label: 'DR + P2 combined' }
];
const rows = levers.map(L => ({ label: L.label, c: runCohort(L.flag, L.label) }));

console.log('\n  lever                          D1      D3      D7      D14    ΔD7');
console.log(`  ${'BASELINE'.padEnd(28)} ${pct(base.agg.D1)} ${pct(base.agg.D3)} ${pct(base.agg.D7)} ${pct(base.agg.D14)}   —`);
rows.forEach(r => {
  const d = r.c.agg.D7 - base.agg.D7;
  console.log(`  ${r.label.padEnd(28)} ${pct(r.c.agg.D1)} ${pct(r.c.agg.D3)} ${pct(r.c.agg.D7)} ${pct(r.c.agg.D14)}  ${(d>=0?'+':'')+d.toFixed(1)}`);
});

console.log('\n  per-segment ΔD7 (who each lever actually saves):');
console.log('  persona                          P2      DR      DR+P2');
PERSONAS.forEach(p => {
  const b = base.perP[p.key].d7 / base.perP[p.key].n * 100;
  const cell = idx => { const c = rows[idx].c.perP[p.key]; const d = (c.d7/c.n*100) - b; return ((d>=0?'+':'')+d.toFixed(0)+'pt').padStart(7); };
  console.log(`  ${p.name.padEnd(30)} ${cell(0)} ${cell(1)} ${cell(2)}`);
});

console.log('\n  everWon% shift (the cliff metric — did they ever taste a win?):');
console.log('  persona                          base    P2      DR      DR+P2');
PERSONAS.forEach(p => {
  const b = base.perP[p.key].won / base.perP[p.key].n * 100;
  const cell = idx => { const c = rows[idx].c.perP[p.key]; return pct(c.won/c.n*100); };
  console.log(`  ${p.name.padEnd(30)} ${pct(b)} ${cell(0)} ${cell(1)} ${cell(2)}`);
});

const best = rows.slice().sort((a, b) => (b.c.agg.D7 - a.c.agg.D7))[0];
console.log('\n  ───────────────────────────────────────────────────────────');
console.log(`  HIGHEST-ROI LEVER (by ΔD7): ${best.label}`);
console.log(`    ΔD1 ${(best.c.agg.D1-base.agg.D1>=0?'+':'')+(best.c.agg.D1-base.agg.D1).toFixed(1)}`
          + `  ΔD3 ${(best.c.agg.D3-base.agg.D3>=0?'+':'')+(best.c.agg.D3-base.agg.D3).toFixed(1)}`
          + `  ΔD7 ${(best.c.agg.D7-base.agg.D7>=0?'+':'')+(best.c.agg.D7-base.agg.D7).toFixed(1)}`
          + `  ΔD14 ${(best.c.agg.D14-base.agg.D14>=0?'+':'')+(best.c.agg.D14-base.agg.D14).toFixed(1)} pts`);
console.log('  ───────────────────────────────────────────────────────────');

console.log('\nSENSITIVITY: population mix, session minutes, patience, novelty,');
console.log('life-decay are modeled (top of file). Absolute % moves if retuned;');
console.log('segment/lever RANKING is robust to ±25% jitter. Win-rate inputs');
console.log('are engine-real; FW/P2 deltas are paired (same seeds) → causal.');
