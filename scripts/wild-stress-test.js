#!/usr/bin/env node
/*
 * Wild ecosystem stress simulation — runs the breeding + climate + death
 * + sprout math locally so we can see steady-state population and
 * per-day metrics without needing a live Firestore.
 *
 * Matches the production constants as of Apr 14, 2026.
 *
 * Usage:  node scripts/wild-stress-test.js [startPlants=9] [days=30]
 */

const START = parseInt(process.argv[2] || '9', 10);
const DAYS = parseInt(process.argv[3] || '30', 10);

// --- Constants mirrored from wild.js ---
const BASE_LIFESPAN_DAYS = 3;
const REPRO_CHANCE = 0.30;
const MATURE_DAYS = 2;
const TEND_PROB_PEAK = 0.3;     // chance any visiting keeper tends a plant
const TEND_PROB_OPPOSITE = 0.8; // assume rare off-season plants get attention
const CLIMATE_DAMAGE_BASE_H = 8;
const CAP_DAMAGE_H = 72;

function rng() { return Math.random(); }

// Simulated weather day
function weatherDay() {
  return {
    temp: 15 + rng() * 20 - 5,       // -5 .. 30
    rain: rng() < 0.3 ? rng() * 50 : 0,
    wind: 8 + rng() * 30               // 8 .. 38 mph
  };
}

// Per-plant thresholds (deterministic-ish — here we use random to mimic spread)
function makeThresholds() {
  return {
    heatMax:     28 + Math.floor(rng() * 13),
    coldMin:     -5 + Math.floor(rng() * 18),
    droughtDays:  3 + Math.floor(rng() * 8),
    floodMm:     20 + Math.floor(rng() * 45),
    windMax:     18 + Math.floor(rng() * 28)
  };
}

function makePlant(id, parentZone) {
  return {
    id,
    zone: parentZone !== undefined ? parentZone : Math.floor(rng() * 16),
    age: 0,
    decayAt: BASE_LIFESPAN_DAYS * 24,   // hours from now
    lastClimateKind: null,
    tendsToday: 0,
    thresholds: makeThresholds(),
    season: Math.floor(rng() * 4)
  };
}

function densityMod(n) {
  if (n >= 7) return 0;
  if (n >= 5) return 0.10;
  if (n >= 3) return 0.35;
  return 1.0;
}

// curSeason: 0=spring,1=summer,2=autumn,3=winter based on day of year
function seasonMult(plantSeason, day) {
  const curSeason = Math.floor((day % 360) / 90);
  let delta = Math.abs(plantSeason - curSeason);
  if (delta === 3) delta = 1;
  return delta === 0 ? 0.5 : delta === 2 ? 1.75 : 1.0;
}

// Main sim
let plants = [];
for (let i = 0; i < START; i++) plants.push(makePlant(i, i));
let nextId = START;
let dryDays = {};
let metrics = { births: 0, deaths: 0, sprouts: 0, germinations: 0 };
let pendingSprouts = [];

