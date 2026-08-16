/* SPROING — headless assertion suite (2026-08-16 audit)
 *
 * Run:  node satellites/sproing/audit-check.mjs [baseUrl]
 *       default base is http://localhost:8777 — serve the REPO ROOT, not this
 *       folder, or /feedback.js and /sunbeam-sdk.js 404.
 *
 * This game exposes no dev hook, so everything below is driven the way a player
 * drives it: real clicks, real keyboard, real time. That makes it slower than
 * Slice 3D's suite and is the reason the deep-run assertions are shallow.
 *
 * ⛔ Every assertion here was watched FAIL on purpose before it was trusted.
 *    A probe you have not seen go red is decoration, not evidence.
 * ⛔ Each corrupt-save case gets its OWN browser context. An IIFE that dies at
 *    parse dies once per document; sharing a context would let a later case pass
 *    for the wrong reason.
 */
import {createRequire} from 'node:module';
const require = createRequire('/workspaces/lucid-winds/x.js');
const puppeteer = require('puppeteer');

const BASE = process.argv[2] || 'http://localhost:8777';
const URL = BASE + '/satellites/sproing/';
let pass = 0, fail = 0;
const ok = (n, c, d) => { if (c) { pass++; console.log('  ok   ' + n); } else { fail++; console.log('  FAIL ' + n + (d ? '  -> ' + d : '')); } };

/* ⛔ ONE BROWSER PER CASE. Reusing a single browser across ~30 boots on a 2-core
   box exhausts it and the run dies on a NAVIGATION timeout, which reads exactly
   like "the game stopped loading" and is nothing of the kind. Launch, use, close.
   ⛔ A corrupt-save case MUST get its own fresh document: an IIFE that dies at
   parse dies once, so sharing would let a later case pass for the wrong reason. */
const LAUNCH = { headless: 'new', protocolTimeout: 300000, args: ['--no-sandbox', '--disable-dev-shm-usage'] };

async function boot(poison) {
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667, deviceScaleFactor: 1 });
  const errs = [];
  p.on('pageerror', e => errs.push(e.message.split('\n')[0].slice(0, 130)));
  if (poison) await p.evaluateOnNewDocument(poison);
  await p.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise(r => setTimeout(r, 2600));
  return { ctx: { close: () => browser.close() }, p, errs };
}

/* the title screen is STATIC HTML, so "it rendered" proves nothing about whether
   the game is alive. Prove the IIFE survived by making a button do its job. */
const ALIVE = `(async () => {
  const vis = () => [...document.querySelectorAll('.screen')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join(',') || '(game)';
  const out = { boot: vis() };
  try { localStorage.setItem('sproing_bounce_seen', '1'); } catch (e) {}
  document.getElementById('b-play').click();
  await new Promise(r => setTimeout(r, 450));
  out.afterPlay = vis();
  const adv = document.getElementById('m-adventure');
  if (adv) { adv.click(); await new Promise(r => setTimeout(r, 600)); out.afterAdventure = vis(); }
  out.mapCells = (document.getElementById('map-grid') || {children: []}).children.length;
  document.getElementById('b-shop') && document.getElementById('b-shop').click();
  await new Promise(r => setTimeout(r, 300));
  out.shopRows = (document.getElementById('shop-grid') || {children: []}).children.length;
  return out;
})()`;

