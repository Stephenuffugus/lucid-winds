'use strict';
/* The room model (QUESTIONS Q180, the levels item): seeded painted room scenes put through the page's own default crop
 * box, the capture oracle's area average to the grid, SB.palette.nearest and SB.pipeline.build, so a change to the
 * pipeline can be measured against Stephen's complaint ("it make me shrink the box to as small as possible"), not only
 * against the fixture grids. A MODEL, not his photos: flat painted rectangles with grain and noise, no perspective, no
 * cast shadows. It is a tool and an info table, never a gate.
 *
 *   node tools/room-model.js                      the table for the page in this folder
 *   node tools/room-model.js --page <file>        the same for another copy of the page (the before column)
 *   node tools/room-model.js --png <k> <out.png>  scene k written as a PNG (the crop screen's shots)
 *   node tools/room-model.js --json               one JSON line per scene
 *
 * Each scene is 1024 x 1360 (a phone's 3:4 photo decoded at the page's 1024 width): a lit wall, a ceiling strip in
 * some, a floor band (wood, dark wood, grey carpet, beige carpet or light tile) 8 to 22% of the frame, two to four pieces
 * of furniture standing on the floor line, a window or a frame on the wall in some, a ceiling lamp in some. The default
 * box is shell-capture's fit, read from the page's own block (fixtures/make.html runs that block the same way). */
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm'), zlib = require('node:zlib');
const { loadCoreFull } = require('./core-loader.js');
const { downscaleRGB } = require('./capture-oracle.js');

const ARGS = process.argv.slice(2);
const opt = n => { const i = ARGS.indexOf('--' + n); return i >= 0 ? ARGS[i + 1] : null; };
const PAGE = path.resolve(opt('page') || path.join(__dirname, '..', 'index.html'));
const BW = 1024, BH = 1360, COUNT = 60;
const FLOORS = [
  { name: 'wood', rgb: [150, 102, 62], grain: 22 },
  { name: 'dark wood', rgb: [84, 54, 34], grain: 16 },
  { name: 'grey carpet', rgb: [112, 112, 118], grain: 6 },
  { name: 'beige carpet', rgb: [192, 172, 142], grain: 6 },
  { name: 'light tile', rgb: [216, 214, 208], grain: 0 }
];
const WALLS = [[232, 226, 214], [214, 220, 226], [238, 236, 230], [206, 196, 178], [196, 210, 200], [226, 214, 200]];
const FURN = [[72, 46, 30], [232, 230, 224], [122, 122, 128], [62, 82, 122], [150, 104, 64], [44, 44, 48], [168, 60, 52]];

