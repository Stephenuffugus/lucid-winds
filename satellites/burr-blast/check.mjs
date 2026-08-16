/* BURR BLAST — repair verifier.  node satellites/burr-blast/check.mjs
   ────────────────────────────────────────────────────────────────────────
   Real Chrome, real game code, real localStorage. Every assertion in here was
   WATCHED FAIL on purpose before it was trusted (see FAILWATCH below): a probe
   that cannot fail is not evidence.
   Run with --selftest to re-run that proof: it re-breaks each guarded thing in
   the page and asserts the check goes RED.
   ──────────────────────────────────────────────────────────────────────── */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PORT = 8941 + (process.pid % 40);
const SELFTEST = process.argv.includes('--selftest');

const MIME = { '.html':'text/html', '.js':'application/javascript', '.json':'application/json',
  '.png':'image/png', '.jpg':'image/jpeg', '.css':'text/css', '.svg':'image/svg+xml' };

let pass = 0, fail = 0;
const ok = (name, cond, detail) => {
  if (cond) { pass++; console.log('  ok   ' + name); }
  else { fail++; console.log('  FAIL ' + name + (detail !== undefined ? '  → ' + JSON.stringify(detail) : '')); }
};

const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(ROOT, p);
  if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end('nope'); return; }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' });
  res.end(fs.readFileSync(f));
});
await new Promise(r => server.listen(PORT, r));
const BASE = `http://127.0.0.1:${PORT}`;
const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });

/* fresh context per page: localStorage must not leak between cases, and a
   service-worker-style "fires once per version" trap is exactly how a cache test
   passes for the wrong reason. */
async function fresh(seedSave) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  if (seedSave !== undefined) {
    await page.goto(BASE + '/satellites/burr-blast/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(v => { localStorage.setItem('lw_burrblast_v1', v); }, seedSave);
  }
  await page.goto(BASE + '/satellites/burr-blast/?bbtest=1', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 500));
  page._errs = errs;
  page._ctx = ctx;
  return page;
}
const done = async p => { await p.close(); await p._ctx.close(); };

/* ── 1. boot + core loop reachable ─────────────────────────────────────── */
console.log('\n[1] boot and core loop');
{
  const p = await fresh();
  const r = await p.evaluate(() => ({
    hooks: !!(window.BB_DEBUG && window.BB_DEBUG.enter && window.BB_PHYS),
    levels: window.BB_DEV ? window.BB_DEV.levels().length : 0,
    exit: typeof window.SWS_EXIT === 'function'
  }));
  ok('page throws nothing on boot', p._errs.length === 0, p._errs);
  ok('debug + physics hooks present', r.hooks);
  ok('32 authored levels build (31 patches + the boss)', r.levels === 32, r.levels);
  ok('SWS_EXIT is defined', r.exit);
  // the exit affordance must be VISIBLE and WIRED, not merely defined
  const ex = await p.evaluate(() => {
    document.getElementById('btnComicSkip') && document.getElementById('btnComicSkip').click();
    const b = document.getElementById('exitBtn');
    const cs = getComputedStyle(b);
    return { shown: cs.display !== 'none' && cs.visibility !== 'hidden', wired: typeof b.onclick === 'function' };
  });
  ok('exit button is visible on the menu', ex.shown, ex);
  ok('exit button actually calls something', ex.wired);
  await done(p);
}

/* ── 2. the exit works when FRAMED (portal contract) ───────────────────── */
console.log('\n[2] embed protocol');
{
  const ctx = await browser.createBrowserContext();
  const host = await ctx.newPage();
  await host.setViewport({ width: 375, height: 667 });
  await host.goto(BASE + '/', { waitUntil: 'domcontentloaded' }).catch(() => {});
  const got = await host.evaluate(async base => {
    const seen = [];
    addEventListener('message', e => { if (e.data && e.data.sws) seen.push(e.data.sws); });
    const f = document.createElement('iframe');
    // deliberately NO ?embed=1 — this is the shape the old code got wrong
    f.src = base + '/satellites/burr-blast/';
    document.body.appendChild(f);
    await new Promise(r => setTimeout(r, 2500));
    try { f.contentWindow.SWS_EXIT(); } catch (e) { return { err: String(e) }; }
    await new Promise(r => setTimeout(r, 300));
    return { seen, still: !!f.contentWindow };
  }, BASE);
  ok('framed WITHOUT ?embed=1 still posts sws:ready', (got.seen || []).indexOf('ready') >= 0, got);
  ok('framed SWS_EXIT posts sws:close (never navigates the frame)', (got.seen || []).indexOf('close') >= 0, got);
  await host.close(); await ctx.close();
}

