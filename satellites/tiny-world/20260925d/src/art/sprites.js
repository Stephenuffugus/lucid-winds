// String-grid sprites to canvases (and data URLs for tray icons). Browser only.
let PAL = {}, SPR = {};
const cache = {}, urls = {};

export function initSprites(spritesJson) {
  PAL = spritesJson.palette;
  SPR = spritesJson.sprites;
}
export const palette = () => PAL;

// A lost GPU context (Android kills Chrome's GPU process under memory pressure, a driver resets) wipes every
// canvas. Each canvas the game draws from is watched; `restored()` counts the restores, and the renderer repaints
// (repaintSprites, its chunks) when the count moves.
let restores = 0;
export const restored = () => restores;
export function watchCanvas(c) { c.addEventListener('contextrestored', () => { restores++; }); return c; }

export function sprite(name, over) {
  const key = name + (over ? JSON.stringify(over) : '');
  if (cache[key]) return cache[key];
  const c = watchCanvas(document.createElement('canvas'));
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
export function atlasImage() { if (!atlas) { atlas = watchCanvas(document.createElement('canvas')); atlas.width = atlas.height = ATLAS; actx = atlas.getContext('2d'); } return atlas; }
// After a lost context: every 8×8 sprite is made again and every atlas slot painted again, in place.
const made = []; // [name, over, slot] for every slot in the atlas
export function repaintSprites() {
  for (const k in cache) delete cache[k];
  if (!actx) return;
  actx.clearRect(0, 0, ATLAS, ATLAS);
  for (const [name, over, r] of made) actx.drawImage(sprite(name, over), r.sx, r.sy);
}
export function atlasRef(name, over) {
  const key = name + (over ? JSON.stringify(over) : '');
  let r = slots.get(key);
  if (r) return r;
  atlasImage();
  if (used >= PER_ROW * PER_ROW) { slots.clear(); made.length = 0; used = 0; actx.clearRect(0, 0, ATLAS, ATLAS); } // full (never seen): start over
  const sx = (used % PER_ROW) * 8, sy = Math.floor(used / PER_ROW) * 8;
  used++;
  actx.clearRect(sx, sy, 8, 8);
  actx.drawImage(sprite(name, over), sx, sy);
  r = { sx, sy };
  slots.set(key, r);
  made.push([name, over, r]);
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

// The picture for one entry of C.icons: a sprite (a creature, a thing, a hat, a weapon, a power's tray icon) or,
// for a terrain, its own tile (design 18 A4: a row may show the GROUND it is about).
export function picUrl(icon) {
  return icon.cols ? terrIcon(icon.terr, icon.cols) : url(icon.spr, icon.over);
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
