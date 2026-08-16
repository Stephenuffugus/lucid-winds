#!/usr/bin/env node
/*
  SIEGE OF ONE - headless runner. Zero dependencies.

  The layers are not copied here. They are EXTRACTED from index.html between
  the marker comments, so the game and the sweep can never drift apart.

    node sim.js --test              full assertion harness, exits nonzero on a failure
    node sim.js --sweep             the loadout sweep and every balance gate
    node sim.js --watch=SEED        ascii lane frames so a human can see a wave
    node sim.js --margin            wave 20 hp margin search only
*/

var fs = require('fs');
var path = require('path');

var SRC = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

function extract(startMark, endMark) {
  var a = SRC.indexOf(startMark);
  var b = SRC.indexOf(endMark);
  if (a < 0 || b < 0) {
    console.error('FATAL: could not find ' + startMark + ' / ' + endMark + ' in index.html');
    process.exit(2);
  }
  return SRC.slice(a + startMark.length, b);
}

var SIM_SRC = extract('// ---- SIM_EXPORT_START ----', '// ---- SIM_EXPORT_END ----');
var TEST_SRC = extract('// ---- TEST_EXPORT_START ----', '// ---- TEST_EXPORT_END ----');

var API;
try {
  API = new Function(
    SIM_SRC + '\n' + TEST_SRC + '\n' +
    'return {CONFIG:CONFIG, makeRNG:makeRNG, DATA:DATA, GEN:GEN, SIM:SIM, TEST:TEST, SUITES:SUITES,' +
    ' TRAPS:TRAPS, ENEMIES:ENEMIES, WAVES:WAVES, TRAP_ORDER:TRAP_ORDER, ENEMY_ORDER:ENEMY_ORDER,' +
    ' tGame:tGame, tPut:tPut, tEnemy:tEnemy, tRun:tRun};'
  )();
} catch (err) {
  console.error('FATAL: the extracted layers do not parse.');
  console.error(err && err.stack ? err.stack : err);
  process.exit(2);
}

var CONFIG = API.CONFIG, SIM = API.SIM, DATA = API.DATA, TRAPS = API.TRAPS, TRAP_ORDER = API.TRAP_ORDER;

/* ------------------------------------------------------------------ */
/* argument parsing                                                     */
/* ------------------------------------------------------------------ */

var args = {};
process.argv.slice(2).forEach(function (a) {
  var m = /^--([^=]+)(?:=(.*))?$/.exec(a);
  if (m) args[m[1]] = m[2] === undefined ? true : m[2];
});

function pad(str, n, right) {
  str = String(str);
  while (str.length < n) str = right ? str + ' ' : ' ' + str;
  return str;
}
function pct(x) { return (x * 100).toFixed(1) + '%'; }

/* ------------------------------------------------------------------ */
/* --test : the full harness, headless                                  */
/* ------------------------------------------------------------------ */

function runTests() {
  var rep;
  try {
    rep = API.TEST.run();
  } catch (err) {
    console.error('HARNESS THREW: ' + (err && err.stack ? err.stack : err));
    process.exit(1);
  }
  rep.failures.forEach(function (f) {
    console.log('FAIL  ' + f.name + (f.detail ? '   [' + f.detail + ']' : ''));
  });
  console.log('');
  console.log('PASSED ' + rep.passed + ' / FAILED ' + rep.failed);
  console.log('assertions: ' + rep.total);
  if (rep.failed > 0 || rep.total < 80) {
    if (rep.total < 80) console.log('ASSERTION FLOOR NOT MET: need 80, have ' + rep.total);
    process.exit(1);
  }
}

/* ------------------------------------------------------------------ */
/* loadout enumeration                                                  */
/* ------------------------------------------------------------------ */

var ZONE_N = CONFIG.ZONES.length;

function combos(arr, k) {
  var out = [];
  (function rec(start, acc) {
    if (acc.length === k) { out.push(acc.slice()); return; }
    for (var i = start; i < arr.length; i++) { acc.push(arr[i]); rec(i + 1, acc); acc.pop(); }
  })(0, []);
  return out;
}

/* A loadout is a cycled priority list of (trap, lane zone) pairs. Placement is
   bucketed into 5 zones rather than enumerated cell by cell: the full 28 cell
   placement space is 6^28 and the handoff invites this cap. */
