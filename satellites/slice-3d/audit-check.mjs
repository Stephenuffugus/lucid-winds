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
    /* ⛔ The first version of this check asserted `onDisk >= cut` on a dive that cut
       ZERO slabs, so it read 0 >= 0 and passed no matter what the game did. A check
       that cannot go red is not evidence. Inject a KNOWN tally and a KNOWN best
       combo first, wipe the save file, then demand that the fail path put them on
       disk. Now the only way to pass is for failLevel() to actually save. */
    localStorage.removeItem('s3d_prog');
    S.prog().slabsCut = 7;          // pretend this dive cut 7 slabs
    S.prog().bestCombo = 0;
    S.newFF(1);
    const g0 = S.state(); if (g0) g0.comboBest = 9;   // and reached a combo of 9
    const go = document.getElementById('s-go');
    const t0 = Date.now();
    for (let i = 0; i < 8000; i++) { const g = S.state(); if (!g) break; S.stepN(1, 16); if (go.classList.contains('on')) break; if (Date.now() - t0 > 90000) break; }
    /* 2026-08-21: the shaft is salted per attempt now, so a no-input dive may
       cut any number of slabs on the way down before it sticks. Expectations
       come from the LIVE tallies at fail time (slabsCut ticks up as slabs are
       cut, comboBest lives on G); the check still goes red if failLevel()
       never writes them to disk. */
    const expSlabs = S.prog().slabsCut;
    const expCombo = Math.max(9, S.prog().bestCombo || 0);
    const raw = localStorage.getItem('s3d_prog');
    let disk = null; try { disk = JSON.parse(raw); } catch (e) {}
    return {
      failed: /STUCK/.test(document.getElementById('go-title').textContent),
      wroteAnything: raw != null,
      expSlabs, expCombo,
      onDisk: disk ? (disk.slabsCut === undefined ? -1 : disk.slabsCut) : -1,
      bestCombo: disk ? (disk.bestCombo === undefined ? -1 : disk.bestCombo) : -1,
      detail: document.getElementById('go-detail').textContent
    };
  });
  ok('the dive really did fail (precondition)', r.failed, JSON.stringify(r));
  ok('a failed dive writes PROG to disk at all', r.wroteAnything, JSON.stringify(r));
  ok('slabs cut on a failed dive reach disk', r.onDisk === r.expSlabs && r.onDisk >= 7, JSON.stringify(r));
  ok('best combo on a failed dive reaches disk', r.bestCombo === r.expCombo && r.bestCombo >= 9, JSON.stringify(r));
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
    /* The music label is installed by /music-player.js ("\u266b Music") and used to be
       sliced mid letter by the button's own rounded border.
       ⛔ scrollWidth <= clientWidth is NOT the check. On the broken build those were
       EQUAL (94 == 94) because the flex item had grown to its min-content width —
       nothing "overflowed", the glyphs simply ran edge to edge against the border
       with the global reset's padding:0. That assertion could never go red, which
       makes it decoration. Measure the real clearance between the rendered TEXT and
       the button's border box instead, and demand breathing room. */
    const bm = document.getElementById('b-music');
    out.musicText = bm ? bm.textContent.trim() : '';
    out.musicClear = null;
    if (bm && bm.firstChild) {
      const rng = document.createRange(); rng.selectNodeContents(bm);
      const t = rng.getBoundingClientRect(), b = bm.getBoundingClientRect();
      out.musicClear = { left: +(t.left - b.left).toFixed(1), right: +(b.right - t.right).toFixed(1), btnW: +b.width.toFixed(1), txtW: +t.width.toFixed(1) };
    }
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
  ok('the music label has real clearance inside its button',
    !!r.musicClear && r.musicClear.left >= 5 && r.musicClear.right >= 5,
    '"' + r.musicText + '" ' + JSON.stringify(r.musicClear));
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

/* ---- 7. CLASS 9: read the copy, then check the code does what it says ------
   The cheapest defect class on this project and the one that pays out most: a
   sentence that is simply not true, invisible to every other check because
   nothing is broken. Grep the claim, then grep the thing the claim depends on.
   Two live claims in this game were false on 2026-08-16:
     - The Forge promised every knife "is pure style and never changes how you
       play". measureKnife() feeds KLEN into kReachX, which is what every wall
       contact tests, and the catalog spans 3.03 to 3.66 world units — 20.9%,
       with a PREMIUM knife on the long end.
     - How-to-play promised the climb wall had "no ceiling" and that "the bands
       keep going", while buildClimb authors exactly 34 bands topping at x900 and
       the end panel prints "of x900" back at the player.
   Both were fixed in the COPY, not the mechanics. These assertions guard the
   fix from the direction it will actually regress: someone re-adding the claim. */
console.log('\n[7] class 9: the copy tells the truth about the code');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3, out = {};
    /* measure every knife in the catalog the way measureKnife measures the
       equipped one, so the claim is checked against numbers, not against faith */
    const cat = S.catalog(), reach = {};
    Object.keys(cat).forEach(k => {
      let lo = 0, hi = 0;
      cat[k].make().forEach(m => {
        const g = (m.geometry && m.geometry.parameters) || {}, w = g.width || 0;
        if (m.position.x - w / 2 < lo) lo = m.position.x - w / 2;
        if (m.position.x + w / 2 > hi) hi = m.position.x + w / 2;
      });
      reach[k] = +(Math.max(4.0, Math.abs(lo), hi) * 0.55).toFixed(3);
    });
    const vals = Object.keys(reach).map(k => reach[k]);
    out.minReach = Math.min.apply(null, vals);
    out.maxReach = Math.max.apply(null, vals);
    out.spreadPct = +((out.maxReach / out.minReach - 1) * 100).toFixed(1);
    out.forgeCopy = (document.querySelector('.forge-sub').textContent || '');
    out.howCopy = (document.getElementById('s-how').textContent || '');
    /* the climb ladder as the code actually authors it */
    S.newClimb(1);
    const w = S.world();
    out.bands = w && w.bands ? w.bands.length : 0;
    out.topMult = w && w.bands ? w.bands[w.bands.length - 1][0] : 0;
    return out;
  });
  ok('knife reach really does vary across the catalog', r.spreadPct > 1, JSON.stringify({ min: r.minReach, max: r.maxReach, spread: r.spreadPct }));
  ok('the Forge does not claim knives never change how you play',
    !/never changes how you play|pure style/i.test(r.forgeCopy), r.forgeCopy);
  ok('the Forge says what is actually true about reach',
    /measured/i.test(r.forgeCopy) && /reach/i.test(r.forgeCopy), r.forgeCopy);
  ok('the climb wall has a real, finite ladder', r.bands > 0 && r.topMult > 0, JSON.stringify({ bands: r.bands, top: r.topMult }));
  ok('How to play does not promise a ceiling the wall has',
    !/no ceiling|bands keep going/i.test(r.howCopy), (r.howCopy.match(/no ceiling|bands keep going/i) || [''])[0]);
  ok('How to play names the ladder the code actually builds',
    r.howCopy.indexOf('x' + r.topMult) >= 0 && r.howCopy.indexOf(String(r.bands) + ' bands') >= 0,
    JSON.stringify({ bands: r.bands, top: r.topMult }));
  await ctx.close();
}


console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
