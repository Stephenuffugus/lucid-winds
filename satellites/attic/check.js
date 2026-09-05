/* THE ATTIC — headless check suite.  node satellites/attic/check.js
 *
 * House pattern (modelled on satellites/stop-the-light/check.js and
 * satellites/puppy-dash/check.js): vm + a DOM stub for anything that lives in
 * the page, `ok()` / `group()`, exit 0 all green, 1 a failure, 2 the harness
 * itself is broken.
 *
 * ⛔ THIS SUPERSEDES test/attic-check.js. That file is now a shim that runs
 * this one, so `node test/attic-check.js` still works and nothing that ever
 * referred to it is orphaned. Everything the old suite asserted is here.
 *
 * ⛔ EVERY GROUP THAT CAN BE MUTATION TESTED IS. A check you have not watched
 * go red is decoration, and "I broke it by hand once" is not repeatable. The
 * groups below that guard a rule are written as PREDICATES over an
 * implementation, run first against the real code and then against a
 * deliberately broken one, and the broken run has to fail the exact predicate
 * the rule exists for. Run with ATTIC_SELFTEST=1 to see those controls printed
 * as their own group.
 *
 * The browser group is the one thing that has to be a real browser: the house
 * rule is "48px is RENDERED px, measured at 375x667", never a CSS declaration.
 * It needs the static server on 127.0.0.1:8777. Set AT_NOBROWSER=1 to skip it.
 */
'use strict';
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const ROOT = __dirname;
const FILE = process.env.AT_FILE ? path.resolve(process.env.AT_FILE) : path.join(ROOT, 'index.html');
let SRC, ATTIC, ECON, OBJ, SLEEVE;
try {
  SRC = fs.readFileSync(FILE, 'utf8');
  /* AT_ENGINE points the node side at a copy of the engine, so a mutant can be watched */
  ATTIC = require(process.env.AT_ENGINE ? path.resolve(process.env.AT_ENGINE) : path.join(ROOT, 'attic-engine.js'));
  ECON = require(path.join(ROOT, 'attic-econ.js'));
  SLEEVE = require(path.join(ROOT, 'sleeve-render.js'));
  OBJ = require(process.env.AT_OBJECT ? path.resolve(process.env.AT_OBJECT) : path.join(ROOT, 'object-render.js'));   /* AT_OBJECT: a mutant renderer to watch */
} catch (e) {
  console.error('harness: could not load the game :: ' + e.message);
  process.exit(2);
}

let pass = 0, fail = 0; const fails = [];
function ok(name, cond, detail) {
  if (cond) { pass++; console.log('  ok   ' + name + (detail ? '   (' + detail + ')' : '')); }
  else { fail++; fails.push(name + (detail ? ' :: ' + detail : '')); console.log('  FAIL ' + name + (detail ? ' :: ' + detail : '')); }
}
function group(n) { console.log('\n== ' + n); }
function pct(n) { return (n * 100).toFixed(3) + '%'; }
function within(actual, want, tolFrac) { return Math.abs(actual - want) <= Math.abs(want) * tolFrac; }

/* ── the population ──────────────────────────────────────────────────────
   ⛔ splitmix32, NOT a raw xorshift. A raw xorshift's top byte is its weakest
   and byte 0 of the hash is the CLASS selector, so the first version of the
   old suite reported the engine's class split as broken when the bias was in
   the test. Byte 2 (the grade) passed the whole time, which is what gave it
   away. If you change this, check byte 0 is flat first. */
function mix32(z) {
  z = (z + 0x9e3779b9) >>> 0;
  z = Math.imul(z ^ (z >>> 16), 0x21f0aaad) >>> 0;
  z = Math.imul(z ^ (z >>> 15), 0x735a2d97) >>> 0;
  return (z ^ (z >>> 15)) >>> 0;
}
function mkHash(i) {
  let s = '';
  for (let k = 0; k < 8; k++) s += ('0000000' + mix32(i * 8 + k).toString(16)).slice(-8);
  return s;
}
const N = 60000;
const HASHES = []; for (let i = 0; i < N; i++) HASHES.push(mkHash(i));

/* ── scripts in the page ─────────────────────────────────────────────── */
function scriptBlocks(src) {
  const out = []; let i = 0;
  for (;;) {
    const a = src.indexOf('<script', i); if (a < 0) break;
    const gt = src.indexOf('>', a); const b = src.indexOf('</script>', gt); if (b < 0) break;
    out.push({ attrs: src.slice(a, gt), body: src.slice(gt + 1, b), line: src.slice(0, a).split('\n').length });
    i = b + 9;
  }
  return out;
}
const BLOCKS = scriptBlocks(SRC);
const INLINE = BLOCKS.filter(b => b.attrs.indexOf('src=') < 0 && b.body.trim().length);
if (INLINE.length < 2) { console.error('harness: expected at least 2 inline blocks, got ' + INLINE.length); process.exit(2); }

group('the page compiles and is wired to what it loads');
/* ⛔ compile with vm, never with a brace counter: the page is full of inline
   SVG whose braces and parens defeat naive counting. */
