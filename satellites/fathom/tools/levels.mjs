#!/usr/bin/env node
/* The five campaign caves, authored as shapes and rendered to the ASCII grids
 * that live in DATA inside index.html.
 *
 *   node tools/levels.mjs --emit     print the LEVELS block for index.html
 *   node tools/levels.mjs --check    assert the block in index.html still matches
 *
 * WHY A TOOL AND NOT TYPING. A cave is 50 rows of 30 characters. Five of them by
 * hand is 7500 keystrokes where one wrong character is a wall in a doorway that
 * no gate would name. The shapes below are the authored thing; the ASCII is
 * their rendering, pasted into the page so the game still has no build step, and
 * the `levels` gate re-renders and diffs so the two can never drift.
 *
 * Legend (HANDOFF-FATHOM 3.6): # wall, . water, S start, X exit crystal,
 * o stone cache, p pearl, L lurker spawn.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const W = 30, H = 50;

function blank() {
  const g = [];
  for (let y = 0; y < H; y++) g.push(new Array(W).fill('#'));
  return g;
}
const carve = (g, x0, y0, x1, y1) => {
  for (let y = Math.max(0, y0); y <= Math.min(H - 1, y1); y++)
    for (let x = Math.max(0, x0); x <= Math.min(W - 1, x1); x++) g[y][x] = '.';
};
/* a corridor of half width r around the straight run from a to b, axis aligned */
const hall = (g, x0, y0, x1, y1, r) => {
  if (y0 === y1) carve(g, Math.min(x0, x1), y0 - r, Math.max(x0, x1), y0 + r);
  else if (x0 === x1) carve(g, x0 - r, Math.min(y0, y1), x0 + r, Math.max(y0, y1));
  else throw new Error('hall must be axis aligned');
};
const put = (g, x, y, ch) => {
  if (g[y][x] === '#') throw new Error('placed ' + ch + ' at ' + x + ',' + y + ' which is rock');
  /* a marker dropped on a marker is silent damage: moving a lurker onto a cache
     cost cave three a cache and nothing said so until the counts were read */
  if (g[y][x] !== '.') throw new Error('placed ' + ch + ' at ' + x + ',' + y + ' on top of ' + g[y][x]);
  g[y][x] = ch;
};
/* The border is always rock, so a cave is closed and a segment run never runs
   off the edge of the world. */
function seal(g) {
  for (let x = 0; x < W; x++) { g[0][x] = '#'; g[H - 1][x] = '#'; }
  for (let y = 0; y < H; y++) { g[y][0] = '#'; g[y][W - 1] = '#'; }
  return g;
}
const render = g => g.map(r => r.join(''));

/* ------------------------------------------------------------------ caves */
const CAVES = [];

/* 1. FIRST WATER — ping and move. One way through, wide enough to be forgiving. */
(function () {
  const g = blank();
  carve(g, 9, 3, 20, 10);            // start chamber
  hall(g, 15, 10, 15, 20, 2);        // the drop
  carve(g, 4, 19, 16, 26);           // the shelf
  hall(g, 7, 26, 7, 35, 2);          // the crawl
  carve(g, 4, 34, 25, 43);           // the singing room
  hall(g, 21, 26, 21, 35, 1);        // a dead end that teaches you to look
  carve(g, 18, 24, 24, 28);
  seal(g);
  put(g, 14, 6, 'S'); put(g, 21, 39, 'X'); put(g, 6, 23, 'p');
  CAVES.push({ id: 'first-water', name: 'FIRST WATER', hint: 'Tap to throw a stone. The sound shows you the cave.', grid: render(g) });
})();

/* 2. THE LARDER — the stone economy. Long, with caches off the main line. */
(function () {
  const g = blank();
  carve(g, 3, 3, 11, 9);             // start
  hall(g, 7, 9, 7, 16, 1);
  carve(g, 3, 15, 26, 20);           // the long gallery
  hall(g, 24, 20, 24, 27, 1);
  carve(g, 18, 26, 27, 32);          // east larder
  hall(g, 5, 20, 5, 30, 1);
  carve(g, 3, 29, 12, 35);           // west larder
  hall(g, 12, 32, 20, 32, 1);        // the link
  hall(g, 15, 35, 15, 42, 2);
  carve(g, 6, 41, 24, 46);           // the deep room
  seal(g);
  put(g, 7, 6, 'S'); put(g, 20, 44, 'X');
  put(g, 25, 30, 'o'); put(g, 5, 33, 'o'); put(g, 9, 44, 'o');
  put(g, 26, 17, 'p');
  CAVES.push({ id: 'the-larder', name: 'THE LARDER', hint: 'Caches only glint inside a ring. Throw to find more throws.', grid: render(g) });
})();

