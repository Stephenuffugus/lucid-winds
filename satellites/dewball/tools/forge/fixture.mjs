/* Dewball forge: TEST MODELS that prove the loading path before a credit is spent.
 *
 *   node satellites/dewball/tools/forge/fixture.mjs        -> tools/forge/glbtest/<kind>.glb + index.json
 *
 * Each fixture is the game's OWN primitive geometry for a kind (read from the engine,
 * never retyped), given box projected UVs and a loud two colour checker, written as a
 * glTF 2.0 binary, then packed with the production flags (gltfpack -cc -kn -km -kv
 * -noq), so the gate exercises exactly what real Meshy files will: meshopt decoding
 * through the vendored r147 decoder, an embedded texture, one mesh per file.
 * The checker is the point: a modelled instance near the ball shows checks, the same
 * kind past the LOD radius shows its plain vertex colours, and a picture says which
 * set drew what. Never shipped as art; the folder is a test fixture.
 */
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { execFileSync } from 'child_process';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const HERE = path.dirname(fileURLToPath(import.meta.url));
const GAME = path.resolve(HERE, '..', '..');
const H = require(path.join(GAME, 'node_harness.js'));
const OUT = path.join(HERE, 'glbtest');
const RAW = path.join(OUT, 'raw');
const KINDS = (process.argv.find(a => a.startsWith('--kinds=')) || '--kinds=teacup,sandwich,cakestand,teapot,ant').slice(8).split(',');

function inject(src) {
  const anchor = 'window.DB_DEV={';
  if (src.split(anchor).length !== 2) throw new Error('fixture: DB_DEV anchor not unique');
  return src.replace(anchor, 'window.__DWG=function(k){return kindGeo(k);};' + anchor);
}

/* ---- a PNG, the smallest honest encoder: RGBA, filter 0, zlib ---- */
function crc(buf) { return zlib.crc32(buf) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const c = Buffer.alloc(4); c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
}
function png(w, h, rgba) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4); }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
function checker(c1, c2) {
  const W = 64, buf = Buffer.alloc(W * W * 4);
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) {
    const c = ((x >> 3) + (y >> 3)) & 1 ? c1 : c2, o = (y * W + x) * 4;
    buf[o] = c[0]; buf[o + 1] = c[1]; buf[o + 2] = c[2]; buf[o + 3] = 255;
  }
  return png(W, W, buf);
}

/* ---- a GLB: one mesh, one textured material, non indexed ---- */
function pad4(b, fill) { const r = b.length % 4; return r ? Buffer.concat([b, Buffer.alloc(4 - r, fill)]) : b; }
function glb(name, pos, nrm, uv, image) {
  const fb = a => Buffer.from(new Float32Array(a).buffer);
  const P = pad4(fb(pos), 0), N = pad4(fb(nrm), 0), U = pad4(fb(uv), 0), I = pad4(image, 0);
  const n = pos.length / 3, mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < n; i++) for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], pos[i * 3 + k]); mx[k] = Math.max(mx[k], pos[i * 3 + k]); }
  let off = 0; const view = (buf, target) => { const v = { buffer: 0, byteOffset: off, byteLength: buf.length }; if (target) v.target = target; off += buf.length; return v; };
  const bufferViews = [view(P, 34962), view(N, 34962), view(U, 34962), view(I)];
  const json = {
    asset: { version: '2.0', generator: 'dewball forge fixture' }, scene: 0, scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: name }],
    meshes: [{ name: name, primitives: [{ attributes: { POSITION: 0, NORMAL: 1, TEXCOORD_0: 2 }, material: 0 }] }],
    materials: [{ name: 'dw_' + name, pbrMetallicRoughness: { baseColorTexture: { index: 0 }, metallicFactor: 0, roughnessFactor: 1 } }],
    textures: [{ source: 0, sampler: 0 }], samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
    images: [{ bufferView: 3, mimeType: 'image/png' }],
    accessors: [
      { bufferView: 0, componentType: 5126, count: n, type: 'VEC3', min: mn, max: mx },
      { bufferView: 1, componentType: 5126, count: n, type: 'VEC3' },
      { bufferView: 2, componentType: 5126, count: n, type: 'VEC2' }],
    bufferViews, buffers: [{ byteLength: off }]
  };
  const J = pad4(Buffer.from(JSON.stringify(json), 'utf8'), 0x20), B = Buffer.concat([P, N, U, I]);
  const head = Buffer.alloc(12); head.writeUInt32LE(0x46546C67, 0); head.writeUInt32LE(2, 4); head.writeUInt32LE(12 + 8 + J.length + 8 + B.length, 8);
  const jh = Buffer.alloc(8); jh.writeUInt32LE(J.length, 0); jh.writeUInt32LE(0x4E4F534A, 4);
  const bh = Buffer.alloc(8); bh.writeUInt32LE(B.length, 0); bh.writeUInt32LE(0x004E4942, 4);
  return Buffer.concat([head, jh, J, bh, B]);
}

const D = H.boot({ seed: 12345, inject });
const win = D._win;
fs.mkdirSync(RAW, { recursive: true });
const index = { note: 'TEST FIXTURE: the game primitives with a checker, packed like production. Not art.', kinds: {} };
for (const kid of KINDS) {
  const g = win.__DWG(kid);
  const pos = Array.from(g.attributes.position.array), nrm = Array.from(g.attributes.normal.array), col = g.attributes.color.array;
  g.computeBoundingBox(); const bb = g.boundingBox;
  const ext = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y, bb.max.z - bb.min.z) || 1, cell = ext / 3;
  const uv = [];
  for (let t = 0; t < pos.length / 9; t++) {
    /* box projection: drop the triangle's dominant normal axis */
    const nx = Math.abs(nrm[t * 9]), ny = Math.abs(nrm[t * 9 + 1]), nz = Math.abs(nrm[t * 9 + 2]);
    for (let v = 0; v < 3; v++) {
      const x = pos[t * 9 + v * 3], y = pos[t * 9 + v * 3 + 1], z = pos[t * 9 + v * 3 + 2];
      if (ny >= nx && ny >= nz) uv.push(x / cell, z / cell); else if (nx >= nz) uv.push(z / cell, y / cell); else uv.push(x / cell, y / cell);
    }
  }
  /* the kind's own first colour against a loud magenta: unmistakable on screen */
  const c1 = [Math.round(col[0] * 255), Math.round(col[1] * 255), Math.round(col[2] * 255)], c2 = [235, 40, 200];
  const rawPath = path.join(RAW, kid + '.glb'), outPath = path.join(OUT, kid + '.glb');
  fs.writeFileSync(rawPath, glb(kid, pos, nrm, uv, checker(c1, c2)));
  execFileSync('gltfpack', ['-cc', '-kn', '-km', '-kv', '-noq', '-i', rawPath, '-o', outPath], { stdio: 'pipe' });
  index.kinds[kid] = { glb: kid + '.glb', tris: pos.length / 9, fixture: true };
  console.log(kid.padEnd(10), 'tris', String(pos.length / 9).padStart(5), 'raw', fs.statSync(rawPath).size, 'packed', fs.statSync(outPath).size);
}
fs.rmSync(RAW, { recursive: true, force: true });
fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify(index, null, 1) + '\n');
console.log('wrote', path.relative(GAME, OUT) + '/index.json with', Object.keys(index.kinds).length, 'kinds');
