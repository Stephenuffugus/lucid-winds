'use strict';
/* SHUTTERBUG harness (BUILD-PLAN.md section 5.1). Node built ins only, CommonJS (an ESM .js with no package.json
 * prints a MODULE_TYPELESS warning above every gate table).
 *
 * It loads the core from index.html through tools/core-loader.js (section 1.3: one copy of the core, the page's),
 * runs every registered assertion group, prints one line per group and the failing lines IN FULL (never the tail),
 * and prints SHUTTERBUG HARNESS OK only when everything ran and the assertion count met ASSERT_FLOOR (a truncated
 * suite cannot pass by being short). Expected values are computed inside the tests by code that is not the core's
 * (its own FNV, its own generator, its own packer, Node's own base64url), never read back from the page.
 *
 *   node harness.js                      everything
 *   node harness.js --fast               the per task run (skips --all-edges and --economy, and says so)
 *   node harness.js --page <file>        the same against another copy of the page (redwatch, the deploy check)
 *   node harness.js --only <prefix>      only the groups whose id starts with the prefix (redwatch's speed; no floor)
 *   node harness.js --fixture <name|path> [--mode 0|1] [--biome 0..4]   one room, its text render printed (T0.5 on)
 *   node harness.js --record-json <file> a page produced record built and printed (T0.15)
 *   node harness.js --retable --why ".." regenerate fixtures/tables.json (T0.10a)
 *   node harness.js --all-edges          the macro search on every edge (T0.13a)
 *   node harness.js --replay <file> | --record <fixture> | --regold --why ".." | --explore <fixture> (T0.13b)
 *   node harness.js --economy            the per fixture ledger (M2)
 *
 * An assertion that fails by design while it waits on a ruling is marked in XFAIL by name with its QUESTIONS.md
 * entry, never deleted; the run then ends SHUTTERBUG HARNESS OK WITH N XFAIL and lists them. */
const fs = require('node:fs'), path = require('node:path');
const { loadCoreFull } = require('./tools/core-loader.js');

const ARGS = process.argv.slice(2);
const flag = n => ARGS.includes('--' + n);
const opt = n => { const i = ARGS.indexOf('--' + n); return i >= 0 ? ARGS[i + 1] : null; };
const PAGE = path.resolve(opt('page') || path.join(__dirname, 'index.html'));
const FAST = flag('fast');
const ONLY = opt('only');
const ASSERT_FLOOR = 999;              /* raised per task: the count a full run must reach */

const LATER = { 'record-json': 'T0.15', retable: 'T0.10a', 'all-edges': 'T0.13a', replay: 'T0.13b', record: 'T0.13b',
  regold: 'T0.13b', explore: 'T0.13b', economy: 'M2' };
for (const k of Object.keys(LATER)) if (flag(k)) { console.log('--' + k + ' arrives in ' + LATER[k]); process.exit(2); }

/* Marked failures, by the start of the assertion's text, each with its QUESTIONS.md entry. */
const XFAIL = [
];

let CORE;
try { CORE = loadCoreFull(PAGE); }
catch (e) {
  console.log('FAIL  core load: ' + e.message);
  console.log((e.stack || '').split('\n').slice(0, 6).join('\n'));
  console.log('\nSHUTTERBUG HARNESS FAILED: the core did not load');
  process.exit(1);
}
const SB = CORE.SB;

/* ---------------------------------------------------------------- the corpus (section 2.7) */
const FIXDIR = path.resolve(opt('fixtures') || path.join(__dirname, 'fixtures'));
const EXPECT_KEYS = ['biome', 'needsCrop', 'tabsMax', 'exitIsLight', 'platformsMin', 'landmarksMin'];
function loadFixtures(dir) {
  const files = [];
  if (fs.existsSync(path.join(dir, 'sample-room.json'))) files.push(path.join(dir, 'sample-room.json'));
  for (const sub of ['synthetic', 'rooms']) {
    const d = path.join(dir, sub);
    if (fs.existsSync(d)) for (const f of fs.readdirSync(d).sort()) if (f.endsWith('.json')) files.push(path.join(d, f));
  }
  return files.map(f => {
    const j = JSON.parse(fs.readFileSync(f, 'utf8'));
    if (!j.record) throw new Error('fixture ' + path.relative(dir, f) + ' has no record: the loader refuses it');
    if (!j.expect) throw new Error('fixture ' + path.relative(dir, f) + ' has no expect (authored by hand from its design): the loader refuses it');
    return { file: f, name: j.name, fx: j };
  });
}
let FIXTURES;
try { FIXTURES = loadFixtures(FIXDIR); }
catch (e) { console.log('FAIL  fixtures: ' + e.message); console.log('\nSHUTTERBUG HARNESS FAILED: the corpus did not load'); process.exit(1); }
const fixture = name => FIXTURES.find(f => f.name === name);

/* the palette as characters, for a room no pipeline has built yet */
const PAL_CH = '@#%+., WarmbtgoF';
const palText = rows => rows.map(r => [...r].map(c => PAL_CH[parseInt(c, 16)]).join('')).join('\n');

/* ---------------------------------------------------------------- the framework */
const GROUPS = [];
function group(id, title, fn) { GROUPS.push({ id, title, fn }); }
let total = 0;
const failLines = [], xfailLines = [], xpassLines = [];
function makeT(id) {
  const t = { n: 0, bad: 0 };
  t.ok = (cond, msg, render) => {
    total++; t.n++;
    const line = id + ' ' + msg;
    const xf = XFAIL.find(x => line.startsWith(x.key));
    if (cond) { if (xf) xpassLines.push('XPASS ' + line + ' (marked xfail ' + xf.q + '; remove the mark)'); return true; }
    if (xf) { xfailLines.push('XFAIL ' + line + '  [' + xf.q + ']'); return false; }
    t.bad++;
    failLines.push('FAIL  ' + line + (render ? '\n' + render.replace(/^/gm, '      ') : ''));
    return false;
  };
  t.eq = (a, b, msg, render) => t.ok(a === b, msg + ' (got ' + show(a) + ', want ' + show(b) + ')', render);
  t.same = (a, b, msg, render) => { const x = JSON.stringify(a), y = JSON.stringify(b); return t.ok(x === y, msg + (x === y ? '' : ' (got ' + clip(x) + ', want ' + clip(y) + ')'), render); };
  t.throws = (fn, msg) => { let threw = false; try { fn(); } catch (e) { threw = true; } return t.ok(threw, msg); };
  return t;
}
const show = v => typeof v === 'number' && Number.isInteger(v) && Math.abs(v) > 9 ? v + ' (0x' + (v >>> 0).toString(16) + ')' : JSON.stringify(v);
const clip = s => s && s.length > 160 ? s.slice(0, 160) + '...' : s;

/* The harness's own generator, NOT the core's: xorshift32, so a core generator bug cannot hide in the inputs. */
function hrand(seed) {
  let x = (seed >>> 0) || 1;
  const next = () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x; };
  return { u32: next, int: n => next() % n, float: () => next() / 4294967296 };
}

