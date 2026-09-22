// The Laundry Room around the table (DESIGN 9.1): dresser (the Drawer), door, window, radio,
// the Clothesline across the top of the room, and the decor the player has placed.
// Returns anchors (world points) the UI turns into 48 px hotspots.

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import * as TX from './textures.js';
import { TABLE, DRYER, ODDBIN, isNightHour, WALL_SHELF } from './config.js';
import { disposeTree } from './render.js';
import { renderFlat } from '../engine/flat.js';
import { decode, findFleck } from '../engine/sockgen.js';
import { containerOf } from './finds.js';

const FLOOR = -0.76;

export function buildRoom(R, app) {
  const room = R.room;
  const g = new THREE.Group();
  room.add(g);
  const T = TABLE;
  const wood = TX.woodTexture({ w: 256, h: 256, planks: 3, base: [184, 138, 96], dark: [128, 88, 58], seed: 12 });
  const shadowed = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
  const box = (w, h, d, mat, x, y, z, r = 0.01) => { const m = shadowed(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 2, r), mat)); m.position.set(x, y, z); g.add(m); return m; };

  // ---------- dresser: the Drawer ----------
  const dresserX = 1.02, dresserZ = T.back + 0.25;
  const paint = new THREE.MeshStandardMaterial({ color: 0x9db59a, roughness: 0.55 });
  const trim = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5 });
  const brass = new THREE.MeshStandardMaterial({ color: 0xd4b06a, roughness: 0.3, metalness: 1 });
  const dH = 1.0, dW = 0.66, dD = 0.46;
  box(dW, dH, dD, paint, dresserX, FLOOR + dH / 2, dresserZ, 0.02);
  box(dW + 0.04, 0.035, dD + 0.04, trim, dresserX, FLOOR + dH + 0.017, dresserZ, 0.01);
  const drawers = [];
  for (let i = 0; i < 3; i++) {
    const y = FLOOR + 0.2 + i * 0.3;
    const open = i === 2 ? 0.14 : 0;
    const dr = box(dW - 0.06, 0.25, 0.04, new THREE.MeshStandardMaterial({ color: 0xb4c9ae, roughness: 0.5 }), dresserX, y, dresserZ + dD / 2 + 0.005 + open, 0.012);
    for (const s of [-1, 1]) { const k = new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), brass); k.position.set(dresserX + s * 0.16, y, dresserZ + dD / 2 + 0.035 + open); g.add(k); }
    drawers.push(dr);
    if (open) {
      // the open drawer: folded sock balls peeking out
      const inside = box(dW - 0.1, 0.02, 0.3, new THREE.MeshStandardMaterial({ color: 0x7c6a58, roughness: 0.9 }), dresserX, y + 0.02, dresserZ + dD / 2 - 0.1 + open, 0.004);
      void inside;
      const colors = [0xd08a5c, 0x8a93c6, 0xf2d58e, 0x8fa58a, 0xe89a8c, 0x6f9fb3];
      colors.forEach((c, k) => {
        const ball = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 0.9, normalMap: R.knit, normalScale: new THREE.Vector2(0.6, 0.6) })));
        ball.scale.set(1, 0.85, 1);
        ball.position.set(dresserX - 0.2 + k * 0.08, y + 0.075 + (k % 2) * 0.012, dresserZ + dD / 2 - 0.05 + open + (k % 2 ? -0.07 : 0));
        g.add(ball);
      });
    }
  }

  // ---------- door ----------
  const doorX = -1.2;
  // a painted door in dusty blue, so it reads as a door against the cream wall (it used to vanish into it)
  const doorMat = new THREE.MeshStandardMaterial({ color: 0x9fb6c2, roughness: 0.55 });
  const door = box(0.86, 2.0, 0.05, doorMat, doorX, FLOOR + 1.0, T.back + 0.03, 0.01);
  for (const [px, py, pw, ph] of [[0, 0.5, 0.62, 0.66], [0, -0.35, 0.62, 0.8]]) {
    const panel = box(pw, ph, 0.02, new THREE.MeshStandardMaterial({ color: 0xb3c6cf, roughness: 0.55 }), doorX + px, FLOOR + 1.0 + py, T.back + 0.065, 0.02);
    void panel;
  }
  const knob = new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 12), brass);
  knob.position.set(doorX + 0.32, FLOOR + 0.95, T.back + 0.09);
  g.add(knob);
  box(0.96, 0.06, 0.06, trim, doorX, FLOOR + 2.03, T.back + 0.03, 0.01);
  // the frame's sides, so the top trim reads as a door frame and not a floating shelf
  for (const sx of [-1, 1]) box(0.05, 2.03, 0.06, trim, doorX + sx * 0.455, FLOOR + 1.0, T.back + 0.03, 0.01);
  // a hand towel on the door hook, and a tiny sign
  const hook = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.005, 8, 16, Math.PI), brass);
  hook.position.set(doorX, FLOOR + 1.62, T.back + 0.08); hook.rotation.z = Math.PI;
  g.add(hook);
  const towel = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.22, 0.36, 4, 6), new THREE.MeshStandardMaterial({ map: TX.stripeTexture('#e8a598', '#f7ede0'), roughness: 0.95, side: THREE.DoubleSide })));
  towel.position.set(doorX, FLOOR + 1.43, T.back + 0.1);
  towel.rotation.x = -0.08;
  g.add(towel);

  // ---------- window with a view ----------
  const winX = 0.98, winY = 0.98, winW = 0.66, winH = 0.62;
  const views = {};
  const viewPlane = new THREE.Mesh(new THREE.PlaneGeometry(winW, winH), new THREE.MeshBasicMaterial({ map: null, toneMapped: false }));
  viewPlane.position.set(winX, winY, T.back + 0.008);
  viewPlane.name = 'windowView';   // in front of the wallpaper (it showed sprigs through the glass)
  g.add(viewPlane);
  const frameMat = new THREE.MeshStandardMaterial({ color: 0xf6efe2, roughness: 0.5 });
  for (const m of [
    box(winW + 0.08, 0.05, 0.06, frameMat, winX, winY + winH / 2 + 0.02, T.back + 0.02),
    box(winW + 0.08, 0.05, 0.12, frameMat, winX, winY - winH / 2 - 0.02, T.back + 0.04),
    box(0.05, winH + 0.1, 0.06, frameMat, winX - winW / 2 - 0.02, winY, T.back + 0.02),
    box(0.05, winH + 0.1, 0.06, frameMat, winX + winW / 2 + 0.02, winY, T.back + 0.02),
    box(0.025, winH, 0.03, frameMat, winX, winY, T.back + 0.01),
    box(winW, 0.025, 0.03, frameMat, winX, winY, T.back + 0.01),
  ]) m.name = 'windowFrame';
  const winLight = new THREE.PointLight(0xdfe9ff, 0.5, 2.5, 1.5);
  winLight.position.set(winX, winY, T.back + 0.3);
  g.add(winLight);
  // THE TWO VIEWS THAT MOVE (DESIGN-T2 3.3). Repainting a 256x240 canvas every frame for a train is not a
  // thing a phone should do, so the view is painted once and ONE little mesh slides across the glass in
  // front of it. It is clipped to the window by a scissor of geometry: it simply never leaves that band.
  const mover = new THREE.Group();
  mover.position.set(winX, winY, T.back + 0.009);
  mover.name = 'windowMover';
  mover.visible = false;
  g.add(mover);
  const moverMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.135), new THREE.MeshBasicMaterial({ transparent: true, toneMapped: false }));
  mover.add(moverMesh);
  const moverTex = {};
  function moverTexture(kind, night) {
    const key = kind + (night ? '-n' : '');
    if (moverTex[key]) return moverTex[key];
    moverTex[key] = canvasTex(128, 56, (x, w, h) => {
      x.clearRect(0, 0, w, h);
      if (kind === 'train') {
        x.fillStyle = night ? '#2e3450' : '#4a5570';
        x.fillRect(2, 14, w - 4, 30);
        x.fillStyle = night ? '#1d2236' : '#39425a';
        x.fillRect(2, 38, w - 4, 8);
        for (let i = 8; i < w - 10; i += 18) { x.fillStyle = night ? '#ffd98a' : '#cfe0f2'; x.fillRect(i, 20, 11, 10); }
        x.fillStyle = '#20242f';
        for (const cx of [16, 40, 74, 104]) { x.beginPath(); x.arc(cx, 48, 5, 0, 7); x.fill(); }
      } else {
        // a shirt on the neighbour's line, pegged and swinging a little
        x.fillStyle = night ? '#6d7482' : '#f2ede0';
        x.beginPath();
        x.moveTo(30, 12); x.lineTo(44, 6); x.lineTo(84, 6); x.lineTo(98, 12);
        x.lineTo(90, 24); x.lineTo(84, 20); x.lineTo(84, 50); x.lineTo(44, 50); x.lineTo(44, 20); x.lineTo(38, 24);
        x.closePath(); x.fill();
        x.strokeStyle = night ? '#4a505c' : '#d6cdb8'; x.lineWidth = 2; x.stroke();
        x.fillStyle = night ? '#3a3f48' : '#c9a86e';
        x.fillRect(50, 2, 5, 9); x.fillRect(74, 2, 5, 9);
      }
    });
    return moverTex[key];
  }
  // CURTAINS (DESIGN-T2 3.1): data driven, and they sway. The boot pair is the stripe the window always had.
  const curtainMat = new THREE.MeshStandardMaterial({ map: TX.stripeTexture('#d9a47a', '#f2dcc2'), roughness: 0.95, side: THREE.DoubleSide });
  const curtains = [];
  // WHERE THEY HANG (23 Sep, from the first pictures and `dev/gate-room.mjs`'s layout check). They used to hang
  // at the wall's depth, from above the window to below the sill, and they passed through the sill, the radio
  // shelf and its plant, the finds ledge's jar and one of the little wall shelves, and hid the cork strip. Now
  // they hang IN FRONT of the sill from a rod in front of them, the hem clears the sill, and each one covers
  // the frame's side post and not the wall beside it. The pivot is the TOP, so a sway leans from the rod and
  // swings the hem, the way cloth does.
  const curTop = winY + winH / 2 + 0.08, curBottom = winY - winH / 2 + 0.04, curW = 0.18;
  for (const s of [-1, 1]) {
    const cg = new THREE.PlaneGeometry(curW, curTop - curBottom, 6, 4);
    cg.translate(0, -(curTop - curBottom) / 2, 0);
    const p = cg.attributes.position;
    for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 60) * 0.012);
    cg.computeVertexNormals();
    const c = shadowed(new THREE.Mesh(cg, curtainMat));
    c.position.set(winX + s * (winW / 2 + 0.03), curTop, T.back + 0.12);
    c.userData.side = s;
    g.add(c);
    curtains.push(c);
  }
  // one texture for both, swapped when she buys a pair; the boot map is kept so owning nothing looks unchanged
  function setCurtains(look) {
    const boot = curtainMat.userData.bootMap || (curtainMat.userData.bootMap = curtainMat.map);
    const old = curtainMat.map;
    const next = look ? TX.curtainTexture({ a: look.a, b: look.b, kind: look.kind }) : boot;
    curtainMat.map = next;
    curtainMat.needsUpdate = true;
    if (old && old !== next && old !== boot) old.dispose();
  }
  // the rod is as wide as the two curtains and a finger past them, and in front of them
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, winW + 0.06 + curW + 0.06, 8), brass);
  rod.rotation.z = Math.PI / 2; rod.position.set(winX, curTop + 0.012, T.back + 0.135);
  rod.name = 'curtainRod';
  g.add(rod);

  // ---------- radio on the shelf ----------
  const radio = new THREE.Group();
  radio.position.set(-0.2, 0.96, T.back + 0.08);
  g.add(radio);
  const rBody = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.2, 0.12, 0.08, 3, 0.03), new THREE.MeshStandardMaterial({ color: 0xc0714a, roughness: 0.45 })));
  radio.add(rBody);
  const grille = new THREE.Mesh(new THREE.CircleGeometry(0.035, 24), new THREE.MeshStandardMaterial({ color: 0xf1e1c5, roughness: 0.9, map: TX.slotTexture(false, true) }));
  grille.position.set(-0.05, 0, 0.041);
  radio.add(grille);
  const dialMat = new THREE.MeshStandardMaterial({ color: 0xfff2d4, emissive: 0xffc56b, emissiveIntensity: 0.0, roughness: 0.4 });
  const dial = new THREE.Mesh(new THREE.PlaneGeometry(0.07, 0.03), dialMat);
  dial.position.set(0.05, 0.02, 0.041);
  radio.add(dial);
  const knobR = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.01, 16), brass);
  knobR.rotation.x = Math.PI / 2; knobR.position.set(0.05, -0.025, 0.045);
  radio.add(knobR);
  const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.002, 0.002, 0.16, 6), brass);
  antenna.position.set(0.07, 0.12, -0.01); antenna.rotation.z = -0.5;
  radio.add(antenna);

  // ---------- a pendant lamp over the table (only drawn in the room view; it would hang in the table camera) ----------
  const pendant = new THREE.Group();
  pendant.position.set(0.02, 0, T.back + 0.62);
  g.add(pendant);
  const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 0.40, 6), new THREE.MeshStandardMaterial({ color: 0x3a3028 }));
  cord.position.y = 2.2 - 0.20;
  pendant.add(cord);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.2, 0.17, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0xe3a35a, emissive: 0xffc27a, emissiveIntensity: 0.25, roughness: 0.6, side: THREE.DoubleSide }));
  shade.position.y = 1.72;
  pendant.add(shade);
  // the bulb inside it, so the pendant can actually light the room after eight (DESIGN-T2 7.3)
  const pendantLight = new THREE.PointLight(0xffc27a, 0.25, 2.8, 1.6);
  pendantLight.position.y = 1.64;
  pendant.add(pendantLight);
  R.pendantLight = pendantLight;
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 12), new THREE.MeshStandardMaterial({ color: 0xfff1d0, emissive: 0xffd9a0, emissiveIntensity: 2.2 }));
  bulb.position.y = 1.65;
  pendant.add(bulb);
  // braided rug under the table, and a basket of clean towels by the door
  const rug = new THREE.Mesh(new THREE.CircleGeometry(1, 56), new THREE.MeshStandardMaterial({ map: TX.rugTexture({ colors: ['#c9a27e', '#efe0c8'] }), roughness: 1 }));
  rug.rotation.x = -Math.PI / 2; rug.scale.set(1.05, 0.72, 1);
  rug.position.set(0, FLOOR + 0.003, -0.15);
  rug.receiveShadow = true;
  rug.name = 'baseRug';
  g.add(rug);
  const towels = new THREE.Group();
  towels.position.set(-0.62, FLOOR, T.back + 0.55);
  g.add(towels);
  const tb = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.26, 24, 1, true), new THREE.MeshStandardMaterial({ map: R.wicker ? R.wicker.map : null, color: R.wicker ? 0xffffff : 0xc89a5c, roughness: 0.85, side: THREE.DoubleSide })));
  tb.position.y = 0.13;
  towels.add(tb);
  ['#e8a598', '#9fc0a0', '#f2d58e'].forEach((c, i) => {
    const t = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.26, 0.05, 0.18, 2, 0.02), new THREE.MeshStandardMaterial({ color: c, roughness: 1, normalMap: R.knit, normalScale: new THREE.Vector2(0.4, 0.4) })));
    t.position.set((i - 1) * 0.02, 0.24 + i * 0.045, (i % 2) * 0.02);
    t.rotation.y = (i - 1) * 0.3;
    towels.add(t);
  });
  R.lamp.position.set(0.02, 1.38, T.back + 0.62);

  // ---------- the clothesline ----------
  const lineY = 1.56, lineZ = T.back + 0.34, lineX0 = -1.55, lineX1 = 1.55;
  const sag = (x) => lineY - 0.08 * (1 - Math.pow((x - (lineX0 + lineX1) / 2) / ((lineX1 - lineX0) / 2), 2));
  const curve = new THREE.CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => { const x = lineX0 + (i / 11) * (lineX1 - lineX0); return new THREE.Vector3(x, sag(x), lineZ); }));
  const rope = new THREE.Mesh(new THREE.TubeGeometry(curve, 60, 0.0065, 6), new THREE.MeshStandardMaterial({ color: 0xa8865f, roughness: 0.9 }));
  g.add(rope);
  for (const x of [lineX0, lineX1]) { const hk = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 8), brass); hk.position.set(x, lineY, lineZ); g.add(hk); }
  const pegGroup = new THREE.Group();
  g.add(pegGroup);

  // ---------- THE FINDS LEDGE (DESIGN-T2 2.3) ----------
  // A narrow wooden ledge under the window that arrives WITH the first find. On it a glass jar, a button
  // dish and an enamel tray; a small cork strip beside it. Nothing is sold here and nothing is equipped: it
  // is where the things she has found live, and it is empty until she has found one.
  const ledgeY = winY - winH / 2 - 0.18, ledgeZ = T.back + 0.1;
  const CORK = { x: winX - 0.54, y: ledgeY + 0.11 };
  const ledge = new THREE.Group();
  ledge.name = 'findsLedge';
  ledge.visible = false;
  g.add(ledge);
  {
    const plank = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.78, 0.035, 0.15, 2, 0.008), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6 })));
    plank.position.set(winX, ledgeY, ledgeZ);
    ledge.add(plank);
    for (const sx of [-1, 1]) {
      // a bracket under each end, so the ledge is held up and not stuck to the wall
      const br = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.09, 0.09), new THREE.MeshStandardMaterial({ color: 0x8b7a63, roughness: 0.7 }));
      br.position.set(winX + sx * 0.3, ledgeY - 0.06, ledgeZ - 0.02);
      ledge.add(br);
    }
    // the cork strip, on the wall beside the ledge: its LEFT, in the column between the dryer and the window's
    // curtain. On the right (winX + 0.48, where it was until 23 Sep) the curtain hung in front of it.
    const cork = new THREE.Mesh(new THREE.PlaneGeometry(0.13, 0.18), new THREE.MeshStandardMaterial({ color: 0xc09a63, roughness: 0.95, map: TX.slotTexture ? TX.slotTexture(false, true) : null }));
    cork.position.set(CORK.x, CORK.y, T.back + 0.012);
    cork.name = 'corkStrip';
    ledge.add(cork);
    const corkFrame = new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.2, 0.012, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0x8a6c47, roughness: 0.7 }));
    corkFrame.position.set(CORK.x, CORK.y, T.back + 0.006);
    corkFrame.name = 'corkFrame';
    ledge.add(corkFrame);
  }
  // the three containers, left to right, and the cork strip fourth. `fill` is how full each one looks.
  const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xdfeee8, roughness: 0.1, transparent: true, opacity: 0.4, clearcoat: 1 });
  const containers = {};
  {
    const top = ledgeY + 0.018;
    const jar = new THREE.Group(); jar.position.set(winX - 0.26, top, ledgeZ);
    jar.add(new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.036, 0.1, 18), glassMat));
    { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.037, 0.037, 0.008, 18), new THREE.MeshStandardMaterial({ color: 0xcbb079, roughness: 0.35, metalness: 0.8 })); m.position.y = 0.046; jar.add(m); }
    jar.children[0].position.y = 0.05;
    ledge.add(jar); containers.jar = jar;
    const dish = new THREE.Group(); dish.position.set(winX - 0.06, top, ledgeZ);
    dish.add(new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.04, 0.022, 20), new THREE.MeshStandardMaterial({ color: 0xf1e6d2, roughness: 0.4 })));
    dish.children[0].position.y = 0.011;
    ledge.add(dish); containers.dish = dish;
    const tray = new THREE.Group(); tray.position.set(winX + 0.17, top, ledgeZ);
    tray.add(new THREE.Mesh(new RoundedBoxGeometry(0.15, 0.016, 0.085, 2, 0.006), new THREE.MeshStandardMaterial({ color: 0xdfe6e2, roughness: 0.35 })));
    tray.children[0].position.y = 0.008;
    ledge.add(tray); containers.tray = tray;
    const strip = new THREE.Group(); strip.position.set(CORK.x, CORK.y, T.back + 0.02);
    ledge.add(strip); containers.cork = strip;
  }
  const fillGroup = new THREE.Group();
  ledge.add(fillGroup);
  // the label a finished set gets: a small card on the ledge front, hand written
  const shadowBox = new THREE.Group();
  ledge.add(shadowBox);

  // ---------- decor slots ----------
  const decor = new THREE.Group();
  decor.name = 'decorGroup';
  g.add(decor);

  const anchors = {
    dryer: corners(DRYER.x - 0.34, -0.04, T.back, DRYER.x + 0.34, 0.68, T.back),
    drawer: corners(dresserX - dW / 2, FLOOR + 0.05, dresserZ + dD / 2, dresserX + dW / 2, FLOOR + dH, dresserZ + dD / 2),
    bin: corners(ODDBIN.x - ODDBIN.halfW, 0, ODDBIN.z + ODDBIN.halfD, ODDBIN.x + ODDBIN.halfW, ODDBIN.height + 0.04, ODDBIN.z + ODDBIN.halfD),
    radio: corners(-0.3, 0.9, T.back + 0.12, -0.1, 1.04, T.back + 0.12),
    door: corners(doorX - 0.43, FLOOR + 0.3, T.back + 0.05, doorX + 0.43, FLOOR + 1.9, T.back + 0.05),
    line: corners(-1.3, lineY - 0.25, lineZ, -0.25, lineY + 0.02, lineZ),
    ledge: corners(winX - 0.39, ledgeY - 0.03, ledgeZ + 0.08, winX + 0.39, ledgeY + 0.16, ledgeZ + 0.08),
  };

  const state = { lastKey: '', t: 0, cat: null };

  // What each container is holding, as little objects with the colour of what is in them. The room shows the
  // containers FILLING (a count and colour flecks): the finds themselves are read in the Drawer's Pockets
  // page, because at the settled room pose this whole ledge is about 90 px wide.
  function fillLedge(save, appRef) {
    const F = (appRef.data && appRef.data.finds) || null;
    const have = (save.finds || []);
    ledge.visible = have.length > 0;
    while (fillGroup.children.length) { const c = fillGroup.children[0]; fillGroup.remove(c); disposeTree(c, new Set([wood, brass])); }
    while (shadowBox.children.length) { const c = shadowBox.children[0]; shadowBox.remove(c); disposeTree(c, new Set([wood, brass])); }
    if (!F || !have.length) return;
    const done = new Set(save.sets || []);
    const held = new Set(have);
    const fleck = (id) => { const f = (F.items || []).find((x) => x.id === id); return f ? new THREE.Color(findFleck(f.recipe)) : new THREE.Color(0xbbb2a2); };
    // A FINISHED SET IS REARRANGED (DESIGN-T2 2.4): its things come out of the mixed containers and are set
    // out together in a small shadow box on the ledge, with a hand written label. Everything else stays loose
    // in the jar, the dish, the tray and on the cork.
    const per = { jar: 0, dish: 0, tray: 0, cork: 0 };
    for (const id of have) {
      const f = (F.items || []).find((x) => x.id === id);
      if (!f || done.has(f.set)) continue;
      const which = containerOf(F, id);
      const box = containers[which];
      if (!box) continue;
      const n = per[which]++;
      // eight things at most in any one container: past that it is a heap and nothing reads at this size
      if (n >= 8) continue;
      const m = new THREE.Mesh(new THREE.SphereGeometry(0.0095, 8, 6), new THREE.MeshStandardMaterial({ color: fleck(id), roughness: 0.55 }));
      m.scale.set(1, 0.72, 1);
      const a = n * 2.4, r = which === 'cork' ? 0.05 : 0.021;
      // the contents live in fillGroup, in the container's own place, so one clear takes every one of them
      if (which === 'cork') m.position.set(box.position.x + Math.cos(a) * r, box.position.y + Math.sin(a) * r, box.position.z + 0.007);
      else m.position.set(box.position.x + Math.cos(a) * r, box.position.y + 0.014 + Math.floor(n / 4) * 0.017, box.position.z + Math.sin(a) * r * 0.6);
      fillGroup.add(m);
    }
    const boxes = (F.sets || []).filter((st) => done.has(st.id));
    const BW = 0.125, BH = 0.075;
    boxes.slice(0, 5).forEach((st, i) => {
      const bx = winX - 0.33 + i * (BW + 0.015) + BW / 2;
      const by = ledgeY + 0.022 + BH / 2;
      const bz = ledgeZ - 0.055;
      const frame = new THREE.Mesh(new RoundedBoxGeometry(BW, BH, 0.012, 2, 0.004), new THREE.MeshStandardMaterial({ color: 0x8a6c47, roughness: 0.6 }));
      frame.position.set(bx, by, bz);
      shadowBox.add(frame);
      const back = new THREE.Mesh(new THREE.PlaneGeometry(BW - 0.014, BH - 0.014), new THREE.MeshStandardMaterial({ color: 0xf3ead6, roughness: 0.9 }));
      back.position.set(bx, by, bz + 0.0075);
      shadowBox.add(back);
      // its six things, in two neat rows, in the order the catalogue lists them
      const mine = (F.items || []).filter((f) => f.set === st.id && held.has(f.id));
      mine.slice(0, 6).forEach((f, k) => {
        const cx = bx - 0.033 + (k % 3) * 0.033;
        const cy = by + 0.014 - Math.floor(k / 3) * 0.028;
        const m = new THREE.Mesh(new THREE.CircleGeometry(0.0105, 12), new THREE.MeshStandardMaterial({ color: fleck(f.id), roughness: 0.5 }));
        m.position.set(cx, cy, bz + 0.009);
        shadowBox.add(m);
      });
      // the hand written label, under the box on the ledge front
      const card = new THREE.Mesh(new THREE.PlaneGeometry(BW + 0.01, 0.026), new THREE.MeshStandardMaterial({ map: labelTexture(st.label || st.name), roughness: 0.9, transparent: true }));
      card.position.set(bx, ledgeY - 0.008, ledgeZ + 0.077);
      shadowBox.add(card);
    });
  }

  function update(save, appRef) {
    // the room's ONE clock (config.js): the hour the lamp was given, or the wall clock before it has one.
    // ⛔ It is IN the key: until 23 Sep it was not, so a room told "half past nine" kept its daytime window
    // until something she owned changed.
    const now = new Date();
    const hour = R._hour !== undefined ? R._hour : now.getHours() + now.getMinutes() / 60;
    const night = isNightHour(hour);
    const key = JSON.stringify([save.clothesline, save.equipped, save.unlocks.length, save.drawer.length, save.economy.reunions, (save.finds || []).length, (save.sets || []).length, (save.dailyDays || []).length, new Date().getDate(), night]);
    if (key === state.lastKey) return;
    state.lastKey = key;
    // pegs along the line: one per Clothesline peg; earned ones hold a little sock from the Drawer
    const keep = new Set([wood, brass, R.knit]);
    const clear = (grp) => { while (grp.children.length) { const c = grp.children[0]; grp.remove(c); disposeTree(c, keep); } };
    clear(pegGroup);
    const pegs = (appRef.data.clothesline && appRef.data.clothesline.pegs) || [];
    const got = new Set(save.clothesline);
    const drawer = save.drawer.filter((d) => !d.odd);
    const pegMat = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6 });
    const pegDim = new THREE.MeshStandardMaterial({ color: 0xdcc7a4, roughness: 0.7 });
    pegs.forEach((p, i) => {
      const x = lineX0 + 0.12 + (i / Math.max(1, pegs.length - 1)) * (lineX1 - lineX0 - 0.24);
      const y = sag(x);
      const have = got.has(p.id);
      const pg = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.06, 0.018), have ? pegMat : pegDim);
      pg.position.set(x, y - 0.012, lineZ);
      pegGroup.add(pg);
      if (have && p.comfort !== 'blank') {
        const d = drawer.length ? drawer[i % drawer.length] : null;
        const seed = d ? (d.heroId ? 'hero:' + d.heroId : d.sockSeed) : null;
        const mesh = hangingSock(seed, appRef, p.rush);
        mesh.position.set(x, y - 0.04, lineZ);
        mesh.userData.swing = i * 0.7;
        pegGroup.add(mesh);
      }
    });
    // decor from the unlock catalogue
    clear(decor);
    const placed = (save.equipped.decor || []).map((id) => appRef.item(id)).filter(Boolean);
    const view = placed.find((it) => it.look && it.look.slot === 'window');
    R.windowNight = night;
    const vKey = (view ? view.look.variant : 'woods') + (night ? '-night' : '');
    if (!views[vKey]) views[vKey] = windowView(view ? view.look.variant : 'woods', night);
    viewPlane.material.map = views[vKey];
    viewPlane.material.needsUpdate = true;
    // the mover, for the two views that move
    const vv = view ? view.look.variant : 'woods';
    const mk = WINDOW_MOVERS[vv];
    mover.visible = !!mk;
    if (mk) {
      moverMesh.material.map = moverTexture(mk, night);
      moverMesh.material.needsUpdate = true;
      moverMesh.scale.set(mk === 'train' ? 1 : 0.42, mk === 'train' ? 1 : 0.62, 1);
      mover.userData.kind = mk;
      mover.userData.span = winW;
    } else {
      // ⛔ clear it: a stale kind left on a hidden mover reads as "the train is still there" to anything
      // that goes looking, which is exactly what a gate did.
      mover.userData.kind = null;
    }
    winLight.color.set(night ? 0x8fa5d8 : 0xdfe9ff);
    winLight.intensity = night ? 0.25 : 0.55;
    state.cat = null;
    const slotCount = {};
    for (const it of placed) {
      const L = it.look || {};
      const n = (slotCount[L.slot] = (slotCount[L.slot] || 0) + 1) - 1;
      const m = decorMesh(L, n, it, appRef, save);
      if (m) { if (!m.name) m.name = it.id; decor.add(m); if (L.slot === 'cat') state.cat = m; }
    }
    // A rug she put down REPLACES the braided one the room came with. ⛔ Until 23 Sep it was laid on top, and
    // the braid showed round a round rug and all along a runner, two rugs in one spot.
    rug.visible = !slotCount.rug;
    // Reunion gifts from the Odd Bin appear on their own once earned (DESIGN 9.6)
    for (const id of save.unlocks) {
      const it = appRef.item(id);
      const kind = it && it.cat === 'reunion' && it.look && it.look.kind;
      if (kind === 'oddEye' || kind === 'frame' || kind === 'portal') { const m = giftMesh(it.look); if (m) { m.name = it.id; decor.add(m); } }
    }
    // the dryer model
    const dryer = appRef.equippedItem('dryer');
    R.setDryerLook && R.setDryerLook(dryer && dryer.look);
    const radioItem = appRef.equippedItem('radio');
    dialMat.emissiveIntensity = radioItem ? 1.4 : 0;
    // THE FOUR SURFACES (DESIGN-T2 3.1). Each is a single slot in `save.equipped`, not a decor list entry.
    const surf = (k) => { const it = appRef.item(save.equipped[k]); return it && it.look ? it.look : null; };
    R.setWallpaper && R.setWallpaper(surf('wallpaper'));
    R.setFloor && R.setFloor(surf('floor'));
    R.setTabletop && R.setTabletop(surf('tabletop'));
    setCurtains(surf('curtains'));
    fillLedge(save, appRef);
  }

  function frame(dt, on) {
    state.t += dt;
    pendant.visible = R.view === 'room' && !R.camAnim;
    // the curtains breathe: a slow lean from the hem, about eight seconds a cycle. Nothing else in the room
    // moves this slowly, and reduceMotion stops it dead (DESIGN-T2 3.1).
    if (!(app.game && app.game.settings && app.game.settings.reduceMotion)) {
      for (const c of curtains) {
        const ph = c.userData.side > 0 ? 1.7 : 0;
        c.rotation.z = c.userData.side * (0.018 + Math.sin(state.t * 0.78 + ph) * 0.022);
      }
    } else for (const c of curtains) c.rotation.z = 0;
    // the train crosses the window about every twelve seconds; the neighbour's shirt just swings on its line.
    // reduceMotion parks both: a thing moving behind glass is still a thing moving.
    if (mover.visible) {
      const calm = !!(app.game && app.game.settings && app.game.settings.reduceMotion);
      const span = mover.userData.span || 0.66;
      if (mover.userData.kind === 'train') {
        const T2 = 12, u = calm ? 0.5 : ((state.t % T2) / T2);
        mover.position.x = winX - span * 0.62 + u * span * 1.24;
        mover.position.y = winY - 0.09;
        mover.visible = calm ? false : true;
      } else {
        mover.position.x = winX + span * 0.18;
        mover.position.y = winY + 0.02;
        mover.rotation.z = calm ? 0 : Math.sin(state.t * 0.9) * 0.08;
      }
    }
    for (const m of pegGroup.children) if (m.userData.swing !== undefined) m.rotation.z = Math.sin(state.t * 1.1 + m.userData.swing) * 0.05;
    if (state.cat) { const b = state.cat.userData.body; if (b) b.scale.y = 0.62 + Math.sin(state.t * 1.6) * 0.03; }
    dialMat.emissiveIntensity = dialMat.emissiveIntensity > 0 ? 1.2 + Math.sin(state.t * 3) * 0.2 : 0;
    void on;
  }

  // ---------- builders ----------
  function hangingSock(seed, appRef, rush) {
    const grp = new THREE.Group();
    let mat;
    if (seed) {
      try {
        const sp = decode(seed);
        const tile = appRef.thumbTile(seed);
        const heroDef = sp.hero ? appRef.heroById(sp.hero) : null;
        const sil = heroDef ? Math.max(0, ['ankle', 'crew', 'knee', 'toe', 'baby', 'slipper', 'dress', 'novelty'].indexOf(heroDef.silhouette)) : sp.silhouette;
        const f = renderFlat(tile, 96, sil, { w: 64, h: 80, pad: 0.04 });
        const tex = smoothData(new THREE.DataTexture(f.rgba, f.w, f.h, THREE.RGBAFormat));
        mat = new THREE.MeshStandardMaterial({ map: tex, transparent: true, alphaTest: 0.5, roughness: 0.9, side: THREE.DoubleSide });
      } catch (e) { mat = null; }
    }
    if (!mat) mat = new THREE.MeshStandardMaterial({ color: rush ? 0xe6a36c : 0x8fa58a, roughness: 0.9, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.125), mat);
    plane.position.y = -0.06;
    plane.castShadow = true;
    grp.add(plane);
    return grp;
  }

  function giftMesh(L) {
    const grp = new THREE.Group();
    const top = FLOOR + 1.04;
    if (L.kind === 'oddEye') {
      // two mismatched shades on one brass stem, at the end of the dresser
      const x = 1.0, z = T.back + 0.4;   // front of the dresser top, clear of the lamps and the cat (23 Sep)
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.16, 8), brass);
      stem.position.set(x, top + 0.08, z);
      const foot = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.015, 18), brass));
      foot.position.set(x, top + 0.008, z);
      grp.add(stem, foot);
      [[-1, 0xe8a598], [1, 0x8fb8c9]].forEach(([s, c]) => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.05, 6), brass);
        arm.rotation.z = Math.PI / 2; arm.position.set(x + s * 0.025, top + 0.15, z);
        const shade = shadowed(new THREE.Mesh(new THREE.ConeGeometry(s < 0 ? 0.034 : 0.028, s < 0 ? 0.045 : 0.055, 16, 1, true), new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: 0.45, roughness: 0.6, side: THREE.DoubleSide })));
        shade.position.set(x + s * 0.05, top + 0.135, z);
        grp.add(arm, shade);
        const pl = new THREE.PointLight(c, 0.25, 0.6);
        pl.position.set(x + s * 0.05, top + 0.1, z + 0.03);
        grp.add(pl);
      });
      return grp;
    }
    if (L.kind === 'frame') {
      // "Something for the Wall": a lint frame around the whole Bin, waving
      const x = 0.3, y = 1.86, z = T.back + 0.015;   // above the clothesline: at 1.66 it hung off the phone (23 Sep)
      const fr = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.3, 0.24, 0.025, 2, 0.01), new THREE.MeshStandardMaterial({ color: 0xcfc6b8, roughness: 1, normalMap: R.knit })));
      fr.position.set(x, y, z);
      const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.19), new THREE.MeshStandardMaterial({ map: binPortrait(), roughness: 0.9 }));
      pic.position.set(x, y, z + 0.014);
      const lace = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.003, 6, 20, Math.PI), new THREE.MeshStandardMaterial({ color: 0xf3e6cc }));
      lace.position.set(x, y + 0.12, z + 0.005);
      grp.add(fr, pic, lace);
      return grp;
    }
    if (L.kind === 'portal') {
      if (L.ref === 'portal-glow-lint') {
        const x = 1.2, z = T.back + 0.42;   // in front of the cat, out of the plant (23 Sep)
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.02, 12, 8), new THREE.MeshStandardMaterial({ color: 0x9fd4ff, emissive: 0x6fb6ff, emissiveIntensity: 1.2, roughness: 1, normalMap: R.knit }));
        puff.scale.set(1.3, 0.6, 1); puff.position.set(x, top + 0.012, z);
        const pl = new THREE.PointLight(0x6fb6ff, 0.3, 0.5);
        pl.position.set(x, top + 0.06, z);
        grp.add(puff, pl);
        return grp;
      }
      if (L.ref === 'portal-postcard') {
        const card = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.1), new THREE.MeshStandardMaterial({ map: postcardTexture(), roughness: 0.9 })));
        card.position.set(-0.98, 0.95, T.back + 0.062);   // tucked on the door: at -1.72 it was off the phone (23 Sep)
        card.rotation.z = 0.06;
        grp.add(card);
        return grp;
      }
      if (L.ref === 'portal-welcome-mat') {
        const mat = new THREE.Mesh(new RoundedBoxGeometry(0.22, 0.006, 0.12, 2, 0.003), new THREE.MeshStandardMaterial({ map: TX.rugTexture({ colors: ['#8fb8c9', '#e6ecef'] }), roughness: 1 }));
        mat.position.set(-1.12, FLOOR + 0.004, T.back + 0.2);   // at the door, where a welcome mat goes
        mat.receiveShadow = true;
        grp.add(mat);
        return grp;
      }
    }
    return null;
  }

  function decorMesh(L, n, it, appRef, save) {
    const c1 = new THREE.Color(L.color || '#d08a5c'), c2 = new THREE.Color(L.color2 || L.color || '#f2d58e');
    const grp = new THREE.Group();
    switch (L.slot) {
      case 'rug': {
        if (n > 0) return null;
        // DESIGN-T2 3.2: the MESH follows the shape. A rug with no `shape` is the oval the six original rugs
        // have always been, so nothing anybody already owns moves.
        const sh = TX.RUG_SHAPE[L.shape] || TX.RUG_SHAPE.oval;
        const geo = sh.disc ? new THREE.CircleGeometry(1, 48) : new THREE.PlaneGeometry(2, 2, 1, 1);
        const map = TX.rugTexture({
          shape: L.shape || 'oval',
          pattern: L.pattern || 'braid',
          colors: L.colors || [L.color || '#b8876a', L.color2 || '#efe0c8'],
          wear: L.wear === undefined ? 0.2 : L.wear,
        });
        const rug = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map, roughness: 1 }));
        rug.rotation.x = -Math.PI / 2;
        rug.scale.set(sh.scale[0], sh.scale[1], 1);
        rug.position.set(0, FLOOR + 0.004, 0.1);
        rug.receiveShadow = true;
        rug.userData.rug = L.shape || 'oval';
        grp.add(rug);
        return grp;
      }
      case 'frame': {
        // the third and fourth used to hang at 0.52 and 0.66, behind the window's left curtain (23 Sep): they
        // are one above the other now, in the narrow column between the radio shelf's plant and that curtain
        const spots = [[-0.62, 1.12], [-0.46, 1.2], [0.43, 1.16], [0.43, 1.34]];
        const [x, y] = spots[n % spots.length];
        const fr = shadowed(new THREE.Mesh(new RoundedBoxGeometry(0.13, 0.16, 0.02, 2, 0.004), new THREE.MeshStandardMaterial({ color: c1, roughness: 0.5 })));
        fr.position.set(x, y, T.back + 0.015);
        grp.add(fr);
        let inner;
        const hero = L.variant === 'hero' ? save.drawer.filter((d) => d.heroId)[n] : null;
        const seed = hero ? 'hero:' + hero.heroId : (save.drawer[n] && save.drawer[n].sockSeed) || null;
        if (seed) {
          const sp = decode(seed);
          const heroDef = sp.hero ? appRef.heroById(sp.hero) : null;
          const sil = heroDef ? Math.max(0, ['ankle', 'crew', 'knee', 'toe', 'baby', 'slipper', 'dress', 'novelty'].indexOf(heroDef.silhouette)) : sp.silhouette;
          const f = renderFlat(appRef.thumbTile(seed), 96, sil, { w: 64, h: 80, bg: [246, 237, 220, 255] });
          const tex = smoothData(new THREE.DataTexture(f.rgba, f.w, f.h, THREE.RGBAFormat));
          inner = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8 });
        } else inner = new THREE.MeshStandardMaterial({ color: c2, roughness: 0.8 });
        const pic = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 0.125), inner);
        pic.position.set(x, y, T.back + 0.026);
        grp.add(pic);
        return grp;
      }
      case 'plant': {
        // the two big floor plants stood at 1.5 and -1.62, both partly off a portrait phone (23 Sep): one is by
        // the door's hinge now, the other behind the towel basket. The small one on the dresser moved to the
        // front left corner, out from under the lamps and the cat.
        const spots = [[-1.42, FLOOR, T.back + 0.45], [-0.62, FLOOR, T.back + 0.2], [0.8, FLOOR + 1.03, T.back + 0.4], [-0.55, 0.9, T.back + 0.08]];
        const [x, y, z] = spots[n % spots.length];
        const big = y === FLOOR;
        const pot = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(big ? 0.13 : 0.05, big ? 0.1 : 0.04, big ? 0.24 : 0.07, 20), new THREE.MeshStandardMaterial({ color: c2, roughness: 0.8 })));
        pot.position.set(x, y + (big ? 0.12 : 0.035), z);
        grp.add(pot);
        const leafMat = new THREE.MeshStandardMaterial({ color: c1.getHex() === 0xd08a5c ? 0x5f8a4e : c1, roughness: 0.7, side: THREE.DoubleSide });
        const count = big ? 14 : 7;
        for (let i = 0; i < count; i++) {
          const a = (i / count) * Math.PI * 2;
          const leaf = shadowed(new THREE.Mesh(new THREE.SphereGeometry(big ? 0.09 : 0.035, 10, 6), leafMat));
          leaf.scale.set(0.35, 0.12, 1.3);
          const h = big ? 0.3 + (i % 4) * 0.08 : 0.08 + (i % 3) * 0.02;
          leaf.position.set(x + Math.cos(a) * (big ? 0.12 : 0.04), y + h, z + Math.sin(a) * (big ? 0.12 : 0.04));
          leaf.rotation.set(0.7 * Math.cos(a), -a, 0.7 * Math.sin(a));
          grp.add(leaf);
        }
        return grp;
      }
      case 'lamp': {
        // a lava lamp on the dresser
        // a row at the back of the dresser top, left of the cat (they stood in it, and in the plant, until 23 Sep)
        const x = 0.76 + n * 0.1, y = FLOOR + 1.04, z = T.back + 0.25;
        const baseM = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.045, 0.06, 16), new THREE.MeshStandardMaterial({ color: 0x8a8f96, metalness: 0.9, roughness: 0.3 }));
        baseM.position.set(x, y + 0.03, z);
        const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.035, 0.16, 16), new THREE.MeshStandardMaterial({ color: c1, emissive: c1, emissiveIntensity: 0.6, transparent: true, opacity: 0.85, roughness: 0.2 }));
        glass.position.set(x, y + 0.14, z);
        const blob = new THREE.Mesh(new THREE.SphereGeometry(0.014, 10, 8), new THREE.MeshStandardMaterial({ color: c2, emissive: c2, emissiveIntensity: 1 }));
        blob.position.set(x, y + 0.14, z);
        grp.add(baseM, glass, blob);
        const pl = new THREE.PointLight(c1, 0.35, 0.8);
        pl.position.set(x, y + 0.15, z + 0.05);
        grp.add(pl);
        return grp;
      }
      case 'calendar': {
        const cal = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.16, 0.2), new THREE.MeshStandardMaterial({ map: calendarTexture(save), roughness: 0.9 })));
        cal.position.set(-0.57, 0.17, T.back + 0.004);   // under the first poster, not behind it (23 Sep)
        grp.add(cal);
        return grp;
      }
      case 'shelf': {
        // stacked above the radio shelf, between its things and the clothesline. At x 0.62 under the window
        // they crossed the finds ledge (phase 2) and the top one stood behind the curtain (23 Sep); nearer the
        // dryer they stood on its face.
        const y = 1.14 + n * 0.14, x = 0.15;
        grp.add(box(0.36, 0.02, 0.1, new THREE.MeshStandardMaterial({ map: wood, roughness: 0.6 }), x, y, T.back + 0.05, 0.004));
        const rare = save.drawer.filter((d) => d.heroId).slice(n * 3, n * 3 + 3);
        rare.forEach((d, k) => {
          const hero = appRef.heroById(d.heroId);
          const b = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.03, 14, 10), new THREE.MeshStandardMaterial({ color: hero && hero.recipe ? hero.recipe.colors.body : '#c9a88a', roughness: 0.85, normalMap: R.knit })));
          b.scale.set(1, 0.85, 1);
          b.position.set(x - 0.11 + k * 0.11, y + 0.035, T.back + 0.05);
          grp.add(b);
        });
        return grp;
      }
      case 'cat': {
        // a cat asleep on warm laundry, on top of the dresser
        const x = 1.2, y = FLOOR + 1.04, z = T.back + 0.22;
        const pile = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 10), new THREE.MeshStandardMaterial({ color: 0xe8dccb, roughness: 1, normalMap: R.knit })));
        pile.scale.set(1.1, 0.35, 0.9); pile.position.set(x, y + 0.03, z);
        const fur = new THREE.MeshStandardMaterial({ color: c1.getHex() === 0xd08a5c ? 0xe39a55 : c1, roughness: 0.95 });
        const body = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.09, 20, 14), fur));
        body.scale.set(1.25, 0.62, 1); body.position.set(x, y + 0.1, z);
        const head = shadowed(new THREE.Mesh(new THREE.SphereGeometry(0.048, 16, 12), fur));
        head.position.set(x - 0.1, y + 0.1, z + 0.04);
        for (const s of [-1, 1]) {
          const ear = new THREE.Mesh(new THREE.ConeGeometry(0.018, 0.035, 8), fur);
          ear.position.set(x - 0.1 + s * 0.022, y + 0.145, z + 0.04);
          ear.rotation.z = s * -0.3;
          grp.add(ear);
        }
        const tail = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.015, 8, 20, Math.PI * 1.1), fur);
        tail.rotation.x = Math.PI / 2; tail.position.set(x + 0.02, y + 0.07, z + 0.02);
        grp.add(pile, body, head, tail);
        grp.userData.body = body;
        return grp;
      }
      case 'mug': {
        const x = 0.36 - n * 0.08, y = 0.9, z = T.back + 0.08;
        const mug = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.026, 0.06, 18), new THREE.MeshStandardMaterial({ color: c1, roughness: 0.4 })));
        mug.position.set(x, y + 0.03, z);
        const handle = new THREE.Mesh(new THREE.TorusGeometry(0.014, 0.004, 6, 12), new THREE.MeshStandardMaterial({ color: c1, roughness: 0.4 }));
        handle.position.set(x + 0.03, y + 0.03, z);
        grp.add(mug, handle);
        return grp;
      }
      case 'garland': {
        const pts = [];
        // hung from the radio shelf's front edge, end to end of the shelf and no further
        const gx0 = WALL_SHELF.x0 + 0.01, gx1 = WALL_SHELF.x1 - 0.01;
        for (let i = 0; i <= 10; i++) { const t = i / 10; pts.push(new THREE.Vector3(gx0 + t * (gx1 - gx0), WALL_SHELF.y - Math.sin(t * Math.PI) * 0.04 - 0.02, T.back + 0.165)); }
        const cv = new THREE.CatmullRomCurve3(pts);
        grp.add(new THREE.Mesh(new THREE.TubeGeometry(cv, 30, 0.003, 5), new THREE.MeshStandardMaterial({ color: 0x5f7a5a })));
        for (let i = 0; i < 9; i++) {
          const p = cv.getPoint((i + 0.5) / 9);
          const b = new THREE.Mesh(new THREE.SphereGeometry(0.012, 8, 6), new THREE.MeshStandardMaterial({ color: i % 2 ? c1 : c2, emissive: i % 2 ? c1 : c2, emissiveIntensity: 0.5 }));
          b.position.copy(p).add(new THREE.Vector3(0, -0.012, 0));
          grp.add(b);
        }
        return grp;
      }
      case 'clock': {
        const clockY = FLOOR + 2.72;   // above the clothesline
        const face = shadowed(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.03, 32), new THREE.MeshStandardMaterial({ color: c2, roughness: 0.5 })));
        face.rotation.x = Math.PI / 2;
        face.position.set(-1.2, clockY, T.back + 0.02);
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.008, 8, 32), new THREE.MeshStandardMaterial({ color: c1, roughness: 0.4 }));
        rim.position.set(-1.2, clockY, T.back + 0.035);
        const h = new Date().getHours() % 12, mm = new Date().getMinutes();
        const hand = (len, ang) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.006, len, 0.004), new THREE.MeshStandardMaterial({ color: 0x3a3028 })); m.geometry.translate(0, len / 2, 0); m.position.set(-1.2, clockY, T.back + 0.04); m.rotation.z = -ang; return m; };
        grp.add(face, rim, hand(0.05, (h + mm / 60) / 12 * Math.PI * 2), hand(0.075, mm / 60 * Math.PI * 2));
        return grp;
      }
      case 'poster': {
        // ⛔ THE ROOM IS A PORTRAIT PHONE (23 Sep). The first two spots were -1.72 and 1.62, past the door and past
        // the window, where a 412 or a 360 wide phone does not reach: the first poster she bought hung off the
        // left edge. The first is beside the dryer now, the next two in the band above the clothesline.
        const spots = [[-0.57, 0.6], [-0.78, 1.87], [-0.22, 1.87]];
        const [x, y] = spots[n % spots.length];
        const post = shadowed(new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.4), new THREE.MeshStandardMaterial({ map: posterTexture(it.name, L.color || '#5f7a5a', L.color2 || '#f6eddc'), roughness: 0.9 })));
        post.position.set(x, y, T.back + 0.003);
        grp.add(post);
        return grp;
      }
      case 'window':
      default:
        return null;
    }
  }

  return { anchors, update, frame, setCurtains, group: g };
}

