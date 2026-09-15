#!/usr/bin/env node
/* Writes satellites/hush/sprites.js (plans/hush/HANDOFF-HUSH.md 3.8, 3.9 and section 7): the deer at six tiers in four poses,
 * rasterised from one drawing in a unit box so every tier and pose is the same creature, then written out as LITERAL rows (the
 * lint's law 8 reads the file, and a row built at run time would fail it). Run it again after changing the drawing; never edit
 * the deer rows in sprites.js by hand.
 *
 *   node tools/deer.mjs
 *
 * The drawing, in a unit box, the deer in profile facing left:
 *   body an ellipse; four legs; a tail; a neck from the shoulder to the head; the head an ellipse with a muzzle; two ears.
 *   Poses move only the head, the neck and the ears (everything right of x 0.4 is the same in every pose of a tier, the art
 *   gate's H3 law): graze (head down at the grass, the go pose), up (head high, the no-go at similarity 0), half (head level,
 *   similarity 0.5), ear (head down, one ear raised, similarity 1).
 *   A raised head catches the low sun: in up and half the head and neck are drawn in the sunlit fur colour, which is brighter
 *   and gold, never red (3.9); in ear only the raised ear is.
 * Detail by tier (information, not size): 0 a one colour silhouette; 1 the back shaded; 2 the belly light and the legs dark;
 * 3 the eye and the inside of the ear; 4 the white tail, the nose and three spots; 5 the eye's highlight, the breath in the
 * cold air and the hooves.
 */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HUSH = join(dirname(fileURLToPath(import.meta.url)), '..');

export const PALETTE = [
  '#f3e3c6', /* 0 dawn sky */
  '#9bb08a', /* 1 far trees in the mist */
  '#5f7d4a', /* 2 grass */
  '#86a45f', /* 3 grass in the light */
  '#5a3b24', /* 4 deer, the back and the dark */
  '#8a5c36', /* 5 deer, the coat */
  '#caa27a', /* 6 deer, the belly and the ear's inside */
  '#f0cf86', /* 7 sunlit fur, the raised head (gold, never red) */
  '#231a14', /* 8 the eye, the nose, the hooves */
  '#fbf7ee', /* 9 white: the tail, the eye's light, spots */
  '#dfe6ea', /* a breath in the cold air */
  '#7d8084', /* b the stone */
  '#a9acae', /* c the stone's top */
  '#f6c979', /* d the low sun */
  '#2b2a26', /* e ink */
  '#e7dcc6'  /* f a door's face */
];

export const TIER_SIZES = [12, 16, 20, 24, 32, 40];
const POSES = ['graze', 'up', 'half', 'ear'];
/* ⛔ the first drawing's up head stood at 0.2 and its neck read as a llama's; the head sits close over the shoulder now */
const HEAD = { graze: [0.22, 0.82], up: [0.25, 0.27], half: [0.2, 0.45], ear: [0.22, 0.82] };

function draw(N, tier, pose) {
  const g = Array.from({ length: N }, () => Array(N).fill('.'));
  const at = (x, y) => [Math.floor(x * N), Math.floor(y * N)];
  const put = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) g[y][x] = c; };
  const each = fn => { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) fn((x + 0.5) / N, (y + 0.5) / N, x, y); };
  const inEllipse = (u, v, cx, cy, rx, ry) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
  const nearSegment = (u, v, ax, ay, bx, by, w) => {
    const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((u - ax) * dx + (v - ay) * dy) / (dx * dx + dy * dy)));
    return Math.hypot(u - (ax + t * dx), v - (ay + t * dy)) <= w;
  };
  const lifted = pose === 'up' || pose === 'half';
  const fur = lifted ? '7' : '5';
  const [hx, hy] = HEAD[pose];
  const minW = 0.6 / N;

  /* the body, the legs and the tail: the same in every pose */
  each((u, v, x, y) => {
    if (inEllipse(u, v, 0.6, 0.52, 0.26, 0.17)) put(x, y, tier >= 1 && v < 0.46 ? '4' : tier >= 2 && v > 0.59 ? '6' : '5');
  });
  /* legs as whole pixel columns: ⛔ legs measured in the unit box merged into one block at 12 to 20 px and the deer read as a
     stool, so the two far tiers draw a leg a pair, and the rest one or two pixels wide */
  const legW = N >= 32 ? 2 : 1;
  /* ⛔ back legs at 0.7 and 0.78 fell in neighbouring columns at 20 and 24 px and merged; these four never touch */
  for (const lx of tier <= 1 ? [0.44, 0.74] : [0.42, 0.52, 0.68, 0.8]) {
    const col = Math.floor(lx * N), top = Math.floor(0.62 * N), foot = Math.floor(0.94 * N);
    for (let y = top; y <= foot; y++) for (let k = 0; k < legW; k++) put(col + k, y, tier >= 2 ? '4' : '5');
    if (tier >= 5) for (let k = 0; k < legW; k++) put(col + k, foot, '8');
  }
  each((u, v, x, y) => { if (inEllipse(u, v, 0.86, 0.44, 0.04, 0.05)) put(x, y, tier >= 4 ? '9' : tier >= 1 ? '4' : '5'); });
  if (tier >= 4) for (const [sx, sy] of [[0.56, 0.45], [0.64, 0.43], [0.72, 0.46]]) { const [px, py] = at(sx, sy); put(px, py, '9'); }

  /* the neck and the head: they move with the pose */
  each((u, v, x, y) => { if (u < 0.4 && nearSegment(u, v, 0.38, 0.47, hx + 0.05, hy, Math.max(0.05, minW))) put(x, y, fur); });
  each((u, v, x, y) => {
    if (u < 0.4 && (inEllipse(u, v, hx, hy, 0.085, 0.06) || inEllipse(u, v, hx - 0.08, hy + 0.02, 0.045, 0.035))) put(x, y, fur);
  });
  /* the ears: lying back while grazing, up and apart when alert, one tall in the ear twitch */
  /* ⛔ raised ears at 0.1 read as antlers */
  const earTall = pose === 'ear' ? 0.11 : lifted ? 0.07 : 0.05;
  const ears = pose === 'graze' ? [[hx + 0.07, hy - 0.05, hx + 0.13, hy - 0.08]] :
    pose === 'ear' ? [[hx + 0.05, hy - 0.05, hx + 0.08, hy - 0.05 - earTall]] :
      [[hx + 0.03, hy - 0.05, hx + 0.0, hy - 0.05 - earTall], [hx + 0.07, hy - 0.05, hx + 0.1, hy - 0.05 - earTall]];
  for (const [ax, ay, bx, by] of ears) {
    each((u, v, x, y) => {
      if (u < 0.4 && nearSegment(u, v, ax, ay, bx, by, Math.max(0.025, minW))) put(x, y, pose === 'ear' ? '7' : tier >= 3 && nearSegment(u, v, ax, ay, bx, by, 0.012) ? '6' : fur);
    });
  }
  if (tier >= 3) { const [ex, ey] = at(hx + 0.01, hy - 0.015); put(ex, ey, '8'); if (tier >= 5) put(ex + 1, ey - 1 >= 0 ? ey - 1 : ey, '9'); }
  if (tier >= 4) { const [nx, ny] = at(hx - 0.12, hy + 0.02); put(nx, ny, '8'); }
  /* the breath: ⛔ one pixel floated like a speck of dust, so it is a small cloud of three touching the muzzle's front */
  if (tier >= 5 && pose !== 'graze' && pose !== 'ear') { const [px, py] = at(hx - 0.14, hy + 0.01); for (const [dx, dy] of [[0, 0], [-1, 0], [-1, -1]]) put(px + dx, py + dy, 'a'); }
  return g.map(row => row.join(''));
}

