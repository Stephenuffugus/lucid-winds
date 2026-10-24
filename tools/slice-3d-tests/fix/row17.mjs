/* SUPER SLICE 3D — headless assertion suite (2026-08-16 audit)
 *
 * Run:  node satellites/slice-3d/audit-check.mjs [baseUrl]
 *       default base is http://localhost:8777 — serve the REPO ROOT, not this
 *       folder, or /arcade-exit.js and /feedback.js 404 and the exit checks
 *       fail for the wrong reason.
 *
 * ⛔ NEVER wait on networkidle here. This page streams a 600KB three.js and keeps
 *    a rAF loop running forever, so networkidle never fires and a probe built on
 *    it reports a perfectly healthy page as dead. domcontentloaded + settle.
 *
 * ⛔ Every assertion below was watched FAIL on purpose before it was trusted. A
 *    probe you have not seen go red is decoration. The first draft of the play
 *    check broke its stepping loop the moment G.done flipped, which is 2.4s before
 *    finishLevel() fires, and confidently reported "the end screen never shows".
 */
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:8777';
const URL = BASE + (process.env.PAGE || '/satellites/slice-3d/') + '?dev=1';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

/* ⛔ ONE BROWSER PER CASE, not one browser with twenty contexts.
   This page builds a real WebGL context and pulls in 600KB of three.js on every
   boot. Reusing a single browser across ~20 of those on a 2-core box exhausts it:
   the run got through the whole corrupt-save phase and then died on a 30s
   NAVIGATION timeout — which looks exactly like "the game stopped loading" and is
   nothing of the kind. Launch, use, close. Slower, and it actually finishes.
   Navigation timeout is raised to 60s for the same reason: a slow box is not a
   broken page. */
const LAUNCH = {
  headless: 'new', protocolTimeout: 300000,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
};
async function boot(poison) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  if (poison) await p.evaluateOnNewDocument(poison);
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}

async function bootAt(w, h) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx: { close: () => browser.close() }, p, errs };
}
async function clickCentre(p, sel) {   // a real pointer at the control's centre (never el.click(): that proves nothing)
  const c = await p.evaluate(s => { const b = document.querySelector(s).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; }, sel);
  await p.mouse.click(c.x, c.y);
}

/* ---- 17. Part D: world verbs (SS01, SS03, SS07, SS08, SS09, SS11, SS14, SS05 as a flag). Each verb takes ONE host
   segment's slot and draws its rng() unchanged: built with the verbs off, the same dive differs only by that host's own
   pieces. Every verb is driven through _S3 to its award exactly once, and a knife held inside a part for ten steps is one
   stage (Astra's "repeated hits" contract). Deep Tide's bumpers wear a jellyfish, Wall Climb's banners pay their slivers
   into the run's one payout, Glowcave's crystals never strobe. */
