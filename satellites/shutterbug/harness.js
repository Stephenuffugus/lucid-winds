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
const ASSERT_FLOOR = 4150;              /* raised per task: the count a full run must reach */

const LATER = { 'record-json': 'T0.15', 'all-edges': 'T0.13a', replay: 'T0.13b', record: 'T0.13b',
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

/* ================================================================ contrast (T0.4b) */
/* WCAG 2 relative luminance and contrast, here and not in the core: x to the power 2.4 is Math.pow, which the core
   forbids (not correctly rounded across engines); contrast never enters the sim or a hash. */
const WCAG = {
  lum([r, g, b]) {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  },
  ratio(a, b) { const x = WCAG.lum(a), y = WCAG.lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
};
/* the backdrop blend, recomputed in the test from section 7.3's sentences: the photo 40% toward Pewter (60% contrast),
   then open cells 20% toward the biome's open tint */
const blendRef = (a, b, t) => a.map((v, k) => Math.round(v + (b[k] - v) * t));
const openRef = (idx, biome) => blendRef(blendRef(palRef.rgb[idx], palRef.rgb[3], 0.4), palRef.rgb[SB.palette.TINT.open[biome]], 0.2);

group('H-pal-3', 'the two tone rule: on every open backdrop of every biome, Ink or Glare clears 3:1 and Sun or Ink clears 3:1', t => {
  const I = SB.palette.I, ink = palRef.rgb[I.INK], glare = palRef.rgb[I.GLARE], sun = palRef.rgb[I.SUN];
  let worstEdge = 99, worstHero = 99, at = '';
  for (let b = 0; b < 5; b++) for (let idx = 0; idx < 15; idx++) {
    const bg = openRef(idx, b);
    t.same(SB.palette.openColour(idx, b), bg, SB.palette.NAMES[idx] + ' in ' + SB.palette.BIOMES[b] + ': the page\'s open blend equals the test\'s');
    const edge = Math.max(WCAG.ratio(ink, bg), WCAG.ratio(glare, bg)), hero = Math.max(WCAG.ratio(sun, bg), WCAG.ratio(ink, bg));
    if (edge < worstEdge) { worstEdge = edge; at = SB.palette.NAMES[idx] + '/' + SB.palette.BIOMES[b]; }
    if (hero < worstHero) worstHero = hero;
    t.ok(edge >= 3, SB.palette.NAMES[idx] + ' in ' + SB.palette.BIOMES[b] + ': the collision edge (Glare over Ink) clears 3:1 (' + edge.toFixed(2) + ')');
    t.ok(hero >= 3, SB.palette.NAMES[idx] + ' in ' + SB.palette.BIOMES[b] + ': the hero (Sun with an Ink outline) clears 3:1 (' + hero.toFixed(2) + ')');
  }
  console.log('  info  the weakest edge contrast is ' + worstEdge.toFixed(2) + ':1 (' + at + '), the weakest hero contrast ' + worstHero.toFixed(2) + ':1');
});

group('H-pal-4', 'every biome\'s solid tint against its open tint is at least 1.5:1', t => {
  for (let b = 0; b < 5; b++) {
    const s = SB.palette.TINT.solid[b], o = SB.palette.TINT.open[b], r = WCAG.ratio(palRef.rgb[s], palRef.rgb[o]);
    t.ok(r >= 1.5, SB.palette.BIOMES[b] + ': ' + SB.palette.NAMES[s] + ' against ' + SB.palette.NAMES[o] + ' is ' + r.toFixed(2) + ':1 (at least 1.5)');
  }
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
    /* the reach distance from spawn (section 3.7, since T0.10b): the farthest reachable standable cell of the top rows,
       the light winning within EXIT_LIGHT_SLACK (2) by its own farthest cell; ties to the lowest index. The graph is the
       core's (H-reach-3 to 5 hold it to the labs); the choice is made here. */
    const gr = SB.reach.graph(lv), d = SB.reach.distances(gr, lv.spawn);
    let maxD = -1, far = -1;
    for (let i = 0; i < rows * w; i++) if (st(i) && d[i] > maxD) { maxD = d[i]; far = i; }
    if (far >= 0) {
      const lc = light ? light.c.filter(i => st(i) && d[i] >= 0).sort((a, b) => d[b] - d[a] || a - b)[0] : undefined;
      return lc !== undefined && d[lc] >= maxD - 2 ? lc : far;
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
/* pipeline A alone (opts.stage 'A'): the level before repair, for the groups that test solidity, the platforms, the
   landmarks, spawn and the light */
function buildA(f, mode) {
  const k = 'A:' + f.name + '@' + mode;
  if (!(k in built)) built[k] = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { stage: 'A' });
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
    const lv = buildA(f, mode);
    if (lv.needsCrop) { t.ok(lv.why === 'unreachable', f.name + ' mode ' + mode + ': needsCrop only as unreachable here (' + lv.why + ')'); continue; }
    let floor = true, top = true;
    for (let x = 0; x < lv.w; x++) { if (!lv.solid[(lv.h - 1) * lv.w + x]) floor = false; if (lv.solid[x]) top = false; }
    t.ok(floor, f.name + ' mode ' + mode + ': bottom row solid');
    t.ok(top, f.name + ' mode ' + mode + ': top row open');
  }
});

group('H-pipe-2', 'the checkerboard smooths to under 10% isolated cells; solidity equals the test\'s own two pass smoothing', t => {
  const lv = buildA(fixture('checkerboard'), 0);
  let iso = 0;
  for (let y = 1; y < lv.h - 1; y++) for (let x = 0; x < lv.w; x++) {
    const me = lv.solid[y * lv.w + x]; let same = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const xx = x + dx, yy = y + dy; if (xx >= 0 && xx < lv.w && lv.solid[yy * lv.w + xx] === me) same = true; }
    if (!same) iso++;
  }
  t.ok(iso / (lv.w * lv.h) < 0.10, 'checkerboard: ' + (100 * iso / (lv.w * lv.h)).toFixed(1) + '% isolated cells after smoothing (under 10%)');
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv2 = buildA(f, mode);
    if (lv2.needsCrop) continue;
    const ref = pipeRef.solidity(f.fx.record, mode);
    let diff = 0; for (let i = 0; i < ref.solid.length; i++) if (ref.solid[i] !== lv2.solid[i]) diff++;
    t.eq(diff, 0, f.name + ' mode ' + mode + ': cells where solidity differs from the test\'s threshold and two pass smoothing', diff ? SB.pipeline.toText(lv2) : undefined);
  }
});

group('H-pipe-3', 'all-dark and all-light stand on row h-2; the threshold is the exact Otsu, inside the clamp, on every fixture', t => {
  for (const name of ['all-dark', 'all-light']) {
    const lv = buildA(fixture(name), 0);
    let n = 0; for (let x = 0; x < lv.w; x++) if (standableIn(lv, (lv.h - 2) * lv.w + x)) n++;
    t.ok(!lv.needsCrop && n > 0, name + ': ' + n + ' standable cells on row h-2');
  }
  for (const f of FIXTURES) {
    const lv = buildA(f, 0), want = pipeRef.solidity(f.fx.record, 0).T;
    /* a needsCrop result carries no level; it must be one the fixture's author designed (H-pipe-9 says so for the rest) */
    if (lv.needsCrop) { t.ok(f.fx.expect.needsCrop === true, f.name + ': needsCrop (' + lv.why + ') as its expect authors it'); continue; }
    t.ok(lv.otsuT >= 70 && lv.otsuT <= 140, f.name + ': threshold ' + lv.otsuT + ' inside DESIGN 6.3\'s clamp [70, 140]');
    t.eq(lv.otsuT, want, f.name + ': threshold equals the test\'s exact Otsu');
  }
});

group('H-pipe-4', 'one way platforms: open, runs of at least 3, never under a solid, exactly DESIGN 6.4', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildA(f, mode);
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
    const lv = buildA(f, mode);
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
  const lv = buildA(fixture('one-giant-landmark'), 0);
  /* a rectangle's corner sees four solids of nine and erodes; an edge cell sees six and stays: drawn minus 4 */
  const big = lv.landmarks.filter(l => l.size === drawn - 4);
  t.eq(big.length, 1, 'one-giant-landmark: exactly one landmark of the drawn ' + drawn + ' cells less its 4 corners (sizes ' + lv.landmarks.map(l => l.size).join('/') + ')');
  if (big.length) t.same(Array.from(big[0].bbox), [g.x0, g.y0, g.x1, g.y1], 'one-giant-landmark: its bounding box is the drawing\'s');
});

group('H-pipe-6', 'spawn is standable and on the standing row above the floor', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildA(f, mode);
    if (lv.needsCrop) continue;
    t.eq(Math.floor(lv.spawn / lv.w), lv.h - 2, f.name + ' mode ' + mode + ': spawn row');
    t.ok(standableIn(lv, lv.spawn), f.name + ' mode ' + mode + ': spawn is standable');
  }
  const lv = buildA(fixture('sample-room'), 0);
  t.eq(lv.spawn, 46 * 24 + 15, 'the sample room spawns at (15, 46), the centre of the floor\'s widest open run (x 8..23)');
});

group('H-pipe-7', 'Negative: solid and open swap after smoothing, before the frame rules and the platforms', t => {
  const f = fixture('sample-room'), pos = buildA(f, 0), neg = buildA(f, 1);
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
    const e = f.fx.expect, lv = buildA(f, 0);
    if (e.needsCrop) continue;
    /* authored to build: a needsCrop here is a design the pipeline refused, named, never a throw */
    if (lv.needsCrop) { t.ok(e.needsCrop === null, f.name + ': its expect says it builds, but the pipeline says needsCrop (' + lv.why + ')'); continue; }
    if (e.platformsMin !== null) t.ok(platformRuns(lv) >= e.platformsMin, f.name + ': ' + platformRuns(lv) + ' one way runs (at least ' + e.platformsMin + ')', SB.pipeline.toText(lv));
    if (e.landmarksMin !== null) t.ok(lv.landmarks.length >= e.landmarksMin, f.name + ': ' + lv.landmarks.length + ' landmarks (at least ' + e.landmarksMin + ')', SB.pipeline.toText(lv));
  }
  const lv = buildA(fixture('sample-room'), 0);
  const bookshelf = lv.landmarks.find(l => l.bbox[0] === 0 && l.bbox[1] >= 26 && l.bbox[3] <= 39);
  t.ok(!!bookshelf, 'the sample room\'s bookshelf (left wall, rows 27..38) is a landmark');
  const bed = lv.landmarks.find(l => l.bbox[0] === 0 && l.bbox[1] >= 44 && l.bbox[3] === lv.h - 2);
  t.ok(!!bed, 'the sample room\'s bed (bottom left, rows 45..46) is a landmark of its own, not the floor');
  t.eq(lv.exit, 3 * 24 + 10, 'the sample room\'s exit stands in the lamp\'s shade at (10, 3), the lowest index of the light\'s lowest standable row (section 3.7)');
});

group('H-pipe-12', 'the light is the cluster with the brightest cell; the beacon relights it only when the exit stands in it', t => {
  const lv = buildA(fixture('sample-room'), 0);
  t.ok(lv.beacon.cells.length > 0 && Array.from(lv.beacon.cells).includes(lv.exit), 'the sample room: the exit stands in the lamp, so the lamp\'s ' + lv.beacon.cells.length + ' cells are relit');
  /* a hanging lamp (Glare over Ash, a drop of 52: nothing under it to stand on) and an Ash shelf over Slate elsewhere */
  const hang = SB.pipeline.build(labRecord({ 1: '444444444466444444444444', 2: '444444444466444444444444', 3: '444444444444444422222444' }), { stage: 'A' });
  t.eq(hang.exit, 2 * 24 + 16, 'a hanging lamp with nothing under it: the exit falls back to the shelf (16, 2)');
  t.eq(hang.beacon.cells.length, 0, 'and the lamp stays backdrop: no beacon cells relit away from the exit');
  /* a small Glare lamp (peak 251) and a bigger Paper patch (239), each over a Pewter shadow */
  const two = SB.pipeline.build(labRecord({ 0: '444444444444445555554444', 1: '444666444444445555554444', 2: '444666444444445555554444', 3: '444333444444443333334444' }), { stage: 'A' });
  const exitX = two.exit % 24;
  t.ok(exitX >= 3 && exitX <= 5, 'a 3x2 Glare lamp beats a bigger 6x3 Paper patch: the light is the lamp (exit at x ' + exitX + ', Q59)');
  /* ties: two standable clusters both peaking at Glare (each 3 or more wide over a Pewter shadow, so the light's choice
     decides the exit): the larger wins; at equal size the one with the lower first cell */
  const tie = SB.pipeline.build(labRecord({ 1: '466644444445555566444444', 2: '466644444445555555444444', 3: '433344444443333333444444' }), { stage: 'A' });
  t.ok(tie.exit >= 0 && tie.exit % 24 >= 11 && tie.exit % 24 <= 17, 'two clusters that both peak at Glare: the larger (a 7x2 Paper patch with a Glare corner, not the 3x2 lamp) is the light (exit x ' + (tie.exit % 24) + ')');
  const twin = SB.pipeline.build(labRecord({ 1: '466644444444446664444444', 2: '466644444444446664444444', 3: '433344444444443334444444' }), { stage: 'A' });
  t.ok(twin.exit >= 0 && twin.exit % 24 >= 1 && twin.exit % 24 <= 3, 'two equal 3x2 Glare lamps: the one whose first cell comes first is the light (exit x ' + (twin.exit % 24) + ')');
  /* the window is the top EXIT_ROWS (4) rows: a standable lamp in row 4 is not a ceiling light; the exit falls back to
     the Ash shelf (17, 2) */
  const low = SB.pipeline.build(labRecord({ 4: '444444466644444444444444', 5: '444444433344444444444444', 3: '444444444444444442222244' }), { stage: 'A' });
  t.eq(low.beacon.cells.length, 0, 'a Glare lamp in row 4, under the top four rows, is not the light (no cells relit)');
  t.eq(low.exit, 2 * 24 + 17, 'and the exit is the fallback, the shelf at (17, 2), not the lamp');
  /* no light at all: of the standable cells in the first row that has one, the brightest (Ash 199 over the right block,
     not Pewter 139 over the left one) */
  const dim = SB.pipeline.build(labRecord({ 2: '333333444444444444444444', 3: '111111444444444111111444', 4: '111111444444444111111444', 5: '111111444444444111111444' }), { stage: 'A' });
  t.ok(dim.exit >= 0 && Math.floor(dim.exit / 24) === 2 && SB.palette.L[dim.rec.pal[dim.exit]] === 199, 'with no light, the exit is the brightest standable cell of the first row that has one (Ash, L ' + (dim.exit >= 0 ? SB.palette.L[dim.rec.pal[dim.exit]] : '-') + ')');
  t.eq(dim.exit, pipeRef.exitOf(dim), 'and it equals the test\'s own rule');
  /* the fixtures where peaks tie: the test's own rule picks the same exit */
  for (const name of ['all-light', 'checkerboard', 'sample-room']) {
    const full = buildFx(fixture(name), 0), lv = full.needsCrop ? buildA(fixture(name), 0) : full;
    t.eq(lv.exit, pipeRef.exitOf(lv), name + ': the exit equals the test\'s own rule (the farthest reachable cell of the top rows, the light winning within 2; a room that reaches none: the light\'s lowest standable row at its lowest index, else the brightest standable top row cell)');
  }
});

