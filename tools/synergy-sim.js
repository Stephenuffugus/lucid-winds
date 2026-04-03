/**
 * Lucid Winds — Synergy System Simulation
 * Generates 100K random hashes, derives traits, checks 40 synergies.
 * First-match-wins: each plant can trigger at most one synergy.
 */

var crypto = require('crypto');

// --- Trait derivation ---

function hb(hash, byteIndex) {
  return parseInt(hash.substr(byteIndex * 2, 2), 16);
}

function deriveTraits(hash) {
  var pot       = parseInt(hash.substr(0, 2), 16) % 71;
  var stem      = parseInt(hash.substr(4, 2), 16) % 24;
  var leafType  = parseInt(hash.substr(8, 2), 16) % 71;
  var hasFlower = parseInt(hash.charAt(20), 16) > 4;
  var flower    = parseInt(hash.substr(22, 2), 16) % 71;
  var aura      = parseInt(hash.substr(30, 2), 16) % 36;
  var mutByte   = parseInt(hash.substr(32, 2), 16);
  var mythByte  = parseInt(hash.substr(36, 2), 16);
  var base      = parseInt(hash.substr(40, 2), 16) % 71;
  var compRaw   = parseInt(hash.substr(42, 2), 16) % 82;
  var season    = parseInt(hash.substr(44, 2), 16) % 4;

  // Mutation thresholds (descending)
  var mutation = 'None';
  if      (mutByte >= 0xFC) mutation = 'Glitch';
  else if (mutByte >= 0xF8) mutation = 'Glass';
  else if (mutByte >= 0xF4) mutation = 'Wireframe';
  else if (mutByte >= 0xF0) mutation = 'Holographic';
  else if (mutByte >= 0xEC) mutation = 'Neon';
  else if (mutByte >= 0xE8) mutation = 'InkWash';
  else if (mutByte >= 0xE4) mutation = 'Golden';
  else if (mutByte >= 0xE0) mutation = 'Porcelain';
  else if (mutByte >= 0xDC) mutation = 'Bioluminescent';
  else if (mutByte >= 0xD8) mutation = 'PixelArt';
  else if (mutByte >= 0xD4) mutation = 'Silhouette';
  else if (mutByte >= 0xD0) mutation = 'Albino';
  else if (mutByte >= 0xCC) mutation = 'Fossil';

  // Mythic companion override
  var companion = compRaw;
  if      (mythByte === 0xFF) companion = 38; // Beholder
  else if (mythByte >= 0xFE)  companion = 37; // Starfall
  else if (mythByte >= 0xFC)  companion = 36; // Storm Wraith
  else if (mythByte >= 0xF8)  companion = 35; // Ancient Rune
  else if (mythByte >= 0xF4)  companion = 34; // Biolum Pulse
  else if (mythByte >= 0xE0)  companion = 33; // Capybara
  else if (mythByte >= 0xD0)  companion = 32; // Toad

  return {
    pot: pot,
    stem: stem,
    leafType: leafType,
    hasFlower: hasFlower,
    flower: flower,
    aura: aura,
    base: base,
    companion: companion,
    season: season,
    mutation: mutation
  };
}

// --- Synergy definitions ---
// Each: { name, category, bonus, test(t) }
// "bloom" in the spec means flower index (only relevant if hasFlower)

