// The chip under a picture on a strip (card polish 3, 3 Oct 2026; the lead's look at 20261003f, 412 px, Today: "A baby frog was
// born." beside THREE PLAIN GREEN TILES with one dark dot each, and on a card's strip the frog only a dark outline on the same
// green). Design 18 F4 put every picture of the news line on a chip of the game's own grass, because every sprite is drawn to be
// read on grass (on the bare dark bar the ant, the bee, the crow vanished). But some of them ARE the grass: the frog and the cactus
// are the palette's g (#4fb04a), 6 apart from the chip's #5aa845 (CIE76), the snake 9, the reeds 6 and 12; a frog on the grass chip
// is its eye.
// ONE RULE for every picture a strip draws (her news line, the answer over it, Today, a card's strip, the sparkle's card): it
// sits on the first of art.json chips.tiles (the game's grass, then its sand) where it READS, its own pixels against the chip:
// at least chips.share of its pixels stand out from the chip by chips.dE or more (CIE76, the colour as the eye takes it), and
// at least chips.share of its OUTLINE do (the pixels beside a clear one or at the sprite's edge: a shape is its outline, and a
// body that stands out inside an outline that does not is a blot). A sprite pixel is 2 by 2 CSS px on the news line (16 px a
// picture) and on a card's strip (its 10 px chip at 20), 5 by 5 on the sparkle's card (40 px): the measure is per sprite pixel,
// so it is the same at every size. A terrain is its own tile, edge to edge: its chip is its own first colour. His sprites are
// untouched; only the tile under them changes. The law (fixture every-picture-reads-on-its-chip): every creature (a baby is
// its kind's own sprite), thing, story icon and power icon reads on the chip this gives it.
// DOM free: the fixtures ask it exactly as the page does.
const LAB = new Map();
function lab(hex) {
  let v = LAB.get(hex);
  if (v) return v;
  const h = String(hex), lin = (i) => { const c = parseInt(h.slice(i, i + 2), 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  const r = lin(1), g = lin(3), b = lin(5);
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const X = f((0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047), Y = f(0.2126 * r + 0.7152 * g + 0.0722 * b), Z = f((0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883);
  v = [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
  LAB.set(hex, v);
  return v;
}
// How far apart two colours look (CIE76: the distance in L*a*b*).
export function apart(a, b) { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); }

// How a sprite reads on a chip of colour `tile`: { share, outline } (the parts of its pixels, and of its outline's, that stand out
// by dE or more). `rows`: the sprite's eight strings ('.' clear), `colourOf(ch)`: a letter's colour (its `over`, else the palette).
export function readsOn(rows, colourOf, tile, dE) {
  let n = 0, out = 0, edge = 0, edgeOut = 0;
  const H = rows.length;
  const clear = (x, y) => y < 0 || y >= H || x < 0 || x >= rows[y].length || rows[y][x] === '.' || !rows[y][x];
  for (let y = 0; y < H; y++) for (let x = 0; x < rows[y].length; x++) {
    if (clear(x, y)) continue;
    const stands = apart(colourOf(rows[y][x]), tile) >= dE, rim = clear(x - 1, y) || clear(x + 1, y) || clear(x, y - 1) || clear(x, y + 1);
    n++; if (stands) out++;
    if (rim) { edge++; if (stands) edgeOut++; }
  }
  return { share: n ? out / n : 0, outline: edge ? edgeOut / edge : 0 };
}
export const reads = (m, share) => m.share >= share && m.outline >= share;

// The chips' colours: each tile of art.chips.tiles, its own first colour (terrain.json).
const CHIPS = new WeakMap();
function chipsOf(data) {
  let c = CHIPS.get(data);
  if (!c) { c = { tiles: data.art.chips.tiles.map((t) => data.terrain[t].cols[0]), memo: new Map() }; CHIPS.set(data, c); }
  return c;
}
// The chip under picture p ({ spr, over } or a terrain's { terr, cols }), as a CSS colour. A sprite that reads nowhere stays on the
// last tile (the law refuses it: chipFaults).
export function chipOf(data, p) {
  if (!p) return '';
  if (p.cols) return p.cols[0];
  const c = chipsOf(data), key = p.spr + (p.over ? JSON.stringify(p.over) : '');
  let col = c.memo.get(key);
  if (col !== undefined) return col;
  const rows = data.sprites.sprites[p.spr], pal = data.sprites.palette, A = data.art.chips;
  col = c.tiles[c.tiles.length - 1];
  if (rows) {
    const colourOf = (ch) => (p.over && p.over[ch]) || pal[ch];
    for (const t of c.tiles) if (reads(readsOn(rows, colourOf, t, A.dE), A.share)) { col = t; break; }
  }
  c.memo.set(key, col);
  return col;
}
// The law: every picture a strip can draw (`icons`: the world's own list, w.C.icons: every creature, every thing, story.json's
// icons, every power's) reads on the chip chipOf gives it. Each fault names the picture and how it reads there.
export function chipFaults(data, icons) {
  const out = [], A = data.art.chips, pal = data.sprites.palette;
  for (const p of icons) {
    if (!p || p.cols) continue;
    const rows = data.sprites.sprites[p.spr];
    if (!rows) { out.push(`the picture ${p.spr} has no sprite`); continue; }
    const tile = chipOf(data, p), m = readsOn(rows, (ch) => (p.over && p.over[ch]) || pal[ch], tile, A.dE);
    if (!reads(m, A.share)) out.push(`${p.spr}${p.over ? ' ' + JSON.stringify(p.over) : ''} on its chip ${tile}: ${Math.round(m.share * 100)}% of its pixels and ${Math.round(m.outline * 100)}% of its outline stand out (${Math.round(A.share * 100)}% each)`);
  }
  return out;
}