/* 3. SOMETHING LISTENS — the first lurker, and the first room wide enough to
      throw a stone past it. */
(function () {
  const g = blank();
  carve(g, 10, 3, 20, 8);            // start
  hall(g, 15, 8, 15, 13, 1);
  carve(g, 3, 12, 27, 24);           // the wide hall, where the lure play lives
  carve(g, 3, 24, 8, 30);            // west arm
  carve(g, 22, 24, 27, 30);          // east arm
  hall(g, 6, 30, 6, 36, 1);
  hall(g, 25, 30, 25, 36, 1);
  carve(g, 4, 35, 26, 40);           // the low shelf
  hall(g, 15, 40, 15, 45, 2);
  carve(g, 9, 44, 22, 47);           // the exit pocket
  seal(g);
  put(g, 15, 5, 'S'); put(g, 19, 46, 'X');
  put(g, 5, 27, 'o'); put(g, 24, 27, 'o');
  put(g, 4, 38, 'p'); put(g, 26, 14, 'p');
  put(g, 4, 29, 'L');          // the west arm. The way through runs east and
                                //   then south, so a stone thrown early is out
                                //   of its hearing and the lure is a choice
  CAVES.push({ id: 'something-listens', name: 'SOMETHING LISTENS', hint: 'Something down here hears. It goes to the stone, not to you.', grid: render(g) });
})();

/* 4. HOLDING BREATH — five stones. The hum is the only way to see the last
      corner without spending one. */
(function () {
  const g = blank();
  carve(g, 12, 3, 18, 7);            // start, tight
  hall(g, 15, 7, 15, 12, 1);
  carve(g, 5, 11, 24, 15);           // the crossing
  hall(g, 7, 15, 7, 23, 1);
  hall(g, 22, 15, 22, 23, 1);
  carve(g, 5, 22, 24, 26);           // the second crossing
  hall(g, 15, 26, 15, 31, 1);
  carve(g, 8, 30, 21, 34);           // the pinch
  hall(g, 10, 34, 10, 40, 1);
  hall(g, 19, 34, 19, 40, 1);
  carve(g, 7, 39, 23, 44);           // the last room
  seal(g);
  put(g, 15, 5, 'S'); put(g, 21, 42, 'X');
  put(g, 12, 32, 'o');
  put(g, 6, 24, 'p'); put(g, 9, 42, 'p');
  put(g, 7, 19, 'L');          // the west hall; the way through is the east one
  CAVES.push({ id: 'holding-breath', name: 'HOLDING BREATH', hint: 'The hum is free and weak, and it calls them to you.', grid: render(g) });
})();

/* 5. THE LONG GALLERY — three lurkers, ten stones, and enough room to make
      every one of them look somewhere else. */
(function () {
  const g = blank();
  carve(g, 3, 3, 12, 8);             // start
  hall(g, 12, 6, 24, 6, 1);
  carve(g, 20, 3, 27, 10);           // east start room
  hall(g, 7, 8, 7, 14, 1);
  hall(g, 24, 10, 24, 14, 1);
  carve(g, 3, 13, 27, 21);           // the gallery
  hall(g, 15, 21, 15, 25, 2);
  carve(g, 3, 24, 27, 31);           // the second gallery
  hall(g, 5, 31, 5, 37, 1);
  hall(g, 15, 31, 15, 37, 1);
  hall(g, 25, 31, 25, 37, 1);
  carve(g, 3, 36, 27, 42);           // the floor of the world
  hall(g, 20, 42, 20, 46, 1);
  carve(g, 14, 45, 26, 48);          // the exit pocket
  seal(g);
  put(g, 6, 5, 'S'); put(g, 24, 47, 'X');
  put(g, 26, 6, 'o'); put(g, 4, 28, 'o'); put(g, 26, 39, 'o');
  put(g, 3, 19, 'p'); put(g, 27, 26, 'p'); put(g, 4, 41, 'p');
  put(g, 25, 17, 'L'); put(g, 25, 28, 'L'); put(g, 4, 40, 'L');
  CAVES.push({ id: 'the-long-gallery', name: 'THE LONG GALLERY', hint: 'Three of them. Give each one a different noise to chase.', grid: render(g) });
})();