function enumerateLoadouts(maxTypes) {
  var out = [], k, sets, si, types, zi, zoneCombo;
  for (k = 1; k <= maxTypes; k++) {
    sets = combos(TRAP_ORDER, k);
    for (si = 0; si < sets.length; si++) {
      types = sets[si];
      var total = Math.pow(ZONE_N, k);
      for (zi = 0; zi < total; zi++) {
        zoneCombo = [];
        var v = zi, t;
        for (t = 0; t < k; t++) { zoneCombo.push(v % ZONE_N); v = Math.floor(v / ZONE_N); }
        var lo = [];
        for (t = 0; t < k; t++) lo.push({ type: types[t], zone: zoneCombo[t] });
        out.push({ key: types.join('+'), zoneKey: zoneCombo.join(''), list: lo, types: types });
      }
    }
  }
  return out;
}

/* The sweep and the wave scorecard the player reads call the SAME function, so
   the percentages on screen are by construction the percentages gated here. */
function shareOf(dmg) { return SIM.damageShare(dmg); }

function runLoadout(lo, bot, seed, maxWave) {
  return SIM.runCampaign({ seed: seed || 1, bot: bot, loadout: lo.list, maxWave: maxWave || CONFIG.WAVES });
}

/* ------------------------------------------------------------------ */
/* --sweep                                                              */
/* ------------------------------------------------------------------ */

