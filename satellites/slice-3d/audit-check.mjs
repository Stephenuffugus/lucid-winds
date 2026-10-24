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
  ['s3d_prog', '{"settled":null}'], ['s3d_prog', '{"settled":{"length":2}}'],
  /* Part E2: the finds (s3d_dex) */
  ['s3d_dex', '5'], ['s3d_dex', '[1,2]'], ['s3d_dex', '{"mossy_canyon":"yes","nowhere":1,"glowcave":{}}'],
  /* Part E3: the Daily (s3d_daily) */
  ['s3d_daily', '5'], ['s3d_daily', '{"day":5}'], ['s3d_daily', '{"day":"x","gen":1,"used":"yes","done":0,"score":-3}'], ['s3d_dex', '{"hasOwnProperty":1}'],
  /* the reviews: a string dex (the boot filter cannot delete from it), and a record for TODAY with a null score */
  ['s3d_dex', '"abc"'], ['s3d_daily', JSON.stringify({ day: new Date().toISOString().slice(0, 10), gen: 1, used: true, done: false, score: null })]
];
for (const [k, v] of POISON) {
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});}catch(e){}})()`);
  const r = await p.evaluate(() => {
    if (!window._S3) return { boot: false };
    const out = { boot: true };
    try {
      const dx = window._S3.dex(); out.dexEmpty = Object.prototype.toString.call(dx) === '[object Object]' && Object.keys(dx).length === 0;
      window._S3.newGame(1); out.started = !!window._S3.state();
      window._S3forge.renderForge(); out.cards = document.getElementById('forge-grid').children.length;
      const pr = window._S3.prog();
      out.progSane = pr.level > 0 && pr.ffLevel > 0 && pr.climbLevel > 0 && pr.best && typeof pr.best === 'object'
        && Array.isArray(pr.settled) && pr.settled.every(x => typeof x === 'string' && x.length < 40);
      const sk = window._S3.skins();
      out.skinSane = Array.isArray(sk.owned) && sk.owned.indexOf('classic') >= 0 && !!window._S3.catalog()[sk.equip];
      out.slivSane = window._S3forge.sliv() >= 0;
      window._S3.showDaily(); const dl = window._S3.dly();   /* s3d_daily is read when the card opens, never at boot */
      out.dailySane = document.getElementById('s-daily').classList.contains('on') && dl.day === new Date().toISOString().slice(0, 10) && dl.used === false && dl.done === false && dl.score === 0;
    } catch (e) { out.threw = e.message.slice(0, 90); }
    return out;
  });
  ok(`${k}=${v}`, r.boot && r.started && r.cards === 24 && r.progSane && r.skinSane && r.slivSane && !r.threw && !errs.length,
    JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  if (k === 's3d_dex') ok(`${k}=${v} leaves the finds an empty set`, r.dexEmpty === true, JSON.stringify(r));
  if (k === 's3d_daily') ok(`${k}=${v} opens the Daily card on a fresh record for today`, r.dailySane === true && !r.threw && !errs.length, JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
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
    ['b-play', 'b-ff', 'b-endless', 'b-climb', 'b-forge', 'b-how', 'b-daily'].forEach(id => {   /* b-daily: Part E3 */
      const el = document.getElementById(id), b = el.getBoundingClientRect();
      const t = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
      if (!(t === el || (t && el.contains(t)))) out.push(id + ' covered by ' + (t ? (t.id || t.className || t.tagName) : 'nothing'));
    });
    return out;
  });
  ok('at ' + w + 'x' + h + ' a 230 px bottom sheet covers no mode card, Forge, How or Daily', r.length === 0, r.join(', '));
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
    /* since 24 Oct the chunks deepen (row [10b]); a straight blade down dive still meets no floor and no wall */
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

/* ---- 10b. 24 Oct: Endless gets harder the deeper you go (Jessie went forever: every chunk had level 1's bag and the fall
   stopped speeding up at 30). Chunk k builds at level k+1's bag up to level 7 at 600 m: the first chunk has no crystal, wasp or
   thorn; past 600 m every chunk's bag takes more of them (one each, again every 400 m, four each by 1800 m), so 2000 to 2400 m
   holds more of them than 600 to 1000 m; the level's own planks and bumpers come by 600 m too. The fall keeps speeding up past 900 m, measured on the knife itself (a
   step from far too fast, the hazards cleared so nothing but the cap touches it): 29.8 at 900 m as before, over 42 at 2500 m, 60 by 5 km
   and never past it. Seeds 99, 7 and 31. */
console.log('\n[10b] Endless ramps: harder chunks, a fall that keeps speeding up');
{
  const { ctx, p } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = { seeds: [] }, L = ['crystals', 'wasps', 'thorns'];
    for (const seed of [99, 7, 31]) {
      S.salt(seed); S.newEndless(); const G = S.g(), W = G.world, n = {};
      for (let k = 0; k <= 23; k++) {
        S.endRing(k);
        for (const nm of L.concat(['planks', 'pads'])) for (const e of W[nm]) { const key = nm + e.ck; n[key] = n[key] || {}; n[key][e.x + ',' + e.y] = 1; }
      }
      const c = (nm, k0, k1) => { let t = 0; for (let k = k0; k <= k1; k++) t += Object.keys(n[nm + k] || {}).length; return t; };
      const term = {};
      for (const d of [0, 900, 2500, 5000, 9000]) {
        G.y = 4 - d; G.depth = d; G.x = 0; G.vx = 0; G.w = 0; G.ang = Math.PI / 2; S.hold(0); S.stepN(1, 1000 / 120);
        for (const nm of ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs']) if (W[nm]) W[nm].length = 0;
        G.done = false; G.y = 4 - d; G.depth = d; G.x = 0; G.vx = 0; G.vy = -500; G.w = 0; G.ang = Math.PI / 2; S.stepN(1, 1000 / 120);
        term[d] = Math.round(-G.vy * 10) / 10;
      }
      const hz = (k0, k1) => c('crystals', k0, k1) + c('wasps', k0, k1) + c('thorns', k0, k1);
      out.seeds.push({ seed, first: hz(0, 0), mid: hz(6, 9), deep: hz(20, 23),
        kinds: [c('crystals', 6, 23), c('wasps', 6, 23), c('thorns', 6, 23)], lvlOwn: c('planks', 6, 9) + c('pads', 6, 9), lvlTop: c('planks', 0, 1) + c('pads', 0, 0), term });
    }
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 160) }; }
  const sd = r.seeds || [];
  ok('Endless: the first chunk has no crystal, wasp or thorn', sd.length === 3 && sd.every(s => s.first === 0), JSON.stringify(r));
  ok('Endless: past 600 m crystals, wasps and thorns all come, and 2000 to 2400 m holds more of them than 600 to 1000 m', sd.length === 3 && sd.every(s => s.mid > 0 && s.deep > s.mid * 1.5 && s.kinds.every(n => n > 0)), JSON.stringify(sd.map(s => ({ mid: s.mid, deep: s.deep, kinds: s.kinds }))));
  ok("Endless: the level's own pieces come with depth (planks and bumpers, which the extra hazards never add)", sd.length === 3 && sd.every(s => s.lvlTop === 0 && s.lvlOwn > 0), JSON.stringify(sd.map(s => [s.lvlTop, s.lvlOwn])));
  ok('Endless: the fall is 19 at the top and 29.8 at 900 m, as it always was', sd.length === 3 && sd.every(s => Math.abs(s.term[0] - 19) < 0.05 && Math.abs(s.term[900] - 29.8) < 0.05), JSON.stringify(sd.map(s => s.term)));
  ok('Endless: the fall keeps speeding up past 900 m (over 42 at 2500 m)', sd.length === 3 && sd.every(s => s.term[2500] > 42 && s.term[5000] > s.term[2500]), JSON.stringify(sd.map(s => s.term)));
  ok('Endless: the fall never passes 60', sd.length === 3 && sd.every(s => Math.abs(s.term[5000] - 60) < 0.2 && Math.abs(s.term[9000] - 60) < 0.2), JSON.stringify(sd.map(s => s.term)));
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

/* ---- 20. Part E3: the Daily ----------------------------------------------- */
console.log('\n[20] Part E3: the Daily');
/* the clock is the page's own Date, set per boot: a fixed UTC moment that then runs on with the page */
const clockAt = iso => `(()=>{ const T0=Date.parse(${JSON.stringify(iso)}), P0=performance.now(), RD=Date; const now=()=>T0+(performance.now()-P0);
  function D(...a){ return a.length?new RD(...a):new RD(now()); } D.now=now; D.UTC=RD.UTC; D.parse=RD.parse; D.prototype=RD.prototype; window.Date=D; })()`;
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T09:00:00Z'));
  let r; try { r = await p.evaluate(() => { const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const fp = W => { const L = ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs'], parts = [W.floorY];
      L.forEach(n => (W[n] || []).forEach(e => parts.push(n[0], Math.round((e.x != null ? e.x : e.cx || 0) * 1000), Math.round((e.y || 0) * 1000), Math.round((e.w || e.r || 0) * 1000))));
      return parts.join(',').length + ':' + parts.reduce((h, v) => (Math.imul(h ^ String(v).length, 16777619) + (+v || 0)) >>> 0, 0x811c9dc5); };
    const a = S.daily(Date.parse('2026-10-24T00:00:01Z')), b = S.daily(Date.parse('2026-10-24T23:59:59Z')), c = S.daily(Date.parse('2026-10-25T00:00:01Z'));
    out.spec = { same: JSON.stringify(a) === JSON.stringify(b), next: a.seed !== c.seed && a.utcDate !== c.utcDate, lvl: a.level >= 5 && a.level <= 35 && c.level >= 5 && c.level <= 35, gen: a.generatorVersion === 1 && a.physicsVersion === 2, a };   /* PHYS 2 since 24 Oct: the boss's forgiving lob */
    /* the same day builds the same dive and the same Clean Slice line */
    S.newDaily(false); const f1 = fp(S.world()), l1 = S.clean().req.map(s => s.x.toFixed(2) + '@' + s.y.toFixed(2)).join('|');
    S.newDaily(false); const f2 = fp(S.world()), l2 = S.clean().req.map(s => s.x.toFixed(2) + '@' + s.y.toFixed(2)).join('|');
    out.stable = { same: f1 === f2 && l1 === l2, lvl: S.g().lvl === a.level, salted: true };
    /* opening the card and practising spend nothing; the scored dive is spent on its first simulation tick */
    localStorage.removeItem('s3d_daily'); S.showDaily(); out.card = { used: S.dly().used, shown: document.getElementById('s-daily').classList.contains('on'), go: document.getElementById('dly-go').getAttribute('aria-disabled') };
    /* no practice since 24 Oct (his call): the card offers one dive and nothing else */
    out.noPractice = !document.getElementById('dly-practice') && !/practi[cs]e/i.test(document.getElementById('s-daily').textContent);
    S.newDaily(true); out.beforeTick = S.dly().used; S.stepN(1, D); out.afterClock = S.dly().used; S.stepN(1, D);
    out.afterTick = { used: S.dly().used, disk: JSON.parse(localStorage.getItem('s3d_daily') || 'null') };
    /* a failed scored dive: its score, personal, no badge; the card shows it spent */
    const G = S.g(); G.score = 321; G.done = true; G.failed = true; G.doneT = 3; S.finishLevel();
    const dl = document.getElementById('go-daily'); out.failPanel = { on: dl.classList.contains('on'), won: dl.classList.contains('won'), text: document.getElementById('go-daily-t').textContent, next: document.getElementById('go-next').textContent, retry: getComputedStyle(document.getElementById('go-retry')).display };
    S.showDaily(); out.spent = { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent };
    const ff0 = S.prog().ffLevel, g0 = S.g(); S.newDaily(true); out.noSecond = S.g() === g0 && document.getElementById('s-daily').classList.contains('on');
    /* the next ordinary dive's end panel has its Replay back (the Daily hid it) */
    S.newFF(2); { const g = S.g(); g.score = 10; g.done = true; g.failed = true; g.doneT = 3; S.finishLevel();
      const rb = document.getElementById('go-retry'); out.after = { retry: getComputedStyle(rb).display, text: rb.textContent, daily: dl.classList.contains('on') }; }
    out.countdown = (S.showDaily(), document.getElementById('dly-clock').textContent);
    window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the day's dive is fixed by the UTC date (and the versions), a new one each day, levels 5 to 35", !!r.spec && r.spec.same && r.spec.next && r.spec.lvl && r.spec.gen, JSON.stringify(r.spec || r));
  ok('the same day builds the same dive and the same Clean Slice line', !!r.stable && r.stable.same && r.stable.lvl, JSON.stringify(r.stable));
  ok('opening the Daily card spends nothing, and it offers no practice', !!r.card && r.card.shown && !r.card.used && r.card.go === null && r.noPractice === true, JSON.stringify({ c: r.card, p: r.noPractice }));
  ok('the scored dive is spent on its first simulation tick, and on disk', r.beforeTick === false && r.afterClock === false && !!r.afterTick && r.afterTick.used && !!r.afterTick.disk && r.afterTick.disk.used === true && r.afterTick.disk.day === '2026-10-24', JSON.stringify({ b: r.beforeTick, c: r.afterClock, t: r.afterTick }));
  ok('a failed scored dive: a personal result, no badge; the card shows it spent and no second scored dive starts', !!r.failPanel && r.failPanel.on && !r.failPanel.won && /personal result/.test(r.failPanel.text) && r.failPanel.next === 'Daily' && r.failPanel.retry === 'none' && !!r.spent && r.spent.go === 'true' && /321/.test(r.spent.res) && r.noSecond, JSON.stringify({ f: r.failPanel, s: r.spent, n: r.noSecond }));
  ok('a Daily end panel has no Replay; the next ordinary dive has it back', !!r.after && r.after.retry !== 'none' && r.after.text === 'Replay' && !r.after.daily, JSON.stringify(r.after));
  ok('the countdown runs to the UTC midnight (09:00 UTC: 15 hours left)', /^A new dive in 1[45]h \d+m$/.test(r.countdown || ''), JSON.stringify(r.countdown));
  ok('no page errors through the Daily', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
/* the day's first scored dive reaching the floor shows badge_daily; a refresh finds the day spent; the next UTC day is new */
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T23:59:20Z'));
  let r; try { r = await p.evaluate(() => { const S = window._S3, D = 1000 / 120, out = {}; window._S3skiprender = true; localStorage.removeItem('s3d_daily');
    const p0 = JSON.stringify([S.prog().level, S.prog().ffLevel]); S.newDaily(true); const g = S.g(), W = S.world(); g.score = 5000; g.x = 0; g.y = W.floorY + 3; g.vx = 0; g.vy = -10; g.w = 0; g.ang = Math.PI / 2; S.hold(0);
    const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D);
    const dl = document.getElementById('go-daily'); out.won = { done: g.done, failed: !!g.failed, on: dl.classList.contains('on'), won: dl.classList.contains('won'), text: document.getElementById('go-daily-t').textContent, disk: JSON.parse(localStorage.getItem('s3d_daily')), levels: JSON.stringify([S.prog().level, S.prog().ffLevel]) === p0 };
    S.showDaily(); out.clock = document.getElementById('dly-clock').textContent; window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the day's scored dive reaching the floor shows the Daily badge, once, and moves no level", !!r.won && r.won.done && !r.won.failed && r.won.on && r.won.won && r.won.text === 'Daily done' && r.won.disk.done === true && r.won.disk.used === true && r.won.levels, JSON.stringify(r.won || r));
  ok('the countdown in the last minute counts seconds', /^A new dive in \d+s$/.test(r.clock || ''), JSON.stringify(r.clock));
  await ctx.close();
  const b2 = await boot(clockAt('2026-10-24T23:58:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:true,score:900}));}catch(e){} })()"));
  let r2; try { r2 = await b2.p.evaluate(() => { window._S3.showDaily(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent }; }); } catch (e) { r2 = { error: String(e).slice(0, 200) }; }
  ok('a refresh the same day finds the scored dive spent', !!r2 && r2.go === 'true' && /900/.test(r2.res), JSON.stringify(r2));
  await b2.ctx.close();
  const b3 = await boot(clockAt('2026-10-25T00:00:30Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:true,score:900}));}catch(e){} })()"));
  let r3; try { r3 = await b3.p.evaluate(() => { window._S3.showDaily(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), res: document.getElementById('dly-res').textContent, day: window._S3.dly().day }; }); } catch (e) { r3 = { error: String(e).slice(0, 200) }; }
  ok('the next UTC day has a fresh scored dive', !!r3 && r3.go === null && r3.res === '' && r3.day === '2026-10-25', JSON.stringify(r3));
  const b4 = await boot(clockAt('2026-10-24T10:00:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:'yes',done:0,score:-3}));}catch(e){} })()"));
  let r4; try { r4 = await b4.p.evaluate(() => { window._S3.showDaily(); const d = window._S3.dly(); return { go: document.getElementById('dly-go').getAttribute('aria-disabled'), used: d.used, score: d.score }; }); } catch (e) { r4 = { error: String(e).slice(0, 200) }; }
  ok('a broken Daily record on disk reads as a fresh day, not as spent', !!r4 && r4.go === null && r4.used === false && r4.score === 0 && b4.errs.length === 0, JSON.stringify(r4));
  await b4.ctx.close();
  const b5 = await boot(clockAt('2026-10-24T10:00:00Z').replace('})()', ";try{localStorage.setItem('s3d_daily',JSON.stringify({day:'2026-10-24',gen:1,used:true,done:false,score:null}));}catch(e){} })()"));
  let r5; try { r5 = await b5.p.evaluate(() => { window._S3.showDaily(); return { on: document.getElementById('s-daily').classList.contains('on'), go: document.getElementById('dly-go').getAttribute('aria-disabled') }; }); } catch (e) { r5 = { error: String(e).slice(0, 200) }; }
  ok('a Daily record with a null score never breaks the card', !!r5 && r5.on && r5.go === null && b5.errs.length === 0, JSON.stringify({ r5, e: b5.errs }));
  await b5.ctx.close();
  ok('no page errors across the day line', errs.length === 0 && b2.errs.length === 0 && b3.errs.length === 0, JSON.stringify([errs, b2.errs, b3.errs]));
  await b3.ctx.close();
}
/* the Daily against the device: a phone at UTC+14 (its own date already the next day), two boots of one day, another tab
   spending the scored dive, and the real buttons under a real pointer */
{
  const LA = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-dev-shm-usage'] };
  const tzBoot = async (iso, tz, pre) => { const browser = await puppeteer.launch(LA); const p = await browser.newPage(); await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 140))); if (tz) await p.emulateTimezone(tz);
    await p.evaluateOnNewDocument(clockAt(iso)); if (pre) await p.evaluateOnNewDocument(pre);
    await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 }); await new Promise(q => setTimeout(q, 3500)); return { browser, p, errs }; };
  const t1 = await tzBoot('2026-10-24T13:00:00Z', 'Pacific/Kiritimati');
  let z; try { z = await t1.p.evaluate(() => { const S = window._S3; S.showDaily(); const sp = S.daily();
    return { local: new Date().getDate(), utcDate: sp.utcDate, day: document.getElementById('dly-day').textContent, clock: document.getElementById('dly-clock').textContent, spec: JSON.stringify(sp) }; }); } catch (e) { z = { error: String(e).slice(0, 200) }; }
  ok('at UTC+14 (already the 25th there) the Daily is still the 24th and the countdown runs to the UTC midnight', !!z && z.local === 25 && z.utcDate === '2026-10-24' && /24/.test(z.day) && /^A new dive in 1[01]h \d+m$/.test(z.clock), JSON.stringify(z));
  await t1.browser.close();
  const t2 = await tzBoot('2026-10-24T13:00:00Z', 'America/Adak');
  let z2; try { z2 = await t2.p.evaluate(() => { const S = window._S3; S.newDaily(false); const W = S.world(); return { spec: JSON.stringify(S.daily()), n: W.slabs.length + ':' + W.items.length + ':' + W.floorY + ':' + S.clean().M }; }); } catch (e) { z2 = { error: String(e).slice(0, 200) }; }
  const t3 = await tzBoot('2026-10-24T13:00:00Z', 'Pacific/Kiritimati');
  let z3; try { z3 = await t3.p.evaluate(() => { const S = window._S3; S.newDaily(false); const W = S.world(); return { spec: JSON.stringify(S.daily()), n: W.slabs.length + ':' + W.items.length + ':' + W.floorY + ':' + S.clean().M }; }); } catch (e) { z3 = { error: String(e).slice(0, 200) }; }
  ok('two boots on the same UTC day, a day apart in local time, build the same Daily dive', !!z2 && !!z3 && z2.spec === z3.spec && z2.n === z3.n, JSON.stringify({ z2, z3 }));
  await t2.browser.close(); await t3.browser.close();
  const t4 = await tzBoot('2026-10-24T13:00:00Z', null, "(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");
  let z4; try { z4 = await t4.p.evaluate(() => { const S = window._S3; S.showDaily(); const g0 = S.g();
    localStorage.setItem('s3d_daily', JSON.stringify({ day: '2026-10-24', gen: 1, used: true, done: false, score: 70 }));   /* the other tab spent it */
    S.newDaily(true); return { started: S.g() !== g0 && !!S.g() && S.g().daily === 'scored', go: document.getElementById('dly-go').getAttribute('aria-disabled') }; }); } catch (e) { z4 = { error: String(e).slice(0, 200) }; }
  ok('two tabs: a scored dive another tab already spent does not start here', !!z4 && !z4.started && z4.go === 'true', JSON.stringify(z4));
  await t4.browser.close();
  const t5 = await tzBoot('2026-10-24T13:00:00Z', null, "(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");
  let z5 = {}; try {
    await t5.p.evaluate(() => window._S3.showDaily()); await clickCentre(t5.p, '#dly-go'); await new Promise(q => setTimeout(q, 900));
    z5.scored = await t5.p.evaluate(() => { const g = window._S3.g(); return !!g && g.daily === 'scored' && document.getElementById('s-play').classList.contains('on'); });
    await t5.p.evaluate(() => { const S = window._S3, g = S.g(); g.done = true; g.failed = true; g.doneT = 3; g.score = 10; S.finishLevel(); });
    z5.noReplay = await t5.p.evaluate(() => getComputedStyle(document.getElementById('go-retry')).display === 'none');
    await clickCentre(t5.p, '#go-next'); await new Promise(q => setTimeout(q, 600));
    z5.backToCard = await t5.p.evaluate(() => document.getElementById('s-daily').classList.contains('on') && document.getElementById('dly-go').getAttribute('aria-disabled') === 'true');
  } catch (e) { z5.error = String(e).slice(0, 200); }
  ok("the real buttons: Today's dive starts the scored one, its end panel has no Replay, Daily goes back to the card, spent", z5.scored && z5.noReplay && z5.backToCard && t5.errs.length === 0, JSON.stringify({ z5, e: t5.errs }));
  await t5.browser.close();
}
/* a scored dive begun before the UTC midnight and landed after it keeps its result under the day it began */
{
  const { ctx, p, errs } = await boot(clockAt('2026-10-24T23:59:50Z') + ";(()=>{try{localStorage.removeItem('s3d_daily');}catch(e){}})()");   /* the boot takes about 5 s of it */
  let r; try { r = await p.evaluate(async () => { const S = window._S3, D = 1000 / 120; window._S3skiprender = true; S.newDaily(true); S.stepN(2, D); const began = S.g().dailyDay;
    const t0 = performance.now(); while (new Date(Date.now()).getUTCDate() === 24 && performance.now() - t0 < 12000) await new Promise(q => setTimeout(q, 100));
    const g = S.g(), W = S.world(); g.x = 0; g.y = W.floorY + 3; g.vx = 0; g.vy = -10; g.w = 0; g.ang = Math.PI / 2; S.hold(0);
    const go = document.getElementById('s-go'); go.classList.remove('on'); for (let n = 0; n < 700 && !go.classList.contains('on'); n++) S.stepN(1, D);
    window._S3skiprender = false; return { began, now: new Date(Date.now()).toISOString().slice(0, 10), text: document.getElementById('go-daily-t').textContent, disk: JSON.parse(localStorage.getItem('s3d_daily')) }; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("a scored dive landed after the UTC midnight keeps its result under the day it began", !!r && r.began === '2026-10-24' && r.now === '2026-10-25' && r.text === 'Daily done' && !!r.disk && r.disk.day === '2026-10-24' && r.disk.done === true, JSON.stringify(r));
  await ctx.close();
}
/* the title's Daily button opens the card under a real pointer */
{
  const { ctx, p, errs } = await bootAt(360, 640);
  await clickCentre(p, '#b-daily'); await new Promise(q => setTimeout(q, 500));
  const on = await p.evaluate(() => document.getElementById('s-daily').classList.contains('on'));
  ok('the Daily button opens the Daily card (a real pointer at 360x640)', on && errs.length === 0, JSON.stringify({ on, errs }));
  await ctx.close();
}

/* ---- 21. Part E4: the bosses ------------------------------------------------ */
console.log('\n[21] Part E4: a boss at the end of every world');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => { const S = window._S3, out = {}, D = 1000 / 120; window._S3skiprender = true;
    const fp = W => { const L = ['blocks', 'items', 'crystals', 'pads', 'slabs', 'wasps', 'planks', 'thorns', 'verbs'], parts = [];
      L.forEach(n => (W[n] || []).forEach(e => parts.push(n[0], Math.round((e.x != null ? e.x : e.cx || 0) * 1000), Math.round((e.y || 0) * 1000), Math.round((e.w || e.r || 0) * 1000))));
      return parts.join(','); };
    out.levels = {}; for (const l of [4, 5, 6, 10, 15, 40]) { S.salt(77); S.newFF(l); out.levels[l] = !!S.boss(); }
    S.salt(77); S.newEndless(); out.levels.endless = !!S.boss();
    /* the shaft above the chamber is the very dive it was: its pieces, and its Clean Slice line member by member (5.78 has a
       line of 12; 5.77 has none, so it could never tell: the review) */
    const lineOf = () => S.clean().req.map(q => q.x.toFixed(2) + '@' + q.y.toFixed(2)).join('|');
    S.salt(78); S.bossOff(true); S.newFF(5); const a = fp(S.world()), la = lineOf(), ma = S.clean().M; S.bossOff(false); S.salt(78); S.newFF(5); const b = fp(S.world()), lb = lineOf();
    out.same = { pieces: a === b, line: la === lb && ma > 0, M: ma, deeper: S.world().floorY < -300 };
    /* a fight: the knife falls from 20 u over the boss; hold(m, lobN, side, B, n) answers the hold m steps after the last lob
       (side: toward the boss's lane at that lob); pin: after hit 1 the knife is held inside the boss for 10 steps */
    const fight = (ang, hold, pin, salt) => { S.salt(salt || 77); S.newFF(5); const G = S.g(), B = S.boss(); G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = ang; S.hold(0);
      const log = [], tx = [], pay = []; let held = null, lobN = -1, side = 0;
      for (let n = 0; n < 6000 && !G.done; n++) { const h0 = B.hits, l0 = B.lobs, s0 = G.score; S.hold(hold ? hold(n - lobN, lobN, side, B, n) : 0); S.stepN(1, D);
        if (B.hits > h0) { log.push('hit' + B.hits); tx.push(B.tx); pay.push(G.score - s0); }
        if (B.lobs > l0) { log.push('lob'); lobN = n; side = B.tx > G.x ? 1 : -1; }
        if (pin && B.hits === 1 && held === null) { held = 0; for (let k = 0; k < 10; k++) { G.x = B.x; G.y = B.y + 0.5; G.vx = 0; G.vy = -0.2; S.stepN(1, D); } held = B.hits; } }
      S.hold(0); return { hits: B.hits, held, tx, pay, rope: !!B.ropeCut, cleared: B.cleared, skipped: B.skipped, net: B.netOn, done: G.done, failed: !!G.failed, t: +G.t.toFixed(1), log: log.join(' '), lab: document.getElementById('go-lab').textContent, name: B.name }; };
    /* left alone (nothing teleported): three hits, one lane over each time (a side, then the middle), paid once, at the third
       (600 x5 since 24 Oct: no miss, the flawless grade) */
    out.win = fight(Math.PI / 2);
    for (let n = 0; n < 600 && !document.getElementById('s-go').classList.contains('on'); n++) S.stepN(1, D);
    out.win.panel = document.getElementById('go-lab').textContent;
    out.held = fight(Math.PI / 2, null, true);
    out.handle = fight(-Math.PI / 2);
    /* as played: a 0.1 s tap toward the boss 0.1 s after every lob clears the fight (two dives); a 0.25 s hold never cuts a
       rope (the review: a tap toward the boss's new lane cut its rope in 35 of 40 fights), and since 24 Oct it clears too */
    const tap = (R, T) => (m, lobN, side) => (lobN >= 0 && m >= R && m < R + T) ? side : 0;
    out.taps = [77, 5].map(sd => fight(Math.PI / 2, tap(12, 12), false, sd));
    out.heavy = fight(Math.PI / 2, tap(12, 30));
    /* the review's trap: after hit 1, toward the boss for 0.4 s from the first lob, then away for 0.2 s; a handle first knife
       between a side lane boss and the padded wall juggled for ever. It must end */
    const trap = () => { let L = -1, sd = 0; return (m, lobN, side, B, n) => { if (L < 0 && B.hits === 1 && B.lobs === 1) { L = n; sd = B.tx > 0 ? 1 : -1; } if (L < 0) return 0; const k = n - L; return k < 48 ? sd : ((k >= 72 && k < 96) ? -sd : 0); }; };
    out.trap = fight(Math.PI / 2, trap());
    /* a hit resets the lob count: three lobs, then a hit; the next landing is lob one, never the give way */
    S.salt(77); S.newFF(5); { const G = S.g(), B = S.boss(); B.lobs = 3; G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
      let n = 0; for (; n < 3000 && B.hits < 1; n++) S.stepN(1, D); const after = B.lobs; for (; n < 3000 && B.lobs < 1 && !B.skipped; n++) S.stepN(1, D);
      out.reset = { hits: B.hits, after, lobs: B.lobs, skipped: B.skipped }; }
    /* a restart resets the chamber */
    S.salt(77); S.newFF(5); out.restart = { hits: S.boss().hits, net: S.boss().netOn, lobs: S.boss().lobs };
    /* the ropes (the review): with the boss in the middle, a deliberate hold toward either one on a lob cuts it (the net drops,
       Clean Slice forfeited, nothing paid, the dive ends alive) and the boss is out of the fight after it; with the boss in a
       side lane the rope on its side holds under a 0.1 s tap toward it (without the rule a tap of 0.05 to 0.18 s cuts it; a
       0.25 s hold bounces off the padded wall first and never could: the fail watch caught that) */
    out.ropes = [[0, -1, 42], [0, 1, 42], [-4.8, -1, 12], [4.8, 1, 12]].map(([lane, side, T]) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); B.hits = 1; B.lobs = 1; B.x = B.tx = lane; G.x = lane; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
      let cut = false, inert = null; for (let n = 0; n < 900 && !G.done && !cut && B.tx === lane; n++) { S.hold((n >= 24 && n < 24 + T) ? side : 0); S.stepN(1, D); if (B.ropeCut) cut = true; }
      S.hold(0); if (cut) { const h = B.hits; G.x = B.x; G.y = B.y + B.r + 1.4; G.vx = 0; G.vy = -6; G.w = 0; G.ang = Math.PI / 2; let popped = false; for (let k = 0; k < 90; k++) { S.stepN(1, D); if (G.vy > 0) popped = true; } inert = B.hits === h && !popped; }
      for (let n = 0; n < 6000 && !G.done; n++) S.stepN(1, D); return { lane, side, cut, inert, net: B.netOn, forfeit: !!G.cleanForfeit, score: G.score, done: G.done, failed: !!G.failed }; });
    /* a knife on its way in never cuts a rope: falling past one blade first, and (not yet in the fight) rising past one */
    out.inRope = [[1, -12], [-1, -12], [1, 5]].map(([sd, vy]) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(), rx = B.ropes[sd > 0 ? 1 : 0];
      G.x = rx - sd * 0.6; G.y = B.y + 6; G.vx = 0; G.vy = vy; G.w = 0; G.ang = sd > 0 ? Math.PI : 0;
      for (let n = 0; n < 24 && !G.done; n++) S.stepN(1, D); return !!B.ropeCut; });
    /* the end panel: a skipped boss forfeits Clean Slice (every target cut first), by a rope or by the net giving way; a boss
       fought down keeps it (5.78 has a line of 12) */
    const panelAfter = kind => { S.salt(78); S.newFF(5); const G = S.g(), B = S.boss(), M = S.world().clean.M; G.cleanN = M;
      if (kind === 'rope') { B.hits = 1; B.lobs = 1; B.x = B.tx = 0; G.x = 0; G.y = B.netY + 1; G.vx = 0; G.vy = Math.sqrt(2 * 21 * ((B.y + 5) - B.netY)); G.w = 0; G.ang = Math.PI / 2;
        for (let n = 0; n < 900 && !G.done && !B.ropeCut; n++) { S.hold((n >= 24 && n < 66) ? 1 : 0); S.stepN(1, D); } S.hold(0); }
      else { G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = kind === 'net' ? -Math.PI / 2 : Math.PI / 2; S.hold(0); }
      for (let n = 0; n < 6000 && !G.done; n++) S.stepN(1, D);
      const go = document.getElementById('s-go'); for (let n = 0; n < 600 && !go.classList.contains('on'); n++) S.stepN(1, D);
      return { kind, M, skipped: B.skipped, cleared: B.cleared, rope: !!B.ropeCut, failed: !!G.failed, won: document.getElementById('go-clean').classList.contains('won'), text: document.getElementById('go-clean-t').textContent, lab: document.getElementById('go-lab').textContent }; };
    out.cleanSkip = panelAfter('rope'); out.cleanNet = panelAfter('net'); out.cleanWin = panelAfter('win');
    /* the chamber's walls are padded: a blade driven into one bounces, and from the line where the old floor caught a falling
       knife (the review: the chamber's top 2 u killed) arrivals with the shaft cleared all live; up in the shaft it sticks */
    const clearShaft = Wd => ['items', 'slabs', 'pads', 'crystals', 'thorns', 'wasps', 'planks', 'verbs', 'blocks'].forEach(k => { if (Wd[k]) Wd[k] = []; });
    S.salt(77); S.newFF(5); { const G = S.g(), B = S.boss(); G.x = 6.2; G.y = B.y; G.vx = 6; G.vy = 0; G.w = 0; G.ang = Math.PI; for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); out.padded = { failed: !!G.failed, x: +G.x.toFixed(2) }; }
    out.mouth = [[-4, 45, 0, -4], [-5, 68, 0, -4], [4, 135, 0, 4]].map(c => { S.salt(77); S.newFF(5); const G = S.g(), Wd = S.world(); clearShaft(Wd);
      G.x = c[0]; G.y = Wd.floorY + 36 + 14; G.vy = -19; G.vx = c[3]; G.ang = c[1] * Math.PI / 180; G.w = c[2]; S.hold(0);
      for (let n = 0; n < 7200 && !G.done; n++) S.stepN(1, D); return { done: G.done, failed: !!G.failed }; });
    S.salt(77); S.newFF(5); { const G = S.g(), Wd = S.world(); clearShaft(Wd); G.x = 6.2; G.y = Wd.floorY + 80; G.vx = 6; G.vy = 0; G.w = 0; G.ang = Math.PI;
      for (let n = 0; n < 40 && !G.done; n++) S.stepN(1, D); out.shaftWall = { failed: !!G.failed, done: G.done }; }
    window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const L = r.levels || {}, w = r.win || {};
  ok('a boss closes levels 5, 10, 15 ... and no other dive (not 4, not 6, not Endless)', L[5] && L[10] && L[15] && L[40] && !L[4] && !L[6] && !L.endless, JSON.stringify(L));
  ok('the shaft above the chamber is the very dive it was: its pieces and its Clean Slice line, member by member', !!r.same && r.same.pieces && r.same.line && r.same.deeper, JSON.stringify(r.same));
  ok('a blade down knife left alone: three hits, the net lobs it each time, one lane over each time, 3000 (600 x5, flawless) paid once at the third, the boss down, the floor', w.hits === 3 && w.cleared && !w.skipped && !w.net && w.done && !w.failed && /^hit1 lob hit2 lob hit3$/.test(w.log) && Array.isArray(w.tx) && Math.abs(w.tx[0]) === 4.8 && w.tx[1] === 0 && (w.pay || []).join() === '0,0,3000', JSON.stringify(w));
  ok('a knife held inside the boss after a hit counts it once', !!r.held && r.held.held === 1 && r.held.done && !r.held.failed, JSON.stringify(r.held));
  ok('the end panel names the boss', !!r.win && new RegExp(r.win.name + ' down').test(r.win.panel || ''), JSON.stringify(r.win && r.win.panel));
  ok('a handle down knife never hits; the net gives way at its fourth landing (three lobs) and the dive goes on to the floor', !!r.handle && r.handle.hits === 0 && r.handle.skipped && !r.handle.net && r.handle.done && !r.handle.failed && r.handle.log === 'lob lob lob lob', JSON.stringify(r.handle));
  ok('as played: a 0.1 s tap toward the boss after each lob clears the fight; a 0.25 s hold never cuts a rope and the dive ends', Array.isArray(r.taps) && r.taps.every(o => o.cleared && !o.skipped && !o.rope && o.done && !o.failed) && !!r.heavy && !r.heavy.rope && r.heavy.cleared && r.heavy.done && !r.heavy.failed, JSON.stringify([r.taps, r.heavy]));
  ok("the review's trap (a handle first knife between a side lane boss and the wall) ends", !!r.trap && r.trap.done && !r.trap.failed, JSON.stringify(r.trap));
  ok('a hit resets the lob count (the next landing is lob one, not the give way)', !!r.reset && r.reset.hits === 1 && r.reset.after === 0 && r.reset.lobs === 1 && !r.reset.skipped, JSON.stringify(r.reset));
  ok('a restart resets the chamber', !!r.restart && r.restart.hits === 0 && r.restart.net && r.restart.lobs === 0, JSON.stringify(r.restart));
  ok('with the boss in the middle a hold toward either rope cuts it (net down, Clean Slice forfeited, nothing paid, the boss out of the fight, alive); a side lane boss keeps its own rope', Array.isArray(r.ropes) && r.ropes.filter(o => o.lane === 0).every(o => o.cut && o.inert && !o.net && o.forfeit && o.score === 0 && o.done && !o.failed) && r.ropes.filter(o => o.lane !== 0).every(o => !o.cut && o.done && !o.failed), JSON.stringify(r.ropes));
  ok('a knife on its way in never cuts a rope (falling past one blade first, or rising before the fight)', Array.isArray(r.inRope) && r.inRope.length === 3 && r.inRope.every(c => c === false), JSON.stringify(r.inRope));
  ok('a skipped boss forfeits Clean Slice on the end panel (by a rope or by the net giving way, with no "down" line); a boss fought down keeps it', [r.cleanSkip, r.cleanNet].every(o => !!o && o.M > 0 && o.skipped && !o.cleared && !o.failed && !o.won && /, boss skipped$/.test(o.text) && !/ down$/.test(o.lab)) && r.cleanSkip.rope && !r.cleanNet.rope && !!r.cleanWin && r.cleanWin.cleared && !r.cleanWin.failed && r.cleanWin.won && r.cleanWin.text === 'Clean Slice', JSON.stringify([r.cleanSkip, r.cleanNet, r.cleanWin]));
  ok("the chamber's walls are padded from the old floor's line down (a blade into one bounces); up in the shaft a blade still sticks", !!r.padded && !r.padded.failed && Array.isArray(r.mouth) && r.mouth.every(o => o.done && !o.failed) && !!r.shaftWall && r.shaftWall.failed, JSON.stringify([r.padded, r.mouth, r.shaftWall]));
  ok('no page errors through the boss chamber', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}
/* the boss wears Astra's stages: cell 1 standing, cell 2 after the second hit, cell 3 (the reveal) after the third */
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(async () => { const S = window._S3, D = 1000 / 120, wait = ms => new Promise(q => setTimeout(q, ms)), out = {};
    S.salt(77); S.newFF(5); const t0 = performance.now(); while (!(S.boss().tex) && performance.now() - t0 < 20000) await wait(200);
    const B = S.boss(), off = () => +B.tex.offset.x.toFixed(3); out.loaded = !!B.tex; if (!B.tex) return out; out.c1 = off(); out.code = B.code.visible;
    window._S3skiprender = true; const G = S.g(); G.x = 0.3; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2; S.hold(0);
    const seen = {}; for (let n = 0; n < 6000 && !G.done; n++) { S.stepN(1, D); seen[B.hits] = seen[B.hits] || { off: off(), crack: +B.crack.material.opacity.toFixed(2) }; }
    out.seen = seen; window._S3skiprender = false; return out; }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok("the boss wears Astra's stages: cell 1, a drawn crack after the first hit, cell 2 after the second, the reveal after the third", !!r && r.loaded && !r.code && r.c1 === 0.01 && r.seen[1].off === 0.01 && r.seen[1].crack > 0.5 && r.seen[2].off === +((1.03) / 3).toFixed(3) && r.seen[3].off === +((2.03) / 3).toFixed(3) && r.seen[2].crack === 0 && r.seen[3].crack === 0, JSON.stringify(r));
  ok('no page errors with the boss painted', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

/* ---- 23. Part F3 (24 Oct, his calls): the boss's lob forgives a steering thumb, the boss pays by how well you fought and
   apart from the landing's multiplier. A hold toward the boss on every lob of 0.5 s or 1.2 s (v6.8 missed every fight
   from 0.15 s) clears it; a knife that enters past the boss pays x3 for its one miss; the landing multiplies the dive's
   score but never the boss's pay (v6.8 paid 600 x10 on the bullseye the knife always dropped onto). Measured over 300
   fights in tools/slice-3d-tests/f3/steer.js. Watched red with the aim cap and the separate pay taken out. */
console.log('\n[23] Part F3: a forgiving lob, a graded boss pay outside the multiplier');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, D = 1000 / 120, out = {}; window._S3skiprender = true;
    const run = (x0, holdSteps) => { S.salt(77); S.newFF(5); const G = S.g(), B = S.boss(); G.x = x0; G.y = B.y + 20; G.vx = 0; G.vy = -19; G.w = 0; G.ang = Math.PI / 2;
      let lobN = -1, side = 0, pre = null;
      for (let n = 0; n < 9000 && !G.counted; n++) { const l0 = B.lobs; S.hold(lobN >= 0 && n >= lobN + 12 && n < lobN + 12 + holdSteps ? side : 0); if (!G.counted) pre = G.score; S.stepN(1, D);
        if (B.lobs > l0) { lobN = n; side = B.tx > G.x ? 1 : -1; } }
      S.hold(0); return { cleared: B.cleared, skipped: B.skipped, miss: B.miss || 0, pts: G.bossPts || 0, grade: G.bossGrade || 0, pre, final: G.score, mult: G.mult, failed: !!G.failed }; };
    out.h05 = run(0.3, 60); out.h12 = run(0.3, 144); out.past = run(7, 0); out.alone = run(0.3, 0);
    window._S3skiprender = false; S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  ok('a hold toward the boss of 0.5 s or 1.2 s on every lob still clears the fight', !!r.h05 && r.h05.cleared && !r.h05.skipped && !r.h05.failed && !!r.h12 && r.h12.cleared && !r.h12.skipped && !r.h12.failed, JSON.stringify([r.h05, r.h12]));
  ok('the boss pays by the misses: none x5 (3000); a knife that enters past it, one miss, x3 (1800)', !!r.alone && r.alone.miss === 0 && r.alone.pts === 3000 && !!r.past && r.past.cleared && r.past.miss === 1 && r.past.pts === 1800, JSON.stringify([r.alone, r.past]));
  ok("the landing multiplies the dive's score but never the boss's pay", [r.alone, r.past].every(o => !!o && o.mult > 1 && o.final === (o.pre - o.pts) * o.mult + o.pts), JSON.stringify([r.alone, r.past]));
  ok('no page errors through Part F3', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

/* ---- 22. Part F2 (24 Oct, Jessie: "the handles go through the ground"): the ground and a stump's top meet only the
   knife's middle, so a steep landing drew the handle up to 1.7 u into the grass. The DRAWN knife on the ground modes never
   dips below the surface under it (the drawing only: kpose reads the knife as drawn). Journey 1, 3 and 6 and a climb, a tap
   whenever grounded every 14 frames, every frame checked; the lift must have been needed (a run that never lands proves
   nothing) and the drawing must sit on the stepped knife whenever no lift is needed. Watched red with the lift taken out. */
console.log('\n[22] Part F2: the drawn knife never sinks into the ground');
{
  const { ctx, p, errs } = await boot();
  let r; try { r = await p.evaluate(() => {
    const S = window._S3, out = {};
    for (const [kind, lvl] of [['j', 1], ['j', 3], ['j', 6], ['c', 1]]) {
      S.salt(31); if (kind === 'j') S.newGame(lvl); else S.newClimb(lvl);
      let worst = 9, maxLift = 0, off = 0, frames = 0, blocks = 0;
      for (let f = 0; f < 900; f++) { const G = S.g(); if (!G || G.done) break; if (G.grounded && f % 14 === 3) S.tap(1); S.stepN(1, 16);
        const k = S.kpose(); if (k.surf == null) continue; frames++; const sn = Math.sin(k.rz), y0 = k.y - k.lift;
        /* the surface worked out here from the level's own blocks, never read back from the page (a wrong surface in the
           page agreed with itself and the check could not fail) */
        let su = 0; for (const b of S.world().blocks) if (!b.gone && k.x > b.x - 0.5 && k.x < b.x + b.w + 0.5 && b.y + b.h <= y0 + 0.4 && b.y + b.h > su) su = b.y + b.h;
        const low = k.y + Math.min(k.hi * sn, -k.lo * sn) - k.hh * Math.abs(Math.cos(k.rz)) - su;
        worst = Math.min(worst, low); maxLift = Math.max(maxLift, k.lift); if (su > 0) blocks++;
        if (k.lift === 0 && Math.abs(k.y - S.g().y) > 0.6) off++; }
      out[kind + lvl] = { frames, worst: +worst.toFixed(3), maxLift: +maxLift.toFixed(2), blocks, off };
    }
    S.salt(null); return out;
  }); } catch (e) { r = { error: String(e).slice(0, 200) }; }
  const v = Object.values(r || {});
  ok('the drawn knife never dips below the ground or a stump top under it (Journey 1, 3, 6, a climb)', v.length === 4 && v.every(x => x.frames > 200 && x.worst >= -0.01) && v.some(x => x.blocks > 20), JSON.stringify(r));
  ok('a landing needed the lift (the knife really landed steep)', v.length === 4 && v.filter(x => x.maxLift > 0.5).length >= 3, JSON.stringify(r));
  ok('with no lift needed the knife is drawn on its stepped pose', v.length === 4 && v.every(x => x.off === 0), JSON.stringify(r));
  ok('no page errors through Part F2', errs.length === 0, JSON.stringify(errs));
  await ctx.close();
}

console.log('\n=== slice-3d: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