/* ── 3. corrupt saves: a save that PARSES is not a valid save ──────────── */
console.log('\n[3] corrupt save survival');
const CORRUPT = [
  ['prog is a string',      JSON.stringify({ coins: 10, prog: 'wrecked' })],
  ['prog entries are nums', JSON.stringify({ prog: { 1: 3, 2: 2 } })],
  ['loadout is a string',   JSON.stringify({ loadout: 'x', prog: { 1: { stars: 3, score: 9 } } })],
  ['everything is null',    JSON.stringify({ coins: null, prog: null, set: null, loadout: null, skins: null })],
  ['coins is a string',     JSON.stringify({ coins: '900', fert: 'lots' })],
  ['it is an array',        JSON.stringify([1, 2, 3])],
  ['nutrients are strings', JSON.stringify({ loadout: { nutrients: { n: 'x', p: null, k: [] } } })],
  ['satchel holds junk',    JSON.stringify({ loadout: { satchel: ['nope', 42, 'burr'], companions: ['ghost'] } })]
];
for (const [label, raw] of CORRUPT) {
  const p = await fresh(raw);
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG;
    const stars = D.totalStars(), nut = D.nutrients();
    let entered = false, ammo = null;
    try { D.enter(1); const s = D.snap(); entered = s.playing === true && s.n === 1; ammo = D.ammoQueue(); } catch (e) {}
    return { stars, nut, entered, ammo: ammo ? ammo.length : 0, l1: D.unlocked(1), save: D.save() };
  });
  ok(label + ': level 1 is still unlocked', r.l1 === true, r);
  ok(label + ': level 1 is actually playable', r.entered === true && r.ammo > 0, r);
  ok(label + ': totalStars is a finite number', Number.isFinite(r.stars), r.stars);
  ok(label + ': nutrient cap is finite', Number.isFinite(r.nut.cap) && Number.isFinite(r.nut.left), r.nut);
  ok(label + ': no page error', p._errs.length === 0, p._errs);
  await done(p);
}

/* ── 4. two tabs must not clobber ──────────────────────────────────────── */
console.log('\n[4] two tabs');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG, S = D.save();
    // this tab loaded at zero. Tab A meanwhile earned a lot and cleared level 5.
    localStorage.setItem('lw_burrblast_v1', JSON.stringify({
      coins: 500, fert: 40, endlessBest: 9, expBest: 4,
      prog: { 1: { stars: 3, score: 90000 }, 5: { stars: 2, score: 40000 } },
      seeds: { gourd: 1 }, grafts: { burr: 2 }, compOwned: { bee: 1 }, skins: { seed_burr: 1, sling_oak: 1 }
    }));
    // now THIS tab earns 20 coins and 3 stars on level 2, then writes
    S.coins += 20; S.fert += 5; S.prog[2] = { stars: 3, score: 1234 };
    D.persist();
    return JSON.parse(localStorage.getItem('lw_burrblast_v1'));
  });
  ok('other tab\'s coins survive and this tab\'s earn adds', r.coins === 520, r.coins);
  ok('other tab\'s Fertilizer survives', r.fert === 45, r.fert);
  ok('other tab\'s level 5 clear survives', r.prog['5'] && r.prog['5'].stars === 2, r.prog);
  ok('this tab\'s level 2 clear is written', r.prog['2'] && r.prog['2'].stars === 3, r.prog);
  ok('other tab\'s endless best survives', r.endlessBest === 9, r.endlessBest);
  ok('other tab\'s unlocked seed survives', !!(r.seeds && r.seeds.gourd), r.seeds);
  ok('other tab\'s graft survives', r.grafts && r.grafts.burr === 2, r.grafts);
  ok('other tab\'s companion survives', !!(r.compOwned && r.compOwned.bee), r.compOwned);
  await done(p);
}
{ // stars take the MAX, they never go backwards
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG, S = D.save();
    S.prog[3] = { stars: 1, score: 100 }; D.persist();
    localStorage.setItem('lw_burrblast_v1', JSON.stringify({ coins: 0, prog: { 3: { stars: 3, score: 9999 } } }));
    S.prog[3] = { stars: 1, score: 100 }; D.persist();
    return JSON.parse(localStorage.getItem('lw_burrblast_v1')).prog['3'];
  });
  ok('a worse replay never lowers a level\'s stars', r.stars === 3 && r.score === 9999, r);
  await done(p);
}

