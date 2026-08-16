/* ════════════════════════════════════════════════════════════════════
   THE ATTIC — headless assertion suite. No browser, no network.
     node test/attic-check.js
   Exits 1 on any failure. Every assertion here was watched RED against the
   code as it stood on 2026-08-16 before being made green, so a pass means
   something. Sections:
     A  determinism           the one-of-one promise is a hash promise
     B  distribution          the declared odds are the real odds
     C  the reveal            nothing leaks the condition before the wipe
     D  generator depth       "never existed before" measured, not asserted
     E  economy solvency      you cannot mint tickets out of nothing
     F  save integrity        corrupt saves, two tabs, counters ADD
     G  copy law              no em dash / en dash in player facing strings
   ════════════════════════════════════════════════════════════════════ */
'use strict';
var path = require('path');
var ROOT = path.join(__dirname, '..');
var ATTIC = require(path.join(ROOT, 'attic-engine.js'));
var OBJ = require(path.join(ROOT, 'object-render.js'));
var ECON = null;
try { ECON = require(path.join(ROOT, 'attic-econ.js')); } catch (e) { ECON = null; }

var fails = 0, passes = 0, section = '';
function sec(s) { section = s; console.log('\n── ' + s + ' ' + Array(Math.max(2, 62 - s.length)).join('─')); }
function ok(name, cond, detail) {
  if (cond) { passes++; console.log('  PASS  ' + name + (detail ? '   (' + detail + ')' : '')); }
  else { fails++; console.log('  FAIL  ' + name + (detail ? '   (' + detail + ')' : '')); }
}

/* deterministic hash stream for the suite itself: a counter run through
   FNV + xorshift, so every run of this file tests the same population and a
   regression cannot hide behind a lucky seed. No Math.random anywhere. */
function mkHash(i) {
  var h = (2166136261 ^ i) >>> 0, s = '', k;
  for (k = 0; k < 8; k++) {
    h ^= h << 13; h >>>= 0; h ^= h >> 17; h ^= h << 5; h >>>= 0;
    s += ('0000000' + h.toString(16)).slice(-8);
  }
  return s;
}
var N = 40000, HASHES = [], i;
for (i = 0; i < N; i++) HASHES.push(mkHash(i));

function near(actual, want, tol) { return Math.abs(actual - want) <= tol; }
function pct(n) { return (n * 100).toFixed(2) + '%'; }

/* ═══ A. DETERMINISM ═══════════════════════════════════════════════ */
sec('A  DETERMINISM');
(function () {
  var same = true, bad = null, j;
  for (j = 0; j < 400; j++) {
    var a = JSON.stringify(ATTIC.hashToItem(HASHES[j]));
    var b = JSON.stringify(ATTIC.hashToItem(HASHES[j]));
    if (a !== b) { same = false; bad = HASHES[j]; break; }
  }
  ok('same hash returns an identical item', same, bad ? 'diverged on ' + bad : '400 hashes');

  var svgSame = true;
  for (j = 0; j < 200; j++) {
    if (OBJ.renderItem(HASHES[j], 240).svg !== OBJ.renderItem(HASHES[j], 240).svg) { svgSame = false; break; }
  }
  ok('same hash returns identical art', svgSame, '200 hashes');

  var caseOk = JSON.stringify(ATTIC.hashToItem(HASHES[3].toUpperCase())) === JSON.stringify(ATTIC.hashToItem(HASHES[3]));
  ok('uppercase hash resolves to the same item', caseOk);

  /* a short or junk hash must not produce NaN soup on screen */
  var junkClean = true, junkWhy = '';
  ['', 'zz', '1234', null, undefined].forEach(function (bad2) {
    var it;
    try { it = ATTIC.hashToItem(bad2); } catch (e) { junkClean = false; junkWhy = 'threw on ' + bad2; return; }
    if (!it || typeof it.name !== 'string' || /NaN|undefined/.test(it.name + it.sub + it.era + it.year + it.provenance)) {
      junkClean = false; junkWhy = 'NaN/undefined leaked for input ' + JSON.stringify(bad2);
    }
  });
  ok('a junk hash degrades cleanly instead of printing NaN', junkClean, junkWhy);
})();