/* ---------------------------------------------------------------- independent oracles */
function fnvRef(bytes, h0) {
  let h = (h0 === undefined ? 0x811c9dc5 : h0) >>> 0;
  for (let i = 0; i < bytes.length; i++) { h ^= bytes[i]; h = Math.imul(h, 16777619) >>> 0; }
  return h >>> 0;
}
function mulberryRef(a) {
  return function () {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
/* the packed record of section 2.1, written from the table in the plan, not from the core */
function packRef(j) {
  const n = j.w * j.h, grids = j.mode === 2 ? 2 : 1, out = Buffer.alloc(6 + grids * n / 2);
  out[0] = j.v; out[1] = j.w; out[2] = j.h; out[3] = j.mode;
  out.writeUInt16BE(j.focal === null ? 0 : j.focal + 1, 4);
  const rows = [j.rows].concat(grids === 2 ? [j.rows2] : []);
  rows.forEach((rs, g) => {
    const cells = rs.join('');
    for (let k = 0; k < n / 2; k++) out[6 + g * n / 2 + k] = (parseInt(cells[2 * k], 16) << 4) | parseInt(cells[2 * k + 1], 16);
  });
  return out;
}
function randomRecordJSON(r, mode) {
  const W = SB.GRID.W, H = SB.GRID.H;
  const rows = () => Array.from({ length: H }, () => Array.from({ length: W }, () => r.int(15).toString(16)).join(''));
  return { v: 1, w: W, h: H, mode, focal: r.int(3) === 0 ? null : r.int(W * H), rows: rows(), rows2: mode === 2 ? rows() : null };
}
const asBytes = ta => Buffer.from(ta.buffer, ta.byteOffset, ta.byteLength);

/* ================================================================ core load */
group('H-core-0', 'the eight core blocks, in order, each attached to SB', t => {
  t.same(CORE.blocks.map(b => b.id), ['core-ns', 'core-rng', 'core-palette', 'core-record', 'core-pipeline', 'core-reach', 'core-features', 'core-sim'], 'block order');
  for (const name of ['GRID', 'TUNING', 'K', 'BUILD', 'rng', 'record', 'pipeline']) t.ok(SB[name] !== undefined, 'SB.' + name + ' exists');
  t.ok(/^sb-[a-z0-9-]+$/.test(SB.BUILD), 'SB.BUILD has the stamp shape (' + SB.BUILD + ')');
});

/* ================================================================ rng */
group('H-rng-1', 'fnv1a32 known answers, continuation, the ASCII refusal', t => {
  t.eq(SB.rng.fnv1a32Str(''), 0x811c9dc5, 'fnv1a32Str("")');
  t.eq(SB.rng.fnv1a32Str('a'), 0xe40c292c, 'fnv1a32Str("a")');
  t.eq(SB.rng.fnv1a32(Buffer.from('a')), 0xe40c292c, 'fnv1a32 over the byte of "a"');
  t.eq(SB.rng.fnv1a32Str('shutterbug'), fnvRef(Buffer.from('shutterbug')), 'fnv1a32Str("shutterbug") equals the reference');
  const r = hrand(7);
  for (let k = 0; k < 50; k++) {
    const a = Buffer.from(Array.from({ length: r.int(40) }, () => r.int(256)));
    const b = Buffer.from(Array.from({ length: r.int(40) }, () => r.int(256)));
    t.eq(SB.rng.fnv1a32(b, SB.rng.fnv1a32(a)), fnvRef(Buffer.concat([a, b])), 'continued hash equals the hash of the concatenation, case ' + k);
  }
  t.throws(() => SB.rng.fnv1a32Str('café'), 'fnv1a32Str refuses a non ASCII string');
});

group('H-rng-2', 'mulberry32 known answers and a reference written in the test', t => {
  const m = SB.rng.mulberry32(1);
  t.eq(m.next(), 0.6270739405881613, 'mulberry32(1) first draw');
  t.eq(m.next(), 0.002735721180215478, 'mulberry32(1) second draw');
  for (const seed of [1, 42, 0xdeadbeef, 0x7fffffff, 0]) {
    const a = SB.rng.mulberry32(seed), b = mulberryRef(seed >>> 0);
    let agree = 0;
    for (let k = 0; k < 1000; k++) if (a.next() === b()) agree++;
    t.eq(agree, 1000, 'seed ' + seed + ': 1000 draws agree with the reference');
  }
});

group('H-rng-3', 'draws in [0, 1), state round trips, the state field step', t => {
  const m = SB.rng.mulberry32(99);
  let lo = 1, hi = 0, bad = 0;
  for (let k = 0; k < 100000; k++) { const v = m.next(); if (!(v >= 0 && v < 1)) bad++; if (v < lo) lo = v; if (v > hi) hi = v; }
  t.eq(bad, 0, '100k draws all in [0, 1)');
  t.ok(lo < 0.001 && hi > 0.999, '100k draws span the interval (' + lo + ' .. ' + hi + ')');
  const a = SB.rng.mulberry32(5); for (let k = 0; k < 17; k++) a.next();
  const b = SB.rng.mulberry32(0); b.seed(a.state());
  let same = 0; for (let k = 0; k < 100; k++) if (a.next() === b.next()) same++;
  t.eq(same, 100, 'seed(state()) continues the same sequence');
  const s = { r: 12345 }, c = SB.rng.mulberry32(12345);
  let match = 0; for (let k = 0; k < 100; k++) if (SB.rng.stepU32(s, 'r') === Math.round(c.next() * 4294967296)) match++;
  t.eq(match, 100, 'stepU32 on a state field walks the same sequence as mulberry32');
  t.eq(s.r, c.state(), 'stepU32 leaves the field equal to the generator state');
});

/* ================================================================ ns */
group('H-ns-1', 'K recomputed in the test from TUNING, and the known integers of section 1.4', t => {
  const T = SB.TUNING, G = SB.GRID, K = SB.K;
  /* the recomputation, written here from the plan's sentences, not copied from derive */
  for (const k of ['RUN', 'JUMP_V', 'JUMP_CUT_V', 'WALL_JUMP_V', 'WALL_JUMP_PUSH', 'STICKY_JUMP_V', 'DEEP_JUMP_V', 'TERMINAL'])
    t.ok(Number.isInteger(T[k] * 256), 'TUNING.' + k + ' * 256 is an integer (' + T[k] * 256 + ')');
  const want = {
    SUB: 256, CELL_SUB: G.CELL * 256, RUN: T.RUN * 256, DECEL: T.RUN * 256 / T.DECEL_FRAMES, G: T.GRAVITY * 256,
    JUMP_V: T.JUMP_V * 256, CUT_V: T.JUMP_CUT_V * 256, TERM: T.TERMINAL * 256, WALL_V: T.WALL_JUMP_V * 256,
    WALL_PUSH: T.WALL_JUMP_PUSH * 256, STICKY_V: T.STICKY_JUMP_V * 256, DASH_V: T.DASH_CELLS * G.CELL * 256 / T.DASH_FRAMES,
    DEEP_JUMP_V: T.DEEP_JUMP_V * 256, DEEP_FALL_G: Math.round(T.GRAVITY * 256 * T.DEEP_FALL_MULT),
    DEEP_TERM: Math.round(T.TERMINAL * 256 * T.DEEP_FALL_MULT), MOTH_V: Math.round(T.MOTH_SPEED * G.CELL * 256 / 60),
    CRAWLER_V: Math.round(T.CRAWLER_SPEED * G.CELL * 256 / 60), WORLD_W: G.W * G.CELL, WORLD_H: G.H * G.CELL
  };
  for (const k of Object.keys(T)) if (k.endsWith('_S') && typeof T[k] === 'number') want[k.slice(0, -2) + '_F'] = Math.round(T[k] * 60);
  for (const k of Object.keys(want)) t.eq(K[k], want[k], 'K.' + k + ' recomputed from TUNING');
  /* the known answers, hard coded from the plan: the code's derivation checked against the plan, not itself */
  const KNOWN = { SUB: 256, CELL_SUB: 4096, RUN: 672, DECEL: 168, G: 128, JUMP_V: 2200, CUT_V: 1300, TERM: 3072, WALL_V: 1950,
    WALL_PUSH: 672, DASH_V: 1536, DEEP_JUMP_V: 2432, DEEP_FALL_G: 102, DEEP_TERM: 2458, MOTH_V: 68, CRAWLER_V: 137,
    WORLD_W: 384, WORLD_H: 768, HIT_IFRAMES_F: 60, ICICLE_RESPAWN_F: 360, SPARK_HOP_F: 90, TRAP_PERIOD_F: 90,
    JUMP_SLOT_CD_F: 36, BOSS_TELEGRAPH_F: 48, BOSS_INTRO_F: 120 };
  for (const k of Object.keys(KNOWN)) t.eq(K[k], KNOWN[k], 'K.' + k + ' known answer');
  for (const k of Object.keys(K)) if (typeof K[k] === 'number') t.ok(Number.isInteger(K[k]), 'K.' + k + ' is an integer (' + K[k] + ')');
  t.same(SB.derive(T, G), K, 'derive is pure: a second call equals K');
  t.eq(SB.GRID, SB.GRID_PRESETS.A, 'GRID is preset A (24x48, ruled)');
});

group('H-ns-2', 'TUNING, K, GRID frozen to every nested value', t => {
  const walk = (o, p) => {
    t.ok(Object.isFrozen(o), p + ' is frozen');
    for (const k of Object.keys(o)) if (o[k] && typeof o[k] === 'object') walk(o[k], p + '.' + k);
  };
  walk(SB.TUNING, 'TUNING'); walk(SB.K, 'K'); walk(SB.GRID_PRESETS, 'GRID_PRESETS');
  t.throws(() => { SB.TUNING.FODDER_CELLS[0] = 9; }, 'TUNING.FODDER_CELLS[0] = 9 throws in strict mode');
  t.throws(() => { SB.TUNING.WEAPONS.J1.cells = 9; }, 'TUNING.WEAPONS.J1.cells = 9 throws');
  t.throws(() => { SB.K.RUN = 1; }, 'K.RUN = 1 throws');
  t.throws(() => { SB.GRID.W = 36; }, 'GRID.W = 36 throws');
});

/* ================================================================ record */
group('H-rec-1', 'JSON and packed round trips on 100 seeded grids per mode', t => {
  const r = hrand(2026);
  for (const mode of [0, 1, 2]) {
    let jsonOk = 0, packOk = 0, refOk = 0;
    for (let k = 0; k < 100; k++) {
      const j = randomRecordJSON(r, mode);
      const rec = SB.record.fromJSON(j);
      if (JSON.stringify(SB.record.toJSON(rec)) === JSON.stringify(j)) jsonOk++;
      const packed = SB.record.pack(rec);
      if (Buffer.compare(asBytes(packed), packRef(j)) === 0) refOk++;
      const back = SB.record.unpack(packed);
      if (back && JSON.stringify(SB.record.toJSON(back)) === JSON.stringify(j)) packOk++;
    }
    t.eq(jsonOk, 100, 'mode ' + mode + ': toJSON(fromJSON(x)) equals x');
    t.eq(refOk, 100, 'mode ' + mode + ': pack equals the packed form written from the plan\'s table');
    t.eq(packOk, 100, 'mode ' + mode + ': unpack(pack(r)) equals r');
  }
});

group('H-rec-2', 'the share string and URL lengths, base64url against Node\'s own', t => {
  const r = hrand(11), PREFIX = 'https://lucidwinds.com/satellites/shutterbug/#';
  const want = { 0: [582, 779, 825], 1: [582, 779, 825], 2: [1158, 1547, 1593] };
  for (const mode of [0, 1, 2]) {
    for (let k = 0; k < 5; k++) {
      const j = randomRecordJSON(r, mode), rec = SB.record.fromJSON(j), code = SB.record.encode(rec);
      t.eq(SB.record.pack(rec).length, want[mode][0], 'mode ' + mode + ' packs to ' + want[mode][0] + ' bytes');
      t.eq(code.length, want[mode][1], 'mode ' + mode + ' share string length');
      t.eq((PREFIX + code).length, want[mode][2], 'mode ' + mode + ' production URL length');
      t.eq(code, 'v1.' + packRef(j).toString('base64url'), 'mode ' + mode + ' share string equals v1. plus Node\'s base64url of the plan\'s packing');
      const back = SB.record.decode(code);
      t.ok(back && JSON.stringify(SB.record.toJSON(back)) === JSON.stringify(j), 'mode ' + mode + ' decode(encode(r)) equals r');
    }
  }
  for (let n = 0; n < 12; n++) {
    const bytes = Buffer.from(Array.from({ length: n }, (_, i) => (i * 37 + 11) & 255));
    t.eq(SB.rng.b64urlEncode(bytes), bytes.toString('base64url'), 'b64urlEncode of ' + n + ' bytes equals Node\'s');
    t.eq(Buffer.from(SB.rng.b64urlDecode(bytes.toString('base64url')) || []).toString('hex'), bytes.toString('hex'), 'b64urlDecode of ' + n + ' bytes round trips');
  }
});

group('H-rec-3', 'decode refuses every malformed code with null, never a throw', t => {
  const r = hrand(3);
  const base = randomRecordJSON(r, 0); base.focal = 100;
  const good = packRef(base);
  const code = b => 'v1.' + b.toString('base64url');
  t.ok(SB.record.decode(code(good)) !== null, 'the unbroken code decodes (control)');
  const cases = [];
  cases.push(['truncated by four characters', code(good).slice(0, -4)]);
  cases.push(['truncated by one byte', code(good.subarray(0, good.length - 1))]);
  { const b = Buffer.from(good); b[0] = 2; cases.push(['version 2 in the header', code(b)]); }
  cases.push(['a bad character', code(good).slice(0, 100) + '*' + code(good).slice(101)]);
  cases.push(['a non ASCII character', code(good).slice(0, 100) + 'é' + code(good).slice(101)]);
  { const b = Buffer.from(good); b.writeUInt16BE(SB.GRID.W * SB.GRID.H + 1, 4); cases.push(['focal out of range', code(b)]); }
  { const b = Buffer.from(good); b[1] = 23; cases.push(['w 23', code(b)]); }
  { const b = Buffer.from(good); b[2] = 47; cases.push(['h 47', code(b)]); }
  { const b = Buffer.from(good); b[3] = 3; cases.push(['mode 3', code(b)]); }
  { const b = Buffer.from(good); b[6 + 40] = 0xf3; cases.push(['a high nibble of 15', code(b)]); }
  { const b = Buffer.from(good); b[6 + 41] = 0x2f; cases.push(['a low nibble of 15', code(b)]); }
  { const b = Buffer.from(good); b[3] = 2; cases.push(['mode 2 with one grid', code(b)]); }
  cases.push(['version 2 prefix', 'v2.' + good.toString('base64url')]);
  cases.push(['empty', '']);
  cases.push(['not a string', null]);
  for (const [why, c] of cases) {
    let out, threw = false;
    try { out = SB.record.decode(c); } catch (e) { threw = true; }
    t.ok(!threw && out === null, 'decode refuses: ' + why);
  }
  let threw = 0, nonNull = 0;
  for (let k = 0; k < 1000; k++) {
    const s = Array.from({ length: r.int(900) }, () => String.fromCharCode(32 + r.int(95))).join('');
    try { if (SB.record.decode(s) !== null) nonNull++; } catch (e) { threw++; }
  }
  t.eq(threw, 0, '1000 random strings: decode never throws');
  t.eq(nonNull, 0, '1000 random strings: none decodes to a record');
  const bad = JSON.parse(JSON.stringify(base));
  bad.rows[5] = bad.rows[5].slice(0, 7) + 'f' + bad.rows[5].slice(8);
  t.ok(SB.record.validate(bad) !== null, 'validate refuses a row holding index 15');
  t.throws(() => SB.record.fromJSON(bad), 'fromJSON throws on an invalid record');
  const short = JSON.parse(JSON.stringify(base)); short.rows.pop();
  t.ok(SB.record.validate(short) !== null, 'validate refuses 47 rows');
  t.ok(SB.record.validate(Object.assign({}, base, { mode: 2 })) !== null, 'validate refuses mode 2 without rows2');
  t.ok(SB.record.validate(Object.assign({}, base, { rows2: base.rows })) !== null, 'validate refuses rows2 outside mode 2');
  t.ok(SB.record.validate(Object.assign({}, base, { focal: 1152 })) !== null, 'validate refuses focal 1152');
  t.ok(SB.record.validate(Object.assign({}, base, { v: 2 })) !== null, 'validate refuses v 2');
  t.eq(SB.record.validate(base), null, 'validate accepts the unbroken record (control)');
});

group('H-rec-4', 'seedOf: the grid and nothing else', t => {
  const r = hrand(4);
  for (let k = 0; k < 30; k++) {
    const j = randomRecordJSON(r, 0), rec = SB.record.fromJSON(j);
    const s0 = SB.record.seedOf(rec);
    t.eq(s0, fnvRef(asBytes(rec.pal)), 'seedOf equals FNV-1a over the raw index bytes, case ' + k);
    t.eq(SB.record.seedOf(SB.record.fromJSON(Object.assign({}, j, { mode: 1 }))), s0, 'mode does not change the seed, case ' + k);
    t.eq(SB.record.seedOf(SB.record.fromJSON(Object.assign({}, j, { focal: (j.focal || 0) + 1 }))), s0, 'focal does not change the seed, case ' + k);
    const flip = JSON.parse(JSON.stringify(j)), y = r.int(48), x = r.int(24), v = parseInt(flip.rows[y][x], 16);
    flip.rows[y] = flip.rows[y].slice(0, x) + ((v + 1) % 15).toString(16) + flip.rows[y].slice(x + 1);
    t.ok(SB.record.seedOf(SB.record.fromJSON(flip)) !== s0, 'one nibble changed changes the seed, case ' + k);
  }
  const j2 = randomRecordJSON(r, 2), rec2 = SB.record.fromJSON(j2);
  t.eq(SB.record.seedOf(rec2), fnvRef(asBytes(rec2.pal2), fnvRef(asBytes(rec2.pal))), 'mode 2: the hash continues over pal2');
});

/* ================================================================ palette */
/* the test's own colour maths, written from section 7's sentences */
const palRef = (() => {
  const hex = SB.palette.HEX;
  const rgb = hex.map(h => [...Buffer.from(h, 'hex')]);
  const L = rgb.map(([r, g, b]) => Math.round(0.299 * r + 0.587 * g + 0.114 * b));
  const S = rgb.map(c => { const mx = Math.max(...c), mn = Math.min(...c); return mx ? (mx - mn) / mx : 0; });
  const H = rgb.map(([r, g, b]) => {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    const h = mx === r ? 60 * (((g - b) / d) % 6) : mx === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4);
    return (Math.round(h) + 360) % 360;
  });
  const nearest = (r, g, b) => {
    let bi = 0, bd = Infinity;
    for (let i = 0; i < 15; i++) { const d = 0.3 * (r - rgb[i][0]) ** 2 + 0.59 * (g - rgb[i][1]) ** 2 + 0.11 * (b - rgb[i][2]) ** 2; if (d < bd - 1e-9) { bd = d; bi = i; } }
    return bi;
  };
  return { rgb, L, S, H, nearest };
})();

group('H-pal-1', 'sixteen entries, the hex round trip', t => {
  t.eq(SB.palette.HEX.length, 16, 'sixteen hexes');
  t.eq(SB.palette.RGB.length, 16, 'sixteen RGB triples');
  t.eq(SB.palette.NAMES.length, 16, 'sixteen names');
  for (let i = 0; i < 16; i++) {
    t.same(Array.from(SB.palette.RGB[i]), palRef.rgb[i], SB.palette.NAMES[i] + ' RGB parsed from its hex');
    t.eq(SB.palette.hex(SB.palette.RGB[i]), '#' + SB.palette.HEX[i], SB.palette.NAMES[i] + ' hex round trip');
  }
  t.eq(new Set(SB.palette.HEX).size, 16, 'no two entries share a hex');
});

group('H-pal-2', 'DESIGN 11\'s list, computed from the values', t => {
  const { L, S, H } = palRef;
  for (let i = 0; i < 16; i++) {
    t.eq(SB.palette.L[i], L[i], SB.palette.NAMES[i] + ' L (0.299 R + 0.587 G + 0.114 B)');
    t.ok(Math.abs(SB.palette.S1000[i] / 1000 - S[i]) < 0.0006, SB.palette.NAMES[i] + ' S (HSV saturation): core ' + SB.palette.S1000[i] / 1000 + ', test ' + S[i].toFixed(4));
    t.eq(SB.palette.H[i], H[i], SB.palette.NAMES[i] + ' H (HSV hue, degrees)');
  }
  const idx = f => [...Array(16).keys()].filter(f);
  const sat = i => S[i] > 0.35, names = a => a.map(i => SB.palette.NAMES[i]).join(', ');
  const want = [
    ['near blacks (L < 40)', idx(i => L[i] < 40), 2],
    ['near whites (L > 235)', idx(i => L[i] > 235), 2],
    ['greys (S < 0.12, 40 <= L <= 235)', idx(i => S[i] < 0.12 && L[i] >= 40 && L[i] <= 235), 3],
    ['brown (hue 10..40, S > 0.35, L < 100)', idx(i => sat(i) && H[i] >= 10 && H[i] <= 40 && L[i] < 100), 1],
    ['orange (hue 10..40, S > 0.35, L >= 100)', idx(i => sat(i) && H[i] >= 10 && H[i] <= 40 && L[i] >= 100), 1],
    ['red (hue under 10 or 345 and over, S > 0.35)', idx(i => sat(i) && (H[i] < 10 || H[i] >= 345)), 1],
    ['magenta (hue 290..345, S > 0.35)', idx(i => sat(i) && H[i] >= 290 && H[i] < 345), 1],
    ['blue (hue 200..260, S > 0.35)', idx(i => sat(i) && H[i] >= 200 && H[i] < 260), 1],
    ['teal (hue 160..200, S > 0.35)', idx(i => sat(i) && H[i] >= 160 && H[i] < 200), 1],
    ['green (hue 70..160, S > 0.35)', idx(i => sat(i) && H[i] >= 70 && H[i] < 160), 1],
    ['yellow (hue 40..70, S > 0.35)', idx(i => sat(i) && H[i] > 40 && H[i] < 70), 1],
    ['film tab cream (200 < L < 235, 0.2 < S < 0.35)', idx(i => L[i] > 200 && L[i] < 235 && S[i] > 0.2 && S[i] < 0.35), 1]
  ];
  for (const [what, got, n] of want) t.eq(got.length, n, what + ': ' + (names(got) || 'none'));
  t.eq(idx(i => L[i] > 200 && L[i] < 235 && S[i] > 0.2 && S[i] < 0.35)[0], 15, 'the cream is index 15, the reserved repair colour');
});

group('H-pal-5', 'nearest: idempotent, never 15, the anchors, the ramp, and the test\'s own weighted distance', t => {
  const n = SB.palette.nearest;
  for (let i = 0; i < 15; i++) t.eq(n(...palRef.rgb[i]), i, 'nearest(' + SB.palette.NAMES[i] + ') is itself');
  t.ok(n(...palRef.rgb[15]) !== 15, 'nearest(Film) is not Film (index 15 is never quantized; got ' + SB.palette.NAMES[n(...palRef.rgb[15])] + ')');
  t.eq(n(255, 0, 0), 9, 'pure red is Brick');
  t.eq(n(255, 255, 255), 6, 'pure white is Glare');
  t.eq(n(0, 0, 0), 0, 'pure black is Ink');
  let prev = -1, mono = true;
  for (let k = 0; k < 64; k++) { const v = Math.round(k * 255 / 63), q = n(v, v, v); if (palRef.L[q] < prev) mono = false; prev = palRef.L[q]; }
  t.ok(mono, 'a 64 step black to white ramp quantizes to non decreasing L');
  /* the oracle: the weighted distance written here; the unweighted metric disagrees on about a fifth of colours */
  const r = hrand(1313); let agree = 0, fifteen = 0, first = null;
  for (let k = 0; k < 20000; k++) {
    const c = [r.int(256), r.int(256), r.int(256)], a = n(...c), b = palRef.nearest(...c);
    if (a === b) agree++; else if (!first) first = c.join(',') + ' core ' + a + ' test ' + b;
    if (a === 15) fifteen++;
  }
  t.eq(agree, 20000, '20000 seeded colours: nearest equals the test\'s weighted distance' + (first ? ' (first miss ' + first + ')' : ''));
  t.eq(fifteen, 0, '20000 seeded colours: nearest never returns 15');
});

group('H-pal-6', 'SAT is the computed S over 0.35; the bands follow the hues of section 7.2', t => {
  const computed = [...Array(16).keys()].filter(i => palRef.S[i] > 0.35);
  t.same(Array.from(SB.palette.SAT), computed, 'SAT equals the entries with S over 0.35');
  const band = h => (h >= 10 && h < 70) ? 0 : (h >= 300 || h < 10) ? 4 : (h >= 160 && h < 260) ? 2 : (h >= 70 && h < 160) ? 3 : -1;
  for (let i = 0; i < 16; i++) {
    const want = computed.includes(i) ? band(palRef.H[i]) : -1;
    t.eq(SB.palette.BAND[i], want, SB.palette.NAMES[i] + ' band (' + (want < 0 ? 'never votes' : SB.palette.BIOMES[want]) + ')');
  }
});

/* ================================================================ pipeline A */
/* the test's own pipeline A, written from DESIGN 6.3 and 6.4, not from the core */
const pipeRef = (() => {
  const Lof = SB.palette.L;
  /* DESIGN's own numbers, typed here (law 2): 6.3 "clamped to [70, 140]", "two passes"; 6.4 "> 60", "runs of >= 3" */
  const DESIGN = { OTSU_MIN: 70, OTSU_MAX: 140, SMOOTH_PASSES: 2, EDGE_DROP_L: 60, PLATFORM_RUN_MIN: 3 };
  /* Otsu, exactly: every integer threshold t (solid is L < t), the between class variance compared as exact
     fractions in BigInt, the first maximum wins (the lowest threshold), then the clamp */
  function otsu(pal) {
    const T = DESIGN, hist = new Array(256).fill(0);
    for (const v of pal) hist[Lof[v]]++;
    let best = null, bestT = T.OTSU_MIN;
    const N = BigInt(pal.length);
    let w0 = 0n, s0 = 0n, sum = 0n;
    for (let l = 0; l < 256; l++) sum += BigInt(hist[l] * l);
    for (let t = 1; t <= 256; t++) {
      w0 += BigInt(hist[t - 1]); s0 += BigInt(hist[t - 1] * (t - 1));
      const w1 = N - w0; if (w0 === 0n || w1 === 0n) continue;
      const num = (s0 * w1 - (sum - s0) * w0) ** 2n, den = w0 * w1;      /* variance times N^2, as num / den */
      if (!best || num * best.den > best.num * den) { best = { num, den }; bestT = t; }
    }
    return Math.max(T.OTSU_MIN, Math.min(T.OTSU_MAX, bestT));
  }
  function smooth(s, w, h) {
    const o = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      let n = 0; const me = s[y * w + x];
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        n += (xx < 0 || yy < 0 || xx >= w || yy >= h) ? me : s[yy * w + xx];
      }
      o[y * w + x] = n >= 5 ? 1 : 0;
    }
    return o;
  }
  function solidity(j, mode) {
    const w = j.w, rows = mode === 2 ? j.rows2.concat(j.rows) : j.rows, h = rows.length;
    const pal = []; for (const r of rows) for (const c of r) pal.push(parseInt(c, 16));
    const T = otsu(pal);
    let s = Uint8Array.from(pal, v => (Lof[v] < T ? 1 : 0));
    for (let k = 0; k < DESIGN.SMOOTH_PASSES; k++) s = smooth(s, w, h);
    if (mode === 1) s = s.map(v => 1 - v);
    for (let x = 0; x < w; x++) { s[x] = 0; s[(h - 1) * w + x] = 1; }
    return { w, h, pal, T, solid: s };
  }
  /* DESIGN 6.4: surfaces over open cells with a luminance drop over 60, runs of at least 3 */
  function plats(r) {
    const { w, h, pal, solid } = r, out = new Uint8Array(w * h);
    for (let y = 0; y < h - 1; y++) {
      let run = [];
      const flush = () => { if (run.length >= DESIGN.PLATFORM_RUN_MIN) for (const i of run) out[i] = 1; run = []; };
      for (let x = 0; x < w; x++) {
        const a = y * w + x, b = a + w;
        if (!solid[a] && !solid[b] && Lof[pal[a]] - Lof[pal[b]] > DESIGN.EDGE_DROP_L) run.push(b); else flush();
      }
      flush();
    }
    return out;
  }
  /* the ceiling light and the exit candidate: open cells over 200 in the top 4 rows, 4 connected; the light has the
     highest peak L, ties to the larger cluster, then the lowest first cell; the exit is the light's lowest standable
     row at its lowest index, else the brightest standable cell of the first top row that has one (lowest index) */
  function exitOf(lv) {
    const w = lv.w, rows = 4, inTop = i => i < rows * w && !lv.solid[i] && Lof[lv.pal[i]] > 200;
    const st = i => i + w < w * lv.h && !lv.solid[i] && (lv.solid[i + w] || lv.plat[i + w]);
    const seen = new Set(), clusters = [];
    for (let i = 0; i < rows * w; i++) {
      if (!inTop(i) || seen.has(i)) continue;
      const c = [], q = [i]; seen.add(i);
      while (q.length) { const j = q.pop(); c.push(j); for (const k of [j - 1, j + 1, j - w, j + w]) { if (k < 0 || k >= rows * w || seen.has(k) || !inTop(k)) continue; if ((k === j - 1 || k === j + 1) && Math.floor(k / w) !== Math.floor(j / w)) continue; seen.add(k); q.push(k); } }
      c.sort((a, b) => a - b); clusters.push(c);
    }
    let light = null;
    for (const c of clusters) {
      const peak = Math.max(...c.map(i => Lof[lv.pal[i]]));
      if (!light) { light = { c, peak }; continue; }
      if (peak > light.peak || (peak === light.peak && (c.length > light.c.length || (c.length === light.c.length && c[0] < light.c[0])))) light = { c, peak };
    }
    if (light) {
      const ok = light.c.filter(st);
      if (ok.length) { const row = Math.max(...ok.map(i => Math.floor(i / w))); return Math.min(...ok.filter(i => Math.floor(i / w) === row)); }
    }
    for (let y = 0; y < rows; y++) {
      let best = -1;
      for (let x = 0; x < w; x++) { const i = y * w + x; if (st(i) && (best < 0 || Lof[lv.pal[i]] > Lof[lv.pal[best]])) best = i; }
      if (best >= 0) return best;
    }
    return -1;
  }
  return { otsu, smooth, solidity, plats, exitOf, DESIGN };
})();
function platformRuns(lv) {
  let n = 0;
  for (let y = 0; y < lv.h; y++) for (let x = 0; x < lv.w; x++) if (lv.plat[y * lv.w + x] && (x === 0 || !lv.plat[y * lv.w + x - 1])) n++;
  return n;
}
const built = {};      /* fixture name + mode -> level, built once */
function buildFx(f, mode) {
  const k = f.name + '@' + mode;
  if (!(k in built)) built[k] = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), {});
  return built[k];
}
const MODES = [0, 1];
const standableIn = (lv, i) => i >= 0 && i + lv.w < lv.w * lv.h && !lv.solid[i] && (lv.solid[i + lv.w] || lv.plat[i + lv.w]);
/* a lab grid: rows of palette characters ('4' Ash and so on), padded to the grid with Ash */
function labRecord(rows) {
  const W = SB.GRID.W, H = SB.GRID.H, out = [];
  for (let y = 0; y < H; y++) out.push(((rows[y] || '') + '4'.repeat(W)).slice(0, W));
  return SB.record.fromJSON({ v: 1, w: W, h: H, mode: 0, focal: null, rows: out, rows2: null });
}

