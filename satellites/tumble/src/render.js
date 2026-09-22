// Three.js scene for TUMBLE (DESIGN 13.1-13.3): one InstancedMesh per silhouette
// (8 draw calls for every sock on the table), an atlas shader patch, and a
// procedurally built laundry room.

import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { TABLE, BASKET, ODDBIN, DRYER, PHYS } from './config.js';
import * as TX from './textures.js';

export const ATLAS_N = 8;          // 8 x 8 tiles of 256 px in a 2048 atlas (DESIGN 13.3)
const CAP = PHYS.bodyCap + 24;

export const FLAG = { INSIDE_OUT: 1 };

// Free the GPU side of a removed object: geometry, materials, and textures unless they are shared (keep).
export function disposeTree(root, keep = null) {
  root.traverse((o) => {
    if (o.geometry && !(keep && keep.has(o.geometry))) o.geometry.dispose();
    const mats = Array.isArray(o.material) ? o.material : o.material ? [o.material] : [];
    for (const m of mats) {
      if (keep && keep.has(m)) continue;
      for (const k of ['map', 'normalMap', 'alphaMap', 'roughnessMap', 'emissiveMap']) { const t = m[k]; if (t && !(keep && keep.has(t))) t.dispose(); }
      m.dispose();
    }
  });
}

export class Renderer {
  constructor(canvas, opts = {}) {
    this.canvas = canvas;
    this.opts = opts;
    const r = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance', preserveDrawingBuffer: !!opts.preserve });
    r.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.maxDpr || 2));
    r.outputColorSpace = THREE.SRGBColorSpace;
    r.toneMapping = THREE.NeutralToneMapping;
    r.toneMappingExposure = 1.02;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFShadowMap; // r186 folded PCFSoft into PCF with a radius
    this.r = r;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x2a2320);
    this.camera = new THREE.PerspectiveCamera(40, 1, 0.05, 30);
    this.clock = 0;
    this.uniforms = {
      uAtlas: { value: null },
      uAtlasN: { value: ATLAS_N },
      uTime: { value: 0 },
      uGlow: { value: new THREE.Color(0xffe7a8) },
    };
    this.pools = [];
    this.heldPools = [];
    this.view = 'table';
    this.camAnim = null;
  }

  init(silGeoms) {
    const pm = new THREE.PMREMGenerator(this.r);
    this.scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    this.scene.environmentIntensity = 0.42;
    pm.dispose();
    this._lights();
    this._room();
    this.knit = TX.knitNormalTexture();
    this.silGeoms = silGeoms;
    silGeoms.forEach((g, i) => {
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(g.positions, 3));
      geo.setAttribute('normal', new THREE.BufferAttribute(g.normals, 3));
      geo.setAttribute('uv', new THREE.BufferAttribute(g.uvs, 2));
      geo.setAttribute('aShade', new THREE.BufferAttribute(g.shade, 1));
      geo.setIndex(new THREE.BufferAttribute(g.indices, 1));
      geo.computeBoundingSphere();
      const reps = [Math.max(3, Math.round(g.circumference / 0.022)), Math.max(6, Math.round(g.length / 0.02))];
      this.pools.push(this._pool(geo, this._sockMaterial(reps), true, `sock-${g.key}`));
      this.heldPools.push(this._pool(geo, this._sockMaterial(reps, true), false, `held-${g.key}`, 3));
    });
    this.ballGeo = ballGeometry();
    this.ballPool = this._pool(this.ballGeo, this._sockMaterial([10, 4], false, true), true, 'balls');
    this.heldBallPool = this._pool(this.ballGeo, this._sockMaterial([10, 4], true, true), false, 'held-balls', 3);
    this.setAtlas(placeholderAtlas());
  }

  _pool(geo, mat, shadows, name, cap = CAP) {
    const g = geo.clone();
    const tile = new THREE.InstancedBufferAttribute(new Float32Array(cap * 2), 2);
    const flags = new THREE.InstancedBufferAttribute(new Float32Array(cap * 3), 3);
    tile.setUsage(THREE.DynamicDrawUsage); flags.setUsage(THREE.DynamicDrawUsage);
    g.setAttribute('aTile', tile);
    g.setAttribute('aFlags', flags);
    const m = new THREE.InstancedMesh(g, mat, cap);
    m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    m.count = 0;
    m.castShadow = shadows;
    m.receiveShadow = true;
    m.frustumCulled = false;
    m.name = name;
    this.scene.add(m);
    return { mesh: m, tile, flags, n: 0, cap };
  }

  _sockMaterial(reps, held = false, ball = false) {
    const knit = this.knit.clone();
    knit.needsUpdate = true;
    knit.repeat.set(reps[0], reps[1]);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
      metalness: 0,
      normalMap: knit,
      normalScale: new THREE.Vector2(0.55, 0.55),
      envMapIntensity: 0.55,
    });
    const U = this.uniforms;
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      sh.vertexShader = sh.vertexShader
        .replace('#include <common>', `#include <common>
attribute vec2 aTile;
attribute vec3 aFlags;
attribute float aShade;
varying vec2 vTile;
varying vec3 vFlags;
varying vec2 vSockUv;
varying float vShade;`)
        .replace('#include <uv_vertex>', `#include <uv_vertex>
vTile = aTile; vFlags = aFlags; vSockUv = uv; vShade = aShade;`);
      sh.fragmentShader = sh.fragmentShader
        .replace('#include <common>', `#include <common>
uniform sampler2D uAtlas;
uniform float uAtlasN;
uniform float uTime;
uniform vec3 uGlow;
varying vec2 vTile;
varying vec3 vFlags;
varying vec2 vSockUv;
varying float vShade;
float tHash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }`)
        .replace('#include <map_fragment>', `
vec2 suv = vSockUv;
vec2 contUv = vSockUv;
${ball ? `
// a rolled pair: the folded cuff is the cap above the tuck ridge, the leg wraps the rest
float capK = smoothstep(0.66, 0.72, vSockUv.y);
float openK = smoothstep(0.9, 0.97, vSockUv.y);
vec2 legUv = vec2(fract(vSockUv.x * 2.0), 0.14 + fract(vSockUv.y * 1.35) * 0.3);
vec2 cuffUv = vec2(fract(vSockUv.x * 3.0), 0.015 + (1.0 - vSockUv.y) / 0.3 * 0.075);
suv = mix(legUv, cuffUv, capK);
// the same mapping before fract(): its derivatives are smooth, so the wrap does not pick a tiny mip (seam lines)
contUv = mix(vec2(vSockUv.x * 2.0, vSockUv.y * 0.405), vec2(vSockUv.x * 3.0, -vSockUv.y * 0.25), capK);` : ''}
suv.x = fract(suv.x);
vec2 tuv = (vTile + vec2(0.012) + clamp(suv, 0.0, 1.0) * 0.976) / uAtlasN;
vec2 tgx = dFdx(contUv) * (0.976 / uAtlasN), tgy = dFdy(contUv) * (0.976 / uAtlasN);
vec3 sockCol = textureGrad(uAtlas, tuv, tgx, tgy).rgb;
float io = step(0.5, mod(vFlags.x, 2.0));
float lum = dot(sockCol, vec3(0.299, 0.587, 0.114));
vec3 inside = mix(vec3(lum), sockCol, 0.22) * 0.72 + 0.16;
float terry = tHash(floor(vSockUv * vec2(110.0, 260.0)));
inside *= 0.9 + 0.16 * terry;
sockCol = mix(sockCol, inside, io);
${ball ? 'sockCol *= 1.0 - openK * 0.55; sockCol *= 1.0 - (1.0 - smoothstep(0.0, 0.03, abs(vSockUv.y - 0.69))) * 0.28;' : ''}
diffuseColor.rgb *= sockCol * vShade;
`)
        .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