group('H-pipe-10', 'pipeline A builds in under 20 ms p95 per fixture in Node', t => {
  let slow = null;
  for (const f of FIXTURES) {
    const rec = SB.record.fromJSON(f.fx.record), ts = [];
    for (let k = 0; k < 20; k++) { const t0 = process.hrtime.bigint(); SB.pipeline.build(rec, { stage: 'A' }); ts.push(Number(process.hrtime.bigint() - t0) / 1e6); }
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

/* ================================================================ sim part two: walls, slides, vines (T0.12a) */
/* the macros: M_SLIDE holds toward the wall; M_WALLJUMP presses A from an armed slide and holds the rocker away (after
   the 10 step lock the rocker steers); M_STICKY presses A from a sticky wall with no rocker */
const M_SLIDE = (side, n) => Array.from({ length: n }, () => rockerOf(side));
const M_WALLJUMP = (away, hold, len = 160) => Array.from({ length: len }, (_, k) => (k < 200 ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k < hold ? rockerOf(away) : 0));
const M_STICKY = (len = 160) => Array.from({ length: len }, (_, k) => IN.A | (k === 0 ? IN.A_TAP : 0));
/* a hero placed in a lab room: x and y in subpixels, still */
const placed = (lv, x, y) => { const s = SB.sim.create(lv, { at: { x, y } }); SB.sim.attach(s, lv); s.hero.ground = 0; s.hero.coyote = 0; return s; };

group('H-sim-9', 'a wall jump from an armed slide climbs at least 54 px and lands 4 across', t => {
  /* a wall at x 2 (rows 30..46); the hero flush on its right at row 36 (feet on row 37's top), slides one step to arm,
     then wall jumps right; a one way 4 across at the takeoff's height catches it */
  const lines = []; for (let r = 30; r <= 46; r++) lines.push('..#');
  const lv = LABS.room(lines.concat([FLOOR]));
  lv.plat[37 * 24 + 7] = 1; lv.plat[37 * 24 + 8] = 1;
  const s = placed(lv, 3 * CS, 36 * CS);
  SB.sim.step(s, IN.L);
  t.eq(s.hero.wall, -1, 'one step toward the wall arms the slide (wall -1)');
  /* the model's own hold for 4 across at the takeoff's height (the WALL path, the lock inside it) */
  const hold = SB.reach.tables(SB.K, 0).profiles.WALL.paths['4,0'][0].hold;
  const y0 = s.hero.y; let apex = 0, landed = false;
  const words = M_WALLJUMP(1, hold);
  for (let k = 0; k < words.length; k++) { SB.sim.step(s, words[k]); apex = Math.max(apex, y0 - s.hero.y); if (s.hero.ground) landed = true; if (landed && s.hero.vx === 0) break; }
  t.ok(apex >= 54 * 256, 'the wall jump climbs ' + (apex / 256).toFixed(1) + ' px (at least 54)');
  /* the model's landing rule (LAB-EDGE's): grounded on the target's row with LAND_OVERLAP of the box over its column */
  const ov7 = Math.min(s.hero.x + HW, 8 * CS) - Math.max(s.hero.x, 7 * CS);
  t.ok(s.hero.ground === 1 && Math.floor((s.hero.y + HH - 1) / CS) === 36 && ov7 >= SB.K.OVERLAP_SUB, 'with the model\'s hold (' + hold + ' steps) it rests 4 across at the takeoff\'s height, over column 7 by ' + (ov7 / 256).toFixed(1) + ' px (at least 2)');
  t.eq(s.hero.facing, 1, 'facing away from the wall');
});

group('H-sim-10', 'the slide falls a third of the unarmed fall, step for step', t => {
  const lines = []; for (let r = 10; r <= 46; r++) lines.push('..#');
  const lv = LABS.room(lines.concat([FLOOR]));
  const a = placed(lv, 3 * CS, 12 * CS), b = placed(lv, 3 * CS, 12 * CS);
  SB.sim.step(a, IN.L); SB.sim.step(b, 0);
  let off = -1, steps = 0, most = 0;
  for (let k = 0; k < 80 && off < 0 && !b.hero.ground; k++) {
    const ya = a.hero.y, yb = b.hero.y;
    SB.sim.step(a, IN.L); SB.sim.step(b, 0);
    if (b.hero.ground) break;
    steps++; most = Math.max(most, a.hero.y - ya);
    if (a.hero.y - ya !== Math.floor((b.hero.y - yb) / 3)) off = k;
  }
  t.eq(off, -1, 'while the unarmed fall is airborne (' + steps + ' steps) the armed slide moves floor(that fall / 3) each step (the first step that does not)');
  t.ok(most <= Math.floor(SB.K.TERM / 3), 'capped at TERMINAL / 3: the slide never moves more than ' + Math.floor(SB.K.TERM / 3) + ' a step (most ' + most + ')');
  SB.sim.step(a, 0);
  t.eq(a.hero.wall, 0, 'releasing the rocker unarms it');
});

group('H-sim-11', 'the corner rule: 2 px of side overlap never arms a slide; 14 px does', t => {
  /* one solid cell at (2, 30); the hero flush on its right, its box overlapping the cell by `ov` px after the step's
     fall of G (the start is set G higher) */
  for (const [ov, want] of [[2, 0], [13.5, 0], [14, -1], [16, -1]]) {
    const lv = LABS.room(['..#', '', '', '', FLOOR].map(r => r));
    const row = 43, y = row * CS + (16 - ov) * 256 - SB.K.G;
    const s = placed(lv, 3 * CS, y);
    SB.sim.step(s, IN.L);
    t.eq(s.hero.wall, want, 'a side overlap of ' + ov + ' px ' + (want ? 'arms the slide' : 'never arms a slide'));
  }
});

group('H-sim-12', 'vines: the fall stops within a step of a descending contact; A climbs 69 px straight up; re sticks only descending', t => {
  /* a 6 tall vine at x 2 (rows 30..35) in Overgrowth; the hero flush on its right, falling from row 27 */
  const lines = ['..|', '..|', '..|', '..|', '..|', '..|'].concat(Array(10).fill(''), [FLOOR]);
  const lv = LABS.room(lines, { biome: 3 });
  const s = placed(lv, 3 * CS, 26 * CS);
  let stuckAt = -1, firstContact = -1;
  const vineRows = [...Array(lv.h).keys()].filter(r => lv.sticky[r * 24 + 2]), v0 = vineRows[0], v1 = vineRows[vineRows.length - 1] + 1;
  for (let k = 0; k < 40 && stuckAt < 0; k++) {
    SB.sim.step(s, 0);
    const top = s.hero.y, bottom = s.hero.y + HH, ov = Math.min(bottom, v1 * CS) - Math.max(top, v0 * CS);
    if (firstContact < 0 && ov >= HH - SB.K.CORNER_SUB) firstContact = k;
    if (s.hero.sticky) stuckAt = k;
  }
  t.ok(stuckAt >= 0 && stuckAt - firstContact <= 1, 'the fall stops within 1 step of a descending full contact (contact at step ' + firstContact + ', stuck at ' + stuckAt + ')');
  const yHold = s.hero.y; SB.sim.step(s, 0); SB.sim.step(s, 0);
  t.eq(s.hero.y, yHold, 'it holds without the rocker');
  /* the jump from low on the vine, three rows of vine above it, so a rising step is still in full contact */
  const s2 = placed(lv, 3 * CS, (v1 - 2) * CS); for (let k = 0; k < 5 && !s2.hero.sticky; k++) SB.sim.step(s2, 0);
  const yStuck = s2.hero.y;
  let apex = 0, reStick = -1, risingStick = false;
  const words = M_STICKY(80);
  for (let k = 0; k < words.length && reStick < 0; k++) {
    const yPrev = s2.hero.y;
    SB.sim.step(s2, words[k]); apex = Math.max(apex, yStuck - s2.hero.y);
    if (s2.hero.sticky) { reStick = k; if (s2.hero.y < yPrev) risingStick = true; }   /* stuck on a step that moved it up */
  }
  t.ok(apex >= 69 * 256, 'A gives ' + (apex / 256).toFixed(1) + ' px straight up (at least 69)');
  t.ok(reStick > 0 && !risingStick, 'it re sticks on a descending step (step ' + reStick + '), never a rising one');
  t.eq(s2.hero.x, 3 * CS, 'and never moved sideways (no push off)');
});

group('H-sim-15', 'facing: a wall jump faces away from the wall; a rocker tap sets it', t => {
  const lines = []; for (let r = 30; r <= 46; r++) lines.push('..#');
  const lv = LABS.room(lines.concat([FLOOR]));
  const s = placed(lv, 3 * CS, 36 * CS);
  SB.sim.step(s, IN.L); t.eq(s.hero.facing, -1, 'toward the wall while sliding');
  SB.sim.step(s, IN.L | IN.A | IN.A_TAP); t.eq(s.hero.facing, 1, 'the wall jump faces away, the rocker still toward the wall');
  /* the lock (Q25): holding toward the wall through the jump, the push still carries the hero away; no re stick */
  const xJump = s.hero.x; let rearmed = false;
  for (let k = 0; k < 5; k++) { SB.sim.step(s, IN.L | IN.A); if (s.hero.wall !== 0) rearmed = true; }
  t.ok(!rearmed && s.hero.x > xJump, 'held toward the wall, the lock carries the hero away (' + ((s.hero.x - xJump) / 256).toFixed(1) + ' px in 5 steps) and never re arms the slide');
  for (let k = 0; k < 12; k++) SB.sim.step(s, IN.A);
  SB.sim.step(s, IN.L); t.eq(s.hero.facing, -1, 'a rocker tap after the lock sets it');
});

/* LAB-EDGE and LAB-CLEAR for the wall jump (T0.12a): the hero flush on the right of a wall column at (3, 38) (started
   G high, so the arming step leaves it exactly at the contact stance), armed by one step toward the wall, then the
   wall jump with the oracle's canonical hold; PASS when it rests grounded on the target's row over its column by
   LAND_OVERLAP */
function wallLab(dx, dy, support, extraSolid) {
  const W = SB.GRID.W, H = SB.GRID.H, g = Array.from({ length: H }, () => Array(W).fill('.'));
  g[H - 1] = Array(W).fill('#');
  for (let r = 6; r < H - 1; r++) g[r][2] = '#';
  if (extraSolid) for (const [ex, ey] of extraSolid) if (g[ey] && g[ey][ex] === '.') g[ey][ex] = '#';
  const lv = LABS.room(g.map(row => row.join(''))), gx = 3 + dx, gy = 38 - dy;
  if (support === '#') lv.solid[(gy + 1) * W + gx] = 1; else lv.plat[(gy + 1) * W + gx] = 1;
  return { lv, gx, gy };
}
function runWall(lab, hold) {
  const s = placed(lab.lv, 3 * CS, 38 * CS - SB.K.G);
  SB.sim.step(s, IN.L);
  if (s.hero.wall !== -1) return { ok: false, why: 'not armed' };
  const words = M_WALLJUMP(1, hold);
  let landed = false;
  for (let k = 0; k < words.length; k++) { SB.sim.step(s, words[k]); if (s.hero.ground) landed = true; if (landed && s.hero.vx === 0) break; }
  const h = s.hero, row = Math.floor((h.y + HH - 1) / CS), ov = Math.min(h.x + HW, (lab.gx + 1) * CS) - Math.max(h.x, lab.gx * CS);
  return { ok: h.ground === 1 && row === lab.gy && ov >= K.OVERLAP_SUB, cell: [Math.floor((h.x + (HW >> 1)) / CS), row] };
}
const wallCases = () => { const out = []; const m = ORACLE.clipped('WALL', false); for (let dy = 0; dy <= SB.TUNING.WALL_UP; dy++) for (let dx = 1; dx <= m[dy]; dx++) for (const support of ['#', '=']) out.push({ dx, dy, support }); return out; };
group('H-lab-5', 'LAB-EDGE and LAB-CLEAR for the wall jump: every case the WALL table admits lands, and no cell outside its corridor stops it', t => {
  let n = 0, runs = 0, fails = 0, skipped = 0, noHold = [];
  const core = SB.reach.tables(SB.K, 0).profiles.WALL.paths;
  for (const c of wallCases()) {
    const can = ORACLE.canonical('WALL', 1, c.dx, c.dy);
    /* the lock's 10 steps of push carry the hero about 26 px whatever the rocker does, so a landing 1 across is out of
       reach: no hold, and the core must list no path (no edge) there either */
    if (!can) { if (!noHold.includes(c.dx + ',' + c.dy)) { noHold.push(c.dx + ',' + c.dy); t.eq((core[c.dx + ',' + c.dy] || []).length, 0, 'WALL dx' + c.dx + ' dy' + c.dy + ': no hold lands there, and the model lists no path'); } continue; }
    const cor = ORACLE.corridor(can, 1);
    if (c.support === '#' && cor.has(c.dx + ',' + (c.dy - 1))) { skipped++; continue; }
    /* the oracle counts its hold after the lock (the rocker steers from step 11): the macro holds the rocker from the
       jump step through the lock and the hold */
    const hold = SB.TUNING.WALL_JUMP_LOCK + can.hold;
    const res = runWall(wallLab(c.dx, c.dy, c.support), hold);
    t.ok(res.ok, 'WALL dx' + c.dx + ' dy' + c.dy + ' onto ' + (c.support === '#' ? 'solid' : 'one way') + ': hold ' + can.hold + ' lands (rests at ' + (res.cell || []).join(',') + (res.why ? ', ' + res.why : '') + ')');
    n++;
    let topRow = 0; for (const k of cor) topRow = Math.max(topRow, Number(k.split(',')[1]));
    const bad = [];
    for (let k = -1; k <= c.dx + 1; k++) for (let rr = -1; rr <= topRow + 2; rr++) {
      if (cor.has(k + ',' + rr)) continue;
      const bx = 3 + k, by = 38 - rr;
      if (bx <= 2 || bx >= SB.GRID.W || by < 0 || by >= SB.GRID.H - 1) continue;
      if (bx === 3 + c.dx && (by === 38 - c.dy || by === 38 - c.dy + 1)) continue;
      if (bx === 3 && by >= 38) continue;                       /* the stance's own column below */
      runs++;
      if (!runWall(wallLab(c.dx, c.dy, c.support, [[bx, by]]), hold).ok) { fails++; bad.push(k + ',' + rr); }
    }
    t.ok(bad.length === 0, 'WALL dx' + c.dx + ' dy' + c.dy + ' onto ' + (c.support === '#' ? 'solid' : 'one way') + ': ' + (bad.length ? 'a solid at ' + bad.join(' ') + ' (outside the corridor) stops it' : 'no cell outside the corridor matters'));
  }
  console.log('  info  the wall jump labs: ' + n + ' cases land (' + skipped + ' solid support cases skipped: the support lies in the corridor; no hold at all for ' + noHold.join(' ') + '), ' + runs + ' single solid runs, ' + fails + ' stopped one');
});

/* the other wall and vine edges, one lab each: a touch arms the slide where the model says; a slide reaches the
   floor; a vine climbs (STICKYUP), pops over its top (STICKYTOP), and lets go (LET_GO) */
group('H-lab-6', 'WALLTOUCH, SLIDE, STICKYUP, STICKYTOP and LET_GO in the sim', t => {
  /* WALLTOUCH: from the floor a FULL jump right toward a wall 3 columns away touches it and arms the slide */
  { const lv = LABS.room(['', '', '', '', '', '', '', '', '.....#', '.....#', '.....#', '.....#', '.....#', '.....#', '.S...#', FLOOR]);
    const s = SB.sim.create(lv); SB.sim.attach(s, lv); SB.sim.step(s, 0); SB.sim.step(s, 0);
    let armed = -1; const words = M_JUMP('FULL', 1, 200);
    for (let k = 0; k < 60 && armed < 0; k++) { SB.sim.step(s, words[k]); if (s.hero.wall === 1) armed = k; }
    const g = SB.reach.graph(lv), touchRows = (g.adj[lv.spawn] || []).filter(e => e.kind === 'WALLTOUCH' && ((e.to - g.n) >> 1) % 24 === 4).map(e => Math.floor(((e.to - g.n) >> 1) / 24));
    const row = Math.floor((s.hero.y + HH - 1) / CS);
    t.ok(armed >= 0 && touchRows.includes(row), 'a FULL jump right touches the wall and arms the slide at row ' + row + ', a contact the model lists (' + touchRows.join(' ') + ')'); }
  /* SLIDE: armed high on a wall, the slide reaches the floor below */
  { const lines = []; for (let r = 20; r <= 46; r++) lines.push('..#'); const lv = LABS.room(lines.concat([FLOOR]));
    const s = placed(lv, 3 * CS, 25 * CS); let k = 0; while (!s.hero.ground && k < 600) { SB.sim.step(s, IN.L); k++; }
    t.ok(s.hero.ground === 1 && Math.floor((s.hero.y + HH - 1) / CS) === 46 && s.hero.x === 3 * CS, 'a slide held from row 25 reaches the floor (46) beside the wall (' + k + ' steps)'); }
  /* STICKYUP, STICKYTOP, LET_GO on a vine (Overgrowth): stuck at its foot, A climbs and re sticks higher; at its top
     A pops over onto the ledge beside it; B lets go to the floor */
  { const lines = ['', '..|.'].concat([...Array(12)].map(() => '..|.'), ['', '', '', FLOOR]);
    const lv = LABS.room(lines, { biome: 3 }), g = SB.reach.graph(lv);
    const vRows = [...Array(lv.h).keys()].filter(r => lv.sticky[r * 24 + 2]), top = vRows[0];
    const s = placed(lv, 3 * CS, (vRows[vRows.length - 1] - 1) * CS);
    for (let k = 0; k < 30 && !s.hero.sticky; k++) SB.sim.step(s, 0);
    const y1 = s.hero.y; let k2 = 0; const w1 = M_STICKY(80);
    for (; k2 < w1.length; k2++) { SB.sim.step(s, w1[k2]); if (k2 > 0 && s.hero.sticky) break; }
    t.ok(s.hero.sticky === 1 && s.hero.y < y1, 'STICKYUP: A from the vine climbs and sticks again ' + ((y1 - s.hero.y) / 256).toFixed(0) + ' px higher');
    t.ok((g.adj[g.n + 2 * (Math.floor((y1 + HH - 1) / CS) * 24 + 3)] || []).some(e => e.kind === 'STICKYUP'), 'and the model lists a STICKYUP from that contact');
    /* STICKYTOP by a small macro search (as the bot will): A, then the rocker toward the vine for 1..24 steps from
       the second step (air control), landing on the vine's top, (2, top - 1) */
    let popped = -1;
    for (let hold = 1; hold <= 24 && popped < 0; hold++) {
      const s3 = placed(lv, 3 * CS, (top + 1) * CS); for (let k = 0; k < 30 && !s3.hero.sticky; k++) SB.sim.step(s3, 0);
      for (let k = 0; k < 80; k++) { SB.sim.step(s3, IN.A | (k === 0 ? IN.A_TAP : 0) | (k > 0 && k <= hold ? IN.L : 0)); if (s3.hero.ground) break; }
      if (s3.hero.ground && Math.floor((s3.hero.y + HH - 1) / CS) === top - 1 && Math.floor((s3.hero.x + (HW >> 1)) / CS) <= 2) popped = hold;
    }
    t.ok(popped > 0, 'STICKYTOP: from the vine\'s top contact, A and then the rocker toward the vine land on its top, (2, ' + (top - 1) + ') (rocker ' + popped + ' steps)');
    t.ok((g.adj[g.n + 2 * ((top + 1) * 24 + 3)] || []).some(e => e.kind === 'STICKYTOP' && e.to === (top - 1) * 24 + 2), 'and the model lists that STICKYTOP');
    const s4 = placed(lv, 3 * CS, (top + 4) * CS); for (let k = 0; k < 30 && !s4.hero.sticky; k++) SB.sim.step(s4, 0);
    SB.sim.step(s4, IN.B | IN.B_TAP); let k4 = 0; while (!s4.hero.ground && k4 < 200) { SB.sim.step(s4, 0); k4++; }
    t.ok(s4.hero.ground === 1 && Math.floor((s4.hero.y + HH - 1) / CS) === 46, 'LET_GO: B lets go of the vine, and the fall reaches the floor without sticking again (' + k4 + ' steps)'); }
});

/* ================================================================ the dive and the dash (T0.12b) */
/* M_DIVE hops (A for one step, when `hop`), then presses B on the next step and holds it `hold` steps from there
   (hold 0: a tap shorter than a step, B_TAP alone); M_DASH presses B with the rocker in dir on one grounded step */
const M_DIVE = (hold, hop = true, len = 200) => { const off = hop ? 1 : 0; return Array.from({ length: len }, (_, k) =>
  (hop && k === 0 ? IN.A | IN.A_TAP : 0) | (k === off ? IN.B_TAP : 0) | (k >= off && k < off + hold ? IN.B : 0)); };
const M_DASH = (dir, len = 40) => Array.from({ length: len }, (_, k) => (k === 0 ? rockerOf(dir) | IN.B | IN.B_TAP : 0));
const restRow = s => Math.floor((s.hero.y + HH - 1) / CS);

group('H-sim-13', 'the dive: a tap dive lands on the first one way, a hold dive passes three one ways to the floor, a dive begun in the air never dashes on landing', t => {
  /* three full width one ways at rows 20, 26 and 32, the floor below; the hero falling from row 10, centred in column 11 */
  const lines = []; for (let r = 10; r <= 46; r++) lines.push(r === 20 || r === 26 || r === 32 ? '='.repeat(24) : '');
  const lv = LABS.room(lines.concat([FLOOR])), x0 = 11 * CS + 2 * 256;
  { const s = placed(lv, x0, 10 * CS);
    SB.sim.step(s, IN.B_TAP | IN.R);
    t.ok(s.hero.vy === K.TERM && s.hero.vx === 0 && s.hero.dive === 1, 'the press snaps vy to terminal (' + s.hero.vy + ', TERM ' + K.TERM + ') and vx to zero (' + s.hero.vx + ') with the rocker held');
    let k = 0; while (!s.hero.ground && k < 120) { SB.sim.step(s, IN.R); k++; }
    t.ok(restRow(s) === 19 && s.hero.x === x0, 'a tap dive (B_TAP alone) lands on the first one way (rests on row ' + restRow(s) + ', 19) straight down, the rocker held (x moved ' + (s.hero.x - x0) / 256 + ' px)');
    t.eq(s.hero.shake, K.SHAKE_F, 'its landing sets the shake counter to SHAKE_F');
  }
  { const s = placed(lv, x0, 10 * CS); let k = 0, dashed = 0;
    SB.sim.step(s, IN.B_TAP | IN.B);
    t.eq(s.hero.dive, 2, 'B held makes it a hold dive (dive 2)');
    while (!s.hero.ground && k < 200) { SB.sim.step(s, IN.B); k++; }
    t.eq(restRow(s), 46, 'a hold dive passes the three one ways to the floor');
    const xl = s.hero.x;
    for (let j = 0; j < 30; j++) { SB.sim.step(s, IN.B); if (s.hero.dash > 0) dashed++; }
    t.ok(dashed === 0 && s.hero.x === xl, 'held through the landing and 30 steps more, the dive never becomes a dash (' + dashed + ' dash steps, x moved ' + (s.hero.x - xl) / 256 + ' px)');
  }
  /* a press on the very step the hero lands began in the air: a dive, and no dash follows; a plain landing never shakes */
  { const floorLv = LABS.room([FLOOR]), probe = placed(floorLv, x0, 40 * CS); let n = 0;
    while (!probe.hero.ground && n < 100) { SB.sim.step(probe, 0); n++; }
    t.eq(probe.hero.shake, 0, 'a plain fall\'s landing leaves the shake at 0');
    const s = placed(floorLv, x0, 40 * CS); for (let j = 0; j < n - 1; j++) SB.sim.step(s, 0);
    SB.sim.step(s, IN.B_TAP | IN.B);
    let dashed = 0; const xl = s.hero.x;
    for (let j = 0; j < 30; j++) { SB.sim.step(s, IN.B); if (s.hero.dash > 0) dashed++; }
    t.ok(s.hero.ground === 1 && dashed === 0 && s.hero.x === xl, 'B pressed on the landing step (step ' + n + ') is a dive: it lands, and held 30 steps more never dashes (' + dashed + ')');
  }
});

group('H-sim-14', 'the dash: 48 px in 8 steps, i frames for exactly 4, never off a platform\'s edge, only from a fresh ground press', t => {
  const lv = LABS.room([FLOOR]), s = placed(lv, 4 * CS + 2 * 256, 46 * CS);
  SB.sim.step(s, 0); SB.sim.step(s, 0);
  const x0 = s.hero.x, words = M_DASH(1, 30); let dashSteps = 0, iSteps = 0, x8 = null;
  for (let k = 0; k < words.length; k++) { SB.sim.step(s, words[k]); if (s.hero.dash > 0) dashSteps++; if (s.hero.dashI > 0) iSteps++; if (k === 7) x8 = s.hero.x; }
  t.eq((x8 - x0) / 256, 48, 'a dash covers 48 px in its 8 steps');
  t.ok(dashSteps === 8 && s.hero.x === x8 && s.hero.ground === 1, 'the dash runs exactly 8 steps (' + dashSteps + ') and stops there, grounded (no slide after it)');
  t.eq(iSteps, 4, 'i frames for exactly 4 steps');
  /* the edge: a 5 cell platform (columns 2 to 6) at row 40, solid and then one way, the floor far below */
  for (const [kind, ch] of [['solid', '#'], ['one way', '=']]) {
    const lines = ['..' + ch.repeat(5)].concat(Array(6).fill(''), [FLOOR]);
    const pl = LABS.room(lines);
    for (const [dir, col, want] of [[1, 4, 7 * CS - HW], [-1, 4, 2 * CS]]) {
      const h = placed(pl, col * CS + 2 * 256, 39 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
      const w = M_DASH(dir, 40); for (const word of w) SB.sim.step(h, word);
      t.ok(h.hero.x === want && h.hero.ground === 1 && restRow(h) === 39, 'a dash ' + (dir > 0 ? 'right' : 'left') + ' on a ' + kind + ' platform stops with the leading foot on it (x ' + (h.hero.x / 256).toFixed(2) + ' px, the edge at ' + (want / 256).toFixed(2) + ', rests on row ' + restRow(h) + ')');
    }
  }
  /* only a fresh ground press: B held on the ground with no new press does nothing */
  { const h = placed(lv, 4 * CS + 2 * 256, 46 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
    const xs = h.hero.x; let dashed = 0; for (let k = 0; k < 20; k++) { SB.sim.step(h, IN.B | IN.R * 0); if (h.hero.dash > 0) dashed++; }
    t.ok(dashed === 0 && h.hero.x === xs, 'B held on the ground with no fresh press never dashes (' + dashed + ')'); }
  /* a jump ends a dash: A on its third step leaves the ground with run speed, not the dash's */
  { const h = placed(lv, 4 * CS + 2 * 256, 46 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
    SB.sim.step(h, IN.R | IN.B | IN.B_TAP); SB.sim.step(h, 0); SB.sim.step(h, IN.A | IN.A_TAP | IN.R);
    t.ok(h.hero.dash === 0 && h.hero.vx === K.RUN && h.hero.ground === 0, 'A during a dash jumps and ends it (dash ' + h.hero.dash + ', vx ' + h.hero.vx + ', run ' + K.RUN + ')'); }
});

/* LAB-EDGE and LAB-CLEAR for the dive (the model's FALL straight down, section 3.3): standing on a 3 wide one way at row 20
   (the hero at (11, 19)), a hop, then B held through the one way under the feet and every one way above the target,
   released for the target to catch it. The tap dive is the shortest hold (the next surface); a hold dive goes deeper. */
function diveLab(oneWays, solidRow, extraSolid) {
  const W = SB.GRID.W, H = SB.GRID.H, g = Array.from({ length: H }, () => Array(W).fill('.'));
  g[H - 1] = Array(W).fill('#');
  for (const r of [20].concat(oneWays)) for (let c = 10; c <= 12; c++) g[r][c] = '=';
  if (solidRow) for (let c = 10; c <= 12; c++) g[solidRow][c] = '#';
  if (extraSolid) for (const [ex, ey] of extraSolid) if (g[ey] && g[ey][ex] === '.') g[ey][ex] = '#';
  g[19][11] = 'S';
  return LABS.room(g.map(r => r.join('')));
}
function runDive(lv, hold) {
  const s = SB.sim.create(lv); SB.sim.step(s, 0); SB.sim.step(s, 0);
  const words = M_DIVE(hold);
  for (let k = 0; k < words.length; k++) { SB.sim.step(s, words[k]); if (k > hold + 1 && s.hero.ground) break; }
  return { ok: s.hero.ground === 1, row: restRow(s), col: Math.floor((s.hero.x + (HW >> 1)) / CS) };
}
group('H-lab-7', 'LAB-EDGE and LAB-CLEAR for the dive: every FALL straight down the model lists lands by its shortest hold, the dive reaches nothing else, and no cell beside its column stops it', t => {
  let clearRuns = 0, clearFails = 0;
  for (const [name, oneWays, solidRow] of [['two one ways and the floor', [26, 32], 0], ['two one ways and a solid shelf', [26, 32], 38], ['adjacent one ways', [26, 27], 0]]) {
    const lv = diveLab(oneWays, solidRow), g = SB.reach.graph(lv), start = 19 * 24 + 11;
    const model = (g.adj[start] || []).filter(e => e.kind === 'FALL' && e.dir === 0).map(e => Math.floor(e.to / 24)).sort((a, b) => a - b);
    const byHold = new Map();
    for (let hold = 0; hold <= 40; hold++) { const r = runDive(lv, hold); if (r.ok && r.col === 11 && r.row !== 19 && !byHold.has(r.row)) byHold.set(r.row, hold); }
    const reached = [...byHold.keys()].sort((a, b) => a - b);
    console.log("  info  " + name + ": model " + JSON.stringify(model) + ", the sim by hold " + [...byHold].map(([r, h]) => r + ":" + h).join(" "));
    t.same(reached, model, name + ': the rows the dive rests on by some hold equal the model\'s FALL straight down targets (holds ' + [...byHold].map(([r, h]) => r + ':' + h).join(' ') + ')');
    for (const row of model) {
      const hold = byHold.get(row); if (hold === undefined) continue;
      const bad = [];
      for (const col of [10, 12]) for (let r = 17; r <= row + 1; r++) {
        if (r === 20 || oneWays.includes(r) || r === solidRow) continue;
        clearRuns++;
        const res = runDive(diveLab(oneWays, solidRow, [[col, r]]), hold);
        if (!(res.ok && res.row === row && res.col === 11)) { clearFails++; bad.push(col + ',' + r); }
      }
      clearRuns++;
      const top = runDive(diveLab(oneWays, solidRow, [[11, 17]]), hold);
      if (!(top.ok && top.row === row)) { clearFails++; bad.push('11,17'); }
      t.ok(bad.length === 0, name + ': to row ' + row + ' by hold ' + hold + ', ' + (bad.length ? 'a solid at ' + bad.join(' ') + ' (beside the column) stops it' : 'no solid beside the column or above the hop matters'));
    }
  }
  console.log('  info  the dive labs: ' + clearRuns + ' single solid runs beside the dive\'s column, ' + clearFails + ' stopped it');
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
  t.eq(air.reduce((a, v) => a + v[0], 0), 504 + 336 + 168, 'the drift after the release is 1008 subpixels, 3.94 px (the number Q60 quotes)');
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

/* ================================================================ the capture oracle (T0.5b) */
group('H-cap-0', 'the capture oracle: the area average of known images (the value the make gate holds the canvas path to, H-cap-1)', t => {
  const { downscaleRGB } = require('./tools/capture-oracle.js');
  const img = (w, h, f) => { const px = Buffer.alloc(w * h * 3); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) px.set(f(x, y), (y * w + x) * 3); return { w, h, bpp: 3, px }; };
  const flat = downscaleRGB(img(48, 96, () => [10, 200, 30]), 24, 48);
  t.ok(flat.every((v, i) => v === [10, 200, 30][i % 3]), 'a flat 48x96 image averages to its own colour in every cell');
  const checker = downscaleRGB(img(48, 96, (x, y) => ((x + y) % 2 ? [0, 0, 0] : [255, 255, 255])), 24, 48);
  t.ok(checker.every(v => v === 128), 'a one pixel checker averages to 128 in every cell (510 / 4, rounded)');
  const blocks = downscaleRGB(img(600, 1200, (x, y) => [Math.floor(x / 25) * 10, Math.floor(y / 25) * 5, 7]), 24, 48);
  let off = -1;
  for (let c = 0; c < 24 * 48 && off < 0; c++) { const cx = c % 24, cy = Math.floor(c / 24); if (blocks[3 * c] !== cx * 10 || blocks[3 * c + 1] !== cy * 5 || blocks[3 * c + 2] !== 7) off = c; }
  t.eq(off, -1, 'a 600x1200 image of 25 px blocks gives every cell its own block\'s colour (the first cell that does not)');
});

/* ================================================================ the sim, part one, proven (T0.7b) */
/* a seeded random word script: held bits that change every few steps, the edge bits on presses */
function randomScript(seed, n) {
  const r = hrand(seed), out = [];
  let held = 0, prev = 0;
  for (let k = 0; k < n; k++) {
    if (r.int(7) === 0) held = r.int(16);
    out.push(held | ((held & IN.A) && !(prev & IN.A) ? IN.A_TAP : 0) | ((held & IN.B) && !(prev & IN.B) ? IN.B_TAP : 0));
    prev = held;
  }
  return out;
}

group('H-sim-6', 'determinism: the same script twice, a cross realm clone in lock step, two fresh contexts', t => {
  const f = fixture('sample-room'), lv = buildFx(f, 0), words = randomScript(606, 3600);
  const run = (SBx, level) => { const s = SBx.sim.create(level), hs = []; words.forEach((w, k) => { SBx.sim.step(s, w); if ((k + 1) % 100 === 0) hs.push(SBx.sim.hash(s)); }); return hs; };
  const a = run(SB, lv), b = run(SB, lv);
  t.same(b, a, 'the same 3600 step script from two fresh states: equal hashes at every 100th step');
  const s1 = SB.sim.create(lv), s2 = SB.sim.attach(structuredClone(s1), lv);
  let first = -1;
  for (let k = 0; k < 3600 && first < 0; k++) { SB.sim.step(s1, words[k]); SB.sim.step(s2, words[k]); if (SB.sim.hash(s1) !== SB.sim.hash(s2)) first = k; }
  t.eq(first, -1, 'a structured clone from the harness realm, stepped alongside, hashes equal every step (first divergence)');
  const other = loadCoreFull(PAGE).SB;
  const lv2 = other.pipeline.build(other.record.fromJSON(f.fx.record), {});
  t.same(run(other, lv2), a, 'a second fresh context gives equal hashes at every 100th step');
});

group('H-sim-7', 'coverage: every declared field moves the hash; the keys are exactly the declared ones, after 600 steps too', t => {
  const lv = buildFx(fixture('sample-room'), 0);
  const fresh = () => SB.sim.create(lv);
  const base = SB.sim.hash(fresh());
  /* every leaf path of FIELDS, perturbed by one unit, a flipped flag, an element changed or appended */
  const leaves = [];
  const walk = (schema, path) => {
    for (const [name, type, sub] of schema) {
      const p = path.concat(name);
      if (type === 'obj') walk(sub, p);
      else leaves.push({ p, type, sub });
    }
  };
  walk(SB.sim.FIELDS, []);
  const proto = schema => Object.fromEntries(schema.map(([n, ty]) => [n, ty === 'i32[]' ? [] : ty === 'i32[]?' ? null : ty.startsWith('obj') ? null : 0]));
  for (const { p, type, sub } of leaves) {
    const s = fresh(), key = p[p.length - 1], holder = p.slice(0, -1).reduce((o, k) => o[k], s), v = holder[key];
    if (type === 'i32' || type === 'u32') holder[key] = v + 1;
    else if (type === 'bool') holder[key] = 1 - v;
    else if (type === 'i32[]') holder[key] = v.length ? v.map((x, k) => (k === 0 ? x + 1 : x)) : [1];
    else if (type === 'i32[]?') holder[key] = v === null ? [0] : null;
    else if (type === 'obj[]') holder[key] = v.concat([proto(sub)]);
    else if (type === 'obj?') holder[key] = v === null ? Object.assign(proto(sub), { cells: [] }) : null;
    t.ok(SB.sim.hash(s) !== base, 'perturbing ' + p.join('.') + ' (' + type + ') changes the hash');
  }
  const keysOf = (o, schema, path) => {
    t.same(Object.keys(o), schema.map(x => x[0]), (path || 'state') + ': the keys are exactly the declared list, in order');
    for (const [name, type, sub] of schema) if (type === 'obj') keysOf(o[name], sub, (path ? path + '.' : '') + name);
  };
  const s = fresh();
  keysOf(s, SB.sim.FIELDS, '');
  const words = randomScript(77, 600);
  for (const w of words) SB.sim.step(s, w);
  keysOf(s, SB.sim.FIELDS, '');
});

group('H-sim-8', 'the integer invariant: no float in the state after 3600 random steps; a planted float is named', t => {
  for (const name of ['sample-room', 'shelves-a', 'one-giant-landmark']) {
    const lv = buildFx(fixture(name), 0), s = SB.sim.create(lv), words = randomScript(SB.record.seedOf(lv.rec), 3600);
    let threw = null;
    for (let k = 0; k < words.length && !threw; k++) { SB.sim.step(s, words[k]); try { SB.sim.serialize(s); } catch (e) { threw = 'step ' + k + ': ' + e.message; } }
    t.ok(!threw, name + ': 3600 random steps, serialize never met a float' + (threw ? ' (' + threw + ')' : ''));
  }
  const s = SB.sim.create(buildFx(fixture('sample-room'), 0));
  s.hero.vx = 1.5;
  let msg = '';
  try { SB.sim.serialize(s); } catch (e) { msg = e.message; }
  t.ok(/hero\.vx/.test(msg), 'a planted float in hero.vx makes serialize throw naming the path (' + msg + ')');
});

/* ================================================================ the macros (section 3.9), as word scripts */
/* M_WALK walks dir for n steps; M_JUMP presses A on step 0 and holds it for the profile's frames (FULL the whole arc,
   MID 4, TAP 1) with the rocker in dir for `hold` steps; M_FALL walks off an edge (the rocker for `hold` steps, no A).
   The labs run them tonight; the bot (T0.12a) and the route tools reuse them. */
const A_FRAMES = { FULL: 200, MID: 4, TAP: 1 };
const rockerOf = dir => (dir > 0 ? IN.R : IN.L);
const M_WALK = (dir, n) => Array.from({ length: n }, () => rockerOf(dir));
const M_JUMP = (profile, dir, hold, len = 160) => Array.from({ length: len }, (_, k) =>
  (k < A_FRAMES[profile] ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k < hold ? rockerOf(dir) : 0));
const M_FALL = (dir, hold, len = 160) => Array.from({ length: len }, (_, k) => (k < hold ? rockerOf(dir) : 0));

/* ================================================================ the oracle and the jump labs (T0.7b, section 3.9) */
/* The harness's own stepped arcs and tables, written from section 3.2 and TUNING, never from the core: the oracle
   H-reach-1 compares reach.tables against (T0.10a) and the model the labs hold the sim to tonight. Coordinates are
   subpixels relative to the takeoff cell: x is the box's left edge (2 px in when centred), y the feet (0 is the takeoff
   surface, up is negative). A jump's corridor is the set of cells its CANONICAL path occupies, the smallest rocker hold
   that lands on the target and rests there: the same hold the lab's macro uses, so LAB-CLEAR tests the oracle's
   hitbox extent against the sim's real collisions cell by cell. */
const ORACLE = (() => {
  const T = SB.TUNING, S = 256, CSZ = SB.GRID.CELL * S, HWS = SB.GRID.HERO_W * S, HHS = SB.GRID.HERO_H * S;
  const OV = T.LAND_OVERLAP_PX * S, r = v => Math.round(v * S);
  const PROFILE_A = { FULL: Infinity, MID: 4, TAP: 1, WALL: Infinity, STICKY: Infinity };
  /* one flight: the jump on step 1 (or none: a walk off), the rocker held for `hold` steps in `dir`, then the decel */
  function arc(profile, dir, hold, opts = {}) {
    const deep = !!opts.deep, walk = profile === 'WALK';
    const G = r(T.GRAVITY), GF = deep ? Math.round(G * T.DEEP_FALL_MULT) : G;
    const TERM = deep ? Math.round(r(T.TERMINAL) * T.DEEP_FALL_MULT) : r(T.TERMINAL), CUT = r(T.JUMP_CUT_V);
    const RUN = r(T.RUN), DECEL = Math.round(RUN / T.DECEL_FRAMES);
    /* the wall jump (T0.10a): WALL_JUMP_V up, WALL_JUMP_LOCK steps of WALL_JUMP_PUSH away from the wall, then the rocker
       held away; the sticky jump: STICKY_JUMP_V straight up, no rocker (DESIGN 4.2). Deep changes only FULL, MID and
       TAP's rise; every fall in Deep is the slow one. */
    const wall = profile === 'WALL', sticky = profile === 'STICKY';
    let vy = walk ? 0 : wall ? -r(T.WALL_JUMP_V) : sticky ? -r(T.STICKY_JUMP_V) : -(deep ? r(T.DEEP_JUMP_V) : r(T.JUMP_V)), aHold = walk ? 0 : PROFILE_A[profile];
    /* the stance: centred, but a wall jump starts touching the wall it leaves (flush behind the jump direction) */
    let x = wall ? (dir > 0 ? 0 : CSZ - HWS) : (CSZ - HWS) / 2, y = 0, vx = 0, rising = !walk, airborne = !walk;
    const lock = wall ? T.WALL_JUMP_LOCK : 0, PUSH = r(T.WALL_JUMP_PUSH), d0 = opts.delay !== undefined ? opts.delay : lock;
    if (sticky) hold = 0;
    const out = [{ x, y, vx, vy }];
    for (let f = 1; f < 400; f++) {
      if (f > aHold && rising && vy < -CUT) vy = -CUT;
      if (f <= lock) vx = dir * PUSH;
      else if (f > d0 && f <= d0 + hold) vx = dir * RUN; else if (vx > 0) vx = Math.max(0, vx - DECEL); else if (vx < 0) vx = Math.min(0, vx + DECEL);
      if (walk && !airborne) {
        /* walking: on the ledge until the box has fully left the takeoff cell's support (the cell under x 0..CSZ) */
        x += vx;
        const onLedge = dir > 0 ? x < CSZ : x + HWS > 0;
        if (onLedge) { out.push({ x, y, vx, vy: 0 }); continue; }
        airborne = true;
        vy = Math.min(TERM, vy + G); y += vy;
        out.push({ x, y, vx, vy });
        continue;
      }
      vy = Math.min(TERM, vy + (vy >= 0 ? GF : G));
      if (vy >= 0) rising = false;
      x += vx; y += vy;
      out.push({ x, y, vx, vy });
      if (y > 30 * CSZ) break;
    }
    return out;
  }
  const crossing = (a, rowsUp) => { const top = -rowsUp * CSZ; for (let f = 1; f < a.length; f++) if (a[f].vy > 0 && a[f - 1].y <= top && a[f].y > top) return f; return -1; };
  const overlap = (x, c) => Math.min(x + HWS, (c + 1) * CSZ) - Math.max(x, c * CSZ);
  const farCell = (x, dir) => dir > 0 ? Math.floor((x + HWS - OV) / CSZ) : Math.floor((x + OV - 1) / CSZ);
  function table(profile, deep) {
    const a = arc(profile, 1, Infinity, { deep }), out = [];
    for (let dy = 0; dy <= 5; dy++) { const f = crossing(a, dy); out.push(f < 0 ? -1 : profile === 'STICKY' ? 0 : farCell(a[f].x, 1)); }
    return out;
  }
  /* DESIGN's cone: JUMP_UP and JUMP_ACROSS (Deep one more up, Q22), WALL_UP and WALL_ACROSS, STICKY_UP straight up */
  function caps(profile, deep) {
    if (profile === 'WALL') return [T.WALL_UP, T.WALL_ACROSS];
    if (profile === 'STICKY') return [T.STICKY_UP, 0];
    return [deep ? T.JUMP_UP + T.DEEP_EXTRA_UP : T.JUMP_UP, T.JUMP_ACROSS];
  }
  function clipped(profile, deep) {
    const [up, across] = caps(profile, deep);
    return table(profile, deep).map((dx, dy) => (dy > up || dx < 0 ? -1 : Math.min(dx, across)));
  }
  /* the apex (subpixels above the takeoff surface), the air (the step it lands back at the takeoff height), the whole
     arc's row span per column (the box as the SIM sees it: x to x + 12 px less one subpixel, the feet to 16 px above;
     the landing step snapped onto the surface), the walk off and jump down tables */
  const apex = (profile, deep) => -Math.min(...arc(profile, 1, Infinity, { deep }).map(p => p.y));
  const air = (profile, deep) => crossing(arc(profile, 1, Infinity, { deep }), 0);
  function cols(profile, deep) {
    const a = arc(profile, 1, Infinity, { deep }), last = crossing(a, 0), out = [];
    for (let f = 0; f <= last; f++) {
      const x = a[f].x, feet = f === last ? 0 : -a[f].y;
      for (let k = Math.floor(x / CSZ); k <= Math.floor((x + HWS - 1) / CSZ); k++)
        for (let row = Math.floor(feet / CSZ); row <= Math.floor((feet + HHS - 1) / CSZ); row++) {
          out[k] = out[k] || [row, row]; out[k][0] = Math.min(out[k][0], row); out[k][1] = Math.max(out[k][1], row);
        }
    }
    return out;
  }
  const below = (profile, rows, deep) => { const a = arc(profile, 1, Infinity, { deep }), out = [-1]; for (let d = 1; d <= rows; d++) { const f = crossing(a, -d); out.push(f < 0 ? -1 : farCell(a[f].x, 1)); } return out; };
  /* after landing at step f the ground decel runs out; where does the box rest? */
  function restX(a, f, hold, dir, d0 = 0) {
    const RUN = r(T.RUN), DECEL = Math.round(RUN / T.DECEL_FRAMES);
    let x = a[f].x, vx = a[f].vx;
    for (let k = f + 1; k < f + 80; k++) {
      if (k > d0 && k <= d0 + hold) vx = dir * RUN; else if (vx > 0) vx = Math.max(0, vx - DECEL); else if (vx < 0) vx = Math.min(0, vx + DECEL); else break;
      x += vx;
    }
    return x;
  }
  /* the canonical hold: the smallest whose landing and resting box both overlap the target column by LAND_OVERLAP */
  function canonical(profile, dir, dx, rowsUp, opts = {}) {
    const d0 = opts.delay !== undefined ? opts.delay : profile === 'WALL' ? T.WALL_JUMP_LOCK : 0;
    for (let h = 0; h <= 60; h++) {
      const a = arc(profile, dir, h, opts), f = crossing(a, rowsUp);
      if (f < 0) continue;
      const c = dir * dx;
      if (overlap(a[f].x, c) >= OV && overlap(restX(a, f, h, dir, d0), c) >= OV) return { hold: h, land: f, a, rowsUp };
    }
    return null;
  }
  /* the late path (section 3.3's other candidate): the rocker starts once the feet are above the target's top */
  function lateCanonical(profile, dir, dx, rowsUp, opts = {}) {
    const a = arc(profile, dir, 0, opts), top = -rowsUp * CSZ;
    let d0 = -1; for (let f = 1; f < a.length; f++) if (a[f].y <= top) { d0 = f; break; }
    return d0 > 1 ? canonical(profile, dir, dx, rowsUp, Object.assign({}, opts, { delay: d0 })) : null;
  }
  /* the cells the box occupies from takeoff to the landing step: 'k,r' with k columns in the jump direction and r rows
     up (negative r is below the takeoff row) */
  function corridor(c, dir) {
    const cells = new Set();
    /* the sim resolves x first, at the previous step's height, then y: so each step sweeps the box at (new x, old y)
       as well as at (new x, new y). Missing the first is exactly what LAB-CLEAR caught on the far column. */
    const box = (x, y) => {
      const x0 = Math.floor(x / CSZ), x1 = Math.floor((x + HWS - 1) / CSZ);
      const y0 = Math.floor((y - HHS) / CSZ), y1 = Math.floor((y - 1) / CSZ);
      for (let cx = x0; cx <= x1; cx++) for (let cy = y0; cy <= y1; cy++) cells.add((cx * dir) + ',' + (-cy - 1));
    };
    /* the landing step's box as the sim leaves it, snapped onto the target's top: never the support it lands through */
    for (let k = 0; k <= c.land; k++) {
      box(c.a[k].x, k === c.land ? -c.rowsUp * CSZ : c.a[k].y);
      if (k > 0) box(c.a[k].x, c.a[k - 1].y);
    }
    return cells;
  }
  return { arc, crossing, table, clipped, caps, apex, air, cols, fall: deep => below('WALK', 24, deep), down: deep => below('FULL', 8, deep), canonical, lateCanonical, corridor, CSZ, OV };
})();

/* A lab room for one jump: the takeoff cell on a solid support, the target on a solid or one way support, everything
   else open, the floor far below. Returns the level and where things are. */
function jumpLab(dir, dx, rowsUp, support, extraSolid) {
  const W = SB.GRID.W, H = SB.GRID.H, tx = dir > 0 ? 3 : W - 4, ty = 38;
  const g = Array.from({ length: H }, () => Array(W).fill('.'));
  g[H - 1] = Array(W).fill('#');
  g[ty + 1][tx] = '#';
  const gx = tx + dir * dx, gy = ty - rowsUp;
  g[ty][tx] = 'S';
  if (extraSolid) for (const [ex, ey] of extraSolid) if (g[ey] && g[ey][ex] !== undefined && g[ey][ex] === '.') g[ey][ex] = '#';
  const lv = LABS.room(g.map(row => row.join('')));
  const si = (gy + 1) * W + gx;
  if (gy + 1 < H - 1) { if (support === '#') lv.solid[si] = 1; else lv.plat[si] = 1; }
  return { lv, tx, ty, gx, gy };
}
/* run a jump macro: A from step 0 for the profile's frames (none for a walk off), the rocker in dir for `hold` steps;
   PASS when the hero rests grounded standing in the target row with the box over the target column by LAND_OVERLAP */
function runJump(lab, profile, dir, hold) {
  const s = SB.sim.create(lab.lv);
  SB.sim.step(s, 0); SB.sim.step(s, 0);
  const aFrames = profile === 'WALK' ? 0 : A_FRAMES[profile], words = profile === 'WALK' ? M_FALL(dir, hold) : M_JUMP(profile, dir, hold);
  for (let k = 0; k < words.length; k++) {
    SB.sim.step(s, words[k]);
    if (k > aFrames && k > hold && s.hero.ground && s.hero.vx === 0) break;
  }
  const h = s.hero, row = Math.floor((h.y + HH - 1) / CS);
  const ov = Math.min(h.x + HW, (lab.gx + 1) * CS) - Math.max(h.x, lab.gx * CS);
  return { ok: h.ground === 1 && row === lab.gy && ov >= K.OVERLAP_SUB, cell: [Math.floor((h.x + (HW >> 1)) / CS), row] };
}
/* every case the tables admit: FULL, MID, TAP, both directions, onto a solid and onto a one way top (straight up only
   onto a one way); jump downs 1..8 rows (FULL, the far cell at that depth); walk offs 1..8 rows */
function labCases() {
  const cases = [];
  for (const profile of ['FULL', 'MID', 'TAP']) {
    const row = ORACLE.clipped(profile, false);
    for (const dir of [1, -1]) for (let dy = 0; dy <= 5; dy++) for (let dx = 0; dx <= row[dy]; dx++) {
      if (dx === 0 && dy === 0) continue;
      for (const support of dx === 0 ? ['='] : ['#', '=']) cases.push({ kind: 'JUMP', profile, dir, dx, rowsUp: dy, support });
    }
  }
  for (const [profile, kind] of [['FULL', 'JUMP_DOWN'], ['WALK', 'WALK_OFF']]) for (const dir of [1, -1]) for (let down = 1; down <= 8; down++) {
    const a = ORACLE.arc(profile, 1, Infinity), f = ORACLE.crossing(a, -down);
    if (f < 0) continue;
    const far = Math.floor((a[f].x + SB.GRID.HERO_W * 256 - ORACLE.OV) / ORACLE.CSZ);
    for (const dx of [far, Math.max(1, far - 2)]) cases.push({ kind, profile, dir, dx, rowsUp: -down, support: '#' });
  }
  return cases;
}
const caseName = c => c.kind + ' ' + c.profile + ' ' + (c.dir > 0 ? 'right' : 'left') + ' dx' + c.dx + ' dy' + c.rowsUp + ' onto ' + (c.support === '#' ? 'solid' : 'one way');

group('H-lab-1', 'LAB-EDGE: every jump the tables admit lands on its target in the sim, by its canonical hold', t => {
  let n = 0, skipped = 0;
  for (const c of labCases()) {
    const can = ORACLE.canonical(c.profile, c.dir, c.dx, c.rowsUp);
    if (!can) { t.ok(false, caseName(c) + ': the oracle finds no canonical hold'); continue; }
    if (c.support === '#' && ORACLE.corridor(can, c.dir).has(c.dx + ',' + (c.rowsUp - 1))) { skipped++; continue; }
    const lab = jumpLab(c.dir, c.dx, c.rowsUp, c.support);
    const res = runJump(lab, c.profile, c.dir, can.hold);
    t.ok(res.ok, caseName(c) + ': hold ' + can.hold + ' lands on the target (rests at ' + res.cell.join(',') + ', target ' + lab.gx + ',' + lab.gy + ')', res.ok ? undefined : lab.lv.rows.slice(lab.gy - 2, lab.ty + 3).join('\n'));
    n++;
  }
  console.log('  info  LAB-EDGE ran ' + n + ' cases; ' + skipped + ' solid support cases skipped (the support lies in the canonical corridor: the model claims no such edge)');
  /* the measured numbers (T0.7b writes them into PROGRESS): each profile's apex and its across table, by dy 0..5 */
  for (const profile of ['FULL', 'MID', 'TAP']) {
    const a = ORACLE.arc(profile, 1, Infinity), apex = -Math.min(...a.map(p => p.y)) / 256;
    console.log('  info  ' + profile + ': apex ' + apex.toFixed(2) + ' px (' + (apex / 16).toFixed(2) + ' cells), across by dy 0..5 ' + JSON.stringify(ORACLE.table(profile, false)) + ', clipped ' + JSON.stringify(ORACLE.clipped(profile, false)));
  }
});

group('H-lab-2', 'LAB-CLEAR: a solid in any cell of the move\'s box outside the corridor never stops the jump', t => {
  let runs = 0, fails = 0;
  for (const c of labCases()) {
    const can = ORACLE.canonical(c.profile, c.dir, c.dx, c.rowsUp);
    if (!can) continue;
    const cor = ORACLE.corridor(can, c.dir);
    if (c.support === '#' && cor.has(c.dx + ',' + (c.rowsUp - 1))) continue;
    let topRow = 0; for (const k of cor) topRow = Math.max(topRow, Number(k.split(',')[1]));
    const lab0 = jumpLab(c.dir, c.dx, c.rowsUp, c.support);
    const bad = [];
    for (let k = -1; k <= c.dx + 1; k++) for (let rr = Math.min(-1, c.rowsUp - 1); rr <= topRow + 2; rr++) {
      const key = k + ',' + rr;
      if (cor.has(key)) continue;
      const bx = lab0.tx + c.dir * k, by = lab0.ty - rr;
      if (bx < 0 || bx >= SB.GRID.W || by < 0 || by >= SB.GRID.H - 1) continue;
      if ((bx === lab0.gx && (by === lab0.gy || by === lab0.gy + 1)) || (bx === lab0.tx && (by === lab0.ty || by === lab0.ty + 1))) continue;
      const lab = jumpLab(c.dir, c.dx, c.rowsUp, c.support, [[bx, by]]);
      runs++;
      if (!runJump(lab, c.profile, c.dir, can.hold).ok) { fails++; bad.push(key); }
    }
    t.ok(bad.length === 0, caseName(c) + ': ' + (bad.length ? 'a solid at ' + bad.join(' ') + ' (outside the corridor) stops it' : 'no cell outside the corridor matters'));
  }
  console.log('  info  LAB-CLEAR ran ' + runs + ' single solid runs, ' + fails + ' stopped a jump');
});

group('H-lab-3', 'LAB-NOT (a warning tonight): one beyond the table in height and in reach is not reached', t => {
  const warn = [];
  for (const profile of ['FULL', 'MID', 'TAP']) {
    const raw = ORACLE.table(profile, false);
    const maxUp = raw.reduce((m, dx, dy) => (dx >= 0 ? dy : m), -1);
    for (const dir of [1, -1]) {
      for (const [dx, dy] of [[0, maxUp + 1], [raw[0] + 1, 0]]) {
        if (dy > 6) continue;
        const lab = jumpLab(dir, dx, dy, dx === 0 ? '=' : '#');
        let reached = false;
        for (let hold = 0; hold <= 40 && !reached; hold++) if (runJump(lab, profile, dir, hold).ok) reached = true;
        if (reached) warn.push(profile + ' ' + (dir > 0 ? 'right' : 'left') + ' dx' + dx + ' dy' + dy);
      }
    }
  }
  console.log('  ' + (warn.length ? 'WARN  LAB-NOT: the sim reaches beyond its table at ' + warn.join(', ') : 'info  LAB-NOT: nothing beyond the tables is reached'));
  t.ok(true, 'LAB-NOT ran (a warning until M3, T3.5)');
});

/* ================================================================ the reach tables (T0.10a, section 3.2) */
const TABLES_JSON = path.join(__dirname, 'fixtures', 'tables.json'), REACH_PROFILES = ['FULL', 'MID', 'TAP', 'WALL', 'STICKY'];
/* the harness's own tables, from the ORACLE (never from the core): what --retable writes into fixtures/tables.json */
function oracleTables() {
  const one = deep => ({
    profiles: Object.fromEntries(REACH_PROFILES.map(p => [p, { apex: ORACLE.apex(p, deep), air: ORACLE.air(p, deep), raw: ORACLE.table(p, deep), maxAcross: ORACLE.clipped(p, deep), cols: ORACLE.cols(p, deep) }])),
    fall: ORACLE.fall(deep), down: ORACLE.down(deep) });
  return { base: one(false), deep: one(true) };
}
const coreTables = deep => {
  const t = SB.reach.tables(SB.K, deep ? 2 : 0);
  return { profiles: Object.fromEntries(REACH_PROFILES.map(p => [p, { apex: t.profiles[p].apex, air: t.profiles[p].air, raw: Array.from(t.profiles[p].raw), maxAcross: Array.from(t.profiles[p].maxAcross), cols: Array.from(t.profiles[p].cols, c => Array.from(c)) }])),
    fall: Array.from(t.fall), down: Array.from(t.down) };
};
/* --retable --why "...": the only way fixtures/tables.json changes; it prints what moved, and the why goes in PROGRESS */
if (ARGS.includes('--retable')) {
  const why = opt('why');
  if (!why) { console.log('FAIL  --retable needs --why "the reason" (it goes in PROGRESS.md)'); process.exit(1); }
  const next = Object.assign({ v: 1, why }, oracleTables());
  let old = null; try { old = JSON.parse(fs.readFileSync(TABLES_JSON, 'utf8')); } catch (e) { /* a first table */ }
  const flat = (o, pre = '') => Object.entries(o || {}).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, pre + k + '.') : [[pre + k, JSON.stringify(v)]]));
  const a = new Map(flat(old)), b = new Map(flat(next));
  const moved = [...new Set([...a.keys(), ...b.keys()])].filter(k => k !== 'why' && a.get(k) !== b.get(k));
  console.log(old ? 'retable: ' + moved.length + ' entries moved' : 'retable: the first tables');
  for (const k of moved) console.log('  ' + k + ': ' + (a.get(k) || '(none)') + ' -> ' + (b.get(k) || '(none)'));
  fs.writeFileSync(TABLES_JSON, JSON.stringify(next, null, 1).replace(/\[\s+([-0-9,\s]+?)\s+\]/g, (m, inner) => '[' + inner.replace(/\s+/g, '') + ']') + '\n');
  console.log('RETABLE written: ' + TABLES_JSON + ' (why: ' + why + ')');
  process.exit(0);
}

group('H-reach-1', 'reach.tables equals the harness\'s own stepped tables (the oracle of T0.7b): every profile, both biomes, every corridor', t => {
  for (const deep of [false, true]) {
    const o = oracleTables()[deep ? 'deep' : 'base'], c = coreTables(deep), tag = deep ? 'Deep ' : '';
    for (const p of REACH_PROFILES) for (const f of ['apex', 'air', 'raw', 'maxAcross', 'cols'])
      t.same(c.profiles[p][f], o.profiles[p][f], tag + p + ' ' + f + ': the core equals the oracle');
    t.same(c.fall, o.fall, tag + 'the walk off table fall[1..24]: the core equals the oracle');
    t.same(c.down, o.down, tag + 'the jump down table down[1..8]: the core equals the oracle');
    /* each corridor in the cone: the core's immediate path sweeps exactly the cells of the oracle's canonical hold */
    const ct = SB.reach.tables(SB.K, deep ? 2 : 0);
    let n = 0, firstOff = null;
    for (const p of REACH_PROFILES) {
      const clip = ORACLE.clipped(p, deep);
      for (let dy = 0; dy <= 5; dy++) for (let dx = 0; dx <= clip[dy]; dx++) {
        const can = ORACLE.canonical(p, 1, dx, dy, { deep }), mine = (ct.profiles[p].paths[dx + ',' + dy] || [])[0];
        const want = can ? [...ORACLE.corridor(can, 1)].sort().join(' ') : 'none', got = mine ? mine.cells.map(q => q[0] + ',' + q[1]).sort().join(' ') : 'none';
        n++;
        if (want !== got && !firstOff) firstOff = tag + p + ' dx' + dx + ' dy' + dy + ': core [' + got + '] oracle [' + want + ']';
      }
    }
    t.ok(!firstOff, tag + 'all ' + n + ' corridors in the cone: the core\'s immediate path equals the oracle\'s canonical corridor' + (firstOff ? ' (first: ' + firstOff + ')' : ''));
  }
});

group('H-reach-1b', 'the known answers: fixtures/tables.json equals the oracle, and both carry section 3.2\'s numbers', t => {
  let j = null; try { j = JSON.parse(fs.readFileSync(TABLES_JSON, 'utf8')); } catch (e) { /* missing */ }
  t.ok(!!j && typeof j.why === 'string' && j.why.length > 0, 'fixtures/tables.json exists with its why (written only by --retable)');
  if (!j) return;
  const o = oracleTables();
  for (const b of ['base', 'deep']) t.same(JSON.parse(JSON.stringify({ profiles: j[b].profiles, fall: j[b].fall, down: j[b].down })), JSON.parse(JSON.stringify(o[b])), 'tables.json ' + b + ' equals the oracle (else: --retable --why)');
  /* section 3.2's table, typed here from the plan: apex in px to 0.1, the air in steps, the raw table by dy 0..5 */
  const PLAN = { FULL: [69.6, 34, [6, 6, 5, 5, 4, -1]], MID: [52.7, 29, [5, 5, 4, 3, -1, -1]], TAP: [31.4, 22, [4, 3, -1, -1, -1, -1]],
    /* WALL's numbers by the flush stance (section 3.1: a wall jump starts touching its wall), not the plan's centred
       one, which ran 2 px farther than the sim can: 3 up reaches 3 across, not 4 (QUESTIONS Q64) */
    WALL: [54.3, 30, [5, 5, 4, 3, -1, -1]], STICKY: [69.6, 34, [0, 0, 0, 0, 0, -1]] };
  const PLAN_DEEP = { FULL: [85.5, 40, [7, 6, 6, 6, 5, 4]], WALL: [54.3, 32, [5, 5, 4, 4, -1, -1]] };
  for (const [set, plan] of [['base', PLAN], ['deep', PLAN_DEEP]]) for (const [p, [apex, air, raw]] of Object.entries(plan)) {
    const e = j[set].profiles[p];
    t.eq(Math.round(e.apex / 25.6) / 10, apex, (set === 'deep' ? 'Deep ' : '') + p + ': apex ' + apex + ' px (section 3.2)');
    t.eq(e.air, air, (set === 'deep' ? 'Deep ' : '') + p + ': air ' + air + ' steps (section 3.2)');
    t.same(e.raw, raw, (set === 'deep' ? 'Deep ' : '') + p + ': the raw table by dy 0..5 (section 3.2)');
  }
  /* the whole arc's column spans (section 3.2's corridor paragraph); FULL's k2 is 2..5 where the plan prints 3..5: at
     step 7 the box (x 20.4 px) overlaps column 2 by 0.4 px, which the sim's collision counts and the plan's per pixel
     formula drops (QUESTIONS Q64: the model may be stingier than the sim, never more generous) */
  const PLAN_COLS = { FULL: [[0, 3], [0, 4], [2, 5], [3, 5], [1, 5], [0, 3], [0, 1]], MID: [[0, 3], [0, 4], [2, 4], [1, 4], [0, 3], [0, 1]],
    TAP: [[0, 2], [0, 2], [1, 2], [0, 2], [0, 1]], WALL: [[0, 3], [0, 4], [2, 4], [2, 4], [0, 3], [0, 2]] /* k0 by the flush stance, Q64 */ };
  for (const [p, cols] of Object.entries(PLAN_COLS)) t.same(j.base.profiles[p].cols, cols, p + ': the whole arc\'s rows per column (section 3.2' + (p === 'FULL' ? ', k2 per Q64' : '') + ')');
  t.same([1, 4, 8].map(d => j.base.down[d]), [6, 7, 8], 'the jump down table: dx 6 at one row down, 7 at four, 8 at eight (section 3.2)');
  /* the walk off table: section 3.2 prints a fall that starts at once from the takeoff spot (2 at 1 to 2 rows, 3 at 3 to
     4, 4 at 6 to 8, 5 at 12, 6 at 16, 7 at 24); the sim walks until the box leaves the ledge first, which reaches one
     column further at 2, 4, 7, 8, 12 and 24 rows (the T0.7b labs land those walk offs): the model takes the sim's walk
     (QUESTIONS Q64) */
  t.same([1, 2, 3, 4, 6, 7, 8, 12, 16, 24].map(d => j.base.fall[d]), [2, 3, 3, 4, 4, 5, 5, 6, 6, 8], 'the walk off table at 1, 2, 3, 4, 6, 7, 8, 12, 16 and 24 rows (the sim\'s walk, Q64)');
});

group('H-reach-2', 'the clip: no entry exceeds DESIGN\'s cone caps, and none exceeds the raw table', t => {
  const T = SB.TUNING;
  for (const deep of [false, true]) {
    const tb = SB.reach.tables(SB.K, deep ? 2 : 0);
    for (const p of REACH_PROFILES) {
      const [up, across] = ORACLE.caps(p, deep), m = tb.profiles[p].maxAcross, raw = tb.profiles[p].raw;
      let bad = '';
      for (let dy = 0; dy <= 5; dy++) {
        if (dy > up && m[dy] !== -1) bad += ' dy' + dy + ' above the up cap ' + up;
        if (m[dy] > across) bad += ' dy' + dy + ' across ' + m[dy] + ' over ' + across;
        if (m[dy] > raw[dy]) bad += ' dy' + dy + ' clipped ' + m[dy] + ' over raw ' + raw[dy];
      }
      t.ok(!bad, (deep ? 'Deep ' : '') + p + ': within up ' + up + ' and across ' + across + (bad ? ' (' + bad.trim() + ')' : ''));
    }
  }
  t.eq(SB.reach.tables(SB.K, 0).profiles.FULL.maxAcross[4], T.JUMP_UP, 'DESIGN\'s 4 up reaches 4 across, not 5: the cone is a bounding box (Q7)');
});

group('H-reach-10', 'the sample room\'s beats against the tables (a warning tonight; T0.11b asserts its ascent)', t => {
  const tb = SB.reach.tables(SB.K, 0), beats = fixture('sample-room').fx.expect.beats, warn = [], seen = [];
  for (const b of beats) {
    if (b.kind === 'JUMP') {
      const dy = b.from[1] - b.to[1], dx = Math.abs(b.to[0] - b.from[0]), by = ['FULL', 'MID', 'TAP'].find(p => dy >= 0 && dy <= 5 && tb.profiles[p].maxAcross[dy] >= dx);
      (by ? seen : warn).push('JUMP ' + dx + ' across ' + dy + ' up' + (by ? ' (' + by + ')' : ''));
    } else if (b.kind === 'WALLJUMP') {
      const dy = b.contact[1] - b.to[1], dx = Math.abs(b.to[0] - b.contact[0]), ok = dy >= 0 && dy <= 5 && tb.profiles.WALL.maxAcross[dy] >= dx;
      (ok ? seen : warn).push('WALLJUMP ' + dx + ' away ' + dy + ' up');
    } else if (b.kind === 'FALL') {
      const down = b.to[1] - b.from[1], dx = Math.abs(b.to[0] - b.from[0]), ok = down >= 1 && down <= 24 && tb.fall[down] >= dx;
      (ok ? seen : warn).push('FALL ' + dx + ' across ' + down + ' down');
    }
  }
  console.log('  ' + (warn.length ? 'WARN  H-reach-10 beats outside the tables: ' + warn.join('; ') : 'info  H-reach-10 every beat is inside the tables: ' + seen.join('; ')));
  t.ok(true, 'H-reach-10 ran (a warning until T0.11b)');
});

/* ================================================================ the reach graph (T0.10b, sections 3.1, 3.3 to 3.6) */
const gname = (g, v) => v < g.n ? '(' + (v % g.w) + ',' + Math.floor(v / g.w) + ')' : 'c(' + (((v - g.n) >> 1) % g.w) + ',' + Math.floor(((v - g.n) >> 1) / g.w) + (((v - g.n) & 1) ? ' R' : ' L') + ')';
const cnode = (g, x, y, side) => g.n + 2 * (y * g.w + x) + (side > 0 ? 1 : 0);
const edgesOf = g => g.adj.flatMap(es => es || []);
const hasEdge = (g, from, to, kind) => (g.adj[from] || []).some(e => e.to === to && (!kind || e.kind === kind));
/* a breadth first search with parents, written here (the core's distances is what it checks) */
function bfsPath(g, from, to) {
  const par = new Map([[from, null]]), q = [from];
  for (let h = 0; h < q.length; h++) { const u = q[h]; if (u === to) break; for (const e of g.adj[u] || []) if (!par.has(e.to)) { par.set(e.to, e); q.push(e.to); } }
  if (!par.has(to)) return null;
  const path = []; for (let v = to; par.get(v); v = par.get(v).from) path.unshift(par.get(v));
  return path;
}

group('H-reach-3', 'shelves-a: the hand listed edges exist and the hand listed non edges do not', t => {
  const lv = buildFx(fixture('shelves-a'), 0), g = SB.reach.graph(lv), at = (x, y) => y * lv.w + x;
  t.ok(hasEdge(g, at(9, 42), at(11, 39), 'JUMP'), 'S1 (9, 42) to S2 (11, 39): a 3 up, 2 across JUMP');
  const touched = [35, 36].filter(y => [...Array(10).keys()].some(k => hasEdge(g, at(10 + k, 39), cnode(g, 19, y, 1), 'WALLTOUCH')));
  t.same(touched, [35, 36], 'from S2 a WALLTOUCH onto the pillar\'s left side at (19, 35) and (19, 36)');
  /* (3 away since T0.12a's flush wall stance: 3 up reaches 3 across, Q64; the design's (15, 32) is 4 away) */
  t.ok(hasEdge(g, cnode(g, 19, 35, 1), at(16, 32), 'WALLJUMP'), 'a WALLJUMP off the pillar at (19, 35) onto S3 at (16, 32): 3 away, 3 up');
  t.ok(hasEdge(g, at(5, 19), at(5, 42), 'FALL'), 'a straight FALL from S6 (5, 19) through S5 and S4 onto S1 (5, 42)');
  const bad = edgesOf(g).filter(e => e.kind === 'JUMP' && (e.dy >= 5 || (e.dy === 4 && e.dx >= 5)));
  t.eq(bad.length, 0, 'no JUMP is 5 up, and none is 4 up and 5 across (' + bad.slice(0, 3).map(e => gname(g, e.from) + ' to ' + gname(g, e.to)).join(', ') + ')');
});

group('H-reach-4', 'every edge\'s corridor is open, rechecked from the oracle\'s own paths on every fixture', t => {
  const S = (lv, x, y) => x < 0 || x >= lv.w || y < 0 || y >= lv.h || lv.solid[y * lv.w + x] === 1;
  /* the oracle's rightward path, mapped by the edge's direction (every start is centred, so the arcs mirror exactly) */
  const openBy = (lv, c, sx, sy, dir) => !!c && [...ORACLE.corridor(c, 1)].every(k => { const [dk, r] = k.split(',').map(Number); return !S(lv, sx + dir * dk, sy - r); });
  let checked = 0;
  for (const f of FIXTURES) {
    const lv = buildFx(f, 0);
    if (lv.needsCrop) continue;
    const g = SB.reach.graph(lv), deep = lv.biome === 2, bad = [];
    for (const e of edgesOf(g)) {
      const cell = e.from < g.n ? e.from : (e.from - g.n) >> 1, fx = cell % g.w, fy = Math.floor(cell / g.w);
      const toCell = e.to < g.n ? e.to : (e.to - g.n) >> 1, ty = Math.floor(toCell / g.w);
      let ok = true, counted = true;
      if (e.kind === 'JUMP') ok = [ORACLE.canonical(e.profile, 1, e.dx, e.dy, { deep }), ORACLE.lateCanonical(e.profile, 1, e.dx, e.dy, { deep })].some(c => openBy(lv, c, fx, fy, e.dir || -1));
      else if (e.kind === 'JUMP_DOWN') ok = openBy(lv, ORACLE.canonical('FULL', 1, e.dx, e.dy, { deep }), fx, fy, e.dir || -1);
      else if (e.kind === 'FALL' && e.dx > 0) ok = openBy(lv, ORACLE.canonical('WALK', 1, e.dx, e.dy, { deep }), fx, fy, e.dir);
      else if (e.kind === 'FALL' || e.kind === 'SLIDE') { for (let y = fy + 1; y <= ty; y++) if (S(lv, fx, y)) ok = false; }
      else if (e.kind === 'WALLJUMP' && e.dx > 0) ok = openBy(lv, ORACLE.canonical('WALL', 1, e.dx, e.dy, { deep }), fx, fy, e.dir);
      else counted = false;
      if (counted) checked++;
      if (!ok) bad.push(e.kind + (e.profile ? ' ' + e.profile : '') + ' ' + gname(g, e.from) + ' to ' + gname(g, e.to));
    }
    t.eq(bad.length, 0, f.name + ': every JUMP, JUMP_DOWN, FALL, SLIDE and WALLJUMP corridor is open by the oracle (' + bad.slice(0, 3).join('; ') + ')');
  }
  console.log('  info  H-reach-4 rechecked ' + checked + ' corridors over the corpus');
});

group('H-reach-5', 'the lab rooms: gaps, ledges, a ceiling, one ways, a shaft and a wall chain', t => {
  const at = (lv, x, y) => y * lv.w + x;
  const jumpsBetween = (lv, g, fromXs, row, toXs, row2) => fromXs.some(a => toXs.some(b => hasEdge(g, at(lv, a, row), at(lv, b, row2), 'JUMP')));
  /* a gap: two one way ledges at row 41, the far one starting D columns past the near one's last cell */
  for (const [D, want] of [[5, true], [6, false]]) {
    const lv = LABS.room(['====' + '.'.repeat(D - 1) + '====', '', '', '', '', '', FLOOR]), g = SB.reach.graph(lv);
    t.eq(jumpsBetween(lv, g, [0, 1, 2, 3], 40, [3 + D, 4 + D, 5 + D, 6 + D], 40), want, 'a landing ' + D + ' across at the same height is ' + (want ? '' : 'not ') + 'a JUMP');
  }
  /* a 4 high ledge: a one cell one way 4 rows above the floor, dx columns from the takeoff */
  for (let dx = 1; dx <= 5; dx++) {
    const lv = LABS.room([' '.repeat(2 + dx).replace(/ /g, '.') + '=', '', '', '', FLOOR]), g = SB.reach.graph(lv);
    t.eq(hasEdge(g, at(lv, 2, 46), at(lv, 2 + dx, 42), 'JUMP'), dx <= 4, 'a ledge 4 up and ' + dx + ' across is ' + (dx <= 4 ? '' : 'not ') + 'reached');
  }
  /* a ceiling cell in the corridor: the 3 up, 2 across jump from (5, 46) to (7, 43); a solid at (6, 42) cuts every profile */
  for (const ceiling of [false, true]) {
    const lv = LABS.room([ceiling ? '......#' : '', '', '.......=', '', '', FLOOR]), g = SB.reach.graph(lv);   /* rows 42..47 */
    t.eq(hasEdge(g, at(lv, 5, 46), at(lv, 7, 43), 'JUMP'), !ceiling, ceiling ? 'a ceiling cell in the corridor cuts the edge (a solid at (6, 42) over the 3 up, 2 across jump)' : 'without the ceiling the 3 up, 2 across jump is an edge');
  }
  /* a one way straight above: reached by a JUMP with no rocker */
  { const lv = LABS.room(['.....=', '', '', FLOOR]), g = SB.reach.graph(lv);
    t.ok(edgesOf(g).some(e => e.kind === 'JUMP' && e.dx === 0 && e.from === at(lv, 5, 46) && e.to === at(lv, 5, 43)), 'a one way 3 above the takeoff is reached straight up'); }
  /* a one way in the descending part of a long jump cuts it, and the model reaches that one way instead: ledges at
     row 41 (x 0..2 and 7..9), the jump 5 across from (2, 40), a one way planted at the model's farthest catch */
  /* (the one way must catch every profile that reaches 5 across, FULL and MID, or the next profile takes the edge) */
  { const tb5 = SB.reach.tables(SB.K, 0), keyOf = q => q[0] + ',' + q[1];
    const each = ['FULL', 'MID', 'TAP'].map(p => (tb5.profiles[p].paths['5,0'] || [])).filter(ps => ps.length).map(ps => new Set(ps.flatMap(q => q.catches.map(keyOf))));
    const common = [...each[0]].filter(k => each.every(st => st.has(k))).map(k => k.split(',').map(Number));
    const [ck, cr] = common.sort((a, b) => b[0] - a[0] || b[1] - a[1])[0];
    const px = 2 + ck, py = 40 - cr, base = ['===....===', '', '', '', '', '', FLOOR];
    const lines = Array(Math.max(0, 41 - py)).fill('').concat(base), idx = py - (48 - lines.length);
    const lv0 = LABS.room(base), withPlat = lines.slice(); withPlat[idx] = (withPlat[idx] || '').padEnd(24, '.').slice(0, px) + '=' + (withPlat[idx] || '').padEnd(24, '.').slice(px + 1);
    const lv = LABS.room(withPlat), g0 = SB.reach.graph(lv0), g = SB.reach.graph(lv);
    t.ok(hasEdge(g0, at(lv0, 2, 40), at(lv0, 7, 40), 'JUMP'), 'the long jump 5 across from (2, 40) is an edge in the bare room');
    t.ok(!hasEdge(g, at(lv, 2, 40), at(lv, 7, 40), 'JUMP') && hasEdge(g, at(lv, 2, 40), at(lv, px, py - 1), 'JUMP'),
      'a one way at (' + px + ', ' + py + ') in its descent cuts it, and the model reaches that one way\'s top (' + px + ', ' + (py - 1) + ') instead'); }
  /* a one wide shaft: contacts down both sides, slides to the floor */
  { const lv = LABS.room([...Array(26)].map(() => '#########.##############').concat([FLOOR])), g = SB.reach.graph(lv), d = SB.reach.distances(g, cnode(g, 9, 21, -1));
    const sides = [...Array(25).keys()].every(k => g.contact[2 * at(lv, 9, 21 + k)] && g.contact[2 * at(lv, 9, 21 + k) + 1]);
    t.ok(sides, 'a one wide shaft: every shaft cell from row 21 to 45 is a contact on both sides');
    t.ok(d[at(lv, 9, 46)] >= 0 && hasEdge(g, cnode(g, 9, 21, -1), cnode(g, 9, 30, -1), 'SLIDE'), 'it slides from its top contact to the contacts below and to the floor (9, 46)'); }
  /* two walls 4 apart: the wall jump chain climbs, counted */
  { const lv = LABS.room([...Array(36)].map(() => '.....#....#.............').concat([FLOOR])), g = SB.reach.graph(lv);
    const top = [cnode(g, 6, 13, -1), cnode(g, 9, 13, 1)].find(v => bfsPath(g, at(lv, 7, 46), v));
    const path = top !== undefined ? bfsPath(g, at(lv, 7, 46), top) : null, chain = path ? path.filter(e => e.kind === 'WALLJUMP').length : 0;
    t.ok(!!path && chain >= 3, 'two walls 4 apart: the chain climbs from the floor to row 13 with ' + chain + ' wall jumps (' + (path ? path.map(e => e.kind).join(' ') : 'no path') + ')'); }
});

group('H-reach-6', 'the graph builds in under 10 ms median', t => {
  const rooms = FIXTURES.map(f => [f.name, buildFx(f, 0)]).filter(([, lv]) => !lv.needsCrop);
  let worst = null;
  for (const [name, lv] of rooms) {
    /* 10 warm builds, then the median of 31 (15 samples let one collector pause move the median past 10 ms) */
    for (let k = 0; k < 10; k++) SB.reach.graph(lv);
    const ts = []; for (let k = 0; k < 31; k++) { const t0 = process.hrtime.bigint(); SB.reach.graph(lv); ts.push(Number(process.hrtime.bigint() - t0) / 1e6); }
    ts.sort((a, b) => a - b);
    if (!worst || ts[15] > worst[1]) worst = [name, ts[15]];
  }
  console.log('  info  the slowest graph build: ' + worst[0] + ' at ' + worst[1].toFixed(2) + ' ms median');
  t.ok(worst[1] < 10, 'every fixture\'s graph builds in under 10 ms median (slowest ' + worst[0] + ', ' + worst[1].toFixed(2) + ' ms)');
});

group('H-reach-7', 'sticky edges exist only under the Overgrowth and Deep overrides', t => {
  const vine = [...Array(12)].map((_, k) => k < 10 ? '.....|' : '').concat(['', FLOOR]);
  for (const biome of [0, 1, 2, 3, 4]) {
    const lv = LABS.room(vine, { biome }), g = SB.reach.graph(lv), n = edgesOf(g).filter(e => e.kind.startsWith('STICKY') || e.kind === 'LET_GO').length;
    t.eq(n > 0, biome === 2 || biome === 3, SB.palette.BIOMES[biome] + ': ' + n + ' sticky edges on a vine column');
  }
  for (const f of FIXTURES) { const lv = buildFx(f, 0); if (lv.needsCrop) continue; const n = edgesOf(SB.reach.graph(lv)).filter(e => e.kind.startsWith('STICKY') || e.kind === 'LET_GO').length; if (n) t.ok(false, f.name + ' (attic) has ' + n + ' sticky edges'); }
  t.ok(true, 'no attic fixture has a sticky edge');
});

group('H-reach-9', 'reach is symmetric under horizontal mirroring, on every lab room and fixture', t => {
  const mirror = lv => {
    const w = lv.w, out = Object.assign({}, lv);
    for (const k of ['solid', 'plat', 'sticky', 'slick', 'tab', 'trap']) { if (!lv[k]) continue; const a = new Uint8Array(lv[k].length); for (let i = 0; i < a.length; i++) a[i] = lv[k][Math.floor(i / w) * w + (w - 1 - i % w)]; out[k] = a; }
    out.spawn = lv.spawn < 0 ? -1 : Math.floor(lv.spawn / w) * w + (w - 1 - lv.spawn % w);
    return out;
  };
  const sig = (lv) => {
    const g = SB.reach.graph(lv), d = SB.reach.distances(g, lv.spawn), byKind = {};
    for (const e of edgesOf(g)) byKind[e.kind] = (byKind[e.kind] || 0) + 1;
    const reached = []; for (let i = 0; i < g.n; i++) if (g.stand[i] && d[i] >= 0) reached.push(i);
    return { byKind, reached, d };
  };
  const rooms = FIXTURES.map(f => [f.name, buildFx(f, 0)]).filter(([, lv]) => !lv.needsCrop)
    .concat([['shaft', LABS.room([...Array(26)].map(() => '#########.##############').concat(['....S...................', FLOOR]))],
      ['walls', LABS.room([...Array(36)].map(() => '.....#....#.............').concat(['.......S................', FLOOR]))],
      ['gap', LABS.room(['S===.....====', '', '', '', '', '', FLOOR])]]);
  for (const [name, lv] of rooms) {
    const a = sig(lv), m = mirror(lv), b = sig(m), w = lv.w;
    const mirrored = a.reached.map(i => Math.floor(i / w) * w + (w - 1 - i % w)).sort((x, y) => x - y);
    const sorted = o => Object.keys(o).sort().map(k => k + ' ' + o[k]).join(', ');
    t.eq(sorted(b.byKind), sorted(a.byKind), name + ': the mirrored room has the same edges by kind');
    t.same(b.reached, mirrored, name + ': the mirrored room reaches the mirrored cells (' + a.reached.length + ')');
  }
});

/* LAB-ONEWAY (section 3.9): for every LAB-EDGE jump, a one way planted where the descent crosses a top with
   LAND_OVERLAP catches the sim's hero there, on the first landing; one planted where only the rise crosses a top lets
   it through to the target. The crossings come from the oracle's arc, the landings from the real sim. */
function firstLanding(lab, profile, dir, hold) {
  const s = SB.sim.create(lab.lv);
  SB.sim.step(s, 0); SB.sim.step(s, 0);
  const words = M_JUMP(profile, dir, hold);
  for (let k = 0; k < words.length; k++) { SB.sim.step(s, words[k]); if (k > 0 && s.hero.ground) return { row: Math.floor((s.hero.y + HH - 1) / CS), step: k }; }
  return { row: -1, step: -1 };
}
group('H-lab-4', 'LAB-ONEWAY: one ways in the descent catch the hero where the model says; one ways in the rise do not', t => {
  let caught = 0, through = 0, cases = 0;
  for (const c of labCases().filter(c => c.kind === 'JUMP')) {
    const can = ORACLE.canonical(c.profile, 1, c.dx, c.rowsUp);
    if (!can) continue;
    if (c.support === '#' && ORACLE.corridor(can, 1).has(c.dx + ',' + (c.rowsUp - 1))) continue;
    cases++;
    const down = [], up = [], a = can.a;
    for (let f = 1; f <= can.land; f++) for (let j = -6; j <= 8; j++) {
      const top = -j * CS, cols = [];
      for (let col = Math.floor(a[f].x / CS); col <= Math.floor((a[f].x + HW - 1) / CS); col++) if (Math.min(a[f].x + HW, (col + 1) * CS) - Math.max(a[f].x, col * CS) >= K.OVERLAP_SUB) cols.push(col);
      if (f < can.land && a[f - 1].y <= top && a[f].y > top) for (const col of cols) down.push([col, j]);
      if (a[f - 1].y > top && a[f].y <= top) for (const col of cols) up.push([col, j]);
    }
    const downKeys = new Set(down.map(([k, j]) => k + ',' + j)), lab0 = jumpLab(c.dir, c.dx, c.rowsUp, c.support);
    const plant = (k, j) => { const px = lab0.tx + c.dir * k, py = lab0.ty - (j - 1); if (px < 0 || px >= SB.GRID.W || py < 1 || py >= SB.GRID.H - 1 || (px === lab0.tx && py === lab0.ty + 1)) return null; const lab = jumpLab(c.dir, c.dx, c.rowsUp, c.support); lab.lv.plat[py * SB.GRID.W + px] = 1; return { lab, px, py }; };
    for (const [k, j] of down) {
      const p = plant(k, j); if (!p || (p.px === lab0.gx && p.py === lab0.gy + 1)) continue;
      const res = firstLanding(p.lab, c.profile, c.dir, can.hold);
      t.ok(res.row === lab0.ty - j, caseName(c) + ': a one way at (' + p.px + ', ' + p.py + ') in the descent catches the hero first, on row ' + (lab0.ty - j) + ' (first landing on row ' + res.row + ')');
      caught++;
    }
    for (const [k, j] of up) {
      if (downKeys.has(k + ',' + j) || j <= 0) continue;
      const p = plant(k, j); if (!p) continue;
      const res = firstLanding(p.lab, c.profile, c.dir, can.hold);
      t.ok(res.row === lab0.gy, caseName(c) + ': a one way at (' + p.px + ', ' + p.py + ') crossed only by the rise lets the hero through (first landing on row ' + res.row + ', the target row ' + lab0.gy + ')');
      through++;
    }
  }
  console.log('  info  LAB-ONEWAY: ' + cases + ' jumps, ' + caught + ' one ways planted in descents, ' + through + ' in rises');
});

/* ================================================================ repair, needsCrop, the default spread (T0.11a, DESIGN 6.7) */
const landmarkTopNear = lv => {
  const near = new Set(), w = lv.w;
  for (const lm of lv.landmarks || []) for (const c of lm.cells) {
    near.add(c);
    if (c < w || !lv.solid[c - w]) for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) { const x = c % w + ox, y = Math.floor(c / w) + oy; if (x >= 0 && x < w && y >= 0 && y < lv.h) near.add(y * w + x); }
  }
  return near;
};
group('H-rep-1', 'the corpus result table: every fixture builds or returns needsCrop as its expect says, within its tabs', t => {
  const rows = [];
  let authored = 0;
  for (const f of FIXTURES) {
    const e = f.fx.expect;
    if (e.needsCrop === true) authored++;
    const cells = MODES.map(mode => { const lv = buildFx(f, mode); return { mode, lv, text: lv.needsCrop ? 'needsCrop' : lv.repair.tabs + ' tabs' }; });
    rows.push(f.name.padEnd(20) + cells.map(c => ('mode ' + c.mode + ': ' + c.text).padEnd(22)).join(''));
    const lv = cells[0].lv;
    if (e.needsCrop !== null) t.eq(!!lv.needsCrop, e.needsCrop, f.name + ': ' + (e.needsCrop ? 'needsCrop' : 'builds') + ' as its expect says' + (lv.needsCrop ? ' (' + lv.detail + ')' : ''));
    if (!lv.needsCrop) t.ok(lv.repair.tabs <= e.tabsMax, f.name + ': ' + lv.repair.tabs + ' tabs (at most ' + e.tabsMax + ')');
    if (!lv.needsCrop && e.exitIsLight !== null) t.eq(Array.from(lv.beacon.cells).includes(lv.exit), e.exitIsLight, f.name + ': the exit ' + (e.exitIsLight ? 'is' : 'is not') + ' the light');
  }
  console.log('  info  the corpus (built with its tabs, or needsCrop):\n' + rows.map(r => '        ' + r).join('\n'));
  t.ok(authored <= 2, 'the authored needsCrop count over the corpus is at most 2 (' + authored + ')');
  const sr = buildFx(fixture('sample-room'), 0);
  t.ok(!sr.needsCrop && sr.repair.tabs === 0 && Array.from(sr.beacon.cells).includes(sr.exit), 'the sample room needs zero tabs and its exit is the lamp');
  /* the light's slack (Q11): a ladder to a lamp at row 2, and a plank one jump farther: the lamp wins inside the slack */
  const lab = {};
  [44, 41, 38, 35, 32, 29, 26, 23, 20, 17, 14, 11, 8, 5].forEach((r, k) => { lab[r] = (k % 2 ? '4444222' : '222').padEnd(24, '4'); });
  lab[2] = '44666'.padEnd(24, '4'); lab[3] = '44222444422244'.padEnd(24, '4');
  const sl = SB.pipeline.build(labRecord(lab), {}), g = SB.reach.graph(sl), d = SB.reach.distances(g, sl.spawn);
  const lampD = Math.max(...[2, 3, 4].map(x => d[2 * 24 + x])), farD = Math.max(...[9, 10, 11].map(x => d[2 * 24 + x]));
  t.ok(lampD >= 0 && farD > lampD && farD - lampD <= SB.TUNING.EXIT_LIGHT_SLACK, 'the slack lab: the plank (' + farD + ' edges) lies within the slack of the lamp (' + lampD + ')');
  t.ok(Array.from(sl.beacon.cells).includes(sl.exit), 'the slack lab: the lamp is the exit inside EXIT_LIGHT_SLACK, though the plank is farther (exit (' + sl.exit % 24 + ', ' + Math.floor(sl.exit / 24) + '))');
});

group('H-rep-2', 'tabs never on a landmark cell nor within 1 cell of a landmark top', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    const near = landmarkTopNear(lv), bad = [];
    for (let i = 0; i < lv.w * lv.h; i++) if (lv.tab[i] && near.has(i)) bad.push('(' + i % lv.w + ', ' + Math.floor(i / lv.w) + ')');
    t.eq(bad.length, 0, f.name + ' mode ' + mode + ': no tab on or by a landmark top' + (bad.length ? ' (' + bad.slice(0, 4).join(' ') + ')' : ''));
  }
});

group('H-rep-3', 'repair changes at most 15% of the cells on every built level', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    let tabs = 0; for (let i = 0; i < lv.w * lv.h; i++) if (lv.tab[i]) tabs++;
    t.ok(tabs / (lv.w * lv.h) <= SB.TUNING.REPAIR_MAX_CHANGE, f.name + ' mode ' + mode + ': ' + tabs + ' tab cells, ' + (100 * tabs / (lv.w * lv.h)).toFixed(1) + '% (at most 15%)');
  }
});

