// Procedural canvas textures for the room (browser only). No image files: the whole
// laundry room is painted here at boot, so the bundle stays small (OPUS_PROMPT 2 MB rule).

import * as THREE from 'three';
import { rng32 } from './mathx.js';

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}

// value noise, tileable
function makeNoise(seed, size) {
  const r = rng32(seed);
  const g = new Float32Array(size * size);
  for (let i = 0; i < g.length; i++) g[i] = r();
  const at = (x, y) => g[((y % size) + size) % size * size + ((x % size) + size) % size];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}

function fbm(n, x, y, oct = 4) {
  let s = 0, a = 0.5, f = 1;
  for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f); a *= 0.5; f *= 2; }
  return s;
}

function tex(c, opts = {}) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = opts.linear ? THREE.NoColorSpace : THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = opts.aniso || 4;
  if (opts.repeat) t.repeat.set(opts.repeat[0], opts.repeat[1]);
  return t;
}

const lerp = (a, b, t) => a + (b - a) * t;
const mixRGB = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];

// Warm maple planks along U.
export function woodTexture({ w = 512, h = 512, planks = 5, base = [196, 150, 104], dark = [140, 96, 62], seed = 3 } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  const img = x.createImageData(w, h);
  const n = makeNoise(seed, 64);
  const pr = rng32(seed + 9);
  const offs = Array.from({ length: planks }, () => [pr() * 50, pr() * 0.12 - 0.06]);
  for (let py = 0; py < h; py++) {
    const plank = Math.floor((py / h) * planks);
    const inPlank = (py / h) * planks - plank;
    const [ox, tone] = offs[plank];
    for (let px = 0; px < w; px++) {
      const u = px / w * 8 + ox, v = inPlank * 2;
      const grain = Math.sin((v * 9 + fbm(n, u * 0.9, v * 2.2 + plank * 7, 4) * 6) * 3.1);
      let t = 0.5 + 0.5 * grain;
      t = Math.pow(t, 2.2) * 0.55 + fbm(n, u * 3, v * 12, 3) * 0.3;
      let col = mixRGB(base, dark, Math.min(1, Math.max(0, t)));
      col = col.map((q) => q * (1 + tone));
      // seam shadow
      const seam = Math.min(inPlank, 1 - inPlank) * h / planks;
      if (seam < 1.6) col = col.map((q) => q * 0.62);
      const o = (py * w + px) * 4;
      img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return tex(c);
}

// Quilted cotton folding mat for the play area: sage with a soft diamond stitch.
// THE FOLDING TABLE'S MAT (DESIGN-T2 3.1 adds `pattern`). She looks at this the whole game, so nothing here
// may cost a sock its readability: `tests/tabletop.test.mjs` renders the ten loudest socks on every tabletop
// and refuses one that drops the contrast. `quilt` is what the table has always had.
export const TABLETOPS = ['quilt', 'flat', 'gingham', 'linen', 'felt', 'towel'];
export function matTexture({ size = 512, base = [122, 146, 118], line = [238, 228, 204], seed = 5, pattern = 'quilt' } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  const img = x.createImageData(size, size);
  const n = makeNoise(seed, 32);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = px / size, v = py / size;
      const d1 = Math.abs(((u + v) * 6) % 1 - 0.5), d2 = Math.abs(((u - v + 4) * 6) % 1 - 0.5);
      const stitch = Math.max(0, 1 - Math.min(Math.abs(d1 - 0.5), Math.abs(d2 - 0.5)) * 60);
      const dash = Math.sin((u + v) * 180) > -0.2 ? 1 : 0.2;
      const puff = 0.5 + 0.5 * Math.min(d1, d2) * 2;
      const fuzz = fbm(n, u * 64, v * 64, 2);
      let col, mark = 0;
      if (pattern === 'quilt') {
        col = base.map((q) => q * (0.86 + 0.16 * puff) * (0.94 + 0.1 * fuzz));
        mark = stitch * dash * 0.75;
      } else if (pattern === 'flat') {
        col = base.map((q) => q * (0.97 + 0.05 * fuzz));
      } else if (pattern === 'gingham') {
        const gi = Math.floor(u * 10) % 2, gj = Math.floor(v * 10) % 2;
        col = base.map((q) => q * (0.95 + 0.08 * fuzz));
        mark = (gi + gj) === 0 ? 0.3 : (gi + gj) === 1 ? 0.15 : 0;
      } else if (pattern === 'linen') {
        const weave = (Math.sin(u * size * 0.9) * Math.sin(v * size * 0.9)) * 0.5 + 0.5;
        col = base.map((q) => q * (0.9 + 0.14 * weave) * (0.95 + 0.08 * fuzz));
        mark = 0.06;
      } else if (pattern === 'felt') {
        col = base.map((q) => q * (0.9 + 0.2 * fbm(n, u * 160, v * 160, 3)));
      } else {
        // towel: soft horizontal bands, the way a folded towel reads
        const band = Math.abs(((v * 9) % 1) - 0.5);
        col = base.map((q) => q * (0.88 + 0.18 * band) * (0.95 + 0.08 * fuzz));
        mark = band < 0.08 ? 0.34 : 0;
      }
      col = mixRGB(col, line, mark);
      const o = (py * size + px) * 4;
      img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return tex(c);
}

// How much of `line` each tabletop pattern actually mixes over its base, averaged across the tile. The shop's
// declared `base` is what tests/tabletop.test.mjs measures a sock against in Node, and this is the honest
// correction from the declared colour to the painted one. ⛔ It is NOT a mirror of the painter: a browser gate
// (`dev/gate-room.mjs`) samples the REAL painted mat and fails if the two disagree by more than a few units.
export const MAT_MARK = { quilt: 0.19, flat: 0, gingham: 0.11, linen: 0.06, felt: 0, towel: 0.06 };

// Wallpaper: cream with sage sprigs in a half drop, or one of five more the shop sells (DESIGN-T2 3.1).
export const WALLPAPERS = ['sprig', 'stripe', 'dot', 'check', 'bloom', 'plain'];
export function wallpaperTexture({ size = 512, bg = '#efe3cf', ink = '#9bb08e', ink2 = '#d9a47a', pattern = 'sprig' } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, size, size);
  // faint vertical stripes
  for (let i = 0; i < 8; i++) {
    x.fillStyle = i % 2 ? 'rgba(160,140,110,0.05)' : 'rgba(255,255,255,0.05)';
    x.fillRect((i * size) / 8, 0, size / 8, size);
  }
  // The four patterns that are not the sprig. Each one wraps: the wall repeats 3.2 by 2.4, so a seam shows.
  if (pattern !== 'sprig') {
    const step = size / 4;
    if (pattern === 'stripe') {
      for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? ink : ink2; x.globalAlpha = i % 2 ? 0.5 : 0.22; x.fillRect((i * size) / 8, 0, size / 16, size); }
      x.globalAlpha = 1;
    } else if (pattern === 'dot') {
      for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
        const cx = i * (size / 6) + (j % 2 ? size / 12 : 0), cy = j * (size / 6) + size / 12;
        x.fillStyle = (i + j) % 3 === 0 ? ink2 : ink;
        for (const dx of [-size, 0, size]) { x.beginPath(); x.arc(cx + dx, cy, size / 52, 0, Math.PI * 2); x.fill(); }
      }
    } else if (pattern === 'check') {
      for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
        if ((i + j) % 2) continue;
        x.fillStyle = ink; x.globalAlpha = 0.3;
        x.fillRect(i * (size / 8), j * (size / 8), size / 8, size / 8);
      }
      x.globalAlpha = 1;
      x.strokeStyle = ink2; x.lineWidth = 1.5; x.globalAlpha = 0.5;
      for (let i = 0; i <= 8; i++) { x.beginPath(); x.moveTo(i * (size / 8), 0); x.lineTo(i * (size / 8), size); x.moveTo(0, i * (size / 8)); x.lineTo(size, i * (size / 8)); x.stroke(); }
      x.globalAlpha = 1;
    } else if (pattern === 'bloom') {
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const cx = i * step + step / 2 + (j % 2 ? step / 2 : 0), cy = j * step + step / 2;
        for (const dx of [-size, 0, size]) {
          x.save(); x.translate(cx + dx, cy);
          x.fillStyle = ink2;
          for (let k = 0; k < 6; k++) { x.rotate(Math.PI / 3); x.beginPath(); x.ellipse(0, -step * 0.17, step * 0.075, step * 0.14, 0, 0, Math.PI * 2); x.fill(); }
          x.fillStyle = ink; x.beginPath(); x.arc(0, 0, step * 0.08, 0, Math.PI * 2); x.fill();
          x.restore();
        }
      }
    }
    return tex(c);
  }
  const sprig = (cx, cy, s, rot) => {
    x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(s, s);
    x.strokeStyle = ink; x.lineWidth = 2.2; x.lineCap = 'round';
    x.beginPath(); x.moveTo(0, 18); x.quadraticCurveTo(2, 0, -1, -18); x.stroke();
    x.fillStyle = ink;
    for (let k = -2; k <= 2; k++) {
      const yy = k * 7;
      x.beginPath(); x.ellipse(6, yy, 6, 2.8, -0.5, 0, Math.PI * 2); x.fill();
      x.beginPath(); x.ellipse(-6, yy + 3, 6, 2.8, 0.5, 0, Math.PI * 2); x.fill();
    }
    x.fillStyle = ink2;
    x.beginPath(); x.arc(-1, -20, 3.2, 0, Math.PI * 2); x.fill();
    x.restore();
  };
  const step = size / 4;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) {
    const cx = i * step + step / 2, cy = j * step + (i % 2 ? step / 2 : 0);
    for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) sprig(cx + dx, cy + dy, 1.3, (i + j) % 2 ? 0.25 : -0.25);
  }
  return tex(c);
}

