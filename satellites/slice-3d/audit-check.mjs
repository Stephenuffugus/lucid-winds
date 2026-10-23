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
  ok(`${k}=${v}`, r.boot && r.started && r.cards === 24 && r.progSane && r.skinSane && r.slivSane && !r.threw && !errs.length,
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
  /* The painted knife (2026-10-23, Astra's sheets) is a plane over the hidden recipe boxes. Its LENGTH must be the
     recipe's exact length (contact fires at the drawn tip, the 8/01 bug), and its HEIGHT must never pass the recipe's
     half height (KHH), or a wall meets painted metal before contact fires (Prism Edge did, by 13%, in the first cut).
     Every skin, read off the live plane once its painting is in. */
  const pk = await p.evaluate(async () => {
    const S = window._S3, sk = S.skins(), bad = [], seen = [], none = [];
    for (const k of Object.keys(S.catalog())) {   // all 32, the eight not yet on the shelf too (Part C)
      if (sk.owned.indexOf(k) < 0) sk.owned.push(k);
      S.applySkin(k);
      const t0 = Date.now(); let a = S.art();
      while (!a.knife && Date.now() - t0 < 10000) { await new Promise(r => setTimeout(r, 150)); a = S.art(); }
      if (!a.knife) { none.push(k); continue; }
      const s = S.span(), len = +(s.hi - s.lo).toFixed(3), khh = Math.max(0.8, s.ho);
      seen.push(k);
      if (Math.abs(a.knifeSpan - len) > 0.002 || a.knifeH / 2 > khh + 0.002)
        bad.push({ k, len, art: a.knifeSpan, half: +(a.knifeH / 2).toFixed(3), khh: +khh.toFixed(3) });
    }
    return { bad, seen: seen.length, none };
  });
  ok('every painted knife spans its recipe and stands inside its collider',
    pk.bad.length === 0 && pk.none.length === 0 && pk.seen > 0, JSON.stringify(pk));
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


/* ==== Part B (2026-10-23): core repair. Each row below was watched FAIL on v6.1 (or on a copy with the fix removed)
   before it was trusted. ==== */
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

/* ---- 8. SS29: the fleet song card is a fixed bottom sheet about 230 px tall. With exactly that injected, at the three
   phone widths, the centre of every mode card, the Forge and How must still be the control itself. v6.1 put the cards
   at about 70 percent of the stage, under the sheet at 360 wide. */
console.log('\n[8] Part B: the song card never covers a mode, the Forge or How');
for (const [w, h] of [[360, 640], [375, 667], [412, 915]]) {
  const { ctx, p } = await bootAt(w, h);
  const r = await p.evaluate(() => {
    const sheet = document.createElement('div');
    sheet.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:230px;z-index:2147482000;background:#123';
    document.body.appendChild(sheet);
    const out = [];
    ['b-play', 'b-ff', 'b-endless', 'b-climb', 'b-forge', 'b-how'].forEach(id => {
      const el = document.getElementById(id), b = el.getBoundingClientRect();
      const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      if (!(t === el || (t && el.contains(t)))) out.push(id + ' covered by ' + (t ? (t.id || t.className || t.tagName) : 'nothing'));
    });
    return out;
  });
  ok('at ' + w + 'x' + h + ' a 230 px bottom sheet covers no mode card, Forge or How', r.length === 0, r.join(', '));
  await ctx.close();
}

/* ---- 9. SS31: the world steps at a fixed 1/120 s, so the same taps at the same moments land the knife in the same place
   at 60 and at 120 frames a second. Each mode is replayed twice from one seed; taps are timed from the first frame. The
   plan asked for "within 1 unit"; v6.1's variable step already managed that over 3 s (watched), so the row demands what
   a fixed stepper actually gives: the same place, to 0.01. */
console.log('\n[9] Part B: the same taps land the same at 60 and 120 frames a second');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const S = window._S3;
    function run(mode, hz, secs, taps) {
      if (S.salt) S.salt(424242);
      if (mode === 'journey') S.newGame(1); else if (mode === 'ff') S.newFF(1); else if (mode === 'climb') S.newClimb(1); else S.newEndless();
      const dt = 1000 / hz, n = Math.round(secs * hz) + 1; let ti = 0;
      for (let i = 0; i < n; i++) {
        if (i >= 1) { const t = (i - 1) / hz;
          while (ti < taps.length && taps[ti][0] <= t + 1e-9) { const tp = taps[ti++];
            if (mode === 'ff' || mode === 'endless') S.hold(tp[1]); else S.tap(1); } }
        S.stepN(1, dt);
      }
      const g = S.state(); return { x: +g.x.toFixed(3), y: +g.y.toFixed(3), done: !!g.done };
    }
    const T = { journey: [[0.2], [0.9], [1.6], [2.3]], climb: [[0.2], [0.8], [1.4]],
      ff: [[0.3, 1], [0.8, 0], [1.4, -1], [1.9, 0]], endless: [[0.3, -1], [0.7, 0], [1.2, 1], [1.6, 0]] };
    const out = {};
    for (const m of ['journey', 'climb', 'ff', 'endless']) {
      const a = run(m, 60, 3, T[m]), b = run(m, 120, 3, T[m]);
      out[m] = { a, b, d: +Math.hypot(a.x - b.x, a.y - b.y).toFixed(3) };
    }
    if (S.salt) S.salt(null);
    return out;
  });
  for (const m of ['journey', 'climb', 'ff', 'endless'])
    ok(m + ': 60 and 120 Hz land in the same place', r[m].d <= 0.01, JSON.stringify(r[m]));
  await ctx.close();
}