group('H-rep-4', 'every built level reaches its exit and at least 40% of its standable cells', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    const g = SB.reach.graph(lv), d = SB.reach.distances(g, lv.spawn), frac = SB.reach.reachableFrac(g, d);
    t.ok(lv.exit >= 0 && d[lv.exit] >= 0, f.name + ' mode ' + mode + ': the exit (' + lv.exit % lv.w + ', ' + Math.floor(lv.exit / lv.w) + ') is reached from spawn');
    t.ok(frac >= SB.TUNING.REPAIR_REACH_FRAC, f.name + ' mode ' + mode + ': ' + Math.round(frac * 100) + '% of the standable cells reached (at least 40%)');
  }
});

group('H-rep-5', 'repair is idempotent: two builds lay the same tabs', t => {
  for (const f of FIXTURES) {
    const a = buildFx(f, 0), b = buildFx(f, 0);
    if (a.needsCrop || b.needsCrop) { t.eq(!!a.needsCrop, !!b.needsCrop, f.name + ': needsCrop both times'); continue; }
    t.eq(SB.pipeline.levelHash(a), SB.pipeline.levelHash(b), f.name + ': two builds hash the same (' + a.repair.tabs + ' tabs)');
  }
});

group('H-rep-6', 'the full build with its repair passes runs under 50 ms p95 per fixture in Node', t => {
  let slow = null;
  for (const f of FIXTURES) {
    const rec = SB.record.fromJSON(f.fx.record), ts = [];
    for (let k = 0; k < 12; k++) { const t0 = process.hrtime.bigint(); SB.pipeline.build(rec, {}); ts.push(Number(process.hrtime.bigint() - t0) / 1e6); }
    ts.sort((a, b) => a - b);
    const p95 = ts[10];
    if (!slow || p95 > slow.p95) slow = { name: f.name, p95 };
    t.ok(p95 < 50, f.name + ': the build p95 ' + p95.toFixed(1) + ' ms (under 50)');
  }
  console.log('  info  the slowest full build: ' + slow.name + ' at ' + slow.p95.toFixed(1) + ' ms p95');
});

