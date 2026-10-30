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
const ASSERT_FLOOR = 4727;              /* raised per task: the count a full run must reach (4727 after T1.3, 30 Oct) */

const LATER = { economy: 'M2' };
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
    CRAWLER_V: Math.round(T.CRAWLER_SPEED * G.CELL * 256 / 60), WORLD_W: G.W * G.CELL, WORLD_H: G.H * G.CELL,
    KNOCK_V: T.HIT_KNOCKBACK_CELLS * G.CELL * 256 / T.HIT_KNOCKBACK_FRAMES, KNOCK_FRAMES: T.HIT_KNOCKBACK_FRAMES,
    JELLY_V: Math.round(T.JELLY_SPEED * G.CELL * 256 / 60), ELITE_SUB: T.ELITE_SIZE_CELLS * G.CELL * 256, ELITE_PX: T.ELITE_SIZE_CELLS * G.CELL
  };
  for (const k of Object.keys(T)) if (k.endsWith('_S') && typeof T[k] === 'number') want[k.slice(0, -2) + '_F'] = Math.round(T[k] * 60);
  for (const k of Object.keys(want)) t.eq(K[k], want[k], 'K.' + k + ' recomputed from TUNING');
  /* the known answers, hard coded from the plan: the code's derivation checked against the plan, not itself */
  const KNOWN = { SUB: 256, CELL_SUB: 4096, RUN: 672, DECEL: 168, G: 128, JUMP_V: 2200, CUT_V: 1300, TERM: 3072, WALL_V: 1950,
    WALL_PUSH: 672, DASH_V: 1536, DEEP_JUMP_V: 2432, DEEP_FALL_G: 102, DEEP_TERM: 2458, MOTH_V: 68, CRAWLER_V: 137,
    WORLD_W: 384, WORLD_H: 768, HIT_IFRAMES_F: 60, ICICLE_RESPAWN_F: 360, SPARK_HOP_F: 90, TRAP_PERIOD_F: 90,
    JUMP_SLOT_CD_F: 36, BOSS_TELEGRAPH_F: 48, BOSS_INTRO_F: 120, KNOCK_V: 1024, KNOCK_FRAMES: 8,
    JELLY_V: 68, ELITE_SUB: 6144, ELITE_PX: 24, SPARK_AIR_F: 12 };
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
    43: '411114444111144441111444', 44: '411114444111144441111444', 45: '411114444111144441111444', 46: '411114444111144441111444' }), { stage: 'A' });   /* landmarks are pipeline A's; the route is not this lab's business */
  t.eq(three.landmarks.length, 3, 'three separate blocks standing on the floor are three landmarks (sizes ' + three.landmarks.map(l => l.size).join('/') + '): the floor row joins nothing (Q58)');
  t.ok(three.landmarks.every(l => l.bbox[3] < three.h - 1), 'no landmark reaches into the floor row');
  /* DESIGN 6.5 is 4 connected: two blocks that meet only at a corner are two landmarks */
  const diag = SB.pipeline.build(labRecord({ 10: '411114444444444444444444', 11: '411114444444444444444444', 12: '411114444444444444444444', 13: '411114444444444444444444',
    14: '444441111444444444444444', 15: '444441111444444444444444', 16: '444441111444444444444444', 17: '444441111444444444444444' }), { stage: 'A' });
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