// a small painted sock as a texture: filtered and mipmapped, so it does not shimmer across the room
function smoothData(tex) {
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.flipY = true;
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

// the Odd Bin's portrait of itself: a crowd of mismatched socks, stitched in lint colours
function binPortrait() {
  const c = document.createElement('canvas');
  c.width = 256; c.height = 196;
  const x = c.getContext('2d');
  x.fillStyle = '#f3ead8'; x.fillRect(0, 0, 256, 196);
  const cols = ['#d08a5c', '#8a93c6', '#e8a598', '#8fa58a', '#f2d58e', '#6f9fb3', '#b79ad0', '#c9a88a'];
  for (let i = 0; i < 11; i++) {
    const cx = 22 + (i % 6) * 42 + (i > 5 ? 20 : 0), cy = i > 5 ? 128 : 70;
    x.save();
    x.translate(cx, cy);
    x.rotate(((i * 37) % 7 - 3) * 0.08);
    x.fillStyle = cols[i % cols.length];
    x.beginPath();
    x.roundRect(-10, -34, 20, 46, 8);
    x.roundRect(-10, 2, 30, 16, 8);
    x.fill();
    x.fillStyle = 'rgba(255,255,255,.55)';
    x.fillRect(-10, -30, 20, 5);
    x.fillStyle = '#3a3028';
    x.beginPath(); x.arc(-3, -18, 2, 0, 7); x.arc(4, -18, 2, 0, 7); x.fill();
    x.restore();
  }
  x.fillStyle = '#7a6552';
  x.font = '700 18px Nunito, sans-serif';
  x.textAlign = 'center';
  x.fillText('from all of us', 128, 182);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function postcardTexture() {
  const c = document.createElement('canvas');
  c.width = 192; c.height = 128;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 192, 128);
  g.addColorStop(0, '#20304f'); g.addColorStop(1, '#4a6fa5');
  x.fillStyle = g; x.fillRect(0, 0, 192, 128);
  x.strokeStyle = 'rgba(160,210,255,.8)'; x.lineWidth = 3;
  for (let r = 10; r < 60; r += 12) { x.beginPath(); x.arc(96, 60, r, 0, Math.PI * 2); x.stroke(); }
  x.fillStyle = '#fbf5e9';
  x.font = '700 16px Nunito, sans-serif';
  x.textAlign = 'center';
  x.fillText('wish you were here', 96, 116);
  x.strokeStyle = '#fbf5e9'; x.lineWidth = 4; x.strokeRect(2, 2, 188, 124);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function corners(x0, y0, z0, x1, y1, z1) {
  const out = [];
  for (const x of [x0, x1]) for (const y of [y0, y1]) for (const z of [z0, z1]) out.push({ x, y, z });
  return out;
}

function canvasTex(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

// The views out of the window (DESIGN-T2 3.3 adds six). Every one has a night version, because the room's
// light already follows the real hour and a noon view behind a night room is the thing that breaks it.
export const WINDOW_VIEWS = ['woods', 'city', 'rain', 'snow', 'train', 'line', 'october', 'dawn', 'firefly', 'porch'];
// the two that MOVE get a little mesh slid across the glass by the room's frame loop, rather than a repaint
export const WINDOW_MOVERS = { train: 'train', line: 'shirt' };

function windowView(kind, night) {
  return canvasTex(256, 240, (x, w, h) => {
    const sky = x.createLinearGradient(0, 0, 0, h);
    if (night) { sky.addColorStop(0, '#1d2340'); sky.addColorStop(1, '#3b3f66'); }
    else if (kind === 'rain' || kind === 'october') { sky.addColorStop(0, '#9aa7b3'); sky.addColorStop(1, '#c7cfd6'); }
    else if (kind === 'snow') { sky.addColorStop(0, '#c9d6e6'); sky.addColorStop(1, '#eef3f8'); }
    else if (kind === 'dawn') { sky.addColorStop(0, '#8e6f9e'); sky.addColorStop(0.45, '#e39aa0'); sky.addColorStop(1, '#f7cfa8'); }
    else if (kind === 'firefly') { sky.addColorStop(0, '#20304a'); sky.addColorStop(1, '#3d5a55'); }
    else if (kind === 'porch') { sky.addColorStop(0, '#171c2e'); sky.addColorStop(1, '#2a2f44'); }
    else { sky.addColorStop(0, '#f6c79c'); sky.addColorStop(0.6, '#f9e0bf'); sky.addColorStop(1, '#fbeedd'); }
    x.fillStyle = sky; x.fillRect(0, 0, w, h);
    if (night) for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(255,255,230,${0.3 + Math.random() * 0.6})`; x.fillRect(Math.random() * w, Math.random() * h * 0.6, 1.5, 1.5); }
    // ---- the six of DESIGN-T2 3.3 ----
    if (kind === 'train' || kind === 'line' || kind === 'october' || kind === 'dawn' || kind === 'firefly' || kind === 'porch') {
      const ground = (col) => { x.fillStyle = col; x.fillRect(0, h * 0.74, w, h * 0.26); };
      if (kind === 'train') {
        // an embankment, a fence and the rails. The train itself is a mesh that slides past the glass.
        ground(night ? '#2b3630' : '#7f9068');
        x.fillStyle = night ? '#1e2a26' : '#63764e';
        x.beginPath(); x.moveTo(0, h * 0.7); x.quadraticCurveTo(w * 0.5, h * 0.62, w, h * 0.72); x.lineTo(w, h); x.lineTo(0, h); x.fill();
        x.fillStyle = night ? '#3a3a3e' : '#8c8478';
        x.fillRect(0, h * 0.78, w, h * 0.05);
        x.fillStyle = night ? '#4a4a50' : '#b7ae9e';
        for (let i = 0; i < w; i += 11) x.fillRect(i, h * 0.79, 6, h * 0.03);
        x.strokeStyle = night ? '#6a6a72' : '#d8d2c4'; x.lineWidth = 2;
        for (const yy of [h * 0.785, h * 0.815]) { x.beginPath(); x.moveTo(0, yy); x.lineTo(w, yy); x.stroke(); }
      } else if (kind === 'line') {
        // the neighbour's yard, with their own washing already out. Yours is the mesh that moves.
        ground(night ? '#27332c' : '#8faa72');
        x.fillStyle = night ? '#2f2a26' : '#c2a884';
        x.fillRect(w * 0.06, h * 0.3, w * 0.3, h * 0.44);
        x.fillStyle = night ? '#1f1b18' : '#8e7457';
        x.beginPath(); x.moveTo(w * 0.03, h * 0.3); x.lineTo(w * 0.21, h * 0.16); x.lineTo(w * 0.39, h * 0.3); x.fill();
        if (night) { x.fillStyle = '#ffd98a'; x.fillRect(w * 0.14, h * 0.42, w * 0.07, h * 0.09); }
        x.strokeStyle = night ? '#4a4a44' : '#efe6d2'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(w * 0.36, h * 0.44); x.quadraticCurveTo(w * 0.7, h * 0.52, w * 1.02, h * 0.42); x.stroke();
        for (let i = 0; i < 4; i++) {
          const tx = w * (0.44 + i * 0.14), ty = h * (0.47 + Math.sin(i) * 0.012);
          x.fillStyle = night ? '#5a5f6b' : ['#e8a7a0', '#a7c3e8', '#f2e3a7', '#bfe0bf'][i];
          x.fillRect(tx, ty, w * 0.075, h * 0.13);
        }
      } else if (kind === 'october') {
        // bare branches, wet light, and the rain running down the glass
        ground(night ? '#2a2e28' : '#7d7a5e');
        x.strokeStyle = night ? '#25201c' : '#5c4a38'; x.lineWidth = 3;
        for (let i = 0; i < 4; i++) {
          const bx = w * (0.1 + i * 0.28);
          x.beginPath(); x.moveTo(bx, h); x.quadraticCurveTo(bx + 8, h * 0.6, bx - 6, h * 0.3); x.stroke();
          for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(bx + 2, h * (0.62 - k * 0.12)); x.lineTo(bx + (k % 2 ? 20 : -20), h * (0.52 - k * 0.12)); x.stroke(); }
        }
        x.fillStyle = night ? '#6a4a2a' : '#c07a30';
        for (let i = 0; i < 22; i++) { const lx = ((i * 53) % w), ly = h * (0.25 + ((i * 37) % 70) / 100); x.save(); x.translate(lx, ly); x.rotate(i); x.beginPath(); x.ellipse(0, 0, 5, 2.6, 0, 0, 7); x.fill(); x.restore(); }
        x.strokeStyle = 'rgba(255,255,255,0.45)'; x.lineWidth = 1.4;
        for (let i = 0; i < 28; i++) { const rx = (i * 31) % w, ry = ((i * 71) % h); x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - 2, ry + 22); x.stroke(); }
      } else if (kind === 'dawn') {
        // the hills, and the one strip of cloud that is still lit
        x.fillStyle = night ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.45)';
        for (const [cy, cw] of [[0.24, 0.7], [0.34, 0.45], [0.17, 0.35]]) { x.beginPath(); x.ellipse(w * 0.5, h * cy, w * cw * 0.5, h * 0.028, 0, 0, 7); x.fill(); }
        x.fillStyle = night ? '#1c2438' : '#7a5f78';
        x.beginPath(); x.moveTo(0, h * 0.7); x.quadraticCurveTo(w * 0.35, h * 0.56, w * 0.62, h * 0.7); x.quadraticCurveTo(w * 0.84, h * 0.8, w, h * 0.66); x.lineTo(w, h); x.lineTo(0, h); x.fill();
        x.fillStyle = night ? '#141a2c' : '#5d4763';
        x.beginPath(); x.moveTo(0, h * 0.82); x.quadraticCurveTo(w * 0.5, h * 0.72, w, h * 0.84); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      } else if (kind === 'firefly') {
        // always dusk: a hedge, and the lights coming on in it
        ground('#1e2c24');
        x.fillStyle = '#16241d';
        x.beginPath(); x.moveTo(0, h * 0.68); x.quadraticCurveTo(w * 0.4, h * 0.58, w, h * 0.7); x.lineTo(w, h); x.lineTo(0, h); x.fill();
        for (let i = 0; i < 28; i++) {
          const fx = (i * 47) % w, fy = h * (0.42 + ((i * 29) % 45) / 100);
          const g2 = x.createRadialGradient(fx, fy, 0, fx, fy, 9);
          g2.addColorStop(0, 'rgba(226,255,170,0.95)'); g2.addColorStop(1, 'rgba(226,255,170,0)');
          x.fillStyle = g2; x.beginPath(); x.arc(fx, fy, 9, 0, 7); x.fill();
        }
      } else {
        // porch: a neighbour's light, a moth or two, and everything else dark
        ground('#1b2130');
        x.fillStyle = '#242a3a';
        x.fillRect(w * 0.52, h * 0.34, w * 0.48, h * 0.42);
        const lx = w * 0.66, ly = h * 0.42;
        const g3 = x.createRadialGradient(lx, ly, 2, lx, ly, 60);
        g3.addColorStop(0, 'rgba(255,224,150,0.95)'); g3.addColorStop(0.35, 'rgba(255,214,130,0.35)'); g3.addColorStop(1, 'rgba(255,214,130,0)');
        x.fillStyle = g3; x.beginPath(); x.arc(lx, ly, 60, 0, 7); x.fill();
        x.fillStyle = '#ffe9b0'; x.beginPath(); x.arc(lx, ly, 5, 0, 7); x.fill();
        x.fillStyle = 'rgba(240,232,200,0.7)';
        for (const [mx, my] of [[0.6, 0.38], [0.71, 0.46], [0.63, 0.5]]) { x.beginPath(); x.ellipse(w * mx, h * my, 2.6, 1.6, 0.6, 0, 7); x.fill(); }
        x.fillStyle = '#12161f'; x.fillRect(0, h * 0.74, w * 0.5, h * 0.26);
      }
      return;
    }
    if (kind === 'city') {
      for (let i = 0; i < 9; i++) {
        const bw = 20 + (i * 37) % 22, bh = 70 + (i * 53) % 90, bx = i * 30 - 6;
        x.fillStyle = night ? '#2a2c44' : '#8d8fa6';
        x.fillRect(bx, h - bh, bw, bh);
        for (let wy = h - bh + 8; wy < h - 6; wy += 12) for (let wx = bx + 4; wx < bx + bw - 4; wx += 8) {
          x.fillStyle = night ? (Math.random() < 0.5 ? '#ffd98a' : '#3a3c58') : 'rgba(255,255,255,0.35)';
          x.fillRect(wx, wy, 4, 5);
        }
      }
    } else {
      // woods, rain, snow share the hills and trees
      x.fillStyle = night ? '#2c3b3a' : kind === 'snow' ? '#e8eef3' : '#9bb08e';
      x.beginPath(); x.moveTo(0, h * 0.7); x.quadraticCurveTo(w * 0.3, h * 0.55, w * 0.6, h * 0.68); x.quadraticCurveTo(w * 0.85, h * 0.78, w, h * 0.62); x.lineTo(w, h); x.lineTo(0, h); x.fill();
      for (let i = 0; i < 11; i++) {
        const tx = (i * 29) % w, ty = h * (0.72 + (i % 3) * 0.06), th = 40 + (i * 17) % 30;
        x.fillStyle = night ? '#1f2b2a' : kind === 'snow' ? '#6f8a7a' : '#5f7a5a';
        x.beginPath(); x.moveTo(tx, ty - th); x.lineTo(tx + 13, ty); x.lineTo(tx - 13, ty); x.fill();
        if (kind === 'snow') { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(tx, ty - th); x.lineTo(tx + 5, ty - th + 14); x.lineTo(tx - 5, ty - th + 14); x.fill(); }
      }
      if (kind === 'rain') { x.strokeStyle = 'rgba(255,255,255,0.5)'; x.lineWidth = 1; for (let i = 0; i < 60; i++) { const rx = Math.random() * w, ry = Math.random() * h; x.beginPath(); x.moveTo(rx, ry); x.lineTo(rx - 3, ry + 10); x.stroke(); } }
      if (kind === 'snow') { x.fillStyle = '#fff'; for (let i = 0; i < 70; i++) { x.beginPath(); x.arc(Math.random() * w, Math.random() * h, 1 + Math.random() * 1.5, 0, 7); x.fill(); } }
    }
  });
}

// the hand written label a finished set's shadow box gets on the ledge front (DESIGN-T2 2.4)
const labelCache = new Map();
function labelTexture(text) {
  if (labelCache.has(text)) return labelCache.get(text);
  const t = canvasTex(256, 52, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    x.fillStyle = '#f6eedb';
    x.strokeStyle = '#cdb98d';
    x.lineWidth = 3;
    x.beginPath(); x.roundRect(3, 3, w - 6, h - 6, 5); x.fill(); x.stroke();
    x.fillStyle = '#6a5a3c';
    let size = 26;
    x.textAlign = 'center'; x.textBaseline = 'middle';
    do { x.font = `italic ${size}px Georgia, serif`; size -= 2; } while (size > 12 && x.measureText(text).width > w - 18);
    x.fillText(text, w / 2, h / 2 + 1);
  });
  labelCache.set(text, t);
  return t;
}


function calendarTexture(save) {
  return canvasTex(128, 160, (x, w, h) => {
    x.fillStyle = '#fbf5e9'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#c46a3f'; x.fillRect(0, 0, w, 30);
    x.fillStyle = '#fff'; x.font = '700 18px Nunito, sans-serif'; x.textAlign = 'center';
    x.fillText(new Date().toLocaleString('en', { month: 'long' }).toUpperCase(), w / 2, 22);
    // every Daily finished this month, Laundry or Rush, gets a circle
    const now = new Date();
    const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-`;
    const days = [...(save.dailyDays || []), ...(save.dailyHistory || []).map((d) => d.date)];
    const played = new Set(days.filter((d) => typeof d === 'string' && d.startsWith(ym)).map((d) => Number(d.slice(8))));
    const len = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const lead = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    x.font = '700 11px Nunito, sans-serif';
    for (let d = 1; d <= len; d++) {
      const k = d - 1 + lead;
      const cx = 11 + (k % 7) * 17.6, cy = 48 + Math.floor(k / 7) * 21;
      if (played.has(d)) { x.fillStyle = '#8fa58a'; x.beginPath(); x.arc(cx, cy - 4, 8, 0, 7); x.fill(); }
      x.fillStyle = d === now.getDate() ? '#c46a3f' : '#4a3a2c'; x.fillText(String(d), cx, cy);
    }
  });
}

function posterTexture(title, a, b) {
  return canvasTex(150, 200, (x, w, h) => {
    x.fillStyle = a; x.fillRect(0, 0, w, h);
    x.fillStyle = b;
    x.beginPath(); x.arc(w / 2, h * 0.4, 42, 0, 7); x.fill();
    x.fillStyle = a;
    x.beginPath(); x.arc(w / 2 + 14, h * 0.36, 30, 0, 7); x.fill();
    x.fillStyle = b; x.font = '700 15px Fraunces, Georgia, serif'; x.textAlign = 'center';
    const words = String(title).toUpperCase().split(' ');
    let line = '', y = h * 0.78;
    for (const wd of words) { if ((line + ' ' + wd).length > 14) { x.fillText(line, w / 2, y); y += 18; line = wd; } else line = (line ? line + ' ' : '') + wd; }
    x.fillText(line, w / 2, y);
  });
}