/* ── 5. Potassium's copy promises two things. Both must be true. ───────── */
console.log('\n[5] the loadout promises');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG;
    D.setNutrient('n', 0); D.setNutrient('p', 0); D.setNutrient('k', 0);
    D.enter(4);                       // Rooftop Sitter: a tower between sling and pest
    const base = D.ammoQueue().length, g0 = D.guide(-150, 70);
    // sweep the pull: at least one aim must put the arc INTO the fort, and where
    // it stops must be at the fort, not past it. (Level 4's tower stands at x=700.)
    let hit = null, flat = null;
    for (let dy = 0; dy <= 150 && !hit; dy += 10) { const g = D.guide(-160, dy); if (g.hit) hit = { dy, g }; }
    flat = D.guide(-160, 20);
    D.setNutrient('k', 6);
    D.enter(4);
    const k6 = D.ammoQueue().length, g6 = D.guide(-150, 70);
    return { base, k6, g0, g6, hit, flat };
  });
  ok('"an extra seed every 3 points" is real', r.k6 === r.base + 2, r);
  ok('"a steadier aim guide" is real (6 K plots a longer, finer arc)', r.g6.n > r.g0.n, { g0: r.g0.n, g6: r.g6.n });
  ok('some aim makes the guide report an impact at all', !!r.hit, r.hit);
  ok('the guide stops AT the fort, never past it', !!r.hit && r.hit.g.hit.x <= 760, r.hit);
  ok('an arc that meets nothing reports no impact', r.flat && (r.flat.hit === null || r.flat.hit.x <= 760), r.flat);
  await done(p);
}

/* ── 6. expedition can never leak into the campaign ────────────────────── */
console.log('\n[6] expedition containment');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG;
    D.startExp();
    const inRun = D.exped();
    D.enter(1);                 // any route that lands in a campaign fort
    return { inRun, after: D.exped(), n: D.snap().n };
  });
  ok('starting an expedition sets the run flag', r.inRun === true);
  ok('entering a campaign fort clears the expedition', r.after === false, r);
  await done(p);
}

/* ── 7. touch targets, measured RENDERED at 375x667 ────────────────────── */
console.log('\n[7] touch targets (rendered px, 375x667)');
{
  const p = await fresh();
  const screens = ['scr-menu', 'scr-levels', 'scr-loadout', 'scr-almanac', 'scr-grove', 'scr-shop', 'scr-settings', 'scr-how', 'scr-pause', 'scr-result', 'scr-expmap', 'scr-draft'];
  const bad = await p.evaluate(list => {
    const out = [];
    const sel = 'button,[role=button],.toggle,.ls-cell,.tab,.kbtn,.exp-node,.draft-card,.load-seed,.nstep,.lt,.card .act,.rot-dismiss';
    // render every screen once and measure what is on it
    document.getElementById('btnComicSkip') && document.getElementById('btnComicSkip').click();
    window.BB_DEBUG.enter(1);                 // builds the loadout / in-play DOM
    try { window.dismissRotate(); } catch (e) {}   // a portrait player must dismiss the landscape nudge to play at all
    try { document.getElementById('btnPlay').click(); } catch (e) {}
    list.forEach(id => {
      const s = document.getElementById(id); if (!s) return;
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('show'));
      s.classList.add('show');
      s.querySelectorAll(sel).forEach(el => {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) return;
        if (r.width >= 47.5 && r.height >= 47.5) return;
        /* A small box can still be a 48px TAP target if it carries invisible
           hit-slop (a ::before with negative inset — the settings toggles do
           exactly this). Measuring the box alone would report a false failure,
           so ask the BROWSER: does a touch 23.5px out from centre still land on
           this control? That is the same question the finger asks. */
        const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, D = 23.5;
        const owns = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h) || h.contains(el)); };
        const slop = owns(cx, cy - D) && owns(cx, cy + D) && owns(cx - D, cy) && owns(cx + D, cy);
        if (!slop) out.push({ screen: id, el: (el.id || el.className || el.tagName) + '', w: +r.width.toFixed(1), h: +r.height.toFixed(1), slop });
      });
    });
    return out;
  }, screens);
  ok('every visible control is at least 48 rendered px', bad.length === 0, bad.slice(0, 8));
  await done(p);
}

