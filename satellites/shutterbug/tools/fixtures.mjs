#!/usr/bin/env node
/* The fixture corpus (BUILD-PLAN.md T0.5 and T0.5c, section 2.7). Deterministic: every synthetic fixture is drawn
 * from its name (FNV-1a of the name seeds any noise), so a second run changes nothing.
 *
 *   node tools/fixtures.mjs               writes fixtures/sample-room.json and fixtures/synthetic/*.json (grid A, 24x48)
 *   node tools/fixtures.mjs --preset B    writes the synthetic set for the 36x64 fallback to fixtures/synthetic-b/
 *                                         (the sample room is authored for A only; QUESTIONS Q43)
 *
 * Every `expect` below is written by the fixture's author FROM ITS DESIGN, never by running the pipeline (law 2
 * applied to the corpus): the reasoning sits in each fixture's notes. A null expectation means "not asserted for
 * this fixture" and says why in the notes. Photos never enter the repo: Stephen's rooms arrive as JSON from
 * fixtures/make.html (T0.5b) into fixtures/rooms/. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const GAME = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const PRESET = args.includes('--preset') ? args[args.indexOf('--preset') + 1] : 'A';
const SIZE = { A: [24, 48], B: [36, 64] }[PRESET];
if (!SIZE) { console.error('preset A or B'); process.exit(2); }
const [W, H] = SIZE;
const C = { INK: 0, SOOT: 1, SLATE: 2, PEWTER: 3, ASH: 4, PAPER: 5, GLARE: 6, WALNUT: 7, AMBER: 8, BRICK: 9, MAGENTA: 10, LAPIS: 11, TEAL: 12, MOSS: 13, SUN: 14 };

/* noise from the name: FNV-1a 32 of the name seeds an xorshift32 */
function noise(name) {
  let h = 0x811c9dc5;
  for (const c of Buffer.from(name)) { h ^= c; h = Math.imul(h, 16777619) >>> 0; }
  let x = h || 1;
  return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; };
}
const grid = fill => Array.from({ length: H }, () => Array(W).fill(fill));
const rect = (g, x0, y0, x1, y1, c) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) g[y][x] = c; };
/* a one way plank: a lit top row over its shadow; the drop 239 -> 139 is over EDGE_DROP_L, so the shadow row's top
   edge is a surface, and with open cells under it a floating one way (DESIGN 6.4) */
const plank = (g, x0, x1, row) => { rect(g, x0, row - 1, x1, row - 1, C.PAPER); rect(g, x0, row, x1, row, C.PEWTER); };
const sx = f => Math.round(f * (W / 24)), sy = f => Math.round(f * (H / 48));   /* A's coordinates, scaled for B */
const toRows = g => g.map(r => r.map(v => v.toString(16)).join(''));
const fixture = (name, source, notes, g, expect) => ({ v: 1, name, source, notes,
  record: { v: 1, w: W, h: H, mode: 0, focal: null, rows: toRows(g), rows2: null }, expect });

const SYNTH = [];

SYNTH.push(() => {
  const g = grid(C.ASH);
  return fixture('blank-wall', 'synthetic',
    'A bare Ash wall: nothing solid but the forced floor (one landmark, the floor row). No saturated cell and a mean L of 199, so Frost by the bright room rule (Q4). No cell over L 200, so no light. The default spread (DESIGN 6.11) lays two tab stairs: a 3 up stair over 44 rows needs about 15 tabs, so at most 16.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 1 });
});

SYNTH.push(() => {
  const g = grid(C.SOOT), r = noise('all-dark');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) g[y][x] = r() < 0.5 ? C.INK : C.SOOT;
  rect(g, 0, H - sy(8), W - 1, H - 2, C.SLATE);              /* a dim floor area, rows 40..46 */
  rect(g, 0, H - 1, W - 1, H - 1, C.SOOT);
  return fixture('all-dark', 'synthetic',
    'A dark room: Ink and Soot noise above, a dim Slate floor area in the bottom seven rows. Otsu splits Ink and Soot from Slate at 29 and the clamp raises it to 70 (H-pipe-3, OTSU_UNCLAMPED), so the Slate rows are open and stand (spawn exists) and everything above is one solid mass with only the forced top row open over it. Nothing joins the floor area to the top: repair cannot put a tab in a solid cell, so needsCrop.',
    g, { biome: 'attic', needsCrop: true, tabsMax: 0, exitIsLight: false, platformsMin: 0, landmarksMin: 1 });
});

SYNTH.push(() => {
  const g = grid(C.ASH), r = noise('all-light');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = r(); g[y][x] = v < 0.4 ? C.PAPER : v < 0.7 ? C.GLARE : C.ASH; }
  return fixture('all-light', 'synthetic',
    'A bright room: Paper, Glare and Ash noise. Otsu splits above 199 and the clamp lowers it to 140, so nothing is solid but the forced floor. No drop between these three is over 60, so no platforms. Frost (Q4). Repaired by tab stairs as the blank wall is. exitIsLight null: bright cells fill the top rows, so whether the exit lands in a light cluster depends on where the stair tops out, which the design does not fix.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: null, platformsMin: 0, landmarksMin: 1 });
});