/* ---- 1. corrupt save must never take the game down ------------------------ */
console.log('\n[1] corrupt save: the game stays alive and every screen still opens');
const POISON = [
  ['sproing_settings', '5'], ['sproing_settings', '"x"'], ['sproing_settings', '[]'], ['sproing_settings', 'true'],
  ['sproing_levels', '5'], ['sproing_levels', '[]'], ['sproing_levels', '{"stars":7}'], ['sproing_levels', '{"stars":[],"unlocked":-3}'],
  ['sproing_owned', '{}'], ['sproing_owned', '"x"'], ['sproing_owned', '9'],
  ['sproing_stats', '5'], ['sproing_stats', '[]'],
  ['sproing_upgrades', '[]'], ['sproing_upgrades', '"x"'],
  ['sproing_equip', '7'], ['sproing_equip', '[]'],
  ['sproing_accs', '5'], ['sproing_themes', '1'], ['sproing_trails', '9'],
  ['sproing_ach', '[]'], ['sproing_sketchbook', '{}'], ['sproing_streak', '"x"'],
  ['sproing_coins', 'abc'], ['sproing_coins', '-50'], ['sproing_best', 'NaN']
];
for (const [k, v] of POISON) {
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem(${JSON.stringify(k)},${JSON.stringify(v)});}catch(e){}})()`);
  const r = await p.evaluate(ALIVE);
  const good = r.boot === 's-title' && r.afterPlay === 's-modes' && r.afterAdventure === 's-map' && r.mapCells === 25 && r.shopRows > 0 && errs.length === 0;
  ok(`${k}=${v}`, good, JSON.stringify(r) + (errs.length ? ' err:' + errs[0] : ''));
  await ctx.close();
}

/* ---- 2. corrupt save leaves SANE values, not just a live page ------------- */
console.log('\n[2] corrupt save falls back to sane values');
{
  const { ctx, p, errs } = await boot(`(()=>{try{
    localStorage.setItem('sproing_settings','5');
    localStorage.setItem('sproing_levels','[]');
    localStorage.setItem('sproing_coins','abc');
    localStorage.setItem('sproing_best','NaN');
    localStorage.setItem('sproing_owned','{}');
  }catch(e){}})()`);
  const r = await p.evaluate(async () => {
    try { localStorage.setItem('sproing_bounce_seen', '1'); } catch (e) {}
    document.getElementById('b-settings').click();
    await new Promise(r => setTimeout(r, 500));
    const shown = getComputedStyle(document.getElementById('s-settings')).display !== 'none';
    const rows = (document.getElementById('set-list') || document.getElementById('s-settings')).textContent.length;
    return { settingsOpens: shown, rows, best: document.getElementById('besttag').textContent };
  });
  ok('settings screen still opens on a poisoned settings key', r.settingsOpens && r.rows > 40, JSON.stringify(r));
  ok('best altitude is a number, not NaN', !/NaN/.test(r.best), r.best);
  ok('no page errors on an all-poisoned boot', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---- 3. two tabs must not clobber ----------------------------------------
   The scenario: this tab booted with a wallet snapshot, then the OTHER tab banked
   a run. Anything this tab writes afterwards must MERGE with what the other tab
   left on disk, never overwrite it from the stale snapshot. Simulated by writing
   to localStorage behind this tab's back, then driving a REAL purchase through the
   shop so the actual writer runs, not a stand-in. */
console.log('\n[3] two tabs: coins ADD, best MAXes, stars MAX');
{
  const { ctx, p, errs } = await boot(`(()=>{try{
    localStorage.setItem('sproing_coins','400');
    localStorage.setItem('sproing_bounce_seen','1');
  }catch(e){}})()`);
  const r = await p.evaluate(async () => {
    const out = { booted: parseInt(localStorage.getItem('sproing_coins'), 10) };

    /* the other tab banks a big run while this tab sits on its 400 snapshot */
    localStorage.setItem('sproing_coins', '2000');

    /* now this tab spends 300 on a Leaf Cap through the real shop UI */
    document.getElementById('b-shop').click(); await new Promise(r => setTimeout(r, 350));
    const hats = [...document.querySelectorAll('.shoptab')].find(t => /hat/i.test(t.textContent));
    if (hats) { hats.click(); await new Promise(r => setTimeout(r, 300)); }
    const buy = [...document.querySelectorAll('#shop-grid button, #shop-grid .cell')]
      .find(b => /leaf cap|300/i.test(b.textContent));
    if (buy) { buy.click(); await new Promise(r => setTimeout(r, 300)); }
    const yes = document.getElementById('mx2'); if (yes) { yes.click(); await new Promise(r => setTimeout(r, 350)); }
    out.afterBuy = parseInt(localStorage.getItem('sproing_coins'), 10);
    out.boughtHat = (JSON.parse(localStorage.getItem('sproing_accs') || '[]') || []).indexOf('leafhat') >= 0;

    /* best: the other tab sets a record this tab has never seen */
    localStorage.setItem('sproing_best', '777');
    /* stars: the other tab clears world 1 level 4 */
    localStorage.setItem('sproing_levels', JSON.stringify({ stars: { '3': 3 }, unlocked: 4 }));
    /* make THIS tab save its own (empty) level progress the way a clear would */
    document.getElementById('shop-back').click(); await new Promise(r => setTimeout(r, 300));
    document.getElementById('b-play').click(); await new Promise(r => setTimeout(r, 350));
    document.getElementById('m-adventure').click(); await new Promise(r => setTimeout(r, 600));
    const lv = JSON.parse(localStorage.getItem('sproing_levels'));
    out.stars3 = lv && lv.stars ? lv.stars['3'] : null;
    out.unlocked = lv ? lv.unlocked : null;
    out.mapShown = getComputedStyle(document.getElementById('s-map')).display !== 'none';
    return out;
  });
  /* 2000 on disk minus the 300 this tab spent = 1700. The old code wrote
     400 - 300 = 100 and destroyed 1600 coins the other tab had earned. */
  ok('a purchase spends against the DISK wallet, not the boot snapshot',
    r.boughtHat && r.afterBuy === 1700, JSON.stringify(r));
  ok("the other tab's stars survive this tab's save", r.stars3 === 3 && r.unlocked >= 4, JSON.stringify(r));
  ok('the map still opens through the merge', r.mapShown, JSON.stringify(r));
  ok('no page errors during the merge', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---- 4. the core loop is reachable and escapable -------------------------- */
console.log('\n[4] core loop: onboarding is escapable and a run starts');
{
  const { ctx, p, errs } = await boot();
  const r = await p.evaluate(async () => {
    const vis = () => [...document.querySelectorAll('.screen')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join(',') || '(game)';
    const out = {};
    document.getElementById('b-play').click(); await new Promise(r => setTimeout(r, 500));
    out.fresh = vis();                                   // onboarding sends you to draw
    /* a player who does not want to draw must not be trapped there */
    document.getElementById('draw-back').click(); await new Promise(r => setTimeout(r, 500));
    out.escaped = vis();
    out.bounceSet = !!localStorage.getItem('sproing_bounce_seen');
    document.getElementById('b-play').click(); await new Promise(r => setTimeout(r, 500));
    out.secondPlay = vis();                              // now it goes to modes, not back to the studio
    document.getElementById('m-endless').click(); await new Promise(r => setTimeout(r, 900));
    out.running = vis();
    return out;
  });
  ok('a fresh install opens the studio', r.fresh === 's-studio', JSON.stringify(r));
  ok('the studio is escapable without drawing', r.escaped === 's-title' && r.bounceSet, JSON.stringify(r));
  ok('PLAY then goes to mode select, not back to the studio', r.secondPlay === 's-modes', JSON.stringify(r));
  ok('Endless actually starts a run', r.running === '(game)', JSON.stringify(r));

  await new Promise(r => setTimeout(r, 1500));
  for (let i = 0; i < 6; i++) {
    await p.keyboard.down(i % 2 ? 'ArrowLeft' : 'ArrowRight');
    await new Promise(r => setTimeout(r, 320));
    await p.keyboard.up(i % 2 ? 'ArrowLeft' : 'ArrowRight');
    await new Promise(r => setTimeout(r, 200));
  }
  const live = await p.evaluate(() => ({
    hudOn: document.getElementById('hud').classList.contains('on'),
    alt: document.getElementById('alt').textContent,
    screen: [...document.querySelectorAll('.screen')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join(',') || '(game)'
  }));
  ok('the HUD is up during a run', live.hudOn, JSON.stringify(live));
  ok('the run is still alive or ended cleanly on a real screen',
    live.screen === '(game)' || live.screen === 's-over' || live.screen === 's-pause', JSON.stringify(live));

  /* pause must be reachable and must let go again */
  const paused = await p.evaluate(async () => {
    const vis = () => [...document.querySelectorAll('.screen')].filter(s => getComputedStyle(s).display !== 'none').map(s => s.id).join(',') || '(game)';
    if (vis() !== '(game)') return { skipped: vis() };
    document.getElementById('pausebtn').click(); await new Promise(r => setTimeout(r, 400));
    const p1 = vis();
    document.getElementById('p-quit').click(); await new Promise(r => setTimeout(r, 500));
    return { paused: p1, quit: vis() };
  });
  ok('pause opens and quit returns to the title', paused.skipped || (paused.paused === 's-pause' && paused.quit === 's-title'), JSON.stringify(paused));
  ok('no page errors across the whole loop', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---- 5. the eight standing defect classes -------------------------------- */
console.log('\n[5] standing defect classes');
{
  const { ctx, p } = await boot();
  const r = await p.evaluate(() => {
    const out = {};
    out.exitFn = typeof window.SWS_EXIT;
    const x = document.getElementById('b-exit');
    const b = x.getBoundingClientRect();
    out.exit = { w: +b.width.toFixed(1), h: +b.height.toFixed(1), shown: getComputedStyle(x).display !== 'none' };
    /* the exit must not depend on being framed: the portal navigates /satellites/
       urls TOP LEVEL, so a window.parent test is false and would never fire */
    out.exitSrc = window.SWS_EXIT.toString();
    out.usesReferrer = /document\.referrer/.test(out.exitSrc);

    /* Touch targets as RENDERED px at 375x667, never declared CSS. This stage is
       540x960 scaled ~0.694, so a declared 48 renders at 33 and a declared 56
       renders at 39.
       ⛔ Measure the EFFECTIVE hit area, not the CSS box. .icobtn is 56 stage px
       (38.9 rendered, which would fail) but carries an ::after{inset:-8px} hit
       expander that takes it to 72 stage px / 50 rendered. A box-only check
       condemns a control that is actually fine; a naive el.click() check passes a
       control that is actually unreachable. Probe with elementFromPoint at the
       48px extremes and ask who really receives the tap. */
    out.small = [];
    out.boxOnly = [];
    const hits = (el) => {
      const q = el.getBoundingClientRect();
      const cx = q.x + q.width / 2, cy = q.y + q.height / 2;
      const pts = [[cx - 23, cy], [cx + 23, cy], [cx, cy - 23], [cx, cy + 23]];
      return pts.every(([x, y]) => { const t = document.elementFromPoint(x, y); return t && (t === el || el.contains(t) || t.parentNode === el); });
    };
    document.querySelectorAll('button,.btn,.icobtn,.cell,.shoptab,.tool,.sw').forEach(el => {
      const c = getComputedStyle(el), q = el.getBoundingClientRect();
      if (c.display === 'none' || c.visibility === 'hidden' || q.width < 1) return;
      const boxSmall = q.width < 48 || q.height < 48;
      if (boxSmall) out.boxOnly.push((el.id || el.className) + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0));
      if (boxSmall && !hits(el)) out.small.push((el.id || el.className) + ' ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0) + ' (no hit expander)');
    });

    /* nothing important in the bottom-right: that belongs to the feedback fab */
    const fab = document.querySelector('.lwfb-fab');
    out.fab = fab ? (() => { const f = fab.getBoundingClientRect(); return { x: Math.round(f.x), y: Math.round(f.y), w: Math.round(f.width), h: Math.round(f.height) }; })() : null;
    out.fabHidden = fab ? (fab.getAttribute('data-lwfb-yield') === '1' || +getComputedStyle(fab).opacity === 0) : false;
    out.underFab = [];
    if (fab) {
      const f = fab.getBoundingClientRect();
      document.querySelectorAll('button,.btn,.icobtn').forEach(el => {
        const c = getComputedStyle(el), q = el.getBoundingClientRect();
        if (c.display === 'none' || q.width < 1) return;
        if (q.right > f.left && q.left < f.right && q.bottom > f.top && q.top < f.bottom) out.underFab.push(el.id || el.className);
      });
    }

    /* an overlay must not sit on a control */
    out.covered = [];
    document.querySelectorAll('#s-title button').forEach(el => {
      const q = el.getBoundingClientRect(), t = document.elementFromPoint(q.x + q.width / 2, q.y + q.height / 2);
      if (t && t !== el && !el.contains(t)) out.covered.push((el.id || el.className) + ' covered by ' + (t.id || t.className || t.tagName));
    });

    /* dashes in player copy */
    const copy = [...document.querySelectorAll('#s-title, #s-modes, #s-over, #s-levelend, .ribbon, .title-sub')].map(n => n.textContent).join(' ');
    out.dashes = (copy.match(/[A-Za-z,)][ ]+[-–—][ ]+[A-Za-z0-9]/g) || []);
    return out;
  });
  ok('SWS_EXIT is defined', r.exitFn === 'function', r.exitFn);
  ok('the exit button renders on the title screen', r.exit.shown && r.exit.w > 10, JSON.stringify(r.exit));
  ok('the exit button clears 48 rendered px', r.exit.h >= 48, JSON.stringify(r.exit));
  ok('the exit does not depend on being framed', r.usesReferrer, 'no document.referrer fallback');
  ok('every control offers 48 rendered px of EFFECTIVE hit area', r.small.length === 0, r.small.join(', '));
  console.log('       (boxes under 48 that pass on their ::after hit expander: ' + (r.boxOnly.join(', ') || 'none') + ')');
  ok('the feedback fab covers no control', r.underFab.length === 0, r.underFab.join(', '));
  ok('the feedback fab is reachable, not yielded away', !r.fabHidden, JSON.stringify(r.fab));
  ok('nothing covers a title screen control', r.covered.length === 0, r.covered.join(', '));
  ok('no dashes in player copy', r.dashes.length === 0, r.dashes.join(' | '));
  await ctx.close();
}

/* ---- 5b. the IN-RUN HUD, which every menu-screen sweep misses -------------
   #hud is display:none until a run starts, so a touch-target sweep taken on the
   title screen never sees #pausebtn or #mutebtn at all. They are .icobtn: 56 stage
   px, which is 38.9 RENDERED px and would fail the 48 rule on its box alone. They
   pass only because of the ::after{inset:-8px} expander. Assert that, in the run,
   where it matters. */
console.log('\n[5b] in-run HUD controls');
{
  const { ctx, p, errs } = await boot(`(()=>{try{localStorage.setItem('sproing_bounce_seen','1');}catch(e){}})()`);
  await p.evaluate(async () => {
    document.getElementById('b-play').click(); await new Promise(r => setTimeout(r, 400));
    document.getElementById('m-endless').click(); await new Promise(r => setTimeout(r, 900));
  });
  await new Promise(r => setTimeout(r, 1200));
  const r = await p.evaluate(() => {
    const out = { hudOn: document.getElementById('hud').classList.contains('on'), ctrls: [], fail: [] };
    ['pausebtn', 'mutebtn'].forEach(id => {
      const el = document.getElementById(id); if (!el) { out.fail.push(id + ' MISSING'); return; }
      const q = el.getBoundingClientRect();
      out.ctrls.push(id + ' box ' + q.width.toFixed(0) + 'x' + q.height.toFixed(0));
      const cx = q.x + q.width / 2, cy = q.y + q.height / 2;
      [[cx - 23, cy], [cx + 23, cy], [cx, cy - 23], [cx, cy + 23]].forEach(([x, y]) => {
        const t = document.elementFromPoint(x, y);
        if (!(t && (t === el || el.contains(t) || t.parentNode === el))) out.fail.push(id + ' misses at ' + Math.round(x) + ',' + Math.round(y) + ' -> ' + (t ? (t.id || t.tagName) : 'null'));
      });
    });
    /* and the fab must not be sitting on either of them */
    const fab = document.querySelector('.lwfb-fab');
    if (fab) {
      const f = fab.getBoundingClientRect();
      ['pausebtn', 'mutebtn'].forEach(id => {
        const q = document.getElementById(id).getBoundingClientRect();
        if (q.right > f.left && q.left < f.right && q.bottom > f.top && q.top < f.bottom) out.fail.push('fab overlaps ' + id);
      });
    }
    return out;
  });
  ok('the HUD is up during a run', r.hudOn, JSON.stringify(r));
  ok('pause and mute offer 48 rendered px of effective hit area', r.fail.length === 0, r.fail.join(' | '));
  console.log('       (' + r.ctrls.join('; ') + ')');
  ok('no page errors reaching the HUD', errs.length === 0, errs.join(' | '));
  await ctx.close();
}

/* ---- 6. the ready handshake follows the portal contract ------------------- */
console.log('\n[6] portal handshake');
{
  const browser = await puppeteer.launch(LAUNCH);
  const p = await browser.newPage();
  await p.setViewport({ width: 375, height: 667 });
  /* frame the game the way the portal frames a github.io card: NO ?embed=1 flag.
     The old code gated the handshake on that flag, so a silent load would have
     been treated as a black screen and auto-closed. */
  await p.setContent(`<!doctype html><body style="margin:0">
    <script>window.__ready=0;addEventListener('message',function(e){if(e.data&&e.data.sws==='ready')window.__ready++;});<\/script>
    <iframe src="${URL}" style="width:375px;height:667px;border:0"></iframe></body>`, { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 3500));
  const n = await p.evaluate(() => window.__ready);
  ok('{sws:ready} is posted when framed without ?embed=1', n >= 1, 'received ' + n);
  ok('{sws:ready} is posted twice (parse time AND load)', n >= 2, 'received ' + n + ', want >=2');
  await browser.close();
}
console.log('\n=== sproing: ' + pass + ' passed, ' + fail + ' failed ===');
process.exit(fail ? 1 : 0);
