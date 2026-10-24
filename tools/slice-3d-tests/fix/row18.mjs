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

/* ---- 18. Part E1: the stack by the wall, and slivers paid once ------------- */
console.log('\n[18] Part E1: a stack bonks once per contact; a run\'s slivers settle once');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, F = window._S3forge, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const RC = S.reach(), reachX = a => RC.KLEN * Math.abs(Math.cos(a)) + RC.KHH * Math.abs(Math.sin(a));
    /* a stack is found by its slabs (one x, 1.32 apart), not by anything Part E added, so these checks run on v6.4 as well
       and go red there; the dive is cleared of everything else round the stack, so the only wood is the stack's and the
       wall's */
    const stackOf = W => { const col = {}; W.slabs.forEach(s => { const k = s.x.toFixed(3); (col[k] = col[k] || []).push(s); });
      for (const k in col) { const a = col[k].sort((u, v) => v.y - u.y); if (a.length >= 7 && a.every((s, i) => i === 0 || Math.abs(a[i - 1].y - s.y - 1.32) < 1e-6)) return a; } return null; };
    const clearRound = (W, keep, lo, hi) => { const away = e => !(e.y > lo && e.y < hi);
      for (const n of ['items', 'crystals', 'pads', 'wasps', 'planks', 'thorns', 'verbs']) W[n] = (W[n] || []).filter(away);
      W.slabs = W.slabs.filter(s => keep.indexOf(s) >= 0 || away(s)); };
    const setUp = x => { S.salt(77); S.newFF(1); const W = S.world(), st = stackOf(W); if (!st) return null;
      clearRound(W, st, st[st.length - 1].y - 12, st[0].y + 12);
      st.forEach(s => { s.x = x; if (s.mesh) s.mesh.position.x = x; if (s.gline) s.gline.position.x = x; }); return st; };
    const woodsDuring = f => { const sfx = S.sfx, w0 = sfx.wood; let n = 0; sfx.wood = function () { n++; return w0.apply(this, arguments); }; try { f(); } finally { sfx.wood = w0; } return n; };
    /* the lane by a wall side stack (x 5.7, the furthest out a stack is placed), both walls: narrower than the knife, so v6.0
       to v6.4 bonked a handle down knife there every step, out to 8.9 against the wall's 8.485, and the wall threw it back */
    out.lane = [1, -1].map(side => { const st = setUp(side * 5.7); if (!st) return null; const G = S.g(), bot = st[st.length - 1].y; let maxX = 0;
      G.x = side * 8.3; G.y = st[0].y + 4; G.vx = 0; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0);
      const woods = woodsDuring(() => { for (let n = 0; n < 240 && !G.done && G.y > bot - 4; n++) { S.stepN(1, D); maxX = Math.max(maxX, side * G.x); } });
      return { n: st.length, woods, maxX: +maxX.toFixed(3), failed: !!G.failed, below: G.y <= bot - 4 }; });
    /* the same lane with the knife tilted (240 degrees by the left wall, 300 by the right), sliding down the wall at its own
       reach: never past the wall's reach for its OWN angle at any step (a clamp written with the upright reach, KHH or KR,
       passes the upright case and puts this knife up to 1.5 u into the rock) */
    out.tilt = [[-1, 240], [1, 300]].map(([side, deg]) => { const st = setUp(side * 5.7); if (!st) return null; const G = S.g(), bot = st[st.length - 1].y; let over = -9;
      G.ang = deg * Math.PI / 180; G.x = side * (9.2 - reachX(G.ang) - 0.02); G.y = st[0].y + 4; G.vx = 0; G.vy = -19; G.w = 0; S.hold(0);   /* sliding down the wall at its own reach */
      for (let n = 0; n < 240 && !G.done && G.y > bot - 4; n++) { S.stepN(1, D); if (!G.done) over = Math.max(over, Math.abs(G.x) - (9.2 - reachX(G.ang))); }
      return { over: +over.toFixed(3), failed: !!G.failed, below: G.y <= bot - 4 }; });
    /* the clamped bonk holds the stack's contact open while the knife stays in the lane (no bonk every step), and the contact
       ends once the knife has left the stack: back beside it, it bonks again (moved by hand: a test of the contact's life) */
    { const st = setUp(5.7), G = S.g();
      G.x = 8.3; G.y = st[0].y + 4; G.vx = 0; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0);
      const first = woodsDuring(() => { for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); });
      const held = woodsDuring(() => { for (let n = 0; n < 6; n++) { G.x = 8.3; G.vx = 0; G.ang = -Math.PI / 2; G.w = 0; S.stepN(1, D); } });
      for (let n = 0; n < 4; n++) { G.x = 0; G.vx = 0; S.stepN(1, D); }
      G.x = 8.3; G.vx = 0; G.vy = -19;
      const again = woodsDuring(() => { for (let n = 0; n < 6 && !G.done; n++) { G.ang = -Math.PI / 2; G.w = 0; S.stepN(1, D); } });
      out.again = { first, held, again, y: +(G.y - st[st.length - 1].y).toFixed(2) }; }
    /* a cut never opens a contact: a handle down knife drifting into a stack's side cuts the slab above its middle and is
       bonked off the one below, as it always was (a rule that let any cut start the contact would let it slide into the
       column unbonked) */
    { const st = setUp(0), G = S.g(), c0 = G.slices; let x = null;
      G.x = 4.2; G.y = st[3].y - 0.4; G.vx = -8; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0);
      const woods = woodsDuring(() => { for (let n = 0; n < 60 && !G.done; n++) { G.ang = -Math.PI / 2; G.w = 0; S.stepN(1, D); if (G.vx > 0) { x = +G.x.toFixed(3); break; } } });
      out.side = { woods, sliced: G.slices - c0, x }; }
    /* a gate (one slab stacks 1.4 u apart): a handle down knife falling into the gap between its two inner slabs is bonked out
       of them, never carried inside a slab's body, and never past the wall (the review's first cut of E1 held every bonk's
       contact open and carried this knife up to 0.57 u into a slab; v6.4 and the shipped rule bounce it as before) */
    { S.salt(77); S.newFF(7); const W = S.world(), byY = {};
      W.slabs.forEach(s => { const k = s.y.toFixed(3); (byY[k] = byY[k] || []).push(s); });
      let gate = null; for (const k in byY) { const a = byY[k]; if (a.length === 3 && a.every(s => [7.2, 2.4].some(v => Math.abs(Math.abs(s.x) - v) < 0.01))) { gate = a; break; } }
      if (gate) { const gx = [-7.2, -2.4, 2.4]; gate.sort((u, v) => u.x - v.x).forEach((s, i) => { s.x = gx[i]; if (s.mesh) s.mesh.position.x = s.x; if (s.gline) s.gline.position.x = s.x; });
        clearRound(W, gate, gate[0].y - 12, gate[0].y + 12);
        const G = S.g(); let over = -9, deep = 0, inner = gate.filter(s => Math.abs(s.x) < 3); G.x = 0; G.y = gate[0].y + 4; G.vx = 0; G.vy = -19; G.w = 0; G.ang = -Math.PI / 2; S.hold(0);
        for (let n = 0; n < 240 && !G.done && G.y > gate[0].y - 4; n++) { S.stepN(1, D); if (G.done) break; over = Math.max(over, Math.abs(G.x) - (9.2 - reachX(G.ang)));
          inner.forEach(s => { if (!s.cut && Math.abs(G.x - s.x) < s.w / 2 - 0.4 && Math.abs(G.y - s.y) < s.h / 2 + 1.5) deep++; }); }
        out.gate = { failed: !!G.failed, below: G.y <= gate[0].y - 4, over: +over.toFixed(3), deep }; } else out.gate = null; }
    /* SS27: a run's slivers (and its Sunbeams, clean dive, trophy counts) settle once, by its run id */
    const sb = { n: 0 }, sbKeep = window._sbCapEarn; window._sbCapEarn = function () { sb.n++; return 2; };
    const sun = () => document.getElementById('go-sun').textContent, goOn = () => document.getElementById('s-go').classList.contains('on');
    const endDive = failed => { const G = S.g(); G.done = true; G.failed = !!failed; G.doneT = 3; G.mult = 2; G.stuckY = 0; G.score = 450; G.chips = 0; return G.runId; };
    try {
      S.salt(5); S.newFF(1); const id = endDive(false), keys = [], setI = Storage.prototype.setItem;
      Storage.prototype.setItem = function (k, v) { keys.push([k, String(v)]); return setI.apply(this, arguments); };
      const s0 = F.sliv(), c0 = S.prog().cleanDives || 0; try { S.finishLevel(); } finally { Storage.prototype.setItem = setI; }
      const s1 = F.sliv(), line1 = sun(); document.getElementById('s-go').classList.remove('on'); S.finishLevel(); const s2 = F.sliv();
      const iProg = keys.findIndex(([k, v]) => k === 's3d_prog' && v.indexOf(id) >= 0), iSliv = keys.findIndex(([k]) => k === 's3d_slivers');
      out.twice = { id, paid: s1 - s0, again: s2 - s1, sameLine: line1 === sun(), shown: goOn(), clean: (S.prog().cleanDives || 0) - c0, sunbeams: sb.n,
        ledgerFirst: iProg >= 0 && iSliv > iProg, onDisk: (JSON.parse(localStorage.getItem('s3d_prog')).settled || []).indexOf(id) >= 0 };
      S.newFF(1); endDive(false); S.g().runId = id; const s3 = F.sliv(), sb3 = sb.n, c3 = S.prog().cleanDives || 0; S.finishLevel();
      out.replay = { paid: F.sliv() - s3, sunbeams: sb.n - sb3, clean: (S.prog().cleanDives || 0) - c3, line: sun() };
      S.newFF(1); endDive(true); const s4 = F.sliv(); S.finishLevel(); out.fail = { paid: F.sliv() - s4, title: document.getElementById('go-title').textContent };
      /* another tab settled a run behind this one's back: the two lists join on this tab's next save */
      const other = Date.now().toString(36) + '.othertab', dk = JSON.parse(localStorage.getItem('s3d_prog')); dk.settled = (dk.settled || []).concat([other]);
      localStorage.setItem('s3d_prog', JSON.stringify(dk));
      S.newFF(1); const mine = endDive(true); S.finishLevel(); const d2 = JSON.parse(localStorage.getItem('s3d_prog')).settled || [];
      out.tabs = { other: d2.indexOf(other) >= 0, mine: d2.indexOf(mine) >= 0 };
      /* the list is in the order runs were PAID, the last twenty: a run begun before twenty others that are paid first (a tab
         left in the background, a clock set back) is still the last thing written when it is paid (the review's first cut
         kept the twenty newest START times and dropped it in the very save that recorded it) */
      S.newFF(1); const early = endDive(true), dk2 = JSON.parse(localStorage.getItem('s3d_prog')), later = [];
      for (let i = 0; i < 20; i++) later.push((Date.now() + 3600e3 + i * 1000).toString(36) + '.later' + i);
      dk2.settled = (dk2.settled || []).concat(later); localStorage.setItem('s3d_prog', JSON.stringify(dk2));
      S.finishLevel(); const d3 = JSON.parse(localStorage.getItem('s3d_prog')).settled || [];
      out.order = { n: d3.length, lastIsEarly: d3[d3.length - 1] === early, keptLater: d3.indexOf(later[19]) >= 0 && d3.indexOf(later[1]) >= 0, droppedOldest: d3.indexOf(later[0]) < 0 && d3.indexOf(id) < 0 };
    } finally { window._sbCapEarn = sbKeep; }
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.lane || [], T = r.tilt || [];
  ok('a knife in the lane by a wall side stack (either wall): one bonk and the wall bounce, never past the wall, and it falls on', L.length === 2 && L.every(l => !!l && l.woods >= 1 && l.woods <= 2 && l.maxX <= 8.49 && !l.failed && l.below), JSON.stringify(r.lane || r));
  ok('a tilted knife in that lane (240 and 300 degrees) is never past the wall for its own angle, and falls on', T.length === 2 && T.every(t => !!t && t.over <= 0.01 && !t.failed && t.below), JSON.stringify(r.tilt));
  ok('in the lane the stack bonks once and holds its contact; once the knife has left the stack it bonks again', !!r.again && r.again.first >= 1 && r.again.first <= 2 && r.again.held === 0 && r.again.again >= 1 && r.again.y > 0, JSON.stringify(r.again));
  ok('a handle down knife drifting into a stack cuts the slab above and is bonked clear off the one below', !!r.side && r.side.woods === 1 && r.side.sliced >= 1 && r.side.x >= 3.2 - 1e-6, JSON.stringify(r.side));
  ok('a knife falling between two gate slabs is bonked out, never carried inside a slab, never past the wall, and falls on', !!r.gate && r.gate.deep === 0 && !r.gate.failed && r.gate.below && r.gate.over <= 0.01, JSON.stringify(r.gate));
  ok('a finished dive asked to finish twice pays its slivers, Sunbeams and clean dive once, and shows its panel again', !!r.twice && r.twice.paid > 0 && r.twice.again === 0 && r.twice.sameLine && r.twice.shown && r.twice.clean === 1 && r.twice.sunbeams === 1, JSON.stringify(r.twice));
  ok('the run is on the settled list on disk before its slivers are', !!r.twice && r.twice.onDisk && r.twice.ledgerFirst, JSON.stringify(r.twice));
  ok('a run replaying a settled id pays nothing and counts no clean dive', !!r.replay && r.replay.paid === 0 && r.replay.sunbeams === 0 && r.replay.clean === 0 && /\+0 slivers/.test(r.replay.line), JSON.stringify(r.replay));
  ok('a failed dive still pays', !!r.fail && r.fail.paid >= 6 && /STUCK/.test(r.fail.title), JSON.stringify(r.fail));
  ok("two tabs: the other tab's settled run survives this tab's save", !!r.tabs && r.tabs.other && r.tabs.mine, JSON.stringify(r.tabs));
  ok('the settled list is the last twenty in the order runs were paid (a run begun before twenty others is still recorded)', !!r.order && r.order.n === 20 && r.order.lastIsEarly && r.order.keptLater && r.order.droppedOldest, JSON.stringify(r.order));
  ok('no page errors through Part E1', errs.length === 0, JSON.stringify(errs));
  /* SS27: the back button during a landing's end wobble finishes the run (paid, its panel shown); during play it leaves as
     it always did, unpaid. A real pointer on the real button, the game running on its own frames. */
  let bk; try {
    await p.evaluate(async () => { const S = window._S3; window._S3skiprender = true; S.salt(5); S.newFF(1); const G = S.g(), W = S.world();
      G.x = 0; G.y = W.floorY + 3; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
      const t0 = performance.now(); while (!G.done && performance.now() - t0 < 6000) await new Promise(q => setTimeout(q, 30));
      window._bk = { done: G.done, failed: !!G.failed, sliv: window._S3forge.sliv(), ff: S.prog().ffLevel, lvl: G.lvl, G }; S.salt(null); });
    await clickCentre(p, '#b-home'); await new Promise(q => setTimeout(q, 600));
    bk = await p.evaluate(() => { const b = window._bk, on = id => document.getElementById(id).classList.contains('on');
      return { done: b.done, failed: b.failed, ended: !!b.G.ended, go: on('s-go'), title: on('s-title'), paid: window._S3forge.sliv() - b.sliv, ff: window._S3.prog().ffLevel, lvl: b.lvl }; });
    await p.evaluate(() => { const S = window._S3; window._S3skiprender = true; S.newFF(1); window._bk2 = { sliv: window._S3forge.sliv(), G: S.g() }; });
    await new Promise(q => setTimeout(q, 300)); await clickCentre(p, '#b-home'); await new Promise(q => setTimeout(q, 600));
    const bk2 = await p.evaluate(() => { const b = window._bk2, on = id => document.getElementById(id).classList.contains('on');
      window._S3skiprender = false; return { done: b.G.done, ended: !!b.G.ended, go: on('s-go'), title: on('s-title'), paid: window._S3forge.sliv() - b.sliv }; });
    bk = { wobble: bk, inPlay: bk2 };
  } catch (e) { bk = { error: String(e).slice(0, 200) }; }
  ok('back during a landing\'s end wobble finishes the run: paid, the next dive unlocked, its end panel shown', !!bk.wobble && bk.wobble.done && !bk.wobble.failed && bk.wobble.ended && bk.wobble.go && !bk.wobble.title && bk.wobble.paid > 0 && bk.wobble.ff > bk.wobble.lvl, JSON.stringify(bk));
  ok('back during play still leaves for the menu, unpaid', !!bk.inPlay && !bk.inPlay.done && !bk.inPlay.ended && bk.inPlay.title && !bk.inPlay.go && bk.inPlay.paid === 0, JSON.stringify(bk));
  await ctx.close();
}
/* a reload: the settled list is read back at boot, so a run under a settled id pays nothing there either; and a broken list
   that lands on disk behind the page's back (another build, a hand edit) never breaks the save that merges it */
{
  const SID = 'mh00zzzz.replayed';
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem('s3d_prog',JSON.stringify({level:1,best:{},settled:[${JSON.stringify(SID)}]}));localStorage.removeItem('s3d_slivers');}catch(e){}})()`);
  let r; try { r = await p.evaluate(sid => { const S = window._S3, F = window._S3forge, out = { listed: S.prog().settled.indexOf(sid) >= 0 };
    const end = () => { const G = S.g(); G.done = true; G.failed = true; G.doneT = 3; G.score = 450; };
    S.salt(5); S.newFF(1); end(); S.g().runId = sid; const a = F.sliv(); S.finishLevel(); out.replayed = F.sliv() - a;
    S.newFF(1); end(); const b = F.sliv(); S.finishLevel(); out.fresh = F.sliv() - b;
    const dk = JSON.parse(localStorage.getItem('s3d_prog')); dk.settled = null; localStorage.setItem('s3d_prog', JSON.stringify(dk));
    S.newFF(1); end(); const c = F.sliv(); S.finishLevel(); const d = JSON.parse(localStorage.getItem('s3d_prog'));
    out.badDisk = { paid: F.sliv() - c, panel: document.getElementById('s-go').classList.contains('on'), list: Array.isArray(d.settled) && d.settled.indexOf(S.g().runId) >= 0 };
    S.salt(null); return out; }, SID); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('after a reload a settled run pays nothing and a new one pays', !!r && r.listed && r.replayed === 0 && r.fresh >= 6, JSON.stringify(r));
  ok('a broken settled list on disk is replaced, never thrown on, when a run ends', !!r && !!r.badDisk && r.badDisk.paid >= 6 && r.badDisk.panel && r.badDisk.list, JSON.stringify(r && r.badDisk));
  ok('no page errors on the reload', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
