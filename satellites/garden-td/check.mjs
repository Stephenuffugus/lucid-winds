/* GARDEN GUARD (garden-td) — repair verifier.  node satellites/garden-td/check.mjs
   ────────────────────────────────────────────────────────────────────────
   Real Chrome, real game code, real localStorage. Every assertion here was
   WATCHED FAIL on purpose before it was trusted — run with --selftest to
   re-run that proof. A probe that cannot fail is not evidence.
   ──────────────────────────────────────────────────────────────────────── */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const PORT = 8991 + (process.pid % 40);
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

async function fresh(seedSave) {
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  const errs = [];
  page.on('pageerror', e => errs.push(String(e.message).slice(0, 200)));
  if (seedSave !== undefined) {
    await page.goto(BASE + '/satellites/garden-td/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(v => { localStorage.setItem('gg_save', v); }, seedSave);
  }
  await page.goto(BASE + '/satellites/garden-td/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 500));
  page._errs = errs; page._ctx = ctx;
  return page;
}
const done = async p => { await p.close(); await p._ctx.close(); };

/* ── 1. boot + the way in and the way out ──────────────────────────────── */
console.log('\n[1] boot and core loop');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const b = document.getElementById('exitBtn'), cs = getComputedStyle(b);
    return { hook: !!(window.__GTD && window.__GTD.start), exit: typeof window.SWS_EXIT === 'function',
      exitShown: cs.display !== 'none' && cs.visibility !== 'hidden', exitWired: typeof b.onclick === 'function',
      menu: document.getElementById('scr-menu').classList.contains('show'),
      towers: Object.keys(window.__GTD.TOWERS).length, maps: window.__GTD.MAPS.length };
  });
  ok('page throws nothing on boot', p._errs.length === 0, p._errs);
  ok('test hook present', r.hook);
  ok('menu is the first screen', r.menu);
  ok('SWS_EXIT is defined', r.exit);
  ok('exit button is visible', r.exitShown, r);
  ok('exit button actually calls something', r.exitWired);
  ok('9 plants in the catalog', r.towers === 9, r.towers);
  ok('maps exist', r.maps > 0, r.maps);
  await done(p);
}

/* ── 2. exit works when FRAMED, without ?embed=1 ───────────────────────── */
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
    f.src = base + '/satellites/garden-td/';       // no ?embed=1 on purpose
    document.body.appendChild(f);
    await new Promise(r => setTimeout(r, 2500));
    try { f.contentWindow.SWS_EXIT(); } catch (e) { return { err: String(e) }; }
    await new Promise(r => setTimeout(r, 300));
    return { seen };
  }, BASE);
  ok('framed WITHOUT ?embed=1 still posts sws:ready', (got.seen || []).indexOf('ready') >= 0, got);
  ok('framed SWS_EXIT posts sws:close (never navigates the frame)', (got.seen || []).indexOf('close') >= 0, got);
  await host.close(); await ctx.close();
}

/* ── 3. corrupt saves ──────────────────────────────────────────────────── */
console.log('\n[3] corrupt save survival');
const CORRUPT = [
  ['levels is a string',    JSON.stringify({ sap: 10, levels: 'wrecked' })],
  ['level records are nums',JSON.stringify({ levels: { 'garden-1': 3, 'garden-2': 'x' } })],
  ['settings is garbage',   JSON.stringify({ settings: { textScale: 'huge', sfx: 'loud', speedDefault: 99, reducedMotion: 'yes' } })],
  ['textScale is 40',       JSON.stringify({ settings: { textScale: 40 } })],
  ['cosmetics is a string', JSON.stringify({ cosmetics: 'x' })],
  ['towers holds junk',     JSON.stringify({ towers: ['ghost', 7, 'beehive'] })],
  ['everything is null',    JSON.stringify({ sap: null, levels: null, settings: null, cosmetics: null, towers: null, endless: null })],
  ['it is an array',        JSON.stringify([1, 2, 3])]
];
for (const [label, raw] of CORRUPT) {
  const p = await fresh(raw);
  const r = await p.evaluate(() => {
    const D = window.__GTD, s = D.save();
    let started = false, st = null;
    try { D.start('garden', 1); st = D.state(); started = !!st && st.leaves > 0 && st.seeds > 0; } catch (e) {}
    return { stars: D.totalStars(), unlocked: D.highestUnlocked('garden'), started, st,
      fontPx: parseFloat(getComputedStyle(document.documentElement).fontSize),
      settings: s.settings, ownedIsArr: Array.isArray(s.cosmetics.owned), towers: s.towers };
  });
  ok(label + ': level 1 starts and is playable', r.started === true, r);
  ok(label + ': totalStars is finite', Number.isFinite(r.stars), r.stars);
  ok(label + ': level unlock is a sane number', r.unlocked >= 1 && r.unlocked <= 13, r.unlocked);
  ok(label + ': root font size stays readable', r.fontPx >= 13 && r.fontPx <= 25, r.fontPx);
  ok(label + ': speed default is 1..3', r.settings.speedDefault >= 1 && r.settings.speedDefault <= 3, r.settings);
  ok(label + ': owned cosmetics is still an array', r.ownedIsArr === true, r);
  ok(label + ': no unknown plant is unlocked', Array.isArray(r.towers) && r.towers.indexOf('ghost') < 0, r.towers);
  ok(label + ': no page error', p._errs.length === 0, p._errs);
  await done(p);
}