// THE FLOOR (DESIGN-T2 3.1). Six kinds. `plank` is what the room has always had, painted here so the default
// and the bought ones go through one path.
export const FLOORS = ['plank', 'lino', 'tile', 'carpet', 'cork', 'painted'];
export function floorTexture({ size = 512, kind = 'plank', base = '#8c6042', line = '#5e3e2a', seed = 8 } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  const n = makeNoise(seed, 64);
  x.fillStyle = base; x.fillRect(0, 0, size, size);
  const grain = (alpha) => {
    const img = x.getImageData(0, 0, size, size), d = img.data;
    for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
      const k = 1 + (n(px / 7, py / 30) - 0.5) * alpha;
      const o = (py * size + px) * 4;
      d[o] *= k; d[o + 1] *= k; d[o + 2] *= k;
    }
    x.putImageData(img, 0, 0);
  };
  if (kind === 'plank') {
    grain(0.5);
    x.strokeStyle = line; x.lineWidth = 2; x.globalAlpha = 0.55;
    for (let i = 1; i < 5; i++) { const y = (i * size) / 5; x.beginPath(); x.moveTo(0, y); x.lineTo(size, y); x.stroke(); }
    for (let i = 0; i < 5; i++) { const xx = ((i * 137) % size); const y0 = (i * size) / 5; x.beginPath(); x.moveTo(xx, y0); x.lineTo(xx, y0 + size / 5); x.stroke(); }
    x.globalAlpha = 1;
  } else if (kind === 'lino') {
    // the checkerboard squares a laundry room floor actually has
    for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
      if ((i + j) % 2) continue;
      x.fillStyle = line; x.globalAlpha = 0.85;
      x.fillRect(i * (size / 8), j * (size / 8), size / 8, size / 8);
    }
    x.globalAlpha = 1; grain(0.16);
  } else if (kind === 'tile') {
    const t = size / 6;
    x.fillStyle = line;
    for (let i = 0; i <= 6; i++) { x.fillRect(i * t - 2, 0, 4, size); x.fillRect(0, i * t - 2, size, 4); }
    grain(0.14);
  } else if (kind === 'carpet') {
    grain(1.1);
    x.globalAlpha = 0.12; x.strokeStyle = line; x.lineWidth = 1;
    for (let i = 0; i < size; i += 3) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + 6, size); x.stroke(); }
    x.globalAlpha = 1;
  } else if (kind === 'cork') {
    grain(0.4);
    x.fillStyle = line; x.globalAlpha = 0.3;
    for (let i = 0; i < 260; i++) {
      const cx = (n(i, 1) * size), cy = (n(i, 2) * size), r = 2 + n(i, 3) * 5;
      x.beginPath(); x.ellipse(cx, cy, r, r * 0.6, n(i, 4) * 3, 0, Math.PI * 2); x.fill();
    }
    x.globalAlpha = 1;
  } else if (kind === 'painted') {
    grain(0.22);
    x.strokeStyle = line; x.lineWidth = 3; x.globalAlpha = 0.4;
    for (let i = 1; i < 4; i++) { const y = (i * size) / 4; x.beginPath(); x.moveTo(0, y); x.lineTo(size, y); x.stroke(); }
    x.globalAlpha = 0.16; x.fillStyle = '#ffffff';
    for (let i = 0; i < 40; i++) { const cx = n(i, 7) * size, cy = n(i, 8) * size; x.fillRect(cx, cy, 6 + n(i, 9) * 20, 2); }
    x.globalAlpha = 1;
  }
  return tex(c);
}

