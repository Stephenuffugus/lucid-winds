// sockgen: the TUMBLE texture engine (DESIGN 7).
//
//   spec = decode(seed)                  seed -> fields
//   paint(spec, mask, opts) -> RGBA      a 256 x 256 tile in the sock's UV space
//
// A seed is 64 hex characters (a SHA-256, the same currency as the Lucid Winds plant
// engine), optionally followed by mutations: "<hex>~palette.137". A pair is two socks
// with the same seed. A decoy is the same hex with exactly one field mutated.
// Hero socks use "hero:<id>" and are painted from a recipe (data/hero-socks.json).
//
// Painting is pure JS (signed distance fields with analytic anti-aliasing), so the same
// seed paints the same bytes in Node and in every browser (DESIGN 15.4).

import { sha256 } from './sha256.js';
import { oklch, oklabBytes, deltaE } from './color.js';
import { SILHOUETTES, centerline } from '../src/silhouettes.js';

export const FIELDS = [
  { key: 'silhouette', bits: 3 },
  { key: 'patternFamily', bits: 4 },
  { key: 'palette', bits: 8 },
  { key: 'stripeRhythm', bits: 6 },
  { key: 'motif', bits: 8 },
  { key: 'cuffStyle', bits: 3 },
  { key: 'heelToeContrast', bits: 2 },
  { key: 'size', bits: 1 },
  { key: 'condition', bits: 2 },
];
export const FIELD_MAX = Object.fromEntries(FIELDS.map((f) => [f.key, (1 << f.bits) - 1]));

export const FAMILIES = ['solid', 'stripe', 'heelToe', 'argyle', 'polka', 'chevron', 'fairIsle', 'motifScatter', 'gradient', 'plaid'];
export const FAMILY_NAMES = {
  solid: 'Solid', stripe: 'Stripes', heelToe: 'Heel and Toe', argyle: 'Argyle', polka: 'Polka Dots',
  chevron: 'Chevron', fairIsle: 'Fair Isle', motifScatter: 'Little Pictures', gradient: 'Ombre', plaid: 'Plaid',
};
// families where the stripe rhythm is visible (so a rhythm decoy is a real decoy)
export const RHYTHM_FAMILIES = new Set(['stripe', 'chevron', 'argyle', 'polka', 'plaid', 'fairIsle']);

export const MOTIFS = ['heart', 'star', 'moon', 'bolt', 'fish', 'cherry', 'leaf', 'mushroom', 'cloud', 'cat', 'bone', 'flower', 'raindrop', 'cactus', 'bird', 'diamond'];
// shapes whose mirror image looks different (mirrored motif decoys, DESIGN 5)
export const ASYMMETRIC = new Set(['moon', 'bolt', 'fish', 'cherry', 'leaf', 'cactus', 'bird']);
export const CONDITIONS = ['plain', 'lint', 'hole', 'pilled'];
export const CUFFS = ['plain rib', 'contrast rib', 'twin stripe', 'triple stripe', 'scalloped', 'wide band', 'checker band', 'dotted band'];
export const PERIODS_CM = [1.1, 1.6, 2.3, 3.2];
export const DUTIES = [0.32, 0.46, 0.6, 0.16];

export const TILE = 256;

// ---------- seeds ----------
export function seedFrom(text) { return sha256(String(text)); }
export function baseOf(seed) { return String(seed).split('~')[0]; }
export function isHero(seed) { return String(seed).startsWith('hero:'); }

function readBits(hex, offset, n) {
  let v = 0;
  for (let i = 0; i < n; i++) {
    const bit = offset + i;
    const nib = parseInt(hex[bit >> 2], 16);
    v = (v << 1) | ((nib >> (3 - (bit & 3))) & 1);
  }
  return v;
}

export function decode(seed) {
  seed = String(seed);
  if (isHero(seed)) {
    const [head, ...muts] = seed.split('~');
    const spec = { seed, hero: head.slice(5), pairId: head, silhouette: 1, patternFamily: 0, palette: 0, stripeRhythm: 0, motif: 0, cuffStyle: 0, heelToeContrast: 0, size: 0, condition: 0 };
    for (const m of muts) { const [k, v] = m.split('.'); if (k in FIELD_MAX) spec[k] = Math.max(0, Math.min(FIELD_MAX[k], parseInt(v, 10) || 0)); }
    return finish(spec);
  }
  const [base, ...muts] = seed.split('~');
  if (!/^[0-9a-f]{64}$/.test(base)) throw new Error('bad sock seed: ' + seed);
  const spec = { seed, base, pairId: base.slice(40, 56) };
  let off = 0;
  for (const f of FIELDS) { spec[f.key] = readBits(base, off, f.bits); off += f.bits; }
  for (const m of muts) {
    const [k, v] = m.split('.');
    if (k in FIELD_MAX) spec[k] = Math.max(0, Math.min(FIELD_MAX[k], parseInt(v, 10) || 0));
  }
  return finish(spec);
}

function finish(spec) {
  spec.family = FAMILIES[spec.patternFamily % FAMILIES.length];
  spec.hue = spec.palette & 63;
  spec.scheme = spec.palette >> 6;
  spec.motifShape = MOTIFS[spec.motif & 15];
  spec.mirror = (spec.motif >> 4) & 1;
  spec.kid = spec.size === 1;
  spec.cond = CONDITIONS[spec.condition];
  return spec;
}

export function mutate(seed, key, value) {
  const parts = String(seed).split('~');
  const head = parts[0];
  const muts = parts.slice(1).filter((m) => m.split('.')[0] !== key);
  muts.push(key + '.' + value);
  muts.sort();
  return [head, ...muts].join('~');
}

// Identity of a sock for matching: every field plus the pair id (DESIGN 3.2, 7).
export function specKey(spec) {
  if (spec.hero) return 'hero:' + spec.hero + '|' + FIELDS.map((f) => spec[f.key]).join('.');
  return FIELDS.map((f) => spec[f.key]).join('.') + '|' + spec.pairId;
}