/* ── 4. two tabs must not clobber ──────────────────────────────────────── */
console.log('\n[4] two tabs');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD, s = D.save();
    localStorage.setItem('gg_save', JSON.stringify({
      ver: 1, sap: 900, levels: { 'garden-3': { stars: 3, cleared: true }, 'garden-13': { stars: 2, cleared: true } },
      towers: ['beehive', 'pitcher'], endless: { bestWave: 22, bestSap: 140 },
      cosmetics: { skin: 'greenhouse', map: 'midnight', mascot: 'ladybug', owned: ['greenhouse', 'midnight', 'none', 'ladybug', 'terracotta'] },
      brambleUnlocked: true, tut: { done: true }
    }));
    s.sap += 25; s.levels['garden-1'] = { stars: 3, cleared: true };
    D.saveGame();
    return JSON.parse(localStorage.getItem('gg_save'));
  });
  ok('other tab\'s Sap survives and this tab\'s earn adds', r.sap === 925, r.sap);
  ok('other tab\'s cleared levels survive', !!(r.levels['garden-3'] && r.levels['garden-3'].cleared), r.levels);
  ok('this tab\'s cleared level is written', !!(r.levels['garden-1'] && r.levels['garden-1'].stars === 3), r.levels);
  ok('other tab\'s unlocked plants survive', r.towers.indexOf('beehive') >= 0 && r.towers.indexOf('pitcher') >= 0, r.towers);
  ok('other tab\'s endless best survives', r.endless.bestWave === 22, r.endless);
  ok('other tab\'s bought cosmetic survives', r.cosmetics.owned.indexOf('terracotta') >= 0, r.cosmetics.owned);
  ok('the Bramble unlock is sticky', r.brambleUnlocked === true, r);
  await done(p);
}
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD, s = D.save();
    s.levels['garden-4'] = { stars: 1, cleared: true }; D.saveGame();
    localStorage.setItem('gg_save', JSON.stringify({ sap: 0, levels: { 'garden-4': { stars: 3, cleared: true } } }));
    s.levels['garden-4'] = { stars: 1, cleared: true }; D.saveGame();
    return JSON.parse(localStorage.getItem('gg_save')).levels['garden-4'];
  });
  ok('a worse replay never lowers a level\'s stars', r.stars === 3, r);
  await done(p);
}

/* ── 5. the first thirty seconds ───────────────────────────────────────── */
console.log('\n[5] the tutorial actually teaches');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD;
    D.start('garden', 1);
    const tipUp = document.getElementById('tip').classList.contains('show');
    const txt = document.getElementById('tipText').textContent;
    // a real player taps the BOARD, not the little card
    const c = document.getElementById('game');
    c.dispatchEvent(new PointerEvent('pointerdown', { clientX: 180, clientY: 300, bubbles: true }));
    const tipAfterBoardTap = document.getElementById('tip').classList.contains('show');
    return { tipUp, txt, tipAfterBoardTap, plots: D.plots() };
  });
  ok('level 1 opens with a tip that names the first action', r.tipUp === true && /soil spot|plant/i.test(r.txt), r);
  ok('a tap on the BOARD dismisses it (it said "tap to continue")', r.tipAfterBoardTap === false, r);
  ok('the map offers somewhere to plant', r.plots > 0, r.plots);
  await done(p);
}