/* ================================================================ the main ascent, the route score, onboarding (T0.11b) */
/* the test's own slack rule on its own oracle tables (section 3.7 filter 1) */
const slackRef = (e, deep, both) => {
  if (!(e.kind === 'JUMP' || (e.kind === 'WALLJUMP' && e.dx > 0))) return true;
  const m = ORACLE.clipped(e.profile, deep); let maxUp = -1; m.forEach((dx, dy) => { if (dx >= e.dx) maxUp = dy; });
  const up = e.dy + 1 <= maxUp, across = e.dy < m.length && e.dx + 1 <= m[e.dy];
  return both ? up && across : up || across;
};
const nodeRow = (lv, v) => Math.floor((v < lv.w * lv.h ? v : (v - lv.w * lv.h) >> 1) / lv.w);
group('H-route-1', 'every built level\'s main ascent starts at spawn, ends at the exit, and keeps the per edge limits', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode), tag = f.name + ' mode ' + mode;
    if (lv.needsCrop) continue;
    const a = lv.ascent;
    t.ok(!!a && a.nodes && a.nodes[0] === lv.spawn && a.nodes[a.nodes.length - 1] === lv.exit && a.score.ok, tag + ': the ascent runs spawn to exit and passes its route score (' + (a && a.edges ? a.edges.length : 0) + ' edges)');
    if (!a || !a.edges) continue;
    let chain = 0, worstChain = 0, bad = '';
    for (const e of a.edges) {
      if (!slackRef(e, lv.biome === 2, SB.TUNING.ROUTE_SLACK_BOTH_AXES)) bad = bad || (e.kind + ' ' + e.dx + ' across ' + e.dy + ' up at max range');
      if (e.kind === 'WALLJUMP' || e.kind === 'WALLTOUCH') chain++; else if (e.to < lv.w * lv.h) chain = 0;
      worstChain = Math.max(worstChain, chain);
    }
    t.ok(!bad, tag + ': every jump on the ascent keeps a cell of slack (the test\'s own tables)' + (bad ? ' (' + bad + ')' : ''));
    t.ok(worstChain <= SB.TUNING.ROUTE_MAX_WALL_CHAIN, tag + ': no wall chain longer than 2 (' + worstChain + ')');
  }
});