group('H-pipe-11', 'ties break to the lowest: Otsu, landmarks, spawn runs, nearest, hue bands, bright rectangles', t => {
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
  /* equal hue bands (the fifth review): 60 Brick and 60 Lapis (Ember and Deep) on Ash: the band holding the lower
     palette index, Ember (Brick 9 against Lapis 11), wins whichever comes first; 60 Lapis and 60 Moss: Deep (11, 13) */
  const bandTie = (a, b) => { const g = new Uint8Array(1152).fill(SB.palette.I.ASH); for (let i = 0; i < 60; i++) { g[i] = a; g[100 + i] = b; } return SB.pipeline.biomeOf(g, 1152); };
  t.ok(bandTie(SB.palette.I.BRICK, SB.palette.I.LAPIS) === 4 && bandTie(SB.palette.I.LAPIS, SB.palette.I.BRICK) === 4 && bandTie(SB.palette.I.LAPIS, SB.palette.I.MOSS) === 2, 'equal hue bands: the band holding the lower palette index wins (Ember over Deep, Deep over Overgrowth)');
  /* equal bright rectangles: two 3x3 Glare blocks; the one whose top left cell comes first wins */
  const brr = {}; for (const yy of [20, 21, 22]) brr[yy] = '444446664444444444666444';
  const brLv = SB.pipeline.build(labRecord(brr), { stage: 'A' }), brRect = SB.features.brightRect(brLv);
  t.ok(!!brRect && brRect.join() === '5,20,7,22', 'equal bright rectangles: the one whose top left cell comes first (x 5, row 20) wins (' + (brRect ? brRect.join() : 'none') + ')');
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

/* ================================================================ biomes (T1.1) */
const BIOME_IDX = { attic: 0, frost: 1, deep: 2, overgrowth: 3, ember: 4 };
const detected = f => SB.pipeline.biomeOf(SB.record.fromJSON(f.fx.record).pal, SB.GRID.W * SB.GRID.H);
group('H-bio-1', 'biome detection by palette index: each tinted copy of shelves-a is its biome, and every fixture is the biome its author wrote', t => {
  for (const [name, want] of [['biome-attic', 0], ['biome-frost', 1], ['biome-deep', 2], ['biome-green', 3], ['biome-ember', 4]]) {
    const f = FIXTURES.find(x => x.name === name);
    if (!f) { t.ok(false, name + ' is in the corpus'); continue; }
    const lv = buildFx(f, 0);
    t.ok(detected(f) === want && (lv.needsCrop || lv.biome === want), name + ' detects ' + SB.palette.BIOMES[want] + ' (the record gives ' + SB.palette.BIOMES[detected(f)] + (lv.needsCrop ? ', needsCrop' : ', the build ' + SB.palette.BIOMES[lv.biome]) + ')');
  }
  const off = [];
  for (const f of FIXTURES) { const e = f.fx.expect && f.fx.expect.biome; if (e && BIOME_IDX[e] !== detected(f)) off.push(f.name + ' (wrote ' + e + ', detected ' + SB.palette.BIOMES[detected(f)] + ')'); }
  t.eq(off.length, 0, 'every fixture with an authored biome detects it' + (off.length ? ': ' + off.join('; ') : ''));
});
group('H-bio-2', 'the sample room is Attic, in both modes', t => {
  const f = FIXTURES.find(x => x.name === 'sample-room');
  t.eq(detected(f), 0, 'the sample room\'s grid detects Attic');
  /* pipeline A in both modes: the Negative inverts solidity, never the palette, and its full build is an honest
     needsCrop (no tab fits on the stair), which carries no biome */
  for (const mode of MODES) t.eq(buildA(f, mode).biome, 0, 'the sample room mode ' + mode + ' builds as Attic (pipeline A)');
  t.eq(buildFx(f, 0).biome, 0, 'the sample room\'s full build is Attic');
});
group('H-bio-3', 'the bright room rule (Q4): all-light is Frost, all-dark is Attic, and the threshold is FROST_MEAN_L', t => {
  t.eq(detected(FIXTURES.find(x => x.name === 'all-light')), 1, 'all-light detects Frost');
  t.eq(detected(FIXTURES.find(x => x.name === 'all-dark')), 0, 'all-dark detects Attic');
  /* two unsaturated grids either side of the threshold, computed here from the palette's L */
  const n = SB.GRID.W * SB.GRID.H, P = SB.palette, T = SB.TUNING;
  const grey = [0, 1, 2, 3, 4, 5, 6].sort((a, b) => P.L[a] - P.L[b]), above = grey.find(i => P.L[i] > T.FROST_MEAN_L), below = grey.filter(i => P.L[i] <= T.FROST_MEAN_L).pop();
  t.eq(SB.pipeline.biomeOf(new Uint8Array(n).fill(above), n), 1, 'an all ' + P.NAMES[above] + ' grid (L ' + P.L[above] + ', over ' + T.FROST_MEAN_L + ') is Frost');
  t.eq(SB.pipeline.biomeOf(new Uint8Array(n).fill(below), n), 0, 'an all ' + P.NAMES[below] + ' grid (L ' + P.L[below] + ') is Attic');
  /* the saturated fraction's edge: just under BIOME_MIN_FRAC of Lapis on a bright grid stays Frost; at it, Deep */
  const k = Math.ceil(T.BIOME_MIN_FRAC * n), g1 = new Uint8Array(n).fill(above), g2 = new Uint8Array(n).fill(above);
  for (let i = 0; i < k - 1; i++) g1[i] = P.I.LAPIS;
  for (let i = 0; i < k; i++) g2[i] = P.I.LAPIS;
  t.ok(SB.pipeline.biomeOf(g1, n) === 1 && SB.pipeline.biomeOf(g2, n) === 2, (k - 1) + ' Lapis cells on a bright grid stay Frost; ' + k + ' make it Deep');
  /* the threshold itself (the fifth review: the two grids above sit at 139 and 199): Ash, Pewter and Glare mixed to a
     mean of exactly FROST_MEAN_L stay Attic (Q4: Frost only when the mean exceeds it); one Pewter made Ash, Frost */
  let mix = null;
  for (let c = 0; c <= n && !mix; c++) for (let a = 0; a + c < n; a++) { const pw = n - a - c; if (P.L[P.I.ASH] * a + P.L[P.I.PEWTER] * pw + P.L[P.I.GLARE] * c === T.FROST_MEAN_L * n) { mix = [a, pw, c]; break; } }
  const mixGrid = (a, pw, c) => { const g = new Uint8Array(n); let i = 0; for (; i < a; i++) g[i] = P.I.ASH; for (; i < a + pw; i++) g[i] = P.I.PEWTER; for (; i < n; i++) g[i] = P.I.GLARE; return g; };
  t.ok(!!mix && SB.pipeline.biomeOf(mixGrid(mix[0], mix[1], mix[2]), n) === 0 && SB.pipeline.biomeOf(mixGrid(mix[0] + 1, mix[1] - 1, mix[2]), n) === 1, 'a grid whose mean is exactly FROST_MEAN_L (' + (mix ? mix[0] + ' Ash, ' + mix[1] + ' Pewter, ' + mix[2] + ' Glare' : 'none found') + ') is Attic; one Pewter made Ash tips it to Frost');
});
group('H-bio-4', 'slick only on Frost (one way runs of FROST_SLICK_MIN_W), sticky only on Overgrowth and Deep (1 wide solid runs of STICKY_RUN_MIN), at most CAP_STICKY runs', t => {
  const T = SB.TUNING; let slickLevels = 0, stickyLevels = 0, bad = [];
  for (const f of FIXTURES) for (const mode of MODES) for (const biome of [0, 1, 2, 3, 4]) {
    const lv = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { biome, stage: 'A' });
    if (lv.needsCrop) continue;
    const tag = f.name + ' mode ' + mode + ' ' + SB.palette.BIOMES[biome], w = lv.w;
    let slick = 0, sticky = 0, runs = 0;
    for (let i = 0; i < lv.slick.length; i++) {
      if (lv.slick[i]) { slick++; if (!lv.plat[i]) bad.push(tag + ': slick off a one way at ' + i); }
      if (lv.sticky[i]) { sticky++; if (!lv.solid[i]) bad.push(tag + ': sticky off a solid at ' + i); if (i < w || !lv.sticky[i - w]) runs++; }
    }
    if (slick && biome !== 1) bad.push(tag + ': ' + slick + ' slick cells outside Frost');
    if (sticky && biome !== 2 && biome !== 3) bad.push(tag + ': ' + sticky + ' sticky cells outside Overgrowth and Deep');
    if (runs > T.CAP_STICKY) bad.push(tag + ': ' + runs + ' sticky runs (cap ' + T.CAP_STICKY + ')');
    /* the sticky set recomputed here: vertical runs of solid cells with no solid beside them (the frame is no
       neighbour), STICKY_RUN_MIN or taller, the first CAP_STICKY by their top cell in row major order */
    if (biome === 2 || biome === 3) {
      const S = lv.solid, h = lv.h, lone = (x, y) => S[y * w + x] && !(x > 0 && S[y * w + x - 1]) && !(x < w - 1 && S[y * w + x + 1]), want = [];
      for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) { if (!lone(x, y) || (y > 0 && lone(x, y - 1))) continue; let e = y; while (e + 1 < h && lone(x, e + 1)) e++; if (e - y + 1 >= T.STICKY_RUN_MIN) want.push([y * w + x, x, y, e]); }
      want.sort((a, b) => a[0] - b[0]);
      const exp = new Uint8Array(w * h);
      for (const [, x, y0, y1] of want.slice(0, T.CAP_STICKY)) for (let y = y0; y <= y1; y++) exp[y * w + x] = 1;
      for (let i = 0; i < exp.length; i++) if (exp[i] !== lv.sticky[i]) { bad.push(tag + ': sticky at (' + (i % w) + ', ' + Math.floor(i / w) + ') is ' + lv.sticky[i] + ', the test wants ' + exp[i]); break; }
    }
    /* slick exactly the one way runs of FROST_SLICK_MIN_W or more */
    if (biome === 1) for (let y = 0; y < lv.h; y++) { let x = 0; while (x < w) { if (!lv.plat[y * w + x]) { x++; continue; } let e = x; while (e + 1 < w && lv.plat[y * w + e + 1]) e++; const want = e - x + 1 >= T.FROST_SLICK_MIN_W; for (let k = x; k <= e; k++) if (!!lv.slick[y * w + k] !== want) { bad.push(tag + ': the run at (' + x + '..' + e + ', ' + y + ') is ' + (want ? 'not ' : '') + 'slick'); break; } x = e + 1; } }
    if (slick) slickLevels++;
    if (sticky) stickyLevels++;
  }
  t.eq(bad.length, 0, 'the surfaces keep to their biomes' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  t.ok(slickLevels > 0 && stickyLevels > 0, 'the rules bite: ' + slickLevels + ' Frost levels hold slick runs, ' + stickyLevels + ' Overgrowth or Deep levels hold sticky runs');
  /* the cap, the order and the minimum height on a room that bites them (the fifth review: the corpus holds two
     candidates): one wide Soot runs on the frame; by their top cell A (23, rows 2..8), B (0, 10..16), E (23, 12..16,
     one short), C (0, 20..25), D (0, 30..35). Row major the first three are A, B, C; column major B, C, D; with the
     minimum one lower A, B, E; one higher A, B alone */
  const fr = {}, put = (x, y0, y1) => { for (let y = y0; y <= y1; y++) { const r = (fr[y] || '4'.repeat(24)).split(''); r[x] = '1'; fr[y] = r.join(''); } };
  put(23, 2, 8); put(0, 10, 16); put(23, 12, 16); put(0, 20, 25); put(0, 30, 35);
  for (const biome of [2, 3]) {
    const lv = SB.pipeline.build(labRecord(fr), { biome, stage: 'A' }), w = lv.w, S = lv.solid, h = lv.h;
    const lone = (x, y) => S[y * w + x] && !(x > 0 && S[y * w + x - 1]) && !(x < w - 1 && S[y * w + x + 1]), all = [];
    for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) { if (!lone(x, y) || (y > 0 && lone(x, y - 1))) continue; let e = y; while (e + 1 < h && lone(x, e + 1)) e++; all.push([y * w + x, x, y, e]); }
    const pick = (min, order) => { const r = all.filter(q => q[3] - q[2] + 1 >= min).sort(order).slice(0, T.CAP_STICKY), m = new Uint8Array(w * h); for (const [, x, y0, y1] of r) for (let y = y0; y <= y1; y++) m[y * w + x] = 1; return m.join(); };
    const rowMajor = (a, b) => a[0] - b[0], colMajor = (a, b) => a[1] - b[1] || a[2] - b[2], M = T.STICKY_RUN_MIN;
    const want = pick(M, rowMajor), bites = want !== pick(M, colMajor) && want !== pick(M - 1, rowMajor) && want !== pick(M + 1, rowMajor) && all.filter(q => q[3] - q[2] + 1 >= M).length > T.CAP_STICKY;
    t.ok(bites && want === Array.from(lv.sticky).join(), SB.palette.BIOMES[biome] + ': of ' + all.length + ' frame runs the sticky set is the first CAP_STICKY of STICKY_RUN_MIN or taller by their top cell (the room tells apart the cap, the order and the minimum: ' + bites + ')');
  }
});
group('H-bio-5', 'the Frost landing rule (section 3.5, Q74): no edge lands on a slick run\'s end moving off it; a landing the slide cannot carry off stays', t => {
  const W = SB.GRID.W, H = SB.GRID.H, FLOOR = '#'.repeat(W), y = H - 5;
  const into = (lv, x, dir) => { const g = SB.reach.graph(lv), to = y * W + x; let c = 0; for (const es of g.adj) if (es) for (const e of es) if (e.to === to && e.dx > 0 && e.dir === dir) c++; return c; };
  /* six slick cells (x 7..12) four rows over the floor with a drop at both ends; the same run with a wall beside its
     right end. The hero stands on row H-5. */
  const open = LABS.room(['', '.......~~~~~~...........', '', '', FLOOR], { biome: 1 });
  const wall = LABS.room(['.............#..........', '.......~~~~~~#..........', '', '', FLOOR], { biome: 1 });
  let c = into(open, 12, 1); t.eq(c, 0, 'a landing on the right end moving right (the slide would carry the hero off) is no edge (' + c + ' found)');
  c = into(open, 12, -1); t.ok(c > 0, 'a landing on the right end moving left stays (' + c + ' edges)');
  c = into(open, 7, -1); t.eq(c, 0, 'a landing on the left end moving left is no edge (' + c + ' found)');
  c = into(open, 7, 1); t.ok(c > 0, 'a landing on the left end moving right stays (' + c + ' edges)');
  t.ok(into(open, 9, 1) > 0 && into(open, 9, -1) > 0, 'an inner cell of the run keeps its landings from both sides');
  c = into(wall, 12, 1); t.ok(c > 0, 'beside a wall the right end keeps its landings moving right: the wall stops the slide (' + c + ' edges)');
  const g = SB.reach.graph(open);
  t.ok(g.stand[y * W + 7] === 1 && g.stand[y * W + 12] === 1, 'both end cells are standable (T0.10b\'s placeholder refused them outright)');
  /* falls and drops through land by the same rule, and the frame stops a slide (the fifth review: only JUMP and WALK
     were tried): a plank at x 5..8 four rows over the run; its falls and drops that land on the run's right end moving
     right exist over a plain one way and are gone over a slick one */
  const dropOnto = biome => {
    const lv = LABS.room(['.....====', '', '', '', biome === 1 ? '.......~~~~~~...........' : '.......======...........', '', '', FLOOR], { biome }), g = SB.reach.graph(lv), to = y * W + 12;
    let k = 0; for (const es of g.adj) if (es) for (const e of es) if (e.to === to && e.dx > 0 && e.dir === 1 && (e.kind === 'FALL' || e.kind === 'JUMP_DOWN')) k++; return k;
  };
  const plainK = dropOnto(0), slickK = dropOnto(1);
  t.ok(plainK > 0 && slickK === 0, 'falls and drops onto the run\'s right end moving right: ' + plainK + ' edges over a plain one way, ' + slickK + ' over a slick one');
  const atFrame = LABS.room(['', '..................~~~~~~', '', '', FLOOR], { biome: 1 });
  c = into(atFrame, 23, 1);
  t.ok(c > 0, 'a run against the frame keeps its landings onto the end moving right: the frame stops the slide (' + c + ' edges)');
});

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
  /* the third review: coyote outlived a wall jump and a sticky jump, a mid air second jump. Walk off a ledge into a
     one cell gap beside a wall (or a vine), arm inside coyote time, jump off it, press again two steps later */
  for (const [kind, ch, biome] of [['wall jump', '#', 0], ['sticky jump', '|', 3]]) {
    /* the ledge at columns 0 and 1, the gap at column 2, the wall (or vine) at column 3 from row 10 to the floor */
    const lines = ['', '', '', '', '', '', '', '', '', '', '...' + ch, '...' + ch, '...' + ch, '...' + ch, '...' + ch, '...' + ch, '...' + ch, '...' + ch, '.S.' + ch, '##.' + ch].concat(Array(10).fill('...' + ch), [FLOOR]);
    const lv = LABS.room(lines, { biome });
    const s = SB.sim.create(lv); for (let k = 0; k < 3; k++) SB.sim.step(s, 0);
    let armedAt = -1;
    for (let k = 0; k < 30 && armedAt < 0; k++) { SB.sim.step(s, IN.R); if (s.hero.wall === 1 || s.hero.sticky) armedAt = k; }
    const coyoteLeft = s.hero.coyote, kicks = [];
    for (let k = 0; k < 40; k++) {
      const vy0 = s.hero.vy; SB.sim.step(s, (k === 0 || k === 2 ? IN.A | IN.A_TAP : 0) | (ch === '#' && k === 0 ? IN.R : 0));
      if (s.hero.vy < 0 && s.hero.vy < vy0 - K.G) kicks.push(k);
    }
    t.ok(armedAt >= 0 && coyoteLeft > 0 && kicks.length === 1, 'a ' + kind + ' inside coyote time (' + coyoteLeft + ' left) and a press two steps later: one upward kick (kicks on steps ' + kicks.join(' ') + ')');
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
  /* footing (T0.13a, Q65): a hero walking off a one way keeps its footing while any of its box overlaps the plank, as
     on a solid, and falls the step its box clears it */
  for (const [kind, ch] of [['one way', '='], ['solid', '#']]) {
    const pl = LABS.room(['', '.........' + ch.repeat(3) + '...........', '', '', FLOOR]), row = pl.h - 5, plankEnd = 12 * CS;
    const s = SB.sim.create(pl, { at: { x: 10 * CS + 2 * 256, y: row * CS } });
    for (let f = 0; f < 4; f++) SB.sim.step(s, 0);
    let lastOv = null, firstAirX = null;
    for (let f = 0; f < 40 && firstAirX === null; f++) {
      const before = s.hero.x; SB.sim.step(s, IN.R);
      if (s.hero.ground) lastOv = plankEnd - s.hero.x; else firstAirX = s.hero.x;
    }
    /* from x 162 the box's overlap falls 2.625 px a step: 3.75, then 1.125 (under LAND_OVERLAP: a 2 px rule drops the
       hero here), then the box is clear */
    t.ok(lastOv > 0 && lastOv < 2 * 256 && firstAirX >= plankEnd, 'walking off a ' + kind + ' plank the hero stands while its box overlaps it, even by under 2 px (the last grounded overlap ' + (lastOv / 256).toFixed(3) + ' px), and falls once it clears it (x ' + (firstAirX / 256).toFixed(3) + ', the end at ' + plankEnd / 256 + ')');
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

group('H-sim-9b', 'LAB-NOT for the wall (the third review): a wall jump never re arms on the wall it left, so no wall is a ladder', t => {
  /* a 37 row wall at x 2, and the frame's left edge (out of bounds is solid): armed low, then the rocker held toward
     the wall throughout and A pressed on every step the slide is armed; the hero never arms on that side again before
     it lands, and it climbs no higher than one wall jump */
  const tall = []; for (let r = 10; r <= 46; r++) tall.push('..#');
  for (const [name, lv, x, side] of [['a 37 row wall', LABS.room(tall.concat([FLOOR])), 3 * CS, -1], ['the frame\'s left edge', LABS.room([FLOOR]), 0, -1]]) {
    const s = placed(lv, x, 40 * CS);
    SB.sim.step(s, rockerOf(side));
    const y0 = s.hero.y; let jumps = 0, rearm = 0, top = y0;
    for (let k = 0; k < 400 && !s.hero.ground; k++) {
      const armed = s.hero.wall === side;
      SB.sim.step(s, rockerOf(side) | (armed ? IN.A | IN.A_TAP : 0));
      if (armed) jumps++; else if (s.hero.wall === side) rearm++;
      top = Math.min(top, s.hero.y);
    }
    t.ok(jumps === 1 && rearm === 0, name + ': after its wall jump the hero never arms on that wall again before landing (' + jumps + ' wall jumps, ' + rearm + ' re arms)');
    t.ok(y0 - top <= 4 * CS, name + ': it climbs ' + ((y0 - top) / 256).toFixed(1) + ' px, one wall jump at most (no ladder)');
  }
  /* between two walls the chain still works: walls 3 apart, the rocker toward each in turn */
  const two = []; for (let r = 10; r <= 46; r++) two.push('..#...#');
  const lv2 = LABS.room(two.concat([FLOOR])), s2 = placed(lv2, 3 * CS, 40 * CS);
  SB.sim.step(s2, IN.L);
  let side = -1, chain = 0;
  for (let k = 0; k < 300 && !s2.hero.ground && chain < 3; k++) {
    const armed = s2.hero.wall === side;
    SB.sim.step(s2, rockerOf(armed ? -side : side) | (armed ? IN.A | IN.A_TAP : 0));
    if (armed) { chain++; side = -side; }
  }
  t.ok(chain >= 3, 'between two walls 3 apart the wall jumps chain (' + chain + ' in a row)');
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
  const lastSlide = a.hero.y; SB.sim.step(a, 0);
  t.eq(a.hero.wall, 0, 'releasing the rocker unarms it');
  /* and the fall goes on from the slide's speed, gaining a step's gravity at a time, never jumping to the unarmed fall */
  const after = [a.hero.y - lastSlide]; for (let k = 0; k < 3; k++) { const y = a.hero.y; SB.sim.step(a, 0); after.push(a.hero.y - y); }
  t.ok(after.every((m, k) => k === 0 || m - after[k - 1] <= K.G), 'after the release the fall continues from the slide\'s third, one step\'s gravity at a time (' + after.map(m => (m / 256).toFixed(2)).join(' ') + ' px)');
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
  /* section 3.8 item 4: the rocker away lets go too */
  const s3 = placed(lv, 3 * CS, (v1 - 2) * CS); for (let k = 0; k < 5 && !s3.hero.sticky; k++) SB.sim.step(s3, 0);
  SB.sim.step(s3, IN.R);
  t.ok(s3.hero.sticky === 0 && s3.hero.wall === 0, 'the rocker away from the vine lets go (sticky ' + s3.hero.sticky + ')');
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
  t.eq(s.hero.facing, 1, 'held toward the wall through the lock, the facing stays away (the third review: it flipped back on the step after the jump)');
  /* the lock's length (the third review: nothing pinned 10): held toward the wall, the hero moves away on exactly the
     jump step and the next WALL_JUMP_LOCK - 1, and turns back on the step after */
  const s4 = placed(lv, 3 * CS, 36 * CS); SB.sim.step(s4, IN.L); SB.sim.step(s4, IN.L | IN.A | IN.A_TAP);
  const vxs = [s4.hero.vx]; for (let k = 0; k < SB.TUNING.WALL_JUMP_LOCK + 1; k++) { SB.sim.step(s4, IN.L | IN.A); vxs.push(s4.hero.vx); }
  const away = vxs.slice(0, SB.TUNING.WALL_JUMP_LOCK), back = vxs[SB.TUNING.WALL_JUMP_LOCK];
  t.ok(away.every(v => v > 0) && back < 0, 'held toward the wall, the push away lasts exactly WALL_JUMP_LOCK (' + SB.TUNING.WALL_JUMP_LOCK + ') steps, then the rocker turns the hero (vx ' + vxs.map(v => v / 256).join(' ') + ')');
  const s2 = placed(lv, 3 * CS, 36 * CS); SB.sim.step(s2, IN.L); SB.sim.step(s2, IN.L | IN.A | IN.A_TAP);
  const faced = []; for (let k = 0; k < SB.TUNING.WALL_JUMP_LOCK - 1; k++) { SB.sim.step(s2, IN.L | IN.A); faced.push(s2.hero.facing); }
  t.ok(faced.every(f => f === 1), 'on every lock step with the rocker toward the wall the facing is away (' + faced.join(' ') + ')');
  for (let k = 0; k < 12; k++) SB.sim.step(s2, IN.A);
  const before = s2.hero.facing;
  SB.sim.step(s2, IN.L);
  t.ok(before === 1 && s2.hero.facing === -1, 'after the lock a rocker tap toward the wall turns the hero (from ' + before + ' to ' + s2.hero.facing + ')');
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
    const g = SB.reach.graph(lv), touches = (g.adj[lv.spawn] || []).filter(e => e.kind === 'WALLTOUCH' && e.dir === 1).map(e => { const c = (e.to - g.n) >> 1; return (c % 24) + ',' + Math.floor(c / 24); });
    /* the direction section 3 needs (the third review: this lab once asked only that the sim's row be in the model's
       list, which passes however much the model claims): every contact the model lists is one the sim arms */
    const arms = simArmsRight(lv, lv.spawn % 24, Math.floor(lv.spawn / 24));
    t.ok(armed >= 0 && touches.length > 0 && touches.every(c => arms.has(c)), 'a FULL jump right arms the slide; every contact the model lists from the start (' + touches.join(' ') + ') is one the sim arms (' + [...arms].join(' ') + ')'); }
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

group('H-sim-13b', 'the dive ends as DESIGN 4.3 says (the third review): from a running jump it drops its column; no coyote jump out of it; the shake runs down; beside a wall it never slides', t => {
  const floorLv = LABS.room(['', '', '', '', '', '', '', '', '', '', FLOOR]);
  /* a running jump, then B with the rocker released: vx 0 on the press step, the same column to the landing */
  { const s = placed(floorLv, 3 * CS + 2 * 256, 46 * CS); SB.sim.step(s, 0); SB.sim.step(s, 0);
    for (let k = 0; k < 6; k++) SB.sim.step(s, IN.R);
    SB.sim.step(s, IN.R | IN.A | IN.A_TAP); for (let k = 0; k < 8; k++) SB.sim.step(s, IN.R | IN.A);
    const vxBefore = s.hero.vx; SB.sim.step(s, IN.B | IN.B_TAP);
    const x0 = s.hero.x, vxPress = s.hero.vx; let drift = 0;
    for (let k = 0; k < 80 && !s.hero.ground; k++) { SB.sim.step(s, 0); drift = Math.max(drift, Math.abs(s.hero.x - x0)); }
    t.ok(vxBefore === K.RUN && vxPress === 0 && drift === 0 && s.hero.ground === 1, 'a dive from a running jump (vx ' + vxBefore + ') zeroes vx on the press step (' + vxPress + ') and drops straight down its column (drift ' + (drift / 256).toFixed(2) + ' px)'); }
  /* walk off a ledge, B on the second airborne step, A on the next: still diving, no jump out of coyote time */
  { const lv = LABS.room(['', '.S.', '###', '', '', '', '', '', FLOOR]), s = SB.sim.create(lv); for (let k = 0; k < 3; k++) SB.sim.step(s, 0);
    let air = 0; for (let k = 0; k < 40 && air < 2; k++) { SB.sim.step(s, IN.R); if (!s.hero.ground) air++; }
    SB.sim.step(s, IN.B | IN.B_TAP); SB.sim.step(s, IN.A | IN.A_TAP);
    t.ok(s.hero.dive > 0 && s.hero.vy === K.TERM, 'A pressed in coyote time after a dive does not jump out of it (dive ' + s.hero.dive + ', vy ' + s.hero.vy + ')'); }
  /* the shake: SHAKE_F on the landing step, then one less a step to 0 */
  { const s = placed(floorLv, 3 * CS + 2 * 256, 40 * CS); SB.sim.step(s, IN.B | IN.B_TAP);
    for (let k = 0; k < 80 && !s.hero.ground; k++) SB.sim.step(s, 0);
    const seq = [s.hero.shake]; for (let k = 0; k < K.SHAKE_F + 2; k++) { SB.sim.step(s, 0); seq.push(s.hero.shake); }
    const want = Array.from({ length: K.SHAKE_F + 3 }, (_, k) => Math.max(0, K.SHAKE_F - k));
    t.same(seq, want, 'the dive landing\'s shake counts down from SHAKE_F to 0, one a step'); }
  /* a dive flush against a wall with the rocker toward it falls at terminal, never a slide */
  { const lines = []; for (let r = 20; r <= 46; r++) lines.push('..#'); const lv = LABS.room(lines.concat([FLOOR]));
    const s = placed(lv, 3 * CS, 24 * CS); SB.sim.step(s, IN.L); SB.sim.step(s, IN.L | IN.B | IN.B_TAP);
    const moves = []; for (let k = 0; k < 6; k++) { const y = s.hero.y; SB.sim.step(s, IN.L); moves.push(s.hero.y - y); }
    t.ok(moves.every(m => m === K.TERM) && s.hero.wall === 0, 'a dive beside a wall, the rocker toward it, falls at terminal (' + moves.map(m => m / 256).join(' ') + ' px a step) and never arms a slide'); }
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
  /* the rocker reversed from the dash's third step: the dash still covers 48 px in its facing (DESIGN 4.3) */
  { const h = placed(lv, 4 * CS + 2 * 256, 46 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
    const x0 = h.hero.x; SB.sim.step(h, IN.R | IN.B | IN.B_TAP); SB.sim.step(h, 0);
    for (let k = 0; k < 6; k++) SB.sim.step(h, IN.L);
    t.eq((h.hero.x - x0) / 256, 48, 'the rocker reversed mid dash, the dash still covers 48 px in its facing'); }
  /* a dash into a wall ends on the step it meets the wall */
  { const wl = LABS.room(['.........#', FLOOR]), h = placed(wl, 7 * CS + 2 * 256, 46 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
    SB.sim.step(h, IN.R | IN.B | IN.B_TAP); let ended = -1;
    for (let k = 0; k < 10 && ended < 0; k++) { const x = h.hero.x; SB.sim.step(h, 0); if (h.hero.dash === 0) ended = k; if (h.hero.x === x && h.hero.dash > 0) { ended = -2; break; } }
    t.ok(ended >= 0 && h.hero.x === 9 * CS - HW, 'a dash into a wall stops flush and ends on that step (ended after ' + ended + ' more steps, x ' + (h.hero.x / 256).toFixed(1) + ')'); }
  /* the third review: a dash that cannot move is no dash (no i frames to drum for at a wall), and a foot already past
     an edge gets no dash, not a hop over a one cell gap */
  { const wl = LABS.room(['......#', FLOOR]), h = placed(wl, 6 * CS - HW, 46 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
    const x0 = h.hero.x; SB.sim.step(h, IN.R | IN.B | IN.B_TAP);
    t.ok(h.hero.x === x0 && h.hero.dash === 0 && h.hero.dashI === 0, 'a dash pressed flush against a wall does not move and keeps no i frames (dash ' + h.hero.dash + ', dashI ' + h.hero.dashI + ')'); }
  { const gap = LABS.room(['..#####.#####'].concat(Array(6).fill(''), [FLOOR]));
    for (const over of [3, 6, 10, 11]) {
      const h = placed(gap, 7 * CS - HW + over * 256, 39 * CS); SB.sim.step(h, 0); SB.sim.step(h, 0);
      const x0 = h.hero.x, g0 = h.hero.ground; SB.sim.step(h, IN.R | IN.B | IN.B_TAP);
      for (let k = 0; k < 10; k++) SB.sim.step(h, 0);
      t.ok(g0 === 1 && h.hero.dashI === 0 && Math.abs(h.hero.x - x0) < CS, 'standing ' + over + ' px past a platform\'s edge, B gives no dash (moved ' + ((h.hero.x - x0) / 256).toFixed(1) + ' px; the far platform 1 cell away)');
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
  /* the third review: TUNING.AIR_CONTROL is read nowhere; the sim and the tables implement full air control only, so any
     other value must arrive with its rule (Q23), not as a knob that changes nothing */
  t.eq(SB.TUNING.AIR_CONTROL, 1, 'TUNING.AIR_CONTROL is 1, the only value the sim and the tables implement (Q23)');
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
          /* any overlap: a hero standing on a one way keeps its footing to its last pixel (T0.13a); landing on one from
             the air takes LAND_OVERLAP, which H-sim-4 holds */
          else if (lv.plat[row * lv.w + cx] && Math.min(h.x + HW, (cx + 1) * CS) - Math.max(h.x, cx * CS) > 0) support = true;
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
    let n = 0, firstOff = null, catchOff = null, catchN = 0;
    for (const p of REACH_PROFILES) {
      const clip = ORACLE.clipped(p, deep);
      for (let dy = 0; dy <= 5; dy++) for (let dx = 0; dx <= clip[dy]; dx++) {
        const can = ORACLE.canonical(p, 1, dx, dy, { deep }), mine = (ct.profiles[p].paths[dx + ',' + dy] || [])[0];
        const want = can ? [...ORACLE.corridor(can, 1)].sort().join(' ') : 'none', got = mine ? mine.cells.map(q => q[0] + ',' + q[1]).sort().join(' ') : 'none';
        n++;
        if (want !== got && !firstOff) firstOff = tag + p + ' dx' + dx + ' dy' + dy + ': core [' + got + '] oracle [' + want + ']';
        /* the catch list (section 3.3: no one way may catch the hero first), against the oracle's own descent crossings
           (the third review: nothing checked it, so a row off or a dropped overlap test passed every gate) */
        const late = (ct.profiles[p].paths[dx + ',' + dy] || [])[1], lateCan = late ? ORACLE.lateCanonical(p, 1, dx, dy, { deep }) : null;
        for (const [label, c, m] of [['', can, mine], [' late', lateCan, late]]) {
          if (!c || !m || p === 'WALL' || p === 'STICKY') continue;
          catchN++;
          const wantC = oracleCatches(c).sort().join(' '), gotC = m.catches.map(q => q[0] + ',' + q[1]).sort().join(' ');
          if (wantC !== gotC && !catchOff) catchOff = tag + p + label + ' dx' + dx + ' dy' + dy + ': core [' + gotC + '] oracle [' + wantC + ']';
        }
      }
    }
    /* the walk offs and the jump downs too */
    for (const [kind, table, profile] of [['walk off', ct.fallPaths, 'WALK'], ['jump down', ct.downPaths, 'FULL']]) for (const key of Object.keys(table)) {
      const [dx, r] = key.split(',').map(Number), c = ORACLE.canonical(profile, 1, dx, -r, { deep });
      if (!c) { if (!catchOff) catchOff = tag + kind + ' ' + key + ': the oracle has no canonical path'; continue; }
      catchN++;
      const wantC = oracleCatches(c).sort().join(' '), gotC = table[key].catches.map(q => q[0] + ',' + q[1]).sort().join(' ');
      if (wantC !== gotC && !catchOff) catchOff = tag + kind + ' ' + key + ': core [' + gotC + '] oracle [' + wantC + ']';
    }
    t.ok(!firstOff, tag + 'all ' + n + ' corridors in the cone: the core\'s immediate path equals the oracle\'s canonical corridor' + (firstOff ? ' (first: ' + firstOff + ')' : ''));
    t.ok(!catchOff, tag + 'all ' + catchN + ' catch lists in the cone equal the oracle\'s descent crossings' + (catchOff ? ' (first: ' + catchOff + ')' : ''));
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
  /* 2 away since T0.13a (S3 widened to x 17): the exact touch's highest contact from S2 is (19, 35), and 3 up 3 across
     is the WALL table's edge, with no slack for the route; (Q64: a wall jump starts touching its wall) */
  t.ok(hasEdge(g, cnode(g, 19, 35, 1), at(17, 32), 'WALLJUMP'), 'a WALLJUMP off the pillar at (19, 35) onto S3 at (17, 32): 2 away, 3 up');
  t.ok(hasEdge(g, at(5, 19), at(5, 42), 'FALL'), 'a straight FALL from S6 (5, 19) through S5 and S4 onto S1 (5, 42)');
  const bad = edgesOf(g).filter(e => e.kind === 'JUMP' && (e.dy >= 5 || (e.dy === 4 && e.dx >= 5)));
  t.eq(bad.length, 0, 'no JUMP is 5 up, and none is 4 up and 5 across (' + bad.slice(0, 3).map(e => gname(g, e.from) + ' to ' + gname(g, e.to)).join(', ') + ')');
});

/* the set of contacts (centre column and row) the sim arms on its right from a centred hero at (sx, sy), over the bot's
   touch candidates (FULL, MID, TAP and the walk off, the rocker from steps 0 to 8) */
function simArmsRight(lv, sx, sy) {
  const out = new Set();
  for (const p of ['FULL', 'MID', 'TAP', 'WALKOFF']) for (let delay = 0; delay <= 8; delay++) {
    const s = SB.sim.create(lv, { at: { x: sx * CS + 2 * 256, y: sy * CS } });
    for (let k = 0; k < 3; k++) SB.sim.step(s, 0);
    for (let k = 0; k < 120; k++) {
      SB.sim.step(s, (p !== 'WALKOFF' && k < A_FRAMES[p] ? IN.A | (k === 0 ? IN.A_TAP : 0) : 0) | (k >= delay ? IN.R : 0));
      if (s.hero.wall === 1) out.add(Math.floor((s.hero.x + (HW >> 1)) / CS) + ',' + Math.floor((s.hero.y + CS - 1) / CS));
      if (s.hero.ground && k > 12) break;
    }
  }
  return out;
}
group('H-reach-11', 'the exact wall touch (T0.13a, Q65): the model lists the contacts the sim arms, and no others, where the bot found it wrong', t => {
  const simArms = simArmsRight;
  const modelTouches = (lv, g, sx, sy) => (g.adj[sy * lv.w + sx] || []).filter(e => e.kind === 'WALLTOUCH' && e.dir === 1).map(e => { const c = (e.to - g.n) >> 1; return (c % lv.w) + ',' + Math.floor(c / lv.w); });
  /* shelves-a: from S2's middle no jump meets the pillar; from (15, 39) on, every contact the model lists is one the sim arms */
  { const lv = buildFx(fixture('shelves-a'), 0), g = SB.reach.graph(lv);
    for (const sx of [11, 12, 13, 14]) t.same(modelTouches(lv, g, sx, 39), [], 'shelves-a: from (' + sx + ', 39) the model lists no touch on the pillar (the sim arms none: ' + [...simArms(lv, sx, 39)].join(' ') + ')');
    /* from (15, 39) the jump meets the pillar with the box 0.1 px under row 36's stance, and row 37 has no wall: no contact */
    t.same(modelTouches(lv, g, 15, 39), [], 'shelves-a: from (15, 39) the model lists no touch (the sim arms only under row 36\'s stance: ' + [...simArms(lv, 15, 39)].join(' ') + ')');
    for (const sx of [16, 17, 18]) {
      const sim = simArms(lv, sx, 39), model = modelTouches(lv, g, sx, 39);
      t.ok(model.length > 0 && model.every(c => sim.has(c)), 'shelves-a: from (' + sx + ', 39) the model lists ' + model.join(' ') + ', each armed by the sim (' + [...sim].join(' ') + ')');
    }
  }
  /* noise-s2: a FULL jump from (17, 25) brushes the corner of the wall cells at (23, 22..23), loses a step there and
     moves on over the block at (23, 30): no contact at (22, 30) */
  { const lv = buildFx(fixture('noise-s2'), 0), g = SB.reach.graph(lv);
    t.ok(!modelTouches(lv, g, 17, 25).includes('22,30') && !simArms(lv, 17, 25).has('22,30'), 'noise-s2: from (17, 25) neither the model nor the sim has a contact at (22, 30) (the model: ' + modelTouches(lv, g, 17, 25).join(' ') + ')');
  }
});

/* section 3.3's costs, recomputed from the edge's own fields and the oracle's tables (the third review: every cost
   weight but the +3 could change and every gate stayed green; the planner's choice among routes rests on them) */
group('H-reach-12', 'every edge\'s cost is section 3.3\'s formula', t => {
  const want = (g, e) => {
    const cellOf = v => (v < g.n ? v : (v - g.n) >> 1), fy = Math.floor(cellOf(e.from) / g.w), fx = cellOf(e.from) % g.w, ty = Math.floor(cellOf(e.to) / g.w), tx = cellOf(e.to) % g.w;
    if (e.kind === 'WALK') return 1;
    if (e.kind === 'JUMP') { const m = ORACLE.clipped(e.profile, false); const edge = e.dx === m[e.dy] || e.dy + 1 >= m.length || m[e.dy + 1] < e.dx; return 2 + e.dy + e.dx / 2 + (edge ? 3 : 0); }
    if (e.kind === 'JUMP_DOWN') return 2 + e.dx / 2;
    if (e.kind === 'FALL' || e.kind === 'LET_GO') return 1 + (ty - fy) / 4;
    if (e.kind === 'SLIDE') return ty - fy;
    if (e.kind === 'STICKYUP') return 2;
    if (e.kind === 'STICKYTOP') return 3;
    if (e.kind === 'WALLTOUCH') { const up = fy - ty, across = Math.abs(tx - fx); return (up >= 0 ? 2 + up + across / 2 : 1 + (ty - fy) / 4) + 1; }
    if (e.kind === 'WALLJUMP') { if (e.dx === 0) return 4; const m = ORACLE.clipped('WALL', false); const edge = e.dx === m[e.dy] || e.dy + 1 > SB.TUNING.WALL_UP || m[e.dy + 1] < e.dx; return 3 + e.dy + (edge ? 3 : 0); }
    return null;
  };
  const rooms = [['sample-room', buildFx(fixture('sample-room'), 0)], ['shelves-a', buildFx(fixture('shelves-a'), 0)], ['noise-s2', buildFx(fixture('noise-s2'), 0)]];
  const v = LABS.room(['', '.......#', '......|', '......|', '......|', '......|', '......|', '......|.==', '......|', '......|', '......|', '......|', '', '', FLOOR], { biome: 3 });
  rooms.push(['a vine room', v]);
  for (const [name, lv] of rooms) {
    const g = SB.reach.graph(lv), bad = [], kinds = new Set(); let n = 0;
    for (const es of g.adj) for (const e of es || []) { n++; kinds.add(e.kind); const w = want(g, e); if (w === null || Math.abs(w - e.cost) > 1e-9) bad.push(e.kind + ' ' + e.dx + ',' + e.dy + ' cost ' + e.cost + ' want ' + w); }
    t.ok(bad.length === 0, name + ': all ' + n + ' edges (' + [...kinds].join(', ') + ') cost what section 3.3 says' + (bad.length ? ' (' + bad.length + ' do not: ' + bad.slice(0, 4).join('; ') + ')' : ''));
  }
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
  /* the catches planted from the oracle's own arcs (the third review: planting from the core's catch lists let a wrong
     list plant its own one way and pass); a profile with no oracle path to 5 across is skipped */
  { const each = ['FULL', 'MID', 'TAP'].map(p => [ORACLE.canonical(p, 1, 5, 0), ORACLE.lateCanonical(p, 1, 5, 0)].filter(Boolean)).filter(cs => cs.length).map(cs => new Set(cs.flatMap(oracleCatches)));
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
/* the oracle's catch list for a canonical path: the one way tops its descent crosses before the landing step with
   LAND_OVERLAP of the box over the column, named as the core names them, [column, rows above the takeoff's support - 1] */
function oracleCatches(can) {
  const out = new Set(), a = can.a;
  for (let f = 1; f < can.land; f++) for (let j = -30; j <= 8; j++) {   /* walk offs fall up to 24 rows */
    const top = -j * CS;
    if (!(a[f - 1].y <= top && a[f].y > top)) continue;
    for (let col = Math.floor(a[f].x / CS); col <= Math.floor((a[f].x + HW - 1) / CS); col++)
      if (Math.min(a[f].x + HW, (col + 1) * CS) - Math.max(a[f].x, col * CS) >= K.OVERLAP_SUB) out.add(col + ',' + (j - 1));
  }
  return [...out];
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
    if (!lv.needsCrop && e.tabsMax !== null) t.ok(lv.repair.tabs <= e.tabsMax, f.name + ': ' + lv.repair.tabs + ' tabs (at most ' + e.tabsMax + ')');
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

group('H-rep-1b', 'the exit rule at its boundaries (the third review): the light inside EXIT_LIGHT_SLACK and just past it; never below the top EXIT_ROWS', t => {
  /* a room of standable cells along row 2 and row 4 (one ways under them), the light at (3, 2); distances set by hand */
  const lv = LABS.room(['', '', '', '========================', '', '========================'].concat(Array(41).fill(''), [FLOOR]));
  const T = SB.TUNING, light = Int32Array.from([2 * 24 + 3]), mk = set => { const d = new Int32Array(3 * lv.w * lv.h).fill(-1); for (const [x, y, v] of set) d[y * lv.w + x] = v; return d; };
  const at = e => (e % lv.w) + ',' + Math.floor(e / lv.w);
  const inside = SB.pipeline.exitByReach(lv, light, mk([[3, 2, 10], [12, 2, 10 + T.EXIT_LIGHT_SLACK]]));
  t.eq(at(inside), '3,2', 'a cell exactly EXIT_LIGHT_SLACK (' + T.EXIT_LIGHT_SLACK + ') edges farther than the light leaves the light the exit');
  const past = SB.pipeline.exitByReach(lv, light, mk([[3, 2, 10], [12, 2, 11 + T.EXIT_LIGHT_SLACK]]));
  t.eq(at(past), '12,2', 'one edge more, and the farther cell is the exit');
  const low = SB.pipeline.exitByReach(lv, null, mk([[3, 2, 10], [12, T.EXIT_ROWS, 30]]));
  t.eq(at(low), '3,2', 'a reached cell on row EXIT_ROWS (' + T.EXIT_ROWS + '), farther than every top row cell, is never the exit');
});

group('H-rep-2', 'tabs never on a landmark cell nor within 1 cell of a landmark top', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    /* the rule is repair's, on the photo's landmark tops (DESIGN 6.7); the pocket (T1.2a) is carved after repair and
       its floor is no furniture top, so its cells count as their landmark's here */
    const pk = lv.features && lv.features.pocket, view = pk ? Object.assign({}, lv, { solid: lv.solid.map((v, i) => pk.cells.includes(i) ? 1 : v), landmarks: lv.landmarks.concat([{ cells: Int32Array.from(pk.cells) }]) }) : lv;
    const near = landmarkTopNear(view), bad = [];
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

group('H-rep-7', 'the tabs repair lays keep the one way rules: never directly on another one way, never under a solid, never in a landmark', t => {
  /* the third review: H-pipe-4 holds these on pipeline A only, so a stair rule dropped passed every gate */
  let levels = 0, tabsSeen = 0;
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    levels++;
    const bad = { onOneWay: [], underSolid: [], inLandmark: [] }, lm = new Set(lv.landmarks.flatMap(l => Array.from(l.cells)));
    for (let i = 0; i < lv.w * lv.h; i++) if (lv.tab[i]) {
      tabsSeen++;
      const x = i % lv.w, y = Math.floor(i / lv.w);
      if (y + 1 < lv.h && lv.plat[i + lv.w] && !lv.tab[i + lv.w]) bad.onOneWay.push(x + ',' + y);
      if (y + 1 < lv.h && lv.tab[i + lv.w]) bad.onOneWay.push(x + ',' + y);
      if (y > 0 && lv.solid[i - lv.w]) bad.underSolid.push(x + ',' + y);
      if (lm.has(i)) bad.inLandmark.push(x + ',' + y);
    }
    t.ok(!bad.onOneWay.length && !bad.underSolid.length && !bad.inLandmark.length, f.name + ' mode ' + mode + ': its ' + lv.repair.tabs + ' tabs keep the rules' + (bad.onOneWay.length + bad.underSolid.length + bad.inLandmark.length ? ' (on a one way ' + bad.onOneWay.join(' ') + '; under a solid ' + bad.underSolid.join(' ') + '; in a landmark ' + bad.inLandmark.join(' ') + ')' : ''));
  }
  console.log('  info  H-rep-7: ' + tabsSeen + ' tab cells over ' + levels + ' built levels; repair\'s 15% cap cannot bind at TAB_MAX ' + SB.TUNING.TAB_MAX + ' by ' + SB.TUNING.REPAIR_PASSES + ' passes (at most ' + (100 * 2 * SB.TUNING.TAB_MAX * SB.TUNING.REPAIR_PASSES / (SB.GRID.W * SB.GRID.H)).toFixed(1) + '% of the cells; Q66)');
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
/* T1.3's oracles, the test's own: the edge set with the trap field (an edge of the room's graph that the graph with
   the field walled also has; no trap cell a node), the safe cells after placement (standable there, outside every
   envelope and the field, more than ROUTE_SAFE_ENEMY_DIST from every spawn but the pocket's elite: Q57, Q80; with
   letter, the elite too), and the worst climb between safe cells along an ascent (null when an edge is missing) */
const edgeKey = e => e.to + ' ' + e.kind + ' ' + e.profile + ' ' + e.dir + ' ' + e.dx + ' ' + e.dy;
function trapGraphOf(lv) {
  const g = SB.reach.graph(lv), n = g.n;
  if (!lv.trap || !lv.trap.some(v => v)) return g;
  const walled = Uint8Array.from(lv.solid); for (let i = 0; i < n; i++) if (lv.trap[i]) walled[i] = 1;
  const gw = SB.reach.graph(Object.assign({}, lv, { solid: walled })), adj = [];
  g.adj.forEach((es, u) => { if (!es) return; const ws = new Set((gw.adj[u] || []).map(edgeKey)), keep = es.filter(e => ws.has(edgeKey(e))); if (keep.length) adj[u] = keep; });
  return Object.assign({}, g, { adj, stand: Uint8Array.from(g.stand, (v, i) => lv.trap[i] ? 0 : v) });
}
function safeOf(lv, g, letter) {
  const w = lv.w, n = w * lv.h, f = lv.features || {}, safe = Uint8Array.from(g.stand), R = SB.TUNING.ROUTE_SAFE_ENEMY_DIST;
  for (const e of f.enemies || []) {
    for (const c of e.env || []) if (c >= 0 && c < n) safe[c] = 0;
    if (!letter && e.elite && f.pocket && f.pocket.cells.includes(e.idx)) continue;
    for (let i = 0; i < n; i++) if (cheb(i, e.idx, w) <= R) safe[i] = 0;
  }
  if (lv.trap) for (let i = 0; i < n; i++) if (lv.trap[i]) safe[i] = 0;
  return safe;
}
function cadenceOf(lv, a, g, safe) {
  const n = g.n, rowOf = v => Math.floor((v < n ? v : (v - n) >> 1) / lv.w); let r = 0, worst = 0;
  for (const e of a.edges) {
    if (!(g.adj[e.from] || []).some(x => edgeKey(x) === edgeKey(e))) return null;
    const climbed = Math.max(0, rowOf(e.from) - rowOf(e.to)); worst = Math.max(worst, r + climbed);
    r = e.to < n && safe[e.to] ? 0 : r + climbed;
  }
  return worst;
}

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

group('H-route-2', 'on every ascent, consecutive safe cells are at most 8 rows apart: the safe cells after placement (T1.3: outside every envelope and the trap field, clear of every spawn), over the edge set with the trap field', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop || !lv.ascent || !lv.ascent.nodes) continue;
    const g = trapGraphOf(lv), worst = cadenceOf(lv, lv.ascent, g, safeOf(lv, g));
    t.ok(worst !== null && worst <= SB.TUNING.ROUTE_SAFE_EVERY_ROWS, f.name + ' mode ' + mode + ': the longest climb between safe cells is ' + worst + ' rows (at most 8)');
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
  /* max-range's WALLJUMP clause (the third review: no lab could fail on it): a wall from row 20 to the floor, the exit
     on a one way 3 across and 3 up from the highest contact a floor jump arms, the WALL table's corner: no slack */
  { const lines = []; for (let r = 20; r <= 46; r++) { const row = '.'.repeat(24).split(''); row[5] = '#'; if (r === 39) row[9] = 'X'; if (r === 40) row[9] = '='; if (r === 46) row[8] = 'S'; lines.push(row.join('')); }
    const lv = LABS.room(lines.concat([FLOOR]), { exit: true }), g = SB.reach.graph(lv), a = SB.reach.mainAscent(g, lv), sc = SB.reach.routeScore(lv, g, a);
    const skip = SB.reach.mainAscent(g, lv, { skip: 'max-range' });
    t.ok(!sc.ok && /^max-range/.test(sc.reasons[0] || '') && !!skip.edges && skip.edges.some(e => e.kind === 'WALLJUMP' && e.dx === 3 && e.dy === 3),
      'the corner wall jump (3 across 3 up, no slack) is cut by max-range, which reasons[0] names (' + JSON.stringify(sc.reasons) + '; skipped, the route is ' + (skip.edges ? skip.edges.map(e => e.kind + ' ' + e.dx + ',' + e.dy).join(' ') : 'none') + ')'); }
  /* the cadence's boundary (the third review: '>=' passed): a vine 8 rows tall from the floor, its top the exit, so the
     climb between the floor and the safe cell on top is exactly ROUTE_SAFE_EVERY_ROWS rows, which the filter allows */
  { const lv = LABS.room(['', '......X', ...[...Array(8)].map(() => '......|'), FLOOR], { exit: true, biome: 3 });
    const sp = 46 * 24 + 8; lv.spawn = sp;
    const sc = reason(lv);
    t.ok(sc.ok && sc.safeGapRows === SB.TUNING.ROUTE_SAFE_EVERY_ROWS, 'a vine climb of exactly ' + SB.TUNING.ROUTE_SAFE_EVERY_ROWS + ' rows between safe cells passes the cadence (ok ' + sc.ok + ', the largest safe gap ' + sc.safeGapRows + ' rows' + (sc.reasons.length ? '; ' + sc.reasons.join('; ') : '') + ')'); }
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

/* ================================================================ the route with placements (T1.3) */
group('H-route-7', 'every built level passes with its placements: the ascent runs spawn to exit over the edge set with the trap field, keeps the cadence over the safe cells after placement and never stands on a trap; the degrade ladder never runs out on the corpus', t => {
  const bad = [], rungs = { 1: 0, 2: 0, 3: 0 }, letter = []; let levels = 0, crops = 0;
  for (const f of FIXTURES) for (const mode of MODES) for (const biome of [null, 0, 1, 2, 3, 4]) {
    const lv = biome === null ? buildFx(f, mode) : SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { biome });
    const tag = f.name + ' mode ' + mode + ' ' + (biome === null ? 'as detected' : SB.palette.BIOMES[biome]);
    if (lv.needsCrop) { if (lv.degraded) { crops++; bad.push(tag + ': the ladder ran out (' + lv.detail + ')'); } continue; }
    levels++;
    for (let k = 0; k < lv.degraded.length; k += 2) rungs[lv.degraded[k]]++;
    const a = lv.ascent;
    if (!a || !a.edges || !a.score.ok || a.nodes[0] !== lv.spawn || a.nodes[a.nodes.length - 1] !== lv.exit) { bad.push(tag + ': the ascent fails its score'); continue; }
    const g = trapGraphOf(lv), worst = cadenceOf(lv, a, g, safeOf(lv, g));
    if (worst === null) bad.push(tag + ': an ascent edge is not in the edge set with the trap field');
    else if (worst > SB.TUNING.ROUTE_SAFE_EVERY_ROWS) bad.push(tag + ': a climb of ' + worst + ' rows between safe cells');
    if (a.nodes.some(v => v < g.n && lv.trap[v])) bad.push(tag + ': the ascent stands on a trap cell');
    const wl = cadenceOf(lv, a, g, safeOf(lv, g, true));
    if (wl === null || wl > SB.TUNING.ROUTE_SAFE_EVERY_ROWS) letter.push(tag);
  }
  t.eq(bad.length, 0, 'every one of ' + levels + ' built levels passes with its placements' + (bad.length ? ': ' + bad.slice(0, 4).join('; ') : ''));
  console.log('  info  the degrade ladder over the corpus (' + levels + ' levels): ' + rungs[1] + ' enemies removed, ' + rungs[2] + ' trap fields removed, ' + rungs[3] + ' repair passes, ' + crops + ' ran out; under the letter of 3.7 (the pocket\'s elite held to the spawn distance too, Q80) ' + letter.length + ' ascents break the cadence' + (letter.length ? ' (' + letter.slice(0, 4).join('; ') + ')' : ''));
});

group('H-route-8', 'an enemy nest on the only ascent: placement moves its enemy clear of the ascent rather than failing', t => {
  /* the plank climb of the pit lab (Glare over Pewter, 4 wide, every 3 rows) and an Amber pair over the plank the
     climb stands on at row 25 */
  const g = []; for (let y = 0; y < 48; y++) g.push(Array(24).fill('4'));
  for (let x = 0; x < 24; x++) g[47][x] = '1';
  [43, 40, 37, 34, 31, 28, 25, 22, 19, 16, 13, 10, 7, 3].forEach((r, k) => { const x0 = k % 2 ? 7 : 2; for (let x = x0; x < x0 + 4; x++) { g[r][x] = '6'; g[r + 1][x] = '3'; } });
  g[24][3] = '8'; g[24][4] = '8';
  const lv = SB.pipeline.build(labRecord(g.map(r => r.join(''))), { biome: 0 }), R = SB.TUNING.ROUTE_SAFE_ENEMY_DIST, nest = [24 * 24 + 3, 24 * 24 + 4];
  const stands = lv.needsCrop ? [] : lv.ascent.nodes.filter(v => v < 24 * 48), dist = c => Math.min(...stands.map(s => cheb(c, s, 24)));
  const en = lv.needsCrop ? [] : lv.features.enemies;
  t.ok(!lv.needsCrop && nest.every(c => dist(c) <= R) && en.length === 1 && !nest.includes(en[0].idx) && dist(en[0].idx) > R && lv.degraded.length === 0 && lv.ascent.score.ok, 'an Amber pair 1 cell from the climb: its moth spawns at ' + en.map(e => at(e.idx) + ', ' + dist(e.idx) + ' cells from the ascent').join('; ') + ', and no rung of the ladder runs');
});

group('H-route-9', 'the envelope rule (section 3.7, Q57): a crawler patrolling the only ledge leaves no safe cell on it; a moth leaves none within ROUTE_SAFE_ENEMY_DIST', t => {
  const w = 24, y = 41, ledge = []; for (let x = 2; x <= 21; x++) ledge.push(y * w + x);
  const lv = LABS.room(['..====================', '', '', '', '', FLOOR], { biome: 3 }), g = SB.reach.graph(lv), c = y * w + 3;
  lv.features = { pocket: null, enemies: [{ kind: SB.features.CRAWLER, idx: c, env: SB.features.envelope(lv, SB.features.CRAWLER, c) }] };
  const safe = SB.reach.safeSet(lv, g), far = ledge.filter(q => cheb(q, c, w) > SB.TUNING.ROUTE_SAFE_ENEMY_DIST);
  t.ok(ledge.every(q => g.stand[q]) && far.length > 10 && ledge.every(q => !safe[q]), 'a crawler at the left end of a 20 cell ledge leaves none of its cells safe, the ' + far.length + ' beyond its spawn distance included (safe: ' + (ledge.filter(q => safe[q]).map(at).join(' ') || 'none') + ')');
  const lvM = LABS.room(['..====================', '', '', '', '', FLOOR]), m = 39 * w + 10;
  lvM.features = { pocket: null, enemies: [{ kind: SB.features.MOTH, idx: m, env: Int32Array.of(m) }] };
  const sM = SB.reach.safeSet(lvM, SB.reach.graph(lvM)), near = ledge.filter(q => cheb(q, m, w) <= SB.TUNING.ROUTE_SAFE_ENEMY_DIST);
  t.ok(near.length === 7 && near.every(q => !sM[q]) && ledge.filter(q => !near.includes(q)).every(q => sM[q]), 'a moth 2 rows over the ledge at x 10: the 7 ledge cells within ROUTE_SAFE_ENEMY_DIST are not safe and the rest are (unsafe: ' + ledge.filter(q => !sM[q]).map(at).join(' ') + ')');
});

group('H-route-10', 'the degrade ladder (Q36): each rung logged in level.degraded and followed by the same check; the final score ok, or an honest needsCrop(route)', t => {
  /* 3 wide one ways every 4 rows (x 5..7 and 9..11): a climb whose safe cells are 4 rows apart, so a moth between two
     planks leaves a 12 row climb */
  const lab = () => {
    const L = []; for (let y = 0; y < 47; y++) L.push('.'.repeat(24)); L.push(FLOOR);
    const set = (x, y, ch) => { L[y] = L[y].slice(0, x) + ch + L[y].slice(x + 1); };
    let y = 42, k = 0, lastX = 0; while (y >= 4) { const x0 = k % 2 ? 9 : 5; for (let x = x0; x < x0 + 3; x++) set(x, y + 1, '='); lastX = x0; y -= 4; k++; }
    set(6, 46, 'S'); set(lastX + 1, y + 4, 'X');
    const lv = Object.assign(LABS.room(L, { exit: true }), { landmarks: [], degraded: [], repair: { tabs: 0, passes: 0, changedFrac: 0 },
      features: { ladder: null, pocket: null, door: null, specks: [], chest: null, scroll: null, blueprint: null, enemies: [], trap: null, boss: null } });
    const g = SB.reach.graph(lv), a = SB.reach.mainAscent(g, lv); lv.ascent = { nodes: a.nodes, edges: a.edges, score: SB.reach.routeScore(lv, g, a) };
    return { lv, g };
  };
  const moth = c => ({ kind: SB.features.MOTH, idx: c, env: Int32Array.of(c) }), D = SB.pipeline.DEGRADE;
  const final = lv => { const g = trapGraphOf(lv), worst = cadenceOf(lv, lv.ascent, g, safeOf(lv, g)); return lv.ascent.score.ok && worst !== null && worst <= SB.TUNING.ROUTE_SAFE_EVERY_ROWS; };
  { const { lv, g } = lab(); lv.features.enemies = [moth(40 * 24 + 8)];
    const res = SB.pipeline.settle(lv, g);
    t.ok(lv.ascent.score.ok && res === null && lv.degraded.join() === [D.ENEMY, 40 * 24 + 8].join() && lv.features.enemies.length === 0 && final(lv), 'a moth between two planks: the first rung removes it (' + lv.degraded.join(' ') + ') and the ascent holds'); }
  { const { lv, g } = lab(), cells = [];
    for (let y = 40; y <= 41; y++) for (let x = 0; x < 24; x++) { lv.trap[y * 24 + x] = 1; cells.push(y * 24 + x); }
    Object.assign(lv.features, { trap: Int32Array.from(cells), trapRect: [0, 40, 23, 41], trapKind: 'spikes' });
    const res = SB.pipeline.settle(lv, g);
    t.ok(res === null && lv.degraded.join() === [D.TRAP, 40 * 24].join() && !lv.trap.some(v => v) && final(lv), 'a trap band across the room: no enemy to remove, the second rung removes the field (' + lv.degraded.join(' ') + ') and the ascent holds'); }
  { const { lv, g } = lab(); lv.features.enemies = [moth(28 * 24 + 8), moth(40 * 24 + 8)];
    const res = SB.pipeline.settle(lv, g);
    t.ok(!!res && res.why === 'route' && lv.degraded[0] === D.ENEMY && lv.degraded[1] === 28 * 24 + 8 && lv.degraded.includes(D.REPAIR) && /^enemies-traps/.test(lv.ascent.score.reasons[0] || ''), 'two moths: the nearest goes first (a tie to the lower cell), the other still breaks the climb, the repair pass is logged and the room is an honest needsCrop(route) (' + (res ? res.detail : 'it settled') + ')'); }
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
  /* (i) forgiving: no jump of the ascent at the clipped cone's edge, judged by the oracle's tables (section 3.3's +3;
     the third review: dropping it put four edge jumps on this ascent and every gate stayed green) */
  const atEdge = a.edges.filter(e => e.kind === 'JUMP').filter(e => { const m = ORACLE.clipped(e.profile, false); return e.dx === m[e.dy] || e.dy + 1 >= m.length || m[e.dy + 1] < e.dx; });
  t.eq(atEdge.length, 0, '(i) and none of its jumps sits at the clipped cone\'s edge (' + atEdge.map(e => e.profile + ' ' + e.dx + ' across ' + e.dy + ' up').join(', ') + ')');
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
/* ================================================================ features, part one (T1.2a) */
/* every built level of the corpus under each biome override and as detected (fixtures x modes x biomes, section 5.1) */
let featLevels = null;
function featBuilds() {
  if (featLevels) return featLevels;
  featLevels = [];
  for (const f of FIXTURES) for (const mode of MODES) for (const biome of [null, 0, 1, 2, 3, 4]) {
    const lv = biome === null ? buildFx(f, mode) : SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { biome });
    if (lv.needsCrop) continue;
    featLevels.push({ tag: f.name + ' mode ' + mode + ' ' + (biome === null ? 'as detected' : SB.palette.BIOMES[biome]), f, mode, biome, lv });
  }
  return featLevels;
}
const sameEdge = (g, e) => (g.adj[e.from] || []).some(x => x.to === e.to && x.kind === e.kind && x.dir === e.dir && x.dx === e.dx && x.dy === e.dy);
/* the fifth review's rooms (its harness lens found them by a seeded search): the first stream pick of P9_ROWS's pocket is
   refused by the check; P11_ROWS puts a bright window over a step of a big dark block, beside its pocket's tunnel */
const P9_ROWS = {"11": "444444444111111111111444", "12": "444444444111111111111444", "13": "444444444111111111111444", "14": "444444444111111111111444", "15": "444444444111111111111444", "16": "444444444111111111111444", "17": "444444441111111111111444", "18": "444444441111111111111444", "19": "444444444111111111111444", "20": "444444444111111111111555", "21": "444444444111111111111333", "22": "444444444111111111111444", "23": "444444444111111111111444", "24": "444444444111111111111444", "25": "444444444111111111111444", "26": "555444444111111111111444", "27": "333555555111111111111444", "28": "444333333111111111111444", "29": "444444455111111111111444", "30": "444444433444444444444444", "35": "445555545555554444444444", "36": "443333343333334444444444", "37": "444444444444444445555444", "38": "444444444444444443333444", "40": "444444455555544444444444", "41": "444444433333344444444444"};
const P11_ROWS = {"11": "444444411111111144444444", "12": "446666611111111144444444", "13": "446666611111111144444444", "14": "446666611111111144444444", "15": "446666611111111144444444", "16": "444444111111111144455544", "17": "444441111111111144433344", "18": "444441111111111144444444", "19": "444441111111111144444444", "20": "444441111111111144444444", "22": "444444444444444455555444", "23": "444455555555444433333444", "24": "444433333333444444444444", "27": "444444444444444445555554", "28": "444444444444444443333334", "34": "444444455555544444444444", "35": "444444433333344444444444", "36": "444444444455555554444444", "37": "444444444433333334444444", "38": "444444444445554444444444", "39": "444444444443334444444444", "42": "555444444444444444444444", "43": "333444444444444444444444"};
/* the cells from which the exit can still be reached: the test's own breadth first search over the reversed edges
   (the fifth review: the chest, deepest into a branch, sat at the bottom of a pit no move leaves; QUESTIONS Q78) */
function backOf(lv, g) {
  const N3 = 3 * g.n, rev = Array.from({ length: N3 }, () => []), back = new Uint8Array(N3);
  g.adj.forEach((es, u) => { if (es) for (const e of es) rev[e.to].push(u); });
  if (lv.exit < 0) return back;
  const q = [lv.exit]; back[lv.exit] = 1;
  for (let k = 0; k < q.length; k++) for (const u of rev[q[k]]) if (!back[u]) { back[u] = 1; q.push(u); }
  return back;
}
/* the distances from a node with one node a sink: the search never leaves it (the test's own; the exit ends the
   room on touch, so placement counts no route through it: the fifth review found saturated-blobs' chest past the exit) */
function distSink(g, from, sink) {
  const d = new Int32Array(3 * g.n).fill(-1), q = [from]; d[from] = 0;
  for (let k = 0; k < q.length; k++) { const u = q[k]; if (u === sink) continue; for (const e of g.adj[u] || []) if (d[e.to] < 0) { d[e.to] = d[u] + 1; q.push(e.to); } }
  return d;
}
/* a built level's placement reach, once per level: its graph, the distances from spawn with the exit a sink and the
   cells that return */
function reachOf(e) {
  if (!e.reach) { const g = SB.reach.graph(e.lv); e.reach = { g, d: distSink(g, e.lv.spawn, e.lv.exit), back: backOf(e.lv, g) }; }
  return e.reach;
}
/* the chest by Q34's order, for the test alone: the reached standable cell nearest the focal tap; else the ladder top
   (DESIGN 6.11: a chest at the top); else the cell deepest into a branch off the main ascent (the most edges from any
   node it passes through, the exit never passed, then the farthest from spawn, then the lowest index); else the
   farthest from spawn. Reached means with the exit a sink; every one returnable (Q78; off with back null) and never
   the spawn, the exit, the door or a pocket cell */
function chestWant(lv, r, back) {
  const { g, d } = r, w = lv.w, n = w * lv.h, f = lv.features;
  const ok = c => c >= 0 && c < n && c !== lv.spawn && c !== lv.exit && !(f.door && c === f.door.idx) && !(f.pocket && f.pocket.cells.includes(c)) && d[c] >= 0 && standableIn(lv, c) && (!back || back[c] === 1);
  let focal = lv.rec && lv.rec.focal !== null && lv.rec.focal !== undefined ? lv.rec.focal : -1, best = -1;
  if (focal >= 0 && lv.rec.mode === 2) focal += w * (lv.h >> 1);
  if (focal >= 0) { let bd = 1e9; for (let i = 0; i < n; i++) if (ok(i) && cheb(i, focal, w) < bd) { bd = cheb(i, focal, w); best = i; } if (best >= 0) return best; }
  if (f.ladder && ok(f.ladder.top)) return f.ladder.top;
  const off = new Int32Array(3 * g.n).fill(-1), q = [];
  for (const v of lv.ascent.nodes) if (off[v] < 0) { off[v] = 0; q.push(v); }
  for (let k = 0; k < q.length; k++) if (q[k] !== lv.exit) for (const e of g.adj[q[k]] || []) if (off[e.to] < 0) { off[e.to] = off[q[k]] + 1; q.push(e.to); }
  for (let i = 0; i < n; i++) if (ok(i) && off[i] > 0 && (best < 0 || off[i] > off[best] || (off[i] === off[best] && d[i] > d[best]))) best = i;
  if (best >= 0) return best;
  for (let i = 0; i < n; i++) if (ok(i) && (best < 0 || d[i] > d[best])) best = i;
  return best;
}
/* the pit (the fifth review's room): a Soot wall (x 13..15, rows 30..46) closes a pit no move leaves; the ascent
   climbs planks on the left. In the pit a 3x3 Glare block (x 18..20, rows 44..46), the room's largest bright
   rectangle, and a lone Sun cell (22, 45) */
function pitRows() {
  const g = []; for (let y = 0; y < 48; y++) g.push(Array(24).fill('4'));
  for (let x = 0; x < 24; x++) g[47][x] = '1';
  for (let y = 30; y <= 46; y++) for (let x = 13; x <= 15; x++) g[y][x] = '1';
  [43, 40, 37, 34, 31, 28, 25, 22, 19, 16, 13, 10, 7, 3].forEach((r, k) => { const x0 = k % 2 ? 7 : 2; for (let x = x0; x < x0 + 4; x++) { g[r][x] = '6'; g[r + 1][x] = '3'; } });
  for (let y = 44; y <= 46; y++) for (let x = 18; x <= 20; x++) g[y][x] = '6';
  g[45][22] = 'e';
  return g.map(r => r.join(''));
}
/* planks stacked for the ladder labs: a Glare standing row over a Pewter one way row, 4 wide (x 5..8), at the
   standing rows given */
const stackRows = tops => { const o = {}; for (const r of tops) { o[r] = '44444666644444444444444'.padEnd(24, '4'); o[r + 1] = '44444333344444444444444'.padEnd(24, '4'); } return o; };
const at = i => i !== null && i >= 0 ? '(' + i % 24 + ', ' + Math.floor(i / 24) + ')' : 'none';
let pitLv = null;
const pitLevel = () => pitLv || (pitLv = SB.pipeline.build(labRecord(pitRows()), { biome: 0 }));
/* touched (as touchable) from a reached standable cell that returns */
const touchableBack = (lv, d, back, c) => {
  if (lv.solid[c]) return false;
  for (let k = 0; k <= SB.TUNING.JUMP_UP; k++) { const cc = c + k * lv.w; if (cc >= lv.w * lv.h || lv.solid[cc]) return false; if (d[cc] >= 0 && standableIn(lv, cc) && back[cc] === 1) return true; }
  return false;
};

group('H-feat-1', 'the caps of DESIGN 6.11 never exceeded: one ladder of stacked one ways, one pocket, one door, CAP_STICKY vines, CAP_ENEMY enemies (CAP_ELITE elites), one chest', t => {
  const T = SB.TUNING, bad = []; let ladders = 0, pockets = 0, doors = 0, levels = 0;
  for (const { tag, lv } of featBuilds()) {
    const f = lv.features, w = lv.w; levels++;
    if (f.ladder) ladders++; if (f.pocket) pockets++; if (f.door) doors++;
    for (const k of ['ladder', 'pocket', 'door']) if (Array.isArray(f[k])) bad.push(tag + ': ' + k + ' is a list');
    if (f.enemies.length > T.CAP_ENEMY) bad.push(tag + ': ' + f.enemies.length + ' enemies (cap ' + T.CAP_ENEMY + ')');
    if (f.enemies.filter(e => e.elite).length > T.CAP_ELITE) bad.push(tag + ': more than CAP_ELITE elites');
    let runs = 0; for (let i = 0; i < lv.sticky.length; i++) if (lv.sticky[i] && (i < w || !lv.sticky[i - w])) runs++;
    if (runs > T.CAP_STICKY) bad.push(tag + ': ' + runs + ' sticky runs');
    if (!(f.chest >= 0)) bad.push(tag + ': no chest');
    else if (!standableIn(lv, f.chest) || f.chest === lv.spawn || f.chest === lv.exit || (f.door && f.chest === f.door.idx) || (f.pocket && f.pocket.cells.includes(f.chest))) bad.push(tag + ': the chest stands where it may not');
    if (f.ladder) {
      const rs = f.ladder.runs;
      if (rs.length < T.LADDER_MIN_RUNS) bad.push(tag + ': a ladder of ' + rs.length + ' runs');
      for (let k = 1; k < rs.length; k++) { const dy = rs[k - 1][2] - rs[k][2]; if (dy < 1 || dy > T.LADDER_STACK_ROWS || rs[k][1] < rs[k - 1][0] || rs[k][0] > rs[k - 1][1]) bad.push(tag + ': ladder rung ' + k + ' is not stacked on the one below'); }
      for (const [x0, x1, y] of rs) for (let x = x0; x <= x1; x++) if (!lv.plat[y * w + x] || lv.tab[y * w + x]) { bad.push(tag + ': a ladder rung on a cell that is no photo one way'); break; }
      const tr = rs[rs.length - 1]; if (f.ladder.top !== (tr[2] - 1) * w + ((tr[0] + tr[1]) >> 1)) bad.push(tag + ': the ladder top is not the top run\'s middle standing cell');
    }
  }
  t.eq(bad.length, 0, 'every one of ' + levels + ' built levels keeps the caps' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  t.ok(ladders > 0 && pockets > 0 && doors > 0, 'the features bite over the corpus: ' + ladders + ' ladders, ' + pockets + ' pockets, ' + doors + ' doors');
  /* the focal tap (DESIGN 5.1, Q34): the sample room tapped on the bookshelf (1, 30); the chest is the reached
     standable cell nearest the tap, found here by brute force */
  const rec = Object.assign({}, fixture('sample-room').fx.record, { focal: 30 * 24 + 1 }), lvF = SB.pipeline.build(SB.record.fromJSON(rec), {});
  const dF = SB.reach.distances(SB.reach.graph(lvF), lvF.spawn); let want = -1, wd = 1e9;
  for (let i = 0; i < 24 * 48; i++) if (dF[i] >= 0 && standableIn(lvF, i) && i !== lvF.spawn && i !== lvF.exit && !(lvF.features.door && i === lvF.features.door.idx) && !(lvF.features.pocket && lvF.features.pocket.cells.includes(i))) { const dd = cheb(i, 30 * 24 + 1, 24); if (dd < wd) { wd = dd; want = i; } }
  t.ok(lvF.features.chest === want, 'tapped on the bookshelf, the chest is the nearest reached standable cell to the tap (' + (lvF.features.chest % 24) + ', ' + Math.floor(lvF.features.chest / 24) + '; the test finds ' + (want % 24) + ', ' + Math.floor(want / 24) + ')');
  for (const [name, key] of [['ladder-stack', 'ladder'], ['bright-door', 'door'], ['one-giant-landmark', 'pocket']]) {
    const lv = buildFx(fixture(name), 0);
    t.ok(!lv.needsCrop && !!lv.features[key], name + ' (authored for it, T0.5c) has its ' + key, lv.needsCrop ? undefined : SB.pipeline.toText(lv));
  }
  /* the chest by Q34's order on every built level, against the test's own reading: reached with the exit a sink (the
     fifth review: saturated-blobs' chest lay past the exit) and returnable (only the focal tap was asserted; Q78) */
  const chestBad = [];
  for (const e of featBuilds()) { const r = reachOf(e), want = chestWant(e.lv, r, r.back); if (e.lv.features.chest !== want) chestBad.push(e.tag + ': chest ' + at(e.lv.features.chest) + ', the test wants ' + at(want)); }
  t.eq(chestBad.length, 0, 'on every built level the chest keeps Q34\'s order (the tap, the ladder top, deepest into a branch, farthest) among the cells that return' + (chestBad.length ? ': ' + chestBad.slice(0, 4).join('; ') : ''));
  /* the pit: deepest into a branch is the pit's floor, from which the exit is out of reach; the chest takes the
     deepest cell that returns */
  const pit = pitLevel(), pr = pit.needsCrop ? null : reachOf({ lv: pit }), pitDeep = pr ? chestWant(pit, pr, null) : -1, pitChest = pr ? pit.features.chest : -1;
  t.ok(!!pr && pr.back[pitDeep] === 0 && pitChest === chestWant(pit, pr, pr.back) && pr.back[pitChest] === 1, 'the pit: deepest into a branch is ' + at(pitDeep) + ', from which the exit is out of reach; the chest is ' + at(pitChest) + ', from which it is not');
  /* DESIGN 6.11's ladder zone, "3+ one-way platforms stacked within 3 rows": three stacked is a ladder, two is none;
     with no tap the chest is on the ladder's top */
  const l3 = SB.pipeline.build(labRecord(stackRows([43, 40, 37])), { biome: 0 }), l2 = SB.pipeline.build(labRecord(stackRows([43, 40])), { biome: 0 });
  const lad = l3.needsCrop ? null : l3.features.ladder;
  t.ok(!!lad && lad.runs.length === 3 && l3.features.chest === lad.top, 'three one ways stacked 3 rows apart are a ladder of 3 runs with the chest on its top (' + (lad ? lad.runs.length + ' runs, top ' + at(lad.top) + ', chest ' + at(l3.features.chest) : 'no ladder') + ')');
  t.ok(!l2.needsCrop && !l2.features.ladder, 'two stacked are no ladder');
  /* the exit is a sink (the fifth review): saturated-blobs tapped on its left shelf (4, 19), a cell the model reaches
     only through the exit; the chest is the nearest cell reached without passing it */
  const sbLv = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, fixture('saturated-blobs').fx.record, { focal: 19 * 24 + 4 })), {}), sbR = sbLv.needsCrop ? null : reachOf({ lv: sbLv });
  const plainD = sbR ? SB.reach.distances(sbR.g, sbLv.spawn) : null, shelf = 19 * 24 + 4;
  t.ok(!!sbR && plainD[shelf] >= 0 && sbR.d[shelf] < 0 && sbR.d[sbLv.features.chest] >= 0 && sbLv.features.chest === chestWant(sbLv, sbR, sbR.back), 'saturated-blobs tapped on (4, 19), which only a route through the exit reaches: the chest is ' + (sbR ? at(sbLv.features.chest) : 'needsCrop') + ', reached without passing the exit');
});

/* the largest rectangle of open cells brighter than DOOR_L with both sides at least DOOR_MIN, by brute force over
   every rectangle (prefix sums), for the test alone */
function largestBright(lv) {
  const T = SB.TUNING, w = lv.w, h = lv.h, P = new Int32Array((w + 1) * (h + 1));
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const b = !lv.solid[y * w + x] && lv.L[y * w + x] > T.DOOR_L ? 1 : 0; P[(y + 1) * (w + 1) + x + 1] = b + P[y * (w + 1) + x + 1] + P[(y + 1) * (w + 1) + x] - P[y * (w + 1) + x]; }
  const sum = (x0, y0, x1, y1) => P[(y1 + 1) * (w + 1) + x1 + 1] - P[y0 * (w + 1) + x1 + 1] - P[(y1 + 1) * (w + 1) + x0] + P[y0 * (w + 1) + x0];
  let best = 0;
  for (let y0 = 0; y0 < h; y0++) for (let x0 = 0; x0 < w; x0++) for (let y1 = y0 + T.DOOR_MIN - 1; y1 < h; y1++) {
    if (sum(x0, y0, x0, y1) !== y1 - y0 + 1) break;
    for (let x1 = x0 + T.DOOR_MIN - 1; x1 < w; x1++) { const a = (x1 - x0 + 1) * (y1 - y0 + 1); if (sum(x0, y0, x1, y1) !== a) break; if (a > best) best = a; }
  }
  return best;
}
group('H-feat-4', 'the Darkroom door (Q33): the largest bright rectangle, its door on the bottom row, standable, reached and never a cell the main ascent stands on', t => {
  const T = SB.TUNING, bad = []; let doors = 0;
  for (const { tag, lv, biome } of featBuilds()) {
    const dr = lv.features.door; if (!dr) continue; doors++;
    const w = lv.w, n = w * lv.h, [x0, y0, x1, y1] = dr.rect, stands = lv.ascent.nodes.filter(v => v < n);
    if (stands.includes(dr.idx)) bad.push(tag + ': the door is a cell the ascent stands on');
    if (!standableIn(lv, dr.idx)) bad.push(tag + ': the door is not standable');
    if (Math.floor(dr.idx / w) !== y1 || dr.idx % w < x0 || dr.idx % w > x1) bad.push(tag + ': the door is off its rectangle\'s bottom row');
    let dark = false; for (let y = y0; y <= y1 && !dark; y++) for (let x = x0; x <= x1; x++) if (lv.solid[y * w + x] || lv.L[y * w + x] <= T.DOOR_L) { dark = true; break; }
    if (dark || x1 - x0 + 1 < T.DOOR_MIN || y1 - y0 + 1 < T.DOOR_MIN) bad.push(tag + ': the rectangle is not all bright open cells, ' + T.DOOR_MIN + ' or more a side');
    if (biome === null) { const a = largestBright(lv); if ((x1 - x0 + 1) * (y1 - y0 + 1) !== a) bad.push(tag + ': the rectangle holds ' + (x1 - x0 + 1) * (y1 - y0 + 1) + ' cells, the largest ' + a); }
    if (SB.reach.distances(SB.reach.graph(lv), lv.spawn)[dr.idx] < 0) bad.push(tag + ': the door is not reached');
  }
  t.eq(bad.length, 0, 'every door of ' + doors + ' keeps the rule' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  /* the ascent rule alone: bright-door's door, with its own cell made an ascent cell, moves along the bottom row */
  const bd = buildFx(fixture('bright-door'), 0), d = SB.reach.distances(SB.reach.graph(bd), bd.spawn);
  const first = SB.features.door(bd, d, []), moved = first && SB.features.door(bd, d, [first.idx]);
  t.ok(!!first && !!moved && moved.idx !== first.idx && moved.rect.join() === first.rect.join(), 'made an ascent cell, the door leaves it for the next cell of the bottom row (' + (first && first.idx % 24) + ' then ' + (moved && moved.idx % 24) + ')');
  /* every door is reached with the exit a sink and returns (Q78), on the test's own searches */
  const doorBack = [];
  for (const e of featBuilds()) { const dr = e.lv.features.door, r = reachOf(e); if (dr && (r.d[dr.idx] < 0 || r.back[dr.idx] !== 1)) doorBack.push(e.tag + ' ' + at(dr.idx)); }
  t.eq(doorBack.length, 0, 'every door is reached without passing the exit, and the exit can be reached from it' + (doorBack.length ? ': ' + doorBack.slice(0, 4).join('; ') : ''));
  /* the fifth review's room: a bright window whose sill rests on a step of a big dark block, beside the block's
     pocket; the pocket's tunnel once ran under the sill and took the door's floor */
  const p11 = SB.pipeline.build(labRecord(P11_ROWS), {}), p11d = p11.needsCrop ? null : p11.features.door, p11r = p11d ? reachOf({ lv: p11 }) : null;
  t.ok(!!p11d && standableIn(p11, p11d.idx) && p11r.d[p11d.idx] >= 0 && p11r.back[p11d.idx] === 1, 'beside a pocket the door stands, is reached and returns (' + (p11d ? at(p11d.idx) : 'no door') + ')');
  /* the pit: its largest bright rectangle lies on the pit's floor, from which nothing returns: no door */
  const pit = pitLevel(), pitRect = pit.needsCrop ? null : SB.features.brightRect(pit);
  t.ok(!!pitRect && pitRect.join() === '18,44,20,46' && pit.features.door === null, 'a bright rectangle on the floor of a pit gets no door (' + (pitRect ? pitRect.join() : 'none') + ', door ' + (pit.features && pit.features.door ? at(pit.features.door.idx) : 'none') + ')');
});

group('H-feat-5', 'the pocket: a 3x3 hollow closed in its landmark, its entrance facing the ascent, its loot reached, never in the first room, and the main ascent never carved', t => {
  const T = SB.TUNING, bad = []; let pockets = 0;
  for (const { tag, lv } of featBuilds()) {
    const p = lv.features.pocket; if (!p) continue; pockets++;
    const w = lv.w, n = w * lv.h, [x0, y0] = p.rect, stands = lv.ascent.nodes.filter(v => v < n);
    for (let y = y0; y <= y0 + 2; y++) for (let x = x0; x <= x0 + 2; x++) if (lv.solid[y * w + x]) bad.push(tag + ': a hollow cell is solid');
    for (let x = x0; x <= x0 + 2; x++) if (!lv.solid[(y0 + 3) * w + x]) bad.push(tag + ': the hollow has no floor');
    for (let x = x0; x <= x0 + 2; x++) if (!lv.solid[(y0 - 1) * w + x]) bad.push(tag + ': the hollow has no roof');
    const cc = (y0 + 1) * w + x0 + 1; let near = -1, nd = 1e9;
    for (const v of stands) { const dd = cheb(cc, v, w); if (dd < nd || (dd === nd && v < near)) { nd = dd; near = v; } }
    const side = near % w <= x0 + 1 ? -1 : 1;
    if (side !== p.side || p.tunnel.some((c, k) => c !== (y0 + 2) * w + (side < 0 ? x0 - 1 - k : x0 + 3 + k))) bad.push(tag + ': the entrance does not face the ascent cell nearest the hollow');
    if (p.tunnel.length < 1 || p.tunnel.length > T.POCKET_TUNNEL_MAX) bad.push(tag + ': a tunnel of ' + p.tunnel.length);
    const g = SB.reach.graph(lv), d = SB.reach.distances(g, lv.spawn);
    if (d[p.loot] < 0) bad.push(tag + ': the loot is not reached');
    const lost = lv.ascent.edges.filter(e => !sameEdge(g, e));
    if (lost.length) bad.push(tag + ': the ascent lost ' + lost.length + ' edges to the carve (' + lost[0].kind + ')');
    const lm = lv.landmarks.find(l => Array.from(l.cells).includes((y0 - 1) * w + x0));
    if (!lm || SB.pipeline.components(Uint8Array.from({ length: n }, (_, i) => Array.prototype.includes.call(lm.cells, i) ? 1 : 0), w, lv.h).length !== 1) bad.push(tag + ': the landmark around it is not one piece');
  }
  t.eq(bad.length, 0, 'every pocket of ' + pockets + ' keeps the rule' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  let first = 0; for (const f of FIXTURES) { const lv = SB.pipeline.build(SB.record.fromJSON(f.fx.record), { firstRoom: true }); if (!lv.needsCrop && lv.features.pocket) first++; }
  t.eq(first, 0, 'no pocket in a first room (' + first + ')');
  /* the never carve rule alone: a hollow in the wardrobe's top three rows (x 20..22, rows 15..17) would take the
     support from (20, 14), where the sample room's ascent lands its JUMP from (16, 17); the check refuses it for the
     ascent's sake (the order inside: the landmark in one piece, then the ascent, then the loot) */
  const sr = buildFx(fixture('sample-room'), 0), w = sr.w, k = sr.landmarks.findIndex(l => Array.from(l.cells).includes(16 * w + 21));
  const lands = sr.ascent.edges.some(e => e.to === 14 * w + 20 && e.kind === 'JUMP');
  const hollow = []; for (let y = 15; y <= 17; y++) for (let x = 20; x <= 22; x++) hollow.push(y * w + x);
  const res = k >= 0 ? SB.features.pocketOk(sr, { k, rect: [20, 15, 22, 17], side: -1, hollow, tunnel: [], mouth: -1, loot: 17 * w + 22, elite: 17 * w + 21 }) : { ok: true, why: 'no wardrobe' };
  t.ok(lands && !res.ok && /^the ascent loses/.test(res.why), 'a hollow under the ascent\'s landing on the wardrobe (20, 14) is refused for the ascent (' + (lands ? '' : 'the ascent does not land there; ') + (res.why || 'accepted') + ')');
  /* every tunnel cell under a roof of its landmark, so the carve takes no open cell's floor (the fifth review: a
     second tunnel cell under a window's sill took the door's), and every pocket's loot is reached with the exit a sink and returns (Q78) */
  const roofBad = [];
  for (const e of featBuilds()) { const p = e.lv.features.pocket; if (!p) continue; if (p.tunnel.some(c => !e.lv.solid[c - e.lv.w])) roofBad.push(e.tag + ': a tunnel cell under open air'); if (reachOf(e).d[p.loot] < 0 || reachOf(e).back[p.loot] !== 1) roofBad.push(e.tag + ': the loot is not reached past a sink exit, or no way back from it'); }
  const p11 = SB.pipeline.build(labRecord(P11_ROWS), {}), p11p = p11.needsCrop ? null : p11.features.pocket;
  if (p11p && p11p.tunnel.some(c => !p11.solid[c - p11.w])) roofBad.push('the door room: a tunnel cell under open air');
  t.eq(roofBad.length, 0, 'every tunnel cell has a roof of its landmark and every loot is reached and returns, the door room\'s among them' + (roofBad.length ? ': ' + roofBad.slice(0, 4).join('; ') : ''));
  /* the fifth review's room whose first stream pick the check refuses (its tunnel cuts a WALLTOUCH edge of the
     ascent): the pocket placed is another and the ascent keeps every edge */
  const p9 = SB.pipeline.build(labRecord(P9_ROWS), {}), p9f = SB.pipeline.build(labRecord(P9_ROWS), { firstRoom: true });
  const cands = p9f.needsCrop ? [] : SB.features.pocketCands(p9f, p9f.ascent.nodes.filter(v => v < p9f.w * p9f.h));
  const firstPick = cands.length ? cands[SB.rng.mulberry32(p9.seed >>> 0).int(cands.length)] : null, refused = firstPick ? SB.features.pocketOk(p9f, firstPick) : null;
  const placed = p9.needsCrop ? null : p9.features.pocket, lost9 = p9.needsCrop ? [] : p9.ascent.edges.filter(e => !sameEdge(SB.reach.graph(p9), e));
  t.ok(!!refused && !refused.ok && !!placed && placed.rect.join() !== firstPick.rect.join() && lost9.length === 0, 'the first pick refused (' + (refused ? refused.why || 'accepted' : 'no pick') + '), the pocket placed is another (' + (placed ? placed.rect.join() : 'none') + ') and the ascent keeps its ' + (p9.needsCrop ? 0 : p9.ascent.edges.length) + ' edges (' + lost9.length + ' lost)');
});

group('H-feat-7', 'exactly one beacon, at the exit cell, on every built level', t => {
  const bad = []; let levels = 0;
  for (const { tag, lv } of featBuilds()) { levels++; if (!(lv.exit >= 0 && lv.beacon && lv.beacon.idx === lv.exit)) bad.push(tag); }
  t.eq(bad.length, 0, 'every one of ' + levels + ' levels has its one beacon at the exit' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
});

/* Q50's claims, each on a room whose answer is the rule's (the fourth review: nothing of their own tested them) */
group('H-en-1b', 'the claims of Q50: no moth from the lamp, lit or not, nor from a solid landmark; none from an elite sized cluster; the seed picks among more than the cap', t => {
  /* the labs pin Attic (the moth's rules) and lay a plank at rows 39 and 40, since a bare room gets the default spread, whose
     fodder is no lab's (T1.2b) */
  const plank = rows => Object.assign({ 39: '444444444444444455554444', 40: '444444444444444433334444' }, rows);
  const moths = rows => { const lv = SB.pipeline.build(labRecord(plank(rows)), { biome: 0 }); return lv.needsCrop ? null : lv.features.enemies.map(e => e.idx); };
  /* the sample room's lamp moved to the top left corner, where it loses the exit (the fourth review's probe): its Sun
     shade at (1..4, 3) spawned a moth */
  const s = Array.from(SB.SAMPLE_ROOM);
  s[0] = '424444444444444444444444'; s[1] = '466444444444444444444444'; s[2] = '466444444444444444444444'; s[3] = '4eeee4444444444444444444';
  const lostLv = SB.pipeline.build(labRecord(s), {});
  const onLamp = lostLv.needsCrop ? [] : lostLv.features.enemies.filter(e => e.idx >= 3 * 24 + 1 && e.idx <= 3 * 24 + 4);
  t.ok(!lostLv.needsCrop && lostLv.beacon.cells.length === 0 && onLamp.length === 0, 'a lamp that lost the exit (exit ' + (lostLv.exit % 24) + ',' + Math.floor(lostLv.exit / 24) + ', ' + lostLv.beacon.cells.length + ' beacon cells) is no nest: ' + onLamp.length + ' moths on its shade');
  /* a lit Sun lamp, the exit, in a bare room: nothing else is saturated */
  const lit = {}; lit[1] = '4444444444666644444444444'.slice(0, 24); lit[2] = '44444444444eeee444444444';
  const litM = moths(lit);
  t.ok(litM !== null && litM.length === 0, 'a lit Sun lamp spawns no moth (' + (litM ? litM.length : 'needsCrop') + ')');
  /* a Soot landmark holding Walnut cells (a pair and a single): solid, claimed */
  const shelf = {}; shelf[30] = '4444411114444444444444444'.slice(0, 24); shelf[31] = '44444177144444444444444444'.slice(0, 24); shelf[32] = '44444111144444444444444444'.slice(0, 24);
  shelf[33] = '4444417114444444444444444'.slice(0, 24);
  const shelfM = moths(shelf);
  t.ok(shelfM !== null && shelfM.length === 0, 'a landmark holding Walnut cells (2 and 1) is no nest (' + (shelfM ? shelfM.length : 'needsCrop') + ')');
  /* an Amber cluster of 6 open cells: elite sized, never fodder */
  const six = {}; six[30] = '44444444888444444444444'.padEnd(24, '4'); six[31] = '44444444888444444444444'.padEnd(24, '4');
  const sixLv = SB.pipeline.build(labRecord(plank(six)), { biome: 0 }), sixFirst = SB.pipeline.build(labRecord(plank(six)), { biome: 0, firstRoom: true });
  const sixE = sixLv.needsCrop ? [] : sixLv.features.enemies;
  t.ok(sixE.length === 1 && sixE[0].elite === true && !sixFirst.needsCrop && sixFirst.features.enemies.length === 0, 'a 6 cell cluster spawns one elite and never a fodder, and none in a first room (' + sixE.map(e => (e.elite ? 'elite ' : 'fodder ') + e.idx).join(', ') + ')');
  /* six fodder clusters, more than CAP_ENEMY */
  const many = {}; for (const [y, x] of [[8, 2], [8, 12], [16, 6], [16, 18], [24, 2], [24, 14]]) many[y] = (many[y] || '4'.repeat(24)).slice(0, x) + '99' + (many[y] || '4'.repeat(24)).slice(x + 2);
  /* the same level under three other seeds (the geometry untouched): some pick differs */
  const a = SB.pipeline.build(labRecord(plank(many)), { biome: 0 }), pa = a.needsCrop ? '' : a.features.enemies.map(e => e.idx).join();
  const others = a.needsCrop ? [] : [1, 2, 3].map(x => SB.features.moths(Object.assign({}, a, { seed: (a.seed ^ x) >>> 0 }), {}).map(e => e.idx).join());
  /* which clusters get an enemy (the shuffle over the cap): each enemy belongs to its nearest cluster */
  const clusterOf = idx => { let best = -1, bd = 1e9; [[8, 2], [8, 12], [16, 6], [16, 18], [24, 2], [24, 14]].forEach(([y, x], k) => { const dd = Math.max(Math.abs(idx % 24 - x), Math.abs(Math.floor(idx / 24) - y)); if (dd < bd) { bd = dd; best = k; } }); return best; };
  const setOf = list => list.split(',').filter(Boolean).map(Number).map(clusterOf).sort().join('');
  t.ok(!a.needsCrop && a.features.enemies.length === SB.TUNING.CAP_ENEMY && others.some(o => setOf(o) !== setOf(pa)), 'six clusters over CAP_ENEMY, four seeds: which clusters get an enemy differs (' + [pa].concat(others).map(setOf).join(' / ') + ')');
  /* the door's claim (the fifth review: nothing tested it): a Sun pair, a yellow frame, inside bright-door's window */
  const bdRec = fixture('bright-door').fx.record, bd0 = SB.pipeline.build(SB.record.fromJSON(bdRec), { biome: 0 }), bdr = bd0.needsCrop ? null : bd0.features.door;
  let inDoor = null, sunIn = false;
  if (bdr) {
    const rows = bdRec.rows.slice(), yy = bdr.rect[3] - 2, xx = bdr.rect[0] + 1;
    rows[yy] = rows[yy].slice(0, xx) + 'ee' + rows[yy].slice(xx + 2);
    const lv = SB.pipeline.build(SB.record.fromJSON(Object.assign({}, bdRec, { rows })), { biome: 0 }), dr = lv.needsCrop ? null : lv.features.door;
    if (dr) {
      const inR = c => c % 24 >= dr.rect[0] && c % 24 <= dr.rect[2] && Math.floor(c / 24) >= dr.rect[1] && Math.floor(c / 24) <= dr.rect[3];
      sunIn = inR(yy * 24 + xx) && inR(yy * 24 + xx + 1); inDoor = lv.features.enemies.filter(e => inR(e.idx));
    }
  }
  t.ok(sunIn && !!inDoor && inDoor.length === 0, 'a Sun pair inside the Darkroom door\'s window is claimed: no moth in the doorway (' + (inDoor ? inDoor.length : 'no door') + ')');
  /* the pocket's claim: Walnut seams in a Soot block (rows 39, 42, 45); the pocket carved from it opens three Walnut
     cells, a fodder sized group, which is no nest; the only enemy is the pocket's own elite */
  const pc = {};
  for (let y = 38; y <= 46; y++) pc[y] = '44' + ([39, 42, 45].includes(y) ? '77777777' : '11111111') + '4'.repeat(14);
  pc[39] = pc[39].slice(0, 16) + '5555' + pc[39].slice(20); pc[40] = pc[40].slice(0, 16) + '3333' + pc[40].slice(20);   /* the labs' plank, merged */
  const pcLv = SB.pipeline.build(labRecord(pc), { biome: 0 }), pp = pcLv.needsCrop ? null : pcLv.features.pocket;
  const opened = pp ? pp.cells.filter(c => SB.palette.SAT.includes(pcLv.pal[c])).length : 0, pcE = pp ? pcLv.features.enemies : [];
  t.ok(!!pp && opened >= SB.TUNING.FODDER_CELLS[0] && pcE.every(e => e.elite && e.idx === pp.elite), 'a pocket carved through Walnut seams opens ' + opened + ' saturated cells and no nest: the enemies are its own elite (' + pcE.map(e => (e.elite ? 'elite ' : 'fodder ') + at(e.idx)).join(', ') + ')');
});

/* ================================================================ features, part two (T1.2b) */
const KIND_NAME = ['', 'moth', 'icicle', 'jelly', 'crawler', 'spark'];
/* a hero touches a cell it stands in, or one at most JUMP_UP open cells above a reached cell it stands in (for the
   test alone, from DESIGN 6.8's jump) */
function touchable(lv, d, c) {
  if (lv.solid[c]) return false;
  for (let k = 0; k <= SB.TUNING.JUMP_UP; k++) { const cc = c + k * lv.w; if (cc >= lv.w * lv.h || lv.solid[cc]) return false; if (d[cc] >= 0 && standableIn(lv, cc)) return true; }
  return false;
}

group('H-feat-2', 'loot: at least one chest and one scroll on every built level; every speck touchable, at most CAP_SPECK (Ember two more), never on the spawn, the exit, the chest, the door or the pocket', t => {
  const T = SB.TUNING, bad = []; let scrolls = 0, natural = 0, blueprints = 0;
  for (const { tag, lv } of featBuilds()) {
    const f = lv.features, d = SB.reach.distances(SB.reach.graph(lv), lv.spawn);
    if (!(f.chest >= 0)) bad.push(tag + ': no chest');
    if (!(f.scroll >= 0)) { bad.push(tag + ': no scroll'); continue; }
    scrolls++;
    const all = f.specks.concat([f.scroll]).concat(f.blueprint !== null ? [f.blueprint] : []);
    natural += all.filter(c => lv.pal[c] === SB.palette.I.SUN).length;
    if (f.blueprint !== null) { blueprints++; if (lv.pal[f.blueprint] !== SB.palette.I.SUN) bad.push(tag + ': a blueprint not on a Sun speck'); }
    if (all.length > T.CAP_SPECK + (lv.biome === 4 ? T.EMBER_EXTRA_SPECKS : 0)) bad.push(tag + ': ' + all.length + ' specks');
    for (const c of all) {
      if (!touchable(lv, d, c)) bad.push(tag + ': a speck at (' + c % lv.w + ', ' + Math.floor(c / lv.w) + ') no hero touches');
      if (c === lv.spawn || c === lv.exit || c === f.chest || (f.door && c === f.door.idx) || (f.pocket && f.pocket.cells.includes(c))) bad.push(tag + ': a speck on a taken cell');
    }
  }
  t.eq(bad.length, 0, 'loot keeps the rules on every level (' + scrolls + ' scrolls, ' + natural + ' natural Sun specks, ' + blueprints + ' blueprints)' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  /* the cap on a room of eight isolated Sun cells standing on the floor */
  const lab = {}; lab[46] = '4e44e44e44e444444e44e44e'.slice(0, 24); lab[44] = '44444444444e444444444444'.slice(0, 24);
  const lv = SB.pipeline.build(labRecord(lab), {}), f = lv.features;
  const n = lv.needsCrop ? -1 : f.specks.length + (f.scroll !== null ? 1 : 0) + (f.blueprint !== null ? 1 : 0);
  t.ok(n === T.CAP_SPECK, 'eight isolated Sun specks within reach give CAP_SPECK (' + T.CAP_SPECK + ') specks, the scroll and the blueprint among them (' + n + ')');
  /* every speck, the scroll and the blueprint are touched from a cell that returns (Q78); the pit's lone Sun cell,
     touched only from the pit's floor, is none of them */
  const spBad = [];
  for (const e of featBuilds()) { const { d, back } = reachOf(e), f = e.lv.features; for (const c of f.specks.concat(f.scroll !== null ? [f.scroll] : [], f.blueprint !== null ? [f.blueprint] : [])) if (!touchableBack(e.lv, d, back, c)) spBad.push(e.tag + ' ' + at(c)); }
  t.eq(spBad.length, 0, 'every speck is touched from a cell the exit can be reached from' + (spBad.length ? ': ' + spBad.slice(0, 4).join('; ') : ''));
  const pit = pitLevel(), pf = pit.needsCrop ? null : pit.features, pr2 = pf ? reachOf({ lv: pit }) : null, sun = 45 * 24 + 22;
  const pitLoot = pf ? pf.specks.concat(pf.scroll !== null ? [pf.scroll] : [], pf.blueprint !== null ? [pf.blueprint] : []) : [];
  t.ok(!!pf && pit.pal[sun] === SB.palette.I.SUN && !pitLoot.includes(sun) && pitLoot.length > 0 && pitLoot.every(c => touchableBack(pit, pr2.d, pr2.back, c)), 'the pit: its lone Sun cell, touched only from the pit\'s floor, is no speck, and the scroll is touched from a cell that returns (' + pitLoot.map(at).join(' ') + ')');
});

group('H-feat-3', 'the trap field: a 2 cell repeat at least TRAP_MIN a side, its open cells, never on a cell the ascent stands on and never cutting an ascent edge, never in a first room', t => {
  const T = SB.TUNING, bad = []; let fields = 0;
  for (const { tag, lv } of featBuilds()) {
    const f = lv.features; if (!f.trap) continue; fields++;
    const w = lv.w, n = w * lv.h, [x0, y0, x1, y1] = f.trapRect, cells = Array.from(f.trap);
    if (x1 - x0 + 1 < T.TRAP_MIN || y1 - y0 + 1 < T.TRAP_MIN) bad.push(tag + ': a field under TRAP_MIN');
    let rep = true, two = false;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const v = lv.pal[y * w + x];
      if (x + 2 <= x1 && lv.pal[y * w + x + 2] !== v) rep = false;
      if (y + 2 <= y1 && lv.pal[(y + 2) * w + x] !== v) rep = false;
      if (x + 1 <= x1 && lv.pal[y * w + x + 1] !== v) two = true;
    }
    if (!rep || !two) bad.push(tag + ': the field is not a 2 cell repeat');
    /* the field's open cells, the film tabs and the cells a hero stands in on them left out (help is never danger) */
    const open = []; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = y * w + x; if (!lv.solid[c] && !lv.tab[c] && !(c + w < n && lv.tab[c + w])) open.push(c); }
    if (open.join() !== cells.join() || cells.some(c => !lv.trap[c])) bad.push(tag + ': the trap cells are not the field\'s open cells less the tabs');
    if (cells.some(c => lv.tab[c] || (c + w < n && lv.tab[c + w]))) bad.push(tag + ': a trap cell on a film tab or a tab\'s standing cell');
    const stands = new Set(lv.ascent.nodes.filter(v => v < n));
    if (cells.some(c => stands.has(c))) bad.push(tag + ': a trap cell the ascent stands on');
    const walled = lv.solid.slice(); for (const c of cells) walled[c] = 1;
    const g = SB.reach.graph(Object.assign({}, lv, { solid: walled })), lost = lv.ascent.edges.filter(e => !sameEdge(g, e));
    if (lost.length) bad.push(tag + ': the field cuts ' + lost.length + ' ascent edges (' + lost[0].kind + ')');
    if (f.trapKind !== (lv.biome === 1 || lv.biome === 2 ? 'crushers' : 'spikes')) bad.push(tag + ': ' + f.trapKind + ' in ' + SB.palette.BIOMES[lv.biome]);
  }
  t.eq(bad.length, 0, 'every field of ' + fields + ' keeps the rule' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  const tp = buildFx(fixture('trap-pattern'), 0);
  const tr = tp.features.trapRect;
  t.ok(!tp.needsCrop && !!tp.features.trap && tr[0] >= 12 && tr[1] >= 30 && tr[2] <= 17 && tr[3] <= 35, 'trap-pattern (authored for it) holds a field inside its 6x6 checks at x 12..17, rows 30..35, off the ascent (' + (tr ? tr.join() : 'none') + ')');
  let first = 0; for (const f of FIXTURES) { const lv = SB.pipeline.build(SB.record.fromJSON(f.fx.record), { firstRoom: true }); if (!lv.needsCrop && lv.features.trap) first++; }
  t.eq(first, 0, 'no trap field in a first room (' + first + ')');
  /* the cut alone: trap-pattern's field with the ascent's own cells added refuses; walled, an ascent edge goes */
  const sr = buildFx(fixture('sample-room'), 0), e0 = sr.ascent.edges.find(e => e.kind === 'JUMP' && e.to < sr.w * sr.h);
  const block = []; for (let y = Math.floor(e0.to / sr.w) - 1; y <= Math.floor(e0.to / sr.w); y++) block.push(y * sr.w + e0.to % sr.w);
  t.ok(!SB.features.trapOk(sr, block.filter(c => !sr.solid[c])), 'a field over the cell an ascent JUMP lands in is refused (' + e0.to % sr.w + ', ' + Math.floor(e0.to / sr.w) + ')');
});

group('H-feat-6', 'enemies: their biome\'s kind, on cells that keep the rules (open, clear of spawn by ENEMY_SPAWN_CLEAR, never within ROUTE_SAFE_ENEMY_DIST of the ascent, never a trap or the pocket; crawlers and sparks standing, icicles hanging), the caps, the envelopes of section 3.7', t => {
  const T = SB.TUNING, bad = []; let count = 0, elites = 0;
  const kinds = {};
  for (const { tag, lv, biome } of featBuilds()) {
    const f = lv.features, w = lv.w, n = w * lv.h, stands = lv.ascent.nodes.filter(v => v < n);
    const want = SB.features.KIND_OF_BIOME[lv.biome], first = false;
    const cap = T.CAP_ENEMY + (lv.biome === 4 ? T.EMBER_EXTRA_ENEMY : 0);
    if (f.enemies.length > cap) bad.push(tag + ': ' + f.enemies.length + ' enemies (cap ' + cap + ')');
    if (f.enemies.filter(e => e.elite).length > T.CAP_ELITE) bad.push(tag + ': more than CAP_ELITE elites');
    for (const e of f.enemies) {
      count++; if (e.elite) elites++; kinds[KIND_NAME[e.kind]] = (kinds[KIND_NAME[e.kind]] || 0) + 1;
      const c = e.idx, at = '(' + c % w + ', ' + Math.floor(c / w) + ')', pocketElite = !!(f.pocket && e.elite && f.pocket.cells.includes(c));
      if (e.kind !== want && !(e.kind === SB.features.MOTH && lv.repair.spread)) bad.push(tag + ': a ' + KIND_NAME[e.kind] + ' in ' + SB.palette.BIOMES[lv.biome]);
      if (lv.solid[c] || lv.trap[c] || lv.plat[c]) bad.push(tag + ': an enemy on a solid, one way or trap cell ' + at);
      if (cheb(c, lv.spawn, w) <= T.ENEMY_SPAWN_CLEAR) bad.push(tag + ': an enemy within ENEMY_SPAWN_CLEAR of spawn ' + at);
      if (!pocketElite && stands.some(v => cheb(c, v, w) <= T.ROUTE_SAFE_ENEMY_DIST)) bad.push(tag + ': an enemy within ROUTE_SAFE_ENEMY_DIST of the ascent ' + at);
      if (!pocketElite && f.pocket && f.pocket.cells.includes(c)) bad.push(tag + ': an enemy in the pocket ' + at);
      if ((e.kind === SB.features.CRAWLER || e.kind === SB.features.SPARK) && !standableIn(lv, c)) bad.push(tag + ': a ' + KIND_NAME[e.kind] + ' not standing ' + at);
      if (e.kind === SB.features.ICICLE && !(lv.solid[c - w] || lv.plat[c - w])) bad.push(tag + ': an icicle hanging from nothing ' + at);
      /* the envelope, recomputed here from section 3.7's table */
      let env;
      if (pocketElite) env = Array.from(f.pocket.cells).sort((a, b) => a - b);
      else if (e.kind === SB.features.MOTH) env = [c];
      else if (e.kind === SB.features.JELLY) { env = []; for (let k = -2; k <= 2; k++) { const y = Math.floor(c / w) + k; if (y >= 0 && y < lv.h) env.push(y * w + c % w); } }
      else if (e.kind === SB.features.ICICLE) { env = [c]; for (let k = 1; k <= 6; k++) { const cc = c + k * w; if (cc >= n || lv.solid[cc]) break; env.push(cc); } }
      else {
        const y = Math.floor(c / w); let a = c % w, b = c % w;
        while (a > 0 && standableIn(lv, y * w + a - 1)) a--; while (b < w - 1 && standableIn(lv, y * w + b + 1)) b++;
        const s = new Set(); for (let x = a; x <= b; x++) { s.add(y * w + x); if (e.kind === SB.features.CRAWLER && y > 0) s.add((y - 1) * w + x); }
        if (e.kind === SB.features.SPARK) for (let yy = Math.max(0, y - 3); yy <= Math.min(lv.h - 1, y + 3); yy++) for (let xx = Math.max(0, c % w - 3); xx <= Math.min(w - 1, c % w + 3); xx++) if (standableIn(lv, yy * w + xx)) s.add(yy * w + xx);
        env = Array.from(s).sort((p, q) => p - q);
      }
      if (Array.from(e.env).join() !== env.join()) bad.push(tag + ': the ' + KIND_NAME[e.kind] + ' envelope at ' + at + ' is not section 3.7\'s');
    }
  }
  t.eq(bad.length, 0, 'every enemy of ' + count + ' (' + elites + ' elites; ' + Object.entries(kinds).map(([k, v]) => v + ' ' + k).join(', ') + ') keeps the rules' + (bad.length ? ': ' + bad.slice(0, 6).join('; ') : ''));
  /* the first room: at most FIRST_ROOM_MAX_FODDER fodder, no elite */
  let over = 0; for (const fx of FIXTURES) { const lv = SB.pipeline.build(SB.record.fromJSON(fx.fx.record), { firstRoom: true }); if (!lv.needsCrop && (lv.features.enemies.length > T.FIRST_ROOM_MAX_FODDER || lv.features.enemies.some(e => e.elite))) over++; }
  t.eq(over, 0, 'a first room holds at most FIRST_ROOM_MAX_FODDER fodder and no elite (' + over + ' over)');
});

group('H-feat-8', 'placement is a function of the record: three builds agree; one flipped nibble moves the seed on every fixture, and the placement where the stream has choices (saturated-blobs, the sample room)', t => {
  const feat = lv => JSON.stringify(lv.features, (k, v) => ArrayBuffer.isView(v) ? Array.from(v) : v);
  const bad = [];
  for (const f of FIXTURES) {
    const rec = () => SB.record.fromJSON(f.fx.record), a = SB.pipeline.build(rec(), {}), b = SB.pipeline.build(rec(), {}), c = SB.pipeline.build(rec(), {});
    if (a.needsCrop) continue;
    if (feat(a) !== feat(b) || feat(a) !== feat(c) || SB.pipeline.levelHash(a) !== SB.pipeline.levelHash(c)) bad.push(f.name + ': three builds differ');
  }
  t.eq(bad.length, 0, 'three builds of every fixture place the same' + (bad.length ? ': ' + bad.join('; ') : ''));
  /* a nibble flipped: an Ink cell made Soot or a Soot cell made Ink (both far under any threshold: a new seed, the same
     geometry), else a cell of the floor row (forced solid) */
  const darkCells = fx => { const out = []; fx.record.rows.forEach((r, y) => [...r].forEach((ch, x) => { if (ch === '0' || ch === '1') out.push([x, y]); })); return out; };
  const flip = (fx, k) => { const rows = fx.record.rows.slice(), dk = darkCells(fx), [x, y] = dk.length ? dk[Math.floor(k * dk.length / 6)] : [k, 47], r = rows[y].split(''); r[x] = r[x] === '0' ? '1' : '0'; rows[y] = r.join(''); return SB.record.fromJSON(Object.assign({}, fx.record, { rows })); };
  let seeds = 0, total = 0;
  for (const f of FIXTURES) { total++; if (SB.record.seedOf(flip(f.fx, 0)) !== SB.record.seedOf(SB.record.fromJSON(f.fx.record))) seeds++; }
  t.eq(seeds, total, 'one flipped nibble moves the seed on every fixture (' + seeds + ' of ' + total + ')');
  for (const name of ['saturated-blobs', 'sample-room']) {   /* under Attic, the default: a cluster's own cells take its moth */
    const fx = fixture(name).fx, base = SB.pipeline.build(SB.record.fromJSON(fx.record), { biome: 0 }), moved = [];
    for (let k = 0; k < 6; k++) { const lv = SB.pipeline.build(flip(fx, k), { biome: 0 }); if (!lv.needsCrop && lv.solid.join() === base.solid.join() && feat(lv) !== feat(base)) moved.push(k); }
    t.ok(moved.length > 0, name + ': with the geometry unchanged, a flipped nibble moves the placement (' + moved.length + ' of 6 flips)');
  }
});

group('H-feat-9', 'the default spread (DESIGN 6.11): a blank wall gets its two tab stairs, a speck and a fodder', t => {
  const lv = buildFx(fixture('blank-wall'), 0), f = lv.features, sp = lv.repair && lv.repair.spread;
  t.ok(!lv.needsCrop && !!sp && lv.repair.tabs > 0, 'blank-wall builds with the default spread (' + (lv.needsCrop ? 'needsCrop' : lv.repair.tabs + ' tabs') + ')');
  const specksHere = sp ? f.specks.concat([f.scroll, f.blueprint]).filter(c => c !== null) : [];
  t.ok(!!sp && specksHere.includes(sp.speck), 'its speck slot holds a speck (slot ' + (sp ? sp.speck : '-') + '; specks ' + specksHere.join(' ') + ')');
  t.ok(f.enemies.length === 1, 'and one fodder (' + f.enemies.map(e => KIND_NAME[e.kind] + ' at ' + e.idx).join(', ') + ')');
});

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
  const centreRow = s => Math.floor((s.hero.y + CS - 1) / CS);   /* a contact's row: the first whose stance is at or below the box (core-reach's scan) */
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
  const atContact = (s, t) => { const h = s.hero; return !h.ground && h.wall === t.side && (t.sticky ? h.sticky === 1 : h.sticky === 0) && centreCol(s) === t.cx && centreRow(s) === t.cy; };
  /* run one candidate on a clone; a contact target must be met during the words, a standable one rests on its row
     over its column by LAND_OVERLAP after them and then settles into it */
  function attempt(s0, words, t) {
    const s = cloneState(s0), used = [];
    /* a macro is a word list, or a function of the state and the step (a player watching the hero to time a release);
       a function runs for up to its .len steps */
    const fn = typeof words === 'function', n = fn ? words.len : words.length;
    /* the last word that moves the hero: A held alone moves nothing once it has landed (no press, no rise), so a jump's
       trailing held A never keeps the hero standing on its target (a moth would reach it there) */
    const MOVES = IN.L | IN.R | IN.B | IN.A_TAP | IN.B_TAP;
    let last = 0; if (!fn) for (let k = 0; k < n; k++) if (words[k] & MOVES) last = k;
    for (let k = 0; k < n; k++) {
      const word = fn ? words(s, k) : words[k];
      SB.sim.step(s, word); used.push(word);
      if (fn && word) last = k;
      if (s.room.cleared) return { ok: true, s, used };
      if (t.contact) { if (atContact(s, t)) return { ok: true, s, used }; continue; }
      if (k >= last && k > 0 && s.hero.ground && s.hero.vx === 0) break;
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
      const most = Math.max(40, est + 12);
      profs.forEach((p, pi) => A_RANGE[p].forEach((a, ai) => { for (let delay = 0; delay <= 8; delay++) for (let hold = 0; hold <= most; hold++) list.push({ a, delay, hold, prior: Math.abs(hold - est) + 2 * delay + 3 * ai + 6 * pi }); }));
      return ranked(list, c => c.prior).map(c => jumpWords(c.a, e.dir, c.delay, c.hold));
    }
    if (e.kind === 'FALL' && e.dir === 0) { const most = Math.ceil(-e.dy * CS / K.TERM) + 6; return Array.from({ length: most }, (_, i) => M_DIVE(i + 1, true, Math.max(LEN, most + 60))); }
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
    /* SLIDE: toward the wall while the slide is armed, released when it is not (where the wall ends a held rocker would
       carry the hero into the open column, which no player does) */
    if (e.kind === 'SLIDE') { const m = (s, k) => (k === 0 || s.hero.wall === e.dir ? rockerOf(e.dir) : 0); m.len = 4 * LEN; return [m]; }
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
    /* a mortal walk (H-en-3) whose moths block the edge: wait (a moth that reaches the hero hits it, and its i frames
       let the hero pass through), settle back on the source and try again, up to 600 steps (section 5.2 step 5's wait;
       homing moths never clear a corridor by themselves); a timeout fails */
    if (!s.immortal && !src.contact) for (const wait of ['hit', 20, 40, 60, 90, 120, 180, 240, 300, 400, 500, 600]) {
      /* 'hit': until a moth has hit and the knockback is spent, so the edge runs inside the i frames that remain */
      const w0 = cloneState(s), pre = [], h0 = w0.hero.hearts;
      if (wait === 'hit') { for (let k = 0; k < 600 && !w0.room.dead && !(w0.hero.hearts < h0 && w0.hero.knock === 0); k++) { SB.sim.step(w0, 0); pre.push(0); } if (!(w0.hero.hearts < h0)) continue; }
      else for (let k = 0; k < wait && !w0.room.dead; k++) { SB.sim.step(w0, 0); pre.push(0); }
      if (w0.room.dead || !settle(w0, src.v, pre)) continue;
      for (let i = 0; i < cands.length; i++) {
        const r = attempt(w0, cands[i], t); stats.tries++;
        if (r.ok && !r.s.room.dead) { stats.found++; return Object.assign(r, { used: pre.concat(r.used) }); }
      }
    }
    return first ? Object.assign(first, { ok: false, tried: cands.length }) : { ok: false, s, used: [], tried: 0 };
  }
  /* the walk: settle at spawn, then each ascent edge's macro in turn; arrival is the room clearing */
  function walk(lv, memo, stats, opts) {
    const g = SB.reach.graph(lv), asc = lv.ascent;
    let s = SB.sim.create(lv, { immortal: !opts || !opts.mortal });   /* the route walk is immortal (QUESTIONS Q30); H-en-3 walks mortal */
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
      const s = SB.sim.create(lv, { at: { x: src.cx * CS + ((CS - HW) >> 1), y: src.cy * CS }, immortal: true }), w = [];
      for (let k = 0; k < 4; k++) SB.sim.step(s, 0);
      return settle(s, v, w) ? s : null;
    }
    const x = src.side > 0 ? (src.cx + 1) * CS - HW : src.cx * CS;
    if (src.sticky) {
      const s = SB.sim.create(lv, { at: { x, y: (src.cy + 1) * CS - HH - 4 * 256 - K.G }, immortal: true });
      s.hero.ground = 0; s.hero.coyote = 0;
      for (let k = 0; k < 8 && !atContact(s, src); k++) SB.sim.step(s, 0);
      return atContact(s, src) ? s : null;
    }
    const s = SB.sim.create(lv, { at: { x, y: (src.cy + 1) * CS - HH - K.G }, immortal: true });
    s.hero.ground = 0; s.hero.coyote = 0;
    SB.sim.step(s, rockerOf(src.side));
    return atContact(s, src) ? s : null;
  }
  return { settle, solve, walk, place, nodeInfo, atContact, candidates };
})();

/* every built level of the corpus for the walk: (fixture, mode, biome) with the Deep override skipped by name until
   H-sim-17 (T1.5); "as detected" is the build's own biome (detected since T1.1; a room detected Deep is skipped by
   name with the override, the DEEP tables being more generous than the sim until T1.5). A biome whose level has the same cells, the
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
    if (biome === null && lv.biome === 2) { runs.push({ tag, f, mode, biome, skipped: 'detected Deep', deep: true }); continue; }
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
  let walked = 0, edges = 0, same = 0, skipped = 0, deep = [];
  for (const run of runs) {
    if (run.deep) { deep.push(run.tag); continue; }
    if (run.skipped) { skipped++; continue; }
    if (run.same) { same++; continue; }
    walked++; edges += run.r.edges;
    const m = run.r.miss;
    t.ok(!m, run.tag + ': ' + (m ? 'edge ' + m.i + ' of ' + run.lv.ascent.edges.length + ' has no macro: ' + m.e.kind + (m.e.profile ? ' ' + m.e.profile : '') + ' dir ' + m.e.dir + ' dx ' + m.e.dx + ' dy ' + m.e.dy + ' from ' + (m.src.contact ? 'the contact' : 'the cell') + ' (' + m.src.cx + ', ' + m.src.cy + ') to ' + (m.t.contact ? 'the contact' : 'the cell') + ' (' + m.t.cx + ', ' + m.t.cy + '); ' + m.tried + ' candidates, the prior\'s best rests at (' + m.rest.join(', ') + ')' + (m.wall ? ' armed ' + m.wall : '') : 'every one of its ' + run.lv.ascent.edges.length + ' ascent edges has a macro'),
      m ? SB.pipeline.toText(run.lv) : undefined);
  }
  console.log('  info  the bot walked ' + walked + ' levels (' + edges + ' ascent edges; ' + same + ' biome overrides share a walked level\'s cells and rules; ' + skipped + ' needsCrop); the Deep override skipped by name until H-sim-17 (T1.5)' + (deep.length ? ', and the rooms detected Deep: ' + deep.join(', ') : ''));
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

/* the edges of the whole graph, each from the hero placed on its source (section 5.2 step 6): 20 drawn per level in
   the fast run (the harness's own generator seeded seedOf(record) ^ 0x5bd1e995), every edge under --all-edges */
function botEdges(sample) {
  const out = { tried: 0, ok: 0, misses: [], placeMiss: [], byKind: {}, levels: 0 };
  const memo = new Map(), stats = { tries: 0, found: 0, memo: 0, memoMiss: 0 };
  for (const run of botWalks().runs) {
    if (run.skipped || run.same) continue;
    levelEdges(run.lv, run.tag, sample, out, memo, stats);
  }
  out.stats = stats;
  return out;
}
/* every edge of one level's graph (or `sample` of them), each from the hero placed on its source */
function levelEdges(lv, tag, sample, out, memo, stats) {
  {
    const g = SB.reach.graph(lv), run = { tag };
    let list = [];
    for (let v = 0; v < g.adj.length; v++) for (const e of g.adj[v] || []) list.push(e);
    if (sample) {
      const r = hrand((SB.record.seedOf(lv.rec) ^ 0x5bd1e995) >>> 0), pick = [];
      for (let k = 0; k < sample && list.length; k++) pick.push(list.splice(r.int(list.length), 1)[0]);
      list = pick;
    }
    out.levels++;
    /* an edge alone runs in the room without its exit: a room that clears on the way would count the edge done (the
       walk keeps the exit, where clearing is arrival) */
    const placed = new Map(), lvNoExit = Object.assign({}, lv, { exit: -1 });
    for (const e of list) {
      if (!placed.has(e.from)) placed.set(e.from, BOT.place(lvNoExit, g, e.from));
      const s0 = placed.get(e.from), kind = e.kind + (e.kind === 'FALL' && e.dir === 0 ? ' (dive)' : '');
      const bk = out.byKind[kind] || (out.byKind[kind] = { tried: 0, ok: 0 });
      out.tried++; bk.tried++;
      const src = BOT.nodeInfo(g, e.from), t = BOT.nodeInfo(g, e.to);
      if (!s0) { out.placeMiss.push(run.tag + ': ' + (src.contact ? 'the contact' : 'the cell') + ' (' + src.cx + ', ' + src.cy + ')' + (src.contact ? ' side ' + src.side : '') + ' cannot be placed'); continue; }
      const r = BOT.solve(s0, e, g, memo, stats);
      if (r.ok) { out.ok++; bk.ok++; continue; }
      out.misses.push(run.tag + ': ' + kind + (e.profile ? ' ' + e.profile : '') + ' dir ' + e.dir + ' dx ' + e.dx + ' dy ' + e.dy + ' from ' + (src.contact ? 'c' : '') + '(' + src.cx + ', ' + src.cy + ') to ' + (t.contact ? 'c' : '') + '(' + t.cx + ', ' + t.cy + '), ' + r.tried + ' candidates');
    }
  }
}
function reportEdges(t, res, what) {
  const kinds = Object.entries(res.byKind).map(([k, v]) => k + ' ' + v.ok + '/' + v.tried).join(', ');
  console.log('  info  ' + what + ': ' + res.ok + ' of ' + res.tried + ' edges performed over ' + res.levels + ' levels (' + kinds + '); ' + res.stats.tries + ' candidates run, ' + res.stats.memo + ' memo hits');
  t.ok(res.placeMiss.length === 0, what + ': every source the edges leave from can be placed (' + res.placeMiss.length + ' cannot' + (res.placeMiss.length ? ': ' + res.placeMiss.slice(0, 4).join('; ') : '') + ')');
  t.ok(res.misses.length === 0, what + ': every edge has a macro (' + res.misses.length + ' have none' + (res.misses.length ? ': ' + res.misses.slice(0, 6).join('; ') + (res.misses.length > 6 ? '; ...' : '') : '') + ')');
}
group('H-bot-1b', '20 random edges per level drawn from the whole graph, each performed from the hero placed on its source', t => {
  reportEdges(t, botEdges(20), 'the random edges');
});
/* the edges the corpus does not hold (the third review: no M0 room has a vine, so no check could fail on a generous
   STICKYUP, STICKYTOP or LET_GO): every edge of a few hand rooms, each from the hero placed on its source */
group('H-bot-1c', 'every edge of the hand rooms (vines under Overgrowth, a ceiling over a vine, ledges and walls) has a macro', t => {
  const out = { tried: 0, ok: 0, misses: [], placeMiss: [], byKind: {}, levels: 0 }, memo = new Map(), stats = { tries: 0, found: 0, memo: 0, memoMiss: 0 };
  /* shelves-a with its pillar a vine */
  const sa = buildFx(fixture('shelves-a'), 0), vine = Object.assign({}, sa, { biome: 3, sticky: Uint8Array.from(sa.solid.map((v, i) => (v && i % 24 >= 20 && i % 24 <= 21 && Math.floor(i / 24) < 47 ? 1 : 0))), exit: -1 });
  levelEdges(vine, 'shelves-a, its pillar a vine', 0, out, memo, stats);
  /* a 12 tall vine with a one way beside it, and a ceiling cell beside the cell over its top: no pop over there */
  const v2 = LABS.room(['', '.......#', '......|', '......|', '......|', '......|', '......|', '......|.==', '......|', '......|', '......|', '......|', '......|', '......|', '', '', FLOOR], { biome: 3 });
  levelEdges(v2, 'a vine under a ceiling', 0, out, memo, stats);
  /* ledges and a wall: planks ending in the open, a pillar with a shelf beside it */
  const l3 = LABS.room(['', '', '...======.........#....', '...................#....', '...................#....', '.........====......#....', '...................#....', '...................#....', '..=====............#....', '...................#....', '...............===.#....', '...................#....', '...................#....', FLOOR]);
  levelEdges(l3, 'ledges and a wall', 0, out, memo, stats);
  /* the review's slot: a vine whose top is roofed one row up (no pop over there), and its composite: a pillar to stand
     on, a wall 5 across, a one way the touch passes under (the route either fails here or the bot walks every edge) */
  const slot = LABS.room(['', '', '######', '......', '.....|', '.....|', '.....|', '.....|', '.....|', '.....|', '.....|', '.....|', '.....|', '.....|', '', '', FLOOR], { biome: 3 });
  levelEdges(slot, 'a vine roofed one row up', 0, out, memo, stats);
  const comp = LABS.room(['', '', '........#', '........#', '........#', '........#', '....===.#', '........#', '........#', '........#', '........#', '........#', '........#', '........#', '...S....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', '...#....#', FLOOR]);
  levelEdges(comp, 'a pillar beside a wall', 0, out, memo, stats);
  out.stats = stats;
  reportEdges(t, out, 'the hand rooms');
  t.ok(['STICKYUP', 'STICKYTOP', 'LET_GO', 'WALLTOUCH', 'WALLJUMP', 'SLIDE', 'FALL'].every(k => out.byKind[k] && out.byKind[k].tried > 0), 'the hand rooms hold every vine and wall edge kind (' + Object.keys(out.byKind).join(', ') + ')');
});

if (flag('all-edges')) group('H-bot-6', 'every edge of every graph has a macro (--all-edges)', t => {
  reportEdges(t, botEdges(0), 'every edge');
});

/* --record-json <file> (T0.15): a record the page produced ({ code } from SB_DEV.level(), a record's JSON form, or a
   fixture), validated and built here; one JSON line: { valid, needsCrop, exit, tabs } */
if (opt('record-json')) {
  const j = JSON.parse(fs.readFileSync(path.resolve(opt('record-json')), 'utf8'));
  let rec = null;
  try { rec = j.code ? SB.record.decode(String(j.code).trim()) : j.rows ? SB.record.fromJSON(j) : j.record ? SB.record.fromJSON(j.record) : null; } catch (e) { rec = null; }
  const valid = !!rec && SB.record.validate(SB.record.toJSON(rec)) === null;
  const lv = valid ? SB.pipeline.build(rec, {}) : null;
  console.log(JSON.stringify({ valid, needsCrop: !!(lv && lv.needsCrop), exit: lv && !lv.needsCrop ? lv.exit : -1, tabs: lv && !lv.needsCrop ? lv.repair.tabs : -1 }));
  process.exit(valid ? 0 : 1);
}

/* ================================================================ replays and goldens (T0.13b, section 2.6) */
/* A replay is the bot's walk on one fixture, mode and biome, as runs of words, padded with 300 quiet steps past the
   clear (the frame counter alone then moves the hash, which H-bot-3 needs), with a golden: the state hash at its end.
   --record <fixture> writes one, --replay <file> plays one, --regold --why ".." rewrites every golden with its why. */
const REPLAY_DIR = path.join(FIXDIR, 'replays'), REPLAY_PAD = 300;
function replayLevel(j, core) {
  const S = core || SB, f = fixture(j.fixture);
  if (!f) throw new Error('replay: no fixture named ' + j.fixture);
  return S.pipeline.build(S.record.fromJSON(Object.assign({}, f.fx.record, { mode: j.mode })), j.biome === null ? {} : { biome: j.biome });
}
function runReplay(j, core, marks) {
  const S = core || SB, lv = replayLevel(j, S), s = S.sim.create(lv, { hearts: j.opts && j.opts.hearts, immortal: !!(j.opts && j.opts.immortal) }), words = S.sim.rle.decode(j.runs), at = {};
  for (let k = 0; k < words.length; k++) { S.sim.step(s, words[k]); if (marks && marks.includes(k + 1)) at[k + 1] = S.sim.hash(s); }
  return { s, hash: S.sim.hash(s), at, words, cleared: s.room.cleared };
}
const hex = h => String(h);   /* sim.hash is a 16 hex digit string (section 2.5: two FNV passes) */
function recordReplay(name, mode, biome, why) {
  const f = fixture(name);
  if (!f) throw new Error('--record: no fixture named ' + name);
  const lv = biome === null ? buildFx(f, mode) : SB.pipeline.build(SB.record.fromJSON(Object.assign({}, f.fx.record, { mode })), { biome });
  if (lv.needsCrop) throw new Error('--record: ' + name + ' mode ' + mode + ' is needsCrop');
  const r = BOT.walk(lv, new Map(), { tries: 0, found: 0, memo: 0, memoMiss: 0 });
  if (!r.ok) throw new Error('--record: the bot does not clear ' + name + ' (' + (r.why || 'a miss at edge ' + (r.miss && r.miss.i)) + ')');
  const words = r.words.concat(Array(REPLAY_PAD).fill(0));
  const j = { v: 1, fixture: name, mode, biome, opts: { hearts: SB.TUNING.HEARTS_BASE, loadout: null, immortal: true }, steps: words.length, runs: SB.sim.rle.encode(words) };
  j.golden = { hash: hex(runReplay(j).hash), at: words.length, why: why };
  return j;
}
if (opt('record')) {
  const name = opt('record'), mode = Number(opt('mode') || 0), biome = opt('biome') === null ? null : Number(opt('biome'));
  const j = recordReplay(name, mode, biome, opt('why') || 'recorded ' + new Date().toISOString().slice(0, 10) + ' by --record');
  fs.mkdirSync(REPLAY_DIR, { recursive: true });
  const file = path.join(REPLAY_DIR, name + (mode ? '-mode' + mode : '') + (biome !== null ? '-biome' + biome : '') + '.json');
  fs.writeFileSync(file, JSON.stringify(j) + '\n');
  console.log('recorded ' + file + ': ' + j.steps + ' steps (' + j.runs.length + ' runs), golden ' + j.golden.hash);
  process.exit(0);
}
if (opt('replay')) {
  const file = path.resolve(opt('replay')), j = JSON.parse(fs.readFileSync(file, 'utf8')), r = runReplay(j);
  const ok = hex(r.hash) === j.golden.hash;
  console.log(path.basename(file) + ': ' + j.steps + ' steps, ' + (r.cleared ? 'cleared' : 'NOT cleared') + ', hash ' + hex(r.hash) + ', golden ' + j.golden.hash + ' (' + j.golden.why + '): ' + (ok ? 'equal' : 'DIFFERENT'));
  process.exit(ok && r.cleared ? 0 : 1);
}
if (flag('regold')) {
  const why = opt('why');
  if (!why) { console.log('--regold needs --why "the reason the hashes moved" (it lands in each file and in PROGRESS.md)'); process.exit(2); }
  for (const name of fs.readdirSync(REPLAY_DIR).filter(n => n.endsWith('.json'))) {
    const file = path.join(REPLAY_DIR, name), j = JSON.parse(fs.readFileSync(file, 'utf8')), r = runReplay(j), was = j.golden.hash;
    j.golden = { hash: hex(r.hash), at: j.steps, why: why };
    fs.writeFileSync(file, JSON.stringify(j) + '\n');
    console.log(name + ': ' + was + ' -> ' + j.golden.hash + (r.cleared ? '' : '  (WARNING: the replay no longer clears its room: --record it again)'));
  }
  process.exit(0);
}
const replays = () => fs.existsSync(REPLAY_DIR) ? fs.readdirSync(REPLAY_DIR).filter(n => n.endsWith('.json')).sort().map(n => ({ name: n, j: JSON.parse(fs.readFileSync(path.join(REPLAY_DIR, n), 'utf8')) })) : [];

group('H-bot-5', 'the goldens: each replay in fixtures/replays clears its room and ends on its golden hash', t => {
  const list = replays();
  t.ok(['sample-room.json', 'shelves-a.json'].every(n => list.some(r => r.name === n)), 'the sample room and shelves-a have replays (' + list.map(r => r.name).join(', ') + ')');
  for (const { name, j } of list) {
    const r = runReplay(j);
    t.ok(r.cleared === 1, name + ': its ' + j.steps + ' steps clear the room (else --record it again)');
    t.eq(hex(r.hash), j.golden.hash, name + ': the hash at step ' + j.golden.at + ' is the golden (' + j.golden.why + '; an intended change: --regold --why "..")');
  }
});

group('H-bot-3', 'determinism: the sample room\'s replay hashes alike twice and in two fresh contexts at frames 300, 900, 1800 and the end; the frame moves the hash', t => {
  const j = replays().find(r => r.name === 'sample-room.json');
  if (!t.ok(!!j, 'the sample room replay exists')) return;
  const marks = [300, 900, 1800, j.j.steps - 60, j.j.steps];
  const a = runReplay(j.j, SB, marks), b = runReplay(j.j, SB, marks);
  const ctxA = loadCoreFull(PAGE).SB, ctxB = loadCoreFull(PAGE).SB;
  const c = runReplay(j.j, ctxA, marks), d = runReplay(j.j, ctxB, marks);
  t.same(marks.map(m => a.at[m]), marks.map(m => b.at[m]), 'two runs in one context hash alike at ' + marks.join(', '));
  t.same(marks.map(m => c.at[m]), marks.map(m => d.at[m]), 'two fresh contexts hash alike at ' + marks.join(', '));
  t.same(marks.map(m => c.at[m]), marks.map(m => a.at[m]), 'and alike with the harness\'s own context');
  /* after the clear the state stands still but for the frame: a hash that ignored the frame would repeat here */
  t.ok(a.cleared === 1 && a.at[j.j.steps - 60] !== a.at[j.j.steps], 'past the clear, 60 quiet steps apart, the hashes differ (' + hex(a.at[j.j.steps - 60]) + ', ' + hex(a.at[j.j.steps]) + '): the frame is in the hash');
});

group('H-bot-4', 'the bit flip: one input bit changed at frame 100 changes the final hash', t => {
  const j = replays().find(r => r.name === 'sample-room.json');
  if (!t.ok(!!j, 'the sample room replay exists')) return;
  const base = runReplay(j.j).hash;
  /* the bits whose flip leaves a lasting change at frame 100, where the walk stands still in a held A's tail: the
     rocker either way, and B's press (a dash, 3 cells); A there is a jump straight up that lands where it left, and
     the walk rightly ends the same */
  for (const bit of [IN.L, IN.R, IN.B_TAP]) {
    const words = SB.sim.rle.decode(j.j.runs); words[99] ^= bit;
    const flipped = runReplay(Object.assign({}, j.j, { runs: SB.sim.rle.encode(words) })).hash;
    t.ok(flipped !== base, 'flipping bit ' + bit + ' at frame 100 changes the final hash (' + hex(base) + ' to ' + hex(flipped) + ')');
  }
});

/* BOT-EXPLORE (report only, --explore <fixture>): from every standable cell, every JUMP one beyond the model's table
   (one cell farther at each height, and one row higher at each distance) whose target is standable, searched by the
   bot's JUMP candidates; the extra edges the sim allowed say how much slack a thumb has past the model */
if (opt('explore')) {
  const f = fixture(opt('explore'));
  if (!f) { console.log('--explore: no fixture named ' + opt('explore')); process.exit(2); }
  const lv = buildFx(f, Number(opt('mode') || 0)), g = SB.reach.graph(lv), tb = SB.reach.tables(SB.K, lv.biome | 0);
  const m = tb.profiles.FULL.maxAcross, up = m.reduce((u, v, dy) => (v >= 0 ? dy : u), -1), tried = {}, allowed = {};
  const memo = new Map(), stats = { tries: 0, found: 0, memo: 0, memoMiss: 0 };
  const beyond = []; for (let dy = 0; dy <= up; dy++) beyond.push([m[dy] + 1, dy]); for (let dx = 0; dx <= m[0]; dx++) { let u = -1; for (let dy = 0; dy < m.length; dy++) if (m[dy] >= dx) u = dy; beyond.push([dx, u + 1]); }
  for (let v = 0; v < g.n; v++) {
    if (!g.stand[v]) continue;
    const sx = v % lv.w, sy = Math.floor(v / lv.w);
    for (const dir of [1, -1]) for (const [dx, dy] of beyond) {
      if (dx === 0 && dir < 0) continue;
      const tx = sx + dir * dx, ty = sy - dy;
      if (tx < 0 || tx >= lv.w || ty < 0 || !g.stand[ty * lv.w + tx]) continue;
      const key = dx + ' across ' + dy + ' up'; tried[key] = (tried[key] || 0) + 1;
      const s0 = BOT.place(Object.assign({}, lv, { exit: -1 }), g, v); if (!s0) continue;   /* no exit: a clear is not a jump */
      const r = BOT.solve(s0, { kind: 'JUMP', profile: 'FULL', dir, dx, dy, from: v, to: ty * lv.w + tx }, g, memo, stats);
      if (r.ok) allowed[key] = (allowed[key] || 0) + 1;
    }
  }
  console.log('BOT-EXPLORE ' + f.name + ' mode ' + (opt('mode') || 0) + ': jumps one beyond the model (FULL table ' + JSON.stringify(m) + '), from every standable cell to every standable target');
  for (const key of Object.keys(tried)) console.log('  ' + key.padEnd(16) + ' ' + String(allowed[key] || 0).padStart(4) + ' of ' + String(tried[key]).padStart(4) + ' the sim allowed');
  process.exit(0);
}

/* ================================================================ moths, hearts, death (T0.16) */
/* a lab level with saturated two cell clusters (palette 9) at the given cells, built whole */
function mothLab(spots) {
  const rows = {};
  for (const [x, y] of spots) { const r = (rows[y] || '4'.repeat(24)).split(''); r[x] = '9'; r[x + 1] = '9'; rows[y] = r.join(''); }
  return SB.pipeline.build(labRecord(rows), { biome: 0 });   /* the Attic fodder rules (an Ash walled lab detects Frost since T1.1) */
}
const cheb = (a, b, w) => Math.max(Math.abs(a % w - b % w), Math.abs(Math.floor(a / w) - Math.floor(b / w)));

group('H-en-1', 'moth spawns: on open cells, clear of spawn, at most 4 (2 in a first room), picked by the seed, never on a claimed cell', t => {
  let levels = 0, moths = 0;
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    levels++;
    const es = lv.features.enemies, lm = new Set(lv.landmarks.flatMap(l => Array.from(l.cells))), beacon = new Set(Array.from(lv.beacon.cells));
    moths += es.length;
    const bad = es.filter(e => lv.solid[e.idx] || cheb(e.idx, lv.spawn, lv.w) <= SB.TUNING.ENEMY_SPAWN_CLEAR || lm.has(e.idx) || beacon.has(e.idx));
    t.ok(es.length <= SB.TUNING.CAP_ENEMY + (lv.biome === 4 ? SB.TUNING.EMBER_EXTRA_ENEMY : 0) && bad.length === 0 && es.every(e => e.kind === SB.features.KIND_OF_BIOME[lv.biome] || (e.kind === SB.features.MOTH && lv.repair.spread)), f.name + ' mode ' + mode + ': ' + es.length + ' enemies of its biome\'s kind, every one on an open cell, clear of spawn and of the claimed cells' + (bad.length ? ' (bad: ' + bad.map(e => e.idx % 24 + ',' + Math.floor(e.idx / 24)).join(' ') + ')' : ''));
  }
  console.log('  info  H-en-1: ' + moths + ' moths over ' + levels + ' built levels');
  /* six clusters: the cap and the first room cap, the same pick twice */
  const six = mothLab([[2, 10], [8, 14], [14, 18], [3, 22], [10, 26], [16, 30]]);
  const all = SB.features.moths(six, {}), first = SB.features.moths(six, { firstRoom: true }), again = SB.features.moths(six, {});
  t.ok(all.length === 4 && first.length === SB.TUNING.FIRST_ROOM_MAX_FODDER && JSON.stringify(all) === JSON.stringify(again), 'six clusters give 4 moths, 2 in a first room, and the same 4 every time (' + all.map(e => e.idx).join(' ') + ')');
  /* the spawn rule alone (the ascent's cells set aside): a cluster beside spawn never spawns within ENEMY_SPAWN_CLEAR */
  const near = mothLab([[12, 44]]), bare = Object.assign({}, near, { ascent: { nodes: [] } }), m = SB.features.moths(bare, {});
  t.ok(m.every(e => cheb(e.idx, near.spawn, near.w) > SB.TUNING.ENEMY_SPAWN_CLEAR), 'a cluster beside spawn (' + near.spawn % 24 + ', ' + Math.floor(near.spawn / 24) + ') spawns its moth more than ENEMY_SPAWN_CLEAR away (' + m.map(e => e.idx % 24 + ',' + Math.floor(e.idx / 24)).join(' ') + ')');
});

group('H-route-6', 'the main ascent\'s safe cells respect the moths: every cell it stands on is more than ROUTE_SAFE_ENEMY_DIST from every moth (DESIGN 6.9)', t => {
  for (const f of FIXTURES) for (const mode of MODES) {
    const lv = buildFx(f, mode);
    if (lv.needsCrop) continue;
    const stands = lv.ascent.nodes.filter(v => v < lv.w * lv.h), close = [];
    for (const e of lv.features.enemies) for (const v of stands) if (cheb(e.idx, v, lv.w) <= SB.TUNING.ROUTE_SAFE_ENEMY_DIST) close.push(e.idx + '/' + v);
    t.eq(close.length, 0, f.name + ' mode ' + mode + ': moths within ROUTE_SAFE_ENEMY_DIST of an ascent cell');
  }
  /* the rule alone: a cluster beside a cell the ascent stands on (set by hand) spawns its moth out of reach of it */
  const lab = mothLab([[6, 20]]), stand = 21 * 24 + 6, m = SB.features.moths(Object.assign({}, lab, { ascent: { nodes: [lab.spawn, stand] } }), {});
  t.ok(m.length > 0 && m.every(e => cheb(e.idx, stand, 24) > SB.TUNING.ROUTE_SAFE_ENEMY_DIST), 'a cluster beside an ascent cell (6, 21) puts its moth more than ROUTE_SAFE_ENEMY_DIST from it (DESIGN 6.9: no spawn within 3) (' + m.map(e => e.idx % 24 + ',' + Math.floor(e.idx / 24)).join(' ') + ')');
});

group('H-en-2', 'contact: one heart, 60 i frames, nothing more inside them, knockback away from the moth', t => {
  const lv = LABS.room(['', '.....S..........', FLOOR]);
  lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 46 * 24 + 8 }] };
  const s = SB.sim.create(lv);
  let hitAt = -1, x0 = 0, k = 0;
  for (; k < 600 && hitAt < 0; k++) { x0 = s.hero.x; SB.sim.step(s, 0); if (s.hero.hearts < SB.TUNING.HEARTS_BASE) hitAt = k; }
  t.ok(hitAt > 0 && s.hero.hearts === SB.TUNING.HEARTS_BASE - SB.TUNING.HIT_HEARTS && s.hero.iframes === K.HIT_IFRAMES_F, 'the moth reaches the hero (step ' + hitAt + '): one heart lost (' + s.hero.hearts + ' left) and ' + s.hero.iframes + ' i frames (HIT_IFRAMES ' + K.HIT_IFRAMES_F + ')');
  const xHit = s.hero.x; for (let j = 0; j < K.KNOCK_FRAMES; j++) SB.sim.step(s, 0);
  t.ok(s.hero.x < xHit && xHit - s.hero.x === SB.TUNING.HIT_KNOCKBACK_CELLS * CS, 'the knockback carries the hero away from the moth, exactly HIT_KNOCKBACK_CELLS: ' + ((xHit - s.hero.x) / 256).toFixed(1) + ' px over ' + K.KNOCK_FRAMES + ' steps');
  const xEnd = s.hero.x; SB.sim.step(s, 0); SB.sim.step(s, 0);
  t.ok(s.hero.vx === 0 && s.hero.x === xEnd, 'the knockback ends at rest: vx ' + s.hero.vx + ', ' + ((xEnd - s.hero.x) / 256).toFixed(1) + ' px more in the two steps after it (DESIGN 7: 2 cells)');
  /* walk back into the moth while the i frames last: the boxes overlap, and no heart goes (the knockback alone parts
     them for longer than the i frames, so the test makes the second contact itself) */
  let lost = 0, touched = 0; const h0 = s.hero.hearts;
  for (let j = 0; j < K.HIT_IFRAMES_F - K.KNOCK_FRAMES - 2; j++) {
    SB.sim.step(s, IN.R);
    const e = s.enemies[0]; if (s.hero.x < e.x + CS - 512 && s.hero.x + HW > e.x + 512 && s.hero.y < e.y + CS - 512 && s.hero.y + HH > e.y + 512) touched++;
    if (s.hero.hearts < h0) lost++;
  }
  t.ok(touched > 0 && lost === 0, 'inside the i frames a second contact removes nothing (' + touched + ' steps of overlap with the moth, ' + lost + ' hearts lost)');
  const imm = SB.sim.create(lv, { immortal: true }); for (let j = 0; j < 600; j++) SB.sim.step(imm, 0);
  t.eq(imm.hero.hearts, SB.TUNING.HEARTS_BASE, 'an immortal state (the bot\'s route walks, Q30) loses no heart to a moth');
  /* the last heart ends the room */
  const d = SB.sim.create(lv, { hearts: 1 }); let dead = -1;
  for (let j = 0; j < 600 && dead < 0; j++) { SB.sim.step(d, 0); if (d.room.dead) dead = j; }
  t.ok(dead > 0 && d.hero.hearts === 0 && d.room.deaths === 1, 'the last heart ends the room (dead at step ' + dead + ')');
});

group('H-en-2c', 'the knockback is away from the moth on either side, exactly HIT_KNOCKBACK_CELLS over HIT_KNOCKBACK_FRAMES, then at rest (from TUNING, here)', t => {
  const T = SB.TUNING, want = T.HIT_KNOCKBACK_CELLS * SB.GRID.CELL * 256, frames = T.HIT_KNOCKBACK_FRAMES;
  for (const [mx, side] of [[8, 'right'], [2, 'left']]) {
    const lv = LABS.room(['', '.....S..........', FLOOR]);
    lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 46 * 24 + mx }] };
    const s = SB.sim.create(lv); let hit = -1;
    for (let k = 0; k < 600 && hit < 0; k++) { SB.sim.step(s, 0); if (s.ev & SB.sim.EV.HIT) hit = k; }
    const x0 = s.hero.x; for (let j = 0; j < frames; j++) SB.sim.step(s, 0);
    const moved = s.hero.x - x0, x1 = s.hero.x; SB.sim.step(s, 0); SB.sim.step(s, 0);
    const away = side === 'right' ? -1 : 1;
    t.ok(hit > 0 && moved === away * want && s.hero.x === x1 && s.hero.vx === 0, 'a moth on the ' + side + ': the hero is knocked ' + (moved / 256) + ' px over ' + frames + ' steps (want ' + (away * want / 256) + '), then at rest (vx ' + s.hero.vx + ')');
  }
});

group('H-en-2d', 'the i frames last exactly HIT_IFRAMES_S: a moth held on the hero takes nothing until they run out, then the next heart', t => {
  const win = Math.round(SB.TUNING.HIT_IFRAMES_S * 60);
  const lv = LABS.room(['', '.....S..........', FLOOR]);
  lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 46 * 24 + 8 }] };
  const s = SB.sim.create(lv); let first = -1, second = -1;
  for (let k = 0; k < 2000 && second < 0; k++) {
    /* once hit, the moth is held centred on the hero (no drift: md 0), so every step after the first is a contact */
    if (first >= 0) { const e = s.enemies[0], h = s.hero; e.x = h.x + (HW >> 1) - (CS >> 1); e.y = h.y + (HH >> 1) - (CS >> 1); }
    SB.sim.step(s, 0);
    if (s.ev & SB.sim.EV.HIT) { if (first < 0) first = k; else second = k; }
  }
  t.eq(second - first, win, 'held on the hero, the moth takes the next heart exactly HIT_IFRAMES_S after the first (' + (second - first) + ' steps, want ' + win + ')');
});

group('H-en-2e', 'a dash\'s i frames protect (QUESTIONS Q47, Q70): a dash from point blank through a moth costs no heart', t => {
  const lv = LABS.room(['', '.....S..................', FLOOR]);
  lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 2 * 24 + 20 }] };
  const s = SB.sim.create(lv);
  for (let k = 0; k < 30 && !s.hero.ground; k++) SB.sim.step(s, 0);
  s.hero.facing = 1;
  const e = s.enemies[0], h = s.hero, h0 = h.hearts;
  e.x = h.x + HW - (CS >> 1); e.y = h.y + (HH >> 1) - (CS >> 1);   /* the moth's centre on the hero's leading edge: overlapping now */
  SB.sim.step(s, IN.B | IN.B_TAP);
  const dashed = s.hero.dash > 0 && s.hero.dashI > 0;
  for (let k = 0; k < 12; k++) SB.sim.step(s, 0);
  t.ok(dashed && s.hero.hearts === h0, 'a dash from point blank through a moth keeps every heart (' + s.hero.hearts + ' of ' + h0 + (dashed ? '' : '; no dash started') + ')');
});