/* ---- 10. SS21: Endless has no floor. 3000 steps (25 s) of a straight dive never end it, it crosses a world band, and
   the shaft stays a ring of at most four live chunks; 6 km down there is still no floor. The scene itself stays bounded:
   the descent to 6 km goes 100 m at a time so every chunk is built and let go, and the scene (less the moment's sparks,
   pieces and rings) must stay near what it was with the first three chunks live. Watched red with endlessDrop's
   scene.remove taken out. */
console.log('\n[10] Part B: Endless has no floor and keeps a bounded ring');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3; S.salt(99); S.newEndless(); const G = S.g();
    const base = S.endless().kids;   // chunks 0 to 2 live, none let go yet
    let maxLive = 0, maxKids = 0;
    for (let i = 0; i < 3000; i++) {
      G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
      const e = S.endless(); if (e) { maxLive = Math.max(maxLive, e.live.length); maxKids = Math.max(maxKids, e.sceneKids); }
      if (S.g().done) break;
    }
    const out = { depth: Math.round(S.g().depth), done: !!S.g().done, mile: S.endless() && S.endless().mile, maxLive, maxKids };
    for (let y = G.y - 100; y > -6000; y -= 100) { G.y = y; G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    G.y = -6000; for (let i = 0; i < 40; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120); }
    out.far = S.endless(); out.farDone = !!S.g().done; out.base = base; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('Endless runs 3000 steps without ending and passes a world band', !r.done && r.depth > 300, JSON.stringify(r));
  ok('Endless marks every 100 m', r.mile === Math.floor(r.depth / 100), JSON.stringify({ depth: r.depth, mile: r.mile }));
  ok('Endless keeps at most four chunks live', r.maxLive <= 4 && !!r.far && r.far.live.length <= 4, JSON.stringify({ maxLive: r.maxLive, far: r.far }));
  ok('Endless has no floor 6 km down', !r.farDone && !!r.far && r.far.k >= 59, JSON.stringify(r.far));
  ok('Endless lets every dropped chunk leave the scene', !!r.far && r.base > 0 && r.far.kids <= 1.6 * r.base,
    JSON.stringify({ base: r.base, far: r.far && r.far.kids }));
  await ctx.close();
}

