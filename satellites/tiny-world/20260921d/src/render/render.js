// Canvas renderer: terrain canvas, y-sorted things and creatures, night, weather and effects.
// Reads sim state; never writes it. Draws in logical pixels; CSS scales the canvas by an integer.
import { sprite, palette, tileHash, atlasRef, atlasImage, watchCanvas, restored, repaintSprites } from '../art/sprites.js';
import { flies, inWater } from '../sim/world.js';
import { ent, G_TAKE } from '../sim/ents.js';

// The world is drawn through a camera (camera.js): terrain in chunks of 16×16 tiles, each an offscreen
// canvas redrawn only when one of its tiles changed (animated water and lava keep four phases); only what the
// camera sees is drawn. Draws in logical pixels under the camera's whole-number zoom.
const CHUNK = 16; // tiles per chunk side

export function createRenderer(cv, art, cam) {
  const ctx = cv.getContext('2d');
  const ncan = document.createElement('canvas'), nctx = ncan.getContext('2d');
  let animPhase = 0, animT = 0, epoch = -1, ncx = 0, ncy = 0, chunks = [], world = null, cssPx = 0, seenRestores = 0;
  const PAL = palette();
  const stats = { chunkRedraws: 0 }; // for tools: how many chunk canvases were drawn
  const rgb = new Map(); // '#rrggbb' -> [r, g, b]
  const col = (c) => { let v = rgb.get(c); if (!v) { const n = parseInt(c.slice(1), 16); v = [(n >> 16) & 255, (n >> 8) & 255, n & 255]; rgb.set(c, v); } return v; };

  function resize(w) {
    world = w;
    ncx = Math.ceil(w.cols / CHUNK); ncy = Math.ceil(w.rows / CHUNK);
    chunks = [];
    for (let i = 0; i < ncx * ncy; i++) chunks.push({ cans: [], ok: [false, false, false, false], anim: false });
    epoch = -1;
  }

  // Draws one chunk's tiles for animation phase p into its canvas (pixels through ImageData: fast enough to
  // redraw a whole 192×192 world at once).
  // Footprints in the mud (design 15 C1): render only, a fixed ring, oldest overwritten.
  const prints = new Array(240).fill(null);
  let printN = 0, printAt = -99;

  function drawChunk(w, ci, p) {
    const c = chunks[ci], cx = ci % ncx, cy = (ci / ncx) | 0, tx0 = cx * CHUNK, ty0 = cy * CHUNK;
    const tw = Math.min(CHUNK, w.cols - tx0), th = Math.min(CHUNK, w.rows - ty0);
    let can = c.cans[p];
    if (!can) { can = c.cans[p] = watchCanvas(document.createElement('canvas')); can.width = tw * 8; can.height = th * 8; }
    const g = can.getContext('2d'), img = g.createImageData(tw * 8, th * 8), d = img.data;
    let anim = false;
    const mix = art.edgeMix || null; // how far one ground frays into the next (art.json); null or [] keeps hard edges
    for (let ty = ty0; ty < ty0 + th; ty++) for (let tx = tx0; tx < tx0 + tw; tx++) {
      const i = ty * w.cols + tx, t = w.terr[i], def = w.C.TERR[t];
      // Ground meets ground along a frayed line, not a ruled one. Every pond in this game was a rectangle and
      // every snow patch a square, which is the whole of "the world looks sloppy": nothing in nature has a
      // straight edge. Each tile lets its neighbour's colour bleed a pixel or two in, by the same tile hash the
      // ground already uses, so it is deterministic, costs nothing per frame (chunks are cached) and the sim
      // never sees it. The bleed is one way: a tile borrows, it never writes into its neighbour.
      let eL = null, eR = null, eU = null, eD = null;
      if (mix && mix.length) {
        const n = (j2) => w.C.TERR[w.terr[j2]];
        if (tx > 0 && w.terr[i - 1] !== t) eL = n(i - 1);
        if (tx < w.cols - 1 && w.terr[i + 1] !== t) eR = n(i + 1);
        if (ty > 0 && w.terr[i - w.cols] !== t) eU = n(i - w.cols);
        if (ty < w.rows - 1 && w.terr[i + w.cols] !== t) eD = n(i + w.cols);
      }
      const frayed = eL || eR || eU || eD;
      const cols = t === w.C.tid.grass && w.eaten[i] > 0 ? art.eatenGrass : def.cols, ph = def.anim ? p : 0, rock = t === w.C.tid.rock;
      if (def.anim) anim = true;
      // Design 15 C1: tall grass. Blades two or three pixels high standing anywhere up each tile, scattered by
      // the hash of their own column (not a pattern: every third pixel in a row reads as woven matting, and all
      // of them at the top of the tile draws the field in stripes — both looked at, 20 Sep), and their tips lean
      // as the phase turns, so a field of it sways.
      const blade = def.blades, lean = blade && (ph & 1) ? 1 : 0;
      // Design 15 C1: a meadow is grass with a couple of flowers on each tile, all of a colour within the tile
      // (so a field reads as patches of colour, not confetti); ash is grey with paler flecks through it.
      const flowers = def.flowers, flowerCol = flowers ? flowers[Math.floor(tileHash(tx, ty, 2) * flowers.length) % flowers.length] : null;
      const flecks = def.flecks, shine = def.shine, glint = def.glint;
      // Design 15 C1: a field in three stages — dots in the drills, then stalks, then gold ears on them.
      const sprout = def.sprout, stalk = def.stalk, ear = def.ear;
      const shineX = shine ? Math.floor(tileHash(tx, ty, 1) * 8) : -1, shineY = shine ? Math.floor(tileHash(tx, ty, 3) * 8) : -1;
      const groundPh = blade ? 0 : ph; // a swaying terrain moves its blades, not the ground under them
      for (let j = 0; j < 8; j++) for (let k = 0; k < 8; k++) {
        const r = tileHash(tx * 8 + k, ty * 8 + j, groundPh);
        let cc = cols[r < 0.6 ? 0 : r < 0.82 ? 1 : 2];
        if (frayed) {
          const gx = tx * 8 + k, gy = ty * 8 + j;
          // How deep this stretch of edge bleeds: coarse, so neighbouring pixels agree and it reads as a run.
          const deep = (seed, along) => Math.floor(tileHash(seed, (along >> 1) * 7 + 3, 5) * mix.length * 1.35);
          let nb = null;
          if (eL && k < deep(1, gy)) nb = eL;
          else if (eR && 7 - k < deep(2, gy)) nb = eR;
          else if (eU && j < deep(3, gx)) nb = eU;
          else if (eD && 7 - j < deep(4, gx)) nb = eD;
          if (nb) { const nc = nb.cols; cc = nc[r < 0.6 ? 0 : r < 0.82 ? 1 : 2]; }
        }
        if (blade) {
          // Each column of pixels may carry one blade, two or three high, standing anywhere up the tile: keeping
          // them all at the top drew a field in stripes, one band per tile (looked at, 20 Sep).
          const gx = tx * 8 + k, gy = ty * 8;
          const h = tileHash(gx, gy, 0);
          if (h < 0.5) {
            const tall = h < 0.2 ? 3 : 2, base = 2 + Math.floor(tileHash(gx, gy + 3, 0) * 6);
            const tip = base - tall + 1;
            if (j >= tip && j <= base) cc = blade;
            // the tip leans as the phase turns, so the field sways
            if (lean && j === tip - 1 && tileHash(gx, gy + 5, 0) < 0.5) cc = blade;
          }
        }
        if (sprout || stalk) { // a field: drills two pixels apart, each with a shoot of its own height in it
          const gx = tx * 8 + k, drill = k % 2 === 0;
          const h = tileHash(gx, ty * 8 + (j < 4 ? 0 : 4), 2); // two bands a tile, so a field is not one comb
          if (drill && sprout && j % 3 === 1) cc = sprout;
          if (drill && stalk) {
            const top = ear ? (h < 0.35 ? 1 : h < 0.75 ? 2 : 0) : (h < 0.4 ? 4 : h < 0.8 ? 3 : 2);
            if (j > top) cc = stalk;
            else if (j === top && ear) cc = ear; // the head on it
          }
        }
        if (flowerCol && j > 0 && j < 7 && tileHash(tx * 8 + k, ty * 8 + j, 3) < 0.035) cc = flowerCol;
        if (flecks && tileHash(tx * 8 + k, ty * 8 + j, 3) < 0.07) cc = flecks;
        if (shine && k === shineX && j === shineY) cc = shine; // one wet glint per tile of mud
        if (glint && k === (j * 3 + 1) % 8 && j === ((tx + ty) % 3) + 2) cc = glint; // and one hard one on glass
        if (rock) { if (j === 7) cc = art.rockBottom; else if (j === 0) cc = art.rockTop; }
        const v = col(cc), o = (((ty - ty0) * 8 + j) * tw * 8 + (tx - tx0) * 8 + k) * 4;
        d[o] = v[0]; d[o + 1] = v[1]; d[o + 2] = v[2]; d[o + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    c.anim = anim; c.ok[p] = true;
    stats.chunkRedraws++;
  }

  // Bring the chunks up to date with the sim's dirty tiles: a changed tile makes its chunk stale (all phases).
  function syncTerrain(w) {
    if (w.epoch !== epoch) { for (const c of chunks) c.ok.fill(false); epoch = w.epoch; }
    for (const i of w.dirty) { const c = chunks[(((i / w.cols) | 0) / CHUNK | 0) * ncx + ((i % w.cols) / CHUNK | 0)]; c.ok.fill(false); }
    for (const i of w.dirty) w.dirtyMark[i] = 0;
    w.dirty.length = 0;
  }

  // Water and lava shimmer: four phases, stepped every half second of real time (chunks keep all four).
  function animate(w, dt) {
    animT += dt;
    if (animT > 0.5) { animT = 0; animPhase = (animPhase + 1) % 4; }
  }

  // Where a creature is drawn: between its last two sim positions, unless it jumped (a drop or a snap).
  const lerpPos = (a, b, k) => (Math.abs(b - a) > 8 ? b : a + (b - a) * k);

  // e: a creature's slot; the renderer reads the sim's store directly (read only), never through views.
  // hop: px it is lifted by a poke; outline: the eraser's red outline (design 14 §3); at: [x, y] to draw it at instead of
  // where the sim has it (a creature in the hand, drawn at the finger, lifted by `hop`).
  function drawEnt(w, e, selected, k, time, lag, hop = 0, outline = false, at = null) {
    const E = w.E, kind = E.kind[e];
    const flash = E.flash[e] + lag; // as of this frame, so the hurt blink runs at 30 Hz between steps too
    if (flash > 0 && Math.floor(flash * 30) % 2) return;
    const S = w.C.S, sp = S[kind], G = E.gear[e], ref = spriteOf(w, e, kind, sp, G), sz = E.baby[e] ? 6 : 8;
    const X = Math.round(at ? at[0] : lerpPos(E.px[e], E.x[e], k)), Y0 = Math.round(at ? at[1] : lerpPos(E.py[e], E.y[e], k));
    const alt = (E.alt[e] > 0 ? E.alt[e] : E.perch[e] ? 7 : sp.ufo ? 7 + Math.sin(time * 4 + E.born[e]) * 1.5 : 0) + hop, Y = Y0 - Math.round(alt);
    if (alt > 0 && !E.perch[e]) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(X - 3, Y0, 6, 1); }
    if (E.chute[e] && E.alt[e] > 0) {
      ctx.fillStyle = '#d43b3b'; ctx.fillRect(X - 3, Y - 17, 6, 1); ctx.fillRect(X - 5, Y - 16, 10, 2);
      ctx.fillStyle = '#f4f4f0'; ctx.fillRect(X - 2, Y - 16, 1, 2); ctx.fillRect(X + 1, Y - 16, 1, 2);
      ctx.fillStyle = '#1b1b26'; ctx.fillRect(X - 5, Y - 14, 1, 2); ctx.fillRect(X + 4, Y - 14, 1, 2); ctx.fillRect(X - 4, Y - 12, 1, 2);
      ctx.fillRect(X + 3, Y - 12, 1, 2); ctx.fillRect(X - 3, Y - 10, 1, 2); ctx.fillRect(X + 2, Y - 10, 1, 2);
    }
    if (E.cargo[e]) { ctx.globalAlpha = 0.35; ctx.fillStyle = '#7be04a'; ctx.fillRect(X - 2, Y - 1, 4, alt + 1); ctx.globalAlpha = 1; }
    // Swimmers show only their top half.
    const gz = E.bigT[e] > 0 ? 2 : 1; // a giant is twice everything (design 17): its clip, its bars, its ring
    if (inWater(w, e) && !flies(w, e) && !sp.water) { ctx.save(); ctx.beginPath(); ctx.rect(X - 6 * gz, Y - 12 * gz + (gz - 1) * 3, 12 * gz, 9 * gz); ctx.clip(); }
    else ctx.save();
    ctx.translate(X, Y + 1);
    // A giant (design 17) is everything it was, twice the size: the sprite, the hat, the sword. Whole pixels, so
    // it stays crisp. It grows over the first half second and shrinks over the last, so the change is SEEN.
    const bigT = E.bigT[e], big = bigT > 0 ? (bigT < 0.5 || bigT > w.R.react.giantSec - 0.4 ? 1.5 : 2) : 1;
    ctx.scale(E.face[e] * big, big);
    const p = (c, x, y, ww, hh) => { ctx.fillStyle = c; ctx.fillRect(x - 4, y - 8, ww || 1, hh || 1); };
    if (G.wings && !E.baby[e]) { p('#f4f4f0', -1, 2, 2, 3); p('#f4f4f0', -2, 1, 1, 2); }
    ctx.drawImage(ATL, ref.sx, ref.sy, 8, 8, -sz / 2, -sz, sz, sz);
    if (!E.baby[e]) {
      if (G.armor) { if (sp.humanoid) p(art.armorTint[G.armor], 2, 0, 4, 1); else p(art.armorTint[G.armor], 2, 2, 3, 1); }
      if (G.crown) p(PAL.y, 2, -1, 4, 1);
      // The piece worn on the head, when it has a drawing for the field (art.hats). Every piece shows in the
      // inspector's paper doll; only the ones that read at 8 px are drawn on the creature itself.
      if (G.head && art.hats[G.head]) for (const q of art.hats[G.head]) p(PAL[q[0]], q[1], q[2], q[3], q[4]);
      else if (G.head) headPiece(G.head); // no hand drawing: its own picture, top down, sits on the head
      if (G.boots && sp.humanoid) { p('#d43b3b', 2, 7); p('#d43b3b', 5, 7); }
      if (G.shield) { p(G.shieldCol, 0, 3, 2, 4); p(PAL.y, 0, 4, 1, 2); }
      const wp = w.C.WEAP[G.weapon];
      if (wp) for (const q of art.overlays[wp.spr]) p((wp.over && wp.over[q[0]]) || PAL[q[0]], q[1], q[2], q[3], q[4]);
    }
    ctx.restore();
    if (E.frozen[e] > 0) { ctx.globalAlpha = 0.55; ctx.fillStyle = '#bfe6f2'; ctx.fillRect(X - 4 * gz, Y + 1 - 8 * gz, 8 * gz, 8 * gz); ctx.globalAlpha = 1; }
    const top = Y - 10 - (gz - 1) * 8; // where the bars over its head go: above a giant's head, not inside it
    if (E.bless[e] > 0) { ctx.fillStyle = PAL.y; ctx.fillRect(X - 2, top, 4, 1); }
    const mx = sp.hp, hp = E.hp[e];
    if (hp < mx - 0.5) {
      ctx.fillStyle = '#1b1b26'; ctx.fillRect(X - 4, top, 8, 1);
      ctx.fillStyle = hp < mx * 0.35 ? '#d43b3b' : '#7be04a'; ctx.fillRect(X - 4, top, Math.max(1, Math.round((8 * hp) / mx)), 1);
    }
    if (outline) { ctx.fillStyle = PAL.r; ctx.fillRect(X - 6, Y - 10, 12, 1); ctx.fillRect(X - 6, Y + 1, 12, 1); ctx.fillRect(X - 6, Y - 10, 1, 12); ctx.fillRect(X + 5, Y - 10, 1, 12); }
    if (e === selected) {
      ctx.fillStyle = '#ffd23f';
      const x = X - 6 * gz, y = Y + 1 - 12 * gz;
      for (const r of SEL) ctx.fillRect(x + r[0] * gz, y + r[1] * gz, r[2] * gz, r[3] * gz);
    }
  }
  // Each slot remembers its atlas slot and what it was made from (kind, looks object, armour), so the key
  // string is built only when one of them changes, not per creature per frame.
  const ATL = atlasImage(), refKind = [], refOver = [], refArmor = [], refSlot = [];
  function spriteOf(w, e, kind, sp, G) {
    const base = w.E.over[e] || sp.over, armor = G.armor || 0;
    if (refKind[e] !== kind || refOver[e] !== base || refArmor[e] !== armor) {
      const isHum = (sp.spr || kind) === 'human', over = armor && isHum ? { ...base, b: art.armorTint[armor] } : base;
      refKind[e] = kind; refOver[e] = base; refArmor[e] = armor; refSlot[e] = atlasRef(sp.spr || kind, over || sp.over);
    }
    return refSlot[e];
  }
  const defRef = new Map(); // thing definition -> [atlas slot, atlas slot when eaten bare]
  function thingOf(d) { let r = defRef.get(d); if (!r) { r = [atlasRef(d.spr, d.over), d.empty ? atlasRef(d.empty) : null,
    d.orient ? atlasRef(d.orient.v, d.over) : null, d.orient ? atlasRef(d.orient.x, d.over) : null]; defRef.set(d, r); } return r; }
  // A thing with `orient` picks its look from its own kind beside it (Stephen's tester, Sep 20: a fence has to
  // go up and down as well as across). Render only: the sim never sees it, so no hash moves and no save changes.
  function orientRef(w, s, r) {
    const c = w.cols, i = s.ty * c + s.tx, t = s.type;
    const same = (j, ok) => ok && w.grid[j] && w.grid[j].type === t;
    const across = same(i - 1, s.tx > 0) || same(i + 1, s.tx < c - 1);
    const updown = same(i - c, s.ty > 0) || same(i + c, s.ty < w.rows - 1);
    if (across && updown) return r[3];
    return updown ? r[2] : r[0];
  }
  let bonesRef = null, heartRef = null;
  // A creature at far zoom: a 2×2 CSS-pixel dot in the colour its sprite uses most.
  const dotCols = {};
  function dotColor(name) {
    if (dotCols[name]) return dotCols[name];
    const img = sprite(name), d = img.getContext('2d').getImageData(0, 0, 8, 8).data, n = new Map();
    let best = '#ffffff', bn = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3]) { const k = (d[i] << 16) | (d[i + 1] << 8) | d[i + 2], v = (n.get(k) || 0) + 1; n.set(k, v); if (v > bn) { bn = v; best = '#' + k.toString(16).padStart(6, '0'); } }
    return (dotCols[name] = best);
  }
  function drawDot(w, e, k, z) {
    const E = w.E, sp = w.C.S[E.kind[e]], s = (2 * cam.dpr) / z; // 2 CSS px, in logical px
    ctx.fillStyle = dotColor(sp.spr || E.kind[e]);
    ctx.fillRect(lerpPos(E.px[e], E.x[e], k) - s / 2, lerpPos(E.py[e], E.y[e], k) - 4 - s / 2, s, s);
  }
  const SEL = [[0, 0, 3, 1], [0, 0, 1, 3], [9, 0, 3, 1], [11, 0, 1, 3], [0, 12, 3, 1], [0, 10, 1, 3], [9, 12, 3, 1], [11, 10, 1, 3]];

  // k: how far the frame sits between the previous sim step and the latest one (0..1). selected: a handle.
  // ui (design 14 §3, from main.js): { now, U (ui.json), held {h, x, y} | null, pokes Map(handle -> ms), outlines Map(handle ->
  // {until}) }; absent in tools.
  function frame(w, selected, rand, k = 1, ui = null) {
    const sel = selected ? ent(w, selected) : -1, E = w.E;
    const T = w.T, W = w.W, H = w.H, lag = (1 - k) * w.R.tickSec, time = w.time - lag;
    const age = (f) => Math.max(0, f.t + lag); // effect time left, as of this frame
    syncTerrain(w);
    // At whole-number zoom the canvas holds logical pixels and CSS scales it up by the zoom (image-rendering:
    // pixelated): crisp, and zoom² fewer pixels to fill than drawing at device resolution. At far zoom it holds
    // device pixels. Then the area outside the world, then the world through the camera.
    const z = cam.zoom, px = cam.pixel(), bw = Math.ceil(cam.cw / px), bh = Math.ceil(cam.ch / px);
    if (cv.width !== bw || cv.height !== bh || cssPx !== px) {
      cv.width = bw; cv.height = bh; cssPx = px;
      cv.style.width = (bw * px) / cam.dpr + 'px'; cv.style.height = (bh * px) / cam.dpr + 'px';
    }
    // A lost GPU context wiped the atlas, the sprites and the terrain chunks: paint them again.
    if (restored() !== seenRestores) {
      seenRestores = restored(); repaintSprites();
      for (const c of chunks) c.ok.fill(false);
      for (const kk in dotCols) delete dotCols[kk];
    }
    // Every frame starts from a clean state, so a draw that failed half way cannot leave its alpha or blend
    // mode on every frame after it.
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = art.outside; ctx.fillRect(0, 0, cv.width, cv.height);
    const bs = z / px; // canvas px per logical px: 1, or the far fraction
    ctx.setTransform(bs, 0, 0, bs, cam.ox / px, cam.oy / px);
    const [vx0, vy0, vx1, vy1] = cam.view(), m = 24; // visible world rectangle, and a margin for sprites and effects
    const cx0 = Math.max(0, Math.floor(vx0 / (CHUNK * T))), cx1 = Math.min(ncx - 1, Math.floor(vx1 / (CHUNK * T)));
    const cy0 = Math.max(0, Math.floor(vy0 / (CHUNK * T))), cy1 = Math.min(ncy - 1, Math.floor(vy1 / (CHUNK * T)));
    for (let cy = cy0; cy <= cy1; cy++) for (let cx = cx0; cx <= cx1; cx++) {
      const ci = cy * ncx + cx, c = chunks[ci];
      if (!c.ok[0]) drawChunk(w, ci, 0);
      const p = c.anim ? animPhase : 0;
      if (!c.ok[p]) drawChunk(w, ci, p);
      ctx.drawImage(c.cans[p], cx * CHUNK * T, cy * CHUNK * T);
    }
    // Design 15 C1: footprints in the mud. The renderer watches who is standing on wet ground and keeps a short
    // ring of marks; the sim knows nothing about them (they change nothing, and a hash must not depend on what
    // has been drawn). A child can track a wolf across a muddy field by them.
    if (w.C.tags && w.R.flags.mud) {
      const P = w.R.mud, E = w.E;
      if (time - printAt > 0.25) {
        printAt = time;
        for (let j = 0; j < w.count; j++) {
          const e = w.order[j];
          if (E.inside[e] || E.dead[e] || E.alt[e] > 0 || E.perch[e]) continue;
          const tx = Math.floor(E.x[e] / T), ty = Math.floor(E.y[e] / T);
          if (tx < 0 || ty < 0 || tx >= w.cols || ty >= w.rows) continue;
          if (!w.C.TERR[w.terr[ty * w.cols + tx]].shine) continue; // wet ground: the only kind that takes a print
          const dx = E.x[e] - E.px[e], dy = E.y[e] - E.py[e];
          if (dx * dx + dy * dy < 0.04) continue; // standing still leaves nothing
          prints[printN % prints.length] = { x: Math.round(E.x[e]), y: Math.round(E.y[e]), t: time, side: printN & 1 };
          printN++;
        }
      }
      ctx.fillStyle = art.print || '#3a2c20';
      for (const f of prints) {
        if (!f) continue;
        const age2 = time - f.t;
        if (age2 < 0 || age2 > P.printSec) continue;
        if (f.x + 2 < vx0 || f.x - 2 > vx1 || f.y + 2 < vy0 || f.y - 2 > vy1) continue;
        ctx.globalAlpha = 0.85 * (1 - age2 / P.printSec);
        // Two pixels side by side, one step left, one step right: a mark you can follow, and darker than the
        // mud's own flecks (the first try was the same colour as them and vanished into the ground).
        ctx.fillRect(f.x - 1 + f.side * 2, f.y, 1, 1);
        ctx.fillRect(f.x - 1 + f.side * 2, f.y - 1, 1, 1);
      }
      ctx.globalAlpha = 1;
    }
    // The village's permission (14 §7 item 13): the tiles the player allowed, tinted so the paint is visible
    // without hiding the ground under it.
    if (w.claimN) {
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = art.claim;
      for (let k = 0; k < w.claimN; k++) {
        const i = w.claimList[k];
        if (!(w.claim[i] & 1)) continue;
        const tx = (i % w.cols) * T, ty = ((i / w.cols) | 0) * T;
        if (tx + T < vx0 || tx > vx1 || ty + T < vy0 || ty > vy1) continue;
        ctx.fillRect(tx, ty, T, T);
      }
      ctx.globalAlpha = 1;
      // A dashed edge around the region (15 A5): the tint alone is easy to miss on grass, and invisible on snow.
      ctx.fillStyle = art.claimEdge;
      for (let k = 0; k < w.claimN; k++) {
        const i = w.claimList[k];
        if (!(w.claim[i] & 1)) continue;
        const tx = (i % w.cols) * T, ty = ((i / w.cols) | 0) * T, cx = i % w.cols, cy = (i / w.cols) | 0;
        if (tx + T < vx0 || tx > vx1 || ty + T < vy0 || ty > vy1) continue;
        const out = (nx, ny) => !(nx >= 0 && ny >= 0 && nx < w.cols && ny < w.rows && (w.claim[ny * w.cols + nx] & 1));
        for (let d = 0; d < T; d += 3) { // a dash every three pixels
          if (out(cx, cy - 1)) ctx.fillRect(tx + d, ty, 2, 1);
          if (out(cx, cy + 1)) ctx.fillRect(tx + d, ty + T - 1, 2, 1);
          if (out(cx - 1, cy)) ctx.fillRect(tx, ty + d, 1, 2);
          if (out(cx + 1, cy)) ctx.fillRect(tx + T - 1, ty + d, 1, 2);
        }
      }
    }
    // Fire (14 §7 T9): the tiles alight, drawn over the ground and under everything that walks on it, so a
    // creature in the fire is still seen. Flames flicker on the tile's own hash, so they do not all dance together.
    if (w.burnN) {
      for (let k = 0; k < w.burnN; k++) {
        const i = w.burnList[k];
        if (w.burn[i] <= 0) continue;
        const tx = (i % w.cols) * T, ty = ((i / w.cols) | 0) * T;
        if (tx + T < vx0 || tx > vx1 || ty + T < vy0 || ty > vy1) continue;
        const ph = (Math.floor(time * 8) + ((tileHash(tx, ty, 3) * 4) | 0)) % 3;
        ctx.fillStyle = art.scorch; // burnt ground under it, so a fire front reads as a front and not as confetti
        ctx.fillRect(tx, ty, 8, 8);
        ctx.fillStyle = art.fireLow;
        ctx.fillRect(tx, ty + 3, 8, 5);
        const tall = (tileHash(tx, ty, 5) * 2) | 0; // every tile burns a little differently, so the top of a fire
        ctx.fillStyle = art.fireMid;                  // front is a ragged edge and not a straight line
        ctx.fillRect(tx + 1, ty + 1 + ph + tall, 6, 5 - tall);
        ctx.fillStyle = PAL.y;
        ctx.fillRect(tx + 2 + (ph === 1 ? 1 : 0), ty + (ph === 2 ? 0 : 1), 3, 3);
        ctx.fillStyle = '#fff6cf';
        ctx.fillRect(tx + 3, ty + 2 + ph, 1, 2);
      }
    }
    const seen = (x, y) => x > vx0 - m && x < vx1 + m && y > vy0 - m && y < vy1 + m;
    const list = [], flick = Math.floor(time * 6) % 2;
    // Design 15 A4b: anything a monster is walking over to pick up glints, so the player can snatch it first.
    let wanted = null;
    for (let j = 0; j < w.count; j++) {
      const e = w.order[j];
      if (E.goalKind[e] !== G_TAKE || !w.C.S[E.kind[e]].enemy) continue;
      (wanted = wanted || new Set()).add(E.goalA[e]);
    }
    for (const s of w.structs) if (seen(s.tx * T + 4, s.ty * T + 4)) list.push({ y: s.def.flat ? s.ty * T : (s.ty + 1) * T - (s.def.low ? 3 : 0), s });
    for (let j = 0; j < w.count; j++) {
      const e = w.order[j];
      if (E.inside[e] || !seen(E.x[e], E.y[e])) continue;
      const y = lerpPos(E.py[e], E.y[e], k);
      list.push({ y: flies(w, e) ? y + 1000 : y, e });
    }
    for (let j = 0; j < w.fxN; j++) { const f = w.fx[j]; if (f.type === 'bones' && seen(f.x, f.y)) list.push({ y: f.y - 1, f }); }
    list.sort((a, b) => a.y - b.y);
    const far = z < cam.dpr; // far zoom (under 1 CSS px per logical px): creatures are 2×2 CSS px dots
    for (const it of list) {
      if (it.e !== undefined) { if (far) drawDot(w, it.e, k, z); else if (ui) drawMarked(w, it.e, sel, k, time, lag, ui); else drawEnt(w, it.e, sel, k, time, lag); } // slot 0 is a creature too
      else if (it.f) { bonesRef = bonesRef || atlasRef('bones'); ctx.globalAlpha = Math.min(1, age(it.f)); ctx.drawImage(ATL, bonesRef.sx, bonesRef.sy, 8, 8, Math.round(it.f.x) - 4, Math.round(it.f.y) - 7, 8, 8); ctx.globalAlpha = 1; }
      else {
        const s = it.s, d = s.def, y = s.ty * T, r = thingOf(d), ref = d.food && s.food < 1 ? r[1] : d.orient ? orientRef(w, s, r) : r[0];
        let x = s.tx * T;
        // Everything wiggles when it is poked (design 17: once a poke makes a hen lay, she will poke EVERYTHING, and
        // silence from eight things in ten teaches her that poking is broken). And an egg about to hatch rocks.
        const tp = ui && ui.thingPoke;
        const age2 = tp && tp.tx === s.tx && tp.ty === s.ty ? performance.now() - tp.t : 1e9;
        if (age2 < 320) x += Math.round(Math.sin(age2 / 24) * 1.6 * (1 - age2 / 320));
        else if (d.hatch && s.cd > d.hatchSec - w.R.react.rockSec && Math.floor(time * 5) % 3 === 0) x += 1; // (an egg that cannot hatch yet never gets this far: update.js)
        ctx.drawImage(ATL, ref.sx, ref.sy, 8, 8, x, y, 8, 8);
        if (d.fire && flick) { ctx.fillStyle = PAL.y; ctx.fillRect(x + 3, y + 1, 1, 1); ctx.fillStyle = PAL.o; ctx.fillRect(x + 4, y + 2, 1, 1); }
        if (d.home && s.occ > 0) { ctx.fillStyle = PAL.y; ctx.fillRect(x + 5, y + 5, 1, 1); }
        if (wanted && wanted.has(s.h)) { // glinting: a monster is coming for it
          // A twinkle just off the item's shoulder, alternating place and colour, so it reads as a sparkle
          // rather than another pixel of the picture.
          ctx.fillStyle = flick ? '#fff6cf' : PAL.y;
          if (flick) { ctx.fillRect(x + 7, y - 2, 1, 1); ctx.fillRect(x + 6, y - 1, 1, 1); ctx.fillRect(x + 8, y - 1, 1, 1); ctx.fillRect(x + 7, y, 1, 1); }
          else { ctx.fillRect(x + 7, y - 1, 1, 1); }
        }
      }
    }
    // Night: dark overlay with plus-shaped light pools punched out.
    const dt = (time % w.daySec) / w.daySec, nf = w.R.nightFrac, ramp = art.nightRamp;
    let dark = dt > nf ? Math.min(1, (dt - nf) / ramp) : 0;
    if (dt > 1 - ramp) dark = Math.max(0, (1 - dt) / ramp);
    // The night layer covers the part of the world in view (logical px), lights punched out of it; only lights
    // that reach the view are drawn. A view wholly off the world (a tiny field panned to the margin) has none.
    const nx0 = Math.max(0, Math.floor(vx0)), ny0 = Math.max(0, Math.floor(vy0)), nw = Math.min(W, Math.ceil(vx1)) - nx0, nh = Math.min(H, Math.ceil(vy1)) - ny0;
    if (dark > 0 && nw > 0 && nh > 0) {
      if (ncan.width !== nw || ncan.height !== nh) { ncan.width = nw; ncan.height = nh; }
      nctx.setTransform(1, 0, 0, 1, -nx0, -ny0);
      nctx.globalCompositeOperation = 'source-over'; nctx.clearRect(nx0, ny0, nw, nh); nctx.fillStyle = art.night; nctx.fillRect(nx0, ny0, nw, nh);
      nctx.globalCompositeOperation = 'destination-out';
      const rings = w.lights.length > 1000 ? 1 : 99; // a world lit by thousands: one pool each, not four rings
      for (const f of w.lights) {
        // Design 15 C1: glass beside a light throws it a tile further.
        let reach = f.def.light;
        if (w.R.flags.glass) {
          for (let d = 0; d < 4; d++) {
            const nx = f.tx + (d === 0 ? 1 : d === 1 ? -1 : 0), ny = f.ty + (d === 2 ? 1 : d === 3 ? -1 : 0);
            if (nx < 0 || ny < 0 || nx >= w.cols || ny >= w.rows) continue;
            if (w.C.TERR[w.terr[ny * w.cols + nx]].glint) { reach += T; break; }
          }
        }
        const cx = f.tx * T + 4, cy = f.ty * T + 4, R0 = reach + 1;
        if (cx + R0 < nx0 || cx - R0 > nx0 + nw || cy + R0 < ny0 || cy - R0 > ny0 + nh) continue;
        for (let r = reach + flick, n = 0; r > 4 && n < rings; r -= 5, n++) { nctx.fillStyle = 'rgba(0,0,0,.3)'; nctx.fillRect(cx - r, cy - r + 3, r * 2, r * 2 - 6); nctx.fillRect(cx - r + 3, cy - r, r * 2 - 6, r * 2); }
      }
      for (const it of list) { const s = it.s; if (s && s.def.home && s.occ > 0) { nctx.fillStyle = 'rgba(0,0,0,.6)'; nctx.fillRect(s.tx * T + 3, s.ty * T + 3, 5, 5); } } // the things in view
      ctx.globalAlpha = 0.5 * dark; ctx.drawImage(ncan, nx0, ny0); ctx.globalAlpha = 1;
    }
    // Design 15 C2: a thunderstorm's shadow, drawn over the ground and under everything that stands on it.
    for (const c of w.storms) {
      const sx = lerpPos(c.px, c.x, k), sy = lerpPos(c.py, c.y, k), r = w.C.P.storm.radius;
      if (sx + r < vx0 || sx - r > vx1 || sy + r < vy0 || sy - r > vy1) continue;
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = art.night;
      for (let ring = r; ring > 4; ring -= 6) ctx.fillRect(Math.round(sx - ring), Math.round(sy - ring / 2), Math.round(ring * 2), Math.round(ring));
      ctx.globalAlpha = 1;
    }
    for (const tw of w.twisters) {
      const tx = lerpPos(tw.px, tw.x, k), ty = lerpPos(tw.py, tw.y, k);
      ctx.fillStyle = '#9a9aa6';
      for (let i = 0; i < 7; i++) { const ww = 12 - i * 1.5, ox = Math.sin(time * 9 + i) * 2; ctx.fillRect(Math.round(tx - ww / 2 + ox), Math.round(ty - 14 + i * 2), Math.round(ww), 2); }
    }
    if (w.rainT > 0) { // 70 streaks over the part of the world in view
      const rx = Math.max(0, vx0), ry = Math.max(0, vy0), rw = Math.min(W, vx1) - rx, rh = Math.min(H, vy1) - ry;
      ctx.fillStyle = art.rain; for (let i = 0; i < 70; i++) ctx.fillRect((rx + rand() * rw) | 0, (ry + rand() * rh) | 0, 1, 3);
    }
    let bolts = 0; // Smite on an army: only bolts in view, at most 300, drawn over the part of the sky in view
    for (let j = 0; j < w.fxN; j++) {
      const f = w.fx[j];
      if (f.type === 'arrow') { ctx.strokeStyle = f.col || '#f4f4f0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(f.x, f.y); ctx.lineTo(f.x2, f.y2); ctx.stroke(); }
      else if (f.type === 'boom') {
        const g = Math.max(0, Math.min(1, 1 - age(f) / 0.45)), r = Math.round(f.r * g);
        ctx.globalAlpha = 1 - g; ctx.fillStyle = f.col || '#f28c2a';
        ctx.fillRect(f.x - r, f.y - r + 3, r * 2, r * 2 - 6); ctx.fillRect(f.x - r + 3, f.y - r, r * 2 - 6, r * 2); ctx.globalAlpha = 1;
      } else if (f.type === 'beam') { ctx.globalAlpha = Math.min(1, (0.5 * age(f)) / 0.6); ctx.fillStyle = '#7be04a'; ctx.fillRect(f.x - 3, f.y - 9, 6, 10); ctx.fillRect(f.x - 4, f.y, 8, 1); ctx.globalAlpha = 1; }
      else if (f.type === 'huh' || f.type === 'warn') mark(art.glyphs[f.type], f.x, f.y);
      else if (f.type === 'block') { ctx.fillStyle = PAL.c; ctx.fillRect(f.x - 2, f.y, 4, 1); ctx.fillRect(f.x, f.y - 2, 1, 5); }
      else if (f.type === 'heart') { heartRef = heartRef || atlasRef('heart'); ctx.drawImage(ATL, heartRef.sx, heartRef.sy, 8, 8, Math.round(f.x) - 3, Math.round(f.y - (1 - age(f)) * 6), 6, 6); }
      else if (f.type === 'bolt') {
        if (f.x < vx0 - m || f.x > vx1 + m || f.y < vy0 - m || ++bolts > 300) continue;
        ctx.fillStyle = flick ? '#fff' : PAL.y;
        const y0 = Math.max(0, Math.floor(vy0 / 3) * 3), y1 = Math.min(f.y, vy1 + 3); // from a multiple of 3: the same zigzag
        if (far) ctx.fillRect(f.x, y0, 2, y1 - y0);
        else for (let y = y0; y < y1; y += 3) ctx.fillRect(f.x + ((tileHash(y, Math.floor(f.t * 20), 7) * 7) | 0) - 3, y, 2, 3);
        ctx.fillRect(f.x - 5, f.y - 1, 11, 2);
      }
    }
    if (ui && ui.pour) drawPourHint(w, ui); // the first pour on a device (15 A2)
    if (ui && ui.spark) drawSpark(ui); // the Because sparkle, over the night too: it is asking to be tapped
    if (ui && ui.held) drawHeld(w, ui); // over everything, night included: it is in the player's hand
  }

  // The first time a finger pours (15 A2): a short dotted trail ahead of it, for one second, so a child sees
  // that dragging now lays them down. No words, shown once per device.
  function drawPourHint(w, ui) {
    const age = ui.now - ui.pour.t0, life = ui.U.pourHintMs;
    if (age > life) { ui.pour = null; return; }
    const held = ui.pourAt || null;
    const [px, py] = held || [w.W / 2, w.H / 2];
    ctx.globalAlpha = Math.max(0, 1 - age / life);
    ctx.fillStyle = PAL.y;
    for (let i = 1; i <= 4; i++) ctx.fillRect(Math.round(px) + i * 6, Math.round(py) - 1, 2, 2);
    ctx.globalAlpha = 1;
  }

  // The Because sparkle (14 §4): a twinkle at the place something happened, lingering ui.because.sparkMs and
  // fading out over its last second. Two sizes, a quarter second apart, so it catches the eye without moving.
  function drawSpark(ui) {
    const s = ui.spark, age = ui.now - s.t0;
    if (age > s.ms) { ui.spark = null; return; }
    const x = Math.round(s.x), y = Math.round(s.y) - 10, r = Math.floor(age / 250) % 2 ? 3 : 2;
    ctx.globalAlpha = age > s.ms - 1000 ? Math.max(0, (s.ms - age) / 1000) : 1;
    ctx.fillStyle = PAL.w;
    ctx.fillRect(x, y - r, 1, r * 2 + 1);
    ctx.fillRect(x - r, y, r * 2 + 1, 1);
    ctx.fillStyle = PAL.y;
    ctx.fillRect(x, y, 1, 1);
    ctx.globalAlpha = 1;
  }

  // A head piece with no hand-drawn version for the field (design 14 §7 T10 brings forty of them): the top rows of
  // its own 8x8 picture, drawn where a hat sits. Hat sprites are drawn in their top half, so this lands on the head.
  const headCans = {};
  function headPiece(id) {
    let can = headCans[id];
    if (can === undefined) { const g = gearOf(id); can = headCans[id] = g ? sprite(g.spr || g.id, g.over) : null; }
    if (can) ctx.drawImage(can, 0, 0, 8, 5, -4, -12, 8, 5);
  }
  const gearOf = (id) => { const list = art.gearById; return list ? list[id] : null; };

  // A creature with the interface's marks: a poke's hop (a half sine over ui.pokeMs) and the eraser's outline.
  function drawMarked(w, e, sel, k, time, lag, ui) {
    const h = w.slotH[e], t0 = ui.pokes.get(h), o = ui.outlines.get(h), U = ui.U;
    const hop = t0 !== undefined && ui.now - t0 < U.pokeMs ? Math.round(U.pokeHop * Math.sin((Math.PI * (ui.now - t0)) / U.pokeMs)) : 0;
    drawEnt(w, e, sel, k, time, lag, hop, !!(o && o.until > ui.now));
    const y = ui.why && ui.why.get(h);
    if (y) drawWhy(w, e, y, k, hop, ui);
  }
  // The reason a creature has just changed what it is doing (14 §4.2): its picture over its head for a second,
  // rising a little as it goes, so a child sees the wolf the sheep is running from.
  function drawWhy(w, e, mark, k, hop, ui) {
    const age = ui.now - mark.t0;
    if (age > ui.U.because.whyMs) return;
    const icon = w.C.icons[mark.icon], can = icon && sprite(icon.spr, icon.over);
    if (!can) return;
    const E = w.E, rise = Math.min(4, Math.floor(age / 200));
    const x = Math.round(lerpPos(E.px[e], E.x[e], k)) - 4, y = Math.round(lerpPos(E.py[e], E.y[e], k)) - 18 - hop - rise;
    // On its own plaque, with a little stem down to the head: a wolf's face floating over a sheep otherwise reads
    // as a second wolf standing behind it (looked at, Sep 19).
    ctx.fillStyle = PAL.l; ctx.fillRect(x - 2, y - 2, 12, 12);
    ctx.fillStyle = PAL.k; ctx.fillRect(x - 1, y - 1, 10, 10); ctx.fillRect(x + 3, y + 10, 2, 2);
    ctx.drawImage(can, x, y);
  }
  // The creature in the hand, drawn at the finger and lifted, with its shadow where it would land.
  function drawHeld(w, ui) {
    const x = Math.round(ui.held.x), y = Math.round(ui.held.y);
    if (ui.held.item) { // a loose item: its picture, lifted, with its shadow
      const r = thingOf(w.C.BLD['item:' + ui.held.item])[0];
      ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - 3, y, 6, 1);
      ctx.drawImage(ATL, r.sx, r.sy, 8, 8, x - 4, y - 8 - ui.U.heldLift, 8, 8);
      return;
    }
    const e = ent(w, ui.held.h);
    if (e < 0) return;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(x - 3, y, 6, 1);
    drawEnt(w, e, -1, 1, w.time, 0, ui.U.heldLift, false, [x, y]);
  }

  // A 3x5 mark from art.glyphs, centred on (x, y), outlined so it reads on grass, snow and water alike.
  function mark(g, x, y) {
    const x0 = Math.round(x) - 1, y0 = Math.round(y) - 2;
    ctx.fillStyle = art.glyphs.outline;
    g.px.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') ctx.fillRect(x0 + i - 1, y0 + j - 1, 3, 3); });
    ctx.fillStyle = g.col;
    g.px.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[i] === '#') ctx.fillRect(x0 + i, y0 + j, 1, 1); });
  }

  return { resize, animate, frame, stats };
}