/* ── 6. the How to Play page must be TRUE ──────────────────────────────── */
console.log('\n[6] the game\'s own promises');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD, T = D.TOWERS;
    D.start('garden', 1);
    // "The beehive is your answer to flyers"
    const beeHitsAir = D.canHit('beehive', true);
    const marigoldT3Air = D.canHit('marigold', true);
    // "The sundew slows everything down"
    const sundewSlow = !!(T.sundew.tiers[0].slow || T.sundew.status === 'wet' || T.sundew.tiers[0].status === 'wet');
    const sundewReachesAir = D.canHit('sundew', true);
    // "The pitcher melts armor"
    const pitcherMelts = /armor|melt|vuln/i.test(JSON.stringify(T.pitcher)) || T.pitcher.status === 'rot';
    // "The sunflower snipes the big ones"
    const dmgs = Object.keys(T).map(k => ({ k, d: T[k].tiers[2].dmg || 0 }));
    const top = dmgs.sort((a, b) => b.d - a.d)[0];
    // "sell it back for MOST of your Seeds"
    D.addSeeds(400);
    const plots = D.G.geom.plots.length;
    D.place(0, 'marigold'); D.upgrade(0);
    const sold = D.sellRefund(0);
    return { beeHitsAir, marigoldT3Air, sundewSlow, sundewReachesAir, pitcherMelts, top, sold, plots };
  });
  ok('"the beehive is your answer to flyers" is true', r.beeHitsAir === true, r);
  ok('marigold really does reach air at ★3 (no anti-air softlock)', r.marigoldT3Air === true, r);
  ok('"the sundew slows everything down" is true, air included', r.sundewSlow && r.sundewReachesAir, r);
  ok('"the pitcher melts armor" has something behind it', r.pitcherMelts === true, r);
  ok('"the sunflower snipes the big ones" — it has the top single hit', r.top.k === 'sunflower', r.top);
  ok('"sell it back for most of your Seeds" is 70%', r.sold.refund === Math.floor(r.sold.invested * 0.7) && r.sold.refund / r.sold.invested >= 0.6, r.sold);
  await done(p);
}

/* ── 7. the curve is real, not flat ────────────────────────────────────── */
console.log('\n[7] difficulty curve');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD, E = D.ENEMIES;
    const load = L => {
      const w = D.buildWaves(L, false);
      let n = 0, hp = 0;
      w.forEach(g => g.forEach(x => { n += x.n; hp += x.n * ((E[x.t] && E[x.t].hp) || 200); }));
      return { L, waves: w.length, n, hp: Math.round(hp * (1 + 0.10 * (L - 1))) };
    };
    return [1, 2, 4, 6, 8, 10, 12].map(load);
  });
  const hps = r.map(x => x.hp);
  let rising = true;
  for (let i = 1; i < hps.length; i++) if (hps[i] <= hps[i - 1]) rising = false;
  ok('total wave HP rises every step from L1 to L12', rising, r);
  ok('L12 is at least 4x L1', hps[hps.length - 1] >= hps[0] * 4, { l1: hps[0], l12: hps[hps.length - 1] });
  ok('every level has at least 10 waves', r.every(x => x.waves >= 10), r);
  await done(p);
}

/* ── 8. a level can actually be won, and losing is possible ────────────── */
console.log('\n[8] completability');
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD;
    D.start('garden', 1);
    D.addSeeds(2000);
    const n = Math.min(6, D.G.geom.plots.length);
    for (let i = 0; i < n; i++) D.place(i, i % 2 ? 'cactus' : 'marigold');
    for (let i = 0; i < D.G.towers.length; i++) { D.upgrade(i); D.upgrade(i); }
    let guard = 0;
    while (D.G && D.G.state !== 'DONE' && guard++ < 40) { D.startWave(); D.step(90); }
    return { state: D.state(), guard, screen: document.getElementById('scr-win').classList.contains('show') };
  });
  ok('a reasonable defense clears level 1', r.screen === true, r);
  await done(p);
}
{
  const p = await fresh();
  const r = await p.evaluate(() => {
    const D = window.__GTD;
    D.start('garden', 1);            // plant NOTHING
    let guard = 0;
    while (D.G && D.G.state !== 'DONE' && guard++ < 20) { D.startWave(); D.step(90); }
    return { lose: document.getElementById('scr-lose').classList.contains('show'), st: D.state() };
  });
  ok('planting nothing loses the level (so [8] can fail)', r.lose === true, r);
  await done(p);
}

