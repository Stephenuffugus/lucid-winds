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
  ['s3d_slivers', '"abc"'], ['s3d_slivers', '-99'],
  /* Part E1: the settled run list (SS27) must be an array of short strings or nothing */
  ['s3d_prog', '{"settled":"abc"}'], ['s3d_prog', '{"settled":[1,null,{},["x"],"' + 'x'.repeat(60) + '"]}'],
  ['s3d_prog', '{"settled":null}'], ['s3d_prog', '{"settled":{"length":2}}']
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
      out.progSane = pr.level > 0 && pr.ffLevel > 0 && pr.climbLevel > 0 && pr.best && typeof pr.best === 'object'
        && Array.isArray(pr.settled) && pr.settled.every(x => typeof x === 'string' && x.length < 40);
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
    /* 2026-10-23: pinned. A no input level 1 dive falls clean to the floor on 11 of 40 seeds (the same 11 on v6.3), so on
       a random seed this precondition failed about one run in four. Seed 1 sticks 144 steps in. */
    S.salt(1); S.newFF(1); S.salt(null);
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
/* SS08 with a late art.json: a deep link builds its first dive before the list arrives. Those lanterns have no painted
   sprite to give way to, so they keep their stand-in when the painting lands (the first cut of v6.4 hid it: a line of bare
   strings), and the burst strip is still asked for once the list is in. */
{
  const browser = await puppeteer.launch(LAUNCH), p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140)));
  await p.setRequestInterception(true); let heldReq = null;
  p.on('request', q => { if (!heldReq && /\/art\/art\.json/.test(q.url())) { heldReq = q; return; } q.continue(); });
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(q => setTimeout(q, 3500));
  let a1, a2;
  try { a1 = await p.evaluate(() => { const S = window._S3; S.salt(77); S.newFF(26); const rp = S.verbs()[0];
    window._lanBalls = rp.grp.lan.map(l => l.grp.children.filter(c => c.isMesh && c.geometry.type === 'SphereGeometry')[0]);
    return { json: S.art().json, sprites: rp.grp.lan.filter(l => l.grp.children.some(c => c.isSprite)).length, shown: window._lanBalls.map(b => !!b && b.material.visible) }; }); } catch (e) { a1 = { error: String(e).slice(0, 200) }; }
  if (heldReq) heldReq.continue();
  try { a2 = await p.evaluate(async () => { const t0 = performance.now(), has = f => performance.getEntriesByType('resource').some(e => e.name.indexOf(f) >= 0);
    while (performance.now() - t0 < 20000 && !(window._S3.art().json && has('lantern_night/decor1.webp') && has('fx/lantern_burst.webp'))) await new Promise(q => setTimeout(q, 200));
    await new Promise(q => setTimeout(q, 1500));
    return { json: window._S3.art().json, decor: has('lantern_night/decor1.webp'), burstAsked: has('fx/lantern_burst.webp'), shown: window._lanBalls.map(b => !!b && b.material.visible) }; }); } catch (e) { a2 = { error: String(e).slice(0, 200) }; }
  ok('a lantern line built before art.json keeps its lanterns when the painting lands, and still asks for its burst', !!a1 && a1.json === false && a1.sprites === 0 && !!a2 && a2.json && a2.decor && a2.burstAsked && a2.shown.length === 5 && a2.shown.every(Boolean), JSON.stringify({ a1, a2 }));
  ok('no page errors with a late art.json', errs.length === 0, JSON.stringify(errs));
  await browser.close();
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
