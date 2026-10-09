/* Dewball forge REPORT: measure what was actually packed, against the manifest. Spends nothing.
 *
 *   node satellites/dewball/tools/forge/report.mjs <served dir with index.json> [--json out.json]
 *
 * Reads each GLB's own JSON chunk (no loader, no browser): triangles from the index
 * accessor, the bounding box from the POSITION accessor's min/max through the node's
 * transform, every image's bytes and pixel size (JPEG SOF / PNG IHDR). Then:
 *   RED when triangles exceed the kind's budget by more than 2%,
 *   RED when the largest extent misses the PRIMITIVE's largest extent by more than 1%
 *       (the fit law, dewfit.py step 4: the model is exactly as big on screen as today),
 *   RED when a texture is larger than the kind's cap, or there is no texture,
 *   RED when a file the index names is missing.
 * A v2 index ({worlds:{w1:{atlas,kinds}}}) is read per world: there a kind must carry NO
 * image of its own (the world's atlas pays for every kind once) and must keep TEXCOORD_0,
 * and each atlas is RED over --atlas-mb (default 18: the plan's 24 MB per world less the
 * game's own textures, measured 5.96 MB in w1 by DB_DEV.perf().texMB).
 * Last line REPORT_PASS or REPORT_FAIL. ⛔ Watch it fail first: --plant-budget halves
 * every budget, which must turn a clean set red.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const dir = process.argv[2];
if (!dir) { console.log('usage: report.mjs <served dir> [--json out]'); process.exit(2); }
const plantBudget = process.argv.includes('--plant-budget');
const M = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(HERE, 'manifest.json'), 'utf8')).kinds.map(k => [k.id, k]));
const index = JSON.parse(fs.readFileSync(path.join(dir, 'index.json'), 'utf8'));
const ai = process.argv.indexOf('--atlas-mb'), atlasCap = ai > 0 ? +process.argv[ai + 1] : 18;
const entries = index.worlds
  ? Object.entries(index.worlds).flatMap(([w, e]) => Object.entries(e.kinds || {}).map(([k, v]) => [w, k, v]))
  : Object.entries(index.kinds || {}).map(([k, v]) => [null, k, v]);

function glbJson(buf) {
  if (buf.readUInt32LE(0) !== 0x46546C67) throw new Error('not a GLB');
  const jl = buf.readUInt32LE(12);
  const json = JSON.parse(buf.slice(20, 20 + jl).toString('utf8'));
  const binStart = 20 + jl + 8;
  return { json, bin: buf.slice(binStart) };
}
function imgSize(b) {
  if (b[0] === 0x89 && b[1] === 0x50) return [b.readUInt32BE(16), b.readUInt32BE(20)];
  if (b[0] === 0xFF && b[1] === 0xD8) {
    let o = 2;
    while (o < b.length) {
      if (b[o] !== 0xFF) { o++; continue; }
      const m = b[o + 1], len = b.readUInt16BE(o + 2);
      if (m >= 0xC0 && m <= 0xCF && m !== 0xC4 && m !== 0xC8 && m !== 0xCC) return [b.readUInt16BE(o + 7), b.readUInt16BE(o + 5)];
      o += 2 + len;
    }
  }
  return null;
}
function nodeMatrix(n) {
  if (n.matrix) return n.matrix;
  const t = n.translation || [0, 0, 0], r = n.rotation || [0, 0, 0, 1], s = n.scale || [1, 1, 1];
  const [x, y, z, w] = r;
  return [(1 - 2 * (y * y + z * z)) * s[0], (2 * (x * y + z * w)) * s[0], (2 * (x * z - y * w)) * s[0], 0,
    (2 * (x * y - z * w)) * s[1], (1 - 2 * (x * x + z * z)) * s[1], (2 * (y * z + x * w)) * s[1], 0,
    (2 * (x * z + y * w)) * s[2], (2 * (y * z - x * w)) * s[2], (1 - 2 * (x * x + y * y)) * s[2], 0, t[0], t[1], t[2], 1];
}
const fails = [], rows = [];
let totalBytes = 0, texBytes = 0;
for (const [wid, kind, ent] of entries) {
  const f = path.join(dir, ent.glb), atlasMode = !!(wid && index.worlds[wid].atlas);
  if (!fs.existsSync(f)) { fails.push(kind + ': missing file ' + ent.glb); continue; }
  const k = M[kind];
  if (!k) { fails.push(kind + ': not a kind'); continue; }
  const buf = fs.readFileSync(f), { json } = glbJson(buf);
  let tris = 0; const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  (json.nodes || []).forEach(n => {
    if (n.mesh === undefined) return;
    const mm = nodeMatrix(n);
    json.meshes[n.mesh].primitives.forEach(p => {
      const pa = json.accessors[p.attributes.POSITION];
      tris += (p.indices !== undefined ? json.accessors[p.indices].count : pa.count) / 3;
      for (let c = 0; c < 8; c++) {
        const v = [c & 1 ? pa.max[0] : pa.min[0], c & 2 ? pa.max[1] : pa.min[1], c & 4 ? pa.max[2] : pa.min[2]];
        for (let a = 0; a < 3; a++) {
          const w = mm[a] * v[0] + mm[4 + a] * v[1] + mm[8 + a] * v[2] + mm[12 + a];
          mn[a] = Math.min(mn[a], w); mx[a] = Math.max(mx[a], w);
        }
      }
    });
  });
  const ext = mn.map((v, a) => +(mx[a] - v).toFixed(2));
  const imgs = (json.images || []).map(im => {
    const bv = json.bufferViews[im.bufferView];
    const bin = buf.slice(20 + buf.readUInt32LE(12) + 8 + (bv.byteOffset || 0), 20 + buf.readUInt32LE(12) + 8 + (bv.byteOffset || 0) + bv.byteLength);
    return { mime: im.mimeType, bytes: bv.byteLength, size: imgSize(bin) };
  });
  const budget = plantBudget ? Math.floor(k.budgetTris / 2) : k.budgetTris, cap = k.budgetTex || 256;
  const want = Math.max(...k.bbox), got = Math.max(...ext);
  const why = [];
  if (tris > budget * 1.02) why.push(`tris ${tris} over budget ${budget}`);
  if (Math.abs(got - want) > want * 0.01) why.push(`size ${got} misses the primitive's ${want} by ${((got / want - 1) * 100).toFixed(1)}%`);
  if (mn[1] < -want * 0.005) why.push(`dips below the floor (min y ${mn[1].toFixed(2)})`);
  if (!atlasMode && !imgs.length) why.push('no texture');
  if (atlasMode && imgs.length) why.push('carries its own image in atlas mode (the atlas already pays for it)');
  if (atlasMode && json.meshes.some(m => m.primitives.some(p => p.attributes.TEXCOORD_0 === undefined))) why.push('lost TEXCOORD_0 (pack without -kv?)');
  /* proportion drift: a WARNING, not a fail. One uniform scale keeps every model as big as
     its primitive in its largest direction, but Meshy chooses its own proportions (the pilot
     cake stand came back 0.58 as wide for its height). The look review decides; the prompt
     is the lever. */
  const aspM = Math.max(ext[0], ext[2]) / Math.max(1e-6, ext[1]), aspP = Math.max(k.bbox[0], k.bbox[2]) / Math.max(1e-6, k.bbox[1]);
  const drift = aspM / aspP;
  const warn = (drift < 0.75 || drift > 1.33) ? `width for height ${drift.toFixed(2)}x the primitive's` : '';
  imgs.forEach(im => { if (im.size && Math.max(...im.size) > cap) why.push(`texture ${im.size.join('x')} over cap ${cap}`); });
  totalBytes += buf.length; texBytes += imgs.reduce((s, im) => s + im.bytes, 0);
  rows.push({ world: wid, kind, tris, budget, extent: ext, prim: k.bbox, aspectDrift: +drift.toFixed(2), warn, floorY: +mn[1].toFixed(2), textures: imgs, bytes: buf.length, ok: !why.length });
  why.forEach(w => fails.push(kind + ': ' + w));
  console.log(`${why.length ? 'MISS' : 'ok  '} ${kind.padEnd(14)} tris ${String(tris).padStart(5)}/${budget} extent ${ext.join('x')} (prim ${k.bbox.join('x')}) tex ${imgs.map(i => (i.size || ['?']).join('x') + ' ' + (i.bytes / 1024).toFixed(0) + 'KB').join(',')} file ${(buf.length / 1024).toFixed(0)}KB${warn ? '  WARN ' + warn : ''}`);
}
const atlases = [];
for (const [wid, e] of Object.entries(index.worlds || {})) {
  if (!e.atlas) continue;
  const f = path.join(dir, e.atlas);
  if (!fs.existsSync(f)) { fails.push(wid + ': missing atlas ' + e.atlas); continue; }
  const b = fs.readFileSync(f), sz = imgSize(b), mb = sz ? sz[0] * sz[1] * 4 * 4 / 3 / 1048576 : Infinity;
  atlases.push({ world: wid, file: e.atlas, size: sz, bytes: b.length, gpuMB: +mb.toFixed(1) });
  totalBytes += b.length; texBytes += b.length;
  console.log(`${mb > atlasCap ? 'MISS' : 'ok  '} ${wid} atlas ${sz ? sz.join('x') : '?'} ${(b.length / 1024).toFixed(0)}KB, ${mb.toFixed(1)} MB on the GPU with mips (cap ${atlasCap})`);
  if (mb > atlasCap) fails.push(`${wid}: atlas ${mb.toFixed(1)} MB on the GPU over the cap ${atlasCap}`);
}
const ji = process.argv.indexOf('--json');
if (ji > 0) fs.writeFileSync(process.argv[ji + 1], JSON.stringify({ dir, rows, atlases, totalBytes, texBytes }, null, 1) + '\n');
console.log(`files ${rows.length}, total ${(totalBytes / 1024).toFixed(0)} KB, textures ${(texBytes / 1024).toFixed(0)} KB`);
if (fails.length) { console.log('REPORT_FAIL ' + fails.length + ':\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('REPORT_PASS ' + dir);