float glow = vFlags.y * (0.55 + 0.45 * sin(uTime * 3.2 + vFlags.z));
// mostly on the silhouette's edge, so a glowing sock keeps its colours
float gRim = pow(1.0 - clamp(dot(nonPerturbedNormal, normalize(vViewPosition)), 0.0, 1.0), 1.5);
totalEmissiveRadiance += uGlow * glow * (0.1 + 1.1 * gRim);
`)
        .replace('#include <opaque_fragment>', `
{
  vec3 vd = normalize(vViewPosition);
  float rim = pow(1.0 - clamp(dot(normal, vd), 0.0, 1.0), 2.6);
  outgoingLight += diffuseColor.rgb * rim * ${held ? '0.32' : '0.22'};
}
#include <opaque_fragment>`);
    };
    mat.customProgramCacheKey = () => `sock-${held}-${ball}`;
    return mat;
  }

  setAtlas(canvasOrTexture) {
    let t = canvasOrTexture;
    if (!(t instanceof THREE.Texture)) {
      t = new THREE.CanvasTexture(canvasOrTexture);
    }
    t.colorSpace = THREE.SRGBColorSpace;
    t.flipY = false;
    t.anisotropy = Math.min(8, this.r.capabilities.getMaxAnisotropy());
    t.minFilter = THREE.LinearMipmapLinearFilter;
    t.generateMipmaps = true;
    t.needsUpdate = true;
    if (this.uniforms.uAtlas.value && this.uniforms.uAtlas.value !== t) this.uniforms.uAtlas.value.dispose();
    this.uniforms.uAtlas.value = t;
    this.atlasTexture = t;
  }

  // ---------- per-frame instance collection ----------
  begin() {
    for (const p of this.pools) p.n = 0;
    for (const p of this.heldPools) p.n = 0;
    this.ballPool.n = 0;
    this.heldBallPool.n = 0;
  }

  _push(pool, matrix, tileX, tileY, flags, glow, phase) {
    if (pool.n >= pool.cap) return;
    const i = pool.n++;
    pool.mesh.setMatrixAt(i, matrix);
    pool.tile.array[i * 2] = tileX;
    pool.tile.array[i * 2 + 1] = tileY;
    pool.flags.array[i * 3] = flags || 0;
    pool.flags.array[i * 3 + 1] = glow || 0;
    pool.flags.array[i * 3 + 2] = phase || 0;
  }

  sock(silId, matrix, tile, flags, glow, phase, held) {
    this._push(held ? this.heldPools[silId] : this.pools[silId], matrix, tile % ATLAS_N, Math.floor(tile / ATLAS_N), flags, glow, phase);
  }

  ball(matrix, tile, glow, phase, held) {
    this._push(held ? this.heldBallPool : this.ballPool, matrix, tile % ATLAS_N, Math.floor(tile / ATLAS_N), 0, glow, phase);
  }

  end() {
    const all = this.pools.concat(this.heldPools, [this.ballPool, this.heldBallPool]);
    for (const p of all) {
      p.mesh.count = p.n;
      if (p.n) {
        p.mesh.instanceMatrix.needsUpdate = true;
        p.tile.needsUpdate = true;
        p.flags.needsUpdate = true;
        p.mesh.instanceMatrix.clearUpdateRanges?.();
      }
    }
  }

  // ---------- lights and room ----------
  _lights() {
    const S = this.scene;
    const hemi = new THREE.HemisphereLight(0xfff0dc, 0x7a6450, 0.85);
    S.add(hemi);
    const key = new THREE.DirectionalLight(0xffe0b8, 2.3);
    key.position.set(-1.15, 2.7, 1.1);
    key.target.position.set(0.05, 0, -0.15);
    key.castShadow = true;
    const q = this.opts.lowShadows ? 1024 : 2048;
    key.shadow.mapSize.set(q, q);
    const sc = key.shadow.camera;
    sc.left = -1.05; sc.right = 1.05; sc.top = 1.25; sc.bottom = -1.1; sc.near = 0.5; sc.far = 6;
    key.shadow.bias = -0.0006;
    key.shadow.normalBias = 0.012;
    key.shadow.radius = 3;
    S.add(key, key.target);
    this.keyLight = key;
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.45);
    fill.position.set(1.6, 1.4, 0.8);
    S.add(fill);
    const glow = new THREE.PointLight(0xffc27a, 0, 1.4, 1.6);
    glow.position.set(DRYER.x, DRYER.doorY, TABLE.back + 0.12);
    S.add(glow);
    this.dryerGlow = glow;
    const lamp = new THREE.PointLight(0xffb86b, 0.9, 3.2, 1.8);
    lamp.position.set(-0.9, 1.25, -0.6);
    S.add(lamp);
    this.lamp = lamp;
  }

  _room() {
    const S = this.scene, T = TABLE;
    const wood = TX.woodTexture({});
    const woodDark = TX.woodTexture({ base: [150, 104, 70], dark: [96, 62, 40], planks: 7, seed: 8 });
    const tableH = 0.76;
    this.room = new THREE.Group();
    S.add(this.room);

    // floor
    const floorTex = woodDark.clone(); floorTex.needsUpdate = true; floorTex.repeat.set(3, 3);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), new THREE.MeshStandardMaterial({ map: floorTex, roughness: 0.7 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(0, -tableH, 0.5);
    floor.receiveShadow = true;
    this.room.add(floor);

    // walls: back wall with a hole for the dryer
    const wp = TX.wallpaperTexture({});
    wp.repeat.set(3.2, 2.4);
    const wallMat = new THREE.MeshStandardMaterial({ map: wp, roughness: 0.95 });
    const shape = new THREE.Shape();
    shape.moveTo(-2.4, -tableH); shape.lineTo(2.4, -tableH); shape.lineTo(2.4, 2.2); shape.lineTo(-2.4, 2.2); shape.closePath();
    const hole = new THREE.Path();
    const dw = 0.34, dyb = -0.06, dyt = 0.68;
    hole.moveTo(DRYER.x - dw, dyb); hole.lineTo(DRYER.x - dw, dyt); hole.lineTo(DRYER.x + dw, dyt); hole.lineTo(DRYER.x + dw, dyb); hole.closePath();
    shape.holes.push(hole);
    const wallGeo = new THREE.ShapeGeometry(shape);
    remapUV(wallGeo, 4.8, 2.96, -2.4, -tableH);
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.z = T.back;
    wall.receiveShadow = true;
    this.room.add(wall);
    // ceiling and crown moulding: the room view looks up past the top of the wall
    // a ceiling faces down, so the hemisphere light gives it the floor colour; paint it as lamp lit plaster instead
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(4.8, 5), new THREE.MeshBasicMaterial({ map: TX.radialTexture('#fff3df', '#e6cfab') }));
    ceil.rotation.x = Math.PI / 2; ceil.position.set(0, 2.2, 1.5);
    this.room.add(ceil);
    const crown = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.09, 0.07), new THREE.MeshStandardMaterial({ color: 0xf8f1e4, roughness: 0.6 }));
    crown.position.set(0, 2.16, T.back + 0.035);
    this.room.add(crown);
    const skirting = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 0.03), new THREE.MeshStandardMaterial({ color: 0xf8f1e4, roughness: 0.6 }));
    skirting.position.set(0, -tableH + 0.06, T.back + 0.015);
    this.room.add(skirting);
    // side walls
    const side = new THREE.Mesh(new THREE.PlaneGeometry(5, 2.96), wallMat);
    side.rotation.y = Math.PI / 2; side.position.set(-2.4, 2.2 - 1.48, 1.5);
    this.room.add(side);
    const side2 = side.clone(); side2.rotation.y = -Math.PI / 2; side2.position.x = 2.4;
    this.room.add(side2);
    // beadboard wainscot and a chair rail behind the table
    const bead = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.03, 0.03), new THREE.MeshStandardMaterial({ color: 0xe9dcc4, roughness: 0.6 }));
    bead.position.set(0, 0.8, T.back + 0.015);
    this.room.add(bead);

    // table: top, legs
    const topMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.55 });
    const top = new THREE.Mesh(new RoundedBoxGeometry(T.halfW * 2 + 0.12, 0.05, T.front - T.back + 0.08, 3, 0.012), topMat);
    top.position.set(0, -0.025, (T.front + T.back) / 2 + 0.02);
    top.receiveShadow = true; top.castShadow = true;
    this.room.add(top);
    const legMat = new THREE.MeshStandardMaterial({ map: woodDark, roughness: 0.6 });
    for (const sx of [-1, 1]) for (const sz of [T.front - 0.05, T.back + 0.08]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, tableH - 0.05, 0.05), legMat);
      leg.position.set(sx * (T.halfW + 0.02), -tableH / 2 - 0.025, sz);
      leg.castShadow = true;
      this.room.add(leg);
    }
    // quilted folding mat on the play area
    const mat = TX.matTexture({});
    mat.repeat.set(2, 2.5);
    const pad = new THREE.Mesh(
      new RoundedBoxGeometry(T.halfW * 2 - 0.01, 0.006, T.front - T.playBack - 0.01, 2, 0.003),
      new THREE.MeshStandardMaterial({ map: mat, roughness: 0.95 })
    );
    pad.position.set(0, 0.0, (T.front + T.playBack) / 2);
    pad.receiveShadow = true;
    this.room.add(pad);
    // rails
    const railMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5 });
    const depth = T.front - T.back;
    const mkRail = (w, h, d, x, z) => {
      const m = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, 0.008), railMat);
      m.position.set(x, h / 2, z);
      m.castShadow = true; m.receiveShadow = true;
      this.room.add(m);
    };
    mkRail(T.railT, T.railH, depth, -T.halfW - T.railT / 2, (T.front + T.back) / 2);
    mkRail(T.railT, T.railH, depth, T.halfW + T.railT / 2, (T.front + T.back) / 2);
    mkRail(T.halfW * 2 + T.railT * 2, T.railH, T.railT, 0, T.front + T.railT / 2);

    this._dryer();
    this._basket();
    this._oddBin();
    this._shelf();
  }

  _dryer() {
    const T = TABLE, D = DRYER;
    const g = new THREE.Group();
    g.position.set(D.x, 0, T.back);
    this.room.add(g);
    const enamel = new THREE.MeshStandardMaterial({ map: TX.enamelTexture({ base: [176, 214, 196] }), roughness: 0.32, metalness: 0.0, envMapIntensity: 0.85 });
    // front plate with a round hole
    const W = 0.34, yb = -0.06, yt = 0.68;
    const sh = new THREE.Shape();
    sh.moveTo(-W, yb); sh.lineTo(W, yb); sh.lineTo(W, yt); sh.lineTo(-W, yt); sh.closePath();
    const h = new THREE.Path();
    h.absarc(0, D.doorY, D.doorR - 0.01, 0, Math.PI * 2, true);
    sh.holes.push(h);
    const front = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 2, curveSegments: 40 }), enamel);
    front.position.z = -0.012;
    front.castShadow = true; front.receiveShadow = true;
    g.add(front);
    // a short sleeve behind the front plate hides the wall's cut edge (no front face: the drum shows through the door)
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(D.doorR + 0.012, D.doorR + 0.012, 0.06, 40, 1, true), new THREE.MeshStandardMaterial({ color: 0xcfc8ba, roughness: 0.5, side: THREE.BackSide }));
    sleeve.rotation.x = Math.PI / 2; sleeve.position.set(0, D.doorY, -0.02);
    g.add(sleeve);
    // control strip
    const strip = new THREE.Mesh(new RoundedBoxGeometry(W * 2 - 0.04, 0.085, 0.02, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0xf1ead8, roughness: 0.4 }));
    strip.position.set(0, yt - 0.06, 0.012);
    g.add(strip);
    const chrome = new THREE.MeshStandardMaterial({ color: 0xdedbd2, roughness: 0.22, metalness: 1.0, envMapIntensity: 1.2 });
    for (const dx of [-0.2, 0.2]) {
      const dial = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.028, 0.02, 28), chrome);
      dial.rotation.x = Math.PI / 2; dial.position.set(dx, yt - 0.06, 0.03);
      g.add(dial);
      const tick = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.018, 0.004), new THREE.MeshStandardMaterial({ color: 0x3a3028 }));
      tick.position.set(dx, yt - 0.05, 0.042);
      g.add(tick);
    }
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x552e10, emissive: 0xff9a3c, emissiveIntensity: 0.0 });
    const pilot = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), lampMat);
    pilot.position.set(0, yt - 0.06, 0.026);
    g.add(pilot);
    this.pilotMat = lampMat;
    // drum
    const drum = new THREE.Mesh(
      new THREE.CylinderGeometry(D.doorR + 0.02, D.doorR + 0.02, 0.5, 40, 1, true),
      new THREE.MeshStandardMaterial({ color: 0x9c9f9d, metalness: 0.35, roughness: 0.55, emissive: 0x3a2a1c, emissiveIntensity: 0.35, side: THREE.BackSide })
    );
    drum.rotation.x = Math.PI / 2; drum.position.set(0, D.doorY, -0.27);
    g.add(drum);
    const back = new THREE.Mesh(new THREE.CircleGeometry(D.doorR + 0.02, 40), new THREE.MeshStandardMaterial({ color: 0x3d3935, metalness: 0.2, roughness: 0.8, emissive: 0x5a3e24, emissiveIntensity: 0.3 }));
    back.position.set(0, D.doorY, -0.5);
    g.add(back);
    // door, hinged on the left
    const hinge = new THREE.Group();
    hinge.position.set(-D.doorR, D.doorY, 0.03);
    g.add(hinge);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(D.doorR, 0.024, 16, 56), chrome);
    ring.position.set(D.doorR, 0, 0);
    ring.castShadow = true;
    hinge.add(ring);
    const glass = new THREE.Mesh(
      new THREE.CircleGeometry(D.doorR - 0.01, 48),
      new THREE.MeshPhysicalMaterial({ color: 0xe3f1f3, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.26, envMapIntensity: 1.5, clearcoat: 1, side: THREE.DoubleSide, depthWrite: false })
    );
    glass.position.set(D.doorR, 0, 0.004);
    hinge.add(glass);
    const handle = new THREE.Mesh(new RoundedBoxGeometry(0.022, 0.07, 0.03, 2, 0.008), chrome);
    handle.position.set(D.doorR * 2 + 0.01, 0, 0.012);
    hinge.add(handle);
    // socks tumbling behind the glass while the dryer finishes
    const drumSocks = new THREE.Group();
    drumSocks.position.set(0, D.doorY, -0.16);
    const colors = [0xd08a5c, 0x8a93c6, 0xf2d58e, 0x8fa58a, 0xe89a8c, 0x6f9fb3, 0xc9a88a];
    colors.forEach((c, i) => {
      const m = new THREE.Mesh(new THREE.CapsuleGeometry(0.022, 0.07, 4, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9 }));
      const a = (i / colors.length) * Math.PI * 2;
      m.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, (i % 3) * 0.05 - 0.05);
      m.rotation.set(a, a * 1.3, 0);
      drumSocks.add(m);
    });
    drumSocks.visible = false;
    g.add(drumSocks);
    this.drumSocks = drumSocks;
    this.dryerDoor = hinge;
    this.dryerGroup = g;
    this.dryerEnamel = enamel;
    this.dryerRing = ring;
    this.dryerStrip = strip;
    this._coinJar(g, yt);
  }

  // THE COIN JAR (DESIGN-T2 1.5): a glass jar on the dryer top, always there. Not a decor slot, not for sale.
  // Its fill is the cents in it; at 25 the coins fold into a paper roll and the jar starts again.
  _coinJar(g, topY) {
    const jar = new THREE.Group();
    jar.position.set(0.235, topY + 0.006, 0.055);
    g.add(jar);
    const glass = new THREE.Mesh(
      new THREE.CylinderGeometry(0.036, 0.033, 0.095, 24, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xdfeaf0, roughness: 0.08, metalness: 0, transparent: true, opacity: 0.3, side: THREE.DoubleSide, envMapIntensity: 1.4 }),
    );
    glass.position.y = 0.0475;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.006, 24), new THREE.MeshStandardMaterial({ color: 0xcfdde4, roughness: 0.2, transparent: true, opacity: 0.55 }));
    base.position.y = 0.003;
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.036, 0.004, 8, 24), new THREE.MeshStandardMaterial({ color: 0xc3d2da, roughness: 0.35 }));
    lip.rotation.x = Math.PI / 2; lip.position.y = 0.095;
    jar.add(glass, base, lip);
    // the coins inside: a short stack of little discs, hidden or shown as the jar fills
    const coinMats = [new THREE.MeshStandardMaterial({ color: 0xc07c4e, roughness: 0.35, metalness: 0.6 }), new THREE.MeshStandardMaterial({ color: 0xb4bbc1, roughness: 0.3, metalness: 0.7 })];
    const discs = [];
    for (let i = 0; i < 12; i++) {
      const d = new THREE.Mesh(new THREE.CylinderGeometry(0.011 + (i % 3) * 0.002, 0.011 + (i % 3) * 0.002, 0.0028, 14), coinMats[i % 2]);
      const a = i * 2.39;
      d.position.set(Math.cos(a) * 0.014, 0.008 + Math.floor(i / 3) * 0.0075, Math.sin(a) * 0.014);
      d.rotation.set(0.1 * Math.cos(a), a, 0.1 * Math.sin(a));
      d.visible = false;
      discs.push(d);
      jar.add(d);
    }
    // the paper roll a Quarter becomes, shown for a moment when the jar rolls over
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0xe8dcc0, roughness: 0.85 }));
    roll.rotation.z = Math.PI / 2;
    roll.position.set(0, 0.022, 0);
    roll.visible = false;
    jar.add(roll);
    this.coinJar = { group: jar, discs, roll, cents: -1, rollT: 0 };
  }

  // cents 0 to 24; `rolled` shows the paper roll for a beat
  setJar(cents, rolled = 0) {
    const J = this.coinJar;
    if (!J) return;
    const n = Math.max(0, Math.min(24, Math.floor(cents || 0)));
    if (n !== J.cents) {
      J.cents = n;
      const show = Math.round((n / 24) * J.discs.length);
      J.discs.forEach((d, i) => { d.visible = i < show; });
    }
    if (rolled) { J.roll.visible = true; J.rollT = 1.4; }
  }

  // dryer models from the unlock catalogue (DESIGN 9.5)
  setDryerLook(look) {
    const model = (look && look.model) || 'standard';
    const E = this.dryerEnamel, ring = this.dryerRing;
    const colors = { standard: 0xb0d6c4, avocado: 0xa3ad5a, industrial: 0xc9ccce, clothesline: 0xe7d2b4, portal: 0x3a3f5c };
    E.map = null;
    E.color.set(look && look.color ? look.color : colors[model] || colors.standard);
    E.metalness = model === 'industrial' ? 0.75 : model === 'portal' ? 0.4 : 0;
    E.roughness = model === 'industrial' ? 0.35 : 0.32;
    E.needsUpdate = true;
    if (!ring.userData.ownMat) { ring.material = ring.material.clone(); ring.userData.ownMat = true; }
    ring.material.emissive.set(model === 'portal' ? 0x5fd3ff : 0x000000);
    ring.material.emissiveIntensity = model === 'portal' ? 1.6 : 0;
    this.dryerStrip.material.color.set(model === 'portal' ? 0x20233a : model === 'avocado' ? 0x6b5a3a : 0xf1ead8);
    this.dryerModel = model;
  }

  setDryerDoor(open) {
    this.dryerDoor.rotation.y = -open * 1.9;
  }

  _basket() {
    const B = BASKET;
    const g = new THREE.Group();
    g.position.set(B.x, 0, B.z);
    this.room.add(g);
    this.basketGroup = g;
    this._basketMesh();
  }

  _basketMesh(radius = BASKET.radius) {
    const B = BASKET, g = this.basketGroup;
    const key = JSON.stringify([this.basketLook || null, radius]);
    if (key === this.basketKey && g.children.length) return;
    this.basketKey = key;
    this.basketRadius = radius;
    while (g.children.length) { const c = g.children[0]; g.remove(c); disposeTree(c); }
    const look = this.basketLook || {};
    const style = look.style || 'wicker';
    const k = radius / B.radius;
    if (!this.wicker) this.wicker = TX.wickerTextures({});
    const r0 = B.bottomRadius * k, R = radius, H = B.height;
    const col = new THREE.Color(look.color || '#c89a5c');
    const col2 = new THREE.Color(look.color2 || look.color || '#b5834c');
    const profile = (bulge = 0.006, n = 12) => {
      const pts = [];
      for (let i = 0; i <= n; i++) { const t = i / n; pts.push(new THREE.Vector2(r0 + (R - r0) * t + Math.sin(t * Math.PI) * bulge, t * H)); }
      return pts;
    };
    const add = (m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
    const floorDisc = (mat) => { const f = new THREE.Mesh(new THREE.CircleGeometry(r0, 40), mat); f.rotation.x = -Math.PI / 2; f.position.y = 0.012; f.receiveShadow = true; g.add(f); };
    const rimTorus = (mat, tube = 0.011) => { const rim = new THREE.Mesh(new THREE.TorusGeometry(R + 0.003, tube, 12, 64), mat); rim.rotation.x = Math.PI / 2; rim.position.y = H; add(rim); };
    if (style === 'wicker' || style === 'doll') {
      const map = this.wicker.map.clone(); map.needsUpdate = true; map.repeat.set(style === 'doll' ? 2 : 3, 1);
      const nrm = this.wicker.normal.clone(); nrm.needsUpdate = true; nrm.repeat.set(style === 'doll' ? 2 : 3, 1);
      const tint = look.color ? col : new THREE.Color(0xffffff);
      const mat = new THREE.MeshStandardMaterial({ map, color: tint, normalMap: nrm, normalScale: new THREE.Vector2(1.2, 1.2), roughness: 0.8, side: THREE.DoubleSide });
      add(new THREE.Mesh(new THREE.LatheGeometry(profile(), 48), mat));
      floorDisc(new THREE.MeshStandardMaterial({ map, color: tint, roughness: 0.85 }));
      const rimMat = new THREE.MeshStandardMaterial({ color: look.color2 ? col2 : 0xb5834c, roughness: 0.7, normalMap: nrm, normalScale: new THREE.Vector2(0.8, 0.8) });
      rimTorus(rimMat);
      for (const s of [-1, 1]) {
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.035 * Math.max(0.7, k), 0.008, 10, 24, Math.PI), rimMat);
        handle.position.set(s * (R + 0.008), H - 0.012, 0);
        handle.rotation.y = Math.PI / 2;
        g.add(handle);
      }
      if (style === 'doll') {
        const bow = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), new THREE.MeshStandardMaterial({ color: col2, roughness: 0.6 }));
        bow.scale.set(1.6, 0.7, 0.7); bow.position.set(0, H * 0.7, R + 0.01);
        g.add(bow);
      }
    } else if (style === 'plastic' || style === 'claw') {
      const slots = TX.slotTexture(style === 'claw');
      slots.repeat.set(style === 'claw' ? 4 : 10, 1);
      const mat = new THREE.MeshStandardMaterial({ color: col, roughness: style === 'claw' ? 0.15 : 0.45, metalness: style === 'claw' ? 0.1 : 0, alphaMap: slots, transparent: false, alphaTest: 0.5, side: THREE.DoubleSide });
      add(new THREE.Mesh(new THREE.LatheGeometry(profile(0.002), 40), mat));
      floorDisc(new THREE.MeshStandardMaterial({ color: col.clone().multiplyScalar(0.85), roughness: 0.5 }));
      rimTorus(new THREE.MeshStandardMaterial({ color: col2, roughness: 0.35, metalness: style === 'claw' ? 0.8 : 0 }), 0.013);
      if (style === 'claw') {
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.006, R + 0.006, 0.08, 32, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xdff3ff, transparent: true, opacity: 0.18, roughness: 0.05, side: THREE.DoubleSide }));
        glass.position.y = H + 0.04;
        g.add(glass);
      }
    } else if (style === 'wire') {
      const grid = TX.slotTexture(false, true);
      grid.repeat.set(12, 4);
      const mat = new THREE.MeshStandardMaterial({ color: look.color || '#d7d9d6', roughness: 0.3, metalness: 0.9, alphaMap: grid, alphaTest: 0.5, side: THREE.DoubleSide });
      add(new THREE.Mesh(new THREE.LatheGeometry(profile(0), 40), mat));
      floorDisc(mat);
      rimTorus(new THREE.MeshStandardMaterial({ color: 0xcfd2cf, roughness: 0.25, metalness: 1 }), 0.006);
    } else if (style === 'bag') {
      const pts = [];
      for (let i = 0; i <= 16; i++) { const t = i / 16; pts.push(new THREE.Vector2(r0 * 0.9 + (R * 1.05 - r0 * 0.9) * Math.sin(t * Math.PI * 0.6) + Math.sin(t * Math.PI) * 0.02, t * H * 1.05)); }
      const cloth = TX.matTexture({ size: 256, base: [col.r * 255, col.g * 255, col.b * 255], line: [245, 238, 222] });
      cloth.repeat.set(3, 1);
      add(new THREE.Mesh(new THREE.LatheGeometry(pts, 40), new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.95, side: THREE.DoubleSide })));
      floorDisc(new THREE.MeshStandardMaterial({ map: cloth, roughness: 0.95 }));
      rimTorus(new THREE.MeshStandardMaterial({ color: col2, roughness: 0.9 }), 0.008);
      const cord = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.005, 8, 20), new THREE.MeshStandardMaterial({ color: 0xf1e7d2, roughness: 0.9 }));
      cord.position.set(0, H * 1.05, R + 0.02); g.add(cord);
    } else if (style === 'floatie') {
      const stripes = TX.stripeTexture(look.color || '#ff8fa3', look.color2 || '#fff4e0');
      const ring = add(new THREE.Mesh(new THREE.TorusGeometry(R + 0.012, 0.04, 20, 48), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.25, metalness: 0 })));
      ring.rotation.x = Math.PI / 2; ring.position.y = H - 0.04;
      const net = TX.slotTexture(false, true); net.repeat.set(10, 3);
      add(new THREE.Mesh(new THREE.LatheGeometry(profile(0), 32), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, alphaMap: net, alphaTest: 0.5, side: THREE.DoubleSide })));
      floorDisc(new THREE.MeshStandardMaterial({ color: 0x9ed8e6, roughness: 0.5 }));
    } else if (style === 'log') {
      const bark = TX.woodTexture({ w: 256, h: 256, planks: 1, base: [110, 78, 52], dark: [58, 40, 28], seed: 17 });
      bark.repeat.set(3, 1);
      add(new THREE.Mesh(new THREE.LatheGeometry(profile(0.01), 28), new THREE.MeshStandardMaterial({ map: bark, roughness: 0.95, side: THREE.DoubleSide })));
      floorDisc(new THREE.MeshStandardMaterial({ color: 0x5a4030, roughness: 1 }));
      const rings = new THREE.Mesh(new THREE.RingGeometry(R - 0.01, R + 0.025, 40), new THREE.MeshStandardMaterial({ color: 0xd8b387, roughness: 0.8, side: THREE.DoubleSide }));
      rings.rotation.x = -Math.PI / 2; rings.position.y = H + 0.002; g.add(rings);
      const moss = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 8), new THREE.MeshStandardMaterial({ color: 0x6f8f4e, roughness: 1 }));
      moss.scale.set(1.5, 0.5, 1); moss.position.set(R * 0.7, H, R * 0.6); g.add(moss);
    }
  }
  setBasketRadius(r) { this._basketMesh(r); }

  setBasketTilt(tx, tz) {
    this.basketGroup.rotation.set(tx, 0, tz);
  }

  _oddBin() {
    const B = ODDBIN;
    const g = new THREE.Group();
    g.position.set(B.x, 0, B.z);
    this.room.add(g);
    const card = TX.cardboardTexture({});
    const m = new THREE.MeshStandardMaterial({ map: card, roughness: 0.9 });
    const add = (w, h, d, x, y, z) => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
      b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true;
      g.add(b);
    };
    add(B.halfW * 2, B.wallT, B.halfD * 2, 0, B.wallT / 2, 0);
    add(B.wallT, B.height, B.halfD * 2, -B.halfW, B.height / 2, 0);
    add(B.wallT, B.height, B.halfD * 2, B.halfW, B.height / 2, 0);
    add(B.halfW * 2, B.height, B.wallT, 0, B.height / 2, -B.halfD);
    add(B.halfW * 2, B.height, B.wallT, 0, B.height / 2, B.halfD);
    // flaps folded outward, their inner edge resting on the wall tops; the label rides the front flap
    const label = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.056), new THREE.MeshStandardMaterial({ map: TX.labelTexture('ODD SOCKS'), roughness: 0.8 }));
    for (const s of [-1, 1]) {
      const f = new THREE.Mesh(new THREE.BoxGeometry(B.halfW * 2, 0.004, 0.06), m);
      f.position.set(0, B.height - 0.014, s * (B.halfD + 0.026));
      f.rotation.x = s * 0.55;
      f.castShadow = true;
      g.add(f);
      if (s === 1) { label.position.set(0, 0.0025, 0); label.rotation.set(-Math.PI / 2, 0, -0.04); f.add(label); }
    }
    this.binGroup = g;
  }

  _shelf() {
    // a shelf above the dryer with a jar and a plant: the room reads as lived in
    const T = TABLE;
    const wood = new THREE.MeshStandardMaterial({ color: 0x9a6b44, roughness: 0.6 });
    const shelf = new THREE.Mesh(new RoundedBoxGeometry(1.3, 0.03, 0.16, 2, 0.006), wood);
    shelf.position.set(0, 0.86, T.back + 0.08);
    shelf.castShadow = true; shelf.receiveShadow = true;
    this.room.add(shelf);
    const jarMat = new THREE.MeshPhysicalMaterial({ color: 0xdcebe6, roughness: 0.1, transparent: true, opacity: 0.45, clearcoat: 1 });
    const jar = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 24), jarMat);
    jar.position.set(-0.42, 0.935, T.back + 0.08);
    this.room.add(jar);
    const pins = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.07, 20), new THREE.MeshStandardMaterial({ color: 0xd9a47a, roughness: 0.8 }));
    pins.position.set(-0.42, 0.91, T.back + 0.08);
    this.room.add(pins);
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.038, 0.08, 20), new THREE.MeshStandardMaterial({ color: 0xc0714a, roughness: 0.8 }));
    pot.position.set(0.45, 0.915, T.back + 0.08);
    pot.castShadow = true;
    this.room.add(pot);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x5f8a4e, roughness: 0.7, side: THREE.DoubleSide });
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.035, 10, 6), leafMat);
      const a = (i / 9) * Math.PI * 2;
      leaf.scale.set(0.45, 0.18, 1.2);
      leaf.position.set(0.45 + Math.cos(a) * 0.04, 0.99 + (i % 3) * 0.02, T.back + 0.08 + Math.sin(a) * 0.04);
      leaf.rotation.set(0.6 * Math.cos(a), -a, 0.6 * Math.sin(a));
      leaf.castShadow = true;
      this.room.add(leaf);
    }
    const detergent = new THREE.Mesh(new RoundedBoxGeometry(0.09, 0.14, 0.06, 2, 0.012), new THREE.MeshStandardMaterial({ color: 0x6f9fb3, roughness: 0.45 }));
    detergent.position.set(0.2, 0.945, T.back + 0.08);
    detergent.castShadow = true;
    this.room.add(detergent);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 16), new THREE.MeshStandardMaterial({ color: 0xf2eee2, roughness: 0.4 }));
    cap.position.set(0.22, 1.025, T.back + 0.08);
    this.room.add(cap);
  }

  // ---------- ball styles (Rush cosmetics, DESIGN 9.5): the collider never changes ----------
  setBallStyle(roll = 'tight') {
    if (roll === this.ballRoll) return;
    this.ballRoll = roll;
    const geo = ballGeometry(roll);
    for (const pool of [this.ballPool, this.heldBallPool]) {
      const old = pool.mesh.geometry;
      const g = geo.clone();
      g.setAttribute('aTile', pool.tile);
      g.setAttribute('aFlags', pool.flags);
      pool.mesh.geometry = g;
      old.dispose();
    }
  }

  // ---------- little puffs: a pair rolling up, a ball landing in the basket ----------
  puff(p, { color = 0xfff3d6, count = 14, speed = 0.35, size = 60, kind = 'sparkle', life = 0.55 } = {}) {
    if (!this.puffs) {
      const N = 160;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(N), 1));
      g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      g.setAttribute('psize', new THREE.BufferAttribute(new Float32Array(N), 1));
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uMap: { value: TX.particleTexture('sparkle') }, uPx: { value: this.r.getPixelRatio() } },
        // each puff keeps its own size (two puffs can overlap); colours are linear and encoded on output
        vertexShader: 'attribute float alpha; attribute float psize; attribute vec3 color; uniform float uPx; varying float vA; varying vec3 vC; void main(){ vA = alpha; vC = color; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = psize * uPx * (0.4 + alpha * 0.8) / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform sampler2D uMap; varying float vA; varying vec3 vC; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(vC * t.rgb, t.a * vA);\n#include <colorspace_fragment>\n}',
      });
      this.puffs = new THREE.Points(g, mat);
      this.puffs.frustumCulled = false;
      this.puffs.renderOrder = 5;
      this.scene.add(this.puffs);
      this.puffData = Array.from({ length: N }, () => ({ x: 0, y: -9, z: 0, vx: 0, vy: 0, vz: 0, age: 9, life: 1, size: 60, c: new THREE.Color() }));
      this.puffNext = 0;
    }
    const c = new THREE.Color(color);
    for (let i = 0; i < count; i++) {
      const d = this.puffData[this.puffNext];
      this.puffNext = (this.puffNext + 1) % this.puffData.length;
      const a = Math.random() * Math.PI * 2, e = Math.random() * 0.9 + 0.2;
      const s = speed * (0.5 + Math.random() * 0.8);
      Object.assign(d, { x: p.x, y: p.y, z: p.z, vx: Math.cos(a) * Math.cos(e) * s, vy: Math.sin(e) * s, vz: Math.sin(a) * Math.cos(e) * s, age: 0, life: life * (0.7 + Math.random() * 0.6), size });
      d.c.copy(c).offsetHSL(0, 0, (Math.random() - 0.5) * 0.15);
    }
    void kind;
  }

  _stepPuffs(dt) {
    if (!this.puffs) return;
    const pos = this.puffs.geometry.attributes.position, al = this.puffs.geometry.attributes.alpha, col = this.puffs.geometry.attributes.color, ps = this.puffs.geometry.attributes.psize;
    let live = false;
    this.puffData.forEach((d, i) => {
      if (d.age >= d.life) { if (al.getX(i) !== 0) { al.setX(i, 0); live = true; } return; }
      live = true;
      d.age += dt;
      d.vy -= 0.6 * dt;
      d.vx *= 0.96; d.vz *= 0.96;
      d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
      pos.setXYZ(i, d.x, d.y, d.z);
      al.setX(i, Math.max(0, 1 - d.age / d.life));
      col.setXYZ(i, d.c.r, d.c.g, d.c.b);
      ps.setX(i, d.size);
    });
    if (live) { pos.needsUpdate = true; al.needsUpdate = true; col.needsUpdate = true; ps.needsUpdate = true; }
  }

  // a quick squash of the basket when a ball lands in it
  bumpBasket() { this.basketBump = 1; }

  // ---------- shot trails ----------
  setTrail(kind) {
    this.trailKind = kind || null;
    if (!kind) { if (this.trail) this.trail.visible = false; return; }
    if (!this.trail) {
      const N = 90;
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      g.setAttribute('alpha', new THREE.BufferAttribute(new Float32Array(N), 1));
      const mat = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false,
        uniforms: { uMap: { value: null }, uColor: { value: new THREE.Color() }, uSize: { value: 40 }, uPx: { value: this.r.getPixelRatio() } },
        vertexShader: 'attribute float alpha; varying float vA; uniform float uSize; uniform float uPx; void main(){ vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uSize * uPx * (0.6 + alpha * 0.6) / -mv.z; gl_Position = projectionMatrix * mv; }',
        fragmentShader: 'uniform sampler2D uMap; uniform vec3 uColor; varying float vA; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); gl_FragColor = vec4(uColor * t.rgb, t.a * vA);\n#include <colorspace_fragment>\n}',
      });
      this.trail = new THREE.Points(g, mat);
      this.trail.frustumCulled = false;
      this.scene.add(this.trail);
      this.trailData = Array.from({ length: N }, () => ({ x: 0, y: -9, z: 0, age: 9, life: 1, vx: 0, vy: 0, vz: 0 }));
      this.trailNext = 0;
    }
    const m = this.trail.material;
    m.uniforms.uMap.value = TX.particleTexture(kind);
    m.uniforms.uColor.value.set(kind === 'hearts' ? 0xff9fb2 : kind === 'dust' ? 0xcfc6b8 : 0xfff2c8);
    m.uniforms.uSize.value = kind === 'hearts' ? 70 : kind === 'dust' ? 90 : 50;
    this.trail.visible = true;
  }

  emitTrail(p, v) {
    if (!this.trail || !this.trailKind) return;
    const d = this.trailData[this.trailNext];
    this.trailNext = (this.trailNext + 1) % this.trailData.length;
    const j = () => (Math.random() - 0.5) * 0.02;
    Object.assign(d, { x: p.x + j(), y: p.y + j(), z: p.z + j(), age: 0, life: this.trailKind === 'dust' ? 0.9 : 0.6, vx: -v.x * 0.05 + j(), vy: (this.trailKind === 'hearts' ? 0.15 : 0.02), vz: -v.z * 0.05 + j() });
  }

  _stepTrail(dt) {
    if (!this.trail || !this.trail.visible) return;
    const pos = this.trail.geometry.attributes.position, al = this.trail.geometry.attributes.alpha;
    this.trailData.forEach((d, i) => {
      d.age += dt;
      d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
      const k = d.age / d.life;
      pos.setXYZ(i, d.x, k < 1 ? d.y : -9, d.z);
      al.setX(i, k < 1 ? (1 - k) * (this.trailKind === 'sparkle' ? 0.6 + 0.4 * Math.sin(d.age * 40) : 1) : 0);
    });
    pos.needsUpdate = true;
    al.needsUpdate = true;
  }

  // ---------- basket styles (DESIGN 9.5) ----------
  setBasketStyle(look) {
    this.basketLook = look || null;
    this._basketMesh(this.basketRadius || BASKET.radius);
  }

  // ---------- Good toss: a faint dotted arc while a ball is held (DESIGN 9.4) ----------
  setArc(L) {
    if (!this.arc) {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3 * 40), 3));
      const m = new THREE.PointsMaterial({ size: 0.014, color: 0xfff3d6, transparent: true, opacity: 0.8, map: TX.blobTexture(64, 'rgba(255,255,255,1)'), depthWrite: false, sizeAttenuation: true });
      this.arc = new THREE.Points(g, m);
      this.arc.frustumCulled = false;
      this.scene.add(this.arc);
    }
    if (!L || !L.v) { this.arc.visible = false; return; }
    const pos = this.arc.geometry.attributes.position;
    let n = 0;
    for (let i = 1; i <= 40; i++) {
      const t = i * 0.035;
      const y = L.start.y + L.v.y * t - 4.905 * t * t;
      if (y < 0) break;
      pos.setXYZ(n++, L.start.x + L.v.x * t, y, L.start.z + L.v.z * t);
    }
    this.arc.geometry.setDrawRange(0, n);
    pos.needsUpdate = true;
    this.arc.visible = true;
  }

  // ---------- a warm glow behind whatever sits in the hand (in the scene, so it never covers the sock) ----------
  setHandGlow(pose, frac = 0.38) {
    if (!this.handGlow) {
      if (!pose) return;
      this.handGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: TX.blobTexture(128, 'rgba(255,226,170,0.75)'), transparent: true, depthWrite: false, toneMapped: false }));
      this.handGlow.frustumCulled = false;
      this.scene.add(this.handGlow);
    }
    this.handGlow.visible = !!pose;
    if (!pose) return;
    const cam = this.camera.position;
    const dir = new THREE.Vector3(pose.x - cam.x, pose.y - cam.y, pose.z - cam.z);
    const d = dir.length() + 0.25;   // held items sit well in front of the table on this ray
    this.handGlow.position.copy(cam).addScaledVector(dir.normalize(), d);
    const sc = d * 2 * Math.tan(THREE.MathUtils.degToRad(this.camera.fov) / 2) * frac;
    this.handGlow.scale.set(sc, sc, 1);
  }

  // ---------- lint fog puffs (drawn in the scene, so a held sock is always in front) ----------
  setFog(list) {
    if (!this.fogGroup) {
      this.fogGroup = new THREE.Group();
      this.scene.add(this.fogGroup);
      this.fogTex = TX.lintTexture();
    }
    const g = this.fogGroup;
    while (g.children.length < list.length) {
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: this.fogTex, transparent: true, depthWrite: false, opacity: 0.95 }));
      s.material.rotation = g.children.length * 1.7;   // six puffs, not six identical stamps
      g.add(s);
    }
    g.children.forEach((s, i) => {
      const f = list[i];
      s.visible = !!f;
      if (!f) return;
      s.position.set(f.x, f.y, f.z);
      s.scale.set(f.s * 2.2, f.s * 2.2, 1);
    });
  }

  // ---------- views: the table, or the whole laundry room (the menu, DESIGN 9.1) ----------
  setView(name, instant = false) {
    if (this.camOverride) return;
    const target = this.framings && this.framings[name];
    this.view = name;
    if (!target) return;
    if (instant || !this.pose || this.reduceMotion) { this._applyPose(target); this.camAnim = null; return; }
    this.camAnim = { from: { pos: this.pose.pos.slice(), look: this.pose.look.slice(), fov: this.pose.fov }, to: target, t: 0, dur: 0.9 };
  }

  _stepCam(dt) {
    const a = this.camAnim;
    if (!a) return;
    a.t += dt;
    const k = Math.min(1, a.t / a.dur);
    const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
    const L = (x, y) => x + (y - x) * e;
    this._applyPose({
      pos: a.from.pos.map((v, i) => L(v, a.to.pos[i])),
      look: a.from.look.map((v, i) => L(v, a.to.look[i])),
      fov: L(a.from.fov, a.to.fov),
    });
    if (k >= 1) this.camAnim = null;
  }

  _fitRoom(aspect) {
    // the room view: the dryer, the table, the dresser, the door and the line all in frame
    const portrait = aspect < 0.8;
    const fov = portrait ? 56 : 44;
    const cam = new THREE.PerspectiveCamera(fov, aspect, 0.05, 30);
    // frame the room from the clothesline down to just below the table top; the floor fills the rest
    const pts = [[-1.62, 0.2, -0.95], [1.38, -0.4, -0.5], [1.38, 0.26, -0.5], [0, 1.62, -0.64], [0, -0.42, 0.66], [-0.5, -0.42, 0.66], [0.5, -0.42, 0.66]].map((p) => new THREE.Vector3(...p));
    for (let d = 2; d < 9; d += 0.05) {
      cam.position.set(0.05, 0.55 + d * 0.16, 0.2 + d);
      cam.lookAt(0, 0.28, -0.75);
      cam.updateMatrixWorld();
      if (pts.every((p) => { const v = p.clone().project(cam); return Math.abs(v.x) < 0.98 && Math.abs(v.y) < 0.9; })) {
        return { pos: cam.position.toArray(), look: [0, 0.28, -0.75], fov };
      }
    }
    return { pos: [0.05, 1.6, 6.5], look: [0, 0.28, -0.75], fov };
  }

  // ---------- camera ----------
  resize(w, h) {
    this.w = w; this.h = h;
    this.r.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.framings = { table: this._fitTable(w / h), room: this._fitRoom(w / h) };
    if (this.camOverride) this._applyPose(this.camOverride);
    else if (!this.camAnim) this._applyPose(this.framings[this.view] || this.framings.table);
  }

  _fitTable(aspect) {
    // keep the table's front corners inside the width, the basket and dryer door inside
    // the height, and leave the top band for the HUD. Searched, not guessed.
    const T = TABLE;
    const cam = new THREE.PerspectiveCamera(aspect < 0.8 ? 44 : 40, aspect, 0.05, 30);
    const elev = aspect < 0.8 ? 0.97 : 0.9; // radians below horizontal
    const pts = [
      [-T.halfW - 0.035, 0.05, T.front + 0.04], [T.halfW + 0.035, 0.05, T.front + 0.04],
      [-T.halfW - 0.035, 0.05, T.playBack], [T.halfW + 0.035, 0.05, T.playBack],
      [BASKET.x + BASKET.radius, BASKET.height, BASKET.z], [ODDBIN.x - ODDBIN.halfW, ODDBIN.height, ODDBIN.z],
      [DRYER.x, DRYER.doorY + DRYER.doorR + 0.02, T.back],
    ].map((p) => new THREE.Vector3(...p));
    const topLimit = aspect < 0.8 ? 0.78 : 0.86;
    let best = null;
    for (let d = 1.2; d < 5 && !best; d += 0.02) {
      for (let tz = 0.3; tz > -0.7; tz -= 0.02) {
        cam.position.set(0, Math.sin(elev) * d, tz + Math.cos(elev) * d);
        cam.lookAt(0, 0, tz);
        cam.updateMatrixWorld();
        let ok = true, minY = 9;
        for (const p of pts) {
          const v = p.clone().project(cam);
          if (Math.abs(v.x) > 0.97 || v.y > topLimit || v.y < -0.97) { ok = false; break; }
          minY = Math.min(minY, v.y);
        }
        if (ok) { best = { pos: cam.position.toArray(), look: [0, 0, tz], fov: cam.fov }; break; }
      }
    }
    return best || { pos: [0, 2.6, 1.6], look: [0, 0, -0.1], fov: 44 };
  }

  _applyPose(p) {
    this.camera.fov = p.fov;
    this.camera.position.fromArray(p.pos);
    this.camera.lookAt(new THREE.Vector3().fromArray(p.look));
    this.camera.updateProjectionMatrix();
    this.camera.updateMatrixWorld();
    this.pose = p;
  }

  // distance from the camera to the table centre, for sizing held socks
  tableDistance() {
    return this.camera.position.distanceTo(new THREE.Vector3().fromArray(this.pose.look));
  }

  ray(x, y) {
    const v = new THREE.Vector3((x / this.w) * 2 - 1, -(y / this.h) * 2 + 1, 0.5);
    v.unproject(this.camera);
    const o = this.camera.position.clone();
    const d = v.sub(o).normalize();
    return { origin: { x: o.x, y: o.y, z: o.z }, dir: { x: d.x, y: d.y, z: d.z } };
  }

  // Where the finger ray meets the plane y = h.
  planePoint(x, y, h) {
    const { origin: o, dir: d } = this.ray(x, y);
    if (Math.abs(d.y) < 1e-5) return null;
    const t = (h - o.y) / d.y;
    return { x: o.x + d.x * t, y: h, z: o.z + d.z * t };
  }

  // Point along the finger ray at distance dist from the camera.
  rayPoint(x, y, dist) {
    const { origin: o, dir: d } = this.ray(x, y);
    return new THREE.Vector3(o.x + d.x * dist, o.y + d.y * dist, o.z + d.z * dist);
  }

  project(p) {
    const v = new THREE.Vector3(p.x, p.y, p.z).project(this.camera);
    return { x: (v.x + 1) / 2 * this.w, y: (1 - v.y) / 2 * this.h, z: v.z };
  }

  render(dt) {
    this._stepCam(dt);
    this._stepTrail(dt);
    this._stepPuffs(dt);
    if (this.drumSocks && this.drumSocks.visible) {
      this.drumSocks.rotation.z -= dt * 5.5;
      this.drumSocks.children.forEach((m, i) => { m.rotation.x += dt * (2 + i * 0.3); m.position.y = Math.sin(this.clock * 5 + i) * 0.02 + Math.sin((i / 7) * Math.PI * 2) * 0.1; });
    }
    if (this.basketBump) {
      this.basketBump = Math.max(0, this.basketBump - dt * 4);
      const k = Math.sin((1 - this.basketBump) * Math.PI) * 0.06;
      this.basketGroup.scale.set(1 + k, 1 - k, 1 + k);
    }
    // the paper roll sits on the jar for a beat after 25 cents fold themselves up, then it is gone
    if (this.coinJar && this.coinJar.rollT > 0) {
      this.coinJar.rollT -= dt;
      this.coinJar.roll.rotation.x += dt * 2.2;
      if (this.coinJar.rollT <= 0) this.coinJar.roll.visible = false;
    }
    this.onFrame?.(dt);
    this.clock += dt;
    this.uniforms.uTime.value = this.clock;
    this.r.render(this.scene, this.camera);
  }

  info() {
    const i = this.r.info;
    return { calls: i.render.calls, tris: i.render.triangles };
  }
}

