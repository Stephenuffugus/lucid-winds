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
    'A bare Ash wall: nothing solid but the forced floor row, which is never a landmark (Q58), so no landmarks. No saturated cell and a mean L of 199, so Frost by the bright room rule (Q4). No cell over L 200, so no light. The default spread (DESIGN 6.11) lays two tab stairs: a 3 up stair over 44 rows needs about 15 tabs, so at most 16.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 0 });
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
    'A bright room: Paper, Glare and Ash noise. Otsu splits above 199 and the clamp lowers it to 140, so nothing is solid but the forced floor, and the floor row is never a landmark (Q58): no landmarks. No drop between these three is over 60, so no platforms. Frost (Q4). Repaired by tab stairs as the blank wall is. exitIsLight null: bright cells fill the top rows, so whether the exit lands in a light cluster depends on where the stair tops out, which the design does not fix.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: null, platformsMin: 0, landmarksMin: 0 });
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
    'One Soot block, 12 wide by 30 tall (x 6..17, rows 10..39), on Ash with six open columns either side. Smoothing takes its four corners and nothing else (a rectangle edge cell sees six solids), so exactly one landmark of 360 minus 4 cells (the floor row is never one, Q58). Its open side columns are six wide, too wide for a wall jump chain against the room edge, so the climb is repaired with tabs beside it (never on it, never within a cell of its top).',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 1, giant: { x0, y0, x1, y1 } });
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
    'Six one way planks of width 9 to 20 at varied heights and a 2 wide pillar on the right. Hand listed edges (H-reach-3): S1 (9,42) to S2 (11,39), a 3 up 2 across jump; a wall touch on the pillar from S2 at (19,35..36) (the 2 wide pillar, drawn rows 26..38, smooths to rows 28..36: a two wide column loses two rows at each end); a wall jump off it to S3 (15,32); a straight fall from S6 (5,19) through S5 and S4 onto S1 (5,42). Hand listed non edges: a 5 up; a 4 up 5 across. Above S6 the top rows are empty, so the climb is finished by tabs. Mean L about 190, nothing saturated: Frost (Q4). Landmarks: the pillar (the floor row is never one, Q58).',
    g, { biome: 'frost', needsCrop: false, tabsMax: 12, exitIsLight: false, platformsMin: 6, landmarksMin: 1 });
});

/* ---------------------------------------------------------------- T0.5c: the rest of the synthetic corpus */
/* Each expect is authored from its design; the notes say why. Coordinates are grid A's. */

