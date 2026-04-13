#!/usr/bin/env node
'use strict';
// Cautious-only drilldown: run N Cautious players under both gate configs,
// surface why B fails them while A succeeds.

const { makeRng } = require('./lib/rng');
const { ARCHETYPES } = require('./lib/archetypes');
const { GATES_A, GATES_B } = require('./lib/gates');
const { newPlayer, applyBootstrap } = require('./lib/player');
const { runSession } = require('./lib/session');

const CAUTIOUS = ARCHETYPES.find(a => a.name === 'Cautious');
const N = 100;
const SEED = 42;
const MAX_DAYS = 90;

function simCautious(gates, label) {
  const results = [];
  for (let i = 0; i < N; i++) {
    const seed = ((SEED * 1000003) ^ (i * 2654435761)) >>> 0;
    const rng = makeRng(seed);
    const p = newPlayer(CAUTIOUS.name, rng);
    applyBootstrap(p);
    let day = 0;
    while (p.level < 12 && day < MAX_DAYS) {
      p.dayIndex = day;
      const numSessions = CAUTIOUS.sessionsPerDay(rng);
      for (let s = 0; s < numSessions; s++) {
        if (p.level >= 12) break;
        if (p.sessionsPlayed > 0 && rng.chance(CAUTIOUS.dropoutChance)) {
          p.dropped = true;
          p.droppedAtLevel = p.level;
          p.droppedAtMinute = p.minutesPlayed;
          p.droppedAtDay = day;
          day = MAX_DAYS;
          break;
        }
        const mins = CAUTIOUS.sessionMinutes(rng);
        runSession(p, CAUTIOUS, gates, mins);
      }
      day++;
    }
    if (p.level < 12 && !p.dropped) { p.stalled = true; p.stalledAtLevel = p.level; }
    results.push(p);
  }
  return { label, results };
}

function pct(part, total) { return total ? ((part/total)*100).toFixed(0) + '%' : '0%'; }

function summarize(run) {
  const { label, results } = run;
  const reached = results.filter(p => p.level >= 12);
  const dropped = results.filter(p => p.dropped);
  const stalled = results.filter(p => p.stalled);
  const dropLevels = {};
  for (const p of dropped) {
    const l = p.droppedAtLevel || 1;
    dropLevels[l] = (dropLevels[l] || 0) + 1;
  }
  const timeToReach = reached.map(p => p.minutesPlayed).sort((a,b)=>a-b);
  const med = timeToReach.length ? timeToReach[Math.floor(timeToReach.length/2)] : null;
  const avgSessions = results.reduce((s,p)=>s+p.sessionsPlayed,0) / results.length;
  const avgMinutes = results.reduce((s,p)=>s+p.minutesPlayed,0) / results.length;
  const avgDays = results.reduce((s,p)=>s+(p.dayIndex||0),0) / results.length;

  // Compute time-in-level from timeToLevel
  // timeToLevel[N] = minute at which player hit level N
  const timeInLevel = {};
  for (const p of results) {
    const lvls = Object.keys(p.timeToLevel).map(Number).sort((a,b)=>a-b);
    for (let i = 0; i < lvls.length; i++) {
      const L = lvls[i];
      const prev = lvls[i-1];
      const startMin = prev == null ? 0 : p.timeToLevel[prev];
      const endMin = p.timeToLevel[L];
      timeInLevel[L-1] = timeInLevel[L-1] || [];
      timeInLevel[L-1].push(endMin - startMin);
    }
    // Also track time spent in current (unreached) level
    const lastReached = lvls[lvls.length-1] || 1;
    if (p.minutesPlayed > (p.timeToLevel[lastReached] || 0)) {
      const stuckIn = lastReached;
      const stuckTime = p.minutesPlayed - (p.timeToLevel[stuckIn] || 0);
      timeInLevel[stuckIn] = timeInLevel[stuckIn] || [];
      timeInLevel[stuckIn].push(stuckTime);
    }
  }

  console.log(`\n═══ ${label} ═══`);
  console.log(`Reached Lv 12: ${reached.length}/${N} (${pct(reached.length, N)}, median ${med||'n/a'}m)`);
  console.log(`Dropped:       ${dropped.length}/${N} (${pct(dropped.length, N)})`);
  console.log(`Stalled @ 90d: ${stalled.length}/${N} (${pct(stalled.length, N)})`);
  console.log(`Avg sessions:  ${avgSessions.toFixed(1)}`);
  console.log(`Avg minutes:   ${avgMinutes.toFixed(0)}`);
  console.log(`Avg days:      ${avgDays.toFixed(1)}`);
  console.log(`Dropout level distribution:`, dropLevels);

  console.log(`\nMedian minutes spent IN each level (before leveling up):`);
  for (const L of Object.keys(timeInLevel).map(Number).sort((a,b)=>a-b)) {
    const arr = timeInLevel[L].sort((a,b)=>a-b);
    const m = arr[Math.floor(arr.length/2)];
    const count = arr.length;
    console.log(`  Lv${L}: ${m.toFixed(0)}m  (n=${count})`);
  }

  return { label, reached: reached.length, dropped: dropped.length, stalled: stalled.length, med, avgSessions, avgMinutes, avgDays, dropLevels, timeInLevel };
}

function main() {
  const A = simCautious(GATES_A, 'GATES_A (current)');
  const B = simCautious(GATES_B, 'GATES_B (proposed)');
  const sumA = summarize(A);
  const sumB = summarize(B);

  console.log('\n═══ DELTA (B vs A for Cautious) ═══');
  console.log(`Lv12 reach rate: A ${sumA.reached}/${N} → B ${sumB.reached}/${N}  (Δ ${sumB.reached - sumA.reached})`);
  console.log(`Avg minutes:     A ${sumA.avgMinutes.toFixed(0)} → B ${sumB.avgMinutes.toFixed(0)}  (Δ ${(sumB.avgMinutes-sumA.avgMinutes).toFixed(0)})`);
  console.log(`Avg sessions:    A ${sumA.avgSessions.toFixed(1)} → B ${sumB.avgSessions.toFixed(1)}  (Δ ${(sumB.avgSessions-sumA.avgSessions).toFixed(1)})`);

  console.log(`\nTime-in-level delta (B − A minutes, negative = B faster):`);
  const allLvls = new Set([...Object.keys(sumA.timeInLevel), ...Object.keys(sumB.timeInLevel)].map(Number));
  for (const L of [...allLvls].sort((a,b)=>a-b)) {
    const a = sumA.timeInLevel[L]; const b = sumB.timeInLevel[L];
    if (!a || !b) continue;
    const aMed = a.sort((x,y)=>x-y)[Math.floor(a.length/2)];
    const bMed = b.sort((x,y)=>x-y)[Math.floor(b.length/2)];
    const delta = bMed - aMed;
    const sign = delta > 5 ? '🔴' : delta < -5 ? '🟢' : '⚪';
    console.log(`  ${sign} Lv${L}: A ${aMed.toFixed(0)}m → B ${bMed.toFixed(0)}m  (Δ ${delta > 0 ? '+' : ''}${delta.toFixed(0)}m)`);
  }
}

if (require.main === module) main();