group('H-en-2f', 'the moth\'s contact core is its cell less 2 px a side (QUESTIONS Q70): 1 px into it hits, touching its edge does not', t => {
  const run = inside => {
    const lv = LABS.room(['', '.....S..................', FLOOR]);
    lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 2 * 24 + 20 }] };
    const s = SB.sim.create(lv);
    for (let k = 0; k < 30 && !s.hero.ground; k++) SB.sim.step(s, 0);
    const e = s.enemies[0], h = s.hero, core = 2 * 256;
    /* level with the hero's middle, to its right: after its drift of MOTH_V the core's left edge sits 1 px inside the
       hero's right edge, or exactly on it */
    e.y = h.y + (HH >> 1) - (CS >> 1);
    e.x = h.x + HW - core + K.MOTH_V - (inside ? 256 : 0);
    SB.sim.step(s, 0);
    return !!(s.ev & SB.sim.EV.HIT);
  };
  t.ok(run(true), 'a moth whose core reaches 1 px into the hero hits on that step');
  t.ok(!run(false), 'a moth whose core only touches the hero\'s edge does not');
});

group('H-en-2b', 'a hit on a vine lets go of it: the hero is never held sticky away from a sticky wall (the fourth review)', t => {
  /* an Overgrowth lab: a vine at x 3 from row 20 to 46, the hero in the air flush against its right face, a moth to
     the right; the moth drifts through furniture, so it reaches the hero from either side */
  const lines = []; for (let r = 20; r <= 46; r++) lines.push('...|');
  const lv = LABS.room(lines.concat([FLOOR]), { biome: 3 });
  lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 30 * 24 + 9 }] };
  const s = SB.sim.create(lv, { at: { x: 4 * CS, y: 28 * CS } });
  s.hero.ground = 0;
  let hits = 0, stuckHits = 0, bad = '';
  for (let k = 0; k < 600 && !s.room.dead; k++) {
    const wasSticky = s.hero.sticky;
    SB.sim.step(s, 0);
    const h = s.hero;
    if (s.ev & SB.sim.EV.HIT) { hits++; if (wasSticky) stuckHits++; }
    if (h.sticky && !bad) {
      /* flush: the box's side on a cell boundary, and the cell beyond it at the hero's middle row a sticky cell */
      const edge = h.wall < 0 ? h.x : h.x + HW, col = h.wall < 0 ? h.x / CS - 1 : (h.x + HW) / CS, row = Math.floor((h.y + (HH >> 1)) / CS);
      if (edge % CS !== 0 || !Number.isInteger(col) || col < 0 || col >= lv.w || !lv.sticky[row * lv.w + col]) bad = 'step ' + k + ': sticky at x ' + (h.x / 256).toFixed(1) + ' px, wall ' + h.wall + ', not flush against the vine';
    }
  }
  t.ok(stuckHits > 0, 'the moth hits the hero while it clings (' + stuckHits + ' of ' + hits + ' hits)');
  t.ok(!bad, 'the hero is never held sticky away from the vine' + (bad ? ': ' + bad : ''));
});