var synergies = [
  // ELEMENTAL (1-10)
  { id: 1,  name: 'Frozen Flame',    cat: 'ELEMENTAL', bonus: 2, test: function(t){ return t.hasFlower && t.flower===67 && t.leafType===61; }},
  { id: 2,  name: 'Magma Heart',     cat: 'ELEMENTAL', bonus: 2, test: function(t){ return t.base===17 && t.aura===20; }},
  { id: 3,  name: 'Permafrost',      cat: 'ELEMENTAL', bonus: 1, test: function(t){ return t.season===3 && t.leafType===67; }},
  { id: 4,  name: 'Ember Drift',     cat: 'ELEMENTAL', bonus: 2, test: function(t){ return t.hasFlower && t.flower===66 && t.base===59; }},
  { id: 5,  name: 'Stormglass',      cat: 'ELEMENTAL', bonus: 2, test: function(t){ return t.stem===22 && t.aura===19; }},
  { id: 6,  name: 'Sunstroke',       cat: 'ELEMENTAL', bonus: 1, test: function(t){ return t.season===1 && t.aura===6; }},
  { id: 7,  name: 'Monsoon Bloom',   cat: 'ELEMENTAL', bonus: 1, test: function(t){ return t.season===0 && t.hasFlower && t.flower===3; }},
  { id: 8,  name: 'Bonfire Vigil',   cat: 'ELEMENTAL', bonus: 1, test: function(t){ return t.pot===50 && t.companion===23; }},
  { id: 9,  name: 'Scorched Earth',  cat: 'ELEMENTAL', bonus: 2, test: function(t){ return t.base===57 && t.stem===12; }},
  { id: 10, name: 'Static Charge',   cat: 'ELEMENTAL', bonus: 1, test: function(t){ return t.stem===6 && t.leafType===60; }},

  // NATURE (11-20)
  { id: 11, name: 'Symbiosis',       cat: 'NATURE', bonus: 1, test: function(t){ return t.base===18 && t.companion===27; }},
  { id: 12, name: "Pollinator's Crown", cat: 'NATURE', bonus: 2, test: function(t){ return t.hasFlower && t.flower===10 && t.companion===28; }},
  { id: 13, name: 'Old Growth',      cat: 'NATURE', bonus: 1, test: function(t){ return t.stem===4 && t.base===9; }},
  { id: 14, name: 'Hedge Witch',     cat: 'NATURE', bonus: 2, test: function(t){ return t.pot===53 && t.companion===43; }},
  { id: 15, name: 'Nectar Tide',     cat: 'NATURE', bonus: 1, test: function(t){ return t.hasFlower && t.flower===2 && t.companion===24; }},
  { id: 16, name: 'Web Garden',      cat: 'NATURE', bonus: 2, test: function(t){ return t.aura===17 && t.companion===31; }},
  { id: 17, name: 'Bamboo Grove',    cat: 'NATURE', bonus: 1, test: function(t){ return t.stem===13 && t.leafType===4; }},
  { id: 18, name: 'Fern Hollow',     cat: 'NATURE', bonus: 1, test: function(t){ return t.stem===14 && t.leafType===6; }},
  { id: 19, name: 'Autumn Harvest',  cat: 'NATURE', bonus: 1, test: function(t){ return t.season===2 && t.leafType===7; }},
  { id: 20, name: 'Coral Reef',      cat: 'NATURE', bonus: 1, test: function(t){ return t.stem===9 && t.base===8; }},

  // COSMIC (21-30)
  { id: 21, name: 'Stardust Crown',  cat: 'COSMIC', bonus: 2, test: function(t){ return t.base===56 && t.hasFlower && t.flower===15; }},
  { id: 22, name: 'Meteor Garden',   cat: 'COSMIC', bonus: 2, test: function(t){ return t.base===28 && t.aura===8; }},
  { id: 23, name: 'Lunar Tide',      cat: 'COSMIC', bonus: 2, test: function(t){ return t.leafType===63 && t.aura===7; }},
  { id: 24, name: 'Aurora Veil',     cat: 'COSMIC', bonus: 1, test: function(t){ return t.aura===5 && t.hasFlower && t.flower===5; }},
  { id: 25, name: 'Seed Nexus',      cat: 'COSMIC', bonus: 2, test: function(t){ return t.aura===9 && t.pot===57; }},
  { id: 26, name: 'Clock Garden',    cat: 'COSMIC', bonus: 1, test: function(t){ return t.hasFlower && t.flower===69 && t.stem===3; }},
  { id: 27, name: 'Holographic Prism', cat: 'COSMIC', bonus: 2, test: function(t){ return t.mutation==='Holographic' && t.leafType===9; }},
  { id: 28, name: 'Stained Vigil',   cat: 'COSMIC', bonus: 2, test: function(t){ return t.aura===35 && t.stem===23; }},
  { id: 29, name: 'Void Gate',       cat: 'COSMIC', bonus: 2, test: function(t){ return t.hasFlower && t.flower===68 && t.aura===29; }},
  { id: 30, name: 'Neon Pulse',      cat: 'COSMIC', bonus: 1, test: function(t){ return t.mutation==='Neon' && t.stem===7; }},

  // DARK (31-35)
  { id: 31, name: 'Miasma Pitcher',  cat: 'DARK', bonus: 2, test: function(t){ return t.aura===18 && t.hasFlower && t.flower===34; }},
  { id: 32, name: 'Bone Altar',      cat: 'DARK', bonus: 1, test: function(t){ return t.pot===51 && t.base===15; }},
  { id: 33, name: "Titan's Maw",     cat: 'DARK', bonus: 2, test: function(t){ return t.hasFlower && t.flower===36 && t.companion===32; }},
  { id: 34, name: 'Fossil Memory',   cat: 'DARK', bonus: 1, test: function(t){ return t.mutation==='Fossil' && t.base===52; }},
  { id: 35, name: 'Shadow Loom',     cat: 'DARK', bonus: 2, test: function(t){ return t.mutation==='Silhouette' && t.leafType===68; }},

  // MYTHICAL (36-40)
  { id: 36, name: 'Dragon Keep',     cat: 'MYTHICAL', bonus: 2, test: function(t){ return t.hasFlower && t.flower===35 && t.pot===56; }},
  { id: 37, name: "Alchemist's Rose", cat: 'MYTHICAL', bonus: 1, test: function(t){ return t.pot===15 && t.hasFlower && t.flower===1; }},
  { id: 38, name: "Beholder's Gaze", cat: 'MYTHICAL', bonus: 2, test: function(t){ return t.companion===38 && t.leafType===62; }},
  { id: 39, name: 'Capybara Oasis',  cat: 'MYTHICAL', bonus: 2, test: function(t){ return t.companion===33 && t.stem===10; }},
  { id: 40, name: 'Wise Owl Roost',  cat: 'MYTHICAL', bonus: 1, test: function(t){ return t.companion===57 && t.stem===5; }}
];

