// LUCID WINDS — LOOT DISTRIBUTION VERIFICATION
// Monte Carlo: 200K hashes, Model H scoring, current trait counts
// Plus: post-expansion projection with target trait counts
// Plus: "Almost" effect analysis per the D2 spec
// Plus: XOR accumulation method verification (hash buffer system)

var crypto = require('crypto');

function generateHashes(n) {
  var hashes = [];
  for (var i = 0; i < n; i++) {
    hashes.push(crypto.createHash('sha256').update('lucidwinds_' + i + '_' + Date.now() + '_' + Math.random()).digest('hex'));
  }
  return hashes;
}

function hashToTraits(hash) {
  var h = (hash || '').toLowerCase();
  while (h.length < 64) h += '0';
  function hc(i) { return parseInt(h[i], 16) || 0; }
  function hb(i) { return parseInt(h[i] + h[i + 1], 16) || 0; }
  var mutByte = hb(16);
  var mythByte = hb(18);
  var mutName = mutByte >= 0xF0 ? 'Glitch' : mutByte >= 0xE0 ? 'Glass Stem' : mutByte >= 0xD0 ? 'Wireframe' : 'None';
  var goldenPot = hc(0) === 15;
  var glowFlower = hc(11) === 15;
  var crystalBase = hc(20) === 15;
  var companion = (function () {
    var _mb = hb(18);
    if (_mb === 0xFF) return 38; if (_mb >= 0xFE) return 37; if (_mb >= 0xFC) return 36;
    if (_mb >= 0xF8) return 35; if (_mb >= 0xF4) return 34; if (_mb >= 0xE0) return 33;
    if (_mb >= 0xD0) return 32; return hb(21) % 60;
  })();
  return {
    pot: goldenPot ? 15 : hb(0) % 30,
    stem: hc(2),
    leafType: hb(4),
    leafSize: 6 + (hc(6) % 5),
    hasFlower: hc(10) > 4,
    flower: glowFlower ? 15 : hb(11),
    flowerSize: 4 + (hc(13) % 5),
    stemHeight: 22 + hc(3) * 2.5,
    aura: hb(15) % 21,
    base: crystalBase ? 15 : hb(20) % 30,
    companion: companion,
    mutation: mutByte,
    mutationName: mutName,
    mythic: mythByte,
    season: hb(22) % 4
  };
}

// ═══ MODEL H: 5-Slot Calibrated (current traits) ═══
function score_modelH(t) {
  var score = 0;

  // SLOT 1: VESSEL (best of pot, substrate)
  var potS = 0;
  if (t.pot === 15) potS = 2; // Golden Pot (Legendary)
  else if (t.pot === 21 || t.pot === 22 || t.pot === 23 || t.pot === 27 || t.pot === 28) potS = 1; // Rare pots
  else if (t.pot === 7) potS = 1; // Terrarium Globe (Rare)
  var subS = 0;
  if (t.base === 15 || t.base === 28 || t.base === 29) subS = 1; // Crystal, Meteorite, Mycelium
  score += (potS > subS ? potS : subS);

  // SLOT 2: FOLIAGE (best of stem, leaf)
  var stemS = 0;
  var st = t.stem % 15;
  if (st === 12 || st === 14) stemS = 1; // Epic stems
  var leafS = 0;
  var lt = t.leafType % 60;
  if (lt >= 40 && lt <= 49) leafS = 1; // Epic leaves (fantasy set 2)
  score += (stemS > leafS ? stemS : leafS);

  // SLOT 3: BLOOM
  if (t.hasFlower) {
    var bl = t.flower % 46;
    if (bl === 15) score += 2; // Glow Flower (Legendary)
    else if (bl >= 34 && bl <= 45) score += 1; // Epic exotics
  }

  // SLOT 4: AURA
  if (t.aura >= 17 && t.aura <= 20) score += 1; // Epic auras

  // SLOT 5: COMPANION (base, non-mythic)
  if (t.mythic < 0xD0) {
    var c = t.companion;
    if (c === 40 || c === 43 || c === 44 || c === 46 || c === 47 || c === 48 || c === 49 || c === 50) {
      score += 1;
    }
  }

  // SPIKE: MUTATION
  if (t.mutationName === 'Wireframe') score += 1;
  else if (t.mutationName === 'Glass Stem') score += 2;
  else if (t.mutationName === 'Glitch') score += 3;

  // SPIKE: MYTHIC — scored by byte, not companion number
  var mb = t.mythic;
  if (mb >= 0xD0 && mb < 0xF4) score += 4;      // Toad + Capybara
  else if (mb >= 0xF4 && mb < 0xFC) score += 5;  // Biolum + Ancient Rune
  else if (mb >= 0xFC && mb < 0xFE) score += 6;  // Storm Wraith
  else if (mb === 0xFE) score += 7;               // Starfall
  else if (mb === 0xFF) score += 8;               // Beholder

  return score;
}

