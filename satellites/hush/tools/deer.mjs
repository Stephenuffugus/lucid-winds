#!/usr/bin/env node
/* Writes satellites/hush/sprites.js (plans/hush/HANDOFF-HUSH.md 3.8, 3.9, 3.10 and section 7): the deer, the hare and the fox at
 * six tiers in four poses, each rasterised from one drawing in a unit box so every tier and pose is the same creature, then written
 * out as LITERAL rows (the lint's law 8 reads the file, and a row built at run time would fail it). Run it again after changing a
 * drawing; never edit the creature rows in sprites.js by hand.
 *
 *   node tools/deer.mjs
 *
 * Every creature is in profile facing left in a unit box. Poses move only the head, the neck and the ears, all drawn left of x 0.4;
 * the body, the legs and the tail lie right of it and are the same in every pose of a tier (the art gate's H3 law, 3.9):
 *   graze (head down at the grass, the go pose), up (head high, the no-go at similarity 0), half (head level, similarity 0.5),
 *   ear (head down, one ear raised, similarity 1). A raised head catches the low sun: in up and half the head and neck are drawn in
 *   the sunlit fur colour, gold and brighter, never red; in ear only the raised ear is.
 * The three species share the palette's coat indices 4, 5 and 6 (the dark, the coat, the belly); COATS swaps those three for each
 * species at draw time (render.js), so the table stays sixteen colours.
 * Detail by tier (information, not size): 0 a one colour silhouette; 1 the back shaded; 2 the belly light and the legs dark;
 * 3 the eye and the inside of the ear; 4 the white tail or tail tip, the nose and the markings; 5 the eye's highlight, the breath
 * in the cold air and the feet.
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
  '#5a3b24', /* 4 coat, the back and the dark (the deer's; COATS swaps it per species) */
  '#8a5c36', /* 5 coat (the deer's) */
  '#caa27a', /* 6 coat, the belly and the ear's inside (the deer's) */
  '#f0cf86', /* 7 sunlit fur, the raised head (gold, never red) */
  '#231a14', /* 8 the eye, the nose, the feet */
  '#fbf7ee', /* 9 white: the tail, the eye's light, spots */
  '#dfe6ea', /* a breath in the cold air */
  '#7d8084', /* b the stone */
  '#a9acae', /* c the stone's top */
  '#f6c979', /* d the low sun */
  '#2b2a26', /* e ink */
  '#e7dcc6'  /* f a door's face */
];

/* each species' dark, coat and belly, in place of indices 4, 5 and 6; the fox is russet and the hare grey brown, and none is red
   (the fox's coat's hue sits at about 23 degrees, outside 345 to 15) */
export const COATS = {
  deer: ['#5a3b24', '#8a5c36', '#caa27a'],
  hare: ['#5b4c3b', '#8c7a62', '#d9cbb3'],
  fox: ['#6e3a1c', '#b8672e', '#efe2cf']
};
export const SPECIES = ['deer', 'hare', 'fox'];
export const TIER_SIZES = [12, 16, 20, 24, 32, 40];
const POSES = ['graze', 'up', 'half', 'ear'];