group('H-pipe-1', 'the floor row solid and the top row open on every fixture and mode', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) { t.ok(lv.why === 'unreachable', f.name + ' mode ' + mode + ': needsCrop only as unreachable here (' + lv.why + ')'); continue; }
    let floor = true, top = true;
    for (let x = 0; x < lv.w; x++) { if (!lv.solid[(lv.h - 1) * lv.w + x]) floor = false; if (lv.solid[x]) top = false; }
    t.ok(floor, f.name + ' mode ' + mode + ': bottom row solid');
    t.ok(top, f.name + ' mode ' + mode + ': top row open');
  }
});

group('H-pipe-2', 'the checkerboard smooths to under 10% isolated cells; solidity equals the test\'s own two pass smoothing', t => {
  const lv = buildFx(fixture('checkerboard'), 0);
  let iso = 0;
  for (let y = 1; y < lv.h - 1; y++) for (let x = 0; x < lv.w; x++) {
    const me = lv.solid[y * lv.w + x]; let same = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < lv.w && lv.solid[yy * lv.w + xx] === me) same = true; }
    if (!same) iso++;
  }
  t.ok(iso / (lv.w * lv.h) < 0.10, 'checkerboard: ' + (100 * iso / (lv.w * lv.h)).toFixed(1) + '% isolated cells after smoothing (under 10%)');
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv2 = buildFx(f, mode);
    if (lv2.needsCrop) continue;
    const ref = pipeRef.solidity(f.fx.record, mode);
    let diff = 0; for (let i = 0; i < ref.solid.length; i++) if (ref.solid[i] !== lv2.solid[i]) diff++;
    t.eq(diff, 0, f.name + ' mode ' + mode + ': cells where solidity differs from the test\'s threshold and two pass smoothing', diff ? SB.pipeline.toText(lv2) : undefined);
  }
});

