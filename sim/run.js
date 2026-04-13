#!/usr/bin/env node
'use strict';
// Lucid Winds headless player-progression simulator.
// Usage: node sim/run.js [--gates=A|B|C] [--n=100] [--seed=42]

const fs = require('fs');
const path = require('path');
const { makeRng, mulberry32 } = require('./lib/rng');
const { ARCHETYPES } = require('./lib/archetypes');
const { GATES_A, GATES_B } = require('./lib/gates');
const { newPlayer, applyBootstrap } = require('./lib/player');
const { runSession } = require('./lib/session');
const { buildMarkdownReport, buildDeltaReport } = require('./lib/report');

function parseArgs(argv) {
  const out = { gates: 'C', n: 100, seed: 42 };
  for (const a of argv.slice(2)) {
    const m = /^--(\w+)=(.+)$/.exec(a);
    if (!m) continue;
    const [, k, v] = m;
    if (k === 'n' || k === 'seed') out[k] = parseInt(v, 10);
    else out[k] = v;
  }
  return out;
}

// Simulate a single player to Lv 12 (or dropout).
function simulatePlayer(archetype, gates, seed) {
  const rng = makeRng(seed);
  const p = newPlayer(archetype.name, rng);
  applyBootstrap(p);

  const MAX_DAYS = 90; // hard cap for safety
  let day = 0;
  while (p.level < 12 && day < MAX_DAYS) {
    p.dayIndex = day;

    // Lapser pattern: 1 day on, 7 off, repeat
    let playsToday = true;
    if (archetype.lapser) {
      const weekSlot = day % 8;
      playsToday = (weekSlot === 0);
    }
    if (archetype.weekender) {
      playsToday = (day % 7 === 5 || day % 7 === 6);
    }

    if (playsToday) {
      const numSessions = archetype.sessionsPerDay(rng);
      for (let s = 0; s < numSessions; s++) {
        if (p.level >= 12) break;
        // dropout check between sessions
        if (p.sessionsPlayed > 0 && rng.chance(archetype.dropoutChance)) {
          p.dropped = true;
          return p;
        }
        const mins = archetype.sessionMinutes(rng);
        runSession(p, archetype, gates, mins);
      }
    }
    day++;
  }
  if (p.level < 12) p.dropped = true;
  return p;
}

function runConfig(gates, gateName, n, baseSeed) {
  const results = [];
  for (let i = 0; i < n; i++) {
    const arch = ARCHETYPES[i % ARCHETYPES.length];
    // deterministic per-player seed
    const seed = (baseSeed * 1000003) ^ (i * 2654435761);
    const player = simulatePlayer(arch, gates, seed >>> 0);
    results.push(player);
  }
  return results;
}

function timestamp() {
  const d = new Date();
  const p = x => String(x).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function main() {
  const args = parseArgs(process.argv);
  const ts = timestamp();
  const outDir = path.join(__dirname, 'reports');
  fs.mkdirSync(outDir, { recursive: true });

  const start = Date.now();
  const written = [];

  if (args.gates === 'A' || args.gates === 'C') {
    const resA = runConfig(GATES_A, 'A', args.n, args.seed);
    const mdA = buildMarkdownReport(resA, { label: 'GATES_A (current)', n: args.n, gateName: 'A', seed: args.seed });
    const fA = path.join(outDir, `${ts}_A.md`);
    fs.writeFileSync(fA, mdA);
    written.push(fA);
    global._resA = resA;
  }
  if (args.gates === 'B' || args.gates === 'C') {
    const resB = runConfig(GATES_B, 'B', args.n, args.seed);
    const mdB = buildMarkdownReport(resB, { label: 'GATES_B (proposed)', n: args.n, gateName: 'B', seed: args.seed });
    const fB = path.join(outDir, `${ts}_B.md`);
    fs.writeFileSync(fB, mdB);
    written.push(fB);
    global._resB = resB;
  }
  if (args.gates === 'C') {
    const delta = buildDeltaReport(global._resA, global._resB, args.n, args.seed);
    const fC = path.join(outDir, `${ts}_C_delta.md`);
    fs.writeFileSync(fC, delta);
    written.push(fC);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Sim complete in ${elapsed}s. N=${args.n}, gates=${args.gates}, seed=${args.seed}`);
  for (const f of written) console.log(' →', f);
}

if (require.main === module) main();

module.exports = { simulatePlayer, runConfig };