function remapUV(geo, w, h, x0, y0) {
  const p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) - x0) / w, (p.getY(i) - y0) / h);
  uv.needsUpdate = true;
}

// A rolled pair: squashed sphere, a raised tuck ridge where the cuff folds over, a little lumpiness.
function ballGeometry(roll = 'tight') {
  const r = PHYS.ball.radius;
  const g = new THREE.SphereGeometry(r, 36, 24);
  const p = g.attributes.position;
  // tight: a neat roll; loose: a lumpy bundle; tucked: small and flat; mom: the cuff folded over twice
  const S = { tight: { size: 1, lump: 0.025, squash: 0.9, ridge: 0.07, ridge2: 0 }, loose: { size: 1.1, lump: 0.08, squash: 0.95, ridge: 0.05, ridge2: 0 }, tucked: { size: 0.93, lump: 0.015, squash: 0.78, ridge: 0.09, ridge2: 0 }, mom: { size: 1.02, lump: 0.03, squash: 0.88, ridge: 0.08, ridge2: 0.07 } }[roll] || { size: 1, lump: 0.025, squash: 0.9, ridge: 0.07, ridge2: 0 };
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const lat = Math.asin(Math.max(-1, Math.min(1, y / r)));
    const lon = Math.atan2(z, x);
    let k = 1 + S.ridge * Math.exp(-Math.pow((lat - 0.55) / 0.09, 2)) - 0.03 * Math.exp(-Math.pow((lat - 0.72) / 0.12, 2));
    k += S.ridge2 * Math.exp(-Math.pow((lat - 0.15) / 0.08, 2));
    k += S.lump * Math.sin(lon * 3 + lat * 5) * Math.cos(lat * 2) + S.lump * 0.5 * Math.sin(lon * 7 - lat * 3);
    k *= S.size;
    p.setXYZ(i, x * k, y * k * S.squash, z * k);
  }
  g.computeVertexNormals();
  const shade = new Float32Array(p.count).fill(1);
  g.setAttribute('aShade', new THREE.BufferAttribute(shade, 1));
  g.translate(0, 0, 0);
  return g;
}

// Until sockgen paints the real atlas: soft stripes so step 1 already reads as socks.
function placeholderAtlas() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const x = c.getContext('2d');
  const n = ATLAS_N, s = 256 / n;
  for (let i = 0; i < n * n; i++) {
    const cx = (i % n) * s, cy = Math.floor(i / n) * s;
    const h = (i * 47) % 360;
    x.fillStyle = `hsl(${h},45%,62%)`;
    x.fillRect(cx, cy, s, s);
    x.fillStyle = `hsl(${(h + 180) % 360},35%,88%)`;
    for (let k = 0; k < 4; k++) x.fillRect(cx, cy + k * s / 4 + s / 10, s, s / 16);
  }
  return c;
}
