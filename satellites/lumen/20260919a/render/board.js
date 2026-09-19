// Board meshes: shallow cell wells with brass rims, walls, Lantern(s), Aperture(s), dark / bright / fog
// cells, and cell highlights for dragging. Primitive stand-ins carry the final prop names (section 12):
// swapping in the Meshy GLB props later replaces only the factory functions in this file.
import * as THREE from 'three';
import { grid } from '../sim/hex.js';
import { cellPos, dirVec, colorHex, SQ3 } from './layout.js';
import { quality, benchQuality } from './materials.js';

const BRASS = 0xb08d4a;
const VELVET = 0x1b1522;

function hexShape(r) {
  const s = new THREE.Shape();
  for (let k = 0; k < 6; k++) {
    const a = (k * Math.PI) / 3;
    const x = r * Math.cos(a), y = r * Math.sin(a);
    if (k === 0) s.moveTo(x, y); else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

const geo = {};
function cellGeo() {
  if (geo.cell) return geo;
  geo.cell = new THREE.ShapeGeometry(hexShape(0.9)).rotateX(-Math.PI / 2);
  const ring = hexShape(0.98);
  ring.holes.push(new THREE.Path(hexShape(0.9).getPoints().reverse()));
  geo.rim = new THREE.ExtrudeGeometry(ring, { depth: 0.08, bevelEnabled: false }).rotateX(-Math.PI / 2);
  geo.glow = new THREE.ShapeGeometry(hexShape(0.86)).rotateX(-Math.PI / 2);
  geo.wall = new THREE.CylinderGeometry(0.86, 0.9, 0.55, 6).rotateY(Math.PI / 6);
  geo.frame = null;
  return geo;
}

// Prop stand-ins (final file names from ASSETS.md; see createProp).
export const PROPS = {
  'lantern-candle.glb': () => {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.42, 0.7, 8), new THREE.MeshStandardMaterial({ color: BRASS, emissive: 0x3a2808, metalness: 0.6, roughness: 0.35, flatShading: true }));
    body.position.y = 0.35;
    const flame = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff4d6 }));
    const halo = new THREE.Mesh(new THREE.CircleGeometry(0.9, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffd98a, transparent: true, opacity: 0.22, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.position.y = 0.03;
    g.add(halo);
    flame.position.y = 0.55;
    flame.name = 'flame';
    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.08, 16).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xfff6dc }));
    lens.position.set(0, 0.45, -0.42);
    lens.name = 'lens';
    g.add(body, flame, lens);
    return g;
  },
  'aperture.glb': () => {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.11, 8, 24).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xd8b46a, emissive: 0x4a3510, metalness: 0.6, roughness: 0.3, flatShading: true }));
    ring.position.y = 0.12;
    const iris = new THREE.Mesh(new THREE.CircleGeometry(0.52, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x3a3226 }));
    iris.position.y = 0.05;
    iris.name = 'iris';
    g.add(ring, iris);
    return g;
  },
  'wall-block.glb': () => {
    const g = new THREE.Group();
    g.add(new THREE.Mesh(cellGeo().wall, new THREE.MeshStandardMaterial({ color: 0x3a3f48, roughness: 0.85, flatShading: true })));
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.91, 0.91, 0.08, 6).rotateY(Math.PI / 6), new THREE.MeshStandardMaterial({ color: BRASS, emissive: 0x2a1d08, metalness: 0.6, roughness: 0.4 }));
    band.position.y = 0.12;
    g.add(band);
    return g;
  },
  'board-frame.glb': (radius) => {
    // Hexagonal brass tray with a raised rim around a velvet recess (Meshy prop later).
    const outer = new THREE.Shape(), inner = new THREE.Path();
    const R = SQ3 * radius + 1.55, r = SQ3 * radius + 1.05;
    for (let k = 0; k < 6; k++) {
      const a = (k * Math.PI) / 3 + Math.PI / 6;
      if (k === 0) { outer.moveTo(R * Math.cos(a), R * Math.sin(a)); inner.moveTo(r * Math.cos(a), r * Math.sin(a)); }
      else { outer.lineTo(R * Math.cos(a), R * Math.sin(a)); inner.lineTo(r * Math.cos(a), r * Math.sin(a)); }
    }
    outer.closePath(); inner.closePath();
    outer.holes.push(inner);
    const g = new THREE.Group();
    const rim = new THREE.Mesh(new THREE.ExtrudeGeometry(outer, { depth: 0.32, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 2 }).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xa8843f, metalness: 0.85, roughness: 0.35 }));
    rim.position.y = -0.12;
    const bed = new THREE.Mesh(new THREE.CircleGeometry(r + 0.1, 6).rotateX(-Math.PI / 2).rotateY(Math.PI / 6), new THREE.MeshStandardMaterial({ color: 0x0c0910, roughness: 1 }));
    bed.position.y = -0.03;
    g.add(rim, bed);
    return g;
  },
  'fixed-mount.glb': () => new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 6, 6).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: BRASS, metalness: 0.9, roughness: 0.3 })),
};