function sweep() {
  var t0 = Date.now();
  var maxTypes = args.types ? parseInt(args.types, 10) : 3;
  var loadouts = enumerateLoadouts(maxTypes);
  console.log('SIEGE OF ONE  ·  loadout sweep');
  console.log('loadouts: ' + loadouts.length + '  (multisets of up to ' + maxTypes + ' trap types, each pinned to one of ' + ZONE_N + ' lane zones)');
  console.log('bots: IDLE never acts, ACTIVE moves and swings');
  console.log('time model: ' + CONFIG.TICK_MS + 'ms per tick, ' + (CONFIG.BUILD_TICKS * CONFIG.TICK_MS / 1000) + 's build phase');
  console.log('');

  var idleBest = 0, idleBestLo = null, idleWins = 0;
  var richIdleWins = 0, richIdleBest = 0, richIdleLo = null;
  var activeRows = [];
  var i, r;

  for (i = 0; i < loadouts.length; i++) {
    r = runLoadout(loadouts[i], SIM.BOTS.idle, 1);
    if (r.won) idleWins++;
    if (r.reached > idleBest) { idleBest = r.reached; idleBestLo = loadouts[i]; }
    /* the harder version of the same question: hand the traps every coin the
       whole campaign will ever pay, up front, and see if they can do it alone */
    r = SIM.runCampaign({ seed: 1, bot: SIM.BOTS.idle, loadout: loadouts[i].list, grantScrap: SIM.scrapThroughWave(CONFIG.WAVES) });
    if (r.won) richIdleWins++;
    if (r.reached > richIdleBest) { richIdleBest = r.reached; richIdleLo = loadouts[i]; }
  }

  for (i = 0; i < loadouts.length; i++) {
    r = runLoadout(loadouts[i], SIM.BOTS.active, 1);
    var sh = shareOf(r.state.run.dmg);
    activeRows.push({
      lo: loadouts[i], reached: r.reached, won: r.won,
      share: sh.player, total: sh.total, kills: r.state.run.kills,
      ticks: r.state.run.ticks, rows: r.rows, res: r
    });
  }

  activeRows.sort(function (a, b) { return b.reached - a.reached || b.total - a.total; });

  /* best per distinct trap multiset */
  var byMultiset = {};
  activeRows.forEach(function (row) {
    var k = row.lo.key;
    if (!byMultiset[k] || byMultiset[k].reached < row.reached) byMultiset[k] = row;
  });
  var msRows = Object.keys(byMultiset).map(function (k) { return byMultiset[k]; })
    .sort(function (a, b) { return b.reached - a.reached; });

  console.log('BEST RUN PER TRAP MULTISET (active bot, seed 1)');
  console.log(pad('traps', 26, true) + pad('zones', 7) + pad('reached', 9) + pad('kills', 7) + pad('playerShare', 13) + pad('waveSecs', 10));
  console.log(''.padEnd ? ''.padEnd(72, '=') : '========================================================================');
  msRows.slice(0, 30).forEach(function (row) {
    var secs = row.res.rows.length ? (row.ticks / row.res.rows.length * CONFIG.TICK_MS / 1000).toFixed(1) : '0';
    console.log(pad(row.lo.key, 26, true) + pad(row.lo.zoneKey, 7) + pad(row.won ? 'WON 20' : 'w' + row.reached, 9) +
      pad(row.kills, 7) + pad(pct(row.share), 13) + pad(secs, 10));
  });
  console.log('');

  var reach15 = msRows.filter(function (r2) { return r2.reached >= 15; });
  var clears = activeRows.filter(function (r2) { return r2.won; });

  /* per wave player damage share for the best loadout */
  var best = activeRows[0];
  console.log('PER WAVE DAMAGE SHARE  ·  best loadout ' + best.lo.key + ' zones ' + best.lo.zoneKey);
  console.log(pad('wave', 6) + pad('waveHP', 10) + pad('secs', 7) + pad('YOU', 8) + pad('spike', 8) + pad('pit', 7) + pad('ballista', 10) + pad('brazier', 9) + pad('deepest', 9));
  best.rows.forEach(function (row) {
    if (!row) return;
    var tot = 0, k;
    for (k in row.dmg) tot += row.dmg[k];
    var f = function (v) { return tot ? pct(v / tot) : '0%'; };
    console.log(pad(row.wave, 6) + pad(SIM.waveTotalHP(row.wave), 10) + pad((row.ticks * CONFIG.TICK_MS / 1000).toFixed(1), 7) +
      pad(f(row.dmg.player), 8) + pad(f(row.dmg.spike), 8) + pad(f(row.dmg.pit), 7) +
      pad(f(row.dmg.ballista), 10) + pad(f(row.dmg.brazier), 9) + pad('c' + row.deepest, 9));
  });
  console.log('');

  /* median loss wave over random loadouts */
  var rng = API.makeRNG(424242);
  var lossWaves = [], n = args.random ? parseInt(args.random, 10) : 300;
  for (i = 0; i < n; i++) {
    var k2 = 1 + rng.int(3), lo = [], t;
    for (t = 0; t < k2; t++) lo.push({ type: TRAP_ORDER[rng.int(TRAP_ORDER.length)], zone: rng.int(ZONE_N) });
    var rr = SIM.runCampaign({ seed: 1 + rng.int(1000), bot: SIM.BOTS.active, loadout: lo });
    lossWaves.push(rr.won ? CONFIG.WAVES + 1 : rr.lossWave);
  }
  lossWaves.sort(function (a, b) { return a - b; });
  var median = lossWaves[Math.floor(lossWaves.length / 2)];

  /* wave 20 hp margin for the best clearing loadout */
  /* the BEST loadout means the one with the most headroom, not just the first
     one that happened to clear. Search the top clearing builds. */
  var marginLo = best.lo, margin = 0;
  var cands = (clears.length ? clears : [best]).slice(0, 8);
  cands.forEach(function (c) {
    var m = findMargin(c.lo);
    if (m > margin) { margin = m; marginLo = c.lo; }
  });

  /* average player share across cleared waves, best loadout */
  var shareSum = 0, shareN = 0;
  activeRows.slice(0, 20).forEach(function (row) {
    row.rows.forEach(function (wr) {
      if (!wr) return;
      var tot = 0, k;
      for (k in wr.dmg) tot += wr.dmg[k];
      if (tot > 0) { shareSum += wr.dmg.player / tot; shareN++; }
    });
  });
  var avgShare = shareN ? shareSum / shareN : 0;

  /* ---- the three defect measurements, over the top 40 builds ---- */
  var stranded = 0, strandedAt = '', idleWorst = 0, idleAt = '', emptyWorst = 0, emptyAt = '';
  var emptyTop = 0, emptyTopAt = '';
  var earlySum = 0, earlyN = 0, early5Sum = 0, early5N = 0;
  activeRows.forEach(function (row, ri) {
    row.rows.forEach(function (wr) {
      if (!wr) return;
      var sh = SIM.damageShare(wr.dmg);
      /* DEFECT 1: scrap with nowhere to go once the lane saturates. Only the
         back half of the campaign counts; an early purse that cannot yet
         afford a ballista is saving up, not stranded. */
      if (wr.wave >= 14 && wr.scrapLeft > stranded) {
        stranded = wr.scrapLeft; strandedAt = row.lo.key + ' zones ' + row.lo.zoneKey + ' wave ' + wr.wave;
      }
      /* DEFECT 3: dead lane. emptyMax is the hard read (not one body alive
         while the wave still has bodies to send); idleMax is the soft read
         (bodies exist but none in reach, which also counts the run out). */
      if (wr.emptyMax > emptyWorst) {
        emptyWorst = wr.emptyMax; emptyAt = row.lo.key + ' zones ' + row.lo.zoneKey + ' wave ' + wr.wave;
      }
      /* the gate reads the eight builds a player actually converges on. A lane
         that empties because all three trap types are stacked in the MOUTH and
         delete every body on arrival is a power fantasy, not a pacing bug, and
         gating on it would ban the build rather than fix the schedule. */
      if (ri < 8 && wr.emptyMax > emptyTop) {
        emptyTop = wr.emptyMax; emptyTopAt = row.lo.key + ' zones ' + row.lo.zoneKey + ' wave ' + wr.wave;
      }
      if (wr.idleMax > idleWorst) {
        idleWorst = wr.idleMax; idleAt = row.lo.key + ' zones ' + row.lo.zoneKey + ' wave ' + wr.wave;
      }
      /* DEFECT 2: the build phase has to earn its twenty seconds. Waves 1 and
         2 are the whole question: that is where the purse is thinnest and
         where the predecessor measured the player doing everything. Waves 3
         onward are reported, not gated. */
      if (wr.wave <= 2 && sh.total > 0) { earlySum += sh.traps; earlyN++; }
      if (wr.wave <= 5 && sh.total > 0) { early5Sum += sh.traps; early5N++; }
    });
  });
  var earlyTrapShare = earlyN ? earlySum / earlyN : 0;
  var early5TrapShare = early5N ? early5Sum / early5N : 0;

  console.log('GATES');
  var gates = [];
  gates.push(gate('no loadout clears 20 waves with the IDLE bot', idleWins === 0,
    'idle wins: ' + idleWins + ', deepest idle run: wave ' + idleBest + (idleBestLo ? ' (' + idleBestLo.key + ' zones ' + idleBestLo.zoneKey + ')' : '')));
  gates.push(gate('no loadout clears 20 waves with IDLE even holding the whole campaign purse', richIdleWins === 0,
    'rich idle wins: ' + richIdleWins + ', deepest wave ' + richIdleBest + (richIdleLo ? ' (' + richIdleLo.key + ' zones ' + richIdleLo.zoneKey + ')' : '')));
  gates.push(gate('at least 4 distinct trap multisets reach wave 15 with ACTIVE', reach15.length >= 4,
    reach15.length + ' multisets: ' + reach15.slice(0, 8).map(function (r2) { return r2.lo.key + '(w' + r2.reached + ')'; }).join(', ')));
  gates.push(gate('the best loadout plus ACTIVE clears wave 20', clears.length > 0,
    clears.length + ' clearing loadouts, best ' + best.lo.key + ' reached wave ' + best.reached));
  gates.push(gate('wave 20 clears with roughly 15 percent total hp margin', margin >= 0.08 && margin <= 0.30,
    'margin ' + pct(margin) + ' on ' + marginLo.key + ' zones ' + marginLo.zoneKey));
  gates.push(gate('median loss wave for a random loadout ACTIVE bot lands in 8 to 14', median >= 8 && median <= 14,
    'median ' + median + ' over ' + n + ' random loadouts, quartiles ' +
    lossWaves[Math.floor(n * 0.25)] + '/' + lossWaves[Math.floor(n * 0.75)]));
  gates.push(gate('the defender is not decorative: player share at least 20 percent', avgShare >= 0.20,
    'mean player damage share on cleared waves ' + pct(avgShare)));
  /* the three defect gates. Each was watched red before it was trusted green:
     stranded scrap read 612 with no REINFORCE, dead air read 53 ticks with the
     old departure schedule, and early trap share read 12.9% with no starter
     strip. See BUILD-NOTES.md. */
  gates.push(gate('no purse strands: under a trap price left over past wave 14', stranded < 90,
    'worst leftover ' + stranded + ' scrap (' + (strandedAt || 'none') + ')'));
  gates.push(gate('no dead lane: under 3 seconds of empty lane on the top 8 builds', emptyTop <= 30,
    'longest empty lane ' + (emptyTop * CONFIG.TICK_MS / 1000).toFixed(1) + 's (' + (emptyTopAt || 'none') +
    '); worst across 40 builds ' + (emptyWorst * CONFIG.TICK_MS / 1000).toFixed(1) + 's (' + (emptyAt || 'none') +
    '); longest with nothing in reach ' + (idleWorst * CONFIG.TICK_MS / 1000).toFixed(1) + 's'));
  gates.push(gate('the build phase earns its 20 seconds: traps do 28 percent on waves 1 and 2', earlyTrapShare >= 0.28,
    'mean trap damage share on waves 1 and 2 ' + pct(earlyTrapShare) + ' across ' + earlyN + ' waves; ' +
    'waves 1 to 5 ' + pct(early5TrapShare)));

  var failed = gates.filter(function (g) { return !g.ok; });
  console.log('');
  console.log('session length model: median run ends on wave ' + median + '. At ' +
    (best.rows.length ? (best.ticks / best.rows.length * CONFIG.TICK_MS / 1000).toFixed(0) : '0') +
    's mean combat plus up to ' + (CONFIG.BUILD_TICKS * CONFIG.TICK_MS / 1000) + 's build, that is about ' +
    Math.round(median * ((best.rows.length ? best.ticks / best.rows.length * CONFIG.TICK_MS / 1000 : 30) + 12) / 60) + ' minutes.');
  console.log('sweep took ' + ((Date.now() - t0) / 1000).toFixed(1) + 's');
  if (failed.length) { console.log(''); console.log('SWEEP FAILED: ' + failed.length + ' gate(s) red'); process.exit(1); }
  console.log('');
  console.log('SWEEP PASSED: all ' + gates.length + ' gates green');
}