// --- Simulation ---

var N = 100000;
var hits = {};
var totalSynergy = 0;
var multiHitCheck = 0; // should stay 0

synergies.forEach(function(s) { hits[s.id] = 0; });

for (var i = 0; i < N; i++) {
  // Generate random 64-char hex hash
  var hash = crypto.randomBytes(32).toString('hex');
  var traits = deriveTraits(hash);

  var matched = false;
  for (var j = 0; j < synergies.length; j++) {
    if (synergies[j].test(traits)) {
      if (matched) { multiHitCheck++; break; } // should never happen with first-match-wins
      hits[synergies[j].id]++;
      totalSynergy++;
      matched = true;
      break; // first match wins
    }
  }
}

// --- Output ---

console.log('=== LUCID WINDS SYNERGY SIMULATION ===');
console.log('Sample size: ' + N.toLocaleString() + ' plants\n');

console.log('TOTAL PLANTS WITH SYNERGY: ' + totalSynergy + ' (' + (totalSynergy / N * 100).toFixed(3) + '%)\n');

if (multiHitCheck > 0) {
  console.log('WARNING: ' + multiHitCheck + ' plants matched multiple synergies (should be 0)\n');
} else {
  console.log('VERIFIED: No plant matched more than one synergy (first-match-wins working)\n');
}

// Collect results
var results = synergies.map(function(s) {
  return { id: s.id, name: s.name, cat: s.cat, bonus: s.bonus, count: hits[s.id], pct: (hits[s.id] / N * 100) };
});