SYNTH.push(() => {
  const g = grid(C.PAPER), r = noise('checkerboard');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let v = (x + y) & 1; if (r() < 0.10) v ^= 1; g[y][x] = v ? C.INK : C.PAPER; }
  return fixture('checkerboard', 'synthetic',
    'A photographed checkerboard: one cell squares of Ink and Paper with 10% of cells flipped by noise. A PERFECT one cell checkerboard is a fixed point of the 3x3 majority rule (each cell sees itself and its four diagonals, five of nine, measured 2026-10-30: 95.8% isolated after any number of passes), so it could never satisfy H-pipe-2; the noisy one is what the rule smooths (measured on the family: about 15 to 25% isolated after one pass, 4 to 7% after two), which is what CA_ONE_PASS must fail. Mean L about 125 and nothing saturated: Attic. What survives is scattered small blobs; platform and landmark counts are not designed, so null; a climb by blobs or tabs.',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: null, landmarksMin: null });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  const x0 = sx(6), x1 = sx(17), y0 = sy(10), y1 = sy(39);
  rect(g, x0, y0, x1, y1, C.SOOT);
  return fixture('one-giant-landmark', 'synthetic',
    'One Soot block, 12 wide by 30 tall (x 6..17, rows 10..39), on Ash with six open columns either side. Smoothing takes its four corners and nothing else (a rectangle edge cell sees six solids), so exactly one landmark of 360 minus 4 cells, plus the floor. Its open side columns are six wide, too wide for a wall jump chain against the room edge, so the climb is repaired with tabs beside it (never on it, never within a cell of its top).',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 2, giant: { x0, y0, x1, y1 } });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  rect(g, 0, H - 1, W - 1, H - 1, C.SOOT);
  plank(g, 0, sx(9), sy(43));         /* S1 10 wide, stand row 42 */
  plank(g, sx(11), sx(19), sy(40));   /* S2  9 wide, stand row 39: from S1's end a 3 up, 2 across jump */
  rect(g, sx(20), sy(26), sx(21), sy(38), C.SOOT);   /* the right pillar, 2 wide by 13 tall */
  plank(g, sx(8), sx(16), sy(33));    /* S3  9 wide, stand row 32: off the pillar by a wall jump from S2 */
  plank(g, 0, sx(14), sy(29));        /* S4 15 wide */
  plank(g, sx(3), sx(22), sy(25));    /* S5 20 wide */
  plank(g, 0, sx(11), sy(20));        /* S6 12 wide: a straight drop at x 5 falls through S5 and S4 onto S1 */
  return fixture('shelves-a', 'synthetic',
    'Six one way planks of width 9 to 20 at varied heights and a 2 wide pillar on the right. Hand listed edges (H-reach-3): S1 (9,42) to S2 (11,39), a 3 up 2 across jump; a wall touch on the pillar from S2 at (19,35..38); a wall jump off it to S3 (15,32); a straight fall from S6 (5,19) through S5 and S4 onto S1 (5,42). Hand listed non edges: a 5 up; a 4 up 5 across. Above S6 the top rows are empty, so the climb is finished by tabs. Mean L about 190, nothing saturated: Frost (Q4). Landmarks: the floor and the pillar.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 12, exitIsLight: false, platformsMin: 6, landmarksMin: 2 });
});

/* ---------------------------------------------------------------- the sample room (grid A only) */
function sampleRoom() {
  const rows = readFileSync(join(GAME, 'tools', 'sample-room.txt'), 'utf8').trim().split('\n');
  return { v: 1, name: 'sample-room', source: 'hand',
    notes: 'The built in sample room, drawn as an attic bedroom (tools/sample-room.txt): the bed bottom left, a walnut bookshelf on the left wall, a desk with a shelf above it right of centre, a tall walnut wardrobe on the right wall with a ledge beside it, a window upper right with a plank sill, wall planks climbing between them, and a ceiling lamp whose shade is the exit. The climb is jumps alone, 3 up and up to 3 across each; the wardrobe wall jump is a shortcut past shelf D; walking off shelf D drops seven rows onto the speck beside the bookshelf; a second speck waits on shelf F at row 20. 141 cells in the Attic band (12% saturated), so never Frost. No index 15, no repair.',
    record: { v: 1, w: 24, h: 48, mode: 0, focal: null, rows, rows2: null },
    expect: { biome: 'attic', needsCrop: false, tabsMax: 0, exitIsLight: true, platformsMin: 14, landmarksMin: 3,
      beats: [
        { kind: 'JUMP', from: [8, 46], to: [5, 44], why: 'the forgiving jump onto the bed, a photo landmark (2 up)' },
        { kind: 'WALLJUMP', from: [16, 29], contact: [18, 26], to: [14, 23], why: 'off the desk shelf, touch the wardrobe, wall jump to shelf E, skipping shelf D (6 rows up)' },
        { kind: 'FALL', from: [6, 26], to: [4, 33], why: 'walk off shelf D and drop seven rows onto the speck beside the bookshelf' },
        { kind: 'SPECK', at: [8, 20], why: 'the reward above: a Sun speck on shelf F, row 20' }
      ] } };
}

/* ---------------------------------------------------------------- write */
const stable = o => JSON.stringify(o, null, 2) + '\n';
const outDir = join(GAME, 'fixtures', PRESET === 'A' ? 'synthetic' : 'synthetic-b');
mkdirSync(outDir, { recursive: true });
let written = 0, unchanged = 0;
const put = (path, obj) => {
  const s = stable(obj);
  let old = null; try { old = readFileSync(path, 'utf8'); } catch (e) { /* new */ }
  if (old === s) { unchanged++; return; }
  writeFileSync(path, s); written++;
};
if (PRESET === 'A') put(join(GAME, 'fixtures', 'sample-room.json'), sampleRoom());
for (const make of SYNTH) { const f = make(); put(join(outDir, f.name + '.json'), f); }
console.log('fixtures: ' + (written + unchanged) + ' files (' + written + ' written, ' + unchanged + ' unchanged), grid ' + W + 'x' + H);
