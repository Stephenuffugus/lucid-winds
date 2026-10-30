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
const ASSERT_FLOOR = 620;              /* raised per task: the count a full run must reach */

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