group('H-sim-21', 'the step\'s event word (s.ev, what the sounds read): each event on exactly the step it happens, cleared the next', t => {
  const EV = SB.sim.EV, log = (s, word) => { SB.sim.step(s, word); return s.ev; };
  { const lv = LABS.room(['', '..S...........', FLOOR]), s = SB.sim.create(lv, {}); let k = 0;
    while (!s.hero.ground && k < 60) { SB.sim.step(s, 0); k++; }
    const e1 = log(s, IN.A | IN.A_TAP), e2 = log(s, IN.A);
    t.ok((e1 & EV.JUMP) && !(e2 & EV.JUMP), 'a jump sets JUMP on its takeoff step only (' + e1 + ', then ' + e2 + ')');
    let land = -1, lands = 0; for (k = 0; k < 120; k++) { const e = log(s, 0); if (e & EV.LAND) { lands++; if (land < 0) land = k; } }
    t.ok(land > 0 && lands === 1 && s.hero.ground, 'its landing sets LAND once (' + lands + ' times, step ' + land + ')');
  }
  { const lines = []; for (let r = 30; r <= 46; r++) lines.push('..#');
    const s = placed(LABS.room(lines.concat([FLOOR])), 3 * CS, 36 * CS);
    SB.sim.step(s, IN.L);
    const e = log(s, IN.A | IN.A_TAP);
    t.ok((e & EV.WALLJUMP) && !(e & EV.JUMP), 'a wall jump sets WALLJUMP, not JUMP (' + e + ')');
  }
  { const lines = []; for (let r = 10; r <= 46; r++) lines.push('');
    const s = placed(LABS.room(lines.concat([FLOOR])), 11 * CS, 10 * CS);
    const e = log(s, IN.B_TAP | IN.B); let land = 0;
    for (let k = 0; k < 200 && !land; k++) land = log(s, IN.B) & EV.LAND;
    t.ok((e & EV.DIVE) && land && s.hero.shake === K.SHAKE_F, 'a dive sets DIVE, its landing LAND with the shake running (the heavy land)');
  }
  { const lv = LABS.room(['', '.....S..........', FLOOR]);
    lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 46 * 24 + 8 }] };
    const s = SB.sim.create(lv, { hearts: 2 }); let hits = 0, dead = 0, both = 0;
    for (let k = 0; k < 900 && !s.room.dead; k++) { const e = log(s, 0); if (e & EV.HIT) hits++; if (e & EV.DEAD) { dead++; if (e & EV.HIT) both++; } }
    t.ok(hits === 2 && dead === 1 && both === 1, 'two hits set HIT twice, the last with DEAD (' + hits + ' hits, ' + dead + ' dead)');
    t.eq(log(s, 0), 0, 'a dead room\'s steps carry no event');
  }
  { const lv = LABS.room(['', '..S..X........', FLOOR], { exit: true }), s = SB.sim.create(lv, {}); let clear = -1, n = 0;
    for (let k = 0; k < 300; k++) { const e = log(s, IN.R); if (e & EV.CLEAR) { n++; if (clear < 0) clear = k; } }
    t.ok(clear >= 0 && n === 1 && s.room.cleared, 'reaching the exit sets CLEAR once (step ' + clear + ', ' + n + ' times)');
  }
  /* the shared step (QUESTIONS Q71): a moth reaching the hero on its last heart on the very step it touches the exit
     (found by the fourth review: a moth homed at (11, 45), the rocker right from step 19, both on step 62) */
  {
    const lv2 = LABS.room(['', '..S.......X.............', FLOOR], { exit: true });
    lv2.exit = lv2.target;
    lv2.features = { enemies: [{ kind: SB.features.MOTH, idx: 45 * 24 + 11 }] };
    const s2 = SB.sim.create(lv2, { hearts: 1 });
    let k = 0;
    for (; k < 600 && !s2.room.cleared && !s2.room.dead; k++) SB.sim.step(s2, k < 19 ? 0 : IN.R);
    t.ok(s2.room.cleared === 1 && s2.room.dead === 0 && s2.hero.hearts === 1 && !(s2.ev & EV.HIT), 'a moth on the step the hero touches the exit: the clear wins (step ' + (k - 1) + ': cleared ' + s2.room.cleared + ', dead ' + s2.room.dead + ', hearts ' + s2.hero.hearts + ', ev ' + s2.ev + ')');
  }
});