/* the shape of each species in the unit box */
const BODY = {
  /* ⛔ the deer's first up head stood at 0.2 and its neck read as a llama's; the head sits close over the shoulder now */
  deer: { head: { graze: [0.22, 0.82], up: [0.25, 0.27], half: [0.2, 0.45], ear: [0.22, 0.82] }, body: [0.6, 0.52, 0.26, 0.17],
    shoulder: [0.38, 0.47], headR: [0.085, 0.06], muzzle: [0.08, 0.045, 0.035], legs: [[0.44, 0.74], [0.42, 0.52, 0.68, 0.8]], legTop: 0.62,
    tail: [0.86, 0.44, 0.04, 0.05], spots: [[0.56, 0.45], [0.64, 0.43], [0.72, 0.46]], ear: { lie: 0.05, up: 0.07, twitch: 0.11, spread: 0.1 }, neckW: 0.05 },
  /* a hare crouched low: a round body sitting on the grass, a coat coloured haunch over a long dark hind foot, short front legs, a
     white scut, long ears, and almost no neck.
     ⛔ the first hare had the deer's long thin neck (its up pose read as a small deer), its hind leg was a dark disc that read as
     a wheel, and its front legs were two long sticks */
  /* ⛔ the second hare's alert ears overlapped into one tall bar over the neck (a pole), and its long foot lay apart from the
     haunch like a stick on the grass: the ears spread to 0.09 and the haunch reaches down over the foot */
  hare: { head: { graze: [0.3, 0.8], up: [0.33, 0.5], half: [0.3, 0.62], ear: [0.3, 0.8] }, body: [0.62, 0.68, 0.25, 0.17],
    shoulder: [0.42, 0.64], headR: [0.085, 0.07], muzzle: [0.06, 0.04, 0.035], legs: [[0.46], [0.44, 0.5]], legTop: 0.8,
    haunch: [0.73, 0.76, 0.13, 0.14], foot: [0.6, 0.86, 0.88, 0.94], tail: [0.88, 0.62, 0.045, 0.045], spots: [],
    ear: { lie: 0.16, up: 0.2, twitch: 0.22, spread: 0.09 }, neckW: 0.075 },
  /* a fox: a long low body close over short dark legs, a thick neck, a big brush with a white tip, a pointed muzzle, ears close.
     ⛔ the first fox stood on four long legs in a picket row (a deer, or a table), its brush was a stub, and its two diverging
     ears in the up pose read as antlers (the deer's old scar) */
  /* ⛔ the second fox's brush was as tall as its body and the two read as one long bar, its legs still stood long, and its alert
     neck read as a llama's at the near tiers: the body sits lower, the brush droops below it, and the alert head is lower */
  fox: { head: { graze: [0.22, 0.84], up: [0.25, 0.5], half: [0.2, 0.62], ear: [0.22, 0.84] }, body: [0.56, 0.68, 0.24, 0.12],
    shoulder: [0.38, 0.66], headR: [0.08, 0.06], muzzle: [0.1, 0.03, 0.025], legs: [[0.44, 0.68], [0.42, 0.5, 0.64, 0.72]], legTop: 0.76,
    brush: [0.85, 0.77, 0.14, 0.09], tail: [0.97, 0.82, 0.035, 0.04], spots: [], ear: { lie: 0.06, up: 0.07, twitch: 0.09, spread: 0.06 }, neckW: 0.08 }
};