export function diffFields(a, b) {
  const out = FIELDS.filter((f) => a[f.key] !== b[f.key]).map((f) => f.key);
  if (a.pairId !== b.pairId) out.push('pairId');
  return out;
}

export function sockName(spec) {
  const pal = paletteName(spec.hue, spec.scheme);
  const fam = FAMILY_NAMES[spec.family];
  const sil = SILHOUETTES[spec.silhouette].name;
  if (spec.family === 'motifScatter') return `${pal} ${cap(spec.motifShape)} ${sil}`;
  return `${pal} ${fam} ${sil}`;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const HUE_NAMES = ['Tomato', 'Clay', 'Pumpkin', 'Apricot', 'Honey', 'Mustard', 'Lemon', 'Pear', 'Moss', 'Fern', 'Clover', 'Mint', 'Sea Glass', 'Teal', 'Lagoon', 'Sky', 'Denim', 'Cornflower', 'Iris', 'Lilac', 'Plum', 'Orchid', 'Berry', 'Rose'];
const SCHEME_NAMES = ['', 'Bold', 'Soft', 'Deep'];
export function paletteName(hue, scheme) {
  const n = HUE_NAMES[Math.floor(((hue + 0.5) / 64) * HUE_NAMES.length) % HUE_NAMES.length];
  return (SCHEME_NAMES[scheme] ? SCHEME_NAMES[scheme] + ' ' : '') + n;
}

// ---------- palettes (DESIGN 7, 12) ----------
// Each scheme places three colours relative to the palette's hue. In a colour vision
// mode the hue circle is replaced by a loop in the plane that viewer still sees
// (lightness and blue to yellow for protan and deutan, lightness and red to teal for tritan).
const SCHEMES = [
  { body: [0.66, 0.12, 0], accent: [0.93, 0.035, 20], accent2: [0.4, 0.075, 0] },
  { body: [0.62, 0.13, 0], accent: [0.85, 0.1, 180], accent2: [0.36, 0.065, 180] },
  { body: [0.82, 0.075, 0], accent: [0.965, 0.022, 0], accent2: [0.58, 0.105, 45] },
  { body: [0.46, 0.105, 0], accent: [0.8, 0.11, 62], accent2: [0.9, 0.05, 62] },
];
export const MODES = ['normal', 'deutan', 'protan', 'tritan'];

function place(L, C, turn, mode) {
  if (mode === 'normal') return oklch(L, C, turn * 360 + 8);
  const a = turn * Math.PI * 2;
  const amp = C * 1.2;
  const LL = Math.max(0.28, Math.min(0.95, L + 0.85 * C * Math.cos(a)));
  if (mode === 'tritan') return oklabBytes(LL, amp * Math.sin(a), 0.004);
  return oklabBytes(LL, 0.012, amp * Math.sin(a));
}

const palCache = new Map();
export function paletteColors(palette, mode = 'normal') {
  const key = palette + mode;
  if (palCache.has(key)) return palCache.get(key);
  const hue = palette & 63, S = SCHEMES[palette >> 6];
  const t = hue / 64;
  const c = (p) => place(p[0], p[1], t + p[2] / 360, mode);
  const out = { body: c(S.body), accent: c(S.accent), accent2: c(S.accent2) };
  palCache.set(key, out);
  return out;
}

// Contrast floor (DESIGN 7, 12): two palettes are "distinct" when their body colours are at
// least FLOOR apart (CIEDE2000) for every viewer the game supports, each seeing their own table.
export const DE_FLOOR = 7;
export function paletteDistance(p1, p2, mode) {
  return deltaE(paletteColors(p1, mode).body, paletteColors(p2, mode).body, mode);
}
export function palettesDistinct(p1, p2, floor = DE_FLOOR) {
  for (const m of MODES) if (paletteDistance(p1, p2, m) < floor) return false;
  return true;
}

// ---------- SDF helpers ----------
const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
const smoothstep = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
const len = (x, y) => Math.sqrt(x * x + y * y);
const sdCircle = (x, y, r) => len(x, y) - r;
const sdBox = (x, y, bx, by) => { const dx = Math.abs(x) - bx, dy = Math.abs(y) - by; return len(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const sdSeg = (x, y, ax, ay, bx, by, r) => { const pax = x - ax, pay = y - ay, bax = bx - ax, bay = by - ay; const h = clamp((pax * bax + pay * bay) / (bax * bax + bay * bay), 0, 1); return len(pax - bax * h, pay - bay * h) - r; };
const sdEllipse = (x, y, a, b) => { const k = len(x / a, y / b); return (k - 1) * Math.min(a, b); };
function sdPoly(x, y, v) {
  let d = (x - v[0]) ** 2 + (y - v[1]) ** 2, s = 1;
  const n = v.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i, i++) {
    const ex = v[j * 2] - v[i * 2], ey = v[j * 2 + 1] - v[i * 2 + 1];
    const wx = x - v[i * 2], wy = y - v[i * 2 + 1];
    const h = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey), 0, 1);
    const bx = wx - ex * h, by = wy - ey * h;
    d = Math.min(d, bx * bx + by * by);
    const c1 = y >= v[i * 2 + 1], c2 = y < v[j * 2 + 1], c3 = ex * wy > ey * wx;
    if ((c1 && c2 && c3) || (!c1 && !c2 && !c3)) s = -s;
  }
  return s * Math.sqrt(d);
}
function sdHeart(x, y) {
  x = Math.abs(x); y = -y + 0.55; // point down
  y *= 1.05; x *= 1.05;
  if (y + x > 1) return (len(x - 0.25, y - 0.75) - Math.SQRT2 / 4) * 0.95;
  const a = x * x + (y - 1) * (y - 1);
  const m = Math.max(x + y, 0) * 0.5;
  const b = (x - m) * (x - m) + (y - m) * (y - m);
  return Math.sqrt(Math.min(a, b)) * Math.sign(x - y) * 0.95;
}
function sdStar(x, y, r, rf) {
  const k1x = 0.809016994, k1y = -0.587785252, k2x = -k1x, k2y = k1y;
  x = Math.abs(x); y = -y;
  let d = 2 * Math.max(k1x * x + k1y * y, 0); x -= d * k1x; y -= d * k1y;
  d = 2 * Math.max(k2x * x + k2y * y, 0); x -= d * k2x; y -= d * k2y;
  x = Math.abs(x); y -= r;
  const bax = -rf * k1y, bay = rf * k1x - 1;
  const h = clamp((x * bax + y * bay) / (bax * bax + bay * bay), 0, r);
  return len(x - bax * h, y - bay * h) * Math.sign(y * bax - x * bay);
}
const BOLT = [-0.12, -0.85, 0.42, -0.85, 0.08, -0.12, 0.45, -0.12, -0.28, 0.9, -0.05, 0.12, -0.42, 0.12];
const TRI_UP = [0, -0.9, 0.8, 0.6, -0.8, 0.6];