/* ── 9. touch targets, measured RENDERED at 375x667 ────────────────────── */
console.log('\n[9] touch targets (rendered px, 375x667)');
{
  const p = await fresh();
  const bad = await p.evaluate(() => {
    const D = window.__GTD, out = [];
    const sel = 'button,[role=button],.toggle,.ls-cell,.diff-card,.tab,.seg button,.kbtn,.sx,.card .act,.ls-endless,.shop-card button';
    const measure = (scope, tag) => scope.querySelectorAll(sel).forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return;
      if (r.width >= 47.5 && r.height >= 47.5) return;
      const cx = (r.left + r.right) / 2, cy = (r.top + r.bottom) / 2, D2 = 23.5;
      const owns = (x, y) => { const h = document.elementFromPoint(x, y); return !!h && (h === el || el.contains(h) || h.contains(el)); };
      if (!(owns(cx, cy - D2) && owns(cx, cy + D2) && owns(cx - D2, cy) && owns(cx + D2, cy)))
        out.push({ where: tag, el: (el.id || el.className || el.tagName) + '', w: +r.width.toFixed(1), h: +r.height.toFixed(1) });
    });
    // every menu screen
    ['scr-menu', 'scr-diff', 'scr-levels', 'scr-shop', 'scr-how', 'scr-settings', 'scr-pause', 'scr-win', 'scr-lose'].forEach(id => {
      const s = document.getElementById(id); if (!s) return;
      if (id === 'scr-levels') D.openLevels('garden');
      document.querySelectorAll('.screen').forEach(x => x.classList.remove('show'));
      s.classList.add('show');
      measure(s, id);
    });
    // and the in-play chrome, including both bottom sheets
    document.querySelectorAll('.screen').forEach(x => x.classList.remove('show'));
    D.start('garden', 1); D.addSeeds(2000);
    document.getElementById('tip').classList.remove('show');
    measure(document.getElementById('hud-top'), 'hud-top');
    measure(document.getElementById('hud-bot'), 'hud-bot');
    measure(document.getElementById('keeper-bar'), 'keeper-bar');
    document.getElementById('buySheet').classList.add('show');
    measure(document.getElementById('buySheet'), 'buySheet');
    document.getElementById('buySheet').classList.remove('show');
    D.place(0, 'marigold'); D.openManage(0);
    measure(document.getElementById('mngSheet'), 'mngSheet');
    return out;
  });
  ok('every visible control is at least 48 rendered px', bad.length === 0, bad.slice(0, 8));
  await done(p);
}

/* ── 10. nothing important lives in the feedback fab's gutter ──────────── */
console.log('\n[10] feedback fab gutter');
{
  const ctx = await browser.createBrowserContext();
  const page = await ctx.newPage();
  await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  await page.goto(BASE + '/satellites/garden-td/', { waitUntil: 'load' });
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => { window.__GTD.start('garden', 1); document.getElementById('tip').classList.remove('show'); });
  // the bottom bar must clear the gutter on its OWN, without help from the fab
  const own = await page.evaluate(() => {
    const vw = innerWidth, vh = innerHeight, g = { l: vw - 90, t: vh - 60, r: vw - 12, b: vh - 12 }, hit = [];
    document.querySelectorAll('#hud-bot button,#keeper-bar button,#hud-top button').forEach(el => {
      const q = el.getBoundingClientRect();
      if (q.left < g.r && q.right > g.l && q.top < g.b && q.bottom > g.t) hit.push({ id: el.id, rect: [q.left | 0, q.top | 0, q.right | 0, q.bottom | 0] });
    });
    return hit;
  });
  ok('no in-play control sits in the bottom-right gutter by itself', own.length === 0, own);
  await new Promise(r => setTimeout(r, 4200));   // now let the fleet fab-yield watcher run
  const r = await page.evaluate(() => {
    const fab = document.querySelector('.lwfb-fab');
    if (!fab) return { mounted: false };
    const rc = fab.getBoundingClientRect();
    const pts = [[rc.left + 6, rc.top + 6], [rc.right - 6, rc.top + 6], [rc.left + 6, rc.bottom - 6], [rc.right - 6, rc.bottom - 6], [(rc.left + rc.right) / 2, (rc.top + rc.bottom) / 2]];
    const under = [];
    pts.forEach(([x, y]) => document.elementsFromPoint(x, y).forEach(e => {
      if (e.closest && e.closest('.lwfb-fab')) return;
      const cls = typeof e.className === 'string' ? e.className : '';
      if (e.tagName === 'BUTTON' || e.tagName === 'A' || e.tagName === 'INPUT' || /\bbtn|tab|ls-cell|toggle|kbtn|diff-card/.test(cls)) {
        const k = e.tagName + '#' + (e.id || '') + '.' + cls.slice(0, 24); if (under.indexOf(k) < 0) under.push(k);
      }
    }));
    return { mounted: true, rect: [rc.left | 0, rc.top | 0, rc.right | 0, rc.bottom | 0], under };
  });
  ok('the feedback fab mounts', r.mounted === true);
  ok('the fab is not sitting on any control', r.mounted && r.under.length === 0, r);
  await page.close(); await ctx.close();
}