group('H-en-4', 'a moth 10 cells away reaches the hero\'s column in about 600 frames (1 cell per second, through furniture)', t => {
  const lv = LABS.room(['', '.......#..........', '..S....#..........', FLOOR]);
  lv.features = { enemies: [{ kind: SB.features.MOTH, idx: 45 * 24 + 12 }] };
  const s = SB.sim.create(lv, { immortal: true }); let at = -1;
  for (let k = 0; k < 1200 && at < 0; k++) { SB.sim.step(s, 0); const m = s.enemies[0]; if (Math.floor((m.x + (CS >> 1)) / CS) === Math.floor((s.hero.x + (HW >> 1)) / CS)) at = k; }
  t.ok(at >= 540 && at <= 660, 'it reaches the column in ' + at + ' frames (about 600), through the wall between');
});

group('H-en-3', 'the walks with moths live: the bot\'s (immortal) and a mortal one on the sample room with the first room cap, which keeps a heart', t => {
  const { runs } = botWalks();
  const withMoths = runs.filter(r => r.lv && r.lv.features && r.lv.features.enemies.length);
  t.ok(withMoths.length > 0 && withMoths.every(r => r.r.ok), 'every walked level with moths is walked to its exit (' + withMoths.map(r => r.tag + ' ' + r.lv.features.enemies.length).join(', ') + ')');
  const lv = SB.pipeline.build(SB.record.fromJSON(fixture('sample-room').fx.record), { firstRoom: true });
  const r = BOT.walk(lv, new Map(), { tries: 0, found: 0, memo: 0, memoMiss: 0 }, { mortal: true });
  t.ok(r.ok && r.s.hero.hearts >= 1, 'the mortal walk on the sample room (' + lv.features.enemies.length + ' moths, the first room cap) reaches the exit with ' + r.s.hero.hearts + ' hearts' + (r.ok ? '' : ' (' + (r.why || 'stopped at edge ' + (r.miss && r.miss.i)) + ')'));
});