group('H-pipe-3', 'all-dark and all-light stand on row h-2; the threshold is the exact Otsu, inside the clamp, on every fixture', t => {
  for (const name of ['all-dark', 'all-light']) {
    const lv = buildFx(fixture(name), 0);
    let n = 0; for (let x = 0; x < lv.w; x++) if (standableIn(lv, (lv.h - 2) * lv.w + x)) n++;
    t.ok(!lv.needsCrop && n > 0, name + ': ' + n + ' standable cells on row h-2');
  }
  for (const f of FIXTURES) {
    const lv = buildFx(f, 0), want = pipeRef.solidity(f.fx.record, 0).T;
    t.ok(lv.otsuT >= 70 && lv.otsuT <= 140, f.name + ': threshold ' + lv.otsuT + ' inside DESIGN 6.3\'s clamp [70, 140]');
    t.eq(lv.otsuT, want, f.name + ': threshold equals the test\'s exact Otsu');
  }
});

group('H-pipe-4', 'one way platforms: open, runs of at least 3, never under a solid, exactly DESIGN 6.4', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    let bad = 0, shortRun = 0, underSolid = 0;
    for (let i = 0; i < lv.w * lv.h; i++) if (lv.plat[i]) { if (lv.solid[i]) bad++; if (i >= lv.w && lv.solid[i - lv.w]) underSolid++; }
    for (let y = 0; y < lv.h; y++) { let run = 0; for (let x = 0; x <= lv.w; x++) { const p = x < lv.w && lv.plat[y * lv.w + x]; if (p) run++; else { if (run && run < 3) shortRun++; run = 0; } } }
    t.eq(bad, 0, f.name + ' mode ' + mode + ': plat cells that are solid');
    t.eq(shortRun, 0, f.name + ' mode ' + mode + ': plat runs shorter than 3');
    t.eq(underSolid, 0, f.name + ' mode ' + mode + ': plat cells under a solid cell');
    const ref = pipeRef.plats(pipeRef.solidity(f.fx.record, mode));
    let diff = 0; for (let i = 0; i < ref.length; i++) if (ref[i] !== lv.plat[i]) diff++;
    t.eq(diff, 0, f.name + ' mode ' + mode + ': plat cells that differ from the test\'s own DESIGN 6.4', diff ? SB.pipeline.toText(lv) : undefined);
  }
  /* lab: a 2 wide plank makes no platform, a 3 wide one does */
  const two = SB.pipeline.build(labRecord({ 20: '4444455444445554', 21: '4444433444443334' }), {});
  t.eq(two.plat[21 * 24 + 5] + two.plat[21 * 24 + 6], 0, 'lab: a 2 wide lit plank makes no platform');
  t.eq(two.plat[21 * 24 + 12] + two.plat[21 * 24 + 13] + two.plat[21 * 24 + 14], 3, 'lab: a 3 wide lit plank (x 12..14) makes a 3 wide platform');
  /* DESIGN 6.4 says over 60: Ash 199 over Pewter 139 is exactly 60 and makes nothing; Paper 239 over Pewter makes one */
  const sixty = SB.pipeline.build(labRecord({ 20: '444444444445554444444444', 21: '444333444443334444444444' }), {});
  t.eq(sixty.plat[21 * 24 + 3] + sixty.plat[21 * 24 + 4] + sixty.plat[21 * 24 + 5], 0, 'lab: Ash over Pewter, a drop of exactly 60, is no platform (DESIGN: over 60)');
  t.eq(sixty.plat[21 * 24 + 11] + sixty.plat[21 * 24 + 12] + sixty.plat[21 * 24 + 13], 3, 'lab: Paper over Pewter beside it, a drop of 100, is a platform');
});