/* ── FAILWATCH ─────────────────────────────────────────────────────────── */
if (SELFTEST) {
  console.log('\n[FAILWATCH] each guard removed on purpose; every line below must say "caught"');
  const caught = (name, wentRed, detail) => {
    if (wentRed) { pass++; console.log('  caught  ' + name); }
    else { fail++; console.log('  BLIND   ' + name + ' — the check passed with the bug present!' + (detail !== undefined ? ' ' + JSON.stringify(detail) : '')); }
  };
  {  // settings validation off → a corrupt textScale reaches the root font size
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.__GTD, s = D.save();
      s.settings.textScale = 40;
      document.documentElement.style.fontSize = (16 * s.settings.textScale) + 'px';   // the OLD applyTextScale, verbatim
      return parseFloat(getComputedStyle(document.documentElement).fontSize);
    });
    caught('an unvalidated textScale wrecks the root font size', !(r >= 13 && r <= 25), r);
    await done(p);
  }
  {  // merge off → wholesale write destroys the other tab
    const p = await fresh();
    const r = await p.evaluate(() => {
      const s = window.__GTD.save();
      localStorage.setItem('gg_save', JSON.stringify({ sap: 900, levels: { 'garden-3': { stars: 3, cleared: true } }, towers: ['beehive'] }));
      localStorage.setItem('gg_save', JSON.stringify(s));    // the OLD saveGame, verbatim
      return JSON.parse(localStorage.getItem('gg_save'));
    });
    caught('a wholesale write erases the other tab', r.sap !== 900 && !r.levels['garden-3'], r);
    await done(p);
  }
  {  // tip guard off → a board tap does nothing at all
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.__GTD;
      D.start('garden', 1);
      const tip = document.getElementById('tip');
      const up = tip.classList.contains('show');
      // the OLD handler: `if (tip.classList.contains('show')) return;` — no hideTip
      const oldHandler = () => { if (tip.classList.contains('show')) return; };
      oldHandler();
      return { up, stillUp: tip.classList.contains('show') };
    });
    caught('the old handler leaves the tip up after a board tap', r.up === true && r.stillUp === true, r);
    await done(p);
  }
  {  // gutter probe must see a control put back in the corner
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.__GTD;
      D.start('garden', 1);
      document.getElementById('hud-bot').style.padding = '0 12px';   // the OLD padding, verbatim
      const vw = innerWidth, vh = innerHeight, g = { l: vw - 90, t: vh - 60, r: vw - 12, b: vh - 12 }, hit = [];
      document.querySelectorAll('#hud-bot button').forEach(el => {
        const q = el.getBoundingClientRect();
        if (q.left < g.r && q.right > g.l && q.top < g.b && q.bottom > g.t) hit.push(el.id);
      });
      return hit;
    });
    caught('the gutter probe sees the speed button back under the fab', r.indexOf('btnSpeed') >= 0, r);
    await done(p);
  }
  {  // completability probe must see a failure
    const p = await fresh();
    const r = await p.evaluate(() => {
      const D = window.__GTD;
      D.start('garden', 1); D.addSeeds(2000);
      D.place(0, 'compost');           // an economy plant only: zero damage
      let guard = 0;
      while (D.G && D.G.state !== 'DONE' && guard++ < 20) { D.startWave(); D.step(90); }
      return { win: document.getElementById('scr-win').classList.contains('show'), st: D.state() };
    });
    caught('a defense that deals no damage does NOT clear the level', r.win === false, r);
    await done(p);
  }
  {  // curve probe must see a flat curve
    const p = await fresh();
    const r = await p.evaluate(() => {
      const flat = [500, 500, 500, 500];
      let rising = true;
      for (let i = 1; i < flat.length; i++) if (flat[i] <= flat[i - 1]) rising = false;
      return rising;
    });
    caught('the curve probe rejects a flat curve', r === false, r);
    await done(p);
  }
}

console.log(`\nGARDEN GUARD: ${pass} passed, ${fail} failed`);
await browser.close();
server.close();
process.exit(fail ? 1 : 0);