group('H-route-2', 'on every ascent, consecutive safe cells are at most 8 rows apart', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop || !lv.ascent || !lv.ascent.nodes) continue;
    const g = SB.reach.graph(lv); let lastSafe = nodeRow(lv, lv.spawn), worst = 0;
    for (const v of lv.ascent.nodes) { const r = nodeRow(lv, v); worst = Math.max(worst, lastSafe - r); if (v < g.n && g.stand[v]) lastSafe = Math.min(lastSafe, r); }
    t.ok(worst <= SB.TUNING.ROUTE_SAFE_EVERY_ROWS, f.name + ' mode ' + mode + ': the longest climb between safe cells is ' + worst + ' rows (at most 8)');
  }
});

group('H-route-3', 'the filters, each in its lab: max-range, wall-chain, safe-cadence', t => {
  const reason = lv => { const g = SB.reach.graph(lv), a = SB.reach.mainAscent(g, lv); return SB.reach.routeScore(lv, g, a); };
  /* the only way up is a jump 4 up and 4 across from a pillar's top: the cone's corner, no slack on either axis (the
     floor below the target is out of reach: a pit, so no straight up jump with its column of slack) */
  { const lv = LABS.room(['......X', '......=', '', '', '..S', ...[...Array(7)].map(() => '###'), FLOOR], { exit: true }); const sc = reason(lv);
    t.ok(!sc.ok && /^max-range/.test(sc.reasons[0]), 'a room whose only route is a 4 up, 4 across jump fails with max-range (' + sc.reasons.join('; ') + ')'); }
  /* two walls 2 apart and 7 rows tall, the exit on the right wall's top: so close, each wall jump climbs little, and
     the top needs a touch and two wall jumps, three wall moves in a row inside the 8 row cadence (found by search: with
     the walls wider, two moves already climb 8 rows, so the chain limit and the cadence cut the same move) */
  { const lines = ['........X'].concat([...Array(6)].map(() => '.....#..#'), ['.....#.S#', FLOOR]);
    const lv = LABS.room(lines, { exit: true }); const sc = reason(lv);
    t.ok(!sc.ok && /^wall-chain/.test(sc.reasons[0]), 'two walls 2 apart climbed by three wall moves in a row fail with wall-chain (' + sc.reasons.join('; ') + ')'); }
  /* a 13 row vine in Overgrowth, the exit on a ledge over its top: a sheer climb with no safe cell for 13 rows */
  { const lines = ['......X', '......#'].concat([...Array(14)].map(() => '.....|')).concat(['', '', '.......S', FLOOR]);
    const lv = LABS.room(lines, { exit: true, biome: 3 }); const sc = reason(lv);
    t.ok(!sc.ok && /^safe-cadence/.test(sc.reasons[0]), 'a 13 row sheer vine climb fails with safe-cadence (' + sc.reasons.join('; ') + ')'); }
});