/* ═══ B. DISTRIBUTION ══════════════════════════════════════════════ */
sec('B  DISTRIBUTION (the declared odds are the real odds)');
(function () {
  var cls = {}, grd = {}, err = 0, eras = {}, j;
  for (j = 0; j < N; j++) {
    var it = ATTIC.hashToItem(HASHES[j]);
    cls[it.cls] = (cls[it.cls] || 0) + 1;
    grd[it.grade] = (grd[it.grade] || 0) + 1;
    eras[it.era] = (eras[it.era] || 0) + 1;
    if (it.error) err++;
  }
  /* the class split the engine's own comment claims: 35/25/20/12/8 */
  var WANT = { RECORD: 0.35, VHS: 0.25, TOY: 0.20, GAME: 0.12, CEREAL: 0.08 };
  Object.keys(WANT).forEach(function (k) {
    var got = (cls[k] || 0) / N;
    ok('class ' + k + ' lands on its declared share', near(got, WANT[k], 0.015),
      'want ' + pct(WANT[k]) + ', got ' + pct(got));
  });

  var GW = { TRASHED: 0.078, PLAYED: 0.301, GOOD: 0.281, FINE: 0.180, 'NEAR MINT': 0.121, MINT: 0.035, 'FACTORY SEALED': 0.0039 };
  Object.keys(GW).forEach(function (k) {
    var got = (grd[k] || 0) / N;
    ok('grade ' + k + ' matches the ladder', near(got, GW[k], Math.max(0.008, GW[k] * 0.15)),
      'want ' + pct(GW[k]) + ', got ' + pct(got));
  });

  ok('factory error fires at the declared ~6%', near(err / N, 0.0625, 0.01), 'got ' + pct(err / N));

  var eraFlat = true, eraWhy = '';
  Object.keys(eras).forEach(function (k) {
    if (!near(eras[k] / N, 0.2, 0.015)) { eraFlat = false; eraWhy += k + '=' + pct(eras[k] / N) + ' '; }
  });
  ok('the five eras are evenly weighted', eraFlat, eraWhy);
})();