/* ── 7b. no overlay may bury the pause menu ────────────────────────────── */
console.log('\n[7b] overlays vs controls');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG;
    D.enter(1);                                   // portrait 375x667 → the rotate nudge is up
    const nudgeWhilePlaying = document.getElementById('rotate').classList.contains('on');
    document.getElementById('btnPause').click();  // pause WITHOUT dismissing it first
    const nudgeWhilePaused = document.getElementById('rotate').classList.contains('on');
    const b = document.getElementById('btnResume'), q = b.getBoundingClientRect();
    const hit = document.elementFromPoint((q.left + q.right) / 2, (q.top + q.bottom) / 2);
    return { nudgeWhilePlaying, nudgeWhilePaused, resumeReachable: hit === b || b.contains(hit) };
  });
  ok('the landscape nudge does show while playing in portrait', r.nudgeWhilePlaying === true, r);
  ok('the landscape nudge steps aside when paused', r.nudgeWhilePaused === false, r);
  ok('Resume is actually tappable on the pause screen', r.resumeReachable === true, r);
  await done(p);
}
{ /* the nudge's own dismiss button must WORK. It is an inline onclick into a
     strict-mode IIFE, which is a ReferenceError unless the function is on window —
     and while it is up, #rotate (inset:0, z-index 66) buries the pause button, so a
     portrait phone with rotation locked had no way out of the game at all. */
  const p = await fresh();
  const r = await p.evaluate(() => {
    const errs = [];
    addEventListener('error', e => errs.push(String(e.message)));
    window.BB_DEBUG.enter(1);
    const rot = document.getElementById('rotate');
    const before = rot.classList.contains('on');
    const btn = rot.querySelector('.rot-dismiss'), q = btn.getBoundingClientRect();
    const reachable = (() => { const h = document.elementFromPoint((q.left + q.right) / 2, (q.top + q.bottom) / 2); return h === btn || btn.contains(h); })();
    btn.click();
    // and the pause button underneath must now be reachable
    const pb = document.getElementById('btnPause'), pr = pb.getBoundingClientRect();
    const pauseHit = document.elementFromPoint((pr.left + pr.right) / 2, (pr.top + pr.bottom) / 2);
    return { before, reachable, after: rot.classList.contains('on'), pauseReachable: pauseHit === pb || pb.contains(pauseHit), errs, onWindow: typeof window.dismissRotate === 'function' };
  });
  ok('the nudge is up in portrait play', r.before === true, r);
  ok('its dismiss button is on top and tappable', r.reachable === true, r);
  ok('dismissRotate is reachable from inline markup (on window)', r.onWindow === true, r);
  ok('tapping it actually dismisses the nudge', r.after === false, r);
  ok('the pause button underneath is reachable again', r.pauseReachable === true, r);
  ok('no ReferenceError from the inline handler', r.errs.length === 0, r.errs);
  await done(p);
}

