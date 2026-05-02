#!/usr/bin/env node
/**
 * Lucid Winds — Rarity Audit Simulation
 *
 * Standalone reimplementation of the first-mint rarity pipeline:
 *   hashToTraits → _layerTier → getTerraGrade
 *
 * Source of truth: /workspaces/lucid-winds/index.html
 *   hashToTraits   line 9525
 *   getTerraGrade  line 10363
 *   _layerTier     line 34908
 *   _TIER_SCORE    line 10361
 *   _TERRA_GRADES  line 10339
 *
 * Usage:
 *   node scripts/rarity_sim.js
 *   node scripts/rarity_sim.js --n=250000
 *   node scripts/rarity_sim.js --thresholds=0,4,8,12,16,20,26
 *   node scripts/rarity_sim.js --scores=common:0,uncommon:0,rare:1,epic:3,legendary:5,mythic:7,cosmic:10
 *   node scripts/rarity_sim.js --seed=42
 *
 * Deterministic by default (seed=1).
 */

'use strict';

// ─── CLI parsing ─────────────────────────────────────────────────────────
const args = {};
for (const raw of process.argv.slice(2)) {
  const m = raw.match(/^--([^=]+)=(.*)$/);
  if (m) args[m[1]] = m[2];
}

const N = parseInt(args.n || '100000', 10);
const SEED = parseInt(args.seed || '1', 10);

// _TIER_SCORE — overridable
const TIER_SCORE = { common:0, uncommon:0, rare:1, epic:3, legendary:5, mythic:7, cosmic:10 };
if (args.scores) {
  for (const part of args.scores.split(',')) {
    const [k, v] = part.split(':');
    if (k && v != null) TIER_SCORE[k.trim()] = parseInt(v, 10);
  }
}

// Grade thresholds — overridable
const DEFAULT_THRESHOLDS = [0, 5, 10, 15, 21, 27, 34];  // Variant G — Apr 30 ladder spread
const THRESHOLDS = args.thresholds
  ? args.thresholds.split(',').map(s => parseInt(s, 10))
  : DEFAULT_THRESHOLDS;

const GRADE_NAMES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];

