// Silhouette loader: the procedural placeholder, or a real Meshy GLB + mask PNG by name
// (OPUS_PROMPT: swapping in the Meshy assets later is a file drop plus a manifest line).

import { SILHOUETTES } from './silhouettes.js';
import { buildSilhouette, buildMask, MASK_SIZE } from '../assets/geo/placeholder.js';

export async function loadSilhouettes(base = './') {
  let manifest = { glb: [] };
  try {
    const r = await fetch(base + 'assets/geo/manifest.json');
    if (r.ok) manifest = await r.json();
  } catch (e) { /* offline first run: placeholders */ }
  const wanted = new Set(manifest.glb || []);
  const out = [];
  for (const sil of SILHOUETTES) {
    let g = null;
    if (wanted.has(sil.key)) {
      try { g = await loadGlb(base, sil); } catch (e) { console.warn('TUMBLE: GLB for', sil.key, 'failed, using placeholder', e); }
    }
    if (!g) g = { ...buildSilhouette(sil), mask: buildMask(sil), source: 'placeholder' };
    out.push(g);
  }
  return out;
}

async function loadGlb(base, sil) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const gltf = await new GLTFLoader().loadAsync(base + 'assets/geo/' + sil.key + '.glb');
  let mesh = null;
  gltf.scene.traverse((o) => { if (!mesh && o.isMesh) mesh = o; });
  if (!mesh) throw new Error('no mesh in GLB');
  const geo = mesh.geometry.clone();
  geo.applyMatrix4(mesh.matrixWorld);
  if (!geo.attributes.normal) geo.computeVertexNormals();
  geo.computeBoundingBox();
  const bb = geo.boundingBox;
  // recentre on the footprint and rescale so the long axis matches the placeholder's
  const ref = buildSilhouette(sil);
  let rx = Infinity, RX = -Infinity;
  for (let i = 0; i < ref.positions.length; i += 3) { rx = Math.min(rx, ref.positions[i]); RX = Math.max(RX, ref.positions[i]); }
  const s = (RX - rx) / Math.max(1e-6, bb.max.x - bb.min.x);
  const cx = (bb.min.x + bb.max.x) / 2, cz = (bb.min.z + bb.max.z) / 2;
  geo.translate(-cx, -bb.min.y, -cz);
  geo.scale(s, s, s);
  const pos = geo.attributes.position.array;
  const n = pos.length / 3;
  const index = geo.index ? geo.index.array : Uint32Array.from({ length: n }, (_, i) => i);
  const mask = await loadMask(base + 'assets/masks/' + sil.key + '.png');
  return {
    key: sil.key,
    positions: new Float32Array(pos),
    normals: new Float32Array(geo.attributes.normal.array),
    uvs: new Float32Array(geo.attributes.uv ? geo.attributes.uv.array : new Float32Array(n * 2)),
    shade: new Float32Array(n).fill(1),
    indices: index.length > 65535 ? new Uint32Array(index) : new Uint16Array(index),
    heelS: ref.heelS,
    length: ref.length,
    circumference: ref.circumference,
    mask,
    source: 'glb',
  };
}

function loadMask(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = c.height = MASK_SIZE;
      const x = c.getContext('2d');
      x.drawImage(img, 0, 0, MASK_SIZE, MASK_SIZE);
      resolve(x.getImageData(0, 0, MASK_SIZE, MASK_SIZE).data);
    };
    img.onerror = reject;
    img.src = url;
  });
}