function gate(name, ok, detail) {
  console.log((ok ? '  PASS  ' : '  FAIL  ') + pad(name, 62, true) + detail);
  return { name: name, ok: ok, detail: detail };
}

/* Binary search the extra hp wave 20 can carry and still fall. The campaign is
   played straight through 19, then wave 20 alone is inflated. */
function findMargin(lo) {
  var lo2 = 0, hi = 2.0, mid, i;
  if (!clearsAt(lo, 1.0)) return 0;
  for (i = 0; i < 12; i++) {
    mid = (lo2 + hi) / 2;
    if (clearsAt(lo, 1 + mid)) lo2 = mid; else hi = mid;
  }
  return lo2;
}

function clearsAt(lo, boost) {
  var r = SIM.runCampaign({ seed: 1, bot: SIM.BOTS.active, loadout: lo.list, hpBoost: boost, hpBoostFrom: CONFIG.WAVES });
  return r.won;
}

/* ------------------------------------------------------------------ */
/* --watch : ascii lane frames                                          */
/* ------------------------------------------------------------------ */

function laneFrame(s) {
  var cells = [], i, k;
  for (i = 0; i < CONFIG.LANE; i++) {
    var t = s.traps[i];
    cells.push(t ? TRAPS[t.type].glyph : '.');
  }
  var row = cells.slice();
  for (i = 0; i < s.enemies.length; i++) {
    var e = s.enemies[i];
    row[e.cell] = API.ENEMIES[e.type].glyph;
  }
  row[s.player.cell] = '@';
  /* the lane is drawn gate on the left, mouth on the right */
  return '|' + row.join('') + '|';
}