group('H-pipe-5', 'landmarks: at most 3, each at least 8 cells, by size, disjoint; the giant is one block of its drawn size', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    const L = lv.landmarks, where = f.name + ' mode ' + mode;
    t.ok(L.length <= 3, where + ': ' + L.length + ' landmarks (at most 3)');
    const seen = new Set(); let overlap = 0, ok = true;
    L.forEach((l, k) => {
      if (l.size < 8 || l.size !== l.cells.length) ok = false;
      if (k && L[k - 1].size < l.size) ok = false;
      for (const c of l.cells) { if (seen.has(c)) overlap++; seen.add(c); if (!lv.solid[c]) ok = false; }
    });
    t.ok(ok, where + ': every landmark at least 8 solid cells, sorted by size');
    t.eq(overlap, 0, where + ': landmarks share no cell');
  }
  const three = SB.pipeline.build(labRecord({ 40: '411114444111144441111444', 41: '411114444111144441111444', 42: '411114444111144441111444',
    43: '411114444111144441111444', 44: '411114444111144441111444', 45: '411114444111144441111444', 46: '411114444111144441111444' }), {});
  t.eq(three.landmarks.length, 3, 'three separate blocks standing on the floor are three landmarks (sizes ' + three.landmarks.map(l => l.size).join('/') + '): the floor row joins nothing (Q58)');
  t.ok(three.landmarks.every(l => l.bbox[3] < three.h - 1), 'no landmark reaches into the floor row');
  /* DESIGN 6.5 is 4 connected: two blocks that meet only at a corner are two landmarks */
  const diag = SB.pipeline.build(labRecord({ 10: '411114444444444444444444', 11: '411114444444444444444444', 12: '411114444444444444444444', 13: '411114444444444444444444',
    14: '444441111444444444444444', 15: '444441111444444444444444', 16: '444441111444444444444444', 17: '444441111444444444444444' }), {});
  t.eq(diag.landmarks.length, 2, 'two blocks meeting only at a corner are two landmarks (4 connected; sizes ' + diag.landmarks.map(l => l.size).join('/') + ')');
  const g = fixture('one-giant-landmark').fx.expect.giant;
  const drawn = (g.x1 - g.x0 + 1) * (g.y1 - g.y0 + 1);
  const lv = buildFx(fixture('one-giant-landmark'), 0);
  /* a rectangle's corner sees four solids of nine and erodes; an edge cell sees six and stays: drawn minus 4 */
  const big = lv.landmarks.filter(l => l.size === drawn - 4);
  t.eq(big.length, 1, 'one-giant-landmark: exactly one landmark of the drawn ' + drawn + ' cells less its 4 corners (sizes ' + lv.landmarks.map(l => l.size).join('/') + ')');
  if (big.length) t.same(Array.from(big[0].bbox), [g.x0, g.y0, g.x1, g.y1], 'one-giant-landmark: its bounding box is the drawing\'s');
});

group('H-pipe-6', 'spawn is standable and on the standing row above the floor', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    t.eq(Math.floor(lv.spawn / lv.w), lv.h - 2, f.name + ' mode ' + mode + ': spawn row');
    t.ok(standableIn(lv, lv.spawn), f.name + ' mode ' + mode + ': spawn is standable');
  }
  const lv = buildFx(fixture('sample-room'), 0);
  t.eq(lv.spawn, 46 * 24 + 15, 'the sample room spawns at (15, 46), the centre of the floor\'s widest open run (x 8..23)');
});

group('H-pipe-7', 'Negative: solid and open swap after smoothing, before the frame rules and the platforms', t => {
  const f = fixture('sample-room'), pos = buildFx(f, 0), neg = buildFx(f, 1);
  let flipped = 0, rows = 0;
  for (let y = 1; y < pos.h - 1; y++) for (let x = 0; x < pos.w; x++) { rows++; if (neg.solid[y * pos.w + x] === 1 - pos.solid[y * pos.w + x]) flipped++; }
  t.eq(flipped, rows, 'every cell of rows 1..h-2 is inverted in Negative');
  let floor = 0, top = 0; for (let x = 0; x < pos.w; x++) { floor += neg.solid[(pos.h - 1) * pos.w + x]; top += neg.solid[x]; }
  t.eq(floor, pos.w, 'Negative keeps the floor row solid');
  t.eq(top, 0, 'Negative keeps the top row open');
  const ref = pipeRef.plats(pipeRef.solidity(f.fx.record, 1));
  let diff = 0; for (let i = 0; i < ref.length; i++) if (ref[i] !== neg.plat[i]) diff++;
  t.eq(diff, 0, 'Negative platforms are found on the inverted grid (cells that differ from the test\'s)');
  t.eq(neg.negative, 1, 'the level says negative');
});

group('H-pipe-8', 'determinism: the level hash over FIELDS is stable, cross realm, and moves with every field', t => {
  for (const f of FIXTURES) {
    const rec = SB.record.fromJSON(f.fx.record);
    const a = SB.pipeline.levelHash(SB.pipeline.build(rec, {}));
    t.eq(SB.pipeline.levelHash(SB.pipeline.build(rec, {})), a, f.name + ': a second build hashes equal');
    t.eq(SB.pipeline.levelHash(SB.pipeline.build(SB.record.fromJSON(f.fx.record), {})), a, f.name + ': a fresh record hashes equal');
    t.eq(SB.pipeline.levelHash(SB.pipeline.build(structuredClone(rec), {})), a, f.name + ': a structured clone from the harness realm hashes equal');
  }
  /* the fields section 2.2 pins, in its order, typed here and compared with the page's declaration */
  const PLAN = ['w', 'h', 'seed', 'biome', 'negative', 'otsuT', 'solid', 'plat', 'tab', 'slick', 'sticky', 'trap', 'spawn', 'exit',
    'beacon.idx', 'beacon.cells', 'landmarks', 'ascent.nodes', 'features.specks', 'features.chest', 'features.scroll',
    'features.blueprint', 'features.enemies', 'features.trap', 'features.door', 'features.boss', 'repair.tabs', 'degraded'];
  t.same(SB.pipeline.FIELDS.map(f => f[0]), PLAN, 'pipeline.FIELDS is the plan\'s list, every field in its order');
  const lv = SB.pipeline.build(SB.record.fromJSON(fixture('sample-room').fx.record), {});
  const base = SB.pipeline.levelHash(lv);
  for (const [name, type] of SB.pipeline.FIELDS) {
    const c = Object.assign({}, lv, { beacon: Object.assign({}, lv.beacon), features: Object.assign({}, lv.features), repair: Object.assign({}, lv.repair), ascent: lv.ascent ? Object.assign({}, lv.ascent) : { nodes: [] } });
    const parts = name.split('.'), key = parts.pop(), holder = parts.reduce((o, p) => o[p], c);
    const v = holder[key];
    if (type === 'i32') holder[key] = (v === null || v === undefined ? -1 : v) + 1;
    else if (type === 'grid') { const g2 = Uint8Array.from(v); g2[g2.length >> 1] ^= 1; holder[key] = g2; }
    else if (type === 'lists') holder[key] = (v || []).concat([{ cells: [1, 2, 3] }]);
    else if (type === 'enemies') holder[key] = (v || []).concat([{ kind: 1, idx: 5 }]);
    else if (type === 'idx') holder[key] = (v === null || v === undefined ? -1 : (typeof v === 'object' ? v.idx : v)) + 1;
    else holder[key] = Array.from(v || []).concat([7]);
    t.ok(SB.pipeline.levelHash(c) !== base, 'perturbing ' + name + ' (' + type + ') changes the level hash');
  }
});

group('H-pipe-9', 'every fixture\'s authored platformsMin and landmarksMin hold', t => {
  for (const f of FIXTURES) {
    const e = f.fx.expect, lv = buildFx(f, 0);
    if (e.needsCrop) continue;
    if (e.platformsMin !== null) t.ok(platformRuns(lv) >= e.platformsMin, f.name + ': ' + platformRuns(lv) + ' one way runs (at least ' + e.platformsMin + ')', SB.pipeline.toText(lv));
    if (e.landmarksMin !== null) t.ok(lv.landmarks.length >= e.landmarksMin, f.name + ': ' + lv.landmarks.length + ' landmarks (at least ' + e.landmarksMin + ')', SB.pipeline.toText(lv));
  }
  const lv = buildFx(fixture('sample-room'), 0);
  const bookshelf = lv.landmarks.find(l => l.bbox[0] === 0 && l.bbox[1] >= 26 && l.bbox[3] <= 39);
  t.ok(!!bookshelf, 'the sample room\'s bookshelf (left wall, rows 27..38) is a landmark');
  const bed = lv.landmarks.find(l => l.bbox[0] === 0 && l.bbox[1] >= 44 && l.bbox[3] === lv.h - 2);
  t.ok(!!bed, 'the sample room\'s bed (bottom left, rows 45..46) is a landmark of its own, not the floor');
  t.eq(lv.exit, 3 * 24 + 13, 'the sample room\'s exit candidate stands in the lamp\'s shade (13, 3)');
});

group('H-pipe-12', 'the light is the cluster with the brightest cell; the beacon relights it only when the exit stands in it', t => {
  const lv = buildFx(fixture('sample-room'), 0);
  t.ok(lv.beacon.cells.length > 0 && Array.from(lv.beacon.cells).includes(lv.exit), 'the sample room: the exit stands in the lamp, so the lamp\'s ' + lv.beacon.cells.length + ' cells are relit');
  /* a hanging lamp (Glare over Ash, a drop of 52: nothing under it to stand on) and an Ash shelf over Slate elsewhere */
  const hang = SB.pipeline.build(labRecord({ 1: '444444444466444444444444', 2: '444444444466444444444444', 3: '444444444444444422222444' }), {});
  t.eq(hang.exit, 2 * 24 + 16, 'a hanging lamp with nothing under it: the exit falls back to the shelf (16, 2)');
  t.eq(hang.beacon.cells.length, 0, 'and the lamp stays backdrop: no beacon cells relit away from the exit');
  /* a small Glare lamp (peak 251) and a bigger Paper patch (239), each over a Pewter shadow */
  const two = SB.pipeline.build(labRecord({ 0: '444444444444445555554444', 1: '444666444444445555554444', 2: '444666444444445555554444', 3: '444333444444443333334444' }), {});
  const exitX = two.exit % 24;
  t.ok(exitX >= 3 && exitX <= 5, 'a 3x2 Glare lamp beats a bigger 6x3 Paper patch: the light is the lamp (exit at x ' + exitX + ', Q59)');
  /* ties: two standable clusters both peaking at Glare (each 3 or more wide over a Pewter shadow, so the light's choice
     decides the exit): the larger wins; at equal size the one with the lower first cell */
  const tie = SB.pipeline.build(labRecord({ 1: '466644444445555566444444', 2: '466644444445555555444444', 3: '433344444443333333444444' }), {});
  t.ok(tie.exit >= 0 && tie.exit % 24 >= 11 && tie.exit % 24 <= 17, 'two clusters that both peak at Glare: the larger (a 7x2 Paper patch with a Glare corner, not the 3x2 lamp) is the light (exit x ' + (tie.exit % 24) + ')');
  const twin = SB.pipeline.build(labRecord({ 1: '466644444444446664444444', 2: '466644444444446664444444', 3: '433344444444443334444444' }), {});
  t.ok(twin.exit >= 0 && twin.exit % 24 >= 1 && twin.exit % 24 <= 3, 'two equal 3x2 Glare lamps: the one whose first cell comes first is the light (exit x ' + (twin.exit % 24) + ')');
  /* the window is the top EXIT_ROWS (4) rows: a standable lamp in row 4 is not a ceiling light; the exit falls back to
     the Ash shelf (17, 2) */
  const low = SB.pipeline.build(labRecord({ 4: '444444466644444444444444', 5: '444444433344444444444444', 3: '444444444444444442222244' }), {});
  t.eq(low.beacon.cells.length, 0, 'a Glare lamp in row 4, under the top four rows, is not the light (no cells relit)');
  t.eq(low.exit, 2 * 24 + 17, 'and the exit is the fallback, the shelf at (17, 2), not the lamp');
  /* no light at all: of the standable cells in the first row that has one, the brightest (Ash 199 over the right block,
     not Pewter 139 over the left one) */
  const dim = SB.pipeline.build(labRecord({ 2: '333333444444444444444444', 3: '111111444444444111111444', 4: '111111444444444111111444', 5: '111111444444444111111444' }), {});
  t.ok(dim.exit >= 0 && Math.floor(dim.exit / 24) === 2 && SB.palette.L[dim.rec.pal[dim.exit]] === 199, 'with no light, the exit is the brightest standable cell of the first row that has one (Ash, L ' + (dim.exit >= 0 ? SB.palette.L[dim.rec.pal[dim.exit]] : '-') + ')');
  t.eq(dim.exit, pipeRef.exitOf(dim), 'and it equals the test\'s own rule');
  /* the fixtures where peaks tie: the test's own rule picks the same exit */
  for (const name of ['all-light', 'checkerboard', 'sample-room']) {
    const lv = buildFx(fixture(name), 0);
    t.eq(lv.exit, pipeRef.exitOf(lv), name + ': the exit equals the test\'s own rule (the peak, ties to the larger then the lowest first cell; in the light its lowest standable row, lowest index; else the brightest standable top row cell)');
  }
});