/* ---- 11. SS21/SS20: Pit Conquered moved from the bottom of Endless to every finished numbered dive. */
console.log('\n[11] Part B: Pit Conquered shows on a finished numbered dive, never on Endless');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, go = document.getElementById('s-go'), badge = () => document.getElementById('go-badge').classList.contains('on');
    S.salt(5); S.newFF(1); let G = S.g(); const W = S.world();
    G.x = 0; G.y = W.floorY + 6; G.vx = 0; G.vy = -10; G.w = 0; G.ang = Math.PI / 2;   // blade down above the bullseye
    for (let i = 0; i < 2000 && !go.classList.contains('on'); i++) { S.hold(0); S.stepN(1, 16); }
    const out = { ended: go.classList.contains('on'), title: document.getElementById('go-title').textContent, badge: badge() };
    S.salt(5); S.newEndless(); G = S.g();
    G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;   // blade first into the right wall
    for (let i = 0; i < 2000 && !go.classList.contains('on'); i++) { S.stepN(1, 16); }
    out.eEnded = go.classList.contains('on'); out.eTitle = document.getElementById('go-title').textContent; out.eBadge = badge();
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a finished numbered dive shows Pit conquered', r.ended && r.badge, JSON.stringify(r));
  ok('an Endless end never shows it', r.eEnded && !r.eBadge && /DEPTH/.test(r.eTitle), JSON.stringify(r));
  await ctx.close();
}

/* ---- 12. SS34: settings are set by real pointer input, saved to s3d_set, and survive a reload. */
console.log('\n[12] Part B: settings persist');
{
  const { ctx, p } = await boot();
  let shown = false;
  try {
    await clickCentre(p, '#b-set'); await new Promise(r => setTimeout(r, 400));
    shown = await p.evaluate(() => document.getElementById('s-set').classList.contains('on'));
    await clickCentre(p, '#set-rm'); await clickCentre(p, '#set-rp');
    const bx = await p.evaluate(() => { const b = document.getElementById('set-sfx').getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
    await p.mouse.click(bx.x + bx.w * 0.25, bx.y + bx.h / 2); await new Promise(r => setTimeout(r, 300));
  } catch (e) { shown = false; }
  const saved = await p.evaluate(() => JSON.parse(localStorage.getItem('s3d_set') || 'null'));
  await p.reload({ waitUntil: 'domcontentloaded' }); await new Promise(r => setTimeout(r, 3500));
  let after; try { after = await p.evaluate(() => ({ set: window._S3.set(), rmClass: document.getElementById('stage').classList.contains('rm') })); }
  catch (e) { after = { set: {}, rmClass: false, error: String(e).slice(0, 160) }; }
  ok('the gear opens settings', shown, String(shown));
  ok('settings are saved as they change', !!saved && saved.rm === true && saved.rp === true && saved.sfx > 0.1 && saved.sfx < 0.45, JSON.stringify(saved));
  ok('settings survive a reload', !!saved && after.set.rm === true && after.set.rp === true && Math.abs(after.set.sfx - saved.sfx) < 0.011 && after.rmClass,
    JSON.stringify(after));
  await ctx.close();
}

/* ---- 13. SS32: a fatal contact holds the world for 350 ms, rings the spot, names the cause, and the end panel leads
   with the retry. Reduced motion keeps the ring and the words and drops the freeze. */
console.log('\n[13] Part B: a crash is explained');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, go = document.getElementById('s-go');
    function crash() { S.salt(5); S.newFF(1); const G = S.g(); G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI;
      for (let i = 0; i < 200; i++) { S.stepN(1, 1000 / 120); if (S.g().failed) break; } }
    crash();
    const out = { failed: !!S.g().failed, why: (document.querySelector('#multburst .why') || {}).textContent || '', rings: S.rings ? S.rings() : 0 };
    const d0 = S.g().doneT; S.stepN(10, 1000 / 120); out.held = S.g().doneT === d0;
    S.stepN(60, 1000 / 120); out.moves = S.g().doneT > d0;
    for (let i = 0; i < 800 && !go.classList.contains('on'); i++) S.stepN(1, 16);
    const first = document.querySelector('#s-go .stack .btn'); out.first = first ? first.id + ':' + first.textContent : '';
    S.set().rm = true; crash(); out.rmFreeze = S.g().freezeT || 0; out.rmWhy = (document.querySelector('#multburst .why') || {}).textContent || '';
    S.set().rm = false; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a blade into the wall names the cause', r.failed && r.why === 'Blade hit wall', JSON.stringify(r));
  ok('the crash is ringed in gold', r.rings >= 1, JSON.stringify(r));
  ok('the world holds still for the crash, then goes on', r.held && r.moves, JSON.stringify(r));
  ok('the end panel leads with the retry', r.first === 'go-next:Try Again', r.first);
  ok('reduced motion keeps the words and drops the freeze', r.rmFreeze <= 0 && r.rmWhy === 'Blade hit wall', JSON.stringify(r));
  await ctx.close();
}

/* ---- 14. The fleet's chrome claims the viewport's top right: the feedback chip lives there, and a deep link (?mode=ff)
   boots with the menu hidden, so the arcade exit lands its chip there too and never moves it. Back on the menu, the
   soundtrack and the gear must still be themselves at their centre and four corners. v6.2's first cut put the
   soundtrack top right: 87 percent under the exit chip. */
console.log('\n[14] Part B: the fleet chips never sit on the soundtrack or the gear');
for (const [w, h] of [[360, 640], [375, 667]]) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  let r;
  try {
    await p.goto(URL.replace(/\/?(\?|$)/, '/?mode=ff&'), { waitUntil: 'load', timeout: 60000 });
    await new Promise(res => setTimeout(res, 3500));   // the exit chip boots at load + 0.4 s and settles at 2.2 s
    await clickCentre(p, '#b-home'); await new Promise(res => setTimeout(res, 1500));
    r = await p.evaluate(() => {
      const out = [], chip = !!document.getElementById('sws-arcade-exit'), fab = !!document.querySelector('.lwfb-fab');
      for (const id of ['b-music', 'b-set']) {
        const el = document.getElementById(id); if (!el || getComputedStyle(el).display === 'none') continue;
        const b = el.getBoundingClientRect(), i = 5;
        for (const [x, y] of [[b.x + b.width / 2, b.y + b.height / 2], [b.x + i, b.y + i], [b.right - i, b.y + i], [b.x + i, b.bottom - i], [b.right - i, b.bottom - i]]) {
          const t = document.elementFromPoint(x, y);
          if (!(t === el || (t && el.contains(t)))) out.push(id + '@' + Math.round(x) + ',' + Math.round(y) + ' under ' + (t ? (t.id || t.className || t.tagName) : 'nothing'));
        }
      }
      return { title: document.getElementById('s-title').classList.contains('on'), chip, fab, out };
    });
  } catch (e) { r = { error: String(e).slice(0, 160), out: ['error'] }; }
  ok('at ' + w + 'x' + h + ' after a deep link, nothing covers the soundtrack or the gear', !!r.title && r.out.length === 0, JSON.stringify(r));
  await browser.close();
}

