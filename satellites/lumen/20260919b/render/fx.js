// One-shot effects: the brass ring flash on a gem drop, facet sparkles on a strike (200 ms), the
// Aperture iris opening on overkill, and the slow rotate reveal of a new Inclusion gem.
import * as THREE from 'three';
import { grid } from '../sim/hex.js';
import { cellPos, colorHex } from './layout.js';
import { makeGem } from './gems.js';

const ringGeo = new THREE.RingGeometry(0.72, 0.86, 6, 1).rotateX(-Math.PI / 2).rotateY(Math.PI / 6);
const sparkGeo = new THREE.PlaneGeometry(0.16, 0.16);
const sparkTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 32;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(16, 16, 0, 16, 16, 16);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(0.25, 'rgba(255,255,255,.7)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, 32, 32);
  g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(15, 2, 2, 28); g.fillRect(2, 15, 28, 2);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();

export function createFx(stage, data) {
  const root = new THREE.Group();
  stage.scene.add(root);
  const items = [];
  const g3 = () => grid(3);

  function ring(cell, color = 0xe8c070) {
    const p = cellPos(g3(), cell);
    const m = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.position.set(p.x, 0.06, p.z);
    root.add(m);
    items.push({ obj: m, life: 0.35, max: 0.35, kind: 'ring' });
  }

  function sparkle(cell, colorMask) {
    const p = cellPos(g3(), cell);
    for (let k = 0; k < 6; k++) {
      const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ map: sparkTex, color: colorHex(colorMask), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
      const a = (k / 6) * Math.PI * 2 + Math.random();
      m.position.set(p.x + Math.cos(a) * 0.3, 0.35 + Math.random() * 0.3, p.z + Math.sin(a) * 0.3);
      m.userData.v = new THREE.Vector3(Math.cos(a) * 0.9, 0.6 + Math.random(), Math.sin(a) * 0.9);
      root.add(m);
      items.push({ obj: m, life: 0.2 + Math.random() * 0.08, max: 0.28, kind: 'spark' });
    }
  }

  // Slow rotate reveal of a newly found gem above the board.
  function reveal(gemSpec, onDone) {
    const v = makeGem(data, { ...gemSpec, facing: 0 });
    v.group.position.set(0, 3.2, 3.5);
    v.group.scale.setScalar(2.4);
    root.add(v.group);
    items.push({ obj: v.group, life: 2.6, max: 2.6, kind: 'reveal', view: v, onDone });
  }

  function update(dt) {
    for (let i = items.length - 1; i >= 0; i--) {
      const it = items[i];
      it.life -= dt;
      const k = Math.max(0, it.life / it.max);
      if (it.kind === 'ring') { it.obj.scale.setScalar(1 + (1 - k) * 0.35); it.obj.material.opacity = k * 0.9; }
      else if (it.kind === 'spark') { it.obj.position.addScaledVector(it.obj.userData.v, dt); it.obj.material.opacity = k; it.obj.quaternion.copy(stage.camera.quaternion); }
      else if (it.kind === 'reveal') { it.view.group.rotation.y += dt * 1.4; it.view.update(dt); const s = 2.4 * Math.min(1, (it.max - it.life) * 3) * Math.min(1, it.life * 3); it.obj.scale.setScalar(Math.max(0.001, s)); }
      if (it.life <= 0) {
        root.remove(it.obj);
        if (it.obj.material) it.obj.material.dispose();
        if (it.view) it.view.dispose();
        items.splice(i, 1);
        if (it.onDone) it.onDone();
      }
    }
  }
  return { ring, sparkle, reveal, update };
}