group('H-pipe-10', 'pipeline A builds in under 20 ms p95 per fixture in Node', t => {
  let slow = null;
  for (const f of FIXTURES) {
    const rec = SB.record.fromJSON(f.fx.record), ts = [];
    for (let k = 0; k < 20; k++) { const t0 = process.hrtime.bigint(); SB.pipeline.build(rec, {}); ts.push(Number(process.hrtime.bigint() - t0) / 1e6); }
    ts.sort((a, b) => a - b);
    const p95 = ts[Math.floor(ts.length * 0.95) - 1];
    if (!slow || p95 > slow.p95) slow = { name: f.name, p95 };
    t.ok(p95 < 20, f.name + ': build p95 ' + p95.toFixed(2) + ' ms (under 20)');
  }
  console.log('  info  the slowest pipeline A build: ' + slow.name + ' at ' + slow.p95.toFixed(2) + ' ms p95');
});

group('H-pipe-11', 'ties break to the lowest: Otsu, landmarks, spawn runs, nearest', t => {
  /* Otsu: Brick 93, Moss 116, Pewter 139 in equal thirds: the splits after 93 and after 116 have exactly equal
     between class variance (both class means differ by 34.5), so the lower threshold, 94, wins */
  const third = 1152 / 3, cells = [];
  for (let i = 0; i < 1152; i++) cells.push(i < third ? 9 : i < 2 * third ? 13 : 3);
  t.eq(SB.pipeline.otsu(Uint8Array.from(cells), 1152, SB.TUNING), 94, 'Otsu: a planted two way tie takes the lower threshold');
  /* landmarks: two equal 4x4 blocks; the one whose first cell comes first wins the tie */
  const lab = SB.pipeline.build(labRecord({ 10: '4441111444441111', 11: '4441111444441111', 12: '4441111444441111', 13: '4441111444441111' }), {});
  const eq = lab.landmarks.filter(l => l.size === 12);
  t.eq(eq.length, 2, 'two equal 4x4 blocks are two 12 cell landmarks (sizes ' + lab.landmarks.map(l => l.size).join('/') + ')');
  if (eq.length === 2) t.ok(lab.landmarks.indexOf(eq[0]) < lab.landmarks.indexOf(eq[1]) && eq[0].cells[0] < eq[1].cells[0], 'the equal landmark with the lower first cell is listed first');
  /* spawn: two 3 tall Soot blocks (x 6..8 and 15..17) on a Soot floor. Smoothing fills the standing row cell beside
     each block (the floor's three votes and the block's two make five), so the runs are x 0..4, 10..13 and 19..23:
     two equal widest at the edges, and the left one wins, centred at x 2 */
  const blocks = '444444111444444111444444';
  const sp = SB.pipeline.build(labRecord({ 44: blocks, 45: blocks, 46: blocks, 47: '1'.repeat(24) }), {});
  t.eq(sp.spawn, 46 * 24 + 2, 'spawn: of two equal widest runs (x 0..4 and 19..23), the first, centred at x 2');
  /* nearest: the exact midpoint of Ink and Soot is equidistant; Ink, the lower index, wins */
  t.eq(SB.palette.nearest(21, 18, 22), 0, 'nearest: equidistant to Ink and Soot, Ink wins');
});

/* ================================================================ the sim, part one */
/* LABS.room(lines): a Level built straight from text, bypassing the pipeline, so a claim is tested on a room a person
   can read (section 3.9): # solid, = one way top, | sticky (solid), ~ slick one way, . open, S start, X target.
   The lines sit at the bottom of a 24 x 48 grid with open rows above; a line shorter than 24 is padded open. */
const LABS = {
  room(lines, opts = {}) {
    const W = SB.GRID.W, H = SB.GRID.H;
    const rows = Array(H - lines.length).fill('').concat(lines).map(l => (l + '.'.repeat(W)).slice(0, W));
    const n = W * H, z = () => new Uint8Array(n), solid = z(), plat = z(), sticky = z(), slick = z();
    let S = -1, X = -1;
    rows.forEach((row, y) => [...row].forEach((c, x) => {
      const i = y * W + x;
      if (c === '#') solid[i] = 1; else if (c === '=') plat[i] = 1; else if (c === '|') { solid[i] = 1; sticky[i] = 1; }
      else if (c === '~') { plat[i] = 1; slick[i] = 1; } else if (c === 'S') S = i; else if (c === 'X') X = i;
    }));
    return { w: W, h: H, solid, plat, tab: z(), slick, sticky, trap: z(), spawn: S, exit: opts.exit ? X : -1, target: X,
      seed: 1, biome: opts.biome || 0, negative: 0, rows };
  },
  cell(lv, i) { return [i % lv.w, Math.floor(i / lv.w)]; }
};
const IN = SB.sim.IN, K = SB.K, CS = K.CELL_SUB, HW = K.HERO_W_SUB, HH = K.HERO_H_SUB;
const FLOOR = '#'.repeat(24);
/* run a script of words (a function of the step index) and record what the test needs */
function play(lv, words, n, opts) {
  const s = SB.sim.create(lv, opts || {}), trace = [];
  for (let f = 0; f < n; f++) {
    const before = { x: s.hero.x, y: s.hero.y, vy: s.hero.vy, ground: s.hero.ground };
    SB.sim.step(s, words(f));
    trace.push({ f, before, x: s.hero.x, y: s.hero.y, vx: s.hero.vx, vy: s.hero.vy, ground: s.hero.ground });
  }
  return { s, trace };
}
const settle = lv => { const s = SB.sim.create(lv); for (let k = 0; k < 4; k++) SB.sim.step(s, 0); return s; };

/* the test's own jump, stepped from TUNING by the plan's sentence (v += g, then y += v), not from the sim */
function jumpRef(v0, holdFrames) {
  const T = SB.TUNING, g = T.GRAVITY * 256, cut = T.JUMP_CUT_V * 256, term = T.TERMINAL * 256;
  let vy = -v0 * 256, y = 0, top = 0, f = 0;
  for (;;) {
    if (f > 0 && f >= holdFrames && vy < -cut) vy = -cut;
    vy = Math.min(term, vy + g); y += vy; f++;
    if (y < top) top = y;
    if (y >= 0) return { apex: -top / 256, frames: f };
  }
}

group('H-sim-1', 'the jump: apex, tap, air time and reach, against the test\'s own stepping', t => {
  const lv = LABS.room(['', '..........S.............', FLOOR]);
  const measure = (words, n) => {
    const s = settle(lv), y0 = s.hero.y, x0 = s.hero.x; let top = y0, landed = -1;
    for (let f = 0; f < n; f++) { SB.sim.step(s, words(f)); if (s.hero.y < top) top = s.hero.y; if (f > 0 && s.hero.ground && landed < 0) { landed = f + 1; break; } }
    return { apex: (y0 - top) / 256, frames: landed, dx: (s.hero.x - x0) / 256 };
  };
  const full = measure(f => (f === 0 ? IN.A | IN.A_TAP : IN.A), 90);
  const tap = measure(f => (f === 0 ? IN.A | IN.A_TAP : 0), 90);
  const run = measure(f => (f === 0 ? IN.A | IN.A_TAP : IN.A) | IN.R, 90);
  const refFull = jumpRef(SB.TUNING.JUMP_V, 999), refTap = jumpRef(SB.TUNING.JUMP_V, 1);
  t.ok(full.apex >= 69 && full.apex <= 72, 'a full hold from rest peaks at ' + full.apex + ' px (69..72)');
  t.eq(full.apex, refFull.apex, 'the full hold apex equals the test\'s own stepping');
  t.ok(tap.apex >= 30 && tap.apex <= 33, 'a one frame tap peaks at ' + tap.apex + ' px (30..33)');
  t.eq(tap.apex, refTap.apex, 'the tap apex equals the test\'s own stepping');
  t.ok(full.frames >= 33 && full.frames <= 35, 'a full jump lands on step ' + full.frames + ' (33..35)');
  t.eq(full.frames, refFull.frames, 'the full jump\'s air time equals the test\'s own stepping');
  t.ok(run.dx >= 80, 'a full jump at full run covers ' + run.dx + ' px across at dy 0 (at least 80)');
  t.eq(run.dx, refFull.frames * SB.TUNING.RUN, 'the run jump covers exactly its frames times RUN');
  const sub = measure(f => (f === 0 ? IN.A_TAP : 0), 90);
  t.eq(sub.apex, tap.apex, 'a sub step tap (the edge bit with A already up) is a one frame jump');
});

group('H-sim-2', 'coyote: a press on the 6th airborne frame after walking off jumps; the 7th does not', t => {
  const lv = LABS.room(['', 'S.......................', '#####...................', '#####...................', '#####...................', FLOOR]);
  const walk = () => { const s = SB.sim.create(lv); for (let k = 0; k < 3; k++) SB.sim.step(s, 0); return s; };
  const s0 = walk(); let W = -1;
  for (let f = 0; f < 120 && W < 0; f++) { SB.sim.step(s0, IN.R); if (!s0.hero.ground) W = f; }
  t.ok(W > 0, 'the hero walks off the ledge (step ' + W + ')');
  for (const [k, want] of [[1, true], [6, true], [7, false], [8, false]]) {
    const s = walk(); let jumped = false;
    for (let f = 0; f <= W + k; f++) {
      SB.sim.step(s, IN.R | (f === W + k ? IN.A | IN.A_TAP : 0));
      if (f === W + k) jumped = s.hero.vy < 0;
    }
    t.eq(jumped, want, 'a press on airborne frame ' + k + (want ? ' jumps' : ' does not jump'));
  }
});