console.log('\n[17] Part D: one verb per world');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const key = e => [e.x || 0, e.y || 0, e.w || e.r || 0, e.h || 0].map(v => Math.round(v * 1000)).join(',');
    const lists = () => { const W = S.world(), o = {}; for (const n of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns']) o[n] = (W[n] || []).map(key); o.floor = W.floorY; return o; };
    out.layout = {};
    for (const lvl of [1, 6, 11, 21, 26, 31, 36]) {
      S.salt(77); S.verbsOff(true); S.newFF(lvl); const A = lists();
      S.salt(77); S.verbsOff(false); S.newFF(lvl); const B = lists(), d = [];
      if (lvl === 6) out.iceAsks = S.asked('fx/ice_crack.webp');   // the ice's crack and its shattered cell, asked as it is built
      if (lvl === 11) out.loafAsks = S.asked('fx/slab_dust.webp');
      for (const n in A) { if (n === 'floor') continue; const bs = new Set(B[n]), as = new Set(A[n]);
        const gone = A[n].filter(k => !bs.has(k)).length, added = B[n].filter(k => !as.has(k)).length; if (gone || added) d.push(n + '-' + gone + '+' + added); }
      out.layout[lvl] = { kinds: S.verbs().map(v => v.kind).filter((k, i, a) => a.indexOf(k) === i).join(','), d: d.join(' '), floor: A.floor === B.floor,
        jelly: S.world().pads.filter(q => q.jelly).length, pads: S.world().pads.length };
    }
    const fall = (x, y, ang, vy) => { const G = S.g(); G.x = x; G.y = y; G.vx = 0; G.vy = vy == null ? -8 : vy; G.w = 0; G.ang = ang; S.hold(0); };
    let V, G;
    S.salt(77); S.newFF(21); V = S.verbs(); G = S.g();
    for (let i = 0; i < 5; i++) { const t = V[i]; if (t.done) continue; fall(t.x, t.top + 1.2, Math.PI / 2); for (let n = 0; n < 30 && !t.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } }
    out.chime = { cut: V.filter(t => t.done).length, log: S.verbLog().chime || 0 };
    S.salt(77); S.newFF(21); V = S.verbs(); G = S.g(); const t2 = V[2];
    for (let n = 0; n < 10; n++) { G.x = t2.x; G.y = t2.top - 0.4; G.vx = 0; G.vy = -0.5; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    out.chimeHold = { done: !!t2.done, log: S.verbLog().chime || 0 };
    /* the lantern line met as in play: the knife falls blade down at its terminal 19 u/s with the camera chasing it (settled
       for 1.5 s first, then lagging as it does in a real fall). One cut pays once; the chain holds LANTERN_DELAY; every
       lantern falls a little and bursts inside the frame (the first cut of v6.4 burst them 17 u above the knife, off the top
       of the screen, so only the sound was ever met) */
    S.salt(77); S.newFF(26); V = S.verbs(); G = S.g(); const rp = V[0], lan = rp.grp.lan, ly0 = lan.map(l => l.y), seen = [], ky0 = rp.y + 6;
    for (let n = 0; n < 180; n++) { G.x = 1.65; G.y = ky0; G.vx = 0; G.vy = -19; G.ang = Math.PI / 2; G.w = 0; S.hold(0); S.stepN(1, D); }
    G.y = ky0; let cutT = null, held = true;
    for (let n = 0; n < 420 && !lan.every(l => l.out) && !G.done; n++) {
      G.x = 1.65; G.vx = 0; G.vy = -19; G.ang = Math.PI / 2; G.w = 0;
      const was = lan.map(l => l.out); S.stepN(1, D);
      if (rp.done && cutT === null) cutT = G.t;
      if (cutT === null) continue;
      lan.forEach((l, j) => {
        if (!l.out && G.t - cutT < 0.11 && l.y !== ly0[j]) held = false;
        if (l.out && !was[j]) { const q = S.proj(l.x, l.y, 0.3); seen.push({ j, ndcY: +q[1].toFixed(2), above: +(l.y - G.y).toFixed(1), fell: l.y < ly0[j] }); }
      });
    }
    out.lantern = { cut: !!rp.done, log: S.verbLog().lantern || 0, held, n: seen.length, seen, inFrame: seen.length === 5 && seen.every(s => s.ndcY < 0.9 && s.ndcY > -1), fell: seen.every(s => s.fell) };
    S.salt(77); S.newFF(6); V = S.verbs(); G = S.g(); const ic = V[0];
    fall(ic.x, ic.y + ic.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && ic.stage < 1; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    const st1 = ic.stage;
    for (let n = 0; n < 10; n++) { G.x = ic.x; G.y = ic.y + 0.5; G.vx = 0; G.vy = -0.2; G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }   // just above the middle: the blade faces in
    const stHold = ic.stage;
    /* then the path a player takes: a blade down fall at full speed with no input cracks it, lands BLADE first on the bumper
       (a half turn takes 0.64 s, the bumper is 0.33 s away), goes back up and shatters it; the bumper breaks with it and the
       knife falls on through. The first cut of v6.4 chipped here, and this row reached its second pass only by setting the
       knife handle down on the bumper. */
    S.salt(77); S.newFF(6); V = S.verbs(); G = S.g(); const ic2 = V[0], pad2 = S.world().pads.find(q => q.ice === ic2);
    G.x = ic2.x; G.y = ic2.y + 4.5; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); let up2 = false, chipsAt = null;
    for (let n = 0; n < 240 && !G.done && (ic2.stage < 2 || G.y > pad2.y); n++) { S.stepN(1, D); if (G.vy > 0) up2 = true; if (ic2.stage === 2 && chipsAt === null) chipsAt = G.chips || 0; }
    out.ice = { st1, stHold, up: up2, stage: ic2.stage, log: S.verbLog().ice || 0, chips: chipsAt, chipsPast: G.chips || 0, padGone: !!(pad2 && pad2.gone),
      drawnGone: !!pad2 && pad2.mesh.every(m => !m.parent), through: !!pad2 && G.y < pad2.y, failed: !!G.failed };
    S.salt(77); S.newFF(11); V = S.verbs(); G = S.g(); const lf = V[0];
    fall(lf.x, lf.y + lf.h / 2 + 1.7, Math.PI / 2); for (let n = 0; n < 20 && !lf.done; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    for (let n = 0; n < 10; n++) { G.x = lf.x; G.y = lf.y + 0.5; G.vy = -0.2; G.ang = Math.PI / 2; S.stepN(1, D); }
    out.loaf = { cut: !!lf.done, log: S.verbLog().loaf || 0 };
    /* the loaf's collider is the bread drawn: a knife over a corner of its first cut's box, where no bread is, is not touched */
    S.salt(77); S.newFF(11); V = S.verbs(); G = S.g(); const lc = V[0], lcx = lc.x + (lc.x > 0 ? -3.3 : 3.3);
    for (let n = 0; n < 4; n++) { G.x = lcx; G.y = lc.y + 2.3; G.vx = 0; G.vy = 0; G.w = 0; G.ang = -Math.PI / 2; S.hold(0); S.stepN(1, D); }
    out.loafCorner = { moved: +(G.x - lcx).toFixed(3), cut: !!lc.done };
    /* a knife in the lane between a wall side loaf and the wall: one bonk, never pushed past where it can be by the wall (the
       first cut of v6.4 pushed it out of the shaft, the wall pushed it back, and it bonked again every step, 17 in a row) */
    S.salt(77); S.newFF(11); V = S.verbs(); G = S.g(); const lw = V[0]; lw.x = 5.7; lw.mesh.position.x = 5.7;
    const sfx = S.sfx, wood0 = sfx.wood; let woods = 0, maxX = 0; sfx.wood = function () { woods++; return wood0.apply(this, arguments); };
    G.x = 8.3; G.y = lw.y + 4; G.vx = 0; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0);
    try { for (let n = 0; n < 60 && !G.done; n++) { S.stepN(1, D); maxX = Math.max(maxX, G.x); } } finally { sfx.wood = wood0; }
    out.loafWall = { woods, maxX: +maxX.toFixed(3), failed: !!G.failed, below: G.y < lw.y - 3 };
    function climbPay(rip) { const F = window._S3forge; S.newClimb(1); const g = S.g(), bns = S.verbs();
      if (rip) for (let n = 0; n < 10; n++) { g.x = bns[0].x0 - 0.6; g.y = bns[0].y; g.vx = 0; g.vy = 0; g.w = 0; S.stepN(1, D); }
      const bonus = g.slivBonus || 0, log = S.verbLog().banner || 0; g.done = true; g.doneT = 3; g.mult = 2; g.stuckY = 3; g.score = 0;
      const s0 = F.sliv(); S.finishLevel(); return { n: bns.length, bonus, log, paid: F.sliv() - s0 }; }
    out.banner = climbPay(true); out.plain = climbPay(false); out.ropeAsked = S.asked('fx/rope_cut.webp');
    S.salt(5); S.newFF(16); const cr = S.world().crystals.filter(c => c.mesh); const look = () => cr.map(c => { const m = c.mesh.material; return [m.color.getHex(), m.emissive ? m.emissive.getHex() : 0, m.opacity, c.mesh.visible, c.mesh.scale.y].join(':'); }).join('|');
    const l0 = look(); G = S.g(); for (let n = 0; n < 120; n++) { G.x = 0; G.vx = 0; S.stepN(1, D); } out.crystals = { n: cr.length, same: look() === l0 };
    /* Endless: a band's verb takes the band's first host slot, chunk by chunk. Seed 47 opens in Glowcave, so 300 to 600 m is
       Orchard Loft, whose middle chunk has no branch below its top 12 m: the first cut of v6.4 (middle chunk only) left that
       band without its chime, as it did 29 in 100 chime and lantern bands */
    S.salt(47); S.newEndless(); G = S.g(); G.x = 0; G.y = 4 - 400 - 2; G.vx = 0; G.vy = -1; S.stepN(3, D);   // the first frame after a new dive only sets the clock
    const bandV = S.verbs().filter(v => v.ck >= 3 && v.ck <= 5);
    out.endless = { live: (S.endless() || {}).live, kinds: bandV.map(v => v.kind).filter((k, i, a) => a.indexOf(k) === i).join(','), ck: bandV.length ? bandV[0].ck : null };
    /* SS05's constant follows the band the knife is in: seed 47's Deep Tide band is 900 to 1200 m (the dive opened in Glowcave) */
    const dg0 = S.deepGrav(); S.deepGrav(9); G = S.g(); G.y = -10; const gTop = S.grav(); G.y = 4 - 1000; const gDeep = S.grav(); G.y = 4 - 1300; const gPast = S.grav(); S.deepGrav(dg0);
    out.grav = { gTop, gDeep, gPast };
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.layout || {};
  ok('each world builds its verb in one host slot and nothing else in the dive moves', !!L[6] && L[1].kinds === '' && L[1].d === '' && L[31].d === '' && L[36].d === ''
    && L[6].kinds === 'ice' && L[6].d.split(' ').sort().join(' ').replace(/slabs-\d+\+0/, 'S') === 'pads-0+1 S'
    && L[11].kinds === 'loaf' && /^slabs-\d+\+0$/.test(L[11].d) && L[21].kinds === 'tube' && /^items-\d\+0$/.test(L[21].d)
    && L[26].kinds === 'rope' && /^items-\d\+0$/.test(L[26].d) && [1, 6, 11, 21, 26, 31, 36].every(l => L[l].floor), JSON.stringify(r.layout || r));
  ok('the chime: five cuts pay once; held inside a tube for ten steps it rings once', !!r.chime && r.chime.cut === 5 && r.chime.log === 1 && r.chimeHold.done && r.chimeHold.log === 0, JSON.stringify({ c: r.chime, h: r.chimeHold }));
  ok('the lantern line met at full speed: one cut pays once, the chain holds, then all five fall and burst inside the frame', !!r.lantern && r.lantern.cut && r.lantern.log === 1 && r.lantern.held && r.lantern.fell && r.lantern.inFrame, JSON.stringify(r.lantern));
  ok('the ice parcel: a crack that holds through ten steps inside; a plain blade down fall cracks it, the bumper throws it back up, it shatters, the bumper goes, no chip', !!r.ice && r.ice.st1 === 1 && r.ice.stHold === 1 && r.ice.up && r.ice.stage === 2 && r.ice.log === 1 && r.ice.chips === 0 && r.ice.chipsPast === 0 && r.ice.padGone && r.ice.drawnGone && r.ice.through && !r.ice.failed, JSON.stringify(r.ice));
  ok('the accordion loaf: one cut pays once', !!r.loaf && r.loaf.cut && r.loaf.log === 1, JSON.stringify(r.loaf));
  ok('the loaf is touched only where its bread is drawn (a knife over its old box corner passes)', !!r.loafCorner && r.loafCorner.moved === 0 && !r.loafCorner.cut, JSON.stringify(r.loafCorner));
  ok('a knife between a wall side loaf and the wall: one bonk (and the wall bounce), never pushed past the wall', !!r.loafWall && r.loafWall.woods >= 1 && r.loafWall.woods <= 2 && r.loafWall.maxX <= 8.49 && !r.loafWall.failed && r.loafWall.below, JSON.stringify(r.loafWall));
  ok('Wall Climb: a banner every five bands, ripped once for +5 slivers, paid with the run', !!r.banner && r.banner.n === 6 && r.banner.bonus === 5 && r.banner.log === 1 && r.banner.paid - r.plain.paid === 5, JSON.stringify({ b: r.banner, p: r.plain }));
  ok("Deep Tide's bumpers wear a jellyfish, no other world's do", !!L[31] && L[31].pads > 0 && L[31].jelly === L[31].pads && [1, 6, 11, 21, 26, 36].every(l => L[l].jelly === 0), JSON.stringify(L[31]));
  ok("Glowcave's crystals never strobe", !!r.crystals && r.crystals.n > 0 && r.crystals.same, JSON.stringify(r.crystals));
  ok('each verb asks for the strip it plays as it is built (the ice, the loaf, a Wall Climb banner its rope cut)', r.iceAsks === true && r.loafAsks === true && r.ropeAsked === true, JSON.stringify({ ice: r.iceAsks, loaf: r.loafAsks, rope: r.ropeAsked }));
  ok('Endless: a band whose middle chunk has no host still gets its verb', !!r.endless && r.endless.kinds === 'tube', JSON.stringify(r.endless));
  ok("Endless: Deep Tide's fall constant follows the band the knife is in, not the dive's first world", !!r.grav && r.grav.gTop === 21 && r.grav.gDeep === 9 && r.grav.gPast === 21, JSON.stringify(r.grav));
  /* the strips honour the settings: reduced motion shows one cell that only fades (never the burst's growth), fewer
     particles plays one strip at a time */
  let fx; try { fx = await p.evaluate(async () => {
    const S = window._S3, st = S.set(), keep = [st.rm, st.rp], D = 1000 / 120, out = {};
    S.salt(77); S.newFF(21); window._S3skiprender = true; st.rm = false; st.rp = false;
    const t0 = performance.now(); while (S.fxCount() === 0 && performance.now() - t0 < 8000) { S.fxBurst('chime_ring', 0, -20, 7); if (!S.fxCount()) await new Promise(q => setTimeout(q, 100)); }
    out.loaded = S.fxCount() > 0; const G = S.g(); const pin = () => { G.x = 0; G.y = 4; G.vx = 0; G.vy = 0; };
    for (let n = 0; n < 60; n++) { pin(); S.stepN(1, D); }
    st.rm = true; S.fxBurst('chime_ring', 0, -20, 7); const a = S.fx()[0]; pin(); S.stepN(4, D); const b = S.fx()[0]; pin(); S.stepN(12, D); const c = S.fx()[0];
    out.rm = { a, b, c, still: !!(a && b && c) && a.still && a.off === b.off && b.off === c.off && c.op < b.op && b.op < 1 };
    for (let n = 0; n < 60; n++) { pin(); S.stepN(1, D); } st.rm = false; st.rp = true;
    S.fxBurst('chime_ring', 0, -20, 7); S.fxBurst('chime_ring', 2, -20, 7); S.fxBurst('chime_ring', -2, -20, 7); out.rpN = S.fxCount();
    for (let n = 0; n < 60; n++) { pin(); S.stepN(1, D); } st.rp = false;
    S.fxBurst('chime_ring', 0, -20, 7); S.fxBurst('chime_ring', 2, -20, 7); out.fullN = S.fxCount(); const f0 = S.fx()[0]; for (let n = 0; n < 14; n++) { pin(); S.stepN(1, D); } out.moves = !!f0 && !!S.fx()[0] && S.fx()[0].off !== f0.off;
    /* the ice shatters into Astra's own shattered block (ice_crack's third cell), held where the block was, then gone */
    S.salt(77); S.newFF(6); await new Promise(q => setTimeout(q, 2500)); S.salt(77); S.newFF(6);
    const ic = S.verbs()[0], G6 = S.g(); G6.x = ic.x; G6.y = ic.y + 4.5; G6.vx = 0; G6.vy = -19; G6.w = 0; G6.ang = Math.PI / 2; S.hold(0);
    for (let n = 0; n < 240 && ic.stage < 2 && !G6.done; n++) S.stepN(1, D);
    const h = S.fx().filter(f => f.hold); out.shatterCell = { stage: ic.stage, held: h.length, off: h.length ? +h[0].off.toFixed(4) : null };
    for (let n = 0; n < 60; n++) S.stepN(1, D); out.shatterCell.after = S.fx().filter(f => f.hold).length;
    st.rm = keep[0]; st.rp = keep[1]; S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { fx = { error: String(e).slice(0, 200) }; }
  ok('effect strips: reduced motion shows one still cell that fades; fewer particles plays one strip at a time', !!fx.loaded && !!fx.rm && fx.rm.still && fx.rpN === 1 && fx.fullN === 2 && fx.moves, JSON.stringify(fx));
  ok("the ice shatters into Astra's shattered block, held where it was, then gone", !!fx.shatterCell && fx.shatterCell.stage === 2 && fx.shatterCell.held === 1 && fx.shatterCell.off === +(2 / 3).toFixed(4) && fx.shatterCell.after === 0, JSON.stringify(fx.shatterCell));
  ok('no page errors through the verbs', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