// ═══ TIER MAPPER ═══
var THRESHOLDS = [0, 2, 4, 6, 8, 10, 12];
var TIER_NAMES = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Cosmic'];
function getTier(score) {
  for (var i = TIER_NAMES.length - 1; i >= 0; i--) {
    if (score >= THRESHOLDS[i]) return TIER_NAMES[i];
  }
  return 'Common';
}

// ═══ RARITY CLASSIFICATION (for "Almost" effect) ═══
function countInterestingTraits(t) {
  var count = 0;
  // Rare+ pot
  if (t.pot === 15 || t.pot === 7 || t.pot === 21 || t.pot === 22 || t.pot === 23 || t.pot === 27 || t.pot === 28) count++;
  // Rare+ stem
  var st = t.stem % 15;
  if (st === 5 || st === 8 || st === 9 || st === 11 || st === 12 || st === 14) count++;
  // Rare+ leaf
  var lt = t.leafType % 60;
  if (lt >= 30) count++; // Rare and above (cases 30-49 + some 50s)
  // Rare+ bloom (when present)
  if (t.hasFlower) {
    var bl = t.flower % 46;
    if (bl >= 18 || bl === 15) count++; // Rare+
  }
  // Uncommon+ companion
  if (t.mythic < 0xD0 && t.companion >= 28 && t.companion <= 57 && t.companion < 58) count++;
  // Mythic creature
  if (t.mythic >= 0xD0) count++;
  // Any aura (not None)
  if (t.aura >= 5) count++;
  // Rare+ substrate
  if (t.base === 15 || t.base === 16 || t.base === 17 || t.base === 28 || t.base === 29) count++;
  // Any mutation
  if (t.mutationName !== 'None') count++;
  return count;
}

// ═══ RUN ═══
var N = 200000;
console.log('Generating ' + N + ' random hashes...');
var hashes = generateHashes(N);

console.log('═══════════════════════════════════════════════════════════════');
console.log('LUCID WINDS — LOOT DISTRIBUTION VERIFICATION');
console.log('Model H scoring, ' + N + ' plants, current trait counts');
console.log('═══════════════════════════════════════════════════════════════\n');

// ── Score distribution ──
var dist = {}; TIER_NAMES.forEach(function(t) { dist[t] = 0; });
var scores = [];
var slotHits = { vessel: 0, foliage: 0, bloom: 0, aura: 0, companion: 0, mutation: 0, mythic: 0 };

for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  var s = score_modelH(t);
  scores.push(s);
  dist[getTier(s)]++;
  
  // Track per-slot hits
  var potS = 0;
  if (t.pot === 15) potS = 2;
  else if (t.pot === 7 || t.pot === 21 || t.pot === 22 || t.pot === 23 || t.pot === 27 || t.pot === 28) potS = 1;
  var subS = (t.base === 15 || t.base === 28 || t.base === 29) ? 1 : 0;
  if (potS > 0 || subS > 0) slotHits.vessel++;
  
  var stemS = ((t.stem % 15) === 12 || (t.stem % 15) === 14) ? 1 : 0;
  var leafS = ((t.leafType % 60) >= 40 && (t.leafType % 60) <= 49) ? 1 : 0;
  if (stemS > 0 || leafS > 0) slotHits.foliage++;
  
  if (t.hasFlower) {
    var bl = t.flower % 46;
    if (bl === 15 || (bl >= 34 && bl <= 45)) slotHits.bloom++;
  }
  
  if (t.aura >= 17 && t.aura <= 20) slotHits.aura++;
  
  if (t.mythic < 0xD0) {
    var c = t.companion;
    if (c === 40 || c === 43 || c === 44 || c === 46 || c === 47 || c === 48 || c === 49 || c === 50) slotHits.companion++;
  }
  
  if (t.mutationName !== 'None') slotHits.mutation++;
  if (t.mythic >= 0xD0) slotHits.mythic++;
}

// ── Display results ──
var target = { Common: 42, Uncommon: 28, Rare: 16, Epic: 9, Legendary: 3.5, Mythic: 1.2, Cosmic: 0.3 };
console.log('TIER DISTRIBUTION:');
console.log('─────────────────────────────────────────────────────');
var totalDelta = 0;
for (var ti = 0; ti < TIER_NAMES.length; ti++) {
  var tn = TIER_NAMES[ti];
  var pct = (dist[tn] / N * 100);
  var tgt = target[tn];
  var delta = pct - tgt;
  totalDelta += Math.abs(delta);
  var bar = '';
  for (var b = 0; b < Math.round(pct); b++) bar += '█';
  console.log('  ' + tn.padEnd(12) + pct.toFixed(1).padStart(6) + '%   target: ' + (tgt + '%').padEnd(6) + '  Δ=' + (delta >= 0 ? '+' : '') + delta.toFixed(1).padStart(5) + '%  ' + bar);
}
console.log('  Total absolute deviation: ' + totalDelta.toFixed(1) + '%');

