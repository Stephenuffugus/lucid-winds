'use strict';

function pct(values, q) {
  const s = values.slice().sort((a, b) => a - b);
  if (!s.length) return NaN;
  const i = Math.min(s.length - 1, Math.floor(q * s.length));
  return s[i];
}
function median(v) { return pct(v, 0.5); }
function mean(v) { return v.length ? v.reduce((a, b) => a + b, 0) / v.length : NaN; }

function asciiBar(val, max, width = 24) {
  if (!isFinite(val) || max <= 0) return '';
  const n = Math.round((val / max) * width);
  return '█'.repeat(Math.max(0, Math.min(width, n)));
}

function fmt(n) { return isFinite(n) ? n.toFixed(1) : 'n/a'; }

function buildMarkdownReport(results, config) {
  const { label, n, gateName, seed } = config;
  const lines = [];
  lines.push(`# Sim Report — ${label} (gates=${gateName})`);
  lines.push('');
  lines.push(`- **N players:** ${n}`);
  lines.push(`- **Seed:** ${seed}`);
  lines.push(`- **Target:** Lv 12`);
  lines.push('');

  const reachedL12 = results.filter(r => r.level >= 12).length;
  const totalMin = results.reduce((a, r) => a + r.minutesPlayed, 0);
  lines.push(`## Summary`);
  lines.push('');
  lines.push(`- **Lv 12 reach rate:** ${reachedL12}/${n} (${((reachedL12 / n) * 100).toFixed(1)}%)`);
  lines.push(`- **Total sim minutes:** ${totalMin}`);
  lines.push(`- **Median minutes played:** ${median(results.map(r => r.minutesPlayed))}`);
  lines.push('');

  // Time to each level histogram
  lines.push(`## Time to Level (minutes, in-game)`);
  lines.push('');
  lines.push('| Lvl | Median | p25 | p75 | Fastest | Slowest | n_reached | Bar(median) |');
  lines.push('|-----|--------|-----|-----|---------|---------|-----------|-------------|');
  const maxMedian = [];
  for (let L = 2; L <= 12; L++) {
    const v = results.map(r => r.timeToLevel[L]).filter(x => x != null);
    maxMedian.push(median(v) || 0);
  }
  const barMax = Math.max(...maxMedian, 1);
  for (let L = 2; L <= 12; L++) {
    const v = results.map(r => r.timeToLevel[L]).filter(x => x != null);
    const m = median(v);
    lines.push(`| ${L} | ${fmt(m)} | ${fmt(pct(v, 0.25))} | ${fmt(pct(v, 0.75))} | ${fmt(Math.min(...(v.length ? v : [NaN])))} | ${fmt(Math.max(...(v.length ? v : [NaN])))} | ${v.length} | ${asciiBar(m, barMax)} |`);
  }
  lines.push('');

  // Per-archetype
  lines.push(`## Per-Archetype Performance`);
  lines.push('');
  lines.push('| Archetype | n | Median min→Lv12 | % reached Lv12 | Avg sessions | Dropped |');
  lines.push('|-----------|---|-----------------|----------------|--------------|---------|');
  const byArch = {};
  for (const r of results) {
    (byArch[r.archetype] = byArch[r.archetype] || []).push(r);
  }
  for (const [name, arr] of Object.entries(byArch).sort()) {
    const l12 = arr.filter(r => r.timeToLevel[12] != null).map(r => r.timeToLevel[12]);
    const reachPct = (l12.length / arr.length * 100).toFixed(0);
    const dropped = arr.filter(r => r.dropped).length;
    const sess = mean(arr.map(r => r.sessionsPlayed));
    lines.push(`| ${name} | ${arr.length} | ${fmt(median(l12))} | ${reachPct}% | ${fmt(sess)} | ${dropped} |`);
  }
  lines.push('');

  // Dropout points
  lines.push(`## Dropout Points`);
  lines.push('');
  const dropLevels = results.filter(r => r.dropped).map(r => r.level);
  const dropHist = {};
  for (const L of dropLevels) dropHist[L] = (dropHist[L] || 0) + 1;
  lines.push('| Level | Dropouts |');
  lines.push('|-------|----------|');
  for (const L of Object.keys(dropHist).sort((a, b) => +a - +b)) {
    lines.push(`| ${L} | ${dropHist[L]} |`);
  }
  lines.push(`| **Total dropped** | **${dropLevels.length}** |`);
  lines.push('');

  // Unlock utilization
  lines.push(`## Unlock Utilization`);
  lines.push('');
  lines.push('% of players who USED each action at least once.');
  lines.push('');
  lines.push('| Unlock | % used |');
  lines.push('|--------|--------|');
  const unlocks = ['mintPlant', 'wildDrop', 'feralCollect', 'strangerTend', 'greenhouseBreed'];
  for (const u of unlocks) {
    const used = results.filter(r => r.unlockUsed[u]).length;
    lines.push(`| ${u} | ${((used / n) * 100).toFixed(0)}% |`);
  }
  lines.push('');

  // Boredom signals
  const bored = results.filter(r => r.boredomFlags > 0).length;
  lines.push(`## Boredom Signals`);
  lines.push('');
  lines.push(`- Players with >30 consecutive same-action streak: **${bored} / ${n}** (${((bored / n) * 100).toFixed(0)}%)`);
  lines.push('');

  // Go-outside moment
  lines.push(`## The "Go Outside" Moment`);
  lines.push('');
  const firstDrops = results.map(r => r.firstWildDropMinute).filter(x => x != null);
  lines.push(`- **% players who dropped a wild plant:** ${((firstDrops.length / n) * 100).toFixed(0)}%`);
  lines.push(`- **Median minute of first wild drop:** ${fmt(median(firstDrops))}`);
  lines.push(`- **Median level at first wild drop:**`);
  const levelsAtDrop = results.filter(r => r.firstWildDropMinute != null).map(r => {
    // find highest level reached by that minute
    let lvl = 1;
    for (const L of Object.keys(r.timeToLevel)) {
      if (r.timeToLevel[L] <= r.firstWildDropMinute && +L > lvl) lvl = +L;
    }
    return lvl;
  });
  lines.push(`  ${fmt(median(levelsAtDrop))}`);
  lines.push('');
  const archDropped = {};
  for (const r of results) {
    archDropped[r.archetype] = archDropped[r.archetype] || { total: 0, dropped: 0 };
    archDropped[r.archetype].total++;
    if (r.firstWildDropMinute != null) archDropped[r.archetype].dropped++;
  }
  lines.push('| Archetype | % that dropped wild |');
  lines.push('|-----------|---------------------|');
  for (const [k, v] of Object.entries(archDropped).sort()) {
    lines.push(`| ${k} | ${((v.dropped / v.total) * 100).toFixed(0)}% |`);
  }
  lines.push('');

  return lines.join('\n');
}

