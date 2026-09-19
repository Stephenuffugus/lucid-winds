// The Three.js stage: renderer, a fixed camera tilted about 35 degrees (portrait first), lights, resize.
// The board is framed inside the layout's board zone (between the HUD bars) with a view offset.
import * as THREE from 'three';
import { boardExtent } from './layout.js';
import { makeEnvironment, quality } from './materials.js';

export const TILT = (35 * Math.PI) / 180;

export function createStage(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x07060a, 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.5, 200);
  // One directional light plus a generated environment map (section 8 performance budget).
  const key = new THREE.DirectionalLight(0xfff1dc, 1.5);
  key.position.set(-6, 14, 8);
  scene.add(key);
  const env = makeEnvironment(renderer);
  // The low-cost path (weak phones, software WebGL) drops the environment map along with the glass.
  const applyEnv = (level) => { scene.environment = level === 'low' ? null : env; };
  applyEnv(quality.level);
  quality.listeners.add(applyEnv);
  scene.environmentIntensity = 1.0;
  renderer.transmissionResolutionScale = 0.5;

  // Board zone as fractions of the viewport height (section 11 layout).
  const zone = { top: 0.15, bottom: 0.7 };
  let radius = 3;
  let azimuth = 0;
  let dist = 20;
  const listeners = [];

  function frame() {
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    const ext = boardExtent(radius);
    const bw = ext.maxX - ext.minX, bd = ext.maxZ - ext.minZ;
    const tanY = Math.tan((camera.fov * Math.PI) / 360);
    const zoneH = zone.bottom - zone.top;
    // distance so the width fits (with a 4% margin each side) and the tilted depth fits the zone
    const dW = bw / (2 * tanY * camera.aspect * 0.92);
    const dH = (bd * Math.cos(TILT) + 1.2) / (2 * tanY * zoneH * 0.96);
    const d = Math.max(dW, dH);
    dist = d;
    camera.position.set(Math.sin(azimuth) * d * Math.sin(TILT), d * Math.cos(TILT), Math.cos(azimuth) * d * Math.sin(TILT));
    camera.lookAt(0, 0, 0);
    const center = (zone.top + zone.bottom) / 2;
    camera.setViewOffset(w, h, 0, (0.5 - center) * h, w, h);
    camera.updateProjectionMatrix();
    for (const f of listeners) f(w, h);
  }
  frame();
  window.addEventListener('resize', frame);
  return {
    THREE, renderer, scene, camera, zone,
    setRadius(r) { radius = r; frame(); },
    get azimuth() { return azimuth; },
    setAzimuth(a) { azimuth = a; camera.position.set(Math.sin(a) * dist * Math.sin(TILT), dist * Math.cos(TILT), Math.cos(a) * dist * Math.sin(TILT)); camera.lookAt(0, 0, 0); },
    onResize(f) { listeners.push(f); },
    resize: frame,
  };
}