function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* scene k: its floor type is k % 5, its draw from a seed of k */
function paint(k) {
  const r = rng(0x5b1 + k * 7919), px = Buffer.alloc(BW * BH * 3), F = FLOORS[k % FLOORS.length];
  const pick = a => a[Math.floor(r() * a.length)], range = (a, b) => a + (b - a) * r();
  const exposure = range(0.82, 1.08);
  const rect = (x0, y0, x1, y1, rgb, shade) => {
    x0 = Math.max(0, Math.round(x0)); y0 = Math.max(0, Math.round(y0)); x1 = Math.min(BW, Math.round(x1)); y1 = Math.min(BH, Math.round(y1));
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
      const f = shade ? shade(x, y) : 1, i = (y * BW + x) * 3;
      for (let c = 0; c < 3; c++) px[i + c] = Math.max(0, Math.min(255, Math.round(rgb[c] * f)));
    }
  };
  const wall = pick(WALLS), floorY = Math.round(BH * (1 - range(0.08, 0.22)));
  /* the wall, lit from above and a little from one side */
  const side = r() < 0.5 ? 1 : -1;
  rect(0, 0, BW, floorY, wall, (x, y) => 1 - 0.18 * (y / floorY) - 0.08 * (side > 0 ? x / BW : 1 - x / BW));
  /* a ceiling strip, shadowed, in 40% of the scenes */
  if (r() < 0.4) { const cy = Math.round(BH * range(0.03, 0.09)), cc = wall.map(v => v * range(0.55, 0.8)); rect(0, 0, BW, cy, cc); rect(0, cy, BW, cy + 6, cc.map(v => v * 0.8)); }
  /* a window or a frame on the wall */
  if (r() < 0.5) { const wx = range(100, 700), wy = range(150, 420), ww = range(160, 300), wh = range(200, 380); rect(wx - 14, wy - 14, wx + ww + 14, wy + wh + 14, [236, 236, 232]); rect(wx, wy, wx + ww, wy + wh, [200, 222, 240], (x, y) => 1.05 - 0.15 * ((y - wy) / wh)); }
  else if (r() < 0.6) { const fx = range(120, 760), fy = range(260, 520), fw = range(110, 220), fh = range(90, 180); rect(fx, fy, fx + fw, fy + fh, [40, 34, 30]); rect(fx + 10, fy + 10, fx + fw - 10, fy + fh - 10, pick([[180, 120, 80], [90, 120, 150], [200, 190, 160]])); }
  /* a ceiling lamp in half */
  if (r() < 0.5) { const lx = range(300, 720), ly = range(40, 130); rect(lx - 2, 0, lx + 2, ly, [60, 60, 60]); rect(lx - 60, ly, lx + 60, ly + 46, [252, 248, 230]); }
  /* the floor band: grain stripes for wood, speckle for carpet, grout for tile; darker under the wall line */
  rect(0, floorY, BW, BH, F.rgb, (x, y) => {
    let f = 0.86 + 0.18 * ((y - floorY) / (BH - floorY));
    if (F.grain > 6) f *= 1 + ((Math.floor(y / 9) * 37 + Math.floor(x / 170) * 13) % 7 - 3) * F.grain / 600;
    if (F.name === 'light tile' && ((x % 128) < 4 || ((y - floorY) % 96) < 4)) f *= 0.82;
    return f;
  });
  rect(0, floorY, BW, floorY + 10, F.rgb.map(v => v * 0.55));
  /* the furniture: two to four pieces standing on the floor line, left to right, some overlapping */
  const pieces = 2 + Math.floor(r() * 3); let x = range(-80, 60);
  for (let p = 0; p < pieces && x < BW; p++) {
    const kind = pick(['bed', 'dresser', 'bookcase', 'desk', 'chair', 'sofa', 'plant']), col = pick(FURN);
    const w = { bed: range(380, 560), dresser: range(220, 340), bookcase: range(180, 300), desk: range(260, 380), chair: range(110, 170), sofa: range(380, 520), plant: range(70, 120) }[kind];
    const hgt = BH * { bed: range(0.14, 0.22), dresser: range(0.22, 0.32), bookcase: range(0.38, 0.55), desk: range(0.2, 0.26), chair: range(0.18, 0.26), sofa: range(0.16, 0.22), plant: range(0.12, 0.3) }[kind];
    const top = floorY - hgt;
    if (kind === 'desk' || kind === 'chair') { rect(x, top, x + w, top + 26, col); rect(x + 8, top + 26, x + 30, floorY, col); rect(x + w - 30, top + 26, x + w - 8, floorY, col); }
    else if (kind === 'bookcase') { rect(x, top, x + w, floorY, col); for (let s = top + 30; s < floorY - 40; s += 90) for (let b = x + 14; b < x + w - 24; b += range(14, 30)) rect(b, s, b + range(9, 18), s + range(50, 76), pick(FURN.concat([[210, 190, 150]]))); }
    else if (kind === 'bed') { rect(x, top, x + w, floorY, col); rect(x, top - 60, x + 26, floorY, col.map(v => v * 0.8)); rect(x + 40, top - 18, x + 150, top + 10, [238, 236, 230]); rect(x + 30, top + 10, x + w, top + 60, pick([[200, 200, 210], [180, 140, 120], [110, 130, 160]])); }
    else if (kind === 'plant') { rect(x + w * 0.25, floorY - 70, x + w * 0.75, floorY, [150, 80, 50]); rect(x, top, x + w, floorY - 70, [64, 112, 60]); }
    else rect(x, top, x + w, floorY, col, (xx, yy) => 1 - 0.12 * ((yy - top) / hgt));
    x += w + range(-40, 160);
  }
  /* sensor noise */
  for (let i = 0; i < px.length; i++) px[i] = Math.max(0, Math.min(255, Math.round(px[i] * exposure + (r() - 0.5) * 10)));
  return { w: BW, h: BH, bpp: 3, px, floor: F.name, floorY };
}