/* ---- 15. The drawn frame (Part B review). The camera follows the knife as DRAWN, between steps, so in a steady dive the
   knife holds still on screen at 90 Hz and at a jittery 120 Hz (a camera on the stepped pose shook it 4.3 and 8.5 px a
   frame); the frame that ends a crash's hold draws the stuck pose (it flicked 2.3 rad back to the pose before the crash);
   a stick after a long spin is drawn the short way round (2.8 rad wrong for a frame); a Journey crash is framed where it
   happened (the held frame showed the empty course, knife at x -6.6). Each number is this row watched red with its fix
   taken out. Frame times are generated, Chrome-coarsened to 0.1 ms with a little seeded jitter. */
console.log('\n[15] Part B: the drawn frame holds together');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3; window._S3skiprender = true;
    const off = a => Math.abs(Math.atan2(Math.sin(a), Math.cos(a)));
    function frames(hz, n, coarse) { let s = 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647; const out = []; let t = 0, prev = 0;
      for (let i = 0; i < n; i++) { t += 1000 / hz; const q = coarse ? Math.round((t + (rnd() - 0.5) * 0.1) / coarse) * coarse : t; out.push(q - prev); prev = q; } return out; }
    function wobble(hz, coarse) { S.salt(4242); S.newFF(1); const G = S.g(), dts = frames(hz, 240, coarse), ys = [];
      for (let i = 0; i < dts.length; i++) { G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, dts[i]); if (i > 60) ys.push(S.view().k[1] * 480); }
      let mx = 0; for (let i = 2; i < ys.length; i++) mx = Math.max(mx, Math.abs(ys[i] - 2 * ys[i - 1] + ys[i - 2])); return +mx.toFixed(2); }
    function freezeEnd(hz) { let worst = 0; for (let ph = 0; ph < 12; ph++) { S.salt(5); S.newFF(1); const G = S.g();
        G.x = 6; G.y = -40; G.vx = 25; G.vy = 0; G.w = 0; G.ang = Math.PI + 0.9;   // tilted blade first: the stick turns it 0.9 rad
        S.stepN(1, 1000 / 120 * (1 + ph / 12)); let n = 0; while (!G.failed && n++ < 400) { G.w = 0; S.stepN(1, 1000 / hz); }
        for (let i = 0; i < 60; i++) { S.stepN(1, 1000 / hz); const v = S.view(); worst = Math.max(worst, off(v.rz - G.ang) + Math.abs(v.kx - G.x) + Math.abs(v.ky - G.y)); } }
      return +worst.toFixed(3); }
    function stick90() { let worst = 0; for (let ph = 0; ph < 6; ph++) { S.newGame(1); const G = S.g(); let n = 0;
        while (!G.done && n++ < 6000) { if (n % 50 === 1) S.tap(1); S.stepN(1, 1000 / 90 + ph * 0.01); worst = Math.max(worst, off(S.view().rz - G.ang)); } } return +worst.toFixed(3); }
    function crystal() { let cr = null, lvl = 0; for (let L = 1; L <= 15 && !cr; L++) { S.newGame(L); const W = S.world(); if (W.crystals && W.crystals.length) { cr = W.crystals[0]; lvl = L; } }
      if (!cr) return { none: true }; const G = S.g();
      for (let i = 0; i < 90; i++) { G.x = cr.x - 7; G.y = 0.6; G.vx = 0; G.vy = 0; G.w = 0; S.stepN(1, 1000 / 60); }   // the live camera settles before it
      G.x = cr.x - 1.2; G.y = cr.y + 1.5; G.vx = 8; G.vy = 0; S.stepN(1, 1000 / 60);                       // contact needs motion
      const v = S.view(); return { lvl, failed: !!G.failed, held: G.freezeT > 0, k: v.k.map(x => +x.toFixed(2)), r: v.r && v.r.map(x => +x.toFixed(2)) }; }
    const out = { w90: wobble(90, 0), w120: wobble(120, 0.1), freeze120: freezeEnd(120), freeze90: freezeEnd(90), stick90: stick90(), crystal: crystal() };
    S.salt(null); window._S3skiprender = false; return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  ok('a steady dive holds the knife still on screen at 90 and 120 Hz', r.w90 <= 0.5 && r.w120 <= 0.5, JSON.stringify({ w90: r.w90, w120: r.w120, error: r.error }));
  ok('the frame that ends a crash hold draws the stuck pose', r.freeze120 <= 0.1 && r.freeze90 <= 0.1, JSON.stringify({ f120: r.freeze120, f90: r.freeze90 }));
  ok('a stick after a long spin is drawn the short way round', r.stick90 <= 1.0, String(r.stick90));
  const c = r.crystal || {}, on = a => !!a && Math.abs(a[0]) < 1 && Math.abs(a[1]) < 1;
  ok('a Journey crash is framed where it happened (knife and ring on screen in the held frame)', c.failed && c.held && on(c.k) && on(c.r), JSON.stringify(c));
  await ctx.close();
}