// THE CURTAINS beside the window (DESIGN-T2 3.1). Six kinds over two colours.
export const CURTAINS = ['stripe', 'gingham', 'floral', 'plain', 'lace', 'ticking'];
export function curtainTexture({ size = 256, a = '#d9a47a', b = '#f2dcc2', kind = 'stripe' } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  x.fillStyle = b; x.fillRect(0, 0, size, size);
  if (kind === 'stripe') {
    x.fillStyle = a;
    for (let i = 0; i < 8; i += 2) x.fillRect((i * size) / 8, 0, size / 8, size);
  } else if (kind === 'gingham') {
    x.globalAlpha = 0.55; x.fillStyle = a;
    for (let i = 0; i < 8; i += 2) { x.fillRect((i * size) / 8, 0, size / 8, size); x.fillRect(0, (i * size) / 8, size, size / 8); }
    x.globalAlpha = 1;
  } else if (kind === 'floral') {
    for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
      const cx = i * (size / 5) + (j % 2 ? size / 10 : 0), cy = j * (size / 5) + size / 10;
      x.save(); x.translate(cx, cy); x.fillStyle = a;
      for (let k = 0; k < 5; k++) { x.rotate((Math.PI * 2) / 5); x.beginPath(); x.ellipse(0, -size / 42, size / 90, size / 48, 0, 0, Math.PI * 2); x.fill(); }
      x.restore();
    }
  } else if (kind === 'lace') {
    x.strokeStyle = a; x.lineWidth = 1.4; x.globalAlpha = 0.6;
    for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
      x.beginPath(); x.arc(i * (size / 10) + size / 20, j * (size / 10) + size / 20, size / 26, 0, Math.PI * 2); x.stroke();
    }
    x.globalAlpha = 1;
  } else if (kind === 'ticking') {
    x.strokeStyle = a; x.lineWidth = 2;
    for (let i = 0; i < 16; i++) { const xx = (i * size) / 16; x.beginPath(); x.moveTo(xx, 0); x.lineTo(xx, size); x.stroke(); }
  }
  // the fold shading every curtain gets, so a flat colour still reads as cloth
  const g = x.createLinearGradient(0, 0, size, 0);
  for (let i = 0; i <= 6; i++) g.addColorStop(i / 6, i % 2 ? 'rgba(0,0,0,0.16)' : 'rgba(255,255,255,0.10)');
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  return tex(c);
}