// Mean / max
var sum = 0, maxS = 0;
for (var i = 0; i < scores.length; i++) { sum += scores[i]; if (scores[i] > maxS) maxS = scores[i]; }
console.log('\n  Mean score: ' + (sum / N).toFixed(2));
console.log('  Max score:  ' + maxS);

// Histogram
console.log('\nSCORE HISTOGRAM:');
var hist = {};
for (var i = 0; i < scores.length; i++) hist[scores[i]] = (hist[scores[i]] || 0) + 1;
for (var s = 0; s <= maxS; s++) {
  var c = hist[s] || 0;
  var bar = '';
  for (var b = 0; b < Math.round(c / N * 200); b++) bar += '█';
  var tier = getTier(s);
  console.log('  ' + String(s).padStart(2) + ': ' + String(c).padStart(6) + ' (' + (c / N * 100).toFixed(1).padStart(5) + '%)  ' + tier.padEnd(10) + ' ' + bar);
}

// Per-slot hit rates
console.log('\nPER-SLOT HIT RATES:');
var slotNames = ['vessel', 'foliage', 'bloom', 'aura', 'companion', 'mutation', 'mythic'];
for (var si = 0; si < slotNames.length; si++) {
  console.log('  ' + slotNames[si].padEnd(12) + (slotHits[slotNames[si]] / N * 100).toFixed(1) + '%');
}

// "Almost" effect
console.log('\n"ALMOST" EFFECT (Diablo 2 curve):');
var almDist = {};
for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  var interesting = countInterestingTraits(t);
  almDist[interesting] = (almDist[interesting] || 0) + 1;
}
var maxInt = 0;
for (var k in almDist) if (parseInt(k) > maxInt) maxInt = parseInt(k);
for (var c = 0; c <= maxInt; c++) {
  var cnt = almDist[c] || 0;
  console.log('  ' + c + ' interesting traits: ' + (cnt / N * 100).toFixed(1) + '%');
}
var atLeast1 = (N - (almDist[0] || 0)) / N * 100;
var fourPlus = 0;
for (var c = 4; c <= maxInt; c++) fourPlus += (almDist[c] || 0);
console.log('\n  ≥1 interesting: ' + atLeast1.toFixed(1) + '%  (target: ~94%)');
console.log('  ≥4 interesting: ' + (fourPlus / N * 100).toFixed(1) + '%  (target: ~7%)');

// Flowerless analysis
console.log('\nFLOWERLESS PLANTS:');
var flCount = 0, flUncommon = 0, flRare = 0;
for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  if (!t.hasFlower) {
    flCount++;
    var s = score_modelH(t);
    if (s >= 2) flUncommon++;
    if (s >= 4) flRare++;
  }
}
console.log('  Total: ' + flCount + ' (' + (flCount / N * 100).toFixed(1) + '%)');
console.log('  Reach Uncommon+: ' + (flUncommon / flCount * 100).toFixed(1) + '%');
console.log('  Reach Rare+: ' + (flRare / flCount * 100).toFixed(1) + '%');

// No companion, no mythic analysis
console.log('\nNO COMPANION + NO MYTHIC:');
var ncCount = 0, ncUncommon = 0;
for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  if (t.companion < 20 && t.mythic < 0xD0) {
    ncCount++;
    if (score_modelH(t) >= 2) ncUncommon++;
  }
}
console.log('  Total: ' + ncCount + ' (' + (ncCount / N * 100).toFixed(1) + '%)');
console.log('  Reach Uncommon+: ' + (ncUncommon / ncCount * 100).toFixed(1) + '%');

// Mythic creature breakdown
console.log('\nMYTHIC CREATURE TIER DISTRIBUTION:');
var mythicTiers = {};
for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  if (t.mythic >= 0xD0) {
    var s = score_modelH(t);
    var tier = getTier(s);
    mythicTiers[tier] = (mythicTiers[tier] || 0) + 1;
  }
}
var mythicTotal = 0;
for (var k in mythicTiers) mythicTotal += mythicTiers[k];
for (var ti = 0; ti < TIER_NAMES.length; ti++) {
  var tn = TIER_NAMES[ti];
  if (mythicTiers[tn]) {
    console.log('  ' + tn.padEnd(12) + (mythicTiers[tn] / mythicTotal * 100).toFixed(1) + '% of mythic plants');
  }
}