const SPRITES = {};
TIER_SIZES.forEach((N, tier) => { for (const pose of POSES) SPRITES['deer' + tier + pose] = draw(N, tier, pose); });
SPRITES.stone = [
  '....cccccc....',
  '..cccccccccc..',
  '.bccccccccccb.',
  'bbbbccccccbbbb',
  'bbbbbbbbbbbbbb',
  '.bbbbbbbbbbbb.',
  '...bbbbbbbb...'
];
/* the picture fork (3.4): a hare mid bound for Quick, a heron standing still for Careful; and SIMON's door, a figure with its
   arms up. Drawn by hand, not from the deer's drawing. */
SPRITES.hare = [
  '................',
  '...55...........',
  '...565..........',
  '....55..........',
  '...5555.........',
  '..58555555......',
  '.5555555555.....',
  '...55555555559..',
  '.....5566555599.',
  '..555.....55....',
  '.55.........55..',
  '5............5..'
];
SPRITES.heron = [
  '.....cc.....',
  '....c8cdd...',
  '.....cc.....',
  '.....c......',
  '....cc......',
  '....cbb.....',
  '...cbbbb....',
  '...cbbbbb...',
  '....bbbbbb..',
  '.....bbb..b.',
  '......e.....',
  '......e.....',
  '......e.....',
  '......e.....',
  '.....ee.....',
  '....e..e....'
];
SPRITES.figure = [
  '.....55.....',
  '.e...55...e.',
  '.e...55...e.',
  '..e.eeee.e..',
  '...eeeeee...',
  '.....ee.....',
  '.....ee.....',
  '.....ee.....',
  '....eeee....',
  '....e..e....',
  '....e..e....',
  '...e....e...',
  '...e....e...',
  '..ee....ee..'
];
SPRITES.tuft = [
  '..3.....3.',
  '.23..3..32',
  '.2232.3222',
  '2222222222'
];

const lines = [];
lines.push('/* HUSH\'s sprites (plans/hush/HANDOFF-HUSH.md 3.8, 3.9 and section 7). WRITTEN BY tools/deer.mjs: change the drawing there and run');
lines.push('   it again; never edit the deer rows here by hand. A sprite is rows of equal width; \'.\' is nothing, a hex digit is a PALETTE');
lines.push('   index. tools/lint.mjs holds that. Painted sheets are Stephen\'s, later. */');
lines.push('export const PALETTE = Object.freeze([');
PALETTE.forEach((c, i) => lines.push('  \'' + c + '\'' + (i < PALETTE.length - 1 ? ',' : '')));
lines.push(']);');
lines.push('');
lines.push('export const TIER_SIZES = Object.freeze([' + TIER_SIZES.join(', ') + ']);');
lines.push('export const POSES = Object.freeze([' + POSES.map(p => '\'' + p + '\'').join(', ') + ']);');
lines.push('');
lines.push('export const SPRITES = Object.freeze({');
const names = Object.keys(SPRITES);
names.forEach((name, k) => {
  lines.push('  ' + name + ': Object.freeze([');
  SPRITES[name].forEach((row, i) => lines.push('    \'' + row + '\'' + (i < SPRITES[name].length - 1 ? ',' : '')));
  lines.push('  ])' + (k < names.length - 1 ? ',' : ''));
});
lines.push('});');
writeFileSync(join(HUSH, 'sprites.js'), lines.join('\n') + '\n');
console.log('sprites.js written: ' + names.length + ' sprites');