/* --------------------------------------------------- the tool's own checks */
const OPEN = '.SXopL';
function flood(rows, sx, sy) {
  const seen = new Set(), q = [[sx, sy]];
  seen.add(sy * W + sx);
  while (q.length) {
    const [x, y] = q.pop();
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx, ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      if (OPEN.indexOf(rows[ny][nx]) < 0) continue;
      const k = ny * W + nx;
      if (seen.has(k)) continue;
      seen.add(k); q.push([nx, ny]);
    }
  }
  return seen;
}
function findAll(rows, ch) {
  const out = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (rows[y][x] === ch) out.push([x, y]);
  return out;
}
let bad = 0;
for (const c of CAVES) {
  const rows = c.grid;
  if (rows.length !== H) { console.error('FAIL ' + c.id + ' has ' + rows.length + ' rows'); bad++; continue; }
  for (const r of rows) if (r.length !== W) { console.error('FAIL ' + c.id + ' row width ' + r.length); bad++; }
  const S = findAll(rows, 'S'), X = findAll(rows, 'X');
  if (S.length !== 1 || X.length !== 1) { console.error('FAIL ' + c.id + ' needs exactly one S and one X'); bad++; continue; }
  const reach = flood(rows, S[0][0], S[0][1]);
  const need = [['X', X], ['o', findAll(rows, 'o')], ['p', findAll(rows, 'p')], ['L', findAll(rows, 'L')]];
  for (const [ch, list] of need) {
    for (const [x, y] of list) {
      if (!reach.has(y * W + x)) { console.error('FAIL ' + c.id + ' ' + ch + ' at ' + x + ',' + y + ' is walled off from the start'); bad++; }
    }
  }
  const lurkers = findAll(rows, 'L');
  for (const [x, y] of lurkers) {
    const d = Math.max(Math.abs(x - S[0][0]), Math.abs(y - S[0][1]));
    if (d < 8) { console.error('FAIL ' + c.id + ' a lurker spawns ' + d + ' tiles from the start, the floor is 8'); bad++; }
  }
  const open = rows.join('').split('').filter(ch => OPEN.indexOf(ch) >= 0).length;
  console.error('  ' + c.id.padEnd(20) + open + ' open tiles, ' + lurkers.length + ' lurkers, '
    + findAll(rows, 'o').length + ' caches, ' + findAll(rows, 'p').length + ' pearls');
}

function block() {
  const lines = ['// ---- LEVELS_START ---- generated by tools/levels.mjs, never edited by hand'];
  lines.push('var LEVELS = [');
  CAVES.forEach((c, i) => {
    lines.push('  {');
    lines.push("    id: '" + c.id + "', name: '" + c.name + "',");
    lines.push("    hint: '" + c.hint + "',");
    lines.push('    grid: [');
    c.grid.forEach((r, j) => lines.push("      '" + r + "'" + (j < c.grid.length - 1 ? ',' : '')));
    lines.push('    ]');
    lines.push('  }' + (i < CAVES.length - 1 ? ',' : ''));
  });
  lines.push('];');
  lines.push('// ---- LEVELS_END ----');
  return lines.join('\n');
}

if (bad) { console.error('\nLEVELS BAD: ' + bad + ' problem(s)'); process.exit(1); }

if (process.argv.includes('--emit')) { console.log(block()); process.exit(0); }

if (process.argv.includes('--check')) {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  const a = html.indexOf('// ---- LEVELS_START ----'), b = html.indexOf('// ---- LEVELS_END ----');
  if (a < 0 || b < 0) { console.error('FAIL the LEVELS markers are not in index.html'); process.exit(1); }
  const have = html.slice(a, b + '// ---- LEVELS_END ----'.length).replace(/\r/g, '').trim();
  const want = block().trim();
  if (have !== want) {
    const hl = have.split('\n'), wl = want.split('\n');
    for (let i = 0; i < Math.max(hl.length, wl.length); i++) {
      if (hl[i] !== wl[i]) { console.error('FAIL line ' + i + '\n  page: ' + hl[i] + '\n  tool: ' + wl[i]); break; }
    }
    console.error('FAIL the caves in index.html are not what tools/levels.mjs renders');
    process.exit(1);
  }
  console.log('\nLEVELS OK');
  process.exit(0);
}
console.log('\nusage: --emit or --check');
