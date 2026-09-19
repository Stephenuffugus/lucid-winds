// Beam drawing from sim events only (via sim/trace.js segments), section 8: each straight run is a
// camera-facing quad with additive blending, a scrolling noise and a thin bright core. Width follows
// Intensity on a log scale (10 and 10,000 both read); Focus sets the core's brightness and sharpness.
// Beams draw progressively at cast time; where a beam lands it leaves a soft caustic decal in its colour.
// At most 64 segments are drawn at once: older ones fade. Colour is never the only signal: with
// `patterns` on, red runs solid, green dashed, blue dotted (mixes overlay).
import * as THREE from 'three';
import { grid } from '../sim/hex.js';
import { cellPos, dirVec, colorHex } from './layout.js';

const Y = 0.46;
const MAX_DRAWN = 64;
export function beamWidth(intensity) { return 0.08 + 0.085 * Math.log10(1 + Math.max(0, intensity)); }

const VERT = `
  attribute vec2 aUv;
  varying vec2 vUv;
  void main() { vUv = aUv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const FRAG = `
  uniform vec3 uColor; uniform float uAlpha; uniform float uReveal; uniform float uTime; uniform float uCore;
  uniform float uSharp; uniform float uPreview; uniform float uPattern; uniform float uMask; uniform float uLen;
  varying vec2 vUv;
  float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float n2(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
    return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
  void main() {
    if (vUv.y > uReveal) discard;
    float a = abs(vUv.x);
    float glow = exp(-a * a * 4.0);
    float core = exp(-a * a * uSharp);
    float n = n2(vec2(vUv.y * 2.2 - uTime * 3.0, vUv.x * 1.5)) * 0.55 + n2(vec2(vUv.y * 5.0 - uTime * 5.0, 3.0)) * 0.45;
    vec3 col = uColor * glow * (0.45 + 0.75 * n) + vec3(1.0) * core * uCore;
    float head = exp(-pow(max(0.0, uReveal - vUv.y) * 3.0, 2.0)) * (1.0 - uPreview) * step(vUv.y, uLen - 0.01);
    col += (uColor * 0.6 + 0.8) * head * exp(-a * a * 6.0) * 0.9;
    float tail = smoothstep(0.0, 0.35, vUv.y);
    if (uPattern > 0.5) {
      float m = 1.0;
      if (uMask == 2.0) m = step(0.45, fract(vUv.y * 1.6));
      else if (uMask == 4.0) m = step(0.72, fract(vUv.y * 3.2));
      else if (uMask == 6.0) m = max(step(0.45, fract(vUv.y * 1.6)), step(0.72, fract(vUv.y * 3.2)) * 0.6);
      col *= 0.35 + 0.65 * m;
    }
    gl_FragColor = vec4(col * uAlpha * mix(1.0, tail, 0.6), 1.0);
  }`;

// A camera-facing strip along a straight run. Local frame: x across (-1..1), y along (0..len) in cells.
function stripGeometry(start, v, lenWorld, width, cam) {
  const mid = new THREE.Vector3(start.x + v.x * lenWorld * 0.5, Y, start.z + v.z * lenWorld * 0.5);
  const toCam = cam.clone().sub(mid).normalize();
  const along = new THREE.Vector3(v.x, 0, v.z);
  const side = new THREE.Vector3().crossVectors(along, toCam).normalize().multiplyScalar(width);
  const a = new THREE.Vector3(start.x, Y, start.z), b = a.clone().add(along.clone().multiplyScalar(lenWorld));
  const pos = new Float32Array([
    a.x - side.x, a.y - side.y, a.z - side.z, a.x + side.x, a.y + side.y, a.z + side.z,
    b.x - side.x, b.y - side.y, b.z - side.z, b.x + side.x, b.y + side.y, b.z + side.z,
  ]);
  const cells = lenWorld / Math.sqrt(3);
  const uv = new Float32Array([-1, 0, 1, 0, -1, cells, 1, cells]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('aUv', new THREE.BufferAttribute(uv, 2));
  g.setIndex([0, 2, 1, 1, 2, 3]);
  return g;
}

const decalGeo = new THREE.CircleGeometry(0.9, 24).rotateX(-Math.PI / 2);
const decalMatBase = new THREE.ShaderMaterial({
  uniforms: { uColor: { value: new THREE.Color() }, uAlpha: { value: 0 } },
  vertexShader: 'varying vec2 vP; void main(){ vP = position.xz; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
  fragmentShader: 'uniform vec3 uColor; uniform float uAlpha; varying vec2 vP; void main(){ float r = length(vP) / 0.9; float k = exp(-r*r*3.5) * (0.8 + 0.2*sin(r*18.0)); gl_FragColor = vec4(uColor * k * uAlpha, 1.0); }',
  transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide,
});

export function createBeamView(stage, opts = {}) {
  const root = new THREE.Group();
  stage.scene.add(root);
  const settings = { patterns: !!opts.patterns };
  let preview = [];
  let live = [];
  let decals = [];
  let time = 0;
  const g0 = () => grid(3);

  function makeSeg(g, seg, preview) {
    const start = cellPos(g, seg.from);
    const v = dirVec(seg.dir);
    const step = Math.sqrt(3);
    let len = seg.cells.length * step;
    if (seg.exit) len += step * 0.5;
    const w = beamWidth(seg.intensity) * (preview ? 0.6 : 1) * 1.9;
    const geo = stripGeometry(start, v, Math.max(len, 0.001), w, stage.camera.position);
    const focus = seg.focus10 / 10;
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: {
        uColor: { value: new THREE.Color(colorHex(seg.color)) }, uAlpha: { value: preview ? 0.34 : 1 }, uReveal: { value: preview ? 1e9 : 0 },
        uTime: { value: 0 }, uCore: { value: preview ? 0.25 : Math.min(1.6, 0.55 + 0.35 * Math.log2(Math.max(1, focus))) },
        uSharp: { value: 18 + 22 * Math.min(4, Math.log2(Math.max(1, focus)) + 1) }, uPreview: { value: preview ? 1 : 0 },
        uPattern: { value: settings.patterns ? 1 : 0 }, uMask: { value: seg.color }, uLen: { value: len / step },
      },
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.renderOrder = 6;
    mesh.frustumCulled = false;
    root.add(mesh);
    return { seg, mesh, mat, len, cells: len / step, landed: false, fade: 1, born: 0 };
  }
  function drop(list) { for (const s of list) { root.remove(s.mesh); s.mesh.geometry.dispose(); s.mat.dispose(); } list.length = 0; }

  function showPreview(segments, radius, fogCells) {
    drop(preview);
    const g = grid(radius);
    const fog = new Set(fogCells || []);
    for (const seg of segments) {
      if (fog.has(seg.from)) continue;
      let cells = seg.cells, exit = seg.exit;
      const fi = cells.findIndex((c) => fog.has(c));
      if (fi >= 0) { cells = cells.slice(0, fi); exit = false; }
      if (!cells.length && !exit) continue;
      preview.push(makeSeg(g, { ...seg, cells, exit }, true));
    }
  }
  function hidePreview() { drop(preview); }

  function beginCast(segments, radius) {
    drop(live);
    const g = grid(radius);
    for (const seg of segments) {
      const s = makeSeg(g, seg, false);
      s.mesh.visible = false;
      live.push(s);
    }
  }

  function addDecal(cell, color, strength = 1) {
    const p = cellPos(g0(), cell);
    const m = decalMatBase.clone();
    m.uniforms.uColor.value = new THREE.Color(colorHex(color));
    m.uniforms.uAlpha.value = 0.55 * strength;
    const d = new THREE.Mesh(decalGeo, m);
    d.position.set(p.x, 0.025, p.z);
    d.renderOrder = 4;
    root.add(d);
    decals.push({ d, m, life: 1.6, a0: 0.55 * strength });
  }

  // Reveal every segment up to tick T; keep at most 64 drawn (older fade out).
  function reveal(T) {
    let drawn = 0;
    for (let i = live.length - 1; i >= 0; i--) {
      const s = live[i];
      const k = T - s.seg.t0;
      if (k <= 0) { s.mesh.visible = false; continue; }
      s.mesh.visible = true;
      drawn++;
      if (drawn > MAX_DRAWN) s.fade = Math.max(0, s.fade - 0.08);
      s.mat.uniforms.uReveal.value = Math.min(s.cells + 0.5, k);
      s.mat.uniforms.uAlpha.value = s.fade;
      if (!s.landed && k >= s.cells) {
        s.landed = true;
        const last = s.seg.cells[s.seg.cells.length - 1];
        if (last !== undefined && !s.seg.exit) addDecal(last, s.seg.color, Math.min(1.4, 0.5 + 0.2 * Math.log10(1 + s.seg.intensity)));
      }
    }
  }

  function update(dt) {
    time += dt;
    for (const s of live) s.mat.uniforms.uTime.value = time;
    for (const s of preview) s.mat.uniforms.uTime.value = time * 0.5;
    for (let i = decals.length - 1; i >= 0; i--) {
      const d = decals[i];
      d.life -= dt;
      d.m.uniforms.uAlpha.value = Math.max(0, d.a0 * Math.min(1, d.life / 1.2));
      if (d.life <= 0) { root.remove(d.d); d.m.dispose(); decals.splice(i, 1); }
    }
  }

  function clearDecals() { for (const d of decals) { root.remove(d.d); d.m.dispose(); } decals = []; }
  function fadeAll(a) { for (const s of live) s.fade *= a; for (const s of live) s.mat.uniforms.uAlpha.value = s.fade; }
  function endCast() { drop(live); }
  function setPatterns(on) { settings.patterns = on; for (const s of [...live, ...preview]) s.mat.uniforms.uPattern.value = on ? 1 : 0; }

  return { root, showPreview, hidePreview, beginCast, reveal, update, addDecal, clearDecals, fadeAll, endCast, setPatterns, get liveCount() { return live.length; } };
}