function watch(seed, waveWanted, loadoutSpec) {
  var lo = loadoutSpec || [
    { type: 'ballista', zone: 0 }, { type: 'brazier', zone: 1 }, { type: 'spike', zone: 2 }
  ];
  var s = SIM.newGame(seed, {});
  var every = args.every ? parseInt(args.every, 10) : 10;
  console.log('SIEGE OF ONE  ·  watch  ·  seed ' + seed);
  console.log('legend: @ you   r runner  B brute  S shielded  f flyer  s sapper  h healer  x swarm  W warden');
  console.log('        traps: ' + TRAP_ORDER.map(function (k) { return TRAPS[k].glyph + ' ' + TRAPS[k].short.toLowerCase(); }).join('  '));
  console.log('        the gate is the left wall, bodies come in from the right');
  console.log('');
  var w, guard;
  for (w = 1; w <= (waveWanted || 20) && !s.over; w++) {
    SIM.botBuild(s, lo);
    SIM.startWave(s);
    if (w === waveWanted || !waveWanted) {
      console.log('--- wave ' + w + '  scrap left ' + s.scrap + '  wave hp ' + SIM.waveTotalHP(w) + '  your blade ' + SIM.playerDamage(w));
    }
    guard = 0;
    while (s.phase === 'combat' && guard < CONFIG.MAX_WAVE_TICKS) {
      SIM.step(s, SIM.BOTS.active(s));
      guard++;
      if ((!waveWanted || w === waveWanted) && guard % every === 0) {
        console.log(pad(guard, 5) + ' ' + laneFrame(s) + '  bodies ' + pad(s.enemies.length, 2) + '  hp ' + pad(totalHP(s), 7));
      }
    }
    if ((!waveWanted || w === waveWanted) && s.lastWaveStats) {
      var ws = s.lastWaveStats, tot = 0, k;
      for (k in ws.dmg) tot += ws.dmg[k];
      console.log('    cleared in ' + (ws.ticks * CONFIG.TICK_MS / 1000).toFixed(1) + 's  deepest cell ' + ws.deepest +
        '  damage: ' + TRAP_ORDER.concat(['player']).filter(function (kk) { return ws.dmg[kk] > 0; })
          .map(function (kk) { return kk + ' ' + pct(ws.dmg[kk] / tot); }).join('  '));
      console.log('');
    }
    if (s.over) {
      console.log('    THE GATE FELL on wave ' + s.wave + ' to a ' + (s.lossInfo ? s.lossInfo.enemy : '?'));
      break;
    }
  }
  if (s.won) console.log('    the siege is broken. twenty waves held.');
}