export function createBoardView(stage) {
  const root = new THREE.Group();
  stage.scene.add(root);
  let cells = [], glows = [], props = [];
  let current = null;
  const mats = {
    well: new THREE.MeshStandardMaterial({ color: VELVET, roughness: 0.95, envMapIntensity: 0.4 }),
    dark: new THREE.MeshStandardMaterial({ color: 0x05040a, roughness: 1 }),
    rim: new THREE.MeshStandardMaterial({ color: BRASS, emissive: 0x2a1d08, metalness: 0.6, roughness: 0.4 }),
    bright: new THREE.MeshBasicMaterial({ color: 0xe2c26e, transparent: true, opacity: 0.18, depthWrite: false }),
    fog: new THREE.MeshBasicMaterial({ color: 0x8c93a8, transparent: true, opacity: 0.35, depthWrite: false }),
    glow: new THREE.MeshBasicMaterial({ color: 0xe8d7a4, transparent: true, opacity: 0.0, depthWrite: false }),
  };

  function clear() {
    root.clear();
    cells = []; glows = []; props = [];
  }

  function build(board, apertures) {
    clear();
    const g = grid(board.radius);
    stage.setRadius(board.radius);
    const G = cellGeo();
    const dark = new Set(board.dark), bright = new Set(board.bright), fog = new Set(board.fog), walls = new Set(board.walls);
    root.add(PROPS['board-frame.glb'](board.radius));
    for (let i = 0; i < g.n; i++) {
      const p = cellPos(g, i);
      const well = new THREE.Mesh(G.cell, dark.has(i) ? mats.dark : mats.well);
      well.position.set(p.x, 0, p.z);
      const rim = new THREE.Mesh(G.rim, mats.rim);
      rim.position.set(p.x, 0, p.z);
      const glow = new THREE.Mesh(G.glow, mats.glow.clone());
      glow.position.set(p.x, 0.02, p.z);
      root.add(well, rim, glow);
      cells.push(well); glows.push(glow);
      if (bright.has(i)) { const b = new THREE.Mesh(G.glow, mats.bright); b.position.set(p.x, 0.015, p.z); root.add(b); }
      if (fog.has(i)) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.9, 6, 1, true).rotateY(Math.PI / 6), mats.fog); f.position.set(p.x, 0.45, p.z); f.renderOrder = 3; root.add(f); }
      if (walls.has(i)) { const w = PROPS['wall-block.glb'](); w.position.set(p.x, 0.27, p.z); root.add(w); }
    }
    for (const l of board.lanterns) {
      const m = PROPS['lantern-candle.glb']();
      const p = cellPos(g, l.cell);
      const v = dirVec(l.dir);
      m.position.set(p.x, 0, p.z);
      m.rotation.y = Math.atan2(-v.x, -v.z);
      m.userData.cell = l.cell;
      root.add(m);
      props.push(m);
    }
    current = { board, g, apertureMeshes: [] };
    setApertures(apertures);
    for (const f of board.fixed || []) {
      const p = cellPos(g, f.cell);
      const mount = PROPS['fixed-mount.glb']();
      mount.position.set(p.x, 0.04, p.z);
      root.add(mount);
    }
    benchQuality(root);
  }
  quality.listeners.add((level) => benchQuality(root, level));

  // Overkill: the Aperture iris opens wider.
  function openIris(on) {
    if (!current) return;
    for (const m of current.apertureMeshes) m.userData.open = on ? 1 : 0;
  }
  function update(dt) {
    if (!current) return;
    for (const m of current.apertureMeshes) {
      const t = m.userData.open || 0;
      m.userData.o = (m.userData.o || 0) + (t - (m.userData.o || 0)) * Math.min(1, dt * 3);
      const s = 1 + 0.28 * m.userData.o;
      m.scale.set(s, 1, s);
    }
  }

  function setApertures(apertures) {
    if (!current) return;
    for (const m of current.apertureMeshes) root.remove(m);
    current.apertureMeshes = [];
    for (const a of apertures) {
      const m = PROPS['aperture.glb']();
      const p = cellPos(current.g, a.cell);
      m.position.set(p.x, 0, p.z);
      if (a.color !== 7) m.getObjectByName('iris').material = new THREE.MeshBasicMaterial({ color: colorHex(a.color), transparent: true, opacity: 0.55 });
      m.userData.cell = a.cell;
      root.add(m);
      current.apertureMeshes.push(m);
    }
    benchQuality(root);
  }

  // Highlight a set of cells (valid drop targets) and one hovered cell.
  function highlight(valid, hover) {
    glows.forEach((gl, i) => {
      gl.material.opacity = i === hover ? 0.42 : valid && valid.has(i) ? 0.12 : 0;
    });
  }

  return {
    root, build, setApertures, highlight, openIris, update,
    apertureAt: (cell) => current && current.apertureMeshes.find((m) => m.userData.cell === cell),
    get grid() { return current && current.g; },
  };
}