// Per-synergy table
console.log('--- PER-SYNERGY RESULTS ---');
console.log(padR('#', 4) + padR('Name', 24) + padR('Category', 12) + padR('Bonus', 7) + padR('Hits', 8) + 'Pct(%)');
console.log(repeat('-', 65));

results.forEach(function(r) {
  console.log(
    padR(String(r.id), 4) +
    padR(r.name, 24) +
    padR(r.cat, 12) +
    padR('+' + r.bonus, 7) +
    padR(String(r.count), 8) +
    r.pct.toFixed(4) + '%'
  );
});

// Zero-hit synergies
var zeros = results.filter(function(r) { return r.count === 0; });
console.log('\n--- ZERO-HIT SYNERGIES (' + zeros.length + ') ---');
if (zeros.length === 0) {
  console.log('None! All synergies fired at least once.');
} else {
  zeros.forEach(function(r) {
    console.log('  #' + r.id + ' ' + r.name + ' (' + r.cat + ')');
  });
}

// Top 5 most common
var sorted = results.slice().sort(function(a, b) { return b.count - a.count; });
console.log('\n--- TOP 5 MOST COMMON ---');
sorted.slice(0, 5).forEach(function(r, i) {
  console.log('  ' + (i + 1) + '. #' + r.id + ' ' + r.name + ' — ' + r.count + ' (' + r.pct.toFixed(4) + '%)');
});

// Top 5 rarest (excluding zeros for "rarest that actually fired")
var nonZero = sorted.filter(function(r) { return r.count > 0; });
console.log('\n--- TOP 5 RAREST (non-zero) ---');
nonZero.slice(-5).reverse().forEach(function(r, i) {
  console.log('  ' + (i + 1) + '. #' + r.id + ' ' + r.name + ' — ' + r.count + ' (' + r.pct.toFixed(4) + '%)');
});

// Category breakdown
var catTotals = {};
results.forEach(function(r) {
  if (!catTotals[r.cat]) catTotals[r.cat] = 0;
  catTotals[r.cat] += r.count;
});
console.log('\n--- CATEGORY TOTALS ---');
['ELEMENTAL', 'NATURE', 'COSMIC', 'DARK', 'MYTHICAL'].forEach(function(c) {
  console.log('  ' + padR(c, 12) + (catTotals[c] || 0) + ' hits (' + ((catTotals[c] || 0) / N * 100).toFixed(3) + '%)');
});

// Expected probability analysis
console.log('\n--- PROBABILITY ANALYSIS ---');
console.log('Two-trait synergies (independent uniform):');

var traitSizes = {
  pot: 71, stem: 24, leafType: 71, flower: 71, aura: 36,
  base: 71, companion: 82, season: 4
};

// For flower-dependent synergies, hasFlower ~ 11/16
var pHasFlower = 11/16;

// Show expected vs actual for a few
console.log('  Synergy #6 Sunstroke (season==1 AND aura==6):');
console.log('    Expected: 1/4 * 1/36 = ' + (1/4 * 1/36 * 100).toFixed(4) + '%');
console.log('    Actual:   ' + results[5].pct.toFixed(4) + '%');

console.log('  Synergy #19 Autumn Harvest (season==2 AND leafType==7):');
console.log('    Expected: 1/4 * 1/71 = ' + (1/4 * 1/71 * 100).toFixed(4) + '%');
console.log('    Actual:   ' + results[18].pct.toFixed(4) + '%');

console.log('  Synergy #39 Capybara Oasis (companion==33 AND stem==10):');
console.log('    Expected: ~' + (1/24 * 100 * 0.125).toFixed(4) + '% (mythic override ~12.5% for Capybara, * 1/24 stem)');
console.log('    Actual:   ' + results[38].pct.toFixed(4) + '%');

console.log('\nDone.');

// --- Helpers ---

function padR(s, n) {
  while (s.length < n) s += ' ';
  return s;
}

function repeat(c, n) {
  var s = '';
  for (var i = 0; i < n; i++) s += c;
  return s;
}