group('H-sim-2b', 'coyote never arms on a jump: a second press in the first airborne frames does not jump again', t => {
  /* settled on the floor first (4 quiet steps), the jump on step 4, a second press k steps later; an upward kick is a
     step that makes vy more negative by more than gravity could (a landing zeroing a fall is not one) */
  const lv = LABS.room(['', '..........S.............', FLOOR]);
  const kicks = r => r.trace.filter(p => p.vy < 0 && p.vy < p.before.vy - K.G).length;
  const once = play(lv, f => (f === 4 ? IN.A | IN.A_TAP : 0), 80);
  const apexOnce = Math.min(...once.trace.map(p => p.y));
  t.eq(kicks(once), 1, 'a single press is one upward kick');
  for (const k of [1, 3, 6]) {
    const twice = play(lv, f => (f === 4 || f === 4 + k ? IN.A | IN.A_TAP : 0), 80);
    /* the fair single jump holds A on the same steps, with no second down edge (holding A on frame 1 rightly delays
       the release cap; a second press must add nothing more than that hold) */
    const held = play(lv, f => (f === 4 ? IN.A | IN.A_TAP : f === 4 + k ? IN.A : 0), 80);
    t.eq(kicks(twice), 1, 'a second press on airborne frame ' + k + ' gives no second upward kick');
    t.eq(Math.min(...twice.trace.map(p => p.y)), Math.min(...held.trace.map(p => p.y)), 'a second press on airborne frame ' + k + ' reaches exactly the apex of the same hold without it');
  }
});

group('H-sim-3', 'buffer: a press 6 steps before the first grounded step jumps on landing; 7 does not', t => {
  const lv = LABS.room(['', '..........S.............', '', '', '', '', '', '', FLOOR]);
  const s0 = SB.sim.create(lv); let Lf = -1;
  for (let f = 0; f < 200 && Lf < 0; f++) { if (s0.hero.ground) Lf = f; SB.sim.step(s0, 0); }
  t.ok(Lf > 8, 'the dropped hero first starts a step grounded at step ' + Lf);
  for (const [m, want] of [[1, true], [6, true], [7, false], [9, false]]) {
    const s = SB.sim.create(lv); let jumped = false;
    for (let f = 0; f <= Lf; f++) {
      SB.sim.step(s, f === Lf - m ? IN.A | IN.A_TAP : 0);
      if (f === Lf) jumped = s.hero.vy < 0;
    }
    t.eq(jumped, want, 'a press ' + m + ' steps before landing ' + (want ? 'jumps on the landing step' : 'does not jump'));
  }
});

group('H-sim-4', 'one way tops: rising never lands; descending lands with 2 px of overlap and misses with 1', t => {
  const lv = LABS.room(['', '.........===............', '', '..........S.............', FLOOR]);
  const r = play(lv, f => (f === 0 ? IN.A | IN.A_TAP : IN.A), 60);
  t.ok(r.trace.every(p => !(p.before.vy < 0 && p.ground)), 'rising through the one way, the hero never lands');
  t.eq(Math.floor((r.s.hero.y + HH - 1) / CS), lv.h - 5, 'after the arc the hero stands on the one way (row 43, above the plank in row 44)');
  /* a plank five rows up (its top 80 px over the feet, the apex 69.6): the feet never clear it, so it never catches */
  const high = LABS.room(['.........===............', '', '', '', '..........S.............', FLOOR]);
  const rh = play(high, f => (f === 0 ? IN.A | IN.A_TAP : IN.A), 80);
  t.ok(rh.trace.every(p => !p.ground || p.y === (high.h - 2) * CS), 'a plank whose top the feet never clear never catches the hero: it is only ever grounded on the floor');
  /* a hero falling with its feet already inside a plank's row does not land on that plank's top */
  const inside = LABS.room(['', '...........===..........', '', '', FLOOR]);
  const s3 = SB.sim.create(inside, { at: { x: 11 * CS + 512, y: (inside.h - 4) * CS + 6 * 256 - HH } });
  for (let f = 0; f < 40; f++) SB.sim.step(s3, 0);
  t.eq(Math.floor((s3.hero.y + HH - 1) / CS), inside.h - 2, 'feet already inside the plank\'s row fall through it to the floor');
  const drop = lv2 => LABS.room(['..........S.............', '', '', '', '', '', '...........===..........', '', FLOOR]);
  for (const [px, want] of [[2, true], [1, false], [3, true]]) {
    const lv2 = drop();
    const plankRow = lv2.h - 3, cellLeft = 11 * CS;
    const s = SB.sim.create(lv2, { at: { x: cellLeft - HW + px * 256, y: (lv2.h - 9) * CS } });
    for (let f = 0; f < 80; f++) SB.sim.step(s, 0);
    const standRow = Math.floor((s.hero.y + HH - 1) / CS);
    t.eq(standRow === plankRow - 1, want, 'a hero overlapping the plank by ' + px + ' px ' + (want ? 'lands on it' : 'falls past it') + ' (stands on row ' + standRow + ')');
  }
});

group('H-sim-5', 'the head bonk zeroes vy; the 2 px ledge nudge slides the hero clear', t => {
  /* a solid ceiling with one row of headroom over the hero (row 44; the hero stands in row 46) */
  const lv = LABS.room(['', '########################', '', '...S....................', FLOOR]);
  const r = play(lv, f => (f === 0 ? IN.A | IN.A_TAP : IN.A), 40);
  const ceilBottom = (lv.h - 3) * CS;
  t.ok(r.trace.every(p => p.y >= ceilBottom), 'the head never enters the ceiling row (it stops at its bottom edge)');
  const touching = r.trace.filter(p => p.y === ceilBottom);
  t.eq(touching.length, 1, 'the head meets the ceiling\'s bottom edge on exactly one step (a bonk that kept vy would pin it there)');
  t.ok(touching.length > 0 && touching[0].before.vy < -K.G && touching[0].vy === 0, 'on the bonk step itself, rising fast, vy is set to 0 (vy before ' + (touching[0] && touching[0].before.vy) + ', after ' + (touching[0] && touching[0].vy) + ')');
  /* the nudge: one solid cell above, the hero's box over its right edge by k px */
  for (const [px, passes] of [[2, true], [3, false]]) {
    const lv2 = LABS.room(['', '', '.....#..................', '', '', FLOOR]);
    const cellRight = 6 * CS, y0 = (lv2.h - 2) * CS;
    const s = SB.sim.create(lv2, { at: { x: cellRight - px * 256, y: y0 } });
    SB.sim.step(s, 0); SB.sim.step(s, 0);
    let top = s.hero.y;
    for (let f = 0; f < 40; f++) { SB.sim.step(s, f === 0 ? IN.A | IN.A_TAP : IN.A); top = Math.min(top, s.hero.y); }
    const cellBottom = (lv2.h - 5) * CS;
    t.eq(top < cellBottom, passes, 'overlapping a solid corner by ' + px + ' px the rise ' + (passes ? 'is nudged past it' : 'bonks under it'));
  }
});

group('H-sim-20', 'the exit: the room clears on the first step the hero\'s box overlaps the exit cell, and only then', t => {
  const lv = LABS.room(['', '', '.....X..................', '', '', '..........S.............', FLOOR], { exit: true });
  const ex = lv.exit % lv.w, ey = Math.floor(lv.exit / lv.w);
  const overlaps = h => h.x < (ex + 1) * CS && h.x + HW > ex * CS && h.y < (ey + 1) * CS && h.y + HH > ey * CS;
  /* jump up and left past the exit cell: the box crosses its row and its column at other times too */
  const s = SB.sim.create(lv);
  let firstOverlap = -1, firstClear = -1, early = 0;
  for (let f = 0; f < 120 && firstClear < 0; f++) {
    SB.sim.step(s, (f === 0 ? IN.A | IN.A_TAP : IN.A) | IN.L);
    if (overlaps(s.hero) && firstOverlap < 0) firstOverlap = f;
    if (s.room.cleared && firstClear < 0) firstClear = f;
    if (s.room.cleared && !overlaps(s.hero) && firstOverlap < 0) early++;
  }
  t.ok(firstOverlap >= 0, 'the lab jump does reach the exit cell (step ' + firstOverlap + ')');
  t.eq(firstClear, firstOverlap, 'the room clears on exactly the first step the box overlaps the exit cell');
  t.eq(early, 0, 'it never clears before the box reaches the cell');
  /* the exit's bottom edge: the hero in its column with the head exactly on the cell's bottom is not in it; one more
     subpixel up is */
  const col = LABS.room(['', '..........X.............', '', '', FLOOR], { exit: true });
  const cx = 10, cy = col.h - 4;
  const s1 = SB.sim.create(col, { at: { x: cx * CS + 512, y: (cy + 1) * CS } });
  s1.hero.vy = 0; s1.hero.ground = 0;
  const clearedAtEdge = (() => { const st = SB.sim.attach(structuredClone(s1), col); st.hero.y = (cy + 1) * CS; st.hero.vy = -K.G; SB.sim.step(st, 0); return st.room.cleared; })();
  t.eq(clearedAtEdge, 0, 'the head exactly at the exit cell\'s bottom edge (moving no higher) does not clear');
  const into = SB.sim.attach(structuredClone(s1), col); into.hero.y = (cy + 1) * CS; into.hero.vy = -K.G - 256; SB.sim.step(into, 0);
  t.eq(into.room.cleared, 1, 'one pixel into the exit cell from below clears');
  /* the exit's side: the box's right edge exactly on the cell's left side is not in it; one step of run into it is */
  const side = LABS.room(['', '', '', '..........X.............', FLOOR], { exit: true });
  const sx2 = 10, sy2 = side.h - 2;
  const beside = SB.sim.create(side, { at: { x: sx2 * CS - HW, y: sy2 * CS } });
  SB.sim.step(beside, 0);
  t.eq(beside.room.cleared, 0, 'the box exactly beside the exit cell, touching its side, does not clear');
  SB.sim.step(beside, IN.R);
  t.eq(beside.room.cleared, 1, 'one step of run into the exit cell clears');
});