function draw(species, N, tier, pose) {
  const S = BODY[species];
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
  const [hx, hy] = S.head[pose];
  const minW = 0.6 / N;
  const [bx, by, brx, bry] = S.body;

  /* the body, the legs and the tail: the same in every pose, all at x 0.4 or right of it */
  each((u, v, x, y) => {
    /* ⛔ the body was clipped at x 0.4 and every species' chest showed a flat vertical cut; only the head, the neck and the ears need
       to stay left of 0.4, and they are drawn over the body in every pose */
    if (inEllipse(u, v, bx, by, brx, bry)) put(x, y, tier >= 1 && v < by - bry * 0.35 ? '4' : tier >= 2 && v > by + bry * 0.45 ? '6' : '5');
  });
  if (S.haunch) each((u, v, x, y) => { if (u >= 0.4 && inEllipse(u, v, S.haunch[0], S.haunch[1], S.haunch[2], S.haunch[3])) put(x, y, tier >= 1 && v < S.haunch[1] - S.haunch[3] * 0.4 ? '4' : '5'); });
  if (S.foot) each((u, v, x, y) => { if (u >= S.foot[0] && u <= S.foot[2] && v >= S.foot[1] && v <= S.foot[3]) put(x, y, tier >= 2 ? '4' : '5'); });
  if (S.brush) each((u, v, x, y) => { if (u >= 0.4 && inEllipse(u, v, S.brush[0], S.brush[1], S.brush[2], S.brush[3])) put(x, y, tier >= 1 ? '5' : '5'); });
  /* legs as whole pixel columns: ⛔ legs measured in the unit box merged into one block at 12 to 20 px and the deer read as a
     stool, so the two far tiers draw a leg a pair, and the rest one or two pixels wide */
  const legW = N >= 32 ? 2 : 1;
  for (const lx of tier <= 1 ? S.legs[0] : S.legs[1]) {
    const col = Math.max(Math.floor(0.4 * N), Math.floor(lx * N)), top = Math.floor(S.legTop * N), foot = Math.floor(0.94 * N);
    for (let y = top; y <= foot; y++) for (let k = 0; k < legW; k++) put(col + k, y, tier >= 2 ? '4' : '5');
    if (tier >= 5) for (let k = 0; k < legW; k++) put(col + k, foot, '8');
  }
  each((u, v, x, y) => { if (u >= 0.4 && inEllipse(u, v, S.tail[0], S.tail[1], S.tail[2], S.tail[3])) put(x, y, tier >= 4 ? '9' : tier >= 1 ? '4' : '5'); });
  if (tier >= 4) for (const [sx, sy] of S.spots) { const [px, py] = at(sx, sy); put(px, py, '9'); }

  /* the neck and the head: they move with the pose, all left of x 0.4 */
  each((u, v, x, y) => { if (u < 0.4 && nearSegment(u, v, S.shoulder[0], S.shoulder[1], hx + 0.05, hy, Math.max(S.neckW, minW))) put(x, y, fur); });
  each((u, v, x, y) => {
    if (u < 0.4 && (inEllipse(u, v, hx, hy, S.headR[0], S.headR[1]) || inEllipse(u, v, hx - S.muzzle[0], hy + 0.02, S.muzzle[1], S.muzzle[2]))) put(x, y, fur);
  });
  /* the ears: lying back while grazing, up and apart when alert, one tall in the ear twitch */
  /* ⛔ the deer's raised ears at 0.1 read as antlers */
  const earTall = pose === 'ear' ? S.ear.twitch : lifted ? S.ear.up : S.ear.lie;
  /* the spread scales the alert ears apart: at the deer's 0.1 they stand exactly where the deer's always did; the lying ear is never
     shorter than the deer's */
  const k = S.ear.spread / 0.1;
  const ears = pose === 'graze' ? [[hx + 0.07, hy - 0.05, hx + 0.07 + Math.max(0.06, earTall * 0.9), hy - 0.05 - Math.max(0.03, earTall * 0.5)]] :
    pose === 'ear' ? [[hx + 0.05, hy - 0.05, hx + 0.08, hy - 0.05 - earTall]] :
      [[hx + 0.03, hy - 0.05, hx + 0.03 - 0.03 * k, hy - 0.05 - earTall], [hx + 0.03 + 0.04 * k, hy - 0.05, hx + 0.03 + 0.07 * k, hy - 0.05 - earTall]];
  for (const [ax, ay, ex, ey] of ears) {
    each((u, v, x, y) => {
      if (u < 0.4 && nearSegment(u, v, ax, ay, ex, ey, Math.max(0.025, minW))) put(x, y, pose === 'ear' ? '7' : tier >= 3 && nearSegment(u, v, ax, ay, ex, ey, 0.012) ? '6' : fur);
    });
  }
  if (tier >= 3) { const [ex, ey] = at(hx + 0.01, hy - 0.015); put(ex, ey, '8'); if (tier >= 5) put(ex + 1, ey - 1 >= 0 ? ey - 1 : ey, '9'); }
  if (tier >= 4) { const [nx, ny] = at(hx - S.muzzle[0] - 0.04, hy + 0.02); put(nx, ny, '8'); }
  /* the breath: ⛔ one pixel floated like a speck of dust, so it is a small cloud of three touching the muzzle's front */
  if (tier >= 5 && pose !== 'graze' && pose !== 'ear') { const [px, py] = at(hx - S.muzzle[0] - 0.06, hy + 0.01); for (const [dx, dy] of [[0, 0], [-1, 0], [-1, -1]]) put(px + dx, py + dy, 'a'); }
  return g.map(row => row.join(''));
}

const SPRITES = {};
for (const species of SPECIES) TIER_SIZES.forEach((N, tier) => { for (const pose of POSES) SPRITES[species + tier + pose] = draw(species, N, tier, pose); });
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
   arms up. Drawn by hand, not from the creatures' drawing. */
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
lines.push('/* HUSH\'s sprites (plans/hush/HANDOFF-HUSH.md 3.8, 3.9, 3.10 and section 7). WRITTEN BY tools/deer.mjs: change a drawing there and');
lines.push('   run it again; never edit the creature rows here by hand. A sprite is rows of equal width; \'.\' is nothing, a hex digit is a');
lines.push('   PALETTE index. tools/lint.mjs holds that. COATS swaps indices 4, 5 and 6 for each species. Painted sheets are Stephen\'s, later. */');
lines.push('export const PALETTE = Object.freeze([');
PALETTE.forEach((c, i) => lines.push('  \'' + c + '\'' + (i < PALETTE.length - 1 ? ',' : '')));
lines.push(']);');
lines.push('');
lines.push('export const COATS = Object.freeze({');
SPECIES.forEach((sp, i) => lines.push('  ' + sp + ': Object.freeze([' + COATS[sp].map(c => '\'' + c + '\'').join(', ') + '])' + (i < SPECIES.length - 1 ? ',' : '')));
lines.push('});');
lines.push('export const SPECIES = Object.freeze([' + SPECIES.map(s => '\'' + s + '\'').join(', ') + ']);');
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