SYNTH.push(() => {
  const g = grid(C.ASH);
  for (let y = 2; y < H - 1; y += 4) rect(g, 0, y, W - 1, y, C.INK);
  return fixture('stripes-h', 'synthetic',
    'Thin dark horizontal stripes every fourth row on Ash: one row solids that the smoothing erases (a one row run sees at most three solids of nine), leaving a bare wall; but each Ash row above a stripe drops by 188 to the Ink below, and with the stripe open again after smoothing those are full width one way platforms every four rows: a ladder of planks. No landmark: nothing solid survives but the forced floor, and the floor row is never a landmark (Q58). Mean L about 152, nothing saturated: Attic.',
    g, { biome: 'attic', needsCrop: false, tabsMax: 0, exitIsLight: false, platformsMin: 10, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  for (let x = 1; x < W; x += 4) rect(g, x, 0, x, H - 2, C.INK);
  return fixture('stripes-v', 'synthetic',
    'Thin dark vertical stripes every fourth column: one column solids the smoothing erases everywhere (a one wide run sees three of nine), so the room is a bare wall with dark lines in the photo; no drop runs horizontally across three cells (the stripes are one cell), so no platforms. The default spread climbs it. No landmark: nothing solid survives but the forced floor, and the floor row is never a landmark (Q58). Mean L about 151: Attic.',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH), ramp = [C.GLARE, C.PAPER, C.ASH, C.PEWTER, C.SLATE, C.SOOT, C.INK];
  for (let y = 0; y < H; y++) { const k = Math.min(ramp.length - 1, Math.floor(y * ramp.length / H)); rect(g, 0, y, W - 1, y, ramp[k]); }
  return fixture('gradient-v', 'synthetic',
    'A vertical light to dark gradient, Glare at the top to Ink at the bottom in seven bands. Otsu splits the dark bottom bands (Slate, Soot, Ink) from the light ones, so the lower three sevenths are one solid mass with the forced floor; the light upper rooms float over it. The band edges where a drop exceeds 60 (Paper 239 over Ash 199 does not; Ash over Pewter 60 does not; Pewter over Slate 64 does) make one full width surface over solid: the mass\'s top. The hero spawns... nowhere: the standing row is solid. needsCrop (unreachable).',
    g, { biome: 'attic', needsCrop: true, tabsMax: 0, exitIsLight: null, platformsMin: null, landmarksMin: 1 });
});

SYNTH.push(() => {
  const g = grid(C.ASH), ramp = [C.INK, C.SOOT, C.SLATE, C.PEWTER, C.ASH, C.PAPER];
  for (let x = 0; x < W; x++) { const k = Math.floor(x * ramp.length / W); rect(g, x, 0, x, H - 1, ramp[k]); }
  return fixture('gradient-h', 'synthetic',
    'A horizontal dark to light gradient in six bands of four columns: the left eight columns (Ink, Soot) are solid from top to bottom, a wall; the rest open. No horizontal drops, no platforms. The hero spawns in the open right part and climbs by tabs; the dark wall on the left is a long contact surface (wall jumps arrive in T0.12a). Mean L about 128: Attic.',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 1 });
});

for (const [name, p] of [['noise-s1', 0.15], ['noise-s2', 0.35], ['noise-s3', 0.55]]) SYNTH.push(() => {
  const g = grid(C.ASH), r = noise(name);
  for (let y = 0; y < H - 1; y++) for (let x = 0; x < W; x++) if (r() < p) g[y][x] = r() < 0.5 ? C.INK : C.SOOT;
  return fixture(name, 'synthetic',
    'Seeded salt and pepper of Ink and Soot on Ash at ' + Math.round(p * 100) + '% density. ' + (p < 0.3 ? 'Sparse: the smoothing clears almost all of it, a nearly bare wall, climbed by tabs.' : p < 0.5 ? 'Middling: the smoothing leaves scattered blobs, some standable, gaps repaired by tabs.' : 'Dense: the smoothing grows it into a mostly solid mass with open pockets; whether a route exists is not designed, so needsCrop is not asserted here (null) and the corpus count of authored needsCrop stays honest.') + ' Nothing saturated, mean L from about 175 down to 100: ' + (p < 0.2 ? 'Frost (mean L over 170).' : 'Attic.'),
    g, { biome: p < 0.2 ? 'frost' : 'attic', needsCrop: p > 0.5 ? null : false, tabsMax: 16, exitIsLight: false, platformsMin: null, landmarksMin: null });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  for (let row = 4; row < H - 2; row += 3) { const x0 = (row * 7) % 12, x1 = Math.min(W - 1, x0 + 9); rect(g, x0, row - 1, x1, row - 1, C.PAPER); rect(g, x0, row, x1, row, C.PEWTER); }
  return fixture('shelves-b', 'synthetic',
    'A plank every third row (Paper over Pewter, ten wide, staggered): a ladder of one ways three rows apart all the way up, climbable by jumps alone. The top plank is at row 4, so its standing row 3 is inside the exit window (the top four rows, 0..3); the exit stands on it. (First drawn from row 5, whose standing row 4 sits one under the window: repair laid a tab to reach it.) Each plank\'s Pewter row is a one row solid line at the clamped threshold (139 under 140), which the smoothing erases, so each plank is a one way. No landmark: nothing solid survives but the forced floor, and the floor row is never a landmark (Q58). Mean L about 190, nothing saturated: Frost.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 0, exitIsLight: false, platformsMin: 14, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  rect(g, 0, 20, 0, 27, C.SOOT); rect(g, W - 1, 30, W - 1, 37, C.SOOT); rect(g, 10, 14, 12, 40, C.SOOT);
  return fixture('pillars', 'synthetic',
    'Three vertical solid runs: one wide and 8 tall against the left edge (rows 20..27) and against the right edge (rows 30..37), and a 3 wide pillar in the middle (x 10..12, rows 14..40). One wide runs survive the smoothing only at the room\'s edge (an out of bounds neighbour votes like the cell), which is why these two stand on the frame: sticky candidates for Overgrowth and Deep (T1.1). Landmarks: the middle pillar and the floor (the edge runs are 8 cells, so three).',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 3 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  plank(g, 6, 15, 44); plank(g, 8, 17, 41); plank(g, 6, 15, 38); plank(g, 8, 17, 35);
  return fixture('ladder-stack', 'synthetic',
    'Four one ways stacked three rows apart (rows 35, 38, 41, 44, ten wide, offset by two): a ladder zone (DESIGN 6.11: three or more stacked within 3 rows) with its chest at the top in M1. Above it the room is bare and climbed by tabs. No landmark: nothing solid survives but the forced floor, and the floor row is never a landmark (Q58). Frost (mean L about 194, nothing saturated).',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 4, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  rect(g, 9, 18, 12, 21, C.GLARE);
  plank(g, 4, 18, 23);
  return fixture('bright-door', 'synthetic',
    'An Ash wall with one 4x4 Glare block (x 9..12, rows 18..21): the largest bright rectangle, the Darkroom door candidate (M1), with a plank under it (row 23: Paper over Pewter) so standable cells sit in front of its bottom row. The darkest colour present is the plank\'s Pewter (139), and Otsu splitting 139 from the rest lands at the clamp, 140, so the plank\'s lower row is a thin solid line the smoothing erases and the plank is a one way; Ash is open. (First authored on a Pewter wall, which the clamp at 140 makes solid from edge to edge: L 139 is one under the threshold, an unclimbable room.) Mean L about 199, nothing saturated: Frost.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 1, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  for (let y = 30; y < 36; y++) for (let x = 12; x < 18; x++) g[y][x] = ((x + y) & 1) ? C.BRICK : C.PAPER;
  plank(g, 2, 9, 38);
  return fixture('trap-pattern', 'synthetic',
    'A 6x6 two cell repeating pattern (Brick and Paper checks, x 12..17, rows 30..35): the trap field candidate (DESIGN 6.11: a repeating 2 cell pattern at least 4x4), in M1 spikes in Attic. Brick (93) is solid at this room\'s clamped threshold (140), and a checkerboard is a fixed point of the 3x3 majority, so the field\'s inside stays a solid check of single cells joined only at corners: standable tops, no landmark (4 connected components of one cell; DESIGN 6.5). (First authored with Brick open and the floor as a landmark; the clamp and Q58 say otherwise.) A plank at row 38 on the left. Saturated cells 18 of 1152 (under 10%): mean L about 192, Frost.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 1, landmarksMin: 0 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  rect(g, 3, 40, 3, 42, C.BRICK);                         /* 3 cells: fodder */
  rect(g, 16, 30, 17, 33, C.MAGENTA);                     /* 8 cells: an elite */
  rect(g, 6, 14, 9, 16, C.BRICK); rect(g, 7, 17, 8, 17, C.BRICK);   /* 14 cells: a boss candidate */
  plank(g, 2, 8, 44); plank(g, 12, 20, 36); plank(g, 4, 11, 20);
  return fixture('saturated-blobs', 'synthetic',
    'Three saturated clusters of 3, 8 and 14 cells (Brick, Magenta, Brick) on Ash: a fodder spawn, an elite, and in a house run\'s last room the boss (12 or more). At this room\'s clamped threshold (140) Brick and Magenta are solid; two 3x3 majority passes erase any block two wide (the first pass leaves its middle rows, the second a 2x2 that votes itself away), so the 3 and the 8 vanish and only the 14 (four wide) keeps a core: one landmark. (First authored as two; the 8 is two wide.) Three planks. 25 of 1152 saturated (2%): mean L about 193, Frost.',
    g, { biome: 'frost', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 3, landmarksMin: 1 });
});

SYNTH.push(() => {
  const g = grid(C.ASH);
  rect(g, 0, 43, 8, 46, C.SOOT); rect(g, 13, 43, 23, 46, C.SOOT);
  rect(g, 13, 20, 23, 42, C.SOOT);
  return fixture('tight-gap', 'synthetic',
    'A room whose only way up needs a jump the model will not admit on the main ascent: the floor area is two dark blocks with a pit between, and a tall dark mass on the right (x 13..23, rows 20..46) whose top (row 20) is 23 rows above the left block; nothing joins them but tab stairs. Repair must lay a stair from the left block toward the mass (H-route-4, T0.11b). Mean L about 135: Attic.',
    g, { biome: 'attic', needsCrop: false, tabsMax: 16, exitIsLight: false, platformsMin: 0, landmarksMin: 2 });
});

/* ---------------------------------------------------------------- the sample room (grid A only) */
function sampleRoom() {
  const rows = readFileSync(join(GAME, 'tools', 'sample-room.txt'), 'utf8').trim().split('\n');
  return { v: 1, name: 'sample-room', source: 'hand',
    notes: 'The built in sample room, drawn as an attic bedroom (tools/sample-room.txt): the bed bottom left, a walnut bookshelf on the left wall, a desk with a shelf above it right of centre, a tall walnut wardrobe on the right wall with a ledge beside it, a window upper right with a plank sill, wall planks climbing between them, and a ceiling lamp whose shade is the exit. The climb is jumps alone, 3 up and up to 3 across each; the wardrobe wall jump is a shortcut past shelf D; walking off shelf D drops seven rows onto the speck beside the bookshelf; a second speck waits on shelf F at row 20. 141 cells in the Attic band (12% saturated), so never Frost. Landmarks: the wardrobe, the bookshelf and the bed (the floor row is never one, Q58). No index 15, no repair.',
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