group('H-sim-18', 'air control: the rocker at takeoff equals a running start; L and R together decelerate to rest', t => {
  const lv = LABS.room(['', 'S.......................', FLOOR]);
  const flight = run => {
    const s = settle(lv); let x0 = null;
    for (let f = 0; f < 120; f++) {
      const jumpAt = run ? 12 : 0;
      if (f === jumpAt) x0 = s.hero.x;
      SB.sim.step(s, IN.R | (f === jumpAt ? IN.A | IN.A_TAP : f > jumpAt ? IN.A : 0));
      if (f > jumpAt && s.hero.ground) return s.hero.x - x0;
    }
    return null;
  };
  t.eq(flight(false), flight(true), 'a jump with the rocker pressed on its takeoff step covers what a running start covers');
  const s = settle(lv);
  for (let f = 0; f < 6; f++) SB.sim.step(s, IN.R);
  const vs = [];
  for (let f = 0; f < 5; f++) { SB.sim.step(s, IN.L | IN.R); vs.push(s.hero.vx); }
  t.same(vs, [K.RUN - K.DECEL, K.RUN - 2 * K.DECEL, K.RUN - 3 * K.DECEL, 0, 0], 'L and R together read as neutral: the 4 frame decel to rest');
  t.eq(s.hero.facing, 1, 'a neutral word keeps the facing');
  /* Q60: "no air friction" is read as the fall's; releasing the rocker in flight decelerates as on the ground */
  const s2 = settle(lv), air = [];
  for (let f = 0; f < 14; f++) { SB.sim.step(s2, (f === 0 ? IN.A | IN.A_TAP : IN.A) | (f < 8 ? IN.R : 0)); if (f >= 8 && f < 12) air.push([s2.hero.vx, s2.hero.ground]); }
  t.same(air, [[K.RUN - K.DECEL, 0], [K.RUN - 2 * K.DECEL, 0], [K.RUN - 3 * K.DECEL, 0], [0, 0]], 'releasing the rocker in flight decelerates in 4 frames, still airborne (Q60)');
});

group('H-fuzz-1', '2000 seeded random frames per fixture: never in a solid, never below the floor or outside, never standing on nothing', t => {
  for (const f of FIXTURES) {
    const lv = buildFx(f, 0);
    if (lv.needsCrop) continue;
    const s = SB.sim.create(lv), r = hrand(SB.record.seedOf(lv.rec));
    let held = 0, inSolid = 0, out = 0, floating = 0, first = '';
    for (let k = 0; k < 2000; k++) {
      if (r.int(8) === 0) held = r.int(16);
      const prevA = s._prevA || 0, a = held & IN.A;
      SB.sim.step(s, held | (a && !prevA ? IN.A_TAP : 0) | (held & IN.B && r.int(3) === 0 ? IN.B_TAP : 0));
      Object.defineProperty(s, '_prevA', { value: a, enumerable: false, writable: true, configurable: true });
      const h = s.hero, cx0 = Math.floor(h.x / CS), cx1 = Math.floor((h.x + HW - 1) / CS), cy0 = Math.floor(h.y / CS), cy1 = Math.floor((h.y + HH - 1) / CS);
      if (h.x < 0 || h.x + HW > lv.w * CS || h.y + HH > (lv.h - 1) * CS || h.y < -CS) { out++; if (!first) first = 'outside at step ' + k; }
      for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) if (cx >= 0 && cx < lv.w && cy >= 0 && cy < lv.h && lv.solid[cy * lv.w + cx]) { inSolid++; if (!first) first = 'in a solid at step ' + k; }
      if (h.ground) {
        const feet = h.y + HH, row = feet / CS;
        let support = false;
        if (Number.isInteger(row)) for (let cx = cx0; cx <= cx1; cx++) {
          if (row >= lv.h || lv.solid[row * lv.w + cx]) support = true;
          else if (lv.plat[row * lv.w + cx] && Math.min(h.x + HW, (cx + 1) * CS) - Math.max(h.x, cx * CS) >= K.OVERLAP_SUB) support = true;
        }
        if (!support) { floating++; if (!first) first = 'standing on nothing at step ' + k; }
      }
    }
    t.ok(inSolid + out + floating === 0, f.name + ': 2000 random frames, ' + inSolid + ' in a solid, ' + out + ' outside, ' + floating + ' standing on nothing' + (first ? ' (first: ' + first + ')' : ''), first ? SB.pipeline.toText(lv) : undefined);
  }
});

/* ================================================================ input */
group('H-in-1', 'the replay codec: 3600 random words round trip through runs, L and R together included', t => {
  const r = hrand(36), words = [];
  let w = 0;
  for (let k = 0; k < 3600; k++) { if (r.int(6) === 0) w = r.int(64); words.push(w); }
  words[100] = IN.L | IN.R; words[101] = IN.L | IN.R | IN.A;
  const runs = SB.sim.rle.encode(words);
  t.ok(runs.every(([n, x]) => Number.isInteger(n) && n > 0 && Number.isInteger(x)), 'every run is [count > 0, word]');
  t.ok(runs.every((run, k) => k === 0 || runs[k - 1][1] !== run[1]), 'no two neighbouring runs hold the same word');
  t.same(SB.sim.rle.decode(runs), words, 'decode(encode(words)) equals the words');
  t.eq(runs.reduce((a, x) => a + x[0], 0), 3600, 'the runs count 3600 steps');
  t.ok(SB.sim.rle.decode(runs)[100] === (IN.L | IN.R), 'a word with L and R both set survives the round trip');
});

/* ================================================================ one room */
if (opt('fixture')) {
  const want = opt('fixture');
  const f = fs.existsSync(want) ? { fx: JSON.parse(fs.readFileSync(want, 'utf8')) } : fixture(want);
  if (!f) { console.log('no fixture named ' + want + ' (the corpus: ' + FIXTURES.map(x => x.name).join(', ') + ')'); process.exit(2); }
  const j = f.fx.record, mode = opt('mode') !== null ? Number(opt('mode')) : j.mode;
  console.log(f.fx.name + ' (' + f.fx.source + '): ' + f.fx.notes + '\n');
  if (SB.pipeline.build) {
    const lv = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, j, { mode })), { biome: opt('biome') !== null ? Number(opt('biome')) : null });
    if (lv.needsCrop) console.log('needsCrop: ' + lv.why);
    else {
      const tt = SB.pipeline.toText(lv, lv.ascent || null).split('\n'), pt = palText(j.rows).split('\n');
      console.log('   palette                    built (# solid, = one way, S spawn, X exit, L a landmark top)');
      tt.forEach((row, y) => console.log(String(y).padStart(2) + ' ' + (pt[y] || '').padEnd(24) + '   ' + row));
      console.log('\notsu T ' + lv.otsuT + ', spawn ' + (lv.spawn % lv.w) + ',' + Math.floor(lv.spawn / lv.w) + ', exit ' + (lv.exit % lv.w) + ',' + Math.floor(lv.exit / lv.w) +
        ', landmarks ' + lv.landmarks.map(l => l.size).join('/') + ', one way runs ' + platformRuns(lv));
    }
  } else console.log(palText(j.rows));
  process.exit(0);
}

/* ================================================================ fixtures */
group('H-fix-1', 'every fixture validates, carries every expect key, and round trips', t => {
  t.ok(FIXTURES.length >= 7, 'the corpus holds at least 7 fixtures (' + FIXTURES.length + ')');
  for (const f of FIXTURES) {
    const j = f.fx;
    t.eq(j.v, 1, f.name + ': fixture v 1');
    t.eq(path.basename(f.file, '.json'), j.name, f.name + ': the file is named for the fixture');
    t.eq(SB.record.validate(j.record), null, f.name + ': the record validates');
    for (const k of EXPECT_KEYS) t.ok(k in j.expect, f.name + ': expect.' + k + ' is present');
    t.ok(typeof j.notes === 'string' && j.notes.length > 40, f.name + ': notes say why the expect is what it is');
    t.same(SB.record.toJSON(SB.record.fromJSON(j.record)), j.record, f.name + ': toJSON(fromJSON(record)) equals the record');
  }
});

group('H-fix-2', 'SB.SAMPLE_ROOM is the sample room fixture', t => {
  const f = fixture('sample-room');
  t.ok(!!f, 'fixtures/sample-room.json is in the corpus');
  if (!f) return;
  t.same(Array.from(SB.SAMPLE_ROOM), f.fx.record.rows, 'SB.SAMPLE_ROOM rows equal the fixture\'s rows');
  t.eq(f.fx.record.mode, 0, 'the sample room is mode 0');
  t.eq(f.fx.record.focal, null, 'the sample room has no focal cell');
  t.ok(Object.isFrozen(SB.SAMPLE_ROOM), 'SB.SAMPLE_ROOM is frozen');
  const txt = fs.readFileSync(path.join(__dirname, 'tools', 'sample-room.txt'), 'utf8').trim().split('\n');
  t.same(txt, f.fx.record.rows, 'tools/sample-room.txt is the fixture (the drawing and the record agree)');
});

group('H-fix-3', 'the corpus holds every record fixtures/README.md lists; names unique; seeds distinct', t => {
  const readme = fs.readFileSync(path.join(__dirname, 'fixtures', 'README.md'), 'utf8');
  const listed = [...readme.matchAll(/^- `([a-z0-9-]+)`/gm)].map(m => m[1]);
  t.ok(listed.length >= 7, 'the README lists at least 7 fixtures (' + listed.length + ')');
  for (const n of listed) t.ok(!!fixture(n), 'the corpus holds ' + n);
  const names = FIXTURES.map(f => f.name);
  t.eq(new Set(names).size, names.length, 'fixture names are unique');
  const seeds = FIXTURES.map(f => SB.record.seedOf(SB.record.fromJSON(f.fx.record)));
  t.eq(new Set(seeds).size, seeds.length, 'no two fixtures share a seedOf');
});

/* ================================================================ run */
const t0 = Date.now();
const chosen = ONLY ? GROUPS.filter(g => g.id.startsWith(ONLY)) : GROUPS;
if (ONLY && !chosen.length) { console.log('FAIL  --only ' + ONLY + ' matched no group'); console.log('\nSHUTTERBUG HARNESS FAILED'); process.exit(1); }
for (const g of chosen) {
  const t = makeT(g.id), g0 = Date.now();
  try { g.fn(t); }
  catch (e) {
    total++; t.bad++;
    failLines.push('FAIL  ' + g.id + ' threw: ' + e.message + '\n' + (e.stack || '').split('\n').slice(1, 5).join('\n'));
  }
  const ms = Date.now() - g0;
  console.log((t.bad ? 'FAIL ' : 'ok   ') + g.id.padEnd(12) + String(t.n).padStart(6) + ' assertions' + (t.bad ? '  ' + t.bad + ' failed' : '') + (ms > 500 ? '  ' + ms + ' ms' : '') + '  ' + g.title);
}
if (FAST) console.log('\n--fast: --all-edges and --economy are not run here (they do not exist yet before T0.13a and M2)');
console.log('\n' + total + ' assertions in ' + chosen.length + ' groups, ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s');
if (failLines.length) {
  console.log('\n' + failLines.join('\n'));
  console.log('\nSHUTTERBUG HARNESS FAILED: ' + failLines.length + ' failing assertion' + (failLines.length > 1 ? 's' : ''));
  process.exit(1);
}
if (xpassLines.length) console.log('\n' + xpassLines.join('\n'));
if (!ONLY && total < ASSERT_FLOOR) {
  console.log('\nSHUTTERBUG HARNESS FAILED: only ' + total + ' assertions ran; the floor is ' + ASSERT_FLOOR + ' (a truncated suite cannot pass by being short)');
  process.exit(1);
}
if (xfailLines.length) {
  console.log('\n' + xfailLines.join('\n'));
  console.log('\nSHUTTERBUG HARNESS OK WITH ' + xfailLines.length + ' XFAIL' + (ONLY ? ' (--only ' + ONLY + ')' : ''));
} else console.log('\nSHUTTERBUG HARNESS OK' + (ONLY ? ' (--only ' + ONLY + ', the floor not checked)' : ''));