// Wicker weave, color + normal.
export function wickerTextures({ w = 512, h = 256 } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  const nc = canvas(w, h), nx = nc.getContext('2d');
  const img = x.createImageData(w, h), nimg = nx.createImageData(w, h);
  const n = makeNoise(11, 64);
  const cols = 24, rows = 10;
  for (let py = 0; py < h; py++) {
    for (let px = 0; px < w; px++) {
      const u = (px / w) * cols, v = (py / h) * rows;
      const cu = Math.floor(u), rv = Math.floor(v);
      const fu = u - cu, fv = v - rv;
      const over = (cu + rv) % 2 === 0; // horizontal strand over the stake
      // horizontal strand profile
      const hs = Math.sin(fv * Math.PI);
      // vertical stake visible where the strand goes under
      const vs = Math.sin(fu * Math.PI);
      let height, nxv = 0, nyv = 0, tone;
      if (over || Math.abs(fu - 0.5) > 0.18) {
        height = hs * (over ? 1 : 0.75);
        nyv = Math.cos(fv * Math.PI) * 0.8;
        nxv = over ? 0 : (fu < 0.5 ? -0.3 : 0.3);
        tone = 0.72 + 0.28 * hs;
      } else {
        height = vs * 0.9;
        nxv = Math.cos(fu * Math.PI) * 0.8;
        tone = 0.6 + 0.3 * vs;
      }
      const g = fbm(n, u * 2, v * 8, 3);
      const base = [206, 164, 108];
      const col = base.map((q) => q * tone * (0.85 + 0.25 * g));
      const o = (py * w + px) * 4;
      img.data[o] = col[0]; img.data[o + 1] = col[1]; img.data[o + 2] = col[2]; img.data[o + 3] = 255;
      const l = Math.hypot(nxv, nyv, 1);
      nimg.data[o] = ((nxv / l) * 0.5 + 0.5) * 255;
      nimg.data[o + 1] = ((-nyv / l) * 0.5 + 0.5) * 255;
      nimg.data[o + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      nimg.data[o + 3] = 255;
      void height;
    }
  }
  x.putImageData(img, 0, 0);
  nx.putImageData(nimg, 0, 0);
  return { map: tex(c), normal: tex(nc, { linear: true }) };
}

// Knit stitches: rows of little V's, as a tangent-space normal map. Tiled along the sock.
export function knitNormalTexture({ size = 128, cols = 4, rows = 4 } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  const img = x.createImageData(size, size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const u = (px / size) * cols, v = (py / size) * rows;
      const fu = u - Math.floor(u), fv = v - Math.floor(v);
      // each column holds a V: two leaning loops
      const side = fu < 0.5 ? -1 : 1;
      const lu = fu < 0.5 ? fu * 2 : (1 - fu) * 2; // 0 at column edge, 1 at the middle
      const along = fv + side * 0 + lu * 0.35;
      const loop = Math.sin(((along % 1) + 1) % 1 * Math.PI);
      const across = Math.sin(lu * Math.PI);
      const nxv = -side * Math.cos(lu * Math.PI) * 0.55 * loop;
      const nyv = Math.cos((((along % 1) + 1) % 1) * Math.PI) * 0.45 * across;
      const l = Math.hypot(nxv, nyv, 1);
      const o = (py * size + px) * 4;
      img.data[o] = ((nxv / l) * 0.5 + 0.5) * 255;
      img.data[o + 1] = ((nyv / l) * 0.5 + 0.5) * 255;
      img.data[o + 2] = ((1 / l) * 0.5 + 0.5) * 255;
      img.data[o + 3] = 255;
    }
  }
  x.putImageData(img, 0, 0);
  return tex(c, { linear: true, aniso: 2 });
}

