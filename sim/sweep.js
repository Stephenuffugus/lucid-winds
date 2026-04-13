#!/usr/bin/env node
'use strict';
// Multi-seed N=1000 sweep. Aggregates Lv 12 reach rates across 5 seeds
// to separate signal from noise. Runs both GATES_A and GATES_B and
// emits a comparison report.

const fs = require('fs');
const path = require('path');
const { makeRng } = require('./lib/rng');
const { ARCHETYPES } = require('./lib/archetypes');
const { GATES_A, GATES_B } = require('./lib/gates');
const { newPlayer, applyBootstrap } = require('./lib/player');
const { runSession } = require('./lib/session');

const SEEDS = [42, 7, 99, 1337, 2026];
const N_PER_SEED = 200; // 200 * 5 seeds = 1000 total
const MAX_DAYS = 90;

function simulate(arch, gates, seed) {
  const rng = makeRng(seed);
  const p = newPlayer(arch.name, rng);
  applyBootstrap(p);
  let day = 0;
  while (p.level < 12 && day < MAX_DAYS) {
    p.dayIndex = day;
    let playsToday = true;
    if (arch.lapser) playsToday = (day % 8 === 0);
    if (playsToday) {
      const numSessions = arch.sessionsPerDay(rng);
      for (let s = 0; s < numSessions; s++) {
        if (p.level >= 12) break;
        if (p.sessionsPlayed > 0 && rng.chance(arch.dropoutChance)) {
          p.dropped = true; return p;
        }
        runSession(p, arch, gates, arch.sessionMinutes(rng));
      }
    }
    day++;
  }
  if (p.level < 12) p.dropped = true;
  return p;
}

function runSweep(gates, gateName) {
  const byArch = {};
  for (const seed of SEEDS) {
    for (let i = 0; i < N_PER_SEED; i++) {
      const arch = ARCHETYPES[i % ARCHETYPES.length];
      const ps = ((seed * 1000003) ^ (i * 2654435761)) >>> 0;
      const p = simulate(arch, gates, ps);
      const k = arch.name;
      byArch[k] = byArch[k] || { reached: [], dropped: 0, total: 0 };
      byArch[k].total++;
      if (p.level >= 12) byArch[k].reached.push(p.minutesPlayed);
      else byArch[k].dropped++;
    }
  }
  return byArch;
}

function median(arr) {
  if (!arr.length) return null;
  const s = arr.slice().sort((a,b)=>a-b);
  return s[Math.floor(s.length/2)];
}
function p25(arr) { if (!arr.length) return null; const s = arr.slice().sort((a,b)=>a-b); return s[Math.floor(s.length*0.25)]; }
function p75(arr) { if (!arr.length) return null; const s = arr.slice().sort((a,b)=>a-b); return s[Math.floor(s.length*0.75)]; }

function formatReport(byArchA, byArchB, totalN) {
  let out = `# Multi-Seed Sweep — N=${totalN} (${SEEDS.length} seeds × ${N_PER_SEED}/seed)\n\n`;
  out += `Seeds: ${SEEDS.join(', ')}\n\n`;
  out += `## Aggregate Lv 12 reach rates\n\n`;
  let totalA = 0, reachedA = 0, totalB = 0, reachedB = 0;
  for (const k of Object.keys(byArchA)) {
    totalA += byArchA[k].total;
    reachedA += byArchA[k].reached.length;
    totalB += byArchB[k].total;
    reachedB += byArchB[k].reached.length;
  }
  out += `- **GATES_A:** ${reachedA}/${totalA} (${(reachedA/totalA*100).toFixed(1)}%)\n`;
  out += `- **GATES_B:** ${reachedB}/${totalB} (${(reachedB/totalB*100).toFixed(1)}%)\n\n`;

  out += `## Per-archetype Lv 12 reach (A vs B)\n\n`;
  out += `| Archetype | A reach | B reach | Δ reach | A median | B median | Δ min |\n`;
  out += `|-----------|---------|---------|---------|----------|----------|-------|\n`;
  const archNames = Object.keys(byArchA).sort();
  for (const k of archNames) {
    const a = byArchA[k]; const b = byArchB[k];
    const aRate = (a.reached.length/a.total*100).toFixed(0)+'%';
    const bRate = (b.reached.length/b.total*100).toFixed(0)+'%';
    const dReach = ((b.reached.length/b.total - a.reached.length/a.total)*100).toFixed(1);
    const aMed = median(a.reached);
    const bMed = median(b.reached);
    const dMed = (aMed != null && bMed != null) ? (bMed - aMed).toFixed(0) : 'n/a';
    out += `| ${k} | ${aRate} | ${bRate} | ${dReach > 0 ? '+' : ''}${dReach}pts | ${aMed||'n/a'} | ${bMed||'n/a'} | ${dMed} |\n`;
  }

  out += `\n## Time-to-Lv12 distribution (GATES_B, per archetype)\n\n`;
  out += `| Archetype | n reached | p25 | median | p75 | fastest | slowest |\n`;
  out += `|-----------|-----------|-----|--------|-----|---------|---------|\n`;
  for (const k of archNames) {
    const b = byArchB[k];
    const r = b.reached;
    if (!r.length) { out += `| ${k} | 0 | — | — | — | — | — |\n`; continue; }
    const s = r.slice().sort((x,y)=>x-y);
    out += `| ${k} | ${r.length} | ${p25(r)} | ${median(r)} | ${p75(r)} | ${s[0]} | ${s[s.length-1]} |\n`;
  }

  out += `\n## Critical findings\n\n`;
  const rateDelta = (reachedB/totalB - reachedA/totalA)*100;
  out += `- Aggregate reach delta: ${rateDelta > 0 ? '+' : ''}${rateDelta.toFixed(1)}pts (B vs A)\n`;
  // Find biggest winner and loser archetypes
  let bestArch = null, bestDelta = -Infinity;
  let worstArch = null, worstDelta = Infinity;
  for (const k of archNames) {
    const a = byArchA[k]; const b = byArchB[k];
    const d = (b.reached.length/b.total - a.reached.length/a.total)*100;
    if (d > bestDelta) { bestDelta = d; bestArch = k; }
    if (d < worstDelta) { worstDelta = d; worstArch = k; }
  }
  out += `- Biggest winner: **${bestArch}** (${bestDelta > 0 ? '+' : ''}${bestDelta.toFixed(1)}pts reach)\n`;
  out += `- Biggest loser:  **${worstArch}** (${worstDelta.toFixed(1)}pts reach)\n`;
  return out;
}

function main() {
  const start = Date.now();
  console.log(`Running sweep: ${SEEDS.length} seeds × ${N_PER_SEED} players × 2 gate configs = ${SEEDS.length * N_PER_SEED * 2} simulations`);
  const byA = runSweep(GATES_A, 'A');
  const byB = runSweep(GATES_B, 'B');
  const totalN = SEEDS.length * N_PER_SEED;
  const md = formatReport(byA, byB, totalN);
  const ts = new Date().toISOString().replace(/[:T]/g,'-').slice(0,16);
  const outDir = path.join(__dirname, 'reports');
  fs.mkdirSync(outDir, { recursive: true });
  const fn = path.join(outDir, `${ts}_sweep.md`);
  fs.writeFileSync(fn, md);
  const elapsed = ((Date.now() - start) / 1000).toFixed(2);
  console.log(`Sweep complete in ${elapsed}s. → ${fn}`);
}

if (require.main === module) main();