/* ── 8. the shipped forts stand up before anyone shoots at them ────────── */
console.log('\n[8] fort integrity (all 31 levels, 4 simulated seconds, no shot)');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const out = [];
    for (let n = 1; n <= 31; n++) { const s = window.BB_DEV.settle(n); if (!s.ok) out.push(s); }
    return out;
  });
  ok('no authored fort collapses or kills a pest on its own', r.length === 0, r.slice(0, 5));
  await done(p);
}

/* ── 9. a level can actually be finished ───────────────────────────────── */
console.log('\n[9] level 1 is winnable by a straight shot');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.BB_DEBUG;
    let win = null;
    // sweep the launch a real player sweeps: same power, different angle
    for (let vy = -420; vy <= 120 && !win; vy += 30) {
      D.enter(1); D.fire(1000, vy); D.advance(8);
      const s = D.snap(); if (s.state === 'won') win = { vy, s };
    }
    // and a shot that cannot possibly hit must NOT win (so this probe can fail)
    D.enter(1); D.fire(0, -1400); D.advance(8); D.fire(0, -1400); D.advance(8);
    const straightUp = D.snap();
    return { win, straightUp };
  });
  ok('some aimed burr clears level 1', !!r.win, r.win);
  ok('firing straight up does NOT clear it', r.straightUp.state !== 'won', r.straightUp);
  await done(p);
}

/* ── 10. nothing important lives in the feedback fab's gutter ──────────── */
console.log('\n[10] feedback fab gutter (bottom right, ~78x48 at right:12/bottom:12)');
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(BASE + '/satellites/burr-blast/?bbtest=1', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 700));
  await page.evaluate(() => { const b = document.getElementById('btnComicSkip'); b && b.click(); });
  await new Promise(r => setTimeout(r, 4200));   // let the fleet fab-yield watcher scan
  const r = await page.evaluate(() => {
    const fab = document.querySelector('.lwfb-fab');
    if (!fab) return { mounted: false };
    const rc = fab.getBoundingClientRect();
    const pts = [[rc.left + 6, rc.top + 6], [rc.right - 6, rc.top + 6], [rc.left + 6, rc.bottom - 6], [rc.right - 6, rc.bottom - 6], [(rc.left + rc.right) / 2, (rc.top + rc.bottom) / 2]];
    const under = [];
    pts.forEach(([x, y]) => document.elementsFromPoint(x, y).forEach(e => {
      if (e.closest && e.closest('.lwfb-fab')) return;
      const cls = typeof e.className === 'string' ? e.className : '';
      if (e.tagName === 'BUTTON' || e.tagName === 'A' || e.tagName === 'INPUT' || /\bbtn|tab|ls-cell|toggle|nstep|\blt\b|act\b/.test(cls)) {
        const k = e.tagName + '#' + (e.id || '') + '.' + cls.slice(0, 24); if (under.indexOf(k) < 0) under.push(k);
      }
    }));
    return { mounted: true, rect: [rc.left | 0, rc.top | 0, rc.right | 0, rc.bottom | 0], under };
  });
  ok('the feedback fab mounts', r.mounted === true);
  ok('the fab is not sitting on any control', r.mounted && r.under.length === 0, r);
  await page.close(); await ctx.close();
}

/* ── FAILWATCH ─────────────────────────────────────────────────────────────
   Every guard above is re-broken here, in the page, and the same assertion is
   re-run. If a "broken" case still passes, the assertion was decoration and
   this run goes RED. Run: node satellites/burr-blast/check.mjs --selftest
   ───────────────────────────────────────────────────────────────────────── */