// Painted enamel for the dryer.
export function enamelTexture({ size = 256, base = [233, 226, 212] } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  const img = x.createImageData(size, size);
  const n = makeNoise(21, 32);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const g = fbm(n, px / 16, py / 16, 3);
    const o = (py * size + px) * 4;
    img.data[o] = base[0] * (0.97 + g * 0.05); img.data[o + 1] = base[1] * (0.97 + g * 0.05); img.data[o + 2] = base[2] * (0.97 + g * 0.05); img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return tex(c);
}

// A label card (the Odd Bin tag, drawer tags).
export function labelTexture(text, { w = 256, h = 96, bg = '#f3ead6', ink = '#5b4a36', font = '600 44px "Fraunces", Georgia, serif' } = {}) {
  const c = canvas(w, h), x = c.getContext('2d');
  x.fillStyle = bg; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(91,74,54,0.5)'; x.lineWidth = 3; x.setLineDash([7, 5]);
  x.strokeRect(8, 8, w - 16, h - 16);
  x.fillStyle = ink; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(text, w / 2, h / 2 + 2);
  const t = tex(c);
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  return t;
}

// Soft radial blob for fake glows and contact shadows.
export function blobTexture(size = 128, inner = 'rgba(0,0,0,0.55)') {
  const c = canvas(size, size), x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, inner);
  // fade to the same colour at zero alpha (fading to transparent black drew a grey halo)
  g.addColorStop(1, inner.replace(/,\s*[\d.]+\s*\)\s*$/, ',0)'));
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// A tuft of lint for the Rush fog: soft, a little uneven, fading to nothing well inside the sprite's square.
export function lintTexture(size = 128) {
  const c = canvas(size, size), x = c.getContext('2d');
  const img = x.createImageData(size, size);
  const n = makeNoise(41, 16);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const r = Math.hypot((px + 0.5) / size - 0.5, (py + 0.5) / size - 0.5) * 2;
    const fz = fbm(n, px / 6, py / 6, 4);
    const rim = Math.max(0, Math.min(1, (1 - r) / 0.3));
    const a = rim * Math.max(0, Math.min(1, (1 - r) * 1.6 - 0.25 + (fz - 0.5) * 0.9));
    const t = 0.94 + fz * 0.08, o = (py * size + px) * 4;
    img.data[o] = 240 * t; img.data[o + 1] = 234 * t; img.data[o + 2] = 228 * t; img.data[o + 3] = a * 235;
  }
  x.putImageData(img, 0, 0);
  const tx = new THREE.CanvasTexture(c);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