// Signed distance of a motif at unit scale (coordinates roughly in -1..1, y down).
export function motifSDF(shape, x, y) {
  switch (shape) {
    case 'heart': return sdHeart(x, y);
    case 'star': return sdStar(x, y + 0.05, 0.9, 0.42);
    case 'moon': return Math.max(sdCircle(x, y, 0.8), -sdCircle(x + 0.38, y - 0.22, 0.66));
    case 'bolt': return sdPoly(x, y, BOLT);
    case 'fish': return Math.min(sdEllipse(x + 0.12, y, 0.62, 0.4), sdPoly(x, y, [0.35, 0, 0.9, -0.42, 0.9, 0.42])) ;
    case 'cherry': return Math.min(sdCircle(x + 0.38, y - 0.42, 0.34), sdCircle(x - 0.3, y - 0.5, 0.34), sdSeg(x, y, -0.36, 0.2, 0.2, -0.75, 0.06), sdSeg(x, y, 0.3, 0.18, 0.2, -0.75, 0.06), sdEllipse(x - 0.42, y + 0.72, 0.28, 0.12));
    case 'leaf': { const c = Math.cos(0.6), s = Math.sin(0.6); const u = x * c - y * s, v = x * s + y * c; return Math.max(sdCircle(u, v + 0.55, 0.95), sdCircle(u, v - 0.55, 0.95)); }
    case 'mushroom': return Math.min(Math.max(sdEllipse(x, y + 0.1, 0.85, 0.62), y - 0.05), sdBox(x, y - 0.45, 0.22, 0.42));
    case 'cloud': return Math.min(sdCircle(x + 0.42, y - 0.12, 0.38), sdCircle(x, y + 0.12, 0.5), sdCircle(x - 0.45, y - 0.08, 0.42), sdBox(x, y - 0.25, 0.7, 0.24));
    case 'cat': return Math.min(sdCircle(x, y - 0.12, 0.66), sdPoly(x, y, [-0.62, -0.1, -0.52, -0.9, -0.12, -0.45]), sdPoly(x, y, [0.62, -0.1, 0.12, -0.45, 0.52, -0.9]));
    case 'bone': return Math.min(sdSeg(x, y, -0.55, 0, 0.55, 0, 0.16), sdCircle(x + 0.62, y - 0.18, 0.2), sdCircle(x + 0.62, y + 0.18, 0.2), sdCircle(x - 0.62, y - 0.18, 0.2), sdCircle(x - 0.62, y + 0.18, 0.2));
    case 'flower': { let d = sdCircle(x, y, 0.26); for (let k = 0; k < 5; k++) { const a = (k / 5) * Math.PI * 2 - Math.PI / 2; d = Math.min(d, sdCircle(x - Math.cos(a) * 0.52, y - Math.sin(a) * 0.52, 0.34)); } return d; }
    case 'raindrop': return Math.min(sdCircle(x, y - 0.25, 0.55), sdPoly(x, y, [0, -0.95, 0.5, 0.05, -0.5, 0.05]));
    case 'cactus': return Math.min(sdSeg(x, y, 0, 0.85, 0, -0.75, 0.2), sdSeg(x, y, 0, 0.1, 0.5, 0.1, 0.13), sdSeg(x, y, 0.5, 0.1, 0.5, -0.4, 0.13), sdSeg(x, y, 0, 0.35, -0.45, 0.35, 0.12), sdSeg(x, y, -0.45, 0.35, -0.45, 0.02, 0.12));
    case 'bird': return Math.min(sdEllipse(x + 0.05, y - 0.1, 0.6, 0.42), sdCircle(x - 0.45, y + 0.3, 0.28), sdPoly(x, y, [-0.68, 0.22, -0.98, 0.34, -0.68, 0.42]), sdPoly(x, y, [0.5, 0, 0.95, -0.35, 0.8, 0.2]));
    case 'diamond': return sdPoly(x, y, [0, -0.9, 0.62, 0, 0, 0.9, -0.62, 0]);
    case 'tri': return sdPoly(x, y, TRI_UP);
    case 'dot': return sdCircle(x, y, 0.6);
    default: return sdCircle(x, y, 0.6);
  }
}

// ---------- the painter ----------
const DEFAULT_DIMS = new Map();
export function silhouetteDims(silId) {
  if (DEFAULT_DIMS.has(silId)) return DEFAULT_DIMS.get(silId);
  const s = SILHOUETTES[silId];
  const cl = centerline(s, 40);
  const a = s.w / 2, b = s.t / 2;
  const circ = Math.PI * (3 * (a + b) - Math.sqrt((3 * a + b) * (a + 3 * b)));
  const d = { circ: circ * 100, len: cl.length * 100, heel: cl.heelS, toeV: s.toeV, cuff: s.cuff };
  DEFAULT_DIMS.set(silId, d);
  return d;
}