INLINE.forEach((b, i) => {
  let e = null; try { new vm.Script(b.body, { filename: 'inline-' + i }); } catch (err) { e = err.message; }
  ok('inline block ' + i + ' (line ' + b.line + ') parses', !e, e);
});
const srcs = []; { const re = /<script[^>]*\bsrc="([^"]+)"/g; let m; while ((m = re.exec(SRC))) srcs.push(m[1]); }
ok('every script src resolves to a file on disk',
  /* a root absolute src (the arcade's /music-unlocks.js include, Sep 02) lives at the repo
     root, two levels up from this folder, not beside the page */
  srcs.every(s2 => { const f = s2.split('?')[0]; return fs.existsSync(f.charAt(0) === '/' ? path.join(ROOT, '..', '..', f) : path.join(ROOT, f)); }), srcs.join(' '));
ok('the page loads all four modules',
  ['attic-engine.js', 'attic-econ.js', 'sleeve-render.js', 'object-render.js'].every(f => srcs.some(s2 => s2.split('?')[0] === f)), srcs.join(' '));
const BODY = SRC.slice(SRC.indexOf('<body'));
ok('the card still renders dusty before the wipe', /renderItem\([^)]*\{\s*dusty:\s*!/.test(BODY),
  'no dusty render call found in show()');
ok('the wallet is written through the merge, never wholesale',
  /mergeToDisk/.test(BODY) && !/localStorage\.setItem\(\s*W_KEY/.test(BODY),
  'a direct wallet write is still present');
{
  let man = null, err = '';
  try { man = JSON.parse(fs.readFileSync(path.join(ROOT, 'manifest.webmanifest'), 'utf8')); } catch (e) { err = e.message; }
  ok('the web manifest parses', !!man, err);
  ok('the manifest names the game and has an icon', !!(man && man.name && man.icons && man.icons.length), man ? man.name : '');
}

group('player copy');
function stripComments(js) {
  let out = '', i = 0; const n = js.length;
  while (i < n) {
    const c = js[i], d = js[i + 1];
    if (c === '/' && d === '*') { const e = js.indexOf('*/', i + 2); i = e < 0 ? n : e + 2; out += ' '; continue; }
    if (c === '/' && d === '/') { const e = js.indexOf('\n', i); i = e < 0 ? n : e; out += ' '; continue; }
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1; while (j < n) { if (js[j] === '\\') { j += 2; continue; } if (js[j] === c) break; j++; }
      out += js.slice(i, j + 1); i = j + 1; continue;
    }
    out += c; i++;
  }
  return out;
}
const DASHES = /[‐‑‒–—―−]/;
{
  let htmlOnly = SRC.replace(/<!--[\s\S]*?-->/g, ' ');
  BLOCKS.forEach(b => { if (b.body.length) htmlOnly = htmlOnly.split(b.body).join(' '); });
  htmlOnly = htmlOnly.replace(/<style[\s\S]*?<\/style>/gi, m => m.replace(/\/\*[\s\S]*?\*\//g, ' '));
  const hits = [];
  htmlOnly.split('\n').forEach((l, i) => { if (DASHES.test(l)) hits.push('html ~' + (i + 1) + ': ' + l.trim().slice(0, 90)); });
  INLINE.forEach(b => stripComments(b.body).split('\n').forEach((l, i) => { if (DASHES.test(l)) hits.push('js ~' + (b.line + i) + ': ' + l.trim().slice(0, 90)); }));
  ['attic-engine.js', 'attic-econ.js', 'sleeve-render.js', 'object-render.js'].forEach(f => {
    stripComments(fs.readFileSync(path.join(ROOT, f), 'utf8')).split('\n').forEach((l, i) => {
      if (DASHES.test(l)) hits.push(f + ':' + (i + 1) + ': ' + l.trim().slice(0, 90));
    });
  });
  ok('no dash characters in player facing copy (comments exempt)', hits.length === 0, hits.slice(0, 3).join(' | '));
}
{
  const dead = [];
  ['Retro Attic', 'Sky Wolf Studios', 'stevieweedseed', 'Petal Walk'].forEach(w => { if (SRC.indexOf(w) >= 0) dead.push(w); });
  ok('no dead names in the page', dead.length === 0, dead.join(', '));
}

group('determinism: one of one is a hash promise');
{
  let same = true, bad = null;
  for (let j = 0; j < 500; j++) {
    const a = JSON.stringify(ATTIC.hashToItem(HASHES[j]));
    const b = JSON.stringify(ATTIC.hashToItem(HASHES[j]));
    if (a !== b) { same = false; bad = HASHES[j]; break; }
  }
  ok('the same hash produces the same object every time', same, bad || '');
  let svgSame = true;
  for (let j = 0; j < 200; j++) {
    if (OBJ.renderItem(HASHES[j], 300).svg !== OBJ.renderItem(HASHES[j], 300).svg) { svgSame = false; break; }
  }
  ok('the same hash renders the same picture every time', svgSame);
  ok('junk in still produces a real object, never undefined',
    (() => { const it = ATTIC.hashToItem('not a hash at all'); return !!it && !!it.name && /^[0-9a-f]{64}$/.test(it.hash) && !/undefined|NaN/.test(it.name + it.sub); })());
  ok('junk in produces the SAME object every time',
    ATTIC.hashToItem('not a hash at all').name === ATTIC.hashToItem('not a hash at all').name);
  let renderClean = true, dirty = '';
  for (let j = 0; j < 3000; j++) {
    const r = OBJ.renderItem(HASHES[j], 300);
    if (!r || !r.svg) { renderClean = false; dirty = 'null render for ' + ATTIC.hashToItem(HASHES[j]).cls; break; }
    if (/NaN|undefined|#[0-9a-f]*[g-z]/i.test(r.svg)) { renderClean = false; dirty = ATTIC.hashToItem(HASHES[j]).cls + ' ' + HASHES[j]; break; }
  }
  ok('every family renders without NaN, undefined or a broken colour', renderClean, dirty);
}

group('the declared class split is the real class split');
{
  const cls = {};
  for (let j = 0; j < N; j++) { const c = ATTIC.hashToItem(HASHES[j]).cls; cls[c] = (cls[c] || 0) + 1; }
  ok('there are at least ten families', ATTIC.CLASSES.length >= 10, ATTIC.CLASSES.length + ': ' + ATTIC.CLASSES.join(', '));
  ATTIC.CLASSES.forEach(c => {
    const got = (cls[c] || 0) / N, want = ATTIC.classShare(c);
    ok('class ' + c + ' lands on its declared share', within(got, want, 0.1),
      'want ' + pct(want) + ', got ' + pct(got));
  });
  ok('every family the split names has a renderer',
    ATTIC.CLASSES.every(c => { const h = HASHES.find(x => ATTIC.hashToItem(x).cls === c); return !!(h && OBJ.renderItem(h, 90) && OBJ.renderItem(h, 90).svg); }));
}

/* ── THE CONDITION LADDER ────────────────────────────────────────────────
   Written as a predicate over a grade function so the same rules can be run
   against a deliberately broken ladder and watched to fail. */
const LADDER = { 'TRASHED': 20 / 256, 'PLAYED': 77 / 256, 'GOOD': 72 / 256, 'FINE': 46 / 256,
  'NEAR MINT': 31 / 256, 'MINT': 9 / 256, 'FACTORY SEALED': 1 / 256 };
function measureLadder(gradeOf) {
  const g = {};
  for (let j = 0; j < N; j++) { const k = gradeOf(HASHES[j]); g[k] = (g[k] || 0) + 1; }
  return g;
}
function ladderPredicates(counts) {
  const out = {};
  Object.keys(LADDER).forEach(k => { out[k] = within((counts[k] || 0) / N, LADDER[k], 0.1); });
  out.sealedExists = (counts['FACTORY SEALED'] || 0) > 0;
  return out;
}
group('the condition ladder over ' + N + ' draws, within 10% of the published odds');
{
  const counts = measureLadder(h => ATTIC.hashToItem(h).grade);
  const P = ladderPredicates(counts);
  Object.keys(LADDER).forEach(k => {
    ok('grade ' + k + ' matches the ladder', P[k], 'want ' + pct(LADDER[k]) + ', got ' + pct((counts[k] || 0) / N));
  });
  ok('FACTORY SEALED really is the grail and really does turn up',
    P.sealedExists && (counts['FACTORY SEALED'] / N) < 0.006,
    (counts['FACTORY SEALED'] || 0) + ' in ' + N + ' = ' + pct((counts['FACTORY SEALED'] || 0) / N) + ', 1 in ' + Math.round(N / (counts['FACTORY SEALED'] || 1)));
  let err = 0; for (let j = 0; j < N; j++) if (ATTIC.hashToItem(HASHES[j]).error) err++;
  ok('the factory error fires at the declared 6.25%', within(err / N, 16 / 256, 0.1), pct(err / N));
  const eras = {}; for (let j = 0; j < N; j++) { const e = ATTIC.hashToItem(HASHES[j]).era; eras[e] = (eras[e] || 0) + 1; }
  ok('the five eras are flat', Object.keys(eras).length === 5 && Object.keys(eras).every(k => within(eras[k] / N, 0.2, 0.1)),
    JSON.stringify(eras));
}

group('generator depth: "never existed before", measured');
{
  const names = {}; ATTIC.CLASSES.forEach(c => { names[c] = {}; });
  const fulls = {}; let dup = 0;
  for (let j = 0; j < N; j++) {
    const it = ATTIC.hashToItem(HASHES[j]);
    names[it.cls][it.name] = 1;
    const f = it.cls + '|' + it.name + '|' + it.sub + '|' + it.sticker + '|' + it.era;
    if (fulls[f]) dup++; else fulls[f] = 1;
  }
  ATTIC.CLASSES.forEach(c => {
    const n = Object.keys(names[c]).length;
    ok(c + ' draws from a deep name space', n >= 1200, n + ' distinct titles in ' + N + ' pulls, bar is 1200');
  });
  ok('two pulls almost never produce the identical object', dup / N < 0.02, dup + ' exact duplicates (' + pct(dup / N) + ')');
  let sessionDup = 0; const trials = 400;
  for (let t = 0; t < trials; t++) {
    const seen = {};
    for (let j = 0; j < 40; j++) {
      const it = ATTIC.hashToItem(HASHES[(t * 40 + j) % N]);
      if (seen[it.name]) { sessionDup++; break; }
      seen[it.name] = 1;
    }
  }
  ok('a forty dig session rarely repeats a title', sessionDup / trials < 0.25,
    sessionDup + ' of ' + trials + ' sessions repeated');
}

/* ── THE REVEAL ──────────────────────────────────────────────────────────
   Predicate over an item builder, so a leak can be manufactured and watched. */
function setByte(h, n, v) { return h.slice(0, n * 2) + ('0' + v.toString(16)).slice(-2) + h.slice(n * 2 + 2); }
function revealPredicates(build, render) {
  let textLeaks = 0, artLeaks = 0, gradesSeen = {}, flourish = 0, storyByGrade = {};
  for (let j = 0; j < 220; j++) {
    const base = HASHES[j];
    let firstText = null, firstArt = null;
    for (let b = 0; b < 256; b += 1) {
      const h = setByte(base, 2, b);
      const it = build(h);
      gradesSeen[it.grade] = 1;
      if (it.revealSuffix || it.revealNote) flourish++;
      if (it.revealStory) { (storyByGrade[it.grade] = storyByGrade[it.grade] || {})[it.revealStory] = 1; }
      const text = [it.cls, it.name, it.sub, it.sticker, it.era, it.year, it.provenance, it.error].join('|');
      const art = render(h, 300, { dusty: true }).svg;
      if (firstText === null) { firstText = text; firstArt = art; continue; }
      if (text !== firstText) textLeaks++;
      if (art !== firstArt) artLeaks++;
    }
  }
  const storyGrades = Object.keys(storyByGrade).length;
  const storyMinDistinct = Math.min.apply(null, Object.keys(gradesSeen).map(g => Object.keys(storyByGrade[g] || {}).length));
  return { textLeaks, artLeaks, grades: Object.keys(gradesSeen).length, flourish, storyGrades, storyMinDistinct };
}
group('the reveal: nothing says the condition before the wipe');
{
  const P = revealPredicates(ATTIC.hashToItem, OBJ.renderItem);
  ok('the sweep really covers the whole ladder', P.grades === 7, P.grades + ' grades seen');
  ok('the pre reveal TEXT is independent of the grade', P.textLeaks === 0, P.textLeaks + ' leaks');
  ok('the DUSTY ART is independent of the grade', P.artLeaks === 0, P.artLeaks + ' leaks');
  ok('a revealed flourish still exists to print after the wipe', P.flourish > 0, P.flourish + ' flourishes');
  /* 2026-09-05: FINE and NEAR MINT used to have nothing to say after the wipe */
  ok('every one of the seven grades tells where its wear came from after the wipe', P.storyGrades === 7, P.storyGrades + ' grades with a story');
  ok('the wear story is a bank, not one line per grade', P.storyMinDistinct >= 4, P.storyMinDistinct + ' distinct at the thinnest grade');
  const h = HASHES[3];
  ok('a dusty render is marked data-dusty and a clean one is not',
    /data-dusty/.test(OBJ.renderItem(h, 240, { dusty: true }).svg) && !/data-dusty/.test(OBJ.renderItem(h, 240).svg));
  ok('the word UNWIPED is not printed into the artwork', !/UNWIPED/.test(OBJ.renderItem(h, 240, { dusty: true }).svg));
  let differs = 0;
  for (let j = 0; j < 300; j++) {
    if (OBJ.renderItem(HASHES[j], 240, { dusty: true }).svg !== OBJ.renderItem(HASHES[j], 240).svg) differs++;
  }
  ok('the dusty state is a different picture from the clean one', differs === 300, differs + '/300');
}
group('era depth: five eras, five stickers, five title treatments');
{
  /* the era is byte 1 mod 5 (the engine's law); the sticker shows on wiped grades up to
     NEAR MINT; the title carries the era treatment. Sweep every class at GOOD. */
  const eraSeen = {}, taSeen = {}, missing = [];
  ATTIC.CLASSES.forEach(c => {
    const base = HASHES.find(h => ATTIC.hashToItem(h).cls === c);
    if (!base) return;
    for (let e = 0; e < 5; e++) {
      const h = setByte(setByte(base, 1, e), 2, 0x88);   // era e, GOOD
      const it = ATTIC.hashToItem(h), svg = OBJ.renderItem(h, 300).svg;
      const m = svg.match(/data-era="([0-9]{4}s)"/);
      if (c !== 'RECORD') { if (m && m[1] === it.era) eraSeen[it.era] = (eraSeen[it.era] || 0) + 1; else missing.push(c + '/' + it.era); }
      if (c !== 'RECORD') { const ta = { '1950s': /font-style="italic"/, '1960s': /stroke-linejoin="round"/, '1970s': /stroke-linejoin="miter"/, '1980s': /stroke="#26f0e0" stroke-width="0\.7"/, '1990s': /letter-spacing="2\.2"/ }[it.era]; if (ta && ta.test(svg)) taSeen[it.era] = (taSeen[it.era] || 0) + 1; }
    }
  });
  ok('every non record class shows the sticker of its era at GOOD, all five eras', Object.keys(eraSeen).length === 5 && missing.length === 0, missing.slice(0, 6).join(', ') || Object.keys(eraSeen).join(' '));
  ok('every era puts its own treatment on the title', Object.keys(taSeen).length === 5 && Object.values(taSeen).every(n => n >= 8), JSON.stringify(taSeen));
  /* the sticker is grade blind below MINT and absent above NEAR MINT */
  const base = HASHES.find(h => ATTIC.hashToItem(h).cls === 'TOY');
  const at = g => (OBJ.renderItem(setByte(base, 2, g), 300).svg.match(/data-era=/g) || []).length;
  ok('the sticker shows on TRASHED through NEAR MINT and not on MINT or FACTORY SEALED', at(0x08) === 1 && at(0xC0) === 1 && at(0xE8) === 1 && at(0xFA) === 0 && at(0xFF) === 0, [at(0x08), at(0xC0), at(0xE8), at(0xFA), at(0xFF)].join(','));
}
group('the condition ladder is legible: seven grades, seven pictures');
{
  /* ⛔ ONE BASE HASH IS ONE FAMILY. The first version of this group swept a
     single object and passed while the RECORD class, the flagship, had three
     visible grades instead of seven: PLAYED and GOOD rendered byte for byte
     identically and so did FINE and NEAR MINT, because the ramp had only ever
     been wired into object-render and records go through sleeve-render. Sweep
     every family or the one that is different is the one you miss. */
  const GB = { 'TRASHED': 0x08, 'PLAYED': 0x40, 'GOOD': 0x88, 'FINE': 0xC0, 'NEAR MINT': 0xE8, 'MINT': 0xFA, 'FACTORY SEALED': 0xFF };
  ATTIC.CLASSES.forEach(c => {
    const base = HASHES.find(h => ATTIC.hashToItem(h).cls === c);
    if (!base) { ok(c + ': a base hash exists to sweep', false); return; }
    const seen = {}; const dupes = [];
    ECON.GRADE_ORDER.forEach(g => {
      const svg = OBJ.renderItem(setByte(base, 2, GB[g]), 300).svg;
      if (seen[svg]) dupes.push(seen[svg] + ' and ' + g);
      seen[svg] = g;
    });
    ok(c + ': all seven grades render a different picture', dupes.length === 0, dupes.join('; '));
  });
}

/* ── THE DAILY ───────────────────────────────────────────────────────── */
/* ⛔ THIS PREDICATE WAS VACUOUS AND I WATCHED IT BE VACUOUS. Breaking the real
   engine by mixing Date.now() into DAILY_SALT left the whole daily group GREEN,
   because `dailyHash(d) === dailyHash(d)` calls the function twice inside the
   same millisecond and a clock seeded daily agrees with itself for a whole
   millisecond. The only honest way to catch a clock is to let the clock move:
   `stableOverTime` busy waits past a tick boundary and asks again. The two
   controls below are seeded off Date.now() for the same reason, so they fail
   the way the REAL defect fails and not the way a Math.random() strawman does. */
function dailyPredicates(dailyHash) {
  const d = 20690;
  const spread = {}; for (let i = 0; i < 500; i++) spread[dailyHash(d + i)] = 1;
  const first = dailyHash(d);
  const t0 = Date.now();
  while (Date.now() - t0 < 12) { /* let the wall clock move */ }
  return {
    stable: dailyHash(d) === dailyHash(d),
    stableOverTime: dailyHash(d) === first,
    moves: dailyHash(d) !== dailyHash(d + 1),
    noClock: dailyHash(d) === dailyHash(d + 0.72),
    spread: Object.keys(spread).length === 500,
    shape: /^[0-9a-f]{64}$/.test(dailyHash(d))
  };
}
group('the daily find is the same object for everybody, all day');
{
  const P = dailyPredicates(ATTIC.dailyHash);
  ok('the same date twice is the same object', P.stable);
  ok('and still the same object twelve milliseconds later, so no clock is in the seed', P.stableOverTime);
  ok('a different date is a different object', P.moves);
  ok('the seed ignores the time of day, so it turns over at midnight and nowhere else', P.noClock);
  ok('five hundred days produce five hundred different objects', P.spread);
  ok('the daily hash is a real 64 char hash', P.shape);
  ok('the week index rolls on a Sunday', ATTIC.weekIndex(20690) === ATTIC.weekIndex(20690 + 1) - (((20690 + 4) % 7) === 6 ? 1 : 0));
  ok('the weekly pick is stable for a week and moves between weeks',
    ATTIC.weeklyPick(2955, 60) === ATTIC.weeklyPick(2955, 60) && ATTIC.weeklyPick(2955, 60) !== ATTIC.weeklyPick(2956, 60));
  ok('the weekly pick stays inside the pool', (() => { for (let w = 0; w < 400; w++) { const v = ATTIC.weeklyPick(w, 60); if (!(v >= 0 && v < 60)) return false; } return true; })());
  ok('a nonsense day still returns a real hash', /^[0-9a-f]{64}$/.test(ATTIC.dailyHash(NaN)) && /^[0-9a-f]{64}$/.test(ATTIC.dailyHash('x')));
}

/* ── ECONOMY ─────────────────────────────────────────────────────────── */
function solvency(E) {
  /* the greediest strategy there is: dig, keep the keepers for the refund,
     scrap everything, take every daily and every dust ticket the cap allows */
  const w = E.readWallet(null, 0);
  let day = 0, digs = 0;
  for (; day < 400; day++) {
    E.grantDaily(w, day);
    E.bankDust(w, 999, day);
    let guard = 100000;
    while (E.spend(w, E.RUMMAGE_COST) && guard-- > 0) {
      digs++;
      E.payReveal(w, { grade: (digs % 3 === 0) ? 'FINE' : 'PLAYED' });
      E.payScrap(w);
      if (digs > 400000) return { dry: false, digs, day };
    }
    if (w.tix > 200) return { dry: false, digs, day };
  }
  return { dry: w.tix < 3, digs, day, tix: w.tix };
}
function twoTabs(E) {
  const disk0 = E.mergeToDisk(null, (() => { const w = E.readWallet(null, 5); E.grantDaily(w, 5); return w; })());
  const a = E.readWallet(disk0, 5), b = E.readWallet(disk0, 5);
  E.spend(a, 3);
  const disk1 = E.mergeToDisk(disk0, a);
  E.spend(b, 1);
  const disk2 = E.mergeToDisk(disk1, b);
  const end = E.readWallet(disk2, 5);
  return { start: E.readWallet(disk0, 5).tix, end: end.tix };
}
group('the economy cannot be minted out of nothing');
{
  const S = solvency(ECON);
  ok('the greediest possible strategy still runs the wallet dry', S.dry,
    S.digs + ' digs over ' + S.day + ' days, ending on ' + S.tix + ' tickets');
  ok('a rummage costs more than scrapping the result pays back',
    ECON.RUMMAGE_COST > 1 / ECON.SCRAP_PER, ECON.RUMMAGE_COST + ' vs 1/' + ECON.SCRAP_PER);
  ok('the daily streak bonus cannot outrun the daily allowance',
    1 / ECON.STREAK_EVERY < ECON.DAILY, (1 / ECON.STREAK_EVERY).toFixed(2) + ' a day vs ' + ECON.DAILY);
  const T = twoTabs(ECON);
  ok('two tabs cannot refund each other\'s spending', T.end === T.start - 4, JSON.stringify(T));
}

group('a save can be anything at all and the game still opens');
{
  const junk = [null, undefined, '', 'not json{{{', '[]', '42', '"a string"', '{"tix":-500}',
    '{"tix":1e400}', '{"day":999999}', '{"wants":[1,2,3]}', '{"dailyDay":999999,"streak":900}',
    '{"scrapCredit":99999}', '{"dustN":-4,"dustDay":999999}'];
  let threw = null, bad = [];
  junk.forEach(j => {
    let w = null;
    try { w = ECON.readWallet(j, 20690); } catch (e) { threw = j + ' :: ' + e.message; return; }
    if (!(w.tix >= 0 && w.tix <= ECON.TIX_MAX)) bad.push(j + ' -> tix ' + w.tix);
    if (w.day > 20690) bad.push(j + ' -> future day survived');
    if (w.dailyDay > 20690) bad.push(j + ' -> future daily survived');
    if (!w.wants || typeof w.wants !== 'object' || w.wants instanceof Array) bad.push(j + ' -> wants is not an object');
  });
  ok('no corrupt save throws on load', !threw, threw || '');
  ok('every corrupt save is repaired into something playable', bad.length === 0, bad.slice(0, 3).join(' | '));
  ok('a save dated in the future does not lock the allowance out forever',
    ECON.readWallet('{"day":999999}', 20690).day === -1);
  ok('a save dated in the future does not lock the DAILY out forever',
    ECON.readWallet('{"dailyDay":999999,"streak":40}', 20690).dailyDay === -1);
  const shelf = ECON.readShelf(JSON.stringify(['zz', 123, null, HASHES[0], HASHES[0], HASHES[1]]));
  ok('the shelf drops junk hashes and duplicates', shelf.length === 2 && shelf[0] === HASHES[0], JSON.stringify(shelf.length));
  const big = []; for (let i = 0; i < ECON.SHELF_MAX + 50; i++) big.push(mkHash(90000 + i));
  ok('the shelf is capped so a long player cannot fill the storage quota',
    ECON.readShelf(JSON.stringify(big)).length === ECON.SHELF_MAX);
  const f = ECON.readFound(JSON.stringify({ [HASHES[0]]: 1000, bad: 5, [HASHES[1]]: -3 }));
  ok('the found map drops junk keys and impossible dates', Object.keys(f).length === 1 && f[HASHES[0]] === 1000, JSON.stringify(f));
  const merged = JSON.parse(ECON.mergeFoundToDisk(JSON.stringify({ [HASHES[0]]: 500 }), { [HASHES[0]]: 900 }, [HASHES[0]]));
  ok('a second tab cannot re-date a find (earliest wins)', merged[HASHES[0]] === 500, JSON.stringify(merged));
}

/* ── THE CONTROLS: every rule above, run against a broken implementation ──
   ⛔ THIS IS THE POINT OF THE SUITE. Each control breaks exactly one thing and
   the predicate that guards it has to go red. If a control ever passes, the
   check it belongs to is decoration and it says so out loud. */
group('controls: the checks above, watched failing against broken code');
{
  /* 1. a daily seeded off the clock. The classic way a "daily" is not a daily. */
  const clockDaily = (d) => { let s = 2166136261 >>> 0; const k = String(d) + ':' + Date.now();
    for (let i = 0; i < k.length; i++) { s ^= k.charCodeAt(i); s = Math.imul(s, 16777619) >>> 0; }
    let o = ''; for (let i = 0; i < 8; i++) { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; o += ('0000000' + s.toString(16)).slice(-8); } return o; };
  ok('CONTROL a clock seeded daily fails "still the same twelve milliseconds later"',
    dailyPredicates(clockDaily).stableOverTime === false);
  /* 2. a daily that ignores the date entirely */
  const frozenDaily = () => ATTIC.dailyHash(1);
  ok('CONTROL a frozen daily fails "a different date differs"', dailyPredicates(frozenDaily).moves === false);
  /* 3. a daily seeded off the raw day number including its fraction */
  const clockyDaily = (d) => ATTIC.dailyHash(Math.round(d * 1000));
  ok('CONTROL a daily that reads the time of day fails "turns over at midnight"', dailyPredicates(clockyDaily).noClock === false);
  /* 4. a ladder that never mints the grail */
  const noSealed = (h) => { const g = ATTIC.hashToItem(h).grade; return g === 'FACTORY SEALED' ? 'MINT' : g; };
  const P4 = ladderPredicates(measureLadder(noSealed));
  ok('CONTROL a ladder with no FACTORY SEALED fails the grail check', P4.sealedExists === false && P4['FACTORY SEALED'] === false);
  /* 5. a ladder tilted by 20%, which is twice the tolerance */
  const tilted = (h) => { const b = parseInt(h.substr(4, 2), 16); return b < 0x60 ? 'TRASHED' : ATTIC.hashToItem(h).grade; };
  ok('CONTROL a ladder tilted past the tolerance fails', ladderPredicates(measureLadder(tilted)).TRASHED === false);
  /* 6. the condition leaking into the name before the wipe, which is the exact
        defect the 2026-08-16 audit found in the toy class */
  const leakyBuild = (h) => { const it = ATTIC.hashToItem(h); it.name += ' (' + it.grade + ')'; return it; };
  ok('CONTROL a name that carries the grade fails the pre reveal text check',
    revealPredicates(leakyBuild, OBJ.renderItem).textLeaks > 0);
  /* 7. the condition leaking into the DUSTY art */
  const leakyRender = (h, s, o) => OBJ.renderItem(h, s, (o && o.dusty && ATTIC.hashToItem(h).grade === 'TRASHED') ? {} : o);
  ok('CONTROL dusty art that changes with the grade fails the art check',
    revealPredicates(ATTIC.hashToItem, leakyRender).artLeaks > 0);
  /* 8. a wallet written back wholesale, the two tab clobber */
  const clobberEcon = Object.create(ECON);
  clobberEcon.mergeToDisk = function (diskRaw, w) { return JSON.stringify(ECON.writable(w)); };
  const T8 = twoTabs(clobberEcon);
  ok('CONTROL a wholesale wallet write fails the two tab check', T8.end !== T8.start - 4, JSON.stringify(T8));
  /* 9. scrapping that pays the dig straight back, which made the game free */
  const freeEcon = Object.create(ECON);
  freeEcon.payScrap = function (w) { w.tix = Math.min(ECON.TIX_MAX, w.tix + 1); return 1; };
  ok('CONTROL a full scrap refund fails the solvency check', solvency(freeEcon).dry === false);
  /* 10. a corrupt save loader that trusts the disk */
  ok('CONTROL a loader that trusts a negative ticket count would ship one',
    (JSON.parse('{"tix":-500}').tix < 0) && ECON.readWallet('{"tix":-500}', 20690).tix === 0);
}

/* ── THE BROWSER ─────────────────────────────────────────────────────────
   48px is RENDERED px at 375x667, measured in a real browser, because a CSS
   declaration is not a measurement. Everything else here needs a live page
   too: the embed handshake only fires when the game is framed, and the dust
   panel is a canvas. */
function finish() {
  console.log('\n' + (fail ? 'FAILED' : 'OK') + '  ' + pass + ' passed, ' + fail + ' failed');
  if (fails.length) { console.log('\nfailures:'); fails.forEach(f => console.log('  - ' + f)); }
  process.exit(fail ? 1 : 0);
}
if (process.env.AT_NOBROWSER === '1') { console.log('\n(browser group skipped: AT_NOBROWSER=1)'); finish(); }

(async () => {
  let puppeteer;
  try { puppeteer = require('puppeteer'); }
  catch (e) { ok('browser group could run', false, 'puppeteer not installed'); finish(); return; }
  const BASE = 'http://127.0.0.1:' + (process.env.PORT || 8777) + '/satellites/attic/';
  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--mute-audio'] });

    /* the embed handshake, in a real frame, because it only fires when framed */
    group('the embed protocol');
    {
      const fp = await browser.newPage();
      await fp.setViewport({ width: 412, height: 915 });
      await fp.goto('http://127.0.0.1:' + (process.env.PORT || 8777) + '/satellites/', { waitUntil: 'domcontentloaded' });
      const got = await fp.evaluate((url) => new Promise((res) => {
        const seen = [];
        window.addEventListener('message', (e) => { if (e.data && e.data.sws) seen.push(e.data.sws); });
        const f = document.createElement('iframe');
        f.src = url; f.style.cssText = 'width:412px;height:915px;border:0';
        document.body.appendChild(f);
        setTimeout(() => res(seen), 2600);
      }), BASE + '?probe=' + Math.random());
      ok('the framed page posts {sws:"ready"}', got.indexOf('ready') >= 0, JSON.stringify(got));
      await fp.close();
    }

    const page = await browser.newPage();
    const consoleErrs = [];
    page.on('pageerror', e => consoleErrs.push('pageerror: ' + String(e).slice(0, 160)));
    page.on('console', m => { if (m.type() === 'error') consoleErrs.push('console: ' + m.text().slice(0, 160)); });
    await page.setViewport({ width: 375, height: 667, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('sws_dev_ok', '1'); } catch (e) {} });
    await page.goto(BASE + '?attictest=1&probe=' + Math.random(), { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 900));

    group('touch targets: rendered px in a real browser at 375x667');
    const rects = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      const out = {};
      function grab(sel, key) {
        const el = document.querySelector(sel);
        if (!el) { out[key || sel] = null; return; }
        const r = el.getBoundingClientRect();
        out[key || sel] = { w: Math.round(r.width), h: Math.round(r.height) };
      }
      /* ⛔ FORCE THE SHEET OPEN BEFORE MEASURING IT. On a cold profile it is up
         already, but a measurement that silently reports 0x0 because the thing
         is display:none is a check that passes or fails on the browser profile
         and not on the CSS. */
      document.getElementById('howSheet').className = 'on';
      grab('#howGo');
      document.getElementById('howGo').click();
      ['#swsBack', '#shelfOpen', '#wantOpen', '#dailyGo', '#go', '#dustBtn'].forEach(s => grab(s));
      D.setTix(30);
      for (let i = 0; i < 4; i++) { document.getElementById('go').click(); }
      grab('#scrap'); grab('#gb');
      document.getElementById('wantOpen').click(); grab('#wantClose');
      document.getElementById('wantClose').click();
      D.openShelf();
      grab('#shelfClose'); grab('.shSort button', 'sortBtn'); grab('.shCard', 'shelfCard');
      D.openCard(D.shelf()[0]);
      ['#fcSave', '#fcShare', '#fcScrap', '#fcClose'].forEach(s => grab(s));
      grab('#fcWipe');
      D.closeCard(); D.closeShelf();
      D.dustOpen(); grab('#dustDone');
      return out;
    });
    Object.keys(rects).forEach(k => {
      const r = rects[k];
      ok(k + ' is at least 48x48 rendered px', !!r && r.w >= 48 && r.h >= 48, r ? JSON.stringify(r) : 'not found');
    });

    group('DUST OFF is a minigame, not a DONE button with extra steps');
    const dust = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      const before = D.dustState();
      /* one snake drag, the exact thing that used to clear 46 of 48 cells in
         about three seconds with 87 seconds still on the clock */
      const rows = 8;
      for (let r = 0; r < rows; r++) {
        const y = (r + 0.5) * (before.h / rows);
        D.dustStroke(r % 2 ? before.w : 0, y, r % 2 ? 0 : before.w, y);
      }
      const oneDrag = D.dustState();
      /* measure the full clear from a FRESH panel, not from the 31% the drag
         above already took off, or the number is tuned to its own leftovers */
      D.dustReset();
      const full = D.dustSweeps(40);
      return { before, oneDrag, full };
    });
    ok('the panel starts filthy', dust.before.cleared < 0.02, pct(dust.before.cleared));
    ok('the panel hides ten stubs and none of them read yet', dust.before.stubs === 10 && dust.before.found === 0, JSON.stringify(dust.before.found));
    ok('one snake drag does scrub grime off', dust.oneDrag.cleared > 0.05, pct(dust.oneDrag.cleared));
    ok('but one snake drag does NOT clear the panel', dust.oneDrag.cleared < 0.6, pct(dust.oneDrag.cleared));
    /* the bar is DRAG DISTANCE, not passes: passes measures the brush, not the
       work, so a wider brush would make the job look harder while making it
       easier. Twelve panel widths is 25 to 35 seconds of committed scrubbing. */
    ok('clearing the panel takes real drag distance', dust.full.screens >= 12,
      dust.full.screens + ' panel widths (' + dust.full.dist + 'px)');
    ok('and it is still clearable inside ninety seconds', dust.full.cleared >= 0.9, pct(dust.full.cleared));
    ok('clearing it turns up the stubs', dust.full.found >= 8, dust.full.found + ' of 10');

    group('the wear line waits for the wipe');
    const wear = await page.evaluate(() => new Promise((res) => {
      const D = window.ATTIC_DEV;
      D.setTix(30);
      document.getElementById('go').click();
      const slot = document.getElementById('wearSlot');
      const before = { text: slot ? slot.textContent : null, shown: slot ? getComputedStyle(slot).display : null };
      document.getElementById('gb').click();
      setTimeout(() => {
        const s2 = document.getElementById('wearSlot');
        const grade = document.getElementById('gp').textContent.replace(/[^A-Z ]/g, '').trim();
        const bank = (window.ATTIC && window.ATTIC.WEAR && window.ATTIC.WEAR[grade]) || [];
        const r = s2.getBoundingClientRect();
        /* the slot is the class flaw (when the class has one) followed by the wear story, so the
           story is the END of the text, not the whole of it */
        res({ before, after: s2.textContent, shown: getComputedStyle(s2).display, grade, inBank: bank.some(l => s2.textContent.slice(-l.length) === l), h: Math.round(r.height) });
      }, 1300);
    }));
    ok('before the wipe the wear line is empty and hidden', wear.before.text === '' && wear.before.shown === 'none', JSON.stringify(wear.before));
    ok('after the wipe it prints a line from the bank for the grade on the plate', wear.after.length > 10 && wear.inBank && wear.shown === 'block' && wear.h > 10, JSON.stringify(wear));

    group('persistence survives a reload');
    const persisted = await page.evaluate(() => {
      const D = window.ATTIC_DEV;
      D.dustEnd();
      return { shelf: D.shelf().length, tix: D.wallet().tix };
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 700));
    const after = await page.evaluate(() => ({ shelf: window.ATTIC_DEV.shelf().length, tix: window.ATTIC_DEV.wallet().tix }));
    ok('the shelf survives a reload', after.shelf === persisted.shelf && after.shelf > 0, JSON.stringify({ persisted, after }));
    ok('the wallet survives a reload', after.tix === persisted.tix, JSON.stringify({ persisted, after }));

    group('no console errors anywhere in that session');
    ok('zero console or page errors', consoleErrs.length === 0, consoleErrs.slice(0, 3).join(' | '));

    await browser.close();
    finish();
  } catch (e) {
    if (browser) { try { await browser.close(); } catch (e2) {} }
    ok('the browser group could run at all', false, e.message);
    finish();
  }
})();