group('H-route-4', 'tight-gap gets a tab stair, and its ascent stands on it', t => {
  const lv = buildFx(fixture('tight-gap'), 0);
  t.ok(!lv.needsCrop && lv.repair.tabs > 0, 'tight-gap is repaired (' + (lv.needsCrop ? 'needsCrop' : lv.repair.tabs + ' tabs') + ')');
  const onTab = !lv.needsCrop && lv.ascent.nodes.some(v => v < lv.w * lv.h && lv.tab[v + lv.w]);
  t.ok(onTab, 'its main ascent stands on a film tab');
});

group('H-route-5', 'how many rooms change under ROUTE_SLACK_BOTH_AXES (for QUESTIONS Q8)', t => {
  const changed = [];
  for (const f of FIXTURES) {
    const lv = buildFx(f, 0);
    if (lv.needsCrop) continue;
    const g = SB.reach.graph(lv), a = SB.reach.mainAscent(g, lv, { both: true });
    if (!a.nodes || a.nodes.join() !== lv.ascent.nodes.join()) changed.push(f.name + (a.nodes ? ' (another ascent)' : ' (no ascent)'));
  }
  console.log('  info  H-route-5: under ROUTE_SLACK_BOTH_AXES ' + changed.length + ' rooms change: ' + (changed.join(', ') || 'none'));
  t.ok(true, 'H-route-5 printed');
});

