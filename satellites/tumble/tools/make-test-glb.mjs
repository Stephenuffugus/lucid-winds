// Writes real GLB files (glTF 2.0 binary) plus mask PNGs from the procedural silhouettes into dev/glbtest/, so the
// Meshy drop-in path (src/geo.js loadGlb) is exercised by a gate before any Meshy file exists. The GLB carries the
// placeholder's positions, normals, UVs and indices and nothing else (no shade attribute), exactly what a Blender
// export would carry. node tools/make-test-glb.mjs [keys...]   (default: crew knee)
import { writeFileSync, mkdirSync } from 'fs';
import { SILHOUETTES } from '../src/silhouettes.js';
import { buildSilhouette, buildMask, MASK_SIZE } from '../assets/geo/placeholder.js';
import { encodePNG } from './png.mjs';

const keys = process.argv.slice(2).length ? process.argv.slice(2) : ['crew', 'knee'];
const out = new URL('../dev/glbtest/assets/', import.meta.url).pathname;
mkdirSync(out + 'geo', { recursive: true }); mkdirSync(out + 'masks', { recursive: true });

function glb(g) {
  const pos = Float32Array.from(g.positions), nrm = Float32Array.from(g.normals), uv = Float32Array.from(g.uvs);
  const n = pos.length / 3;
  const idx = g.indices.length > 65535 || n > 65535 ? Uint32Array.from(g.indices) : Uint16Array.from(g.indices);
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < pos.length; i += 3) for (let k = 0; k < 3; k++) { min[k] = Math.min(min[k], pos[i + k]); max[k] = Math.max(max[k], pos[i + k]); }
  const pad4 = (b) => { const p = (4 - (b.length % 4)) % 4; return p ? Buffer.concat([b, Buffer.alloc(p)]) : b; };
  const parts = [Buffer.from(pos.buffer), Buffer.from(nrm.buffer), Buffer.from(uv.buffer), Buffer.from(idx.buffer)].map(pad4);
  const views = []; let off = 0;
  for (const p of parts) { views.push({ buffer: 0, byteOffset: off, byteLength: p.length }); off += p.length; }
  const bin = Buffer.concat(parts);
  const json = {
    asset: { version: '2.0', generator: 'TUMBLE tools/make-test-glb.mjs' },
    scene: 0, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, name: g.key }],
    meshes: [{ name: g.key, primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, indices: 3, mode: 4 }] }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: n, type: 'VEC3', min, max },
      { bufferView: 1, componentType: 5126, count: n, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: n, type: 'VEC2' },
      { bufferView: 3, componentType: idx instanceof Uint32Array ? 5125 : 5123, count: idx.length, type: 'SCALAR' },
    ],
    bufferViews: views, buffers: [{ byteLength: bin.length }],
  };
  let js = Buffer.from(JSON.stringify(json), 'utf8');
  while (js.length % 4) js = Buffer.concat([js, Buffer.from(' ')]);
  const header = Buffer.alloc(12); header.write('glTF', 0, 'ascii'); header.writeUInt32LE(2, 4); header.writeUInt32LE(12 + 8 + js.length + 8 + bin.length, 8);
  const ch = (len, type) => { const b = Buffer.alloc(8); b.writeUInt32LE(len, 0); b.writeUInt32LE(type, 4); return b; };
  return Buffer.concat([header, ch(js.length, 0x4e4f534a), js, ch(bin.length, 0x004e4942), bin]);
}

for (const key of keys) {
  const sil = SILHOUETTES.find((s) => s.key === key);
  if (!sil) { console.log('no silhouette', key); continue; }
  const g = buildSilhouette(sil);
  const file = glb(g);
  writeFileSync(out + 'geo/' + key + '.glb', file);
  const mask = buildMask(sil);
  writeFileSync(out + 'masks/' + key + '.png', encodePNG(new Uint8Array(mask.buffer || mask), MASK_SIZE, MASK_SIZE));
  console.log(`${key}: ${g.positions.length / 3} vertices, ${g.indices.length / 3} triangles, glb ${file.length} bytes`);
}
writeFileSync(out + 'geo/manifest.json', JSON.stringify({ _readme: 'gate fixture: real GLB + mask files made by tools/make-test-glb.mjs from the placeholders, loaded with ?base=dev/glbtest/', glb: keys }, null, 2) + '\n');
console.log('manifest:', keys.join(' '));
