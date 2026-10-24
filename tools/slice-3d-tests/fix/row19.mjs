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

/* ---- 19. Part E2: Clean Slice, the finds, the end panel, the budget ---------- */
console.log('\n[19] Part E2: the Clean Slice line, the finds, the end panel, the budget');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    /* the layout fingerprint of a dive: every piece's position in a fixed order (the same function ran in node on v6.5's
       own code, tools/slice-3d-tests/e2/fp.js): E2 names the line and the find without one rng() of the dive's own */
    const fp = W => { const L = ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs'], parts = [W.floorY];
      L.forEach(n => (W[n] || []).forEach(e => parts.push(n[0], Math.round((e.x != null ? e.x : e.cx || 0) * 1000), Math.round((e.y || 0) * 1000), Math.round((e.w || e.r || 0) * 1000))));
      const t = parts.join(','); let h = 0x811c9dc5; for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16) + ':' + t.length; };
    out.fp = {}; for (const l of [1, 6, 11, 21, 26, 31, 36]) { S.salt(77); S.newFF(l); out.fp[l] = fp(S.world()); }
    /* the line: whole stacks only, two or more slabs each, a gold band on each line stack's top slab, M their slab count; the
       same dive built twice names the same line; Endless has none */
    const lineOf = () => { const c = S.clean(), W = S.world(), byStk = new Map(); W.slabs.forEach(s => { if (!byStk.has(s.stk)) byStk.set(s.stk, []); byStk.get(s.stk).push(s); });
      let whole = true, single = false, bands = 0, bandsOk = true; byStk.forEach(a => { const req = a.filter(s => s.req).length; if (req && req !== a.length) whole = false; if (req && a.length < 2) single = true;
        if (req) { const top = a.slice().sort((u, v) => v.y - u.y)[0]; if (top.band && top.band.parent) bands++; else bandsOk = false; } });
      return { M: c.M, n: c.req.length, stacks: c.stacks, whole, single, bands, bandsOk, key: c.req.map(s => s.x.toFixed(2) + '@' + s.y.toFixed(2)).join('|') }; };
    S.salt(77); S.newFF(1); out.line = lineOf(); S.salt(77); S.newFF(1); out.again = lineOf().key === out.line.key;
    let lines = 0, dives = 0, bad = []; for (let l = 1; l <= 40; l += 3) { S.salt(1000 + l); S.newFF(l); const L = lineOf(); dives++; if (L.M) lines++; if (!(L.whole && !L.single && L.bandsOk && L.M === L.n && L.bands === L.stacks)) bad.push(l); }
    out.many = { dives, lines, bad };
    S.salt(77); S.newEndless(); out.endless = { clean: !!S.world().clean, req: S.world().slabs.filter(s => s.req).length };
    /* the line each of six dives names, pinned (from the shipped rule in node: tools/slice-3d-tests/e2/world.js); the looser
       corridor the plan rejected names a different line on five of them */
    out.pinned = {}; for (const [l, sd] of [[1, 77], [8, 80], [14, 78], [23, 77], [33, 77], [38, 77], [10, 79], [13, 78], [15, 77], [12, 78], [45, 400]]) { S.salt(sd); S.newFF(l); const m = new Map();
      S.world().slabs.forEach(s => { if (s.req) { if (!m.has(s.stk)) m.set(s.stk, []); m.get(s.stk).push(s); } });
      out.pinned[l + '.' + sd] = [...m.values()].map(a => { a.sort((u, v) => v.y - u.y); return a[0].x.toFixed(2) + '@' + a[0].y.toFixed(2) + 'x' + a.length; }).sort().join('|'); }
    /* only line stacks wear a band, on their top slab; a cut takes the band with the slab; a stack off the line counts nothing */
    S.salt(77); S.newFF(1); { const W = S.world(), byS = new Map(); W.slabs.forEach(s => { if (!byS.has(s.stk)) byS.set(s.stk, []); byS.get(s.stk).push(s); });
      let onlyLine = true; byS.forEach(a => { a.sort((u, v) => v.y - u.y); a.forEach((s, i) => { if (s.band && !(s.req && i === 0)) onlyLine = false; }); });
      const off = [...byS.values()].find(a => a.length >= 7 && !a[0].req), G = S.g(); let offCount = null;
      if (off) { G.x = off[0].x; G.y = off[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
        for (let n = 0; n < 240 && G.y > off[off.length - 1].y - 2; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } offCount = { cut: off.filter(s => s.cut).length, n: S.clean().n }; }
      const line = [...byS.values()].find(a => a[0].req), band = line[0].band; G.x = line[0].x; G.y = line[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      for (let n = 0; n < 40 && !line[0].cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      out.band = { onlyLine, off: offCount, gone: !!band && !band.parent && line[0].cut }; }
    /* the review's dive: its last stack runs under the floor; no target may sit where the knife lands before it */
    S.salt(158384); S.newFF(4); { const W = S.world(); out.under = { M: W.clean.M, buried: W.slabs.filter(s => s.req && s.y + 0.575 <= W.floorY).length }; }
    /* the line carved on the player's path: each line stack met blade down from above at full speed, then the floor reached
       blade down; every target counts once and the end panel shows the badge. One target left uncut: N of M, no badge. */
    const carve = (skip, crash) => { S.salt(77); S.newFF(1); const G = S.g(), W = S.world(), c = S.clean(), stacks = new Map();
      c.req.forEach(s => { if (!stacks.has(s.stk)) stacks.set(s.stk, []); stacks.get(s.stk).push(s); });
      const order = [...stacks.values()].map(a => a.sort((u, v) => v.y - u.y)).sort((a, b) => b[0].y - a[0].y);
      let k = 0; for (const a of order) { const last = k === order.length - 1;
        G.x = a[0].x; G.y = a[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
        for (let n = 0; n < 240 && !G.done && G.y > a[a.length - 1].y - 2; n++) { if (skip && last && G.y < a[a.length - 1].y + 2.6) { G.x = a[0].x > 0 ? a[0].x - 6 : a[0].x + 6; } G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } k++; }
      const cut = c.req.filter(s => s.cut).length;
      if (crash) { G.done = true; G.failed = true; G.doneT = 0; G.stuckY = G.y; }   /* every target cut, then the blade into the wall */
      else { G.x = 0; G.y = W.floorY + 3; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; S.hold(0); }
      const go = document.getElementById('s-go'); go.classList.remove('on');
      for (let n = 0; n < 600 && !go.classList.contains('on'); n++) S.stepN(1, D);
      const el = document.getElementById('go-clean');
      return { M: c.M, cut, n: S.clean().n, done: G.done, failed: !!G.failed, panel: go.classList.contains('on'), on: el.classList.contains('on'), won: el.classList.contains('won'), text: document.getElementById('go-clean-t').textContent }; };
    out.full = carve(false); out.short = carve(true); out.crash = carve(false, true);
    /* a failed dive shows its count (never the badge) */
    S.salt(77); S.newFF(1); { const G = S.g(); G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel();
      const el = document.getElementById('go-clean'); out.failPanel = { on: el.classList.contains('on'), won: el.classList.contains('won'), text: document.getElementById('go-clean-t').textContent }; }
    /* Journey, Wall Climb and Endless panels never show it */
    const hidden = []; S.newGame(1); { const G = S.g(); G.done = true; G.doneT = 3; G.mult = 2; S.finishLevel(); hidden.push(document.getElementById('go-clean').classList.contains('on')); }
    S.newClimb(1); { const G = S.g(); G.done = true; G.doneT = 3; G.mult = 2; G.stuckY = 3; S.finishLevel(); hidden.push(document.getElementById('go-clean').classList.contains('on')); }
    S.salt(77); S.newEndless(); { const G = S.g(); G.done = true; G.failed = true; G.doneT = 3; S.finishLevel(); hidden.push(document.getElementById('go-clean').classList.contains('on')); }
    out.hidden = hidden;
    /* the find: in a line slab; cut it and it pops (a seed in its world's hat) and floats away; the end panel tells it the
       first time and s3d_dex keeps it; the next time it is not told again; another tab's finds join */
    localStorage.removeItem('s3d_dex'); for (const k in S.dex()) delete S.dex()[k];
    /* the knife is dropped on the find's stack from above its top, blade down (the player's path into a column) */
    const topOf = d => S.world().slabs.filter(s => s.stk === d.stk).sort((u, v) => v.y - u.y)[0];
    S.salt(77); S.newFF(1); { const G = S.g(), c = S.clean(), d = c.disc; out.discInLine = !!d && !!d.req;
      G.x = d.x; G.y = topOf(d).y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
      for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      out.popped = { cut: d.cut, found: S.clean().found, finds: S.finds() };
      for (let n = 0; n < 260; n++) { G.y = d.y; G.vy = 0; G.x = 0; S.stepN(1, D); }
      out.popped.gone = S.finds() === 0;
      G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel();
      const fe = document.getElementById('go-find'); out.first = { on: fe.classList.contains('on'), text: fe.textContent, disk: JSON.parse(localStorage.getItem('s3d_dex') || 'null') }; }
    S.salt(77); S.newFF(1); { const G = S.g(), d = S.clean().disc; G.x = d.x; G.y = topOf(d).y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); out.second = document.getElementById('go-find').classList.contains('on'); }
    /* another tab told this find after this one booted: it is not told again here */
    for (const k in S.dex()) delete S.dex()[k]; localStorage.setItem('s3d_dex', JSON.stringify({ mossy_canyon: 1 }));
    S.salt(77); S.newFF(1); { const G = S.g(), d = S.clean().disc; G.x = d.x; G.y = topOf(d).y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
      G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); out.otherTab = document.getElementById('go-find').classList.contains('on'); }
    localStorage.setItem('s3d_dex', JSON.stringify({ mossy_canyon: 1, deep_tide: 1 }));
    S.salt(77); S.newFF(6); { const G = S.g(), d = S.clean().disc; if (d) { G.x = d.x; G.y = topOf(d).y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); } }
      G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); out.tabs = JSON.parse(localStorage.getItem('s3d_dex') || 'null'); }
    /* SS35: debris never passes 24 pieces, particles never 120, however fast the cutting */
    S.salt(77); S.newFF(1); { const G = S.g(), c = S.clean(); let maxC = 0, maxS = 0; const st = new Map(); S.world().slabs.forEach(s => { if (!st.has(s.stk)) st.set(s.stk, []); st.get(s.stk).push(s); });
      for (const a of st.values()) { if (a.length < 7) continue; a.sort((u, v) => v.y - u.y); G.x = a[0].x; G.y = a[0].y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
        for (let n = 0; n < 120 && G.y > a[a.length - 1].y - 2; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); maxC = Math.max(maxC, S.chunkN()); maxS = Math.max(maxS, S.sparkN()); } }
      out.budget = { maxC, maxS, caps: S.caps() }; }
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const FP = { 1: '62959755:1454', 6: 'e58ef238:1695', 11: 'c989d9c5:2314', 21: '707a13a9:3996', 26: 'de12bfdc:4542', 31: '79fa5be4:5643', 36: '939697f5:5912' };
  ok('a numbered dive is laid out exactly as v6.5 laid it out (layout fingerprints from v6.5\'s own code)', !!r.fp && Object.keys(FP).every(l => r.fp[l] === FP[l]), JSON.stringify(r.fp || r));
  ok('the line is whole stacks of two or more slabs, each topped with a gold band, M its slab count, the same line built twice', !!r.line && r.line.M > 0 && r.line.whole && !r.line.single && r.line.bandsOk && r.line.bands === r.line.stacks && r.line.M === r.line.n && r.again, JSON.stringify(r.line));
  ok('across levels every line keeps those rules, and most dives have one', !!r.many && r.many.bad.length === 0 && r.many.lines >= r.many.dives / 2, JSON.stringify(r.many));
  ok('Endless has no line', !!r.endless && !r.endless.clean && r.endless.req === 0, JSON.stringify(r.endless));
  ok('no target sits under the floor (the review\'s level 4 dive)', !!r.under && r.under.M > 0 && r.under.buried === 0, JSON.stringify(r.under));
  /* 10.79 and 13.78: a wasp closes a stack's entry as the knife arrives; 15.77 and 12.78: a gourd's full reach (the review) */
  const PIN = { '1.77': '-0.40@-67.41x10|-2.88@-142.98x7', '8.80': '2.75@-39.11x10', '14.78': '-0.43@-109.44x7', '23.77': '0.96@-47.01x7|2.95@-110.89x9|3.78@-126.27x12', '33.77': '3.26@-102.03x13', '38.77': '4.63@-200.59x11|4.65@-181.25x12|5.06@-132.78x13',
    '10.79': '4.72@-370.49x11|5.65@-318.25x8', '13.78': '-0.20@-73.53x9|-0.25@-88.91x7', '15.77': '5.05@-399.15x11', '12.78': '',
    '45.400': '' };   /* 45.400: a wasp 13.1 u over its one stack sweeps it as every knife arrives (the entry window reaches 8.5) */
  ok('the line six pinned dives name is the shipped rule\'s (a looser corridor names another)', !!r.pinned && Object.keys(PIN).every(k => r.pinned[k] === PIN[k]), JSON.stringify(r.pinned));
  ok('only line stacks wear the band, on their top slab; a cut takes it; a stack off the line counts nothing', !!r.band && r.band.onlyLine && r.band.gone && !!r.band.off && r.band.off.cut > 0 && r.band.off.n === 0, JSON.stringify(r.band));
  ok('carving every line stack and landing: each target counts once, the panel shows the Clean Slice badge', !!r.full && r.full.cut === r.full.M && r.full.n === r.full.M && r.full.panel && r.full.on && r.full.won && r.full.text === 'Clean Slice' && !r.full.failed, JSON.stringify(r.full));
  ok('one target left uncut: Clean Slice N of M, no badge', !!r.short && r.short.panel && r.short.on && !r.short.won && r.short.n === r.short.M - (r.short.M - r.short.cut) && r.short.cut < r.short.M && r.short.text === 'Clean Slice ' + r.short.cut + ' of ' + r.short.M, JSON.stringify(r.short));
  ok('a failed dive shows its count, never the badge', !!r.failPanel && r.failPanel.on && !r.failPanel.won && /^Clean Slice \d+ of \d+$/.test(r.failPanel.text), JSON.stringify(r.failPanel));
  ok('every target cut but no floor (a crash): M of M, never the badge', !!r.crash && r.crash.cut === r.crash.M && r.crash.failed && r.crash.on && !r.crash.won && r.crash.text === 'Clean Slice ' + r.crash.M + ' of ' + r.crash.M, JSON.stringify(r.crash));
  ok('Journey, Wall Climb and Endless never show Clean Slice', !!r.hidden && r.hidden.length === 3 && r.hidden.every(h => !h), JSON.stringify(r.hidden));
  ok('the find sits in a line slab, pops when cut and floats away', r.discInLine === true && !!r.popped && r.popped.cut && r.popped.found === 'mossy_canyon' && r.popped.finds === 1 && r.popped.gone, JSON.stringify({ d: r.discInLine, p: r.popped }));
  ok('the end panel tells a find the first time and s3d_dex keeps it; the second time it is not told again', !!r.first && r.first.on && /^New find: a crowned seed$/.test(r.first.text) && !!r.first.disk && r.first.disk.mossy_canyon === 1 && r.second === false, JSON.stringify({ f: r.first, s: r.second }));
  ok("two tabs: the other tab's finds survive this tab's save", !!r.tabs && r.tabs.mossy_canyon === 1 && r.tabs.deep_tide === 1, JSON.stringify(r.tabs));
  ok('two tabs: a find the other tab already told is not told again', r.otherTab === false, JSON.stringify(r.otherTab));
  ok('the budget: debris never passes 24 pieces, particles never 120', !!r.budget && r.budget.caps.chunk === 24 && r.budget.caps.spark === 120 && r.budget.maxC <= 24 && r.budget.maxS <= 120 && r.budget.maxC >= 12, JSON.stringify(r.budget));
  ok('no page errors through Part E2', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
/* a find saved over a broken s3d_dex (a number on disk at boot) is recorded as a proper set, with no error */
{
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem('s3d_dex','7');}catch(e){}})()`);
  let r; try { r = await p.evaluate(() => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true;
    S.salt(77); S.newFF(1); const G = S.g(), d = S.clean().disc, top = S.world().slabs.filter(s => s.stk === d.stk).sort((u, v) => v.y - u.y)[0];
    G.x = d.x; G.y = top.y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
    for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); S.salt(null); window._S3skiprender = false;
    return { cut: d.cut, disk: localStorage.getItem('s3d_dex'), told: document.getElementById('go-find').classList.contains('on') }; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('a find over a broken s3d_dex is recorded as a proper set, with no error', !!r && r.cut && r.told && r.disk === '{"mossy_canyon":1}' && errs.length === 0, JSON.stringify({ r, errs }));
  await ctx.close();
}
/* a find already in s3d_dex at boot is not told again; a find on a dive that LANDS is told (the cleanResults(true) path) */
{
  const b1 = await boot(`(()=>{try{localStorage.setItem('s3d_dex','{"mossy_canyon":1}');}catch(e){}})()`), b2 = await boot(`(()=>{try{localStorage.removeItem('s3d_dex');}catch(e){}})()`);
  const findLand = async (p, land) => p.evaluate(land => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true; S.salt(77); S.newFF(1);
    const G = S.g(), d = S.clean().disc, top = S.world().slabs.filter(s => s.stk === d.stk).sort((u, v) => v.y - u.y)[0];
    G.x = d.x; G.y = top.y + 3; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0); for (let n = 0; n < 160 && !d.cut; n++) { G.ang = Math.PI / 2; G.w = 0; S.stepN(1, D); }
    if (land) { const W = S.world(); G.x = 0; G.y = W.floorY + 3; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2; const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D); }
    else { G.done = true; G.failed = true; G.doneT = 3; G.score = 100; S.finishLevel(); }
    window._S3skiprender = false; return { cut: d.cut, landed: !!G.done && !G.failed, told: document.getElementById('go-find').classList.contains('on') }; }, land);
  let a, b; try { a = await findLand(b1.p, false); b = await findLand(b2.p, true); } catch (e) { a = { error: String(e).slice(0, 200) }; }
  ok('a find already in s3d_dex at boot is not told again; a find on a landed dive is told', !!a && a.cut && !a.told && !!b && b.cut && b.landed && b.told && b1.errs.length === 0 && b2.errs.length === 0, JSON.stringify({ a, b }));
  await b1.ctx.close(); await b2.ctx.close();
}
/* SS35 with the paint on: a world's paintings leave the GPU when a run starts that cannot show that world, and come back
   when it is shown again (the renderer's own texture count, real frames drawn); draw calls are counted per frame */
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(async () => { const S = window._S3, out = {}, wait = ms => new Promise(q => setTimeout(q, ms));
    const settle = async () => { const t0 = performance.now(); while (performance.now() - t0 < 20000) { const a = S.art(); if (a.json && a.asked > 0 && a.loaded + a.failed >= a.asked) break; await wait(300); } };
    window._S3skiprender = false;
    S.salt(5); S.newFF(26); await settle(); await wait(800); out.calls = S.calls(); out.tex0 = S.gpuTex(); const ev0 = S.evicted();
    S.salt(5); S.newFF(31); out.texNow = S.gpuTex(); out.ev = S.evicted() - ev0;   /* at once, before the new world draws */
    await settle(); await wait(800); out.texDeep = S.gpuTex();
    S.salt(5); S.newFF(26); out.texLeft = S.gpuTex(); await settle(); await wait(800); out.back = S.gpuTex();
    S.salt(5); S.newFF(31); out.texNow2 = S.gpuTex();   /* the second time round it leaves again (the review: the first cut evicted once a session) */
    S.freeze(); return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('draw calls are counted per frame (?dev=1)', !!r && r.calls > 0, JSON.stringify(r));
  ok("a world's paintings leave the GPU when a run in another world starts, and come back when it is shown again", !!r && r.ev > 0 && r.texNow < r.tex0 && r.back > r.texLeft, JSON.stringify(r));
  ok('and they leave again the second time round', !!r && r.texNow2 < r.back, JSON.stringify(r));
  ok('no page errors with the paint coming and going', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
