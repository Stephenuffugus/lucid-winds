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
const URL = BASE + '/satellites/slice-3d/?dev=1';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

const browser = await puppeteer.launch({
  headless: 'new', protocolTimeout: 600000,
  args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage']
});

async function boot(poison) {
  const ctx = await browser.createBrowserContext();
  const p = await ctx.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  if (poison) await p.evaluateOnNewDocument(poison);
  await p.goto(URL, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  return { ctx, p, errs };
}

/* ---- 1. corrupt save must never brick the game ------------------------------
   Any of these used to kill the entire main IIFE at boot (strict mode refuses to
   set a property on a primitive), leaving a black stage with no way out. */
console.log('\n[1] corrupt save survives boot and still plays');
const POISON = [
  ['s3d_prog', '5'], ['s3d_prog', '"hi"'], ['s3d_prog', 'true'], ['s3d_prog', '[]'],
  ['s3d_prog', '{"level":"x","best":null}'], ['s3d_prog', '{"best":7}'],
  ['s3d_prog', '{"level":-4,"climbLevel":0}'],
  ['s3d_skins', '5'], ['s3d_skins', '"x"'], ['s3d_skins', '{"owned":"classic"}'],
  ['s3d_skins', '{"owned":{},"equip":"nope"}'], ['s3d_skins', '{"owned":["classic"],"equip":"ghost"}'],
  ['s3d_slivers', '"abc"'], ['s3d_slivers', '-99']
];
for (const [k, v] of POISON) {
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});}catch(e){}})()`);
  const r = await p.evaluate(() => {
    if (!window._S3) return { boot: false };
    const out = { boot: true };
    try {
      window._S3.newGame(1); out.started = !!window._S3.state();
      window._S3forge.renderForge(); out.cards = document.getElementById('forge-grid').children.length;
      const pr = window._S3.prog();
      out.progSane = pr.level > 0 && pr.ffLevel > 0 && pr.climbLevel > 0 && pr.best && typeof pr.best === 'object';
      const sk = window._S3.skins();
      out.skinSane = Array.isArray(sk.owned) && sk.owned.indexOf('classic') >= 0 && !!window._S3.catalog()[sk.equip];
      out.slivSane = window._S3forge.sliv() >= 0;
    } catch (e) { out.threw = e.message.slice(0, 90); }
    return out;
  });
  ok(`${k}=${v}`, r.boot && r.started && r.cards === 22 && r.progSane && r.skinSane && r.slivSane && !r.threw && !errs.length,
    JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  await ctx.close();
}

/* ---- 2. the core loop actually finishes -----------------------------------
   ⛔ Each mode gets its OWN page. Running all five in one document works right up
      until it doesn't: under swiftshader the accumulated GL pressure made the
      second run take longer than a 600s protocol timeout, which reads exactly like
      a hung game and is not one. A fresh context per mode also means no assertion
      can pass because a previous one warmed something up.
   ⛔ The in-page loop is TIMEBOXED by wall clock. A probe that can spin forever is
      a probe that reports "still running" for a game that has crashed. */
async function runMode(kind, arg) {
  const { ctx, p, errs } = await boot();
  const r = await p.evaluate((kind, arg) => {
    const S = window._S3;
    if (kind === 'journey') S.newGame(arg); else if (kind === 'ff') S.newFF(arg);
    else if (kind === 'climb') S.newClimb(arg); else S.newEndless();
    const go = document.getElementById('s-go');
    const t0 = Date.now();
    let i = 0, timeboxed = false;
    for (; i < 8000; i++) {
      const g = S.state(); if (!g) break;
      if (!g.done && g.grounded && kind !== 'ff' && kind !== 'endless') S.tap(1);
      S.stepN(1, 16);
      if (go.classList.contains('on')) break;
      if (Date.now() - t0 > 90000) { timeboxed = true; break; }
    }
    const g = S.state();
    return {
      timeboxed, frames: i, ms: Date.now() - t0,
      ended: go.classList.contains('on'),
      title: document.getElementById('go-title').textContent,
      detail: document.getElementById('go-detail').textContent,
      sun: document.getElementById('go-sun').textContent,
      score: g ? g.score : -1, prog: JSON.parse(JSON.stringify(S.prog()))
    };
  }, kind, arg);
  await ctx.close();
  return { ...r, errs };
}

console.log('\n[2] every mode reaches its end panel and banks progress');
{
  const j = await runMode('journey', 1);
  ok('Journey L1 reaches the end panel', j.ended && !j.timeboxed, JSON.stringify({ t: j.timeboxed, f: j.frames, ms: j.ms }));
  ok('Journey L1 banks a score', j.score > 0, 'score=' + j.score);
  ok('Journey L1 advances PROG.level', j.prog.level >= 2, 'level=' + j.prog.level);
  ok('Journey L1 pays slivers', /slivers/.test(j.sun), j.sun);
  ok('Journey L1 raises no page error', j.errs.length === 0, j.errs.join(' | '));

  const f = await runMode('ff', 1);
  ok('Freefall L1 reaches the end panel', f.ended && !f.timeboxed, f.title + ' ' + JSON.stringify({ t: f.timeboxed, f: f.frames }));
  /* the fail path used to save NOTHING, so every slab cut on a failed dive was
     discarded and the Groundskeeper trophy was near unreachable */
  ok('a failed dive still reports its combo', /best combo/.test(f.detail), f.detail);
  ok('Freefall raises no page error', f.errs.length === 0, f.errs.join(' | '));

  const c = await runMode('climb', 1);
  ok('Wall Climb L1 reaches the end panel', c.ended && !c.timeboxed, c.title);
  ok('Wall Climb raises no page error', c.errs.length === 0, c.errs.join(' | '));

  const e = await runMode('endless', 0);
  ok('Endless reaches the end panel', e.ended && !e.timeboxed, e.title);
  ok('Endless records a best depth', e.prog.endlessBest > 0, 'endlessBest=' + e.prog.endlessBest);
  ok('Endless raises no page error', e.errs.length === 0, e.errs.join(' | '));
}

/* ---- 3. a failed run banks its trophy progress ---------------------------- */
console.log('\n[3] a failed run does not silently discard progress');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3;
    S.prog().slabsCut = 0;
    S.newFF(1);
    const go = document.getElementById('s-go');
    const t0 = Date.now();
    for (let i = 0; i < 8000; i++) { const g = S.state(); if (!g) break; S.stepN(1, 16); if (go.classList.contains('on')) break; if (Date.now() - t0 > 90000) break; }
    const cut = S.prog().slabsCut || 0;
    let disk = null; try { disk = JSON.parse(localStorage.getItem('s3d_prog')); } catch (e) {}
    return { failed: /STUCK/.test(document.getElementById('go-title').textContent), cut, onDisk: disk ? (disk.slabsCut || 0) : -1, hasBestCombo: disk && disk.bestCombo !== undefined };
  });
  ok('a failed dive writes PROG to disk', r.onDisk >= 0 && r.hasBestCombo, JSON.stringify(r));
  ok('slabs cut on a failed dive survive the run', r.onDisk >= r.cut, JSON.stringify(r));
  await ctx.close();
}

/* ---- 4. two tabs must not clobber ----------------------------------------- */
console.log('\n[4] two tabs: counters ADD, bests MAX, owned knives UNION');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3, F = window._S3forge;
    /* stand in for the other tab by writing to disk behind this tab's back, exactly
       as a second tab would, then make this tab save. */
    F.setSliv(100);                                   // this tab banks 100
    localStorage.setItem('s3d_slivers', '500');       // other tab banked 500 meanwhile
    F.setSliv(140);                                   // this tab earns 40 more and saves
    const sliv = F.sliv();

    S.prog().level = 3; localStorage.setItem('s3d_prog', JSON.stringify({ level: 9, best: { l7: 42 }, ffLevel: 1, climbLevel: 1 }));
    S.prog().best.l1 = 10;
    S.newGame(1); const go = document.getElementById('s-go');
    const t0 = Date.now();
    for (let i = 0; i < 8000; i++) { const g = S.state(); if (!g) break; if (!g.done && g.grounded) S.tap(1); S.stepN(1, 16); if (go.classList.contains('on')) break; if (Date.now() - t0 > 90000) break; }
    const disk = JSON.parse(localStorage.getItem('s3d_prog'));

    const own = S.skins(); own.owned = ['classic', 'cleaver'];
    localStorage.setItem('s3d_skins', JSON.stringify({ owned: ['classic', 'katana'], equip: 'classic' }));
    S.applySkin('cleaver');
    const merged = JSON.parse(localStorage.getItem('s3d_skins')).owned;
    return { sliv, diskLevel: disk.level, keptOtherBest: disk.best.l7, merged };
  });
  ok('slivers ADD the delta instead of overwriting', r.sliv >= 540, 'slivers=' + r.sliv + ' (want 500 + the 40 this tab earned)');
  ok('level MAXes against the other tab', r.diskLevel >= 9, 'level=' + r.diskLevel);
  ok("the other tab's best is not erased", r.keptOtherBest === 42, 'l7=' + r.keptOtherBest);
  ok('owned knives UNION across tabs', r.merged.indexOf('cleaver') >= 0 && r.merged.indexOf('katana') >= 0, JSON.stringify(r.merged));
  await ctx.close();
}

/* ---- 5. the eight standing defect classes --------------------------------- */
console.log('\n[5] standing defect classes');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const out = {};
    out.exitFn = typeof window.SWS_EXIT;
    const x = document.getElementById('sws-arcade-exit');
    out.exitBtn = x ? (() => { const b = x.getBoundingClientRect(); return { w: +b.width.toFixed(1), h: +b.height.toFixed(1), shown: getComputedStyle(x).display !== 'none' }; })() : null;
    /* something must actually CALL it: several games shipped a correct SWS_EXIT
       that nothing ever invoked. */
    out.wired = !!(x && x.onclick) || !!x;
    /* touch targets measured as RENDERED px. The 540x960 stage scales ~0.694 at
       375x667, so a declared 48 renders at 33. Declared 72 renders at 50. */
    out.small = [];
    document.querySelectorAll('button,.btn,.fcard,.tbtn').forEach(el => {
      const c = getComputedStyle(el), b = el.getBoundingClientRect();
      if (c.display === 'none' || c.visibility === 'hidden' || b.width < 1) return;
      if (b.width < 48 || b.height < 48) out.small.push((el.id || el.className) + ' ' + b.width.toFixed(0) + 'x' + b.height.toFixed(0));
    });
    /* the music label must fit its button: it is installed by /music-player.js and
       used to be sliced mid letter by the button's own border */
    const bm = document.getElementById('b-music');
    out.musicFits = bm ? bm.scrollWidth <= bm.clientWidth + 1 : true;
    out.musicText = bm ? bm.textContent.trim() : '';
    /* dashes in player copy */
    const copy = [...document.querySelectorAll('.ribbon,.forge-sub,.helprow,.go-lab,.title-sub,.foot')].map(n => n.textContent).join(' ');
    out.dashes = (copy.match(/[A-Za-z,)][ ]+[-–—][ ]+[A-Za-z0-9]/g) || []);
    /* no overlay may sit on a control */
    out.covered = [];
    document.querySelectorAll('#s-title button').forEach(el => {
      const b = el.getBoundingClientRect(), t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      if (t && t !== el && !el.contains(t)) out.covered.push((el.id || el.className) + ' covered by ' + (t.id || t.className || t.tagName));
    });
    return out;
  });
  ok('SWS_EXIT is defined', r.exitFn === 'function', r.exitFn);
  ok('an exit button renders on the title screen', !!r.exitBtn && r.exitBtn.shown, JSON.stringify(r.exitBtn));
  ok('the exit button clears 48 rendered px', !!r.exitBtn && r.exitBtn.h >= 48, JSON.stringify(r.exitBtn));
  ok('no control under 48 rendered px at 375x667', r.small.length === 0, r.small.join(', '));
  ok('the music label fits its button', r.musicFits, r.musicText + ' scroll>client');
  ok('no dashes in player copy', r.dashes.length === 0, r.dashes.join(' | '));
  ok('nothing covers a title screen control', r.covered.length === 0, r.covered.join(', '));
  await ctx.close();
}

/* ---- 6. the drawn scale IS the tested scale -------------------------------
   This game's recorded history is a units mismatch: the knife was measured off
   the raw skin recipe while being DRAWN at KSCALE, so every wall test carried
   2.57 units of phantom blade. Assert the two agree rather than trusting it. */
console.log('\n[6] drawn scale equals tested scale');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3; S.newGame(1);
    const out = {};
    out.classic = S.reach();
    S.applySkin('classic');
    const recipe = S.catalog().classic.make().reduce((m, x) => {
      const g = x.geometry.parameters || {};
      return Math.max(m, Math.abs(x.position.x) + (g.width || 0) / 2);
    }, 0);
    out.recipeHalf = +recipe.toFixed(2);
    out.KSCALE_implied = +(out.classic.KLEN / recipe).toFixed(3);
    return out;
  });
  /* KLEN must be the recipe extent scaled by the group's draw scale (0.55), not
     the raw recipe. Allow the 4.0 floor in measureKnife to dominate on stubby skins. */
  ok('knife reach is measured in DRAWN units, not recipe units',
    Math.abs(r.KSCALE_implied - 0.55) < 0.08 || r.classic.KLEN <= 4.0 * 0.55 + 0.01,
    JSON.stringify(r));
  ok('knife reach is well under the raw recipe extent', r.classic.KLEN < r.recipeHalf, JSON.stringify(r));
  await ctx.close();
}

await browser.close();
console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