function hash2(x, y, s) {
  let h = (x * 374761393 + y * 668265263 + s * 2246822519) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
function seed32(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  return h >>> 0;
}

const mixc = (out, c, k) => {
  if (k <= 0) return;
  if (k >= 1) { out[0] = c[0]; out[1] = c[1]; out[2] = c[2]; return; }
  out[0] += (c[0] - out[0]) * k; out[1] += (c[1] - out[1]) * k; out[2] += (c[2] - out[2]) * k;
};
const shade = (c, k) => [c[0] * k, c[1] * k, c[2] * k].map((v) => Math.max(0, Math.min(255, v)));
const lighten = (c, k) => [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k];

// paint(spec, mask, opts) -> Uint8ClampedArray(size * size * 4)
//   mask: RGBA bytes (R heel, G toe, B cuff) at MASK size, or null for the procedural mask
//   opts: { size, mode, recipe (hero), dims }
export function paint(spec, mask, opts = {}) {
  const size = opts.size || TILE;
  const mode = opts.mode || 'normal';
  const out = opts.out || new Uint8ClampedArray(size * size * 4);
  const dims = opts.dims || silhouetteDims(spec.silhouette);
  const recipe = opts.recipe || null;
  const pal0 = recipe && recipe.colors ? recipeColors(recipe, mode) : paletteColors(spec.palette, mode);
  const pal = { ...pal0 };
  pal.cuffShade = shade(pal.body, 0.94);
  pal.holeRim = shade(pal.body, 0.6);
  const heelCol = [pal.body, shade(pal.body, 0.72), pal.accent2, pal.accent][recipe && recipe.heelToe !== undefined ? recipe.heelToe : spec.heelToeContrast];
  const rnd = seed32(spec.seed);
  const circ = dims.circ, L = dims.len;
  const pxX = circ / size, pxY = L / size;
  const aa = Math.max(pxX, pxY) * 0.75;
  const fam = recipe && recipe.family ? recipe.family : spec.family;
  const rhythm = recipe && recipe.rhythm !== undefined ? recipe.rhythm : spec.stripeRhythm;
  const period = PERIODS_CM[rhythm & 3];
  const duty = DUTIES[(rhythm >> 2) & 3];
  const dbl = (rhythm >> 4) & 1;
  const alt = (rhythm >> 5) & 1;
  const motifShape = recipe && recipe.motif ? recipe.motif : spec.motifShape;
  const mirror = recipe && recipe.mirror !== undefined ? recipe.mirror : spec.mirror;
  const big = (spec.motif >> 5) & 1, dense = (spec.motif >> 6) & 1, swap = (spec.motif >> 7) & 1;
  const motifCol = swap ? pal.accent2 : pal.accent;
  const motifEdge = swap ? pal.accent : pal.accent2;
  const col = [0, 0, 0];
  const maskSize = mask ? Math.round(Math.sqrt(mask.length / 4)) : 0;
  const pmask = mask ? null : proceduralMaskFn(dims);
  // repeat counts that divide the circumference exactly, so U wraps without a seam
  const nAcross = (p) => Math.max(1, Math.round(circ / p));
  const argN = [2, 2, 4, 4][rhythm & 3];
  const dotN = nAcross(period * 1.3);
  const motN = Math.max(2, Math.round(circ / ((big ? 5.2 : 4.0) * (dense ? 0.8 : 1))));
  const plaidN = nAcross(period * 2.2);
  const fairRows = [2.2, 2.8, 3.4, 4.0][rhythm & 3];
  const cuffEnd = dims.cuff * L;
  const heelV = dims.heel;
  const cond = recipe && recipe.condition ? CONDITIONS.indexOf(recipe.condition) : spec.condition;

  for (let py = 0; py < size; py++) {
    const v = (py + 0.5) / size;
    const Y = v * L;
    // per-row values
    let rowStripe = 0, rowAlt = 0;
    if (fam === 'stripe') {
      const ph = ((Y / period) % 1 + 1) % 1;
      let d = Math.abs(ph - 0.5) * period - (duty * period) / 2; // <0 inside stripe
      if (dbl) d = Math.max(d, -(Math.abs(ph - 0.5) * period - 0.09));
      rowStripe = 1 - smoothstep(-aa, aa, d);
      rowAlt = alt && Math.floor(Y / period) % 2 ? 1 : 0;
    }
    for (let px = 0; px < size; px++) {
      const u = (px + 0.5) / size;
      const X = u * circ;
      col[0] = pal.body[0]; col[1] = pal.body[1]; col[2] = pal.body[2];
      switch (fam) {
        case 'stripe':
          mixc(col, rowAlt ? pal.accent2 : pal.accent, rowStripe);
          break;
        case 'heelToe':
          // a single thin band above the heel keeps it from reading as plain
          { const d = Math.abs(v - (cuffEnd / L + 0.05)) * L - 0.35; mixc(col, pal.accent, 1 - smoothstep(-aa, aa, d)); }
          break;
        case 'argyle': {
          // diamond grid: s and t run along the two diagonals; parity picks the diamond colour
          const w = circ / argN, h = w * 1.4;
          const ss = X / w + (Y + h * 0.25) / h, tt = X / w - (Y + h * 0.25) / h;
          const fs = ss - Math.floor(ss), ft = tt - Math.floor(tt);
          const parity = (Math.floor(ss) + Math.floor(tt)) & 1;
          if (parity) mixc(col, pal.accent2, 1);
          // anti-aliased diamond edges
          const edge = Math.min(fs, 1 - fs, ft, 1 - ft) * w * 0.7;
          mixc(col, parity ? pal.body : pal.accent2, 0.5 * (1 - smoothstep(0, aa, edge)));
          // thin overcheck lines through the diamond centres
          const line = Math.min(Math.abs(fs - 0.5), Math.abs(ft - 0.5)) * w * 0.7 - 0.06;
          mixc(col, pal.accent, (1 - smoothstep(-aa, aa, line)) * 0.95);
          break;
        }
        case 'polka': {
          const n = dotN, w = circ / n;
          const row = Math.floor(Y / w);
          const off = row & 1 ? 0.5 : 0;
          const fx = ((X / w + off) % 1 + 1) % 1 - 0.5, fy = ((Y / w) % 1 + 1) % 1 - 0.5;
          const r = w * (0.14 + duty * 0.3);
          const d = len(fx * w, fy * w) - r;
          mixc(col, alt && row % 3 === 0 ? pal.accent2 : pal.accent, 1 - smoothstep(-aa, aa, d));
          break;
        }
        case 'chevron': {
          const n = nAcross(period * 1.6), w = circ / n;
          const tri = Math.abs(((X / w) % 1 + 1) % 1 - 0.5) * 2; // 0..1
          const yy = Y + tri * period * 0.6;
          const ph = ((yy / period) % 1 + 1) % 1;
          const d = Math.abs(ph - 0.5) * period - (duty * period) / 2;
          const band = Math.floor(yy / period);
          mixc(col, alt && band % 2 ? pal.accent2 : pal.accent, 1 - smoothstep(-aa, aa, d * 0.9));
          break;
        }
        case 'fairIsle': {
          const bandH = fairRows;
          const b = Math.floor(Y / bandH);
          const fy = (Y / bandH) - b; // 0..1
          const kind = (b + (rhythm >> 4)) % 3;
          // stitch grid: patterns are drawn on knit cells
          const cw = circ / (Math.max(1, Math.round(circ / 0.42 / 8)) * 8), ch = 0.36;
          const cx = Math.floor(X / cw), cy = Math.floor(Y / ch);
          const lx = cx % 8, ly = Math.floor(fy * 7);
          let on = 0;
          if (kind === 0) on = (Math.abs(lx - 3.5) + Math.abs(ly - 3) < 3) && ((lx + ly) & 1) === 0 ? 1 : 0; // diamonds of dots
          else if (kind === 1) on = (ly === 1 || ly === 5) ? 1 : ((lx + (ly >> 1)) % 4 === 0 && ly > 1 && ly < 5 ? 1 : 0); // ladder
          else on = ((lx === 3 || ly === 3) && Math.abs(lx - 3) + Math.abs(ly - 3) < 3) ? 1 : ((lx === ly || lx === 6 - ly) && ly > 0 && ly < 6 ? 1 : 0); // snowflake cross
          const edge = fy < 0.07 || fy > 0.93 ? 1 : 0;
          mixc(col, b & 1 ? pal.accent2 : pal.body, 1);
          if (on) mixc(col, b & 1 ? pal.accent : pal.accent, 1);
          if (edge) mixc(col, pal.accent, 0.9);
          void cy;
          break;
        }
        case 'motifScatter': {
          const n = motN, w = circ / n;
          const hgt = w * 1.12;
          const row = Math.floor(Y / hgt);
          const off = row & 1 ? 0.5 : 0;
          const ci = Math.floor(X / w + off);
          const fx = ((X / w + off) % 1 + 1) % 1 - 0.5;
          const fy = ((Y / hgt) % 1 + 1) % 1 - 0.5;
          const jx = (hash2(((ci % n) + n) % n, row, rnd) - 0.5) * 0.14;
          const jy = (hash2(((ci % n) + n) % n, row, rnd + 7) - 0.5) * 0.12;
          const scale = w * (big ? 0.36 : 0.3);
          let mx = -(fx - jx) * w / scale, my = (fy - jy) * hgt / scale;
          if (mirror) mx = -mx;
          const d = motifSDF(motifShape, mx, my) * scale;
          mixc(col, motifEdge, 1 - smoothstep(-aa, aa, d - 0.09));
          mixc(col, motifCol, 1 - smoothstep(-aa, aa, d));
          break;
        }
        case 'gradient': {
          const k = smoothstep(0.08, 0.95, v);
          const steps = rhythm & 1 ? 6 : 0;
          const kk = steps ? Math.floor(k * steps) / steps : k;
          mixc(col, pal.accent2, kk * 0.9);
          if (rhythm & 2) mixc(col, pal.accent, (1 - smoothstep(-aa, aa, Math.abs(((Y / 3) % 1) - 0.5) * 3 - 0.08)) * 0.6);
          break;
        }
        case 'plaid': {
          const n = plaidN, w = circ / n;
          const fx = ((X / w) % 1 + 1) % 1, fy = ((Y / w) % 1 + 1) % 1;
          const bx = fx < 0.34 ? 1 : 0, by = fy < 0.34 ? 1 : 0;
          const thinX = Math.abs(fx - 0.67) * w < 0.08 ? 1 : 0, thinY = Math.abs(fy - 0.67) * w < 0.08 ? 1 : 0;
          const twill = ((px + py) % 4 < 2) ? 1 : 0;
          if (bx && by) mixc(col, pal.accent2, 1);
          else if (bx || by) mixc(col, pal.accent2, twill ? 0.62 : 0.45);
          if (thinX || thinY) mixc(col, pal.accent, 0.95);
          break;
        }
        default: break;
      }
      // heel, toe, cuff (masks)
      let mh, mt, mc;
      if (mask) {
        const mi = (Math.min(maskSize - 1, Math.floor(v * maskSize)) * maskSize + Math.min(maskSize - 1, Math.floor(u * maskSize))) * 4;
        mh = mask[mi] / 255; mt = mask[mi + 1] / 255; mc = mask[mi + 2] / 255;
      } else { const m = pmask(u, v); mh = m[0]; mt = m[1]; mc = m[2]; }
      if (mh > 0) mixc(col, heelCol, mh);
      if (mt > 0) mixc(col, heelCol, mt);
      if (mc > 0) cuffPaint(col, spec, pal, X, Y, cuffEnd, aa, mc, recipe);
      // condition
      if (cond === 1) {
        const hx = Math.floor(X / 0.45), hy = Math.floor(Y / 0.45);
        const r0 = hash2(hx, hy, rnd + 11);
        if (r0 > 0.93) { const dd = len(((X / 0.45) % 1) - 0.5, ((Y / 0.45) % 1) - 0.5); mixc(col, [236, 232, 226], (1 - smoothstep(0.15, 0.4, dd)) * 0.85); }
      } else if (cond === 2) {
        const hx = (u - 0.27) * circ, hy = (v - (dims.toeV + 0.04)) * L;
        const d = sdEllipse(hx, hy, 1.0, 0.75);
        if (d < 0.35) {
          mixc(col, pal.holeRim, 1 - smoothstep(-aa, aa, d - 0.3));
          mixc(col, [214, 170, 150], 1 - smoothstep(-aa, aa, d));
        }
      } else if (cond === 3) {
        const hx = Math.floor(X / 0.6), hy = Math.floor(Y / 0.6);
        if (hash2(hx, hy, rnd + 17) > 0.8) {
          const dd = len(((X / 0.6) % 1) - 0.5, ((Y / 0.6) % 1) - 0.5);
          const k = 1 - smoothstep(0.12, 0.3, dd);
          const lr = col[0] + (255 - col[0]) * 0.35, lg = col[1] + (255 - col[1]) * 0.35, lb = col[2] + (255 - col[2]) * 0.35;
          const kk = k * 0.9;
          col[0] += (lr - col[0]) * kk; col[1] += (lg - col[1]) * kk; col[2] += (lb - col[2]) * kk;
        }
      }
      // heathered yarn
      const n = hash2(px, py, rnd) - 0.5;
      const knitRow = (py % 3 === 0) ? -0.02 : 0;
      const k = 1 + n * 0.07 + knitRow;
      const o = (py * size + px) * 4;
      out[o] = col[0] * k; out[o + 1] = col[1] * k; out[o + 2] = col[2] * k; out[o + 3] = 255;
    }
  }
  if (recipe && recipe.layers) paintLayers(out, size, recipe, pal, dims, mode);
  return out;
}

const _cuff = [0, 0, 0];
function cuffPaint(col, spec, pal, X, Y, cuffEnd, aa, k, recipe) {
  const style = recipe && recipe.cuff !== undefined ? recipe.cuff : spec.cuffStyle;
  const c = _cuff;
  c[0] = col[0]; c[1] = col[1]; c[2] = col[2];
  // ribbing: fine vertical lines
  const rib = Math.abs(((X / 0.3) % 1) - 0.5) < 0.18 ? 0.9 : 1;
  switch (style) {
    case 0: mixc(c, pal.cuffShade, 1); break;
    case 1: mixc(c, pal.accent, 1); break;
    case 2: { mixc(c, pal.body, 1); const d1 = Math.abs(Y - cuffEnd * 0.3) - cuffEnd * 0.08, d2 = Math.abs(Y - cuffEnd * 0.62) - cuffEnd * 0.08; mixc(c, pal.accent2, 1 - smoothstep(-aa, aa, Math.min(d1, d2))); break; }
    case 3: { mixc(c, pal.accent, 1); for (const f of [0.22, 0.5, 0.78]) mixc(c, pal.accent2, 1 - smoothstep(-aa, aa, Math.abs(Y - cuffEnd * f) - cuffEnd * 0.05)); break; }
    case 4: { mixc(c, pal.accent, 1); const sc = Math.abs(((X / 0.9) % 1) - 0.5) * 0.9; const d = Y - (0.32 + Math.sqrt(Math.max(0, 0.2 - sc * sc)) * 0.6); mixc(c, pal.accent2, 1 - smoothstep(-aa, aa, -d)); break; }
    case 5: mixc(c, pal.accent2, 1); break;
    case 6: { const cx = Math.floor(X / 0.55), cy = Math.floor(Y / 0.55); mixc(c, (cx + cy) & 1 ? pal.accent : pal.accent2, 1); break; }
    case 7: { mixc(c, pal.accent2, 1); const d = len(((X / 0.7) % 1 - 0.5) * 0.7, ((Y / 0.7) % 1 - 0.5) * 0.7) - 0.14; mixc(c, pal.accent, 1 - smoothstep(-aa, aa, d)); break; }
    default: break;
  }
  c[0] *= rib; c[1] *= rib; c[2] *= rib;
  mixc(col, c, k);
}

function proceduralMaskFn(d) {
  return (u, v) => {
    const outer = Math.cos(u * Math.PI * 2);
    const hh = 0.075 * Math.sqrt(34 / d.len);
    const heel = smoothstep(hh, hh * 0.7, Math.abs(v - d.heel)) * smoothstep(-0.15, 0.1, outer);
    const toe = smoothstep(d.toeV - 0.03, d.toeV + 0.005, v);
    const cuff = smoothstep(d.cuff + 0.005, d.cuff - 0.012, v);
    return [heel, toe, cuff];
  };
}

// ---------- hero recipes (DESIGN 8) ----------
// A recipe is data: base colours, a family, and optional layers of shapes and text drawn on top.
// See data/hero-socks.json for the schema in use.
function parseHex(h) { const n = parseInt(h.replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function recipeColors(recipe, mode) {
  const c = recipe.colors;
  let out = { body: parseHex(c.body), accent: parseHex(c.accent || c.body), accent2: parseHex(c.accent2 || c.accent || c.body) };
  if (mode !== 'normal' && recipe.cvd && recipe.cvd[mode]) {
    const m = recipe.cvd[mode];
    out = { body: parseHex(m.body || c.body), accent: parseHex(m.accent || c.accent), accent2: parseHex(m.accent2 || c.accent2) };
  }
  for (const k of Object.keys(c)) if (!(k in out)) out[k] = parseHex(c[k]);
  return out;
}

// Stroke font for hero text: each glyph is polylines on a 4 x 6 grid.
const FONT = {
  A: [[0, 6, 0, 2, 2, 0, 4, 2, 4, 6], [0, 3.5, 4, 3.5]], B: [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3], [3, 3, 4, 4, 4, 5, 3, 6, 0, 6]],
  C: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5]], D: [[0, 0, 0, 6, 2.5, 6, 4, 4.5, 4, 1.5, 2.5, 0, 0, 0]],
  E: [[4, 0, 0, 0, 0, 6, 4, 6], [0, 3, 3, 3]], F: [[4, 0, 0, 0, 0, 6], [0, 3, 3, 3]],
  G: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 3, 2, 3]], H: [[0, 0, 0, 6], [4, 0, 4, 6], [0, 3, 4, 3]],
  I: [[1, 0, 3, 0], [2, 0, 2, 6], [1, 6, 3, 6]], J: [[4, 0, 4, 5, 3, 6, 1, 6, 0, 5]], K: [[0, 0, 0, 6], [4, 0, 0, 3.5, 4, 6]],
  L: [[0, 0, 0, 6, 4, 6]], M: [[0, 6, 0, 0, 2, 3, 4, 0, 4, 6]], N: [[0, 6, 0, 0, 4, 6, 4, 0]],
  O: [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0]], P: [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3]],
  Q: [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0], [2.5, 4.5, 4.3, 6.3]], R: [[0, 6, 0, 0, 3, 0, 4, 1, 4, 2, 3, 3, 0, 3], [2, 3, 4, 6]],
  S: [[4, 1, 3, 0, 1, 0, 0, 1, 0, 2, 1, 3, 3, 3, 4, 4, 4, 5, 3, 6, 1, 6, 0, 5]], T: [[0, 0, 4, 0], [2, 0, 2, 6]],
  U: [[0, 0, 0, 5, 1, 6, 3, 6, 4, 5, 4, 0]], V: [[0, 0, 2, 6, 4, 0]], W: [[0, 0, 1, 6, 2, 3, 3, 6, 4, 0]],
  X: [[0, 0, 4, 6], [4, 0, 0, 6]], Y: [[0, 0, 2, 3, 4, 0], [2, 3, 2, 6]], Z: [[0, 0, 4, 0, 0, 6, 4, 6]],
  0: [[1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6, 0, 5, 0, 1, 1, 0], [4, 1, 0, 5]], 1: [[1, 1, 2, 0, 2, 6], [1, 6, 3, 6]],
  2: [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 0, 6, 4, 6]], 3: [[0, 0, 4, 0, 2, 2.5, 3, 2.5, 4, 3.5, 4, 5, 3, 6, 1, 6, 0, 5]],
  4: [[3, 6, 3, 0, 0, 4, 4, 4]], 5: [[4, 0, 0, 0, 0, 3, 3, 3, 4, 4, 4, 5, 3, 6, 0, 6]],
  6: [[3, 0, 1, 0, 0, 1, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3, 0, 3]], 7: [[0, 0, 4, 0, 1.5, 6]],
  8: [[1, 0, 3, 0, 4, 1, 4, 2, 3, 3, 1, 3, 0, 4, 0, 5, 1, 6, 3, 6, 4, 5, 4, 4, 3, 3], [1, 3, 0, 2, 0, 1, 1, 0]],
  9: [[4, 3, 1, 3, 0, 2, 0, 1, 1, 0, 3, 0, 4, 1, 4, 5, 3, 6, 1, 6]],
  "'": [[2, 0, 1.6, 1.6]], '.': [[2, 5.6, 2, 6]], '!': [[2, 0, 2, 4], [2, 5.6, 2, 6]], '?': [[0, 1, 1, 0, 3, 0, 4, 1, 4, 2, 2, 3.5, 2, 4.3], [2, 5.7, 2, 6]],
  '&': [[4, 6, 1, 2, 1, 1, 2, 0, 3, 1, 3, 2, 0, 4, 0, 5, 1, 6, 2, 6, 4, 4]], '#': [[1, 0, 1, 6], [3, 0, 3, 6], [0, 2, 4, 2], [0, 4, 4, 4]],
  '/': [[4, 0, 0, 6]], ',': [[2, 5.2, 1.4, 6.6]], ':': [[2, 1.8, 2, 2.2], [2, 4.8, 2, 5.2]], '+': [[2, 1.5, 2, 4.5], [0.5, 3, 3.5, 3]],
  '$': [[4, 1, 3, 0.5, 1, 0.5, 0, 1.5, 1, 3, 3, 3, 4, 4.5, 3, 5.5, 1, 5.5, 0, 5], [2, -0.3, 2, 6.3]], ' ': [],
};