function buildDeltaReport(resA, resB, n, seed) {
  const lines = [];
  lines.push(`# Sim Delta — GATES_A vs GATES_B`);
  lines.push('');
  lines.push(`- **N per config:** ${n}`);
  lines.push(`- **Seed:** ${seed}`);
  lines.push('');
  lines.push(`## Time to Level (median minutes)`);
  lines.push('');
  lines.push('| Lvl | GATES_A | GATES_B | Δ (B−A) |');
  lines.push('|-----|---------|---------|---------|');
  for (let L = 2; L <= 12; L++) {
    const vA = resA.map(r => r.timeToLevel[L]).filter(x => x != null);
    const vB = resB.map(r => r.timeToLevel[L]).filter(x => x != null);
    const mA = median(vA), mB = median(vB);
    const d = (mB && mA) ? (mB - mA) : NaN;
    lines.push(`| ${L} | ${fmt(mA)} | ${fmt(mB)} | ${fmt(d)} |`);
  }
  lines.push('');

  lines.push(`## Per-Archetype: Minutes to Lv 12`);
  lines.push('');
  lines.push('| Archetype | A median | B median | Δ | Verdict |');
  lines.push('|-----------|----------|----------|---|---------|');
  const groupA = {}, groupB = {};
  for (const r of resA) (groupA[r.archetype] = groupA[r.archetype] || []).push(r);
  for (const r of resB) (groupB[r.archetype] = groupB[r.archetype] || []).push(r);
  for (const name of Object.keys(groupA).sort()) {
    const aVals = groupA[name].map(r => r.timeToLevel[12]).filter(x => x != null);
    const bVals = (groupB[name] || []).map(r => r.timeToLevel[12]).filter(x => x != null);
    const mA = median(aVals), mB = median(bVals);
    const d = (mB && mA) ? (mB - mA) : NaN;
    let verdict = '—';
    if (isFinite(d)) {
      if (d > 10) verdict = 'slower (B hurts)';
      else if (d < -10) verdict = 'faster (B helps)';
      else verdict = 'similar';
    }
    lines.push(`| ${name} | ${fmt(mA)} | ${fmt(mB)} | ${fmt(d)} | ${verdict} |`);
  }
  lines.push('');

  lines.push(`## Go-Outside Moment`);
  lines.push('');
  const firstA = resA.map(r => r.firstWildDropMinute).filter(x => x != null);
  const firstB = resB.map(r => r.firstWildDropMinute).filter(x => x != null);
  lines.push(`- A: ${((firstA.length / n) * 100).toFixed(0)}% dropped, median minute ${fmt(median(firstA))}`);
  lines.push(`- B: ${((firstB.length / n) * 100).toFixed(0)}% dropped, median minute ${fmt(median(firstB))}`);
  lines.push('');

  lines.push(`## Unlock Utilization Comparison`);
  lines.push('');
  lines.push('| Unlock | A (% used) | B (% used) |');
  lines.push('|--------|------------|------------|');
  const unlocks = ['mintPlant', 'wildDrop', 'feralCollect', 'strangerTend', 'greenhouseBreed'];
  for (const u of unlocks) {
    const a = resA.filter(r => r.unlockUsed[u]).length / n * 100;
    const b = resB.filter(r => r.unlockUsed[u]).length / n * 100;
    lines.push(`| ${u} | ${a.toFixed(0)}% | ${b.toFixed(0)}% |`);
  }
  lines.push('');

  lines.push(`## Critical Findings`);
  lines.push('');
  const findings = [];
  // Finding 1: does B materially slow time-to-Lv12?
  const mA12 = median(resA.map(r => r.timeToLevel[12]).filter(x => x != null));
  const mB12 = median(resB.map(r => r.timeToLevel[12]).filter(x => x != null));
  if (isFinite(mA12) && isFinite(mB12)) {
    const diff = mB12 - mA12;
    findings.push(`- **Median Lv12 time:** A=${fmt(mA12)}m, B=${fmt(mB12)}m (Δ ${diff >= 0 ? '+' : ''}${fmt(diff)}m). ${Math.abs(diff) < 5 ? 'B does not materially change pacing.' : (diff > 0 ? 'B slows progression.' : 'B accelerates progression.')}`);
  }
  // Finding 2: wild drop participation
  const wdA = resA.filter(r => r.unlockUsed.wildDrop).length / n;
  const wdB = resB.filter(r => r.unlockUsed.wildDrop).length / n;
  findings.push(`- **Wild drop participation:** A=${(wdA * 100).toFixed(0)}%, B=${(wdB * 100).toFixed(0)}%. ${wdB > wdA + 0.05 ? 'B funnels more players into the Wild tab.' : wdB < wdA - 0.05 ? 'B suppresses Wild tab use.' : 'Roughly equivalent.'}`);
  // Finding 3: did any archetype break under B?
  for (const name of Object.keys(groupA).sort()) {
    const aVals = groupA[name].map(r => r.timeToLevel[12]).filter(x => x != null);
    const bVals = (groupB[name] || []).map(r => r.timeToLevel[12]).filter(x => x != null);
    if (aVals.length && !bVals.length) findings.push(`- **${name}** no longer reaches Lv 12 under B — investigate.`);
  }
  lines.push(findings.join('\n'));
  lines.push('');

  return lines.join('\n');
}

module.exports = { buildMarkdownReport, buildDeltaReport, median, pct, mean };
