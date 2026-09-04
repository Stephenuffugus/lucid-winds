/**
 * The ground you play on.
 *
 * K0 builds the dirt disc and the chalk ring procedurally: a 6 m dirt disc, a
 * 3.05 m chalk circle on it, and a horizon fog so the edge of the disc is not a
 * hard line against void. The Foundry and the Glacier arrive in K3 the same way,
 * procedural first and dressed by a sculpt later, so the game is playable long
 * before there is art (DESIGN 9.8).
 */
import * as THREE from 'three';

/** A dirt texture drawn by code: grain, a few stones, and a scuffed centre. */
function dirtTexture(size) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  g.fillStyle = '#4a3f31';
  g.fillRect(0, 0, size, size);
  // grain, deterministic enough for a texture nobody replays
  const img = g.getImageData(0, 0, size, size);
  const d = img.data;
  let s = 1234567;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 46;
    d[i] = Math.max(0, Math.min(255, d[i] + n));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + n * 0.9));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + n * 0.7));
  }
  g.putImageData(img, 0, 0);
  // stones. They stay inside the dirt's own hue: the first version drew them
  // across the full colour range and the ground read as pink and green lichen
  // when the texture tiled, not as dirt.
  for (let i = 0; i < 420; i++) {
    const x = rnd() * size, y = rnd() * size, r = 0.7 + rnd() * 1.9;
    const v = 92 + rnd() * 44;
    g.fillStyle = 'rgba(' + (v | 0) + ',' + (v * 0.87 | 0) + ',' + (v * 0.70 | 0) + ',' + (0.28 + rnd() * 0.34).toFixed(2) + ')';
    g.beginPath(); g.arc(x, y, r, 0, 6.2832); g.fill();
  }
  // shallow scuffs, so the eye has something bigger than grain to hold
  for (let i = 0; i < 26; i++) {
    g.strokeStyle = 'rgba(58,48,37,' + (0.10 + rnd() * 0.13).toFixed(2) + ')';
    g.lineWidth = 1 + rnd() * 2.5;
    const x = rnd() * size, y = rnd() * size, a = rnd() * 6.2832, L = size * (0.06 + rnd() * 0.16);
    g.beginPath(); g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * L * 0.5 + 6, y + Math.sin(a) * L * 0.5 - 5,
      x + Math.cos(a) * L, y + Math.sin(a) * L);
    g.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/**
 * Build the Ringer ground.
 * @param {object} stage from scene.createStage
 * @param {object} tuning
 * @param {{ringRadius?:number, discRadius?:number}} [opts]
 */
export function buildRingerGround(stage, tuning, opts) {
  const o = opts || {};
  const ringR = o.ringRadius == null ? tuning.ringer.ringRadius : o.ringRadius;
  // The disc must reach PAST the fog's far plane, or the ground simply stops and
  // the frame gets a hard black band where a horizon should be. 30 m against a
  // 16 m fog far means the dirt fades out and never ends on camera.
  const discR = o.discRadius == null ? 30 : o.discRadius;
  const group = new THREE.Group();

  const tex = dirtTexture(512);
  // about one texture tile per 40 cm of ground, which is small enough that the
  // grain reads as grain and large enough that the tiling never becomes a grid
  tex.repeat.set(discR * 5, discR * 5);
  tex.anisotropy = 8;
  const disc = new THREE.Mesh(
    new THREE.CircleGeometry(discR, 96),
    new THREE.MeshStandardMaterial({ map: tex, roughness: 0.97, metalness: 0.0, color: 0x9c8b70 })
  );
  disc.rotation.x = -Math.PI / 2;
  disc.receiveShadow = stage.tier.shadows !== 'off';
  group.add(disc);

  // The chalk ring: an annulus a hair above the dirt so it never z fights, and
  // 5 cm wide rather than 2. At a low camera angle a 24 mm band is thinner than
  // a pixel across most of its length and aliases into a dashed road marking,
  // which is what the second K0 shot showed. Real chalk on dirt is a wide, soft,
  // uneven line, so the width is also the honest answer.
  const chalk = new THREE.Mesh(
    new THREE.RingGeometry(ringR - 0.026, ringR + 0.026, 220),
    new THREE.MeshBasicMaterial({ color: 0xf2e8d6, transparent: true, opacity: 0.88,
      depthWrite: false })
  );
  chalk.rotation.x = -Math.PI / 2;
  chalk.position.y = 0.0012;
  group.add(chalk);

  stage.scene.add(group);
  return { group, disc, chalk, ringRadius: ringR, discRadius: discR };
}

/** Remove the ground and give its memory back. */
export function disposeGround(stage, ground) {
  stage.scene.remove(ground.group);
  ground.group.traverse((n) => {
    if (n.geometry) n.geometry.dispose();
    if (n.material) {
      const ms = [].concat(n.material);
      for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
    }
  });
}