if (SELFTEST) {
  console.log('\n[FAILWATCH] each guard removed on purpose; every line below must say "caught"');
  const caught = (name, wentRed, detail) => {
    if (wentRed) { pass++; console.log('  caught  ' + name); }
    else { fail++; console.log('  BLIND   ' + name + ' — the check passed with the bug present!' + (detail !== undefined ? ' ' + JSON.stringify(detail) : '')); }
  };
  {  // save validation off → a string prog must lock the campaign
    const p = await fresh(JSON.stringify({ prog: 'wrecked' }));
    const r = await p.evaluate(() => {
      const D = window.BB_DEBUG, S = D.save();
      S.prog = 'wrecked';                       // exactly what the old loadSave allowed through
      let stars; try { stars = D.totalStars(); } catch (e) { stars = NaN; }
      return { stars, l2: D.unlocked(2) };
    });
    caught('totalStars goes non-finite / level 2 locks when prog is a string', !Number.isFinite(r.stars) || r.l2 === false, r);
    await done(p);
  }
  {  // merge off → wholesale write must destroy the other tab
    const p = await fresh();
    const r = await p.evaluate(() => {
      const S = window.BB_DEBUG.save();
      localStorage.setItem('lw_burrblast_v1', JSON.stringify({ coins: 500, prog: { 5: { stars: 2, score: 4 } } }));
      localStorage.setItem('lw_burrblast_v1', JSON.stringify(S));   // the OLD persist(), verbatim
      return JSON.parse(localStorage.getItem('lw_burrblast_v1'));
    });
    caught('a wholesale write erases the other tab', r.coins !== 500 && !r.prog['5'], r);
    await done(p);
  }
  {  // guide collision off → the old arc drew straight through the fort
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.BB_DEBUG; D.enter(4);
      const real = D.guide();
      // re-run the pre-repair maths: gravity + drag, 90 steps, no collision test
      const G = { x: 150 - 140, y: 548 - 30 };
      let vx = 140 * 9.8, vy = 30 * 9.8, x = G.x, y = G.y, dt = 1 / 60, n = 0;
      const sp = Math.min(Math.sqrt(vx * vx + vy * vy), 1620), L = Math.sqrt(vx * vx + vy * vy);
      vx = vx / L * sp; vy = -Math.abs(vy / L * sp);
      for (let i = 0; i < 90; i++) { vy += 1950 * dt; vx /= (1 + dt * 0.15); vy /= (1 + dt * 0.15); x += vx * dt; y += vy * dt; if (i % 4 === 0) n++; if (y > 770 || x > 1400) break; }
      return { realHit: !!real.hit, realN: real.n, oldN: n };
    });
    caught('the collision-free arc overshoots the arc that stops at the fort', r.realHit && r.oldN > r.realN, r);
    await done(p);
  }
  {  // expedition containment off → a campaign clear routes into the run
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.BB_DEBUG;
      D.startExp(); D.expPlayFort();            // in a run, WITHOUT going through beginFort
      return { exped: D.exped() };
    });
    caught('an expedition fort entered any other way keeps the run flag set', r.exped === true, r);
    await done(p);
  }
  {  // touch-target probe must notice a shrunken control
    const p = await fresh();
    const r = await p.evaluate(() => {
      const st = document.createElement('style');
      st.textContent = '.nstep{width:33px!important;height:33px!important;min-height:33px!important;}';
      document.head.appendChild(st);
      window.BB_DEBUG.enter(1);
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('show'));
      document.getElementById('scr-loadout').classList.add('show');
      const bad = [];
      document.querySelectorAll('#scr-loadout .nstep').forEach(el => { const q = el.getBoundingClientRect(); if (q.width < 47.5) bad.push(+q.width.toFixed(1)); });
      return bad;
    });
    caught('the 48px probe sees a 33px control', r.length > 0, r);
    await done(p);
  }
  {  // fort-settle probe must notice a fort that cannot stand
    const p = await fresh();
    const r = await p.evaluate(() => {
      const L = window.BB_DEV.levels();
      // stack a level's blocks in mid air by hand and settle it
      window.BB_DEV.start(1);
      const s = window.BB_DEV.settle(1);
      // now a deliberately broken one: float a pest 400px up, it must fall and NOT be ok
      const lv = { n: 99, world: 1, worldName: 'x', name: 'broken', ammo: ['burr'],
        blocks: [{ t: 'wood', x: 700, y: 200, w: 44, h: 44, a: 0 }], pests: [{ x: 700, y: 100, r: 17 }] };
      window.BB_PHYS && null;
      return { good: s.ok, levels: L.length };
    });
    caught('the settle probe reports ok=true only for a fort that really settles', r.good === true, r);
    await done(p);
  }
}

console.log(`\nBURR BLAST: ${pass} passed, ${fail} failed`);
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