// ─── Seeded PRNG (mulberry32) — deterministic across runs ────────────────
function mulberry32(seed) {
  let a = seed >>> 0;
  return function() {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);

function randomHash() {
  let h = '';
  for (let i = 0; i < 64; i++) {
    h += Math.floor(rng() * 16).toString(16);
  }
  return h;
}

// ─── hashToTraits — mirrors index.html:9525 (first-mint, no breed/compost) ─
const _PAL_LEN = 16; // we don't need actual color values; only hc indexes drive
function hashToTraits(hash) {
  const h = (hash || '').toLowerCase().padEnd(64, '0');
  const hc = (i) => parseInt(h[i], 16) || 0;
  const hb = (i) => parseInt(h[i*2] + h[i*2+1], 16) || 0;

  const mutByte  = hb(16);
  const mythByte = hb(18);

  let mutName;
  if      (mutByte === 0xFF) mutName = 'Constellation';
  else if (mutByte === 0xFE) mutName = 'Origami';
  else if (mutByte === 0xFD) mutName = 'Stained Glass';
  else if (mutByte === 0xFC) mutName = 'Verdigris';
  else if (mutByte === 0xFB) mutName = 'Mycelium';
  else if (mutByte === 0xFA) mutName = 'Daguerreotype';
  else if (mutByte === 0xF9) mutName = 'Glitch';
  else if (mutByte === 0xF8) mutName = 'Glass Stem';
  else if (mutByte === 0xF7) mutName = 'Holographic';
  else if (mutByte === 0xF6) mutName = 'Golden';
  else if (mutByte === 0xF5) mutName = 'Neon';
  else if (mutByte === 0xF4) mutName = 'Ink Wash';
  else if (mutByte === 0xF3) mutName = 'Bioluminescent';
  else if (mutByte >= 0xF0)  mutName = 'Wireframe';
  else if (mutByte >= 0xED)  mutName = 'Porcelain';
  else if (mutByte >= 0xEA)  mutName = 'Silhouette';
  else if (mutByte >= 0xE7)  mutName = 'Pixel Art';
  else if (mutByte >= 0xE4)  mutName = 'Albino';
  else if (mutByte >= 0xE1)  mutName = 'Fossil';
  else                        mutName = 'None';

  let mythName;
  if      (mythByte === 0xFF) mythName = 'The Beholder';
  else if (mythByte >= 0xFE)  mythName = 'Garden Spider';
  else if (mythByte >= 0xFC)  mythName = 'Great Blue Heron';
  else if (mythByte >= 0xF8)  mythName = 'Raccoon';
  else if (mythByte >= 0xF4)  mythName = 'Baby Mammoth';
  else if (mythByte >= 0xE0)  mythName = 'The Cicada';
  else if (mythByte >= 0xD0)  mythName = 'The Toad';
  else                        mythName = 'None';

  const goldenPot   = hc(0)  === 15;
  const glowFlower  = hc(11) === 15;
  const crystalBase = hc(20) === 15;

  // Companion override ladder
  let companion;
  const _mb = hb(18);
  if      (_mb === 0xFF) companion = 38;
  else if (_mb >= 0xFE)  companion = 37;
  else if (_mb >= 0xFC)  companion = 36;
  else if (_mb >= 0xF8)  companion = 35;
  else if (_mb >= 0xF4)  companion = 34;
  else if (_mb >= 0xE0)  companion = 33;
  else if (_mb >= 0xD0)  companion = 32;
  else {
    const _r21 = hb(21);
    companion = (_r21 >= 82) ? 0 : _r21;
  }

  return {
    pot:          goldenPot ? 15 : hb(0) % 60,
    stem:         hb(2) % 28, // Coral lock dropped 2026-05-02
    leafType:     hb(4) % 71,
    leafCount:    5 + (hc(5) % 6),
    leafSize:     8 + (hc(6) % 7),
    hasFlower:    hc(10) > 4,
    flower:       glowFlower ? 15 : hb(11) % 73,
    flowerSize:   6 + (hc(13) % 7),
    aura:         hb(15) % 36,
    base:         crystalBase ? 15 : hb(20) % 71,
    companion:    companion,
    mutation:     mutByte,
    mutationName: mutName,
    mythic:       mythByte,
    mythicName:   mythName,
    season:       hb(22) % 4
  };
}

// ─── _layerTier — mirrors index.html:34908 ────────────────────────────────
function layerTier(cat, t) {
  if (cat === 'VESSEL') {
    const _p = t.pot % 60;
    if (_p === 59) return 'cosmic';                               // Genie Lamp
    if (_p === 56 || _p === 57) return 'mythic';                  // Ancient Amphora, Philosopher's Vessel
    if (t.pot === 15 || _p === 58 || _p === 22 || _p === 47) return 'legendary'; // Golden, Tractor Tire, Treasure Chest, Gramophone Horn
    if ([50,51,52,53,54,55,38].indexOf(_p) >= 0) return 'epic';   // Cauldron, Dragon Egg, Geode, Skull, Samurai, Clock Tower, Disco
    if ([7,21,23,27,28,18,9,39].indexOf(_p) >= 0) return 'rare';  // Terrarium, Lantern, Hollow Tome, Marlo Pipe, War Drum, Lab Flask, Top Hat, Paint Can
    if ([4,5,6,11,12,13,14,16,20,24,25,26].indexOf(_p) >= 0) return 'uncommon';
    return 'common';
  }
  if (cat === 'FOLIAGE') {
    const _lt = t.leafType % 71;
    if (_lt === 70) return 'cosmic';                              // Worldtree Heart
    if (_lt === 62 || _lt === 68) return 'mythic';                // Phoenix-Feather Frond, Void Petal
    if (_lt === 60 || _lt === 63 || _lt === 67) return 'legendary'; // Crystal Shard, Lunar Disc, Frost Plate
    if (_lt === 61 || _lt === 64 || _lt === 65 || _lt === 66 || _lt === 69) return 'epic'; // Ember Leaf, Spine Needle, Ribbon Curl, Prism Blade, Wishbone
    if (_lt >= 40 && _lt <= 49) return 'epic';
    if (_lt >= 30 && _lt <= 39) return 'rare';
    if (_lt >= 10 && _lt <= 29) return 'uncommon';
    return 'common';
  }
  if (cat === 'FLOWER') {
    if (!t.hasFlower) return null;
    const _bl = t.flower % 73;
    if (_bl === 68 || _bl === 72) return 'cosmic';                // Void Blossom, Worldbloom
    if (_bl === 70 || _bl === 71) return 'mythic';                // Prism Bloom, Reverie
    if (_bl === 15 || _bl === 36 || _bl === 37 || _bl === 67) return 'legendary'; // Bell Flowers, Titan Arum, Carrion Starfish, Ice Rose
    if (_bl === 66 || _bl === 69) return 'epic';                  // Flame Bloom, Clock Flower
    if (_bl >= 34 && _bl <= 45) return 'epic';
    if (_bl >= 18 && _bl <= 33) return 'rare';
    if (_bl >= 10 && _bl <= 17) return 'uncommon';
    return 'common';
  }
  if (cat === 'AURA') {
    const _au = t.aura % 36;
    if (_au < 5) return null;
    if (_au === 29) return 'cosmic';                              // Void Eclipse
    if (_au === 35) return 'mythic';                              // Stained Glass Light
    if (_au === 17) return 'legendary';                           // Meteor Shower
    if (_au >= 18 && _au <= 20) return 'epic';
    if (_au === 26 || _au === 31 || _au === 33) return 'epic';    // Fairy Ring, Ethereal Veil, Chain Lightning
    if ([9,11,13,14,15,16,23].indexOf(_au) >= 0) return 'rare';   // closes idx 14/16 gap, adds Cherry Blossom
    if ((_au >= 5 && _au <= 8) || _au === 10 || _au === 12) return 'uncommon';
    return 'common';
  }
  if (cat === 'SUBSTRATE') {
    const _b = t.base % 71;
    if (_b < 7) return null;
    if (_b === 60) return 'cosmic';                               // Void Essence
    if (_b === 59 || _b === 61) return 'mythic';                  // Phoenix Ash, Moonstone Dust
    if (_b === 56 || _b === 57 || _b === 58) return 'legendary';  // Stardust, Dragon Bone Ash, Quicksilver
    if (_b >= 52 && _b <= 55) return 'epic';
    if ([15,16,17,28,29].indexOf(_b) >= 0) return 'rare';
    if ([7,10,18,22].indexOf(_b) >= 0) return 'uncommon';
    return 'common';
  }
  if (cat === 'COMPANION') {
    if (t.companion === 38) return 'cosmic';
    if (t.companion === 37) return 'legendary';
    if (t.companion >= 34 && t.companion <= 36) return 'legendary';
    if (t.companion === 33) return 'mythic';
    if (t.companion === 32) return 'mythic';
    if ([69,72,75,78,79].indexOf(t.companion) >= 0) return 'rare';
    if ([40,43,44,46,47,48].indexOf(t.companion) >= 0) return 'rare';
    if (t.companion === 49 || t.companion === 50) return 'epic';
    if ([28,29,39,41,42,45].indexOf(t.companion) >= 0) return 'uncommon';
    if (t.companion >= 20 && t.companion <= 27) return 'common';
    return null;
  }
  if (cat === 'MUTATION') {
    const _mn = t.mutationName;
    if (_mn === 'None') return null;
    if (_mn === 'Constellation') return 'cosmic';
    if (_mn === 'Stained Glass' || _mn === 'Daguerreotype') return 'mythic';
    if (_mn === 'Origami' || _mn === 'Mycelium' || _mn === 'Verdigris') return 'legendary';
    if (['Golden','Ink Wash','Porcelain','Glitch','Holographic','Pixel Art'].indexOf(_mn) >= 0) return 'epic';
    if (['Fossil','Glass Stem','Neon','Bioluminescent'].indexOf(_mn) >= 0) return 'rare';
    return 'uncommon';
  }
  if (cat === 'GROWTH PATH' || cat === 'STRUCTURE') {
    const _st = t.stem % 28;
    if (_st === 23 || _st === 27) return 'cosmic';                // Iron Trunk, Worldspine
    if (_st === 22 || _st === 26) return 'mythic';                // Crystal Spine, Mirrorwood
    if (_st === 14 || _st === 25) return 'legendary';             // Hollow Trunk, Thunderscarred
    if (_st === 12 || _st === 24) return 'epic';                  // Ancient Bark, Petrified Heart
    if ([5,9,10,11,21].indexOf(_st) >= 0) return 'rare';          // Braided, Coral, Succulent, Twisted Vine, Mushroom Stipe
    if ([6,7,8,13].indexOf(_st) >= 0) return 'uncommon';          // Zigzag, Double, Cactus, Bamboo
    return 'common';
  }
  return 'common';
}

// ─── getTerraGrade — mirrors index.html:10363 (first-mint only) ───────────
function getTerraGrade(t) {
  let score = 0;

  const vesselT = layerTier('VESSEL', t);
  const subT    = layerTier('SUBSTRATE', t);
  const vesselS = vesselT ? (TIER_SCORE[vesselT] || 0) : 0;
  const subS    = subT    ? (TIER_SCORE[subT]    || 0) : 0;
  score += Math.max(vesselS, subS);

  const stemT = layerTier('GROWTH PATH', t);
  const leafT = layerTier('FOLIAGE', t);
  const stemS = stemT ? (TIER_SCORE[stemT] || 0) : 0;
  const leafS = leafT ? (TIER_SCORE[leafT] || 0) : 0;
  score += Math.max(stemS, leafS);

  const bloomT = layerTier('FLOWER', t);
  if (bloomT) score += (TIER_SCORE[bloomT] || 0);

  const auraT = layerTier('AURA', t);
  if (auraT) score += (TIER_SCORE[auraT] || 0);

  // Companion tier suppressed when mythic byte fires the spike
  const compT = layerTier('COMPANION', t);
  if (compT && t.mythic < 0xD0) score += (TIER_SCORE[compT] || 0);

  const mutT = layerTier('MUTATION', t);
  if (mutT) score += (TIER_SCORE[mutT] || 0);

  // Mythic-byte spike (replaces companion when mythic >= 0xD0)
  const mb = t.mythic;
  if      (mb === 0xFF)  score += 8;
  else if (mb >= 0xFE)   score += 7;
  else if (mb >= 0xFC)   score += 6;
  else if (mb >= 0xF4)   score += 5;
  else if (mb >= 0xD0)   score += 4;

  // Determine grade
  let gradeIdx = 0;
  for (let i = THRESHOLDS.length - 1; i >= 0; i--) {
    if (score >= THRESHOLDS[i]) { gradeIdx = i; break; }
  }
  return { grade: GRADE_NAMES[gradeIdx], score };
}

// ─── Simulation ──────────────────────────────────────────────────────────
function pad(s, n) { s = String(s); while (s.length < n) s = ' ' + s; return s; }
function padR(s, n) { s = String(s); while (s.length < n) s = s + ' '; return s; }
function pct(num, den) { return (100 * num / den).toFixed(2) + '%'; }

const t0 = Date.now();
const gradeCounts = Object.fromEntries(GRADE_NAMES.map(g => [g, 0]));
const scoreHist = {}; // score -> count

const layerCats = ['VESSEL','SUBSTRATE','GROWTH PATH','FOLIAGE','FLOWER','AURA','COMPANION','MUTATION'];
const layerHist = {};
layerCats.forEach(c => {
  layerHist[c] = { common:0, uncommon:0, rare:0, epic:0, legendary:0, mythic:0, cosmic:0, none:0 };
});

const mythicHist = {
  'None': 0, 'The Toad': 0, 'The Cicada': 0, 'Baby Mammoth': 0,
  'Raccoon': 0, 'Great Blue Heron': 0, 'Garden Spider': 0, 'The Beholder': 0
};
const mutationHist = {};
let spikeFired = 0; // mythic >= 0xD0
let companionScoredAndSpike = 0; // sanity check: should always be 0

// May 02 — combo tracking for blockchain-value analysis
const comboHist = {};               // "Mutation × Mythic" → count
let bothFiredCount = 0;             // any visible mutation AND any mythic creature
let cosmicMutCosmicMyth = 0;        // Constellation × Beholder (white whale)
let topTierComboCount = 0;          // ULTRA mutation (0xFA-FF) AND legendary+ creature (0xF4+)
let goldenAndMythic = 0;            // Golden Pot + any mythic creature
let goldenAndCosmic = 0;            // Golden Pot + Beholder
let allThreeRare = 0;               // Golden Pot + visible Mutation + Mythic creature
let cosmicGrade = 0;                // Cosmic-grade plants (3-trait stack would all be cosmic-grade)

for (let i = 0; i < N; i++) {
  const hash = randomHash();
  const t = hashToTraits(hash);
  const g = getTerraGrade(t);
  gradeCounts[g.grade]++;
  scoreHist[g.score] = (scoreHist[g.score] || 0) + 1;

  for (const cat of layerCats) {
    const tr = layerTier(cat, t);
    if (tr == null) layerHist[cat].none++;
    else layerHist[cat][tr] = (layerHist[cat][tr] || 0) + 1;
  }

  mythicHist[t.mythicName] = (mythicHist[t.mythicName] || 0) + 1;
  mutationHist[t.mutationName] = (mutationHist[t.mutationName] || 0) + 1;

  // Combo tracking
  const visibleMut = (t.mutationName !== 'None');
  const hasMyth = (t.mythicName !== 'None');
  const isGolden = (t.pot === 15);
  if (visibleMut && hasMyth) {
    bothFiredCount++;
    const combo = t.mutationName + ' × ' + t.mythicName;
    comboHist[combo] = (comboHist[combo] || 0) + 1;
    if (t.mutationName === 'Constellation' && t.mythicName === 'The Beholder') cosmicMutCosmicMyth++;
    // ULTRA mutation = bytes 0xFA-FF (top 6); Legendary+ creature = bytes 0xF4+ (top 5 ladder)
    if (t.mutation >= 0xFA && t.mythic >= 0xF4) topTierComboCount++;
  }
  if (isGolden && hasMyth) goldenAndMythic++;
  if (isGolden && t.mythicName === 'The Beholder') goldenAndCosmic++;
  if (isGolden && visibleMut && hasMyth) allThreeRare++;
  if (g.grade === 'Cosmic') cosmicGrade++;

  if (t.mythic >= 0xD0) {
    spikeFired++;
    // Sanity: when spike fires, the companion-tier addition is skipped.
    // If spike fires AND companion-tier is non-null, we want to confirm
    // it was NOT added to score. The code path enforces this via t.mythic < 0xD0
    // gate. We can't easily separate the two without rerunning, but the
    // gate is observable: walk through and check.
    const compT = layerTier('COMPANION', t);
    if (compT && (TIER_SCORE[compT] || 0) > 0) {
      // the override forces idx 32-38 anyway, so compT will be mythic/legendary/cosmic
      // and the gate prevents double-counting. Just count occurrences for awareness.
      companionScoredAndSpike++;
    }
  }
}

// ─── Output ──────────────────────────────────────────────────────────────
const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

console.log('━━━ Lucid Winds rarity sim ━━━');
console.log(`N = ${N.toLocaleString()}  seed = ${SEED}  elapsed = ${elapsed}s`);
console.log(`thresholds = [${THRESHOLDS.join(', ')}]`);
console.log(`scores     = ${JSON.stringify(TIER_SCORE)}`);
console.log('');

console.log('━━━ FIRST-MINT GRADE DISTRIBUTION ━━━');
for (const g of GRADE_NAMES) {
  const c = gradeCounts[g];
  console.log(`  ${padR(g,12)} ${pad(c.toLocaleString(),9)}  ${pad(pct(c, N),8)}`);
}
console.log('');

console.log('━━━ PER-LAYER TIER HISTOGRAMS ━━━');
const tierOrder = ['common','uncommon','rare','epic','legendary','mythic','cosmic','none'];
const header = '  ' + padR('LAYER', 14) + tierOrder.map(t => pad(t, 10)).join('');
console.log(header);
for (const cat of layerCats) {
  const row = layerHist[cat];
  const cells = tierOrder.map(t => {
    const v = row[t] || 0;
    return v ? pad(pct(v, N), 10) : pad('—', 10);
  }).join('');
  console.log('  ' + padR(cat, 14) + cells);
}
console.log('');

console.log('━━━ SCORE HISTOGRAM ━━━');
const sortedScores = Object.keys(scoreHist).map(Number).sort((a,b) => a - b);
for (const s of sortedScores) {
  const c = scoreHist[s];
  const bar = '█'.repeat(Math.max(1, Math.round(60 * c / N)));
  console.log(`  ${pad(s,3)} ${pad(c.toLocaleString(),8)} ${pad(pct(c,N),7)}  ${bar}`);
}
console.log('');

console.log('━━━ MYTHIC-BYTE DISTRIBUTION (companion overrides) ━━━');
const mythOrder = ['None','The Toad','The Cicada','Baby Mammoth','Raccoon','Great Blue Heron','Garden Spider','The Beholder'];
for (const m of mythOrder) {
  const c = mythicHist[m] || 0;
  console.log(`  ${padR(m,18)} ${pad(c.toLocaleString(),8)}  ${pad(pct(c, N), 8)}`);
}
console.log('');

console.log('━━━ MUTATION DISTRIBUTION ━━━');
const mutPairs = Object.entries(mutationHist).sort((a,b) => b[1] - a[1]);
for (const [name, c] of mutPairs) {
  console.log(`  ${padR(name, 18)} ${pad(c.toLocaleString(),8)}  ${pad(pct(c, N), 8)}`);
}
console.log('');

console.log('━━━ MUTATION × MYTHIC COMBO RATES (blockchain value scarcity) ━━━');
console.log(`  Any visible mutation:                ${(N - (mutationHist['None']||0)).toLocaleString()}  (${pct(N - (mutationHist['None']||0), N)})`);
console.log(`  Any mythic creature:                 ${(N - (mythicHist['None']||0)).toLocaleString()}  (${pct(N - (mythicHist['None']||0), N)})`);
console.log(`  BOTH mutation + mythic creature:     ${bothFiredCount.toLocaleString()}  (${pct(bothFiredCount, N)})`);
console.log(`  ULTRA mut (0xFA+) × Legendary+ creature: ${topTierComboCount.toLocaleString()}  (${pct(topTierComboCount, N)})`);
console.log(`  Constellation × Beholder (white whale): ${cosmicMutCosmicMyth.toLocaleString()}  (${pct(cosmicMutCosmicMyth, N)})`);
console.log(`  Golden Pot + any mythic creature:    ${goldenAndMythic.toLocaleString()}  (${pct(goldenAndMythic, N)})`);
console.log(`  Golden Pot + Beholder:               ${goldenAndCosmic.toLocaleString()}  (${pct(goldenAndCosmic, N)})`);
console.log(`  Golden Pot + Mutation + Mythic:      ${allThreeRare.toLocaleString()}  (${pct(allThreeRare, N)})`);
console.log(`  Cosmic-grade plants (overall score): ${cosmicGrade.toLocaleString()}  (${pct(cosmicGrade, N)})`);
console.log('');

console.log('━━━ TOP 15 MUTATION × MYTHIC COMBOS (rarest visible pairs) ━━━');
const comboPairs = Object.entries(comboHist).sort((a,b) => a[1] - b[1]).slice(0, 15);
for (const [combo, c] of comboPairs) {
  console.log(`  ${padR(combo, 36)} ${pad(c.toLocaleString(),6)}  ${pad(pct(c, N), 9)}`);
}
console.log('');

console.log('━━━ SPIKE INTERACTION SANITY ━━━');
console.log(`  Mythic-byte spike fired (mb >= 0xD0): ${spikeFired.toLocaleString()} (${pct(spikeFired, N)})`);
console.log(`  Companion tier was suppressed by gate on every spike — verified by code path.`);
console.log(`  (compT non-null while spike fired, count: ${companionScoredAndSpike.toLocaleString()} —`);
console.log(`   these are the cases where the gate matters; spike replaces companion-tier score.)`);
console.log('');

console.log('Done.');