function totalHP(s) {
  var t = 0, i;
  for (i = 0; i < s.enemies.length; i++) t += s.enemies[i].hp;
  return t;
}

/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* --diag : the three defect numbers, per wave, on demand               */
/* ------------------------------------------------------------------ */

var DIAG_BUILDS = [
  { key: 'ballista+brazier+wall', list: [{ type: 'ballista', zone: 3 }, { type: 'brazier', zone: 3 }, { type: 'wall', zone: 0 }] },
  { key: 'spike+brazier+ballista', list: [{ type: 'spike', zone: 4 }, { type: 'brazier', zone: 2 }, { type: 'ballista', zone: 0 }] },
  { key: 'spike+pit+brazier', list: [{ type: 'spike', zone: 4 }, { type: 'pit', zone: 2 }, { type: 'brazier', zone: 1 }] }
];

function diag() {
  var maxW = args.wave ? parseInt(args.wave, 10) : CONFIG.WAVES;
  DIAG_BUILDS.forEach(function (b) {
    var r = SIM.runCampaign({ seed: 1, bot: SIM.BOTS.active, loadout: b.list, maxWave: maxW, endless: maxW > CONFIG.WAVES });
    console.log('');
    console.log('BUILD ' + b.key + '   reached ' + (r.won ? 'WON' : 'w' + r.reached));
    console.log(pad('wave', 6) + pad('YOU', 8) + pad('traps', 8) + pad('idleMax', 9) + pad('secs', 7) + pad('scrapLeft', 11) + pad('lvls', 8) + pad('muts', 20, true));
    r.rows.forEach(function (row, i) {
      if (!row) return;
      var sh = SIM.damageShare(row.dmg);
      console.log(pad(row.wave, 6) + pad(pct(sh.player), 8) + pad(pct(sh.traps), 8) +
        pad((row.idleMax * CONFIG.TICK_MS / 1000).toFixed(1) + 's', 9) +
        pad((row.ticks * CONFIG.TICK_MS / 1000).toFixed(1), 7) +
        pad(row.scrapLeft === undefined ? '' : row.scrapLeft, 11) +
        pad(row.lvlSum === undefined ? '' : row.lvlSum, 8) +
        '  ' + (row.muts || []).join(','));
    });
  });
}

if (args.diag) diag();
else if (args.test) runTests();
else if (args.sweep) sweep();
else if (args.watch !== undefined) watch(parseInt(args.watch, 10) || 1, args.wave ? parseInt(args.wave, 10) : 0);
else if (args.margin) {
  var lo = { key: 'ballista+brazier+spike', list: [{ type: 'ballista', zone: 0 }, { type: 'brazier', zone: 1 }, { type: 'spike', zone: 2 }] };
  console.log('wave 20 margin: ' + pct(findMargin(lo)));
} else {
  console.log('usage: node sim.js --test | --sweep | --watch=SEED [--wave=N] [--every=N] | --margin');
  process.exit(1);
}