/* DESIGN 5.3 on the sample room: the onboarding beats, before any photo code */
group('H-onb-1', 'the sample room teaches: a forgiving jump onto a landmark, a wall jump branch, a dive onto a speck, a speck above 60%', t => {
  const lv = buildFx(fixture('sample-room'), 0), g = SB.reach.graph(lv), w = lv.w, n = w * lv.h, a = lv.ascent, beats = fixture('sample-room').fx.expect.beats;
  const at = (x, y) => y * w + x, rowOf = v => nodeRow(lv, v);
  /* a cell is "on the ascent" when it is an ascent cell, within 2 cells of one, or on the same surface (walkable in a row) */
  const onA = new Set(a.nodes.filter(v => v < n));
  const surface = c => { const out = [c]; for (const d of [-1, 1]) for (let x = c % w + d; x >= 0 && x < w && g.stand[Math.floor(c / w) * w + x]; x += d) out.push(Math.floor(c / w) * w + x); return out; };
  const near = c => surface(c).some(s => onA.has(s)) || [...onA].some(v => Math.max(Math.abs(v % w - c % w), Math.abs(rowOf(v) - rowOf(c))) <= 2);
  /* (i) walkable by WALK, JUMP and FALL alone, with a JUMP of at most 2 up onto a landmark top */
  const kinds = new Set(a.edges.map(e => e.kind));
  t.ok([...kinds].every(k => k === 'WALK' || k === 'JUMP' || k === 'FALL'), '(i) the main ascent uses WALK, JUMP and FALL only (' + [...kinds].join(', ') + ')');
  const lmTop = new Set(); for (const lm of lv.landmarks) for (const c of lm.cells) if (c >= w && !lv.solid[c - w]) lmTop.add(c - w);
  t.ok(a.edges.some(e => e.kind === 'JUMP' && e.dy >= 0 && e.dy <= 2 && lmTop.has(e.to)), '(i) and a JUMP of at most 2 up onto a landmark top');
  /* (ii) a WALLTOUCH then a WALLJUMP from the ascent that rejoins it at least 3 rows higher */
  let branch = null;
  for (const u of onA) for (const e1 of (g.adj[u] || []).filter(e => e.kind === 'WALLTOUCH')) for (const e2 of (g.adj[e1.to] || []).filter(e => e.kind === 'WALLJUMP' && e.to < n))
    if (near(e2.to) && rowOf(u) - rowOf(e2.to) >= 3) branch = branch || [u, e1.to, e2.to];
  for (const b of beats.filter(b => b.kind === 'WALLJUMP')) {
    const from = at(...b.from), c = n + 2 * at(...b.contact) + (b.contact[0] > b.from[0] ? 1 : 0), to = at(...b.to);
    if (near(from) && (g.adj[from] || []).some(e => e.kind === 'WALLTOUCH' && e.to === c) && (g.adj[c] || []).some(e => e.kind === 'WALLJUMP' && e.to === to) && near(to)) branch = [from, c, to];
  }
  t.ok(!!branch, '(ii) a wall touch and a wall jump branch off the ascent and rejoin it at least 3 rows higher' + (branch ? ' (' + [branch[0], branch[2]].map(v => '(' + v % w + ', ' + rowOf(v) + ')').join(' to ') + ')' : ''));
  /* (iii) a FALL of at least 3 rows from near the ascent onto a standable speck (an isolated Sun cell, Q49) */
  const SUN = SB.palette.I.SUN, pal = lv.rec.pal, speck = c => pal[c] === SUN;
  const dive = [...onA].flatMap(u => surface(u)).flatMap(u => (g.adj[u] || []).filter(e => e.kind === 'FALL' && rowOf(e.to) - rowOf(u) >= 3 && speck(e.to)));
  t.ok(dive.length > 0, '(iii) a FALL of 3 rows or more from the ascent onto a standable speck' + (dive.length ? ' (' + dive.slice(0, 2).map(e => '(' + e.from % w + ', ' + rowOf(e.from) + ') to (' + e.to % w + ', ' + rowOf(e.to) + ')').join(', ') + ')' : ''));
  /* (iv) a speck within 8 rows above the 60% point of the climb */
  const r0 = rowOf(lv.spawn), r1 = rowOf(lv.exit), r60 = Math.round(r0 - 0.6 * (r0 - r1)), specks = [];
  for (let c = 0; c < n; c++) if (speck(c) && rowOf(c) <= r60 && rowOf(c) >= r60 - 8) specks.push('(' + c % w + ', ' + rowOf(c) + ')');
  t.ok(specks.length > 0, '(iv) a speck within 8 rows above the 60% point (row ' + r60 + '): ' + (specks.join(' ') || 'none'));
  /* each listed beat, in row order, against the graph */
  for (const b of beats) {
    if (b.kind === 'JUMP') t.ok((g.adj[at(...b.from)] || []).some(e => e.kind === 'JUMP' && e.to === at(...b.to)) && near(at(...b.from)), 'beat: ' + b.why);
    if (b.kind === 'FALL') t.ok((g.adj[at(...b.from)] || []).some(e => e.kind === 'FALL' && e.to === at(...b.to)) && near(at(...b.from)), 'beat: ' + b.why);
    if (b.kind === 'SPECK') t.ok(speck(at(...b.at)) && g.stand[at(...b.at)], 'beat: ' + b.why);
  }
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
  t.ok(listed.length >= 21, 'the README lists at least 21 fixtures (' + listed.length + '; T0.5c)');
  for (const n of listed) t.ok(!!fixture(n), 'the corpus holds ' + n);
  const names = FIXTURES.map(f => f.name);
  t.eq(new Set(names).size, names.length, 'fixture names are unique');
  const seeds = FIXTURES.map(f => SB.record.seedOf(SB.record.fromJSON(f.fx.record)));
  t.eq(new Set(seeds).size, seeds.length, 'no two fixtures share a seedOf');
});

/* ================================================================ the bot (T0.13a, sections 3.9 and 5.2) */
/* The harness's player. It reads the state, never the render, and drives SB.sim.step with words. For each edge of a
   level's main ascent it searches an input macro that performs the edge from the state the walk is in (section 3.9's
   candidate sets, ordered by a physics prior, at most 120 per edge, memoised per shape: a memoised macro is tried
   first and a miss falls back to a fresh search); between edges it settles the hero in its cell; the walk chains the
   macros from spawn and must clear the room. A miss is the generosity assertion failing: the model promised an edge
   the sim does not keep. The macros may read the state to time a release, as a player watches the hero; they never
   write it. */