// Cardboard for the Odd Bin crate.
export function cardboardTexture({ size = 256 } = {}) {
  const c = canvas(size, size), x = c.getContext('2d');
  const img = x.createImageData(size, size);
  const n = makeNoise(31, 32);
  for (let py = 0; py < size; py++) for (let px = 0; px < size; px++) {
    const g = fbm(n, px / 12, py / 40, 3);
    const flute = 0.96 + 0.04 * Math.sin(py * 0.9);
    const o = (py * size + px) * 4;
    img.data[o] = 186 * (0.85 + g * 0.25) * flute; img.data[o + 1] = 146 * (0.85 + g * 0.25) * flute; img.data[o + 2] = 100 * (0.85 + g * 0.25) * flute; img.data[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  return tex(c);
}

// Alpha map with slots (plastic hamper), portholes (claw bin), or a wire grid.
export function slotTexture(round = false, grid = false) {
  const c = canvas(128, 128), x = c.getContext('2d');
  x.fillStyle = '#fff'; x.fillRect(0, 0, 128, 128);
  x.fillStyle = '#000';
  if (grid) {
    x.fillRect(0, 0, 128, 128);
    x.fillStyle = '#fff';
    x.fillRect(0, 0, 128, 14); x.fillRect(0, 0, 14, 128);
  } else if (round) {
    x.beginPath(); x.arc(64, 60, 34, 0, Math.PI * 2); x.fill();
  } else {
    x.beginPath(); x.roundRect ? x.roundRect(44, 18, 40, 84, 18) : x.rect(44, 18, 40, 84); x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.NoColorSpace;
  return t;
}

export function stripeTexture(a, b) {
  const c = canvas(256, 16), x = c.getContext('2d');
  for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * 32, 0, 32, 16); }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Opaque radial gradient (a lamp lit ceiling).
export function radialTexture(inner, outer, size = 256) {
  const c = canvas(size, size), x = c.getContext('2d');
  const g = x.createRadialGradient(size / 2, size * 0.58, 0, size / 2, size / 2, size * 0.62);
  g.addColorStop(0, inner);
  g.addColorStop(1, outer);
  x.fillStyle = g;
  x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// Shot trail particles: a four point sparkle, a soft dust mote, or a tiny heart.
const _particles = {};
export function particleTexture(kind) {
  if (_particles[kind]) return _particles[kind];
  const c = canvas(64, 64), x = c.getContext('2d');
  x.fillStyle = '#fff';
  if (kind === 'hearts') {
    x.beginPath();
    x.moveTo(32, 54);
    x.bezierCurveTo(4, 36, 8, 10, 24, 12);
    x.bezierCurveTo(30, 12, 32, 18, 32, 20);
    x.bezierCurveTo(32, 18, 34, 12, 40, 12);
    x.bezierCurveTo(56, 10, 60, 36, 32, 54);
    x.fill();
  } else if (kind === 'dust') {
    const g = x.createRadialGradient(32, 32, 0, 32, 32, 30);
    g.addColorStop(0, 'rgba(255,255,255,0.8)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 64, 64);
  } else {
    x.beginPath();
    x.moveTo(32, 2); x.quadraticCurveTo(35, 29, 62, 32); x.quadraticCurveTo(35, 35, 32, 62); x.quadraticCurveTo(29, 35, 2, 32); x.quadraticCurveTo(29, 29, 32, 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  _particles[kind] = t;
  return t;
}
