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
import { art } from './art.js?v=20261106a';
import { CHALK_REPEATS, CHALK_STRIP, CROSS_R2, LAG_R2 } from './plates.js?v=20261106a';

/* Astra's lot (pack v1, KEEPSIES_BUILD_PLAN.md step 3). One dirt tile is 60 cm: her grit then reads as grit and
   her pebbles at 3 to 7 mm sit beside a 16 mm mib the way real ones do. The tone is a plate decision, not a
   marble one: her albedo is a warm orange, and the marbles stay the brightest thing on the ground. */
const DIRT_TILE_M = 0.6;
const DIRT_TONE = 0x968c84;

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

/** m3 step 11, B8: an annulus with u along the circumference (an integer repeat of her stroke) and v across the 83 mm band her 52 mm line is drawn in; faces up. */
function chalkStrip(radius) {
  const seg = 256, half = CHALK_STRIP.bandM / 2, reps = CHALK_REPEATS[Math.round(radius / 0.1524)] || 4;
  const pos = [], uv = [], nor = [], idx = [];
  for (let i = 0; i <= seg; i++) {
    const a = (2 * Math.PI * i) / seg, s = Math.sin(a), c = Math.cos(a), u = (reps * i) / seg;
    pos.push(s * (radius - half), 0, c * (radius - half), s * (radius + half), 0, c * (radius + half));
    uv.push(u, 0, u, 1);
    nor.push(0, 1, 0, 0, 1, 0);
  }
  for (let i = 0; i < seg; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setIndex(idx);
  return g;
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
  const line = new THREE.Mesh(
    new THREE.RingGeometry(ringR - 0.026, ringR + 0.026, 220),
    new THREE.MeshBasicMaterial({ color: 0xf2e8d6, transparent: true, opacity: 0.88,
      depthWrite: false })
  );
  line.rotation.x = -Math.PI / 2;
  line.position.y = 0.0012;
  /* ⛔ `chalk` IS EVERYTHING DRAWN ON THE DIRT, and main hides it for calibration (one marble on dirt and
     nothing else). The procedural line is the low tier's ring and the fallback until Astra's decal loads. */
  const chalk = new THREE.Group();
  chalk.add(line);
  group.add(chalk);

  /* Astra's dirt on every tier (it IS the ground): roughness stays a constant, no normal map is invented
     from a photograph; the drawn grain stays until it arrives, so no frame is ever bare */
  const loader = new THREE.TextureLoader();
  loader.load(art('env/dirt_albedo.webp'), (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(discR * 2 / DIRT_TILE_M, discR * 2 / DIRT_TILE_M);
    t.anisotropy = 8;
    const m = disc.material;
    if (m.map) m.map.dispose();
    m.map = t; m.color.set(DIRT_TONE); m.needsUpdate = true;
  });

  /* Astra's chalk as decals, lit by the lamp like the dirt they sit on (a basic material glowed cream in a
     marble's shadow and outshone the marbles). They drop first on the low tier: the drawn line stays. */
  const lot = stage.tier.name !== 'low';
  /* chalk is granular cream, never neon (style guide): her white is toned to the cream of the line and
     thinned, so the ring and the cross read as chalk rubbed into dirt and the marbles stay brightest */
  const decal = (file, w, h, y, alpha, repeatX) => {
    const mat = new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, opacity: 0,
      roughness: 1, metalness: 0, color: 0xcdc2ad });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
    m.rotation.x = -Math.PI / 2;
    m.position.y = y;
    m.receiveShadow = stage.tier.shadows !== 'off';
    m.visible = false;
    loader.load(art(file), (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
      if (repeatX) { t.wrapS = THREE.RepeatWrapping; t.repeat.x = repeatX; }
      mat.map = t; mat.opacity = alpha; mat.needsUpdate = true;
      m.visible = m.userData.want !== false;
    });
    chalk.add(m);
    return m;
  };
  let ring = null, cross = null, lag = null, dressedR = ringR;
  if (lot) {
    /* m3 step 11, B8: her chalk stroke laid along the ring, an integer repeat round it, rebuilt per ring size so it is never stretched */
    const stroke = new THREE.MeshStandardMaterial({ transparent: true, depthWrite: false, opacity: 0, roughness: 1, metalness: 0, color: 0xcdc2ad });
    ring = new THREE.Mesh(chalkStrip(ringR), stroke);
    ring.position.y = 0.0012;
    ring.receiveShadow = stage.tier.shadows !== 'off';
    ring.visible = false;
    loader.load(art('env/chalk_stroke.webp'), (t) => {
      t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.wrapS = THREE.RepeatWrapping;
      stroke.map = t; stroke.opacity = 0.85; stroke.needsUpdate = true;
      ring.visible = true; line.visible = false;
    });
    chalk.add(ring);
    // the cross's arms reach a little past the outer mibs of the lay (three spacings each way)
    const span = 6 * tuning.ringer.crossSpacing + 0.05;
    const crossW = span * CROSS_R2.sizePx / (2 * CROSS_R2.armPx);
    cross = decal('env/cross_marker_r2.png', crossW, crossW, 0.0010, 0.5);
    // the lag line beyond the far arc of the first view (the player's taw starts at +z), 2.4 m across the lane
    lag = decal('env/lag_line_r2.png', 2 * LAG_R2.widthPx * CHALK_STRIP.lineM / CHALK_STRIP.linePx, CHALK_STRIP.bandM, 0.0010, 0.7, 2);
  }

  /**
   * Lay the chalk for this match: the ring at its size (the drawn ring was always the ten foot one, so the
   * seven foot games of the first four minutes were played inside a circle that was not theirs), the cross
   * marker under the cross and the X, and the lag line its offset beyond the far arc.
   */
  function dress(radius, formation) {
    /* rebuilt, never scaled: a scaled ring stretched its line and its grain with the ring */
    if (dressedR !== radius) {
      dressedR = radius;
      line.geometry.dispose();
      line.geometry = new THREE.RingGeometry(radius - 0.026, radius + 0.026, 220);
      if (ring) { ring.geometry.dispose(); ring.geometry = chalkStrip(radius); }
    }
    if (!lot) return;
    const showCross = formation == null || formation === 'cross' || formation === 'x';
    cross.userData.want = showCross;
    cross.visible = showCross && cross.material.opacity > 0;
    cross.rotation.z = formation === 'x' ? Math.PI / 4 : 0;
    lag.position.z = -(radius + tuning.ringer.lagLineOffset);
  }
  dress(ringR, 'cross');

  /* m3 step 7: Astra's calibration target, outside the chalk group (calibration hides the chalk): her outer ring r 178 of 512 at 90 mm, not her 120: at 0.5 m ahead 120 mm ran off a 412 px phone's sides */
  const target = new THREE.Mesh(new THREE.PlaneGeometry(0.09 * 512 / 178, 0.09 * 512 / 178), new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false, opacity: 0 }));
  target.rotation.x = -Math.PI / 2; target.visible = false;
  loader.load(art('env/calibration_target.png'), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; target.material.map = t; target.material.opacity = 0.9; target.material.needsUpdate = true; });
  group.add(target);

  stage.scene.add(group);
  return { group, disc, chalk, dress, target, ringRadius: ringR, discRadius: discR };
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