function textSDF(text, x, y, h) {
  // text centred on 0,0; cap height h
  const s = h / 6;
  const adv = 5.4 * s;
  const w = text.length * adv - 1.4 * s;
  let d = 1e9;
  const gx = x + w / 2;
  const i = Math.floor(gx / adv);
  for (let k = i - 1; k <= i + 1; k++) {
    if (k < 0 || k >= text.length) continue;
    const g = FONT[text[k]] || FONT['?'];
    const lx = gx - k * adv, ly = y + h / 2;
    for (const line of g) {
      for (let j = 0; j + 3 < line.length; j += 2) {
        d = Math.min(d, sdSeg(lx, ly, line[j] * s, line[j + 1] * s, line[j + 2] * s, line[j + 3] * s, 0));
      }
    }
  }
  return d;
}

// Layers: [{ type: 'motif'|'text'|'band'|'emblem', ... }]
//   motif:  { shape, color, edge, size (cm), rows, cols, from, to }  scattered motif grid between v=from..to
//   emblem: { shapes: [{ sdf: 'circle'|'ellipse'|'box'|'seg'|'motif', ...args, color }], at: [u, v], size (cm) }
//   text:   { text, color, height (cm), at: [u, v], stroke (cm) }  drawn on both faces
//   band:   { from, to, color }
function paintLayers(out, size, recipe, pal, dims, mode) {
  const circ = dims.circ, L = dims.len;
  const aa = Math.max(circ, L) / size * 0.75;
  const color = (c) => (typeof c === 'string' && c.startsWith('#') ? parseHex(c) : pal[c] || pal.accent);
  const col = [0, 0, 0];
  for (const layer of recipe.layers) {
    const v0 = layer.from !== undefined ? layer.from : 0.12, v1 = layer.to !== undefined ? layer.to : 0.86;
    const py0 = Math.max(0, Math.floor((layer.type === 'band' ? layer.from : layer.type === 'motif' ? v0 : 0) * size));
    const py1 = Math.min(size, Math.ceil((layer.type === 'band' ? layer.to : layer.type === 'motif' ? v1 : 1) * size));
    for (let py = py0; py < py1; py++) {
      const v = (py + 0.5) / size, Y = v * L;
      for (let px = 0; px < size; px++) {
        const u = (px + 0.5) / size, X = u * circ;
        const o = (py * size + px) * 4;
        col[0] = out[o]; col[1] = out[o + 1]; col[2] = out[o + 2];
        let changed = false;
        if (layer.type === 'band') { mixc(col, color(layer.color), 1); changed = true; }
        else if (layer.type === 'motif') {
          const cols = layer.cols || Math.max(2, Math.round(circ / (layer.size * 2.2)));
          const w = circ / cols, hh = (layer.size || 2) * 2.1;
          const row = Math.floor((Y - v0 * L) / hh);
          const off = row & 1 ? 0.5 : 0;
          const fx = ((X / w + off) % 1 + 1) % 1 - 0.5, fy = (((Y - v0 * L) / hh) % 1 + 1) % 1 - 0.5;
          const sc = (layer.size || 2) / 2;
          let mx = -fx * w / sc, my = fy * hh / sc;
          if (layer.mirror) mx = -mx;
          if (layer.shapes) {
            // a composite picture repeated in the grid (tacos with faces, and so on)
            if (Math.abs(mx) < 1.6 && Math.abs(my) < 1.6) {
              for (const sh of layer.shapes) {
                const d = shapeSDF(sh, mx, my) * sc;
                if (sh.edge) mixc(col, color(sh.edge), 1 - smoothstep(-aa, aa, d - (sh.edgeWidth || 0.08)));
                mixc(col, color(sh.color), 1 - smoothstep(-aa, aa, d));
              }
              changed = true;
            }
          } else {
            const d = shapeSDF(layer, mx, my) * sc;
            if (d < aa * 3 + 0.15) {
              if (layer.edge) mixc(col, color(layer.edge), 1 - smoothstep(-aa, aa, d - 0.1));
              mixc(col, color(layer.color), 1 - smoothstep(-aa, aa, d));
              changed = true;
            }
          }
        } else if (layer.type === 'emblem' || layer.type === 'text') {
          // drawn twice, centred on each face (u = 0.25 and 0.75) unless `at` gives u
          const faces = layer.at && layer.at[0] !== undefined && layer.once ? [layer.at[0]] : [0.25, 0.75];
          const cv = layer.at ? layer.at[1] : 0.45;
          for (const fu of faces) {
            let dx = (u - fu) * circ; dx -= Math.round(dx / circ) * circ;
            const dy = (v - cv) * L;
            if (layer.type === 'text') {
              const h = layer.height || 1.6;
              if (Math.abs(dy) > h + 1 || Math.abs(dx) > layer.text.length * h) continue;
              // +U runs to the viewer's left on the face a held sock shows, so text x is -dx.
              // vertical text reads down the leg.
              const tx = layer.vertical ? dy : -dx, ty = layer.vertical ? dx : dy;
              const d = textSDF(layer.text, tx, ty, h) - (layer.stroke || h * 0.09);
              if (layer.edge) mixc(col, color(layer.edge), 1 - smoothstep(-aa, aa, d - (layer.edgeWidth || 0.12)));
              mixc(col, color(layer.color), 1 - smoothstep(-aa, aa, d));
              changed = true;
            } else {
              const s = (layer.size || 4) / 2;
              if (Math.abs(dx) > s * 1.6 || Math.abs(dy) > s * 1.6) continue;
              for (const sh of layer.shapes) {
                const d = shapeSDF(sh, -dx / s, dy / s) * s;
                if (sh.edge) mixc(col, color(sh.edge), 1 - smoothstep(-aa, aa, d - (sh.edgeWidth || 0.1)));
                mixc(col, color(sh.color), 1 - smoothstep(-aa, aa, d));
              }
              changed = true;
            }
          }
        }
        if (changed) { out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2]; }
      }
    }
  }
}

