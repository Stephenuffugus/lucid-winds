#!/usr/bin/env node
/* PETAL PLUNGE — headless assertion suite (2026-08-16 audit pass).
 *
 *   node satellites/petal-plunge/audit.mjs              run the suite
 *   node satellites/petal-plunge/audit.mjs --selftest   break each check first
 *
 * A probe you have never watched go RED is decoration. Every check ships with a
 * `break` mutation injected into the live page; the run fails if a mutated check
 * still passes. Serves the REPO ROOT because the page pulls /sunbeam-sdk.js and
 * /feedback.js from the origin root.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const URLPATH = '/satellites/petal-plunge/index.html';
const SELFTEST = process.argv.includes('--selftest');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };

function serve() {
  return new Promise((res) => {
    const s = http.createServer((req, rq) => {
      const u = decodeURIComponent(req.url.split('?')[0]);
      const f = path.join(ROOT, u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rq.writeHead(404); rq.end('nope'); return; }
      rq.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' });
      fs.createReadStream(f).pipe(rq);
    });
    s.listen(0, '127.0.0.1', () => res(s));
  });
}

const CHECKS = [

{ name: 'boots to the title with a working exit affordance',
  async run(page) {
    const r = await page.evaluate(() => ({
      title: !document.getElementById('scrTitle').classList.contains('hidden'),
      play: !!document.getElementById('tPlay'),
      exitBtn: !!document.getElementById('exitLink'),
      exitFn: typeof window.SWS_EXIT === 'function'
    }));
    return { ok: r.title && r.play && r.exitBtn && r.exitFn, detail: JSON.stringify(r) };
  },
  break: `document.getElementById('exitLink').remove();` },

{ name: 'exit does NOT gate on being framed (standing class 1)',
  async run(page) {
    const framedFlag = await page.evaluate(() => window.SWS_EMBED);
    let target = null;
    await page.setRequestInterception(true);
    const onReq = (rq) => {
      if (rq.isNavigationRequest() && rq.frame() === page.mainFrame() && rq.url().indexOf('/satellites/petal-plunge') < 0) { target = rq.url(); rq.abort().catch(() => {}); }
      else rq.continue().catch(() => {});
    };
    page.on('request', onReq);
    await page.evaluate(() => { try { document.getElementById('exitLink').click(); } catch (e) {} });
    await new Promise(r => setTimeout(r, 400));
    page.off('request', onReq); await page.setRequestInterception(false);
    return { ok: framedFlag === false && !!target && /\/portal\/?$/.test(target), detail: `SWS_EMBED=${framedFlag} unframed exit went to ${target}` };
  },
  break: `window.SWS_EXIT=function(){ if(!/[?&]embed=1/.test(location.search)) return; };` },

{ name: 'framed: {sws:ready} lands at parse AND on load, exit posts {sws:close}',
  async run(page) {
    const base = page.url().replace(URLPATH, '');
    const harness = await page.browser().newPage();
    await harness.goto(base + '/satellites/petal-plunge/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await harness.setContent(`<body><script>window.MSGS=[];addEventListener('message',e=>{if(e.data&&e.data.sws)MSGS.push(e.data.sws);});</` + `script>
      <iframe id="f" src="${base}${URLPATH}" style="width:390px;height:844px"></iframe></body>`);
    await new Promise(r => setTimeout(r, 1500));
    const ready = await harness.evaluate(() => window.MSGS.filter(m => m === 'ready').length);
    await harness.evaluate(() => { const w = document.getElementById('f').contentWindow; w.SWS_EXIT(); });
    await new Promise(r => setTimeout(r, 300));
    const closed = await harness.evaluate(() => window.MSGS.filter(m => m === 'close').length);
    await harness.close();
    return { ok: ready >= 2 && closed === 1, detail: `ready x${ready} (want >=2: parse + load), close x${closed}` };
  },
  break: null },

{ name: 'corrupt save that PARSES does not blank the page (standing class 3)',
  // carries its own proof: refuses to pass unless the OLD loader really dies on
  // these blobs, so the check can never be vacuously green.
  async run(page) {
    const poisons = ['{"records":null}', '{"owned":null}', '{"ms":null}', '{"equip":null}', '{"stats":null}',
                     '{"coins":"lots"}', '{"daily":7}', '[]', 'null', '{"equip":{"rider":"nonexistent"}}'];
    const lethal = await page.evaluate((poisons) => {
      const DEF = { coins: 0, owned: { rider: { sprout: 1 } }, equip: { rider: 'sprout' }, records: { free: 0 },
                    daily: { date: '', best: 0, streak: 0 }, stats: { runs: 0 }, ms: {}, set: { sound: 1 }, seenTut: 0 };
      const clone = o => JSON.parse(JSON.stringify(o));
      function merge(b, e) { for (const k in e) { if (e[k] && typeof e[k] === 'object' && !Array.isArray(e[k]) && b[k] && typeof b[k] === 'object') merge(b[k], e[k]); else b[k] = e[k]; } return b; }
      const dies = [];
      for (const p of poisons) {
        let P; try { P = merge(clone(DEF), JSON.parse(p)); } catch (e) { dies.push(p); continue; }
        try { const _ = P.records.free; P.owned.rider.x = 1; P.ms.y = 1; const __ = P.equip.rider.length; P.stats.runs++; P.coins += 5; }
        catch (e) { dies.push(p); continue; }
        if (typeof P.coins !== 'number' || !isFinite(P.coins)) dies.push(p);
      }
      return dies;
    }, poisons);
    if (lethal.length < 5) return { ok: false, detail: `poisons are not poisonous (${lethal.length}/${poisons.length} kill the old loader) so this check proves nothing` };

    const bad = [];
    for (const p of poisons) {
      await page.evaluate((v) => localStorage.setItem('pp_profile_v1', v), p);
      await page.reload({ waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(async () => {
        if (!window.PP) return { boot: false };
        try {
          document.getElementById('tPlay').click();
          if (document.getElementById('tutGo')) document.getElementById('tutGo').click();
          window.PP.startRun('free');
          for (let i = 0; i < 900; i++) window.PP.step(1 / 60);
          const S = window.PP.S, P = window.PP.profile();
          // exercise every path a bad branch used to kill: shop, milestone, bank
          document.getElementById('oModes') || 0;
          window.PP.endRun(false);
          const okCoins = typeof P.coins === 'number' && isFinite(P.coins);
          return { boot: true, depth: Math.floor(S.depth), okCoins, banked: typeof S._earnedCoins === 'number' };
        } catch (e) { return { boot: true, err: e.message }; }
      });
      if (!r.boot || r.err || !(r.depth > 200) || !r.okCoins || !r.banked) bad.push({ p, ...r });
    }
    // and the Shop, which is where a null `owned` used to throw
    await page.evaluate(() => localStorage.setItem('pp_profile_v1', '{"owned":null,"ms":null}'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    const shop = await page.evaluate(() => { try { document.getElementById('tShop').click(); return document.querySelectorAll('#sGrid .item').length; } catch (e) { return -1; } });
    if (shop <= 0) bad.push({ p: 'shop with null owned', shop });
    await page.evaluate(() => localStorage.removeItem('pp_profile_v1'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    return { ok: bad.length === 0, detail: bad.length ? JSON.stringify(bad[0]) : `${lethal.length}/${poisons.length} kill the OLD loader, all survive the new one (shop rendered ${shop} items)` };
  },
  break: null },

{ name: 'save merges instead of clobbering a second tab (standing class 4)',
  async run(page) {
    const r = await page.evaluate(() => {
      const K = 'pp_profile_v1';
      const P = window.PP.profile();
      const before = P.coins;
      P.coins = before + 40; P.stats.runs += 1;                 // this tab played a run
      const other = window.PP.validateProfile(JSON.parse(localStorage.getItem(K) || 'null'));
      other.coins = before + 500; other.records.free = 9999; other.owned.rider.foxkit = 1; other.ms.night1 = 1;
      other.stats.runs = (other.stats.runs || 0) + 7;
      localStorage.setItem(K, JSON.stringify(other));           // the OTHER tab saved while we played
      window.PP.saveProfile(true);
      const d = window.PP.validateProfile(JSON.parse(localStorage.getItem(K)));
      return { coins: d.coins, wantCoins: before + 540, best: d.records.free, owned: !!d.owned.rider.foxkit, ms: !!d.ms.night1, runs: d.stats.runs };
    });
    return { ok: r.coins === r.wantCoins && r.best === 9999 && r.owned && r.ms && r.runs >= 8, detail: JSON.stringify(r) };
  },
  break: `window.PP.saveProfile=function(){ localStorage.setItem('pp_profile_v1', JSON.stringify(window.PP.profile())); };` },

{ name: 'the safe-lane guarantee is real: the corridor is geometrically clear',
  async run(page) {
    // The source comment claims "every slope is provably passable". A bot can
    // only ever disprove that badly (a crash might be the bot's steering), so
    // measure the GENERATOR directly: for every obstacle it places, how far is
    // it from the lane centre line at its own depth, versus the distance at
    // which it would actually hit a rider sitting exactly on that line?
    const r = await page.evaluate(() => {
      const out = [];
      for (const mode of ['free', 'slalom', 'freestyle', 'daily']) {
        for (let seed = 0; seed < 8; seed++) {
          window.PP.startRun(mode);
          const S = window.PP.S;
          S.rng = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(seed * 104729 + 17);
          S.obs.length = 0; S.laneHist.length = 0; S.genY = 0; S.laneC = 0; S.laneTarget = 0;
          window.PP.generateUntil(20000);
          const R = window.PP.CFG.playerR;
          let worst = 1e9, worstAt = null;
          for (const o of S.obs) {
            if (o.type === 'ramp') continue;                 // ramps are a launch, not a crash
            let L = null;
            for (const h of S.laneHist) { if (o.y >= h.y0 && o.y < h.y1) { L = h; break; } }
            if (!L) continue;
            const hitAt = (o.r + R) * 0.906;                 // collide() uses d2 < rs*rs*0.82
            const clear = Math.abs(o.x - L.c) - hitAt;
            if (clear < worst) { worst = clear; worstAt = { mode, seed, y: Math.round(o.y), kind: o.kind, clear: Math.round(clear) }; }
          }
          out.push({ mode, seed, obstacles: S.obs.length, worst: Math.round(worst), worstAt });
        }
      }
      const w = out.reduce((a, b) => (b.worst < a.worst ? b : a));
      return { runs: out.length, minClear: w.worst, where: w.worstAt, totalObs: out.reduce((a, b) => a + b.obstacles, 0) };
    });
    return { ok: r.minClear > 0,
      detail: r.minClear > 0
        ? `${r.totalObs} obstacles over ${r.runs} slopes, tightest gap between the lane centre and a hitbox is ${r.minClear}px`
        : `CORRIDOR IS NOT CLEAR: ${JSON.stringify(r.where)}` };
  },
  break: `window.PP.CFG.playerR=140;` },

{ name: 'a lane follower survives a long descent (playability, not proof)',
  async run(page) {
    const r = await page.evaluate(() => {
      const out = [];
      for (const mode of ['free', 'daily']) {
        for (let seed = 0; seed < 6; seed++) {
          window.PP.startRun(mode);
          const S = window.PP.S;
          S.rng = (function (a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; })(seed * 104729 + 1);
          let guard = 0;
          while (S.depth < 8000 && !S.over && guard++ < 40000) {
            const L = window.PP.laneAt(S.depth + 30) || window.PP.laneAt(S.depth);
            const dx = (L ? L.c : 0) - S.x;
            window.PP.setInput(Math.abs(dx) < 4 ? 0 : (dx < 0 ? -1 : 1), false);
            window.PP.step(1 / 60);
          }
          out.push({ mode, seed, depth: Math.floor(S.depth), crashes: S.crashes });
        }
      }
      return { out, total: out.reduce((a, b) => a + b.crashes, 0), runs: out.length };
    });
    // A crude bang-bang driver is not a good player, so the bar is "survives",
    // not "perfect": no run may be crash-heavy and the fleet average must stay
    // under one crash per 4000 depth.
    const heavy = r.out.filter(x => x.crashes > 3);
    const rate = r.total / (r.runs * 8000 / 4000);
    return { ok: heavy.length === 0 && rate < 1,
      detail: `${r.runs} runs to 8000 depth, ${r.total} crashes total (${rate.toFixed(2)} per 4000 depth)` };
  },
  break: `window.PP.CFG.turnRate=0.05; window.PP.CFG.maxAng=0.02;` },

{ name: 'style is not a tap race: mashing beats a clean rhythm by <25%',
  async run(page) {
    const r = await page.evaluate(() => {
      const run = (mash) => {
        window.PP.startRun('freestyle');
        const S = window.PP.S;
        let style0 = 0, jumps = 0;
        for (let i = 0; i < 6000 && !S.over; i++) {
          if (S.airborne) {
            if (mash) { for (let k = 0; k < 6; k++) window.PP.trick(); }        // mash every frame
            else if (i % 14 === 0) window.PP.trick();                            // ~4 spins a second
          }
          const wasAir = S.airborne;
          window.PP.step(1 / 60);
          if (!wasAir && S.airborne) jumps++;
        }
        return { style: S.style, jumps };
      };
      const clean = run(false), mashed = run(true);
      return { clean: clean.style, mashed: mashed.style, jumps: clean.jumps,
               ratio: +(mashed.style / Math.max(1, clean.style)).toFixed(2) };
    });
    return { ok: r.ratio < 1.25 && r.clean > 0, detail: `clean ${r.clean}, mashed ${r.mashed} (${r.ratio}x) over ${r.jumps} jumps` };
  },
  break: `window.PP.trick=(function(){ const S=()=>window.PP.S; return function(){ if(S().airborne){ S().trickCount++; S().spin+=1; } }; })();` },

{ name: 'the Gnome is a real chase, not a timer',
  async run(page) {
    // carving must LOSE ground and tucking must GAIN it, and a straight line
    // must survive. If the gap moved on a clock this would not separate.
    const r = await page.evaluate(() => {
      const probe = (steer, tuck) => {
        window.PP.startRun('free');
        const S = window.PP.S;
        S.depth = window.PP.CFG.gnomeStart + 10;
        window.PP.step(1 / 60);
        const g0 = S.gnomeGap;
        for (let i = 0; i < 600 && !S.over; i++) {
          S.obs.length = 0;                      // measure the CHASE, not the crash tax
          window.PP.setInput(steer, tuck); window.PP.step(1 / 60);
        }
        return { d: +(S.gnomeGap - g0).toFixed(0), crashes: S.crashes };
      };
      const c = probe(1, false), st = probe(0, false), tk = probe(0, true);
      return { carve: c.d, straight: st.d, tuck: tk.d, crashes: c.crashes + st.crashes + tk.crashes };
    });
    return { ok: r.carve < 0 && r.tuck > 0 && r.straight > 0 && r.tuck > r.straight && r.straight > r.carve && r.crashes === 0,
      detail: `gap change over 10s on a clear slope: carving ${r.carve}, straight ${r.straight}, tucking ${r.tuck}` };
  },
  break: `window.PP.CFG.gnomeBaseK=0;` },

{ name: 'Reduced motion actually reduces motion (standing class 5)',
  async run(page) {
    const r = await page.evaluate(() => {
      const parts = (reduced) => {
        window.PP.profile().set.reduced = reduced ? 1 : 0;
        window.PP.startRun('free');
        const S = window.PP.S;
        let peak = 0;
        for (let i = 0; i < 900; i++) { window.PP.setInput(i % 120 < 60 ? 1 : -1, false); window.PP.step(1 / 60); if (S.part.length > peak) peak = S.part.length; }
        return peak;
      };
      const on = parts(true), off = parts(false);
      window.PP.profile().set.reduced = 0;
      return { on, off };
    });
    return { ok: r.on < r.off * 0.5, detail: `peak particles: reduced ${r.on} vs normal ${r.off}` };
  },
  break: `window.PP.profile().set.reduced=0; Object.defineProperty(window.PP.profile().set,'reduced',{get(){return 0;},set(){}});` },

{ name: 'every run terminates: no descent can stall',
  async run(page) {
    const r = await page.evaluate(() => {
      const out = [];
      for (const mode of ['free', 'slalom', 'freestyle', 'daily']) {
        window.PP.startRun(mode);
        const S = window.PP.S;
        let last = S.depth, stalled = 0;
        for (let i = 0; i < 12000 && !S.over && !S.finished; i++) {
          window.PP.setInput(i % 90 < 45 ? -1 : 1, false);      // worst case: carve constantly
          window.PP.step(1 / 60);
          if (S.depth - last < 0.05) stalled++; else stalled = 0;
          last = S.depth;
          if (stalled > 120) break;
        }
        out.push({ mode, depth: Math.floor(S.depth), stalledFrames: stalled, over: !!S.over, finished: !!S.finished });
      }
      return out;
    });
    const bad = r.filter(x => x.stalledFrames > 120);
    return { ok: bad.length === 0, detail: bad.length ? JSON.stringify(bad) : r.map(x => `${x.mode}:${x.depth}`).join(' ') };
  },
  break: `window.PP.CFG.baseSpeed=0;` },

{ name: 'no dashes in player copy (standing class 7)',
  async run(page) {
    const r = await page.evaluate(async () => {
      const hits = [];
      const walk = () => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) {
          const p = n.parentElement; if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE') continue;
          const t = n.nodeValue; if (/[–—]/.test(t) || /\s-\s/.test(t)) hits.push(t.trim().slice(0, 70));
        }
      };
      const ids = ['tShop', 'tDaily', 'tHow', 'tSet'];
      walk();
      for (const id of ids) { const b = document.getElementById(id); if (b) { b.click(); await new Promise(r => setTimeout(r, 60)); walk(); } }
      // and the results screen, where fmtTime's placeholder used to live
      window.PP.startRun('slalom'); for (let i = 0; i < 200; i++) window.PP.step(1 / 60);
      window.PP.endRun(true); await new Promise(r => setTimeout(r, 900)); walk();
      return [...new Set(hits)];
    });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 3)) : 'clean across title, shop, daily, how, settings and results' };
  },
  break: `document.querySelector('.tag').textContent='Ride a leaf down the wild garden — and outrun the Gnome.';` },

{ name: 'touch targets are 48px rendered at 375x667 (standing class 6)',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(async () => {
      const small = [], seen = new Set();
      const visit = async (fn) => { try { fn(); } catch (e) {} await new Promise(r => setTimeout(r, 80)); scan(); };
      const scan = () => {
        for (const el of document.querySelectorAll('button, .mode, .tab, .item, .sw, .ctl')) {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || !el.offsetParent) continue;
          const r0 = el.getBoundingClientRect(); if (!r0.width || !r0.height) continue;
          let w = r0.width, h = r0.height;
          const bf = getComputedStyle(el, '::before');
          if (bf && bf.content !== 'none' && bf.position === 'absolute') { const i = parseFloat(bf.top); if (!isNaN(i) && i < 0) { w += -i * 2; h += -i * 2; } }
          const key = (el.id || el.className) + '|' + Math.round(w) + 'x' + Math.round(h);
          if (seen.has(key)) continue; seen.add(key);
          if (w < 47.5 || h < 47.5) small.push({ el: el.id || el.className, w: Math.round(w), h: Math.round(h), txt: (el.textContent || '').trim().slice(0, 16) });
        }
      };
      scan();
      await visit(() => document.getElementById('tHow').click());
      await visit(() => document.getElementById('tutGo').click());       // -> modes
      await visit(() => document.getElementById('mShop').click());
      await visit(() => document.getElementById('sBack').click());
      await visit(() => document.getElementById('mSet').click());
      return small;
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 4)) : 'all >= 48px' };
  },
  break: `var st=document.createElement('style');st.textContent='.btn.sm{min-height:36px!important}';document.head.appendChild(st);` },

{ name: 'nothing important is drawn in the feedback fab gutter (standing class 2/8)',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(() => {
      // the fab's real footprint, from the fleet tracker
      const W = innerWidth, H = innerHeight;
      const fab = { l: W - 90, r: W - 12, t: H - 174, b: H - 96 };
      window.PP.startRun('free');
      const hits = [];
      for (const id of ['ctlR', 'ctlM', 'ctlL', 'hint', 'pauseBtn', 'gnomebar']) {
        const el = document.getElementById(id); if (!el) continue;
        const b = el.getBoundingClientRect();
        if (b.right > fab.l && b.left < fab.r && b.bottom > fab.t && b.top < fab.b)
          hits.push({ id, box: [Math.round(b.left), Math.round(b.top), Math.round(b.right), Math.round(b.bottom)] });
      }
      return { hits, fab };
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return { ok: r.hits.length === 0, detail: r.hits.length ? `UNDER THE FAB: ${JSON.stringify(r.hits)}` : 'HUD clear of the bottom-right gutter' };
  },
  break: `document.getElementById('hint').style.bottom='120px';document.getElementById('hint').classList.remove('hidden');` },
];

async function main() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  let failures = 0, selfFailures = 0, selfRun = 0;

  for (const c of CHECKS) {
    if (SELFTEST && c.break) {
      selfRun++;
      const p = await browser.newPage();
      await p.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
      p.on('pageerror', () => {});
      await p.goto(base + URLPATH, { waitUntil: 'domcontentloaded' });
      await p.evaluate(() => new Promise(r => setTimeout(r, 150)));
      let broke = { ok: true, detail: 'break did not run' };
      try { await p.evaluate(c.break); broke = await c.run(p); } catch (e) { broke = { ok: false, detail: 'threw: ' + e.message }; }
      await p.close();
      if (broke.ok) { selfFailures++; console.log(`  SELFTEST NOT RED  ${c.name}  (${broke.detail})`); }
      else console.log(`  selftest red ok   ${c.name}`);
    }

    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e).slice(0, 140)));
    await page.goto(base + URLPATH, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => new Promise(r => setTimeout(r, 150)));
    let out;
    try { out = await c.run(page); } catch (e) { out = { ok: false, detail: 'threw: ' + e.message }; }
    if (errs.length) out = { ok: false, detail: (out.detail || '') + ' | pageerror: ' + errs[0] };
    await page.close();
    if (!out.ok) failures++;
    console.log(`${out.ok ? 'PASS' : 'FAIL'}  ${c.name}\n      ${out.detail}`);
  }

  await browser.close(); server.close();
  console.log(`\n${CHECKS.length - failures}/${CHECKS.length} passed` + (SELFTEST ? `, ${selfRun - selfFailures}/${selfRun} checks proved they go red` : ''));
  process.exit(failures || selfFailures ? 1 : 0);
}
main();