const BOT = (() => {
  const W = SB.GRID.W, MAX_CANDS = 120, LEN = 140;
  const cloneState = s => SB.sim.attach(structuredClone(s), s.level);
  const stopDist = v => { let d = 0; v = Math.abs(v); while (v > 0) { v = Math.max(0, v - K.DECEL); d += v; } return d; };
  const TAP_MOVE = K.RUN + stopDist(K.RUN);           /* one step of the rocker from rest, then the decel: 6.56 px */
  const centreCol = s => Math.floor((s.hero.x + (HW >> 1)) / CS), feetRow = s => Math.floor((s.hero.y + HH - 1) / CS);
  /* settle (section 5.2 step 3): from rest, a step of the rocker toward the cell's centre while that tap would end
     nearer than staying; while moving toward it, the rocker held until the decel's stop comes within 2 px; moving
     away, released. Done when grounded and still with the centre within half a tap of the cell's centre; at most 30
     steps, else the settle fails (a hero that cannot stand still in a cell is a sim bug). */
  function settle(s, cell, words) {
    const cx = (cell % W) * CS + (CS >> 1);
    for (let k = 0; k <= 30; k++) {
      if (s.room.cleared) return true;
      const h = s.hero, d = cx - (h.x + (HW >> 1));
      let word = 0;
      if (h.vx === 0 && h.ground) {
        if (2 * Math.abs(d) <= TAP_MOVE) return centreCol(s) === cell % W && feetRow(s) === Math.floor(cell / W);
        word = rockerOf(Math.sign(d));
      } else if (h.ground && Math.sign(h.vx) === Math.sign(d) && stopDist(h.vx) + 2 * 256 < Math.abs(d)) word = rockerOf(Math.sign(d));
      if (k === 30) break;
      SB.sim.step(s, word); words.push(word);
    }
    return false;
  }
  /* a node: a standable cell, or a contact n + 2c + (wall on the right ? 1 : 0) */
  const nodeInfo = (g, v) => {
    if (v < g.n) return { v, contact: false, cx: v % W, cy: Math.floor(v / W) };
    const c = (v - g.n) >> 1, sd = (v - g.n) & 1;
    return { v, contact: true, c, cx: c % W, cy: Math.floor(c / W), side: sd ? 1 : -1, sticky: !!g.sticky[2 * c + sd] };
  };
  const atContact = (s, t) => { const h = s.hero; return !h.ground && h.wall === t.side && (t.sticky ? h.sticky === 1 : h.sticky === 0) && centreCol(s) === t.cx && feetRow(s) === t.cy; };
  /* run one candidate on a clone; a contact target must be met during the words, a standable one rests on its row
     over its column by LAND_OVERLAP after them and then settles into it */
  function attempt(s0, words, t) {
    const s = cloneState(s0), used = [];
    let last = 0; for (let k = 0; k < words.length; k++) if (words[k]) last = k;
    for (let k = 0; k < words.length; k++) {
      SB.sim.step(s, words[k]); used.push(words[k]);
      if (s.room.cleared) return { ok: true, s, used };
      if (t.contact) { if (atContact(s, t)) return { ok: true, s, used }; continue; }
      if (k >= last && s.hero.ground && s.hero.vx === 0) break;
    }
    if (t.contact) return { ok: false, s, used };
    for (let k = 0; k < 120 && !(s.hero.ground && s.hero.vx === 0); k++) { SB.sim.step(s, 0); used.push(0); if (s.room.cleared) return { ok: true, s, used }; }
    const ov = Math.min(s.hero.x + HW, (t.cx + 1) * CS) - Math.max(s.hero.x, t.cx * CS);
    if (!(s.hero.ground && feetRow(s) === t.cy && ov >= K.OVERLAP_SUB)) return { ok: false, s, used };
    return { ok: settle(s, t.v, used), s, used };
  }
  /* the candidate sets of section 3.9, per kind, each a word script; ordered by a physics prior, at most 120 */
  const A_RANGE = { FULL: [200], MID: [4, 3, 5, 6, 2], TAP: [1, 2] };
  function jumpWords(aHold, dir, delay, hold) { return Array.from({ length: LEN }, (_, k) => (k < aHold ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k >= delay && k < delay + hold ? rockerOf(dir) : 0)); }
  function candidates(e, src, t) {
    const out = [], est = Math.round(Math.abs(e.dx) * CS / K.RUN);
    const ranked = (list, score) => list.map(c => [score(c), c]).sort((a, b) => a[0] - b[0]).slice(0, MAX_CANDS).map(x => x[1]);
    if (e.kind === 'WALK') return [1, 2, 3, 4].map(n => Array.from({ length: n }, () => rockerOf(e.dir)));   /* the settle leaves the hero up to half a tap off centre */
    if (e.kind === 'JUMP' || e.kind === 'JUMP_DOWN') {
      const profs = e.kind === 'JUMP' ? [e.profile] : ['FULL', 'MID', 'TAP'], list = [];
      profs.forEach((p, pi) => A_RANGE[p].forEach((a, ai) => { for (let delay = 0; delay <= 8; delay++) for (let hold = 0; hold <= 40; hold++) list.push({ a, delay, hold, prior: Math.abs(hold - est) + 2 * delay + 3 * ai + 6 * pi }); }));
      return ranked(list, c => c.prior).map(c => jumpWords(c.a, e.dir, c.delay, c.hold));
    }
    if (e.kind === 'FALL' && e.dir === 0) return Array.from({ length: 40 }, (_, i) => M_DIVE(i + 1, true, LEN));
    if (e.kind === 'FALL') {
      const walkEst = Math.round((14 + (e.dx - 1) * 16) * 256 / K.RUN), list = [];
      for (let hold = 1; hold <= 60; hold++) list.push({ hold, prior: Math.abs(hold - walkEst) });
      return ranked(list, c => c.prior).map(c => M_FALL(e.dir, c.hold, LEN));
    }
    if (e.kind === 'WALLTOUCH') {
      const list = [];
      ['FULL', 'WALKOFF', 'MID', 'TAP'].forEach((p, pi) => { for (let delay = 0; delay <= 8; delay++) list.push({ p, delay, prior: 2 * delay + pi }); });
      return ranked(list, c => c.prior).map(c => Array.from({ length: LEN }, (_, k) =>
        (c.p !== 'WALKOFF' && k < A_FRAMES[c.p] ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k >= c.delay ? rockerOf(e.dir) : 0)));
    }
    if (e.kind === 'SLIDE') return [Array.from({ length: 4 * LEN }, () => rockerOf(e.dir))];
    if (e.kind === 'WALLJUMP') {
      const toward = -e.dir, list = [], lockTravel = SB.TUNING.WALL_JUMP_LOCK * K.WALL_PUSH;
      const holdEst = Math.max(0, Math.round((e.dx * CS - lockTravel) / K.RUN));
      [200, 8, 4].forEach((a, ai) => { for (let wait = 0; wait <= 6; wait++) {
        if (!t.contact) for (let hold = 0; hold <= 30; hold++) list.push({ a, wait, hold, prior: Math.abs(hold - holdEst) + 2 * wait + 4 * ai });
        else list.push({ a, wait, hold: LEN, prior: 2 * wait + 4 * ai });
      } });
      return ranked(list, c => c.prior).map(c => Array.from({ length: LEN }, (_, k) => {
        if (k < c.wait) return rockerOf(toward);
        const j = k - c.wait;
        return (j < c.a ? IN.A | (j === 0 ? IN.A_TAP : 0) : 0) | (j < SB.TUNING.WALL_JUMP_LOCK + c.hold ? rockerOf(e.dir) : 0);
      }));
    }
    if (e.kind === 'STICKYUP') return [200, 16, 12, 8, 6, 4, 3, 2, 1].map(a => Array.from({ length: LEN }, (_, k) => (k < a ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0)));
    if (e.kind === 'STICKYTOP') {
      const list = []; [200, 8, 4].forEach((a, ai) => { for (let hold = 1; hold <= 24; hold++) list.push({ a, hold, prior: hold + 30 * ai }); });
      return ranked(list, c => c.prior).map(c => Array.from({ length: LEN }, (_, k) => (k < c.a ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k > 0 && k <= c.hold ? rockerOf(src.side) : 0)));
    }
    if (e.kind === 'LET_GO') return [[IN.B_TAP]].concat([1, 2, 3, 4].map(n => Array.from({ length: n }, () => rockerOf(-src.side))));
    return [];
  }
  /* the memo key: the edge's shape and the cells around it (section 5.2 step 2) */
  function shapeKey(lv, e, src, t) {
    const x0 = Math.min(src.cx, t.cx) - 2, x1 = Math.max(src.cx, t.cx) + 2, y0 = Math.min(src.cy, t.cy) - 4, y1 = Math.max(src.cy, t.cy) + 1;
    let geo = '';
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const i = y * W + x;
      geo += x < 0 || x >= W || y < 0 || y >= lv.h ? 'X' : lv.solid[i] ? (lv.sticky[i] ? '|' : '#') : lv.plat[i] ? '=' : '.';
    }
    return [e.kind, e.profile, e.dir, e.dx, e.dy, lv.biome === 2 ? 'deep' : 'base', src.contact ? 'c' + src.side : 's', t.contact ? 'c' + t.side : 's', geo].join('|');
  }
  /* solve one edge from the state: the memoised macro first, then the search; returns the run that worked, or the
     prior's best attempt with ok false */
  function solve(s, e, g, memo, stats) {
    const src = nodeInfo(g, e.from), t = nodeInfo(g, e.to), key = shapeKey(s.level, e, src, t);
    if (memo.has(key)) { const r = attempt(s, memo.get(key), t); if (r.ok) { stats.memo++; return r; } stats.memoMiss++; }
    const cands = candidates(e, src, t);
    let first = null;
    for (let i = 0; i < cands.length; i++) {
      const r = attempt(s, cands[i], t); stats.tries++;
      if (r.ok) { memo.set(key, cands[i]); stats.found++; return r; }
      if (!first) first = r;
    }
    return first ? Object.assign(first, { ok: false, tried: cands.length }) : { ok: false, s, used: [], tried: 0 };
  }
  /* the walk: settle at spawn, then each ascent edge's macro in turn; arrival is the room clearing */
  function walk(lv, memo, stats) {
    const g = SB.reach.graph(lv), asc = lv.ascent;
    let s = SB.sim.create(lv);
    const words = [];
    for (let k = 0; k < 10 && !s.hero.ground; k++) { SB.sim.step(s, 0); words.push(0); }
    if (!settle(s, lv.spawn, words)) return { ok: false, why: 'the hero cannot settle at spawn', edges: 0, words, s };
    if (!asc || !asc.edges) return { ok: false, why: 'no ascent', edges: 0, words, s };
    for (let i = 0; i < asc.edges.length && !s.room.cleared; i++) {
      const e = asc.edges[i], r = solve(s, e, g, memo, stats);
      if (!r.ok) {
        const src = nodeInfo(g, e.from), t = nodeInfo(g, e.to);
        return { ok: false, edges: i, words, s, miss: { i, e, src, t, tried: r.tried, rest: [centreCol(r.s), feetRow(r.s)], wall: r.s.hero.wall, ground: r.s.hero.ground } };
      }
      for (const w of r.used) words.push(w);
      s = r.s;
    }
    return { ok: s.room.cleared === 1, why: s.room.cleared ? '' : 'the ascent ended without clearing the room', edges: asc.edges.length, words, s };
  }
  /* placement for an edge drawn from the graph (section 5.2 step 6): a standable source settles centred on its cell;
     a wall contact is armed flush with its feet at the cell's bottom and the rocker toward; a sticky one falls onto
     the vine from 4 px higher */
  function place(lv, g, v) {
    const src = nodeInfo(g, v);
    if (!src.contact) {
      const s = SB.sim.create(lv, { at: { x: src.cx * CS + ((CS - HW) >> 1), y: src.cy * CS } }), w = [];
      for (let k = 0; k < 4; k++) SB.sim.step(s, 0);
      return settle(s, v, w) ? s : null;
    }
    const x = src.side > 0 ? (src.cx + 1) * CS - HW : src.cx * CS;
    if (src.sticky) {
      const s = SB.sim.create(lv, { at: { x, y: (src.cy + 1) * CS - HH - 4 * 256 - K.G } });
      s.hero.ground = 0; s.hero.coyote = 0;
      for (let k = 0; k < 8 && !atContact(s, src); k++) SB.sim.step(s, 0);
      return atContact(s, src) ? s : null;
    }
    const s = SB.sim.create(lv, { at: { x, y: (src.cy + 1) * CS - HH - K.G } });
    s.hero.ground = 0; s.hero.coyote = 0;
    SB.sim.step(s, rockerOf(src.side));
    return atContact(s, src) ? s : null;
  }
  return { settle, solve, walk, place, nodeInfo, atContact, candidates };
})();

/* every built level of the corpus for the walk: (fixture, mode, biome) with the Deep override skipped by name until
   H-sim-17 (T1.5); "as detected" is the build's own biome (Attic in M0). A biome whose level has the same cells, the
   same spawn and exit, the same tables and the same sticky rule as one already walked is the same walk: it is reported
   as such, not walked twice. */
const BOT_BIOMES = [[null, 'as detected'], [1, 'frost'], [3, 'overgrowth'], [4, 'ember']];
let botRuns = null;
function botWalks() {
  if (botRuns) return botRuns;
  const memo = new Map(), stats = { tries: 0, found: 0, memo: 0, memoMiss: 0 }, runs = [], seen = new Map();
  for (const f of FIXTURES) for (const mode of MODES) for (const [biome, bname] of BOT_BIOMES) {
    const lv = biome === null ? buildFx(f, mode) : SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { biome });
    const tag = f.name + ' mode ' + mode + ' ' + bname;
    if (lv.needsCrop) { runs.push({ tag, f, mode, biome, skipped: 'needsCrop (' + lv.why + ')' }); continue; }
    const sig = [Buffer.from(lv.solid).toString('base64'), Buffer.from(lv.plat).toString('base64'), Buffer.from(lv.sticky).toString('base64'), Buffer.from(lv.slick).toString('base64'),
      lv.spawn, lv.exit, lv.biome === 2, (lv.biome === 2 || lv.biome === 3) && lv.sticky.some(Boolean)].join('/');
    if (seen.has(sig)) { runs.push({ tag, f, mode, biome, same: seen.get(sig) }); continue; }
    const t0 = Date.now(), r = BOT.walk(lv, memo, stats);
    const run = { tag, f, mode, biome, lv, r, ms: Date.now() - t0 };
    seen.set(sig, run); runs.push(run);
  }
  botRuns = { runs, stats };
  return botRuns;
}

group('H-bot-1', 'the generosity assertion: every main ascent edge of every built level has a macro the sim performs (BOT-ASCENT)', t => {
  const { runs, stats } = botWalks();
  let walked = 0, edges = 0, same = 0, skipped = 0;
  for (const run of runs) {
    if (run.skipped) { skipped++; continue; }
    if (run.same) { same++; continue; }
    walked++; edges += run.r.edges;
    const m = run.r.miss;
    t.ok(!m, run.tag + ': ' + (m ? 'edge ' + m.i + ' of ' + run.lv.ascent.edges.length + ' has no macro: ' + m.e.kind + (m.e.profile ? ' ' + m.e.profile : '') + ' dir ' + m.e.dir + ' dx ' + m.e.dx + ' dy ' + m.e.dy + ' from ' + (m.src.contact ? 'the contact' : 'the cell') + ' (' + m.src.cx + ', ' + m.src.cy + ') to ' + (m.t.contact ? 'the contact' : 'the cell') + ' (' + m.t.cx + ', ' + m.t.cy + '); ' + m.tried + ' candidates, the prior\'s best rests at (' + m.rest.join(', ') + ')' + (m.wall ? ' armed ' + m.wall : '') : 'every one of its ' + run.lv.ascent.edges.length + ' ascent edges has a macro'),
      m ? SB.pipeline.toText(run.lv) : undefined);
  }
  console.log('  info  the bot walked ' + walked + ' levels (' + edges + ' ascent edges; ' + same + ' biome overrides share a walked level\'s cells and rules; ' + skipped + ' needsCrop); the Deep override skipped by name until H-sim-17 (T1.5)');
  console.log('  info  the macro search: ' + stats.tries + ' candidates run, ' + stats.found + ' found by search, ' + stats.memo + ' by the memo (' + stats.memoMiss + ' memo misses fell back to the search)');
});

group('H-bot-2', 'the walker reaches the exit on every built level; the walk\'s length per level (the level length proxy, section 5.3)', t => {
  const { runs } = botWalks(), secs = [];
  for (const run of runs) {
    if (run.skipped || run.same) continue;
    const s = (run.r.words.length / 60);
    t.ok(run.r.ok, run.tag + ': the walk ' + (run.r.ok ? 'clears the room in ' + run.r.words.length + ' steps (' + s.toFixed(1) + ' s)' : 'does not arrive: ' + (run.r.why || 'stopped at edge ' + (run.r.miss ? run.r.miss.i : '?'))));
    if (run.r.ok) { secs.push(s); console.log('  info  ' + run.tag.padEnd(34) + ' ' + String(run.r.edges).padStart(3) + ' edges ' + String(run.r.words.length).padStart(5) + ' steps ' + s.toFixed(1).padStart(5) + ' s  (' + run.ms + ' ms)'); }
  }
  secs.sort((a, b) => a - b);
  const med = secs.length ? secs[secs.length >> 1] : 0, p95 = secs.length ? secs[Math.min(secs.length - 1, Math.floor(secs.length * 0.95))] : 0;
  console.log('  info  the level length proxy over ' + secs.length + ' walks: median ' + med.toFixed(1) + ' s, p95 ' + p95.toFixed(1) + ' s (an optimal walk; a player takes two to four times longer; DESIGN 5.1 aims at 60 to 120 s)' + (med < 15 || med > 60 ? '  FLAG: the median is outside 15 to 60 s' : ''));
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