function shapeSDF(sh, x, y) {
  const r = sh.rot ? sh.rot : 0;
  if (r) { const c = Math.cos(r), s = Math.sin(r); const nx = x * c + y * s, ny = -x * s + y * c; x = nx; y = ny; }
  const ox = sh.x || 0, oy = sh.y || 0;
  x -= ox; y -= oy;
  if (sh.flip) x = -x;
  switch (sh.sdf || 'motif') {
    case 'circle': return sdCircle(x, y, sh.r || 0.5);
    case 'ellipse': return sdEllipse(x, y, sh.a || 0.6, sh.b || 0.4);
    case 'box': return sdBox(x, y, sh.w || 0.5, sh.h || 0.3) - (sh.round || 0);
    case 'seg': return sdSeg(x, y, sh.x1 || 0, sh.y1 || 0, sh.x2 || 0, sh.y2 || 0, sh.r || 0.08);
    case 'poly': return sdPoly(x, y, sh.pts);
    case 'ring': return Math.abs(sdCircle(x, y, sh.r || 0.5)) - (sh.t || 0.06);
    case 'text': return textSDF(sh.text, x, y, sh.h || 0.4) - (sh.stroke || 0.05);
    case 'motif': default: return motifSDF(sh.shape || 'dot', x / (sh.scale || 1), y / (sh.scale || 1)) * (sh.scale || 1);
  }
}

// ---------- atlas ----------
// Paints a list of { seed, silId, recipe } into one RGBA atlas of n x n tiles.
export function paintAtlas(entries, masks, opts = {}) {
  const n = opts.n || 8, size = opts.size || TILE;
  const W = n * size;
  const atlas = opts.out || new Uint8ClampedArray(W * W * 4);
  const tile = new Uint8ClampedArray(size * size * 4);
  if (entries.length > n * n) throw new Error(`atlas overflow: ${entries.length} tiles > ${n * n}`);
  entries.forEach((e, i) => {
    const spec = e.spec || decode(e.seed);
    paint(spec, masks ? masks[spec.silhouette] : null, { size, mode: opts.mode, recipe: e.recipe, out: tile });
    const tx = (i % n) * size, ty = Math.floor(i / n) * size;
    for (let y = 0; y < size; y++) {
      atlas.set(tile.subarray(y * size * 4, (y + 1) * size * 4), ((ty + y) * W + tx) * 4);
    }
  });
  return atlas;
}

// FNV-1a over bytes, for determinism checks
export function bytesHash(bytes) {
  let h = 2166136261;
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 16777619);
  return (h >>> 0).toString(16).padStart(8, '0');
}