for (let day = 0; day < DAYS; day++) {
  const w = weatherDay();
  const dayMetrics = { births: 0, deaths: 0, sprouts: 0, germinations: 0 };

  // Dry-day counter per zone
  const zonesInPlay = new Set(plants.map(p => p.zone));
  zonesInPlay.forEach(z => {
    if (w.rain > 1) dryDays[z] = 0;
    else dryDays[z] = (dryDays[z] || 0) + 1;
  });

  // Climate damage
  plants.forEach(p => {
    const t = p.thresholds;
    const zDry = dryDays[p.zone] || 0;
    let breaches = 0;
    if (w.temp > t.heatMax) breaches++;
    if (w.temp < t.coldMin) breaches++;
    if (w.rain > t.floodMm) breaches++;
    if (zDry > t.droughtDays) breaches++;
    if (w.wind > t.windMax) breaches++;
    if (breaches === 0) return;
    const sMult = seasonMult(p.season, day);
    const hoursLost = Math.min(CAP_DAMAGE_H, breaches * CLIMATE_DAMAGE_BASE_H * sMult);
    p.decayAt -= hoursLost;
    p.lastClimateKind = 'breach';
    p.lastClimateHitHours = 0;
  });

  // Community tending (simulate)
  plants.forEach(p => {
    const sMult = seasonMult(p.season, day);
    const prob = sMult > 1 ? TEND_PROB_OPPOSITE : TEND_PROB_PEAK;
    // Up to 4 keepers attempt
    for (let k = 0; k < 4; k++) {
      if (rng() < prob) p.decayAt += 6; // +6h per tend (own-plant rate)
    }
  });

  // Age plants + determine deaths
  const survivors = [];
  const deadZones = {};
  plants.forEach(p => {
    p.age += 1;
    p.decayAt -= 24;  // one day passes
    if (p.decayAt <= 0) {
      dayMetrics.deaths++;
      metrics.deaths++;
      if (p.lastClimateKind === 'breach') {
        deadZones[p.zone] = deadZones[p.zone] || [];
        deadZones[p.zone].push(p);
      }
    } else {
      survivors.push(p);
    }
  });
  plants = survivors;

  // Sprouts: empty-zone + last death was climate
  Object.keys(deadZones).forEach(zoneStr => {
    const zone = parseInt(zoneStr, 10);
    const stillAlive = plants.some(p => p.zone === zone);
    if (!stillAlive) {
      pendingSprouts.push({ zone, germinateIn: 1 + Math.floor(rng() * 2) });
      dayMetrics.sprouts++;
      metrics.sprouts++;
    }
  });

  // Germinate pending sprouts
  pendingSprouts = pendingSprouts.filter(s => {
    s.germinateIn -= 1;
    if (s.germinateIn <= 0) {
      plants.push(makePlant(nextId++, s.zone));
      dayMetrics.germinations++;
      metrics.germinations++;
      return false;
    }
    return true;
  });

  // Reproduction per zone
  const byZone = {};
  plants.forEach(p => { (byZone[p.zone] = byZone[p.zone] || []).push(p); });
  Object.keys(byZone).forEach(zoneStr => {
    const zone = parseInt(zoneStr, 10);
    const pool = byZone[zone];
    // Adjacent zones (mimic neighbors)
    const neighbors = [zone - 1, zone + 1].flatMap(z => byZone[z] || []);
    const all = pool.concat(neighbors);
    // Age-gate
    const mature = all.filter(p => p.age >= MATURE_DAYS);
    if (mature.length < 2) return;
    const dm = densityMod(pool.length);
    if (dm === 0) return;
    // Simplified modifiers
    const weatherMod = w.rain > 5 ? 2.0 : w.rain > 1 ? 1.5 : 1.0;
    const popMod = Math.min(1.4, 0.5 + mature.length * 0.125);
    const chance = REPRO_CHANCE * dm * weatherMod * popMod;
    if (rng() < chance) {
      // Find empty neighbor zone; if none, skip (saturated path fallback)
      const candidates = [zone - 2, zone - 1, zone + 1, zone + 2]
        .filter(z => !(byZone[z] && byZone[z].length >= 7));
      const target = candidates.length ? candidates[Math.floor(rng() * candidates.length)] : null;
      if (target !== null) {
        plants.push(makePlant(nextId++, target));
        (byZone[target] = byZone[target] || []).push(plants[plants.length - 1]);
        dayMetrics.births++;
        metrics.births++;
      }
    }
  });

  console.log(
    `Day ${String(day + 1).padStart(2, ' ')} │ pop: ${String(plants.length).padStart(3, ' ')} │ ` +
    `births ${dayMetrics.births}  deaths ${dayMetrics.deaths}  ` +
    `sprouts ${dayMetrics.sprouts}  germ ${dayMetrics.germinations} │ ` +
    `weather ${Math.round(w.temp)}°C ${w.rain.toFixed(1)}mm ${Math.round(w.wind)}mph`
  );
}

console.log('─'.repeat(70));
console.log(`Totals over ${DAYS} days: births=${metrics.births}  deaths=${metrics.deaths}  sprouts=${metrics.sprouts}  germinations=${metrics.germinations}`);
console.log(`Final population: ${plants.length} (started ${START})`);
console.log(`Zones alive: ${new Set(plants.map(p => p.zone)).size}`);