/* ================================================================ the enemy sim (T1.4) */
/* a lab state: the room, one enemy of a kind on a cell (its envelope given, or none), the hero standing on the floor in
   column hc (or wherever opts says); immortal unless asked */
function enemyLab(lines, kind, cell, opts = {}) {
  const lv = LABS.room(lines, opts.room || {});
  lv.features = { pocket: null, enemies: [{ kind, idx: cell, elite: !!opts.elite, env: opts.env ? Int32Array.from(opts.env) : Int32Array.of(cell) }] };
  const hc = opts.hc === undefined ? 20 : opts.hc;
  const s = SB.sim.create(lv, { at: { x: hc * CS + ((CS - HW) >> 1), y: 46 * CS }, immortal: opts.mortal ? false : true });
  return { lv, s };
}
group('H-en-5', 'the icicle (DESIGN 7): it drops when the hero is within ICICLE_TRIGGER_COLS columns below it and not one further; it shatters on the floor and hangs again ICICLE_RESPAWN_F steps later', t => {
  const lines = ['........========', '', '', '', '', '', FLOOR], cell = 41 * 24 + 12, T = SB.TUNING;   /* a one way at x 8..15 on row 41, the icicle under it at (12, 42) */
  const at2 = enemyLab(lines, SB.features.ICICLE, 42 * 24 + 12, { hc: 12 + T.ICICLE_TRIGGER_COLS }), at3 = enemyLab(lines, SB.features.ICICLE, 42 * 24 + 12, { hc: 12 + T.ICICLE_TRIGGER_COLS + 1 });
  SB.sim.step(at2.s, 0); SB.sim.step(at3.s, 0);
  t.ok(at2.s.enemies[0].state === 1 && at3.s.enemies[0].state === 0, 'the hero ' + T.ICICLE_TRIGGER_COLS + ' columns off drops it (state ' + at2.s.enemies[0].state + '), ' + (T.ICICLE_TRIGGER_COLS + 1) + ' columns off does not (state ' + at3.s.enemies[0].state + ')');
  const s = at2.s, e = s.enemies[0], y0 = 42 * CS; let k = 0;
  while (e.state === 1 && k < 300) { SB.sim.step(s, 0); k++; }
  const landed = e.state === 2 && e.y + CS - 1 >= 46 * CS, back = []; let n = 0;
  while (e.state === 2 && n < 1000) { SB.sim.step(s, 0); n++; }
  back.push(e.state, e.x === 12 * CS, e.y === y0);
  t.ok(landed && n === K.ICICLE_RESPAWN_F && back.join() === '0,true,true', 'it shatters on the floor after ' + k + ' steps and hangs at home again ' + n + ' steps later (ICICLE_RESPAWN_F ' + K.ICICLE_RESPAWN_F + ')');
});
group('H-en-6', 'the thorn crawler (DESIGN 7): it patrols its one way run at CRAWLER_V, turns at the run\'s last cell and never walks off', t => {
  const { s } = enemyLab(['..========', '', '', '', '', FLOOR], SB.features.CRAWLER, 41 * 24 + 5);   /* a run of x 2..9 on row 42 */
  const e = s.enemies[0]; let lo = Infinity, hi = -Infinity, turns = 0, dir = e.dir, ys = new Set(), steps = new Set();
  for (let k = 0; k < 900; k++) { const x0 = e.x; SB.sim.step(s, 0); lo = Math.min(lo, e.x); hi = Math.max(hi, e.x); ys.add(e.y); if (e.dir !== dir) { turns++; dir = e.dir; } if (e.x !== x0) steps.add(Math.abs(e.x - x0)); }
  t.ok(lo === 2 * CS && hi === 9 * CS && ys.size === 1 && ys.has(41 * CS) && turns >= 4 && Math.max(...steps) === K.CRAWLER_V, 'over 900 steps it spans x ' + lo / CS + ' to ' + hi / CS + ' cells (the run is 2 to 9), on row ' + [...ys].map(y => y / CS).join() + ', turning ' + turns + ' times at CRAWLER_V');
});
group('H-en-7', 'the spark (DESIGN 7): every SPARK_HOP_F steps it hops onto a standable cell of its envelope, never into a wall or the air, the cell drawn from the state\'s generator', t => {
  /* rows 38 to 47: a one way at x 12..15 on row 40 (its standing row 39), a wall at x 9..10 on rows 41..42, a one way
     at x 4..7 on row 43 (standing row 42); the envelope given holds both planks' standing cells, a wall cell and an
     air cell */
  const lines = ['', '', '............====', '.........##.....', '.........##.....', '....====', '', '', '', FLOOR];
  const plankA = [4, 5, 6, 7].map(x => 42 * 24 + x), plankB = [12, 13, 14, 15].map(x => 39 * 24 + x), env = plankA.concat(plankB, [41 * 24 + 9, 30 * 24 + 6]);
  const { lv, s } = enemyLab(lines, SB.features.SPARK, 42 * 24 + 5, { env });
  const e = s.enemies[0], g = SB.reach.graph(lv), lands = [], at = []; let st = e.state;
  for (let k = 0; k < 40 * K.SPARK_HOP_F; k++) {
    SB.sim.step(s, 0);
    if (st === 1 && e.state === 0) { const c = Math.floor((e.y + CS - 1) / CS) * 24 + Math.floor((e.x + (CS >> 1)) / CS); lands.push(c); at.push(k); }
    st = e.state;
  }
  const gaps = at.slice(1).map((v, i) => v - at[i]), distinct = new Set(lands);
  t.ok(lands.length >= 30 && lands.every(c => g.stand[c] && env.includes(c)) && gaps.every(d => d === K.SPARK_HOP_F) && distinct.size >= 3, lands.length + ' hops, every landing a standable cell of the envelope (' + [...distinct].map(c => '(' + c % 24 + ', ' + Math.floor(c / 24) + ')').join(' ') + '), one every ' + [...new Set(gaps)].join(' or ') + ' steps');
});
group('H-en-8', 'the jelly (DESIGN 7): it bobs JELLY_BOB_CELLS above and below home on an integer triangle at JELLY_V, and a solid cell above shortens the throw (an enemy never enters a solid cell)', t => {
  const span = lines => { const { s } = enemyLab(lines, SB.features.JELLY, 30 * 24 + 12); const e = s.enemies[0]; let lo = Infinity, hi = -Infinity; for (let k = 0; k < 900; k++) { SB.sim.step(s, 0); lo = Math.min(lo, e.y); hi = Math.max(hi, e.y); } return [lo / CS, hi / CS]; };
  const open = span([...Array(17)].map(() => '').concat([FLOOR])), roofed = span(['............#'].concat([...Array(18)].map(() => ''), [FLOOR]));   /* 20 lines: rows 28..47, the solid at (12, 28) */
  const planked = span(['..........=====', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', FLOOR]);   /* a one way at x 10..14 on row 28 */
  t.ok(open.join() === '28,32' && roofed.join() === '29,32' && planked.join() === '29,32', 'in an open column its extremes are rows ' + open.join(' and ') + ' (home 30); with a solid cell at (12, 28) they are ' + roofed.join(' and ') + ', under a one way on row 28 ' + planked.join(' and '));
});
group('H-en-9', 'the elites (Q51): ELITE_HP_MULT times their kind\'s HP, ELITE_SIZE_CELLS a side; the pocket\'s elite sleeps until the hero enters its pocket and never leaves it (Q75); a kill banks DP_FODDER or DP_ELITE', t => {
  const T = SB.TUNING, F = SB.features, kinds = [F.MOTH, F.ICICLE, F.JELLY, F.CRAWLER, F.SPARK];
  t.ok(kinds.every(k => SB.sim.hpOf(k, 1) === T.ELITE_HP_MULT * SB.sim.hpOf(k, 0)) && SB.sim.hpOf(F.JELLY, 0) === T.JELLY_HP && SB.sim.hpOf(F.CRAWLER, 0) === T.CRAWLER_HP && SB.sim.hpOf(F.MOTH, 0) === 1,
    'every kind\'s elite has ELITE_HP_MULT times its HP (' + kinds.map(k => SB.sim.hpOf(k, 0) + '/' + SB.sim.hpOf(k, 1)).join(' ') + ')');
  /* the corpus' elites start with that HP and a box ELITE_SIZE_CELLS a side centred on their cell */
  const bad = []; let elites = 0;
  for (const { tag, lv } of featBuilds()) {
    const s = SB.sim.create(lv, {});
    lv.features.enemies.forEach((e, i) => { const en = s.enemies[i]; if (!e.elite) return; elites++; const off = (CS - K.ELITE_SUB) >> 1; if (en.hp !== SB.sim.hpOf(e.kind, 1) || en.x !== (e.idx % 24) * CS + off || en.y !== Math.floor(e.idx / 24) * CS + off) bad.push(tag + ' ' + e.idx); });
  }
  t.ok(elites > 0 && bad.length === 0, elites + ' elites over the corpus start with their HP and a ' + K.ELITE_PX + ' px box centred on their cell' + (bad.length ? ': ' + bad.slice(0, 3).join('; ') : ''));
  /* the pocket's elite: the Walnut seam lab of H-en-1b (its one enemy is the pocket's elite, a moth) */
  const pc = {};
  for (let y = 38; y <= 46; y++) pc[y] = '44' + ([39, 42, 45].includes(y) ? '77777777' : '11111111') + '4'.repeat(14);
  pc[39] = pc[39].slice(0, 16) + '5555' + pc[39].slice(20); pc[40] = pc[40].slice(0, 16) + '3333' + pc[40].slice(20);
  const lv = SB.pipeline.build(labRecord(pc), { biome: 0 }), pk = lv.needsCrop ? null : lv.features.pocket;
  if (!pk || lv.features.enemies.length !== 1) { t.ok(false, 'the pocket lab builds with its elite (' + (lv.needsCrop ? lv.why : lv.features.enemies.length + ' enemies') + ')'); return; }
  const s = SB.sim.create(lv, { immortal: true }), e = s.enemies[0], r = pk.rect, x0 = e.x, y0 = e.y;
  for (let k = 0; k < 120; k++) SB.sim.step(s, 0);
  const slept = e.x === x0 && e.y === y0 && e.stunned === -1;
  s.hero.x = (r[0] + 1) * CS + ((CS - HW) >> 1); s.hero.y = (r[1] + 2) * CS; SB.sim.step(s, 0);
  const woke = e.stunned === 0;
  s.hero.x = 20 * CS; s.hero.y = 30 * CS; s.hero.vx = 0; s.hero.vy = 0;
  let inside = true; for (let k = 0; k < 400; k++) { SB.sim.step(s, 0); if (e.x < r[0] * CS || e.y < r[1] * CS || e.x + K.ELITE_SUB > (r[2] + 1) * CS || e.y + K.ELITE_SUB > (r[3] + 1) * CS) inside = false; }
  t.ok(e.elite === 1 && slept && woke && inside, 'the pocket\'s elite sleeps while the hero is out (' + slept + '), wakes when it enters (' + woke + ') and stays in its hollow while the hero waits far off (' + inside + ')');
  const dp0 = s.room.dp; SB.sim.hurt(s, 0, 99);
  const lab = enemyLab(['', FLOOR], F.MOTH, 30 * 24 + 4), dp1 = lab.s.room.dp; SB.sim.hurt(lab.s, 0, 1);
  t.ok(e.hp === 0 && s.room.dp - dp0 === T.DP_ELITE && lab.s.room.dp - dp1 === T.DP_FODDER && !SB.sim.liveEnemy(lab.s.enemies[0]), 'a kill banks DP_ELITE for an elite (' + (s.room.dp - dp0) + ') and DP_FODDER for fodder (' + (lab.s.room.dp - dp1) + ')');
  /* held (Q81): a frozen moth on the hero neither moves nor hits until its timer runs out */
  const hl = enemyLab(['', FLOOR], F.MOTH, 46 * 24 + 4, { hc: 4, mortal: true }), he = hl.s.enemies[0], hx0 = he.x; he.frozen = 30;
  for (let k = 0; k < 29; k++) SB.sim.step(hl.s, 0);
  const stillHeld = he.x === hx0 && hl.s.hero.hearts === hl.s.hero.heartsMax;
  for (let k = 0; k < 5; k++) SB.sim.step(hl.s, 0);
  t.ok(stillHeld && hl.s.hero.hearts < hl.s.hero.heartsMax, 'a frozen moth on the hero neither moves nor hits for its 30 steps, then hits (held ' + stillHeld + ', hearts ' + hl.s.hero.hearts + ')');
});

/* ================================================================ sprites (T0.17) */
group('H-spr-1', 'every sprite string decodes to its declared size in the key; the hero is 12x16 with an Ink feet row in every frame; Sun belongs to the hero and the beacon only', t => {
  const m = fs.readFileSync(PAGE, 'utf8').match(/\/\* SPRITES BEGIN \*\/([\s\S]*?)\/\* SPRITES END \*\//);
  t.ok(!!m, 'the page holds the SPRITES fence in shell-render');
  if (!m) return;
  let S = null;
  try { S = require('node:vm').runInNewContext(m[1] + '\n;SPRITES'); } catch (e) { t.ok(false, 'the SPRITES literal evaluates (' + e.message + ')'); return; }
  const names = Object.keys(S), SUN = SB.palette.I.SUN.toString(16), INK = SB.palette.I.INK.toString(16);
  t.ok(names.length > 0 && names.length < 40, names.length + ' named sprites (under 40; frames are unlimited)');
  let frames = 0;
  for (const name of names) {
    const sp = S[name];
    for (const [f, str] of Object.entries(sp.frames)) {
      frames++;
      const rows = str.split('/'), bad = [];
      if (rows.length !== sp.h) bad.push(rows.length + ' rows, not ' + sp.h);
      rows.forEach((r, i) => { if (r.length !== sp.w) bad.push('row ' + i + ' is ' + r.length + ' wide'); const c = r.replace(/[.0-9a-f]/g, ''); if (c) bad.push('row ' + i + ' holds ' + JSON.stringify(c)); });
      t.ok(bad.length === 0, name + '.' + f + ' decodes to ' + sp.w + 'x' + sp.h + ', every pixel clear or a palette index' + (bad.length ? ' (' + bad.join('; ') + ')' : ''));
      if (name === 'hero') t.ok(sp.w === K.HERO_W && sp.h === K.HERO_H && rows[sp.h - 1].includes(INK), 'hero.' + f + ' is the hitbox\'s size and its bottom row holds Ink (the feet row, section 7.3)');
      else if (name !== 'beacon') t.ok(!str.includes(SUN), name + '.' + f + ' holds no Sun (the hero\'s colour)');
    }
  }
  console.log('  info  H-spr-1: ' + names.length + ' sprites, ' + frames + ' frames');
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
if (FAST || !flag('all-edges')) console.log('\n' + (FAST ? '--fast: ' : '') + '--all-edges (H-bot-6, the slow gate harness-all) is not run here; --economy arrives in M2');
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