/* the page's own shell-capture block, run in a context with only what its pure functions read */
function captureOf(page) {
  const html = fs.readFileSync(page, 'utf8'), m = html.match(/<script id="shell-capture" data-tool>([\s\S]*?)<\/script>/);
  if (!m) throw new Error('room-model: the page holds no shell-capture block');
  const SB = { GRID: { W: 24, H: 48 } }, ctx = { SB, self: { SB }, window: { SB } };
  vm.runInNewContext(m[1].replace(/\}\)\(\s*[\w.]+\s*\)\s*;?\s*$/, '})(SB);'), ctx);
  return SB.capture;
}
function cropImg(img, c) {
  const px = Buffer.alloc(c.w * c.h * 3);
  for (let y = 0; y < c.h; y++) img.px.copy(px, y * c.w * 3, ((c.y + y) * img.w + c.x) * 3, ((c.y + y) * img.w + c.x + c.w) * 3);
  return { w: c.w, h: c.h, bpp: 3, px };
}
function recordOf(SB, img, crop) {
  const W = SB.GRID.W, H = SB.GRID.H, rgb = downscaleRGB(cropImg(img, crop), W, H), pal = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) pal[i] = SB.palette.nearest(rgb[3 * i], rgb[3 * i + 1], rgb[3 * i + 2]);
  return SB.record.fromJSON({ v: SB.record.V, w: W, h: H, mode: 0, focal: null, rows: SB.record.palToRows(pal, W, H), rows2: null });
}
function png(img, out) {
  const crcT = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; crcT[n] = c >>> 0; }
  const crc = b => { let c = 0xFFFFFFFF; for (const v of b) c = crcT[(c ^ v) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(img.w, 0); ih.writeUInt32BE(img.h, 4); ih[8] = 8; ih[9] = 2;
  const raw = Buffer.alloc(img.h * (img.w * 3 + 1));
  for (let y = 0; y < img.h; y++) img.px.copy(raw, y * (img.w * 3 + 1) + 1, y * img.w * 3, (y + 1) * img.w * 3);
  fs.writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ih), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]));
}

module.exports = { paint, captureOf, recordOf, png, FLOORS, COUNT };
if (require.main === module) {
  if (opt('png') !== null) {
    const k = +opt('png'), out = ARGS[ARGS.indexOf('--png') + 2];
    png(paint(k), out); console.log('scene ' + k + ' (' + FLOORS[k % FLOORS.length].name + ') written to ' + out);
    process.exit(0);
  }
  const SB = loadCoreFull(PAGE).SB, CAP = captureOf(PAGE), rows = [];
  for (let k = 0; k < COUNT; k++) {
    const img = paint(k), crop = CAP.fit(img.w, img.h), lv = SB.pipeline.build(recordOf(SB, img, crop), { firstRoom: true });
    rows.push({ k, floor: img.floor, built: !lv.needsCrop, cause: lv.needsCrop ? (lv.cause || 'none') : '', detail: lv.needsCrop ? lv.detail : '', tabs: lv.needsCrop ? -1 : lv.repair.tabs,
      spawnRow: lv.needsCrop ? -1 : Math.floor(lv.spawn / lv.w), exitRow: lv.needsCrop ? -1 : Math.floor(lv.exit / lv.w), crop });
  }
  if (ARGS.includes('--json')) { for (const r of rows) console.log(JSON.stringify(r)); process.exit(0); }
  console.log('room model, ' + COUNT + ' scenes at ' + BW + 'x' + BH + ', the default box ' + JSON.stringify(rows[0].crop) + ', page ' + path.relative(process.cwd(), PAGE));
  for (const F of FLOORS) {
    const of = rows.filter(r => r.floor === F.name), b = of.filter(r => r.built).length;
    console.log('  ' + F.name.padEnd(13) + String(b).padStart(3) + ' of ' + of.length + ' build');
  }
  const b = rows.filter(r => r.built).length;
  console.log('  ' + 'all'.padEnd(13) + String(b).padStart(3) + ' of ' + rows.length + ' build at the default box');
  const why = {};
  for (const r of rows.filter(x => !x.built)) { const key = r.cause + ': ' + r.detail.replace(/\d+/g, 'N'); why[key] = (why[key] || 0) + 1; }
  for (const [k, n] of Object.entries(why).sort((a, b) => b[1] - a[1])) console.log('  refused ' + String(n).padStart(3) + '  ' + k);
}
