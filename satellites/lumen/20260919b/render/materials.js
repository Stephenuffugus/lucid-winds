// Materials for the jeweller's bench: a generated gradient-studio environment map (section 12: no HDRI
// download), physical glass per stone (transmission, IOR 1.5-2.4 by stone, dispersion, attenuation colour),
// and the low-cost fallback (a matcap with a fake fresnel rim) that the quality monitor swaps in when the
// frame rate drops (section 8).
import * as THREE from 'three';

let envTexture = null;

// A small studio: dark velvet room, a warm softbox overhead-left, a cool strip right, a low bounce.
export function makeEnvironment(renderer) {
  if (envTexture) return envTexture;
  const scene = new THREE.Scene();
  const room = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    uniforms: {},
    vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `varying vec3 vP;
      void main(){
        float h = vP.y * 0.5 + 0.5;
        vec3 floorC = vec3(0.012, 0.010, 0.016);
        vec3 wallC = vec3(0.14, 0.11, 0.085);
        vec3 c = mix(floorC, wallC, smoothstep(0.2, 0.75, h));
        c += vec3(0.95, 0.78, 0.55) * pow(max(0.0, dot(vP, normalize(vec3(-0.5, 0.8, 0.35)))), 12.0) * 7.0;
        c += vec3(0.55, 0.68, 1.0) * pow(max(0.0, dot(vP, normalize(vec3(0.85, 0.35, -0.2)))), 20.0) * 4.0;
        c += vec3(1.0) * pow(max(0.0, dot(vP, normalize(vec3(0.1, 0.95, 0.9)))), 60.0) * 9.0;
        c += vec3(0.25, 0.2, 0.15) * pow(max(0.0, dot(vP, normalize(vec3(0.0, -0.2, 1.0)))), 6.0) * 0.6;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  scene.add(room);
  const pmrem = new THREE.PMREMGenerator(renderer);
  envTexture = pmrem.fromScene(scene, 0.015, 0.1, 100, { size: 256 }).texture;
  pmrem.dispose();
  return envTexture;
}

const glassCache = new Map();
const matcapCache = new Map();
export const quality = { level: 'high', listeners: new Set() };

function stoneColor(stone) { return new THREE.Color(stone.hex); }

// Physical glass for a stone (one shared material per stone; gems clone it for per-gem flashes).
export function glassFor(stone) {
  if (glassCache.has(stone.id)) return glassCache.get(stone.id);
  const c = stoneColor(stone);
  const white = stone.channels === 7 || stone.neutral;
  const m = new THREE.MeshPhysicalMaterial({
    color: white ? new THREE.Color(0xffffff) : c.clone().lerp(new THREE.Color(0xffffff), 0.25),
    transmission: white ? 0.7 : 0.5,
    thickness: 0.8,
    ior: stone.ior,
    dispersion: white ? 6 : 2,
    attenuationColor: white ? new THREE.Color(0xf4f6ff) : c.clone(),
    attenuationDistance: white ? 3 : 0.35,
    roughness: 0.04,
    metalness: 0,
    specularIntensity: 1,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    iridescence: white ? 0.25 : 0.1,
    envMapIntensity: 2.8,
    emissive: c.clone().multiplyScalar(white ? 0.08 : 0.28),
    flatShading: true,
    transparent: false,
  });
  glassCache.set(stone.id, m);
  return m;
}

// Fallback: a matcap drawn on a canvas in the stone's colour with a bright rim (fake fresnel).
export function matcapFor(stone) {
  if (matcapCache.has(stone.id)) return matcapCache.get(stone.id);
  const cv = document.createElement('canvas');
  cv.width = cv.height = 128;
  const g = cv.getContext('2d');
  const hex = stone.hex;
  const body = g.createRadialGradient(52, 46, 4, 64, 64, 64);
  body.addColorStop(0, '#ffffff');
  body.addColorStop(0.18, hex);
  body.addColorStop(0.72, hex);
  body.addColorStop(1, '#000000');
  g.fillStyle = body;
  g.fillRect(0, 0, 128, 128);
  const rim = g.createRadialGradient(64, 64, 44, 64, 64, 64);
  rim.addColorStop(0, 'rgba(255,255,255,0)');
  rim.addColorStop(0.8, 'rgba(255,255,255,0.35)');
  rim.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = rim;
  g.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.MeshMatcapMaterial({ matcap: tex, flatShading: true });
  matcapCache.set(stone.id, m);
  return m;
}

export function gemMaterial(stone) {
  return (quality.level === 'high' ? glassFor(stone) : matcapFor(stone)).clone();
}

// Low quality also flattens the bench (board, rims, props): each MeshStandardMaterial becomes a Lambert of
// the same colour, lifted a little because it no longer samples the environment map. Gems handle their own.
const cheap = new WeakMap();
export function benchQuality(root, level = quality.level) {
  root.traverse((o) => {
    if (!o.isMesh || !o.material) return;
    const m = o.material;
    if (level === 'low' && m.isMeshStandardMaterial) {
      let c = cheap.get(m);
      if (!c) {
        const base = m.color.clone().multiplyScalar(0.72 + m.metalness * 0.25);
        c = new THREE.MeshLambertMaterial({ color: base, emissive: m.emissive.clone().add(base.clone().multiplyScalar(0.1)), flatShading: m.flatShading, transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite });
        c.userData.rich = m;
        cheap.set(m, c);
      }
      o.material = c;
    } else if (level !== 'low' && m.userData && m.userData.rich) o.material = m.userData.rich;
  });
}

export function setQuality(level) {
  if (quality.level === level) return;
  quality.level = level;
  for (const f of quality.listeners) f(level);
}

export const brass = () => new THREE.MeshStandardMaterial({ color: 0xb8924e, metalness: 0.85, roughness: 0.32, envMapIntensity: 1.2 });
// The Mirror's reflective face: bright silver washed with its stone, so it reads on a dark board.
export const mirrorSilver = (stone) => new THREE.MeshStandardMaterial({
  color: new THREE.Color(stone.hex).lerp(new THREE.Color(0xffffff), 0.55), metalness: 0.75, roughness: 0.18, envMapIntensity: 2.5,
  emissive: new THREE.Color(stone.hex).multiplyScalar(0.35), flatShading: true,
});