/* ═══ C. THE REVEAL ════════════════════════════════════════════════ */
sec('C  THE REVEAL (condition is revealed last, says the rules screen)');
(function () {
  /* Everything shown BEFORE the player wipes the dust: the art, the name,
     the sub line, the sticker line. None of it may betray the grade. */
  var GRADE_WORDS = /\b(TRASHED|PLAYED|GOOD|FINE|NEAR MINT|MINT|FACTORY SEALED|MINT ON CARD)\b/;
  var leakText = 0, leakEg = '', j;
  for (j = 0; j < 6000; j++) {
    var it = ATTIC.hashToItem(HASHES[j]);
    var pre = [it.name, it.sub || '', it.sticker || ''].join(' | ');
    if (GRADE_WORDS.test(pre)) { leakText++; if (!leakEg) leakEg = it.grade + ' -> "' + pre + '"'; }
  }
  ok('the pre reveal text never names the condition', leakText === 0,
    leakText + ' of 6000 leaked; e.g. ' + leakEg);

  /* the art must be able to render WITHOUT the condition. If renderItem
     cannot hide the wear, the sealed shrink gloss and the tape repair give
     the answer away before the button is even pressed. */
  var dustyDiffers = 0, dustySame = 0;
  for (j = 0; j < 400; j++) {
    var plain, dusty;
    try {
      plain = OBJ.renderItem(HASHES[j], 240).svg;
      dusty = OBJ.renderItem(HASHES[j], 240, { dusty: true }).svg;
    } catch (e) { dusty = null; }
    if (dusty && dusty !== plain) dustyDiffers++; else dustySame++;
  }
  ok('renderItem supports an unrevealed (dusty) state', dustyDiffers > 380,
    dustyDiffers + '/400 rendered differently when dusty');

  /* and two objects of different grade must be pixel identical while dusty,
     otherwise the "unrevealed" art still carries the answer */
  var pairsChecked = 0, pairsLeaked = 0;
  var byGrade = {};
  for (j = 0; j < 8000 && pairsChecked < 60; j++) {
    var t = ATTIC.hashToItem(HASHES[j]);
    var key = t.cls + '|' + t.era;
    byGrade[key] = byGrade[key] || {};
    if (!byGrade[key][t.grade]) byGrade[key][t.grade] = HASHES[j];
  }
  Object.keys(byGrade).forEach(function (key) {
    var gs = Object.keys(byGrade[key]);
    if (gs.length < 2) return;
    /* strip the parts that legitimately differ (the object itself) by
       comparing only the wear/grime markers the renderer adds */
    for (var a = 0; a < gs.length - 1 && pairsChecked < 60; a++) {
      var h1 = byGrade[key][gs[a]], h2 = byGrade[key][gs[a + 1]];
      var s1, s2;
      try {
        s1 = OBJ.renderItem(h1, 240, { dusty: true }).svg;
        s2 = OBJ.renderItem(h2, 240, { dusty: true }).svg;
      } catch (e) { return; }
      pairsChecked++;
      /* the shrinkwrap gloss and the tape repair are the tells */
      var tell = function (s) { return /opacity="0\.16"|opacity="0\.3"|#d8cfa8/.test(s); };
      if (tell(s1) !== tell(s2)) pairsLeaked++;
    }
  });
  ok('dusty art carries no condition tell', pairsChecked > 0 && pairsLeaked === 0,
    pairsLeaked + ' leaking pairs of ' + pairsChecked);
})();

/* ═══ D. GENERATOR DEPTH ═══════════════════════════════════════════ */
sec('D  GENERATOR DEPTH ("never existed before", measured)');
(function () {
  var names = { RECORD: {}, VHS: {}, TOY: {}, GAME: {}, CEREAL: {} };
  var fulls = {}, dupFull = 0, j;
  for (j = 0; j < N; j++) {
    var it = ATTIC.hashToItem(HASHES[j]);
    names[it.cls][it.name] = 1;
    var f = it.cls + '|' + it.name + '|' + it.sub + '|' + it.sticker + '|' + it.era;
    if (fulls[f]) dupFull++; else fulls[f] = 1;
  }
  /* A flagship whose premise is "an object that has never existed before"
     cannot hand the same title back on the fourth pull. The bar: a player
     who digs 40 times in a class should almost never see a repeat title,
     which needs the name space in the low thousands, not the low tens. */
  var BAR = { RECORD: 1200, VHS: 1200, TOY: 1200, GAME: 800, CEREAL: 800 };
  Object.keys(BAR).forEach(function (k) {
    var n = Object.keys(names[k]).length;
    ok(k + ' draws from a deep name space', n >= BAR[k], n + ' distinct titles in ' + N + ' pulls, bar is ' + BAR[k]);
  });

  ok('two pulls almost never produce the identical object', dupFull / N < 0.02,
    dupFull + ' exact duplicates in ' + N + ' (' + pct(dupFull / N) + ')');

  /* the birthday bar a real session actually feels: 40 pulls */
  var seen = {}, sessionDup = 0, trials = 300, t;
  for (t = 0; t < trials; t++) {
    seen = {};
    for (j = 0; j < 40; j++) {
      var it2 = ATTIC.hashToItem(HASHES[(t * 40 + j) % N]);
      if (seen[it2.name]) { sessionDup++; break; }
      seen[it2.name] = 1;
    }
  }
  ok('a 40 dig session rarely repeats a title', sessionDup / trials < 0.35,
    sessionDup + '/' + trials + ' sessions hit a repeat');
})();

/* ═══ E. ECONOMY SOLVENCY ══════════════════════════════════════════ */
sec('E  ECONOMY SOLVENCY (tickets are the pace of the game)');
(function () {
  if (!ECON) { ok('attic-econ.js exists and is requireable', false, 'module not found'); return; }
  ok('attic-econ.js exists and is requireable', true);

  /* THE EXPLOIT: rummage costs a ticket, the pull lands on the shelf, and
     scrapping that same pull hands the ticket straight back. Net zero means
     an infinite dig, which voids the whole "a dig is a decision" premise.
     Simulate the greediest strategy and demand it runs dry. */
  var w = ECON.newWallet();
  ECON.grantDaily(w, 1000);
  var start = w.tix, digs = 0, guard = 200000;
  while (w.tix >= ECON.RUMMAGE_COST && guard-- > 0) {
    ECON.spend(w, ECON.RUMMAGE_COST); digs++;
    var it = ATTIC.hashToItem(HASHES[digs % N]);
    ECON.payReveal(w, it);      // the keeper refund
    ECON.payScrap(w);           // then throw it back for whatever it gives
  }
  ok('scrap and dig cannot be farmed forever', guard > 0,
    digs + ' digs from ' + start + ' tickets before the wallet ran dry');
  ok('the dig loop is genuinely lossy', digs < start * 12,
    (digs / start).toFixed(2) + ' digs per starting ticket');
  ok('a dig loop still gives a real session', digs > start * 2,
    (digs / start).toFixed(2) + ' digs per starting ticket');

  /* the day cannot be extended without limit by the second earner */
  var w2 = ECON.newWallet(), banked = 0, g2 = 500;
  while (g2-- > 0) banked += ECON.bankDust(w2, 99, 100);
  ok('the dust minigame is capped per day', banked <= ECON.DUST_CAP, 'banked ' + banked + ', cap ' + ECON.DUST_CAP);
})();

/* ═══ F. SAVE INTEGRITY ════════════════════════════════════════════ */
sec('F  SAVE INTEGRITY (corrupt saves, two tabs, counters ADD)');
(function () {
  if (!ECON) { ok('save layer is testable outside the browser', false, 'attic-econ.js not found'); return; }
  ok('save layer is testable outside the browser', true);

  var CASES = [
    ['null', null], ['garbage string', '{{{'], ['a number', '7'], ['an array', '[1,2,3]'],
    ['negative tickets', '{"tix":-500,"day":0,"wants":{}}'],
    ['a day in the far future', '{"tix":3,"day":999999,"wants":{}}'],
    ['NaN tickets', '{"tix":"banana","day":0,"wants":{}}'],
    ['wants as a string', '{"tix":3,"day":0,"wants":"nope"}'],
    ['absurd tickets', '{"tix":1e300,"day":0,"wants":{}}']
  ];
  var allSane = true, why = '';
  CASES.forEach(function (c) {
    var w = ECON.readWallet(c[1]);
    var sane = w && typeof w.tix === 'number' && isFinite(w.tix) && w.tix >= 0 && w.tix <= ECON.TIX_MAX
      && typeof w.wants === 'object' && w.wants !== null;
    if (!sane) { allSane = false; why += c[0] + ' '; }
  });
  ok('every corrupt save loads into a playable wallet', allSane, why);

  /* a save that parks the day counter in the future must never lock the
     daily allowance out forever */
  var far = ECON.readWallet('{"tix":0,"day":999999,"wants":{}}');
  var gave = ECON.grantDaily(far, 100);
  ok('a future dated save still gets its daily tickets', gave > 0, 'granted ' + gave);

  /* two tabs: tab A and tab B both hold a stale wallet, both spend. The
     write must be a read modify write against what is on disk, or one tab
     silently refunds the other. */
  var disk = JSON.stringify({ tix: 10, day: 5, wants: {} });
  var tabA = ECON.readWallet(disk), tabB = ECON.readWallet(disk);
  ECON.spend(tabA, 4);
  disk = ECON.mergeToDisk(disk, tabA);
  ECON.spend(tabB, 3);
  disk = ECON.mergeToDisk(disk, tabB);
  var end = ECON.readWallet(disk);
  ok('two tabs spending do not clobber each other', end.tix === 3, 'expected 3 tickets left, got ' + end.tix);

  /* counters ADD and bests MAX across a merge */
  var d2 = JSON.stringify({ tix: 2, day: 5, wants: { 0: 1 }, finds: 10, best: 7 });
  var stale = ECON.readWallet(d2);
  stale.wants[3] = 1; stale.finds = 11; stale.best = 4;
  var merged = ECON.readWallet(ECON.mergeToDisk(JSON.stringify({ tix: 2, day: 5, wants: { 1: 1 }, finds: 20, best: 9 }), stale));
  ok('want list ticks union across tabs', !!(merged.wants[0] || merged.wants[3]) && !!merged.wants[1],
    JSON.stringify(merged.wants));
  ok('the find counter ADDs rather than overwrites', merged.finds >= 20, 'finds=' + merged.finds);
  ok('the best is MAXed rather than overwritten', merged.best === 9, 'best=' + merged.best);

  /* the shelf must survive garbage and must not grow without bound */
  var shelf = ECON.readShelf('["' + HASHES[0] + '","nope",42,null,"' + HASHES[1] + '"]');
  ok('a corrupt shelf keeps the valid hashes and drops the rest', shelf.length === 2, 'kept ' + shelf.length);
  var big = [], k;
  for (k = 0; k < 5000; k++) big.push(HASHES[k]);
  var capped = ECON.readShelf(JSON.stringify(big));
  ok('the shelf is capped so storage cannot run away', capped.length <= ECON.SHELF_MAX,
    capped.length + ' kept, cap ' + ECON.SHELF_MAX);
})();

/* ═══ G. COPY LAW ══════════════════════════════════════════════════ */
sec('G  COPY LAW');
(function () {
  var bad = 0, eg = '', j;
  for (j = 0; j < 8000; j++) {
    var it = ATTIC.hashToItem(HASHES[j]);
    var s = [it.name, it.sub, it.sticker, it.provenance, it.error].join(' ');
    if (/[—–]/.test(s) || / - /.test(s)) { bad++; if (!eg) eg = s; }
  }
  ok('no em dash, en dash or spaced hyphen in generated copy', bad === 0, bad + ' hits; e.g. ' + eg);

  var fs = require('fs');
  var page = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  var body = page.slice(page.indexOf('<body'));
  var visible = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ');
  ok('no em dash or en dash in the page copy', !/[—–]/.test(visible),
    (visible.match(/[—–][^\s]{0,20}/g) || []).slice(0, 3).join(' | '));

  /* 48px rendered touch targets. Every button in the sheet must declare at
     least 48px of min-height, measured from the stylesheet. */
  var css = page.slice(page.indexOf('<style>'), page.indexOf('</style>'));
  var small = [], re = /\.([A-Za-z][\w-]*)\s*\{[^}]*min-height:\s*(\d+)px/g, m;
  while ((m = re.exec(css))) {
    if (/btn|chip|rummage|slot|closebtn|scrapbtn|wantbtn/i.test(m[1]) && parseInt(m[2], 10) < 48) small.push(m[1] + '=' + m[2] + 'px');
  }
  ok('every tappable class declares 48px or more', small.length === 0, small.join(', '));
})();

console.log('\n' + (fails ? 'FAILED' : 'OK') + '  ' + passes + ' passed, ' + fails + ' failed\n');
process.exit(fails ? 1 : 0);