// Max possible without mythic/mutation
console.log('\nMAX SCORE WITHOUT MYTHIC OR MUTATION:');
var maxNoSpike = 0;
for (var i = 0; i < N; i++) {
  var t = hashToTraits(hashes[i]);
  if (t.mythic < 0xD0 && t.mutationName === 'None') {
    var s = score_modelH(t);
    if (s > maxNoSpike) maxNoSpike = s;
  }
}
console.log('  Highest observed: ' + maxNoSpike + ' (' + getTier(maxNoSpike) + ')');
console.log('  Theoretical max: 7 (Epic) — Golden Pot +2, Epic foliage +1, Glow Flower +2, Epic aura +1, Epic companion +1');

// ═══ XOR ACCUMULATION METHOD VERIFICATION ═══
// Verifies that building hashes via 30 XOR contributions produces
// the same rarity distribution as pure random hashes
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('XOR ACCUMULATION METHOD VERIFICATION');
console.log('Simulating 10,000 plants with 30 XOR contributions each...');
console.log('═══════════════════════════════════════════════════════════════\n');

var XOR_N = 10000;
var xorDist = {};
TIER_NAMES.forEach(function(t) { xorDist[t] = 0; });
var xorScores = [];

for (var xi = 0; xi < XOR_N; xi++) {
  // Seed buffer with random bytes (matching game code: crypto.getRandomValues)
  var buf = crypto.randomBytes(32);
  // Simulate 30 hash contributions XOR'd on top at random positions
  for (var hi = 0; hi < 30; hi++) {
    var rndByte = crypto.randomBytes(1)[0];
    var posByte = crypto.randomBytes(1)[0];
    var pos = posByte % 32;
    buf[pos] ^= rndByte;
  }
  var xorHex = buf.toString('hex');
  var xorTraits = hashToTraits(xorHex);
  var xorScore = score_modelH(xorTraits);
  xorScores.push(xorScore);
  xorDist[getTier(xorScore)]++;
}

// Compare XOR accumulation vs pure random
console.log('XOR ACCUMULATION vs PURE RANDOM:');
console.log('─────────────────────────────────────────────────────');
var maxDelta = 0;
for (var ti = 0; ti < TIER_NAMES.length; ti++) {
  var tn = TIER_NAMES[ti];
  var xorPct = (xorDist[tn] / XOR_N * 100);
  var rndPct = (dist[tn] / N * 100);
  var d = Math.abs(xorPct - rndPct);
  if (d > maxDelta) maxDelta = d;
  console.log('  ' + tn.padEnd(12) + 'XOR: ' + xorPct.toFixed(1).padStart(5) + '%   Random: ' + rndPct.toFixed(1).padStart(5) + '%   Delta: ' + (xorPct - rndPct >= 0 ? '+' : '') + (xorPct - rndPct).toFixed(1).padStart(5) + '%');
}

// Byte uniformity check — verify all 32 byte positions are touched
var byteTouched = new Array(32).fill(0);
for (var bi = 0; bi < 1000; bi++) {
  var tbuf = crypto.randomBytes(32); // Seeded (all bytes already touched)
  for (var hi = 0; hi < 30; hi++) {
    var pb = crypto.randomBytes(1)[0] % 32;
    tbuf[pb] ^= crypto.randomBytes(1)[0];
    byteTouched[pb]++;
  }
}
var minTouch = Infinity, maxTouch = 0;
for (var b = 0; b < 32; b++) {
  if (byteTouched[b] < minTouch) minTouch = byteTouched[b];
  if (byteTouched[b] > maxTouch) maxTouch = byteTouched[b];
}
console.log('\nBYTE POSITION COVERAGE (1000 plants × 30 contributions):');
console.log('  Min touches: ' + minTouch + '  Max: ' + maxTouch + '  Expected: ~' + Math.round(30000 / 32));
console.log('  All positions reached: ' + (minTouch > 0 ? 'YES' : 'NO — WARNING'));

// XOR mean/max
var xorSum = 0, xorMax = 0;
for (var i = 0; i < xorScores.length; i++) { xorSum += xorScores[i]; if (xorScores[i] > xorMax) xorMax = xorScores[i]; }
console.log('\n  XOR Mean score: ' + (xorSum / XOR_N).toFixed(2) + '  (Random mean: ' + (sum / N).toFixed(2) + ')');
console.log('  XOR Max score:  ' + xorMax + '  (Random max: ' + maxS + ')');

// Verdict
console.log('\n  Max tier delta: ' + maxDelta.toFixed(1) + '%');
if (maxDelta < 3.0) {
  console.log('  ✓ PASS — XOR accumulation produces equivalent rarity distribution');
} else {
  console.log('  ✗ FAIL — Significant deviation detected, investigate');
}

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('VERIFICATION COMPLETE');
console.log('═══════════════════════════════════════════════════════════════');
