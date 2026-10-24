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

/* ---- 16. Part C: knives and the forge (SS16, SS17, SS25, SS26). The shelf is the 22 of v6.2 plus the two new trophies
   and, since 24 Oct (Part F4, his call "prices need to be so much higher"), the six Astra knives priced on the new ladder;
   the two supporter knives are in the catalogue but never on the shelf; the twenty prices are the F4 ladder; every new knife is the Classic Chef's rig (same reach to the digit); a
   trophy only arrives through grantTrophy, and the two new rules grant on exactly their condition; the preview turns,
   flips and cuts while the Forge is up, stops when it is not, holds still with reduced motion; a tap on a card spends
   nothing and the button under the preview does. */
console.log('\n[16] Part C: knives and the forge');
{
  const NEW = ['socktopus', 'butterbuddy', 'spatulot', 'pencil', 'discopickle', 'croissant', 'rubberduke', 'boomerang', 'tearex', 'custodian'];
  const HIDDEN = ['tearex', 'custodian'];
  const PRICES = { classic: 0, cleaver: 2000, socktopus: 2200, bamboo: 2400, butterbuddy: 2600, trowel: 2800, paintbrush: 3000, quill: 3400,
    katana: 6000, pencil: 6400, obsidian: 6800, spatulot: 7200, icicle: 7600, crystal: 8000, tuningfork: 9000,
    gold: 15000, emberfang: 16000, discopickle: 17500, prism: 19000, croissant: 20000, scythe: 22000 };   /* Part F4, 24 Oct */
  const OLD = ['classic', 'cleaver', 'paintbrush', 'bamboo', 'trowel', 'quill', 'katana', 'crystal', 'obsidian', 'icicle', 'tuningfork', 'gold', 'emberfang',
    'prism', 'scythe', 'cosmicedge', 'wallbreaker', 'depthdiver', 'conductor', 'groundskeeper', 'starforge', 'wolffang'];
  const html = await (await fetch(URL)).text();
  const pushes = (html.match(/\.owned\.push\(/g) || []).length;
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate((NEW, HIDDEN, PRICES, OLD) => {
    const S = window._S3, cat = S.catalog(), ord = S.skinOrder(), out = {};
    out.cat = Object.keys(cat).length; out.ord = ord.length;
    out.oldKept = OLD.every(k => ord.indexOf(k) >= 0); out.newOn = ['rubberduke', 'boomerang', 'socktopus', 'butterbuddy', 'spatulot', 'pencil', 'discopickle', 'croissant'].every(k => ord.indexOf(k) >= 0);
    out.hiddenOff = HIDDEN.every(k => cat[k] && ord.indexOf(k) < 0);
    out.unpriced = Object.keys(cat).every(k => cat[k].price !== null);   /* nothing left unpriced: every knife is priced, earned (-1) or a supporter (-2) */
    out.support = ['tearex', 'custodian'].every(k => cat[k].premium === true);
    out.prices = Object.keys(PRICES).filter(k => !cat[k] || cat[k].price !== PRICES[k]);
    /* G2 (24 Oct): the shelf reads as the ladder. Prices come from this test's table, only the order from the page */
    out.shelf = ord.filter(k => PRICES[k] !== undefined).map(k => PRICES[k]);
    out.ladderBad = out.shelf.filter((v, i) => i > 0 && v < out.shelf[i - 1]).length;
    const lastPriced = Math.max.apply(null, ord.map((k, i) => PRICES[k] !== undefined ? i : -1)), firstOther = ord.findIndex(k => PRICES[k] === undefined);
    out.pricedFirst = firstOther < 0 || lastPriced < firstOther;
    out.noStory = Object.keys(cat).filter(k => !cat[k].story);
    S.applySkin('classic'); const ref = JSON.stringify(S.reach()); const sk = S.skins();
    out.rigOff = NEW.filter(k => { if (sk.owned.indexOf(k) < 0) sk.owned.push(k); S.applySkin(k); return JSON.stringify(S.reach()) !== ref; });
    localStorage.setItem('s3d_skins', JSON.stringify({ owned: ['classic'], equip: 'classic' }));   // owned is a union with disk: clear both
    sk.owned = ['classic']; S.applySkin('classic');
    const owns = k => S.skins().owned.indexOf(k) >= 0, detail = () => document.getElementById('go-detail').textContent;
    // Rubber Duke: a clean dive in Deep Tide (levels 31 to 35) counts; the third grants; Mossy Canyon never counts
    function cleanDive(lvl) { S.salt(5); S.newFF(lvl); const G = S.g(), W = S.world(); G.x = 0; G.y = W.floorY + 6; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2;
      G.score = 120; const go = document.getElementById('s-go'); go.classList.remove('on');
      for (let i = 0; i < 3000 && !go.classList.contains('on'); i++) { S.hold(0); S.stepN(1, 16); } return go.classList.contains('on'); }
    S.prog().tideClean = 0; cleanDive(1); out.tideAfterMossy = S.prog().tideClean || 0;
    cleanDive(31); cleanDive(32); out.duckAt2 = owns('rubberduke');
    cleanDive(33); out.duckAt3 = owns('rubberduke'); out.duckSaid = /RUBBER DUKE UNLOCKED/.test(detail()); out.tide = S.prog().tideClean;
    // Banana Boomerang: a real handle bounce off the score wall counts in Journey; twelve and a finished run grants
    S.newGame(1); let G = S.g(); const W = S.world();
    G.x = W.wallX - 3.6; G.y = 3; G.vx = 9; G.vy = 0; G.w = 0; G.ang = 0;   // handle first into the wall
    for (let i = 0; i < 30 && !(G.handles > 0); i++) { G.ang = 0; G.w = 0; S.stepN(1, 1000 / 120); }
    out.bounceCounts = G.handles || 0;
    function finishJourney(handles, failed) { S.newGame(1); const g = S.g(); g.handles = handles; g.done = true; g.failed = !!failed; g.mult = 2; g.doneT = 3;
      if (failed) S.failLevel(); else S.finishLevel(); }
    finishJourney(11); out.boomAt11 = owns('boomerang');
    finishJourney(12, true); out.boomOnCrash = owns('boomerang');
    finishJourney(12); out.boomAt12 = owns('boomerang'); out.boomSaid = /BANANA BOOMERANG UNLOCKED/.test(detail());
    S.salt(null); return out;
  }, NEW, HIDDEN, PRICES, OLD); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('the shelf is the 22 of v6.2, Rubber Duke and Banana Boomerang, and the six F4 priced knives (32 in the catalogue)', r.cat === 32 && r.ord === 30 && r.oldKept && r.newOn, JSON.stringify({ cat: r.cat, ord: r.ord, error: r.error }));
  ok('the two supporter knives are kept off the shelf, and no knife is left unpriced', r.hiddenOff && r.unpriced && r.support, JSON.stringify({ h: r.hiddenOff, u: r.unpriced, s: r.support }));
  ok('the twenty prices are the F4 ladder', r.prices && r.prices.length === 0, JSON.stringify(r.prices));
  ok('the shelf reads as a price ladder: each priced knife costs no less than the one before it, all before the trophies (G2)', r.ladderBad === 0 && r.shelf && r.shelf.length === 21 && r.pricedFirst, JSON.stringify({ shelf: r.shelf, first: r.pricedFirst, error: r.error }));
  ok('every knife has its story', r.noStory && r.noStory.length === 0, JSON.stringify(r.noStory));
  ok('every new knife is the Classic Chef rig (same reach)', r.rigOff && r.rigOff.length === 0, JSON.stringify(r.rigOff));
  ok('a trophy only arrives through grantTrophy (four owned.push sites: grantTrophy, the boot repair, the tab merge, a purchase)', pushes === 4, 'sites=' + pushes);
  ok('Rubber Duke: three clean Deep Tide dives, and only Deep Tide counts', r.tideAfterMossy === 0 && !r.duckAt2 && r.duckAt3 && r.duckSaid, JSON.stringify(r));
  ok('Banana Boomerang: a handle bounce counts, and twelve in a finished Journey run grants', r.bounceCounts === 1 && !r.boomAt11 && !r.boomOnCrash && r.boomAt12 && r.boomSaid, JSON.stringify(r));
  await ctx.close();
  /* the preview and the two step flow, by real pointer */
  const b2 = await bootAt(412, 915), q = b2.p;
  let f; try {
    await q.evaluate(() => window._S3forge.setSliv(6100));   /* the Midnight Katana costs 6,000 since Part F4 (it cost 500) */
    await clickCentre(q, '#b-forge'); await new Promise(res => setTimeout(res, 1500));
    const snap = () => q.evaluate(() => { const c = document.getElementById('forge-pvc'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 0, n = 0;
      for (let i = 0; i < d.length; i += 16) { h = (h * 31 + d[i] + d[i + 3]) % 1000000007; if (d[i + 3] > 20) n++; } return { h, n }; });
    const a1 = await snap(); await new Promise(res => setTimeout(res, 600)); const a2 = await snap();
    await q.evaluate(() => document.querySelector('#forge-grid .fcard[data-key="katana"]').scrollIntoView({ block: 'center' }));
    await new Promise(res => setTimeout(res, 300));
    await clickCentre(q, '#forge-grid .fcard[data-key="katana"]'); await new Promise(res => setTimeout(res, 300));
    const sel = await q.evaluate(() => ({ sliv: window._S3forge.sliv(), owned: window._S3forge.owned().indexOf('katana') >= 0, name: document.getElementById('pv-name').textContent, act: document.getElementById('forge-act').textContent }));
    await clickCentre(q, '#forge-act'); await new Promise(res => setTimeout(res, 300));
    const buy = await q.evaluate(() => ({ sliv: window._S3forge.sliv(), owned: window._S3forge.owned().indexOf('katana') >= 0, equip: window._S3forge.equip() }));
    await clickCentre(q, '#forge-back'); await new Promise(res => setTimeout(res, 300));
    const b1 = await snap(); await new Promise(res => setTimeout(res, 500)); const b3 = await snap();
    await q.evaluate(() => { window._S3.set().rm = true; });
    await clickCentre(q, '#b-forge'); await new Promise(res => setTimeout(res, 1200));
    const c1 = await snap(); await new Promise(res => setTimeout(res, 600)); const c2 = await snap();
    await q.evaluate(() => { window._S3.set().rm = false; });
    /* the whole cycle stays inside its frame: no painted pixel on the preview's 2 px border at any moment, for the
       longest, tallest and widest paintings (the first cut's windup sheared a quarter of the grip off the top) */
    const frame = await q.evaluate(async () => {
      const F = window._S3forge, c = document.getElementById('forge-pvc'), g = c.getContext('2d'), out = { bad: [], frames: 0, notReady: [] };
      for (const k of ['classic', 'katana', 'prism', 'croissant', 'boomerang', 'wolffang']) {
        F.pvAt(k, 0); const t0 = Date.now(); while (!F.pvReady(k) && Date.now() - t0 < 8000) await new Promise(r => setTimeout(r, 100));
        if (!F.pvReady(k)) { out.notReady.push(k); continue; }
        for (let T = 0; T < 4; T += 0.02) { F.pvAt(k, T); out.frames++;
          const d = g.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height; let edge = 0;
          for (let x = 0; x < W; x++) for (const y of [0, 1, H - 2, H - 1]) if (d[(y * W + x) * 4 + 3] > 24) edge++;
          for (let y = 0; y < H; y++) for (const x of [0, 1, W - 2, W - 1]) if (d[(y * W + x) * 4 + 3] > 24) edge++;
          if (edge) out.bad.push(k + '@' + T.toFixed(2) + ':' + edge); }
      }
      return out; });
    f = { a1, a2, sel, buy, b1, b3, c1, c2, frame, errs: b2.errs };
  } catch (e) { f = { error: String(e).slice(0, 200) }; }
  ok('the preview draws and moves while the Forge is up', !!f.a1 && f.a1.n > 2000 && f.a1.h !== f.a2.h, JSON.stringify({ a1: f.a1, a2: f.a2, error: f.error }));
  ok('it stops when the Forge closes, and holds a still with reduced motion', !!f.b1 && f.b1.h === f.b3.h && f.c1.n > 2000 && f.c1.h === f.c2.h, JSON.stringify({ b1: f.b1, b3: f.b3, c1: f.c1, c2: f.c2 }));
  ok('a tap on a card chooses and spends nothing; Unlock under the preview buys it', !!f.sel && f.sel.sliv === 6100 && !f.sel.owned && f.sel.name === 'Midnight Katana' && /Unlock/.test(f.sel.act)
    && f.buy.sliv === 100 && f.buy.owned && f.buy.equip === 'katana', JSON.stringify({ sel: f.sel, buy: f.buy }));
  ok('the preview never leaves its frame at any moment of the cycle', !!f.frame && f.frame.frames >= 1000 && f.frame.bad.length === 0 && f.frame.notReady.length === 0,
    JSON.stringify(f.frame && { frames: f.frame.frames, bad: f.frame.bad.slice(0, 8), n: f.frame.bad.length, notReady: f.frame.notReady }));
  ok('no page errors in the Forge', !!f.errs && f.errs.length === 0, JSON.stringify(f.errs));
  await b2.ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