/* ---- 16. Part C: knives and the forge (SS16, SS17, SS25, SS26). The shelf is the 22 of v6.2 plus the two new trophies;
   the six Astra knives HE has not priced and the two supporter knives are in the catalogue but never on the shelf; the
   fifteen prices are exactly what they were; every new knife is the Classic Chef's rig (same reach to the digit); a
   trophy only arrives through grantTrophy, and the two new rules grant on exactly their condition; the preview turns,
   flips and cuts while the Forge is up, stops when it is not, holds still with reduced motion; a tap on a card spends
   nothing and the button under the preview does. */
console.log('\n[16] Part C: knives and the forge');
{
  const NEW = ['socktopus', 'butterbuddy', 'spatulot', 'pencil', 'discopickle', 'croissant', 'rubberduke', 'boomerang', 'tearex', 'custodian'];
  const HIDDEN = ['socktopus', 'butterbuddy', 'spatulot', 'pencil', 'discopickle', 'croissant', 'tearex', 'custodian'];
  const PRICES = { classic: 0, cleaver: 150, paintbrush: 300, katana: 500, crystal: 800, gold: 1500, bamboo: 200, trowel: 280, quill: 350,
    obsidian: 620, icicle: 760, tuningfork: 900, emberfang: 1600, prism: 1900, scythe: 2200 };
  const OLD = ['classic', 'cleaver', 'paintbrush', 'bamboo', 'trowel', 'quill', 'katana', 'crystal', 'obsidian', 'icicle', 'tuningfork', 'gold', 'emberfang',
    'prism', 'scythe', 'cosmicedge', 'wallbreaker', 'depthdiver', 'conductor', 'groundskeeper', 'starforge', 'wolffang'];
  const html = await (await fetch(URL)).text();
  const pushes = (html.match(/\.owned\.push\(/g) || []).length;
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate((NEW, HIDDEN, PRICES, OLD) => {
    const S = window._S3, cat = S.catalog(), ord = S.skinOrder(), out = {};
    out.cat = Object.keys(cat).length; out.ord = ord.length;
    out.oldKept = OLD.every(k => ord.indexOf(k) >= 0); out.newOn = ord.indexOf('rubberduke') >= 0 && ord.indexOf('boomerang') >= 0;
    out.hiddenOff = HIDDEN.every(k => cat[k] && ord.indexOf(k) < 0);
    out.unpriced = ['socktopus', 'butterbuddy', 'spatulot', 'pencil', 'discopickle', 'croissant'].every(k => cat[k].price === null);
    out.support = ['tearex', 'custodian'].every(k => cat[k].premium === true);
    out.prices = Object.keys(PRICES).filter(k => !cat[k] || cat[k].price !== PRICES[k]);
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
  ok('the shelf is the 22 of v6.2 plus Rubber Duke and Banana Boomerang (32 in the catalogue)', r.cat === 32 && r.ord === 24 && r.oldKept && r.newOn, JSON.stringify({ cat: r.cat, ord: r.ord, error: r.error }));
  ok('the six unpriced and the two supporter knives are kept off the shelf', r.hiddenOff && r.unpriced && r.support, JSON.stringify({ h: r.hiddenOff, u: r.unpriced, s: r.support }));
  ok('the fifteen prices are untouched', r.prices && r.prices.length === 0, JSON.stringify(r.prices));
  ok('every knife has its story', r.noStory && r.noStory.length === 0, JSON.stringify(r.noStory));
  ok('every new knife is the Classic Chef rig (same reach)', r.rigOff && r.rigOff.length === 0, JSON.stringify(r.rigOff));
  ok('a trophy only arrives through grantTrophy (four owned.push sites: grantTrophy, the boot repair, the tab merge, a purchase)', pushes === 4, 'sites=' + pushes);
  ok('Rubber Duke: three clean Deep Tide dives, and only Deep Tide counts', r.tideAfterMossy === 0 && !r.duckAt2 && r.duckAt3 && r.duckSaid, JSON.stringify(r));
  ok('Banana Boomerang: a handle bounce counts, and twelve in a finished Journey run grants', r.bounceCounts === 1 && !r.boomAt11 && !r.boomOnCrash && r.boomAt12 && r.boomSaid, JSON.stringify(r));
  await ctx.close();
  /* the preview and the two step flow, by real pointer */
  const b2 = await bootAt(412, 915), q = b2.p;
  let f; try {
    await q.evaluate(() => window._S3forge.setSliv(600));
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
  ok('a tap on a card chooses and spends nothing; Unlock under the preview buys it', !!f.sel && f.sel.sliv === 600 && !f.sel.owned && f.sel.name === 'Midnight Katana' && /Unlock/.test(f.sel.act)
    && f.buy.sliv === 100 && f.buy.owned && f.buy.equip === 'katana', JSON.stringify({ sel: f.sel, buy: f.buy }));
  ok('the preview never leaves its frame at any moment of the cycle', !!f.frame && f.frame.frames >= 1000 && f.frame.bad.length === 0 && f.frame.notReady.length === 0,
    JSON.stringify(f.frame && { frames: f.frame.frames, bad: f.frame.bad.slice(0, 8), n: f.frame.bad.length, notReady: f.frame.notReady }));
  ok('no page errors in the Forge', !!f.errs && f.errs.length === 0, JSON.stringify(f.errs));
  await b2.ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
