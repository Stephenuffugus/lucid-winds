// What the player sees: the live framing maths (core/framing.js) fed to a real THREE camera
// placed exactly as render/scene.js createOrbitRig places it. No browser, no WebGL.
import * as THREE from '/workspaces/lucid-winds/satellites/keepsies/lib/three.module.min.js';
import { frameFor } from '/workspaces/lucid-winds/satellites/keepsies/src/core/framing.js?v=20261105b';
import { readFileSync } from 'node:fs';
const T = JSON.parse(readFileSync('/workspaces/lucid-winds/satellites/keepsies/src/data/tuning.json', 'utf8'));
const C = T.render.ringerCam, CAL = T.render.calibCam;
const DEG = Math.PI / 180;

export function makeCam(W, H, fov) {
  const cam = new THREE.PerspectiveCamera(fov, W / H, 0.01, 200);
  return cam;
}
// exactly scene.js update(): position from target, azimuth, elevation, distance; lookAt target
export function place(cam, tx, ty, tz, az, elDeg, d) {
  const el = elDeg * DEG;
  cam.position.set(tx + Math.sin(az) * Math.cos(el) * d, ty + Math.sin(el) * d, tz + Math.cos(az) * Math.cos(el) * d);
  cam.lookAt(new THREE.Vector3(tx, ty, tz));
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
}
export function proj(cam, W, H, x, y, z) {
  const v = new THREE.Vector3(x, y, z).project(cam);
  return { x: (v.x * 0.5 + 0.5) * W, y: (-v.y * 0.5 + 0.5) * H, z: v.z };
}
// true on-screen diameter of a sphere: project its silhouette (points on the circle perpendicular to the view ray)
export function spherePx(cam, W, H, c, r) {
  const C3 = new THREE.Vector3(c.x, c.y, c.z);
  const v = C3.clone().sub(cam.position); const dist = v.length(); v.normalize();
  const up = new THREE.Vector3(0, 1, 0); let a = new THREE.Vector3().crossVectors(v, up).normalize();
  const b = new THREE.Vector3().crossVectors(a, v).normalize();
  // silhouette radius as seen: tangent cone, circle radius r*sqrt(1-(r/d)^2) at distance d - r^2/d
  let maxx = -1e9, minx = 1e9, maxy = -1e9, miny = 1e9;
  const rr = r * Math.sqrt(1 - (r / dist) ** 2), back = r * r / dist;
  for (let i = 0; i < 64; i++) {
    const t = i / 64 * Math.PI * 2;
    const p = C3.clone().addScaledVector(v, -back).addScaledVector(a, Math.cos(t) * rr).addScaledVector(b, Math.sin(t) * rr);
    const q = proj(cam, W, H, p.x, p.y, p.z);
    maxx = Math.max(maxx, q.x); minx = Math.min(minx, q.x); maxy = Math.max(maxy, q.y); miny = Math.min(miny, q.y);
  }
  return { w: maxx - minx, h: maxy - miny, dist };
}
// what ringer.js tawOnScreen computes: r = max(16, |proj(p+radius*up)-proj(p)| * 1.35), grabR = 1.6 r
export function tawOnScreen(cam, W, H, p, radius) {
  const c = proj(cam, W, H, p.x, p.y, p.z), e = proj(cam, W, H, p.x, p.y + radius, p.z);
  const raw = Math.hypot(e.x - c.x, e.y - c.y);
  const r = Math.max(16, raw * 1.35);
  return { x: c.x, y: c.y, rawUp: raw, r, grabR: r * 1.6 };
}
// pixel classification: ring / dirt / fogged / sky, sampled on a 2 px grid; HUD bands passed in
export function coverage(cam, W, H, R, hud) {
  const ray = new THREE.Raycaster();
  const step = 2; let n = 0, ring = 0, dirt = 0, sky = 0, fogHalf = 0, ringClear = 0, clear = 0;
  const fogNear = 5.0, fogFar = 16.0;
  const viewDir = new THREE.Vector3(); cam.getWorldDirection(viewDir);
  for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
    n++;
    const ndc = new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1);
    ray.setFromCamera(ndc, cam);
    const o = ray.ray.origin, d = ray.ray.direction;
    const inHud = hud && (y < hud.top || y > H - hud.bottom);
    if (!inHud) clear++;
    if (d.y >= 0) { sky++; continue; }
    const t = -o.y / d.y; const gx = o.x + d.x * t, gz = o.z + d.z * t;
    const depth = t * d.dot(viewDir);
    if (depth > (fogNear + fogFar) / 2) fogHalf++;
    if (Math.hypot(gx, gz) <= R) { ring++; if (!inHud) ringClear++; } else dirt++;
  }
  return { ring: ring / n, dirt: dirt / n, sky: sky / n, fogHalf: fogHalf / n, ringInClear: clear ? ringClear / clear : 0 };
}
// the ring's chalk line projected: bounding box of the visible part, and the share of the circumference on screen
export function ringOnScreen(cam, W, H, R) {
  let on = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9, N = 1440;
  const all = [];
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2; const p = proj(cam, W, H, Math.sin(a) * R, 0, Math.cos(a) * R);
    all.push(p);
    if (p.z < 1 && p.x >= 0 && p.x <= W && p.y >= 0 && p.y <= H) { on++; minx = Math.min(minx, p.x); maxx = Math.max(maxx, p.x); miny = Math.min(miny, p.y); maxy = Math.max(maxy, p.y); }
  }
  let fminx = 1e9, fmaxx = -1e9, fminy = 1e9, fmaxy = -1e9;
  for (const p of all) if (p.z < 1) { fminx = Math.min(fminx, p.x); fmaxx = Math.max(fmaxx, p.x); fminy = Math.min(fminy, p.y); fmaxy = Math.max(fmaxy, p.y); }
  return { onShare: on / N, vis: { minx, maxx, miny, maxy }, full: { w: fmaxx - fminx, h: fmaxy - fminy, minx: fminx, maxx: fmaxx, miny: fminy, maxy: fmaxy } };
}
export function cross(sp) {
  const out = [];
  for (let i = -3; i <= 3; i++) { out.push({ x: i * sp, z: 0 }); if (i !== 0) out.push({ x: 0, z: i * sp }); }
  return out;
}
export { T, C, CAL, DEG, THREE, frameFor };
