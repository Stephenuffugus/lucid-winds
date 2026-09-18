// String-grid sprites to canvases (and data URLs for tray icons). Browser only.
let PAL = {}, SPR = {};
const cache = {}, urls = {};

export function initSprites(spritesJson) {
  PAL = spritesJson.palette;
  SPR = spritesJson.sprites;
}
export const palette = () => PAL;

export function sprite(name, over) {
  const key = name + (over ? JSON.stringify(over) : '');
  if (cache[key]) return cache[key];
  const c = document.createElement('canvas');
  c.width = c.height = 8;
  const x = c.getContext('2d');
  SPR[name].forEach((row, j) => {
    for (let i = 0; i < 8; i++) {
      const ch = row[i];
      if (ch === '.' || !ch) continue;
      x.fillStyle = (over && over[ch]) || PAL[ch];
      x.fillRect(i, j, 1, 1);
    }
  });
  return (cache[key] = c);
}

// The sprite atlas (M1-4): every sprite and colour variant the world draws, packed into one canvas as it is
// first needed, so the renderer draws from one image. atlasRef() returns the atlas slot (x, y of its 8×8);
// it builds a key string, so callers keep the result instead of asking every frame.
const ATLAS = 1024, PER_ROW = ATLAS / 8;
let atlas = null, actx = null, used = 0;
const slots = new Map();
export function atlasImage() { if (!atlas) { atlas = document.createElement('canvas'); atlas.width = atlas.height = ATLAS; actx = atlas.getContext('2d'); } return atlas; }
export function atlasRef(name, over) {
  const key = name + (over ? JSON.stringify(over) : '');
  let r = slots.get(key);
  if (r) return r;
  atlasImage();
  if (used >= PER_ROW * PER_ROW) { slots.clear(); used = 0; actx.clearRect(0, 0, ATLAS, ATLAS); } // full (never seen): start over
  const sx = (used % PER_ROW) * 8, sy = Math.floor(used / PER_ROW) * 8;
  used++;
  actx.clearRect(sx, sy, 8, 8);
  actx.drawImage(sprite(name, over), sx, sy);
  r = { sx, sy };
  slots.set(key, r);
  return r;
}

export function url(name, over) {
  const key = name + (over ? JSON.stringify(over) : '');
  return urls[key] || (urls[key] = sprite(name, over).toDataURL());
}

// Terrain noise (keep the prototype's hash so every world looks the same).
export function tileHash(x, y, p) {
  let n = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(p + 1, 974634533)) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
}

export function terrIcon(id, cols) {
  if (urls['t' + id]) return urls['t' + id];
  const k = document.createElement('canvas');
  k.width = k.height = 8;
  const x = k.getContext('2d');
  for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
    const r = tileHash(i, j, 3);
    x.fillStyle = cols[r < 0.6 ? 0 : r < 0.82 ? 1 : 2];
    x.fillRect(i, j, 1, 1);
  }
  return (urls['t' + id] = k.toDataURL());
}
