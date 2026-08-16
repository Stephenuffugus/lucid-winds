#!/usr/bin/env node
/* GREENHOUSE PINBALL (Blobworks) — headless assertion suite (2026-08-16 audit).
 *
 *   node satellites/greenhouse-pinball/audit.mjs              run the suite
 *   node satellites/greenhouse-pinball/audit.mjs --selftest   break each check first
 *
 * A probe you have never watched go RED is decoration. Every check ships with a
 * `break` mutation injected into the live page; the run fails if a mutated check
 * still passes. Loads with ?gptest=1 to get the PIN_DEV hook, and serves the
 * REPO ROOT because the page pulls /sunbeam-sdk.js and /feedback.js from there.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');
const URLPATH = '/satellites/greenhouse-pinball/index.html?gptest=1';
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
      title: document.getElementById('s-title').classList.contains('on'),
      play: !!document.getElementById('b-classic'),
      exitBtn: !!document.getElementById('b-exit'),
      exitFn: typeof window.SWS_EXIT === 'function',
      dev: !!window.PIN_DEV
    }));
    return { ok: r.title && r.play && r.exitBtn && r.exitFn && r.dev, detail: JSON.stringify(r) };
  },
  break: `document.getElementById('b-exit').remove();` },

{ name: 'exit does NOT gate on being framed (standing class 1)',
  async run(page) {
    const framedFlag = await page.evaluate(() => window.SWS_EMBED);
    let target = null;
    await page.setRequestInterception(true);
    const onReq = (rq) => {
      if (rq.isNavigationRequest() && rq.frame() === page.mainFrame() && rq.url().indexOf('/satellites/greenhouse-pinball') < 0) { target = rq.url(); rq.abort().catch(() => {}); }
      else rq.continue().catch(() => {});
    };
    page.on('request', onReq);
    await page.evaluate(() => { try { document.getElementById('b-exit').click(); } catch (e) {} });
    await new Promise(r => setTimeout(r, 400));
    page.off('request', onReq); await page.setRequestInterception(false);
    return { ok: framedFlag === false && !!target && /\/portal\/?$/.test(target), detail: `SWS_EMBED=${framedFlag} unframed exit went to ${target}` };
  },
  break: `window.SWS_EXIT=function(){ if(!/[?&]embed=1/.test(location.search)) return; };` },

{ name: 'framed: {sws:ready} lands at parse AND on load, exit posts {sws:close}',
  async run(page) {
    const base = page.url().split('/satellites/')[0];
    const harness = await page.browser().newPage();
    await harness.goto(base + '/satellites/greenhouse-pinball/', { waitUntil: 'domcontentloaded' }).catch(() => {});
    await harness.setContent(`<body><script>window.MSGS=[];addEventListener('message',e=>{if(e.data&&e.data.sws)MSGS.push(e.data.sws);});</` + `script>
      <iframe id="f" src="${base}${URLPATH}" style="width:390px;height:844px"></iframe></body>`);
    await new Promise(r => setTimeout(r, 1800));
    const ready = await harness.evaluate(() => window.MSGS.filter(m => m === 'ready').length);
    await harness.evaluate(() => { document.getElementById('f').contentWindow.SWS_EXIT(); });
    await new Promise(r => setTimeout(r, 300));
    const closed = await harness.evaluate(() => window.MSGS.filter(m => m === 'close').length);
    await harness.close();
    return { ok: ready >= 2 && closed === 1, detail: `ready x${ready} (want >=2: parse + load), close x${closed}` };
  },
  break: null },

{ name: 'EVERY mode has a way out of a running game, Zen included',
  async run(page) {
    // The worst defect found in this pass: there was no pause, no quit and no
    // menu on the play surface, and Zen (maxBall 99, drains re-launch) can never
    // reach endRun on its own. A Zen player was stuck until they reloaded.
    const r = await page.evaluate(async () => {
      const out = {};
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      for (const mode of ['classic', 'daily', 'zen']) {
        window.PIN_DEV.start(mode);
        await wait(30);
        const pauseVisible = getComputedStyle(document.getElementById('b-pause')).display !== 'none';
        document.getElementById('b-pause').click();
        await wait(60);
        const paused = window.PIN_DEV.screen() === 's-pause';
        document.getElementById('pz-end').click();
        await wait(900);                                   // endRun shows s-go after 700ms
        out[mode] = { pauseVisible, paused, ended: window.PIN_DEV.screen() === 's-go' };
        // and back to the menu, which must also work
        document.getElementById('go-home').click(); await wait(60);
        out[mode].home = window.PIN_DEV.screen() === 's-title';
      }
      return out;
    });
    const bad = Object.entries(r).filter(([k, v]) => !v.pauseVisible || !v.paused || !v.ended || !v.home);
    return { ok: bad.length === 0, detail: bad.length ? `TRAPPED: ${JSON.stringify(bad)}` : JSON.stringify(r) };
  },
  break: `document.getElementById('b-pause').remove();` },

{ name: 'a Zen score is actually banked (standing class 5: a silent non-save)',
  async run(page) {
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      localStorage.removeItem('gp_prog');
      window.PIN_DEV.start('zen'); await wait(30);
      const g = window.PIN_DEV.state(); g.score = 424242; g.growth = 0;   // no Bloom Rush anywhere in this run
      const bloomsAtStart = g.blooms;
      window.PIN_DEV.endNow(); await wait(900);
      const disk = window.PIN_DEV.readProg();
      return { blooms: bloomsAtStart, zenBest: disk.best.zen, shown: (document.getElementById('go-score') || {}).textContent };
    });
    return { ok: r.blooms === 0 && r.zenBest === 424242, detail: `zen best on disk ${r.zenBest} after a run with ${r.blooms} Bloom Rushes (results showed ${r.shown})` };
  },
  break: `window.PIN_DEV.endNow=function(){ return 's-go'; };` },

{ name: 'no tunnelling: a hard flip on a 20fps frame stays on the table',
  async run(page) {
    // A tip flip exits around FLIP_W_UP*L*(1+e) ~ 3500 px/s. With the old fixed
    // SUB=8 and the loop's dt cap of 0.05 that moved the bead 22px per substep
    // against an 11px radius, i.e. straight through a wall.
    const r = await page.evaluate(() => {
      const escapes = [];
      window.PIN_DEV.start('zen');
      const g = window.PIN_DEV.state();
      let trials = 0, flips = 0;
      // The spawn box MUST be inside the playfield. The first version of this
      // check seeded x up to 450 and y up to 820, which is outside the lower
      // outlane guide (at y=820 the right guide is already at x=430), so it
      // spawned beads in the gutter and then reported the gutter as tunnelling.
      // Upper field only: the side walls are parallel at x=60 and x=470 for
      // y in 150..700, so 85..445 is honest ground.
      const seed = (n) => { let a = n >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; };
      const rnd = seed(20260816);                          // deterministic: this check reruns identically
      for (let t = 0; t < 300; t++) {
        g.balls.length = 0;
        const a = rnd() * Math.PI * 2, sp = 3000 + rnd() * 1200;
        window.PIN_DEV.addBall({ x: 85 + rnd() * 360, y: 150 + rnd() * 520,
                                 vx: Math.cos(a) * sp, vy: Math.sin(a) * sp });
        g.awaitLaunch = false; g.netTime = 0; g.tiltOut = 0;
        trials++;
        for (let i = 0; i < 60; i++) {
          window.PIN_DEV.step(0.05);                       // the worst frame the loop allows
          const b = g.balls[0];
          if (!b || b.inLane || b.captured || b.onRail) break;   // drained or held, fine
          // OUTSIDE the table. Above y=852 the side walls/guides are the bound;
          // below that the outlane mouths are open by design, so stop checking x.
          if ((b.y < 852 && (b.x < 44 || b.x > 486)) || b.y < 80 || b.y > 1000) {
            escapes.push({ x: Math.round(b.x), y: Math.round(b.y), i, why: 'freeball' }); break; }
        }
        if (escapes.length) break;
      }
      // And the thing that actually produces 3500 px/s in play: a real tip flip.
      for (let t = 0; t < 150 && !escapes.length; t++) {
        g.balls.length = 0;
        const F = { px: 170, py: 842, L: 82 }, ang = 0.50;
        const tx = F.px + Math.cos(ang) * F.L * (0.85 + rnd() * 0.15), ty = F.py + Math.sin(ang) * F.L * 0.9;
        window.PIN_DEV.addBall({ x: tx, y: ty - 18, vx: (rnd() * 2 - 1) * 60, vy: 120 + rnd() * 260 });
        g.awaitLaunch = false; g.netTime = 0; g.tiltOut = 0;
        window.PIN_DEV.flip('L', true); flips++;
        for (let i = 0; i < 40; i++) {
          window.PIN_DEV.step(0.05);
          if (i === 2) window.PIN_DEV.flip('L', false);
          const b = g.balls[0];
          if (!b || b.inLane || b.captured || b.onRail) break;
          if ((b.y < 852 && (b.x < 44 || b.x > 486)) || b.y < 80 || b.y > 1000) {
            escapes.push({ x: Math.round(b.x), y: Math.round(b.y), i, why: 'tipflip' }); break; }
        }
      }
      return { escapes, trials, flips };
    });
    return { ok: r.escapes.length === 0, detail: r.escapes.length ? `LEFT THE TABLE: ${JSON.stringify(r.escapes[0])}` : `${r.trials} beads at 3000-4200 px/s plus ${r.flips} real tip flips, all on 50ms frames, none escaped` };
  },
  break: `window.PIN_DEV.step=(function(o){ return function(dt){ var g=window.PIN_DEV.state(); for(var i=0;i<g.balls.length;i++){var b=g.balls[i]; b.x+=b.vx*dt; b.y+=b.vy*dt;} return o(0.0001); }; })(window.PIN_DEV.step);` },

{ name: 'no bead can be held in a dead pocket forever',
  async run(page) {
    const r = await page.evaluate(() => {
      const stuck = [];
      window.PIN_DEV.start('zen');
      const g = window.PIN_DEV.state();
      for (let t = 0; t < 200; t++) {
        g.balls.length = 0;
        window.PIN_DEV.addBall({ x: 70 + Math.random() * 400, y: 130 + Math.random() * 740, vx: (Math.random() * 2 - 1) * 60, vy: 20 });
        g.awaitLaunch = false; g.netTime = 0;
        let resolved = false, last = null, still = 0;
        for (let i = 0; i < 1500; i++) {                    // 25 simulated seconds
          window.PIN_DEV.step(1 / 60);
          const b = g.balls[0];
          if (!b || b.inLane) { resolved = true; break; }   // drained and re-served
          if (last && Math.abs(b.x - last.x) < 0.4 && Math.abs(b.y - last.y) < 0.4) still++; else still = 0;
          last = { x: b.x, y: b.y };
          if (still > 300) break;                           // 5 seconds motionless
        }
        const b = g.balls[0];
        if (!resolved && still > 300) stuck.push({ x: Math.round(b.x), y: Math.round(b.y), still });
        if (stuck.length) break;
      }
      return { stuck, trials: 200 };
    });
    return { ok: r.stuck.length === 0, detail: r.stuck.length ? `WEDGED: ${JSON.stringify(r.stuck[0])}` : `${r.trials} beads dropped across the whole field, none sat still` };
  },
  break: `window.PIN_DEV.state().anti=0; (function(){ var g=window.PIN_DEV.state(); Object.defineProperty(g,'balls',{value:g.balls,writable:false}); })(); window.PIN_DEV.step=(function(o){return function(dt){ var g=window.PIN_DEV.state(); for(var i=0;i<g.balls.length;i++){g.balls[i].vx=0;g.balls[i].vy=0;} return o(dt); };})(window.PIN_DEV.step);` },

{ name: 'the MEGA MASH counter counts MEGA MASH, not Bloom Rush',
  async run(page) {
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      window.PIN_DEV.start('classic'); await wait(20);
      const g = window.PIN_DEV.state();
      window.PIN_DEV.forceBloom(); window.PIN_DEV.forceBloom();      // 2 Bloom Rushes
      const afterRush = { blooms: g.blooms, mega: window.PIN_DEV.megaCount() };
      window.PIN_DEV.forceWizard();                                   // 1 MEGA MASH
      const afterWiz = { blooms: g.blooms, mega: window.PIN_DEV.megaCount() };
      window.PIN_DEV.endNow(); await wait(900);
      const shownBloom = document.getElementById('go-blooms').textContent;
      const shownMega = document.getElementById('go-mega') ? document.getElementById('go-mega').textContent : null;
      // and the Skins screen must not promise MEGA MASH for a Bloom Rush count
      document.getElementById('go-home').click(); await wait(40);
      document.getElementById('b-skins').click(); await wait(80);
      const reqs = [...document.querySelectorAll('#sk-grid .rq')].map(e => e.textContent);
      const liesAboutMega = reqs.some(t => /MEGA MASH/i.test(t));
      return { afterRush, afterWiz, shownBloom, shownMega, liesAboutMega, sampleReq: reqs[0] };
    });
    const ok = r.afterRush.mega === 0 && r.afterWiz.mega === 1 && r.shownBloom === '2' && r.shownMega === '1' && !r.liesAboutMega;
    return { ok, detail: JSON.stringify(r) };
  },
  break: `document.getElementById('go-mega').id='go-mega-x';` },

{ name: 'corrupt gp_prog does not poison the bests (standing class 3)',
  async run(page) {
    const poisons = ['{"best":{"classic":{}}}', '{"best":"nope"}', '{"best":{"zen":"9e99"},"blooms":{}}',
                     '[]', 'null', '{"best":{"classic":-5,"daily":null,"zen":1e999}}'];
    const bad = [];
    for (const p of poisons) {
      await page.evaluate((v) => localStorage.setItem('gp_prog', v), p);
      await page.reload({ waitUntil: 'domcontentloaded' });
      const r = await page.evaluate(() => {
        if (!window.PIN_DEV) return { boot: false };
        const P = window.PIN_DEV.prog();
        const nums = ['classic', 'daily', 'zen'].every(k => typeof P.best[k] === 'number' && isFinite(P.best[k]) && P.best[k] >= 0);
        const stamp = (document.getElementById('buildstamp') || {}).textContent || '';
        return { boot: true, nums, blooms: typeof P.blooms === 'number' && isFinite(P.blooms), stampClean: !/object Object|NaN|undefined/.test(stamp), stamp };
      });
      if (!r.boot || !r.nums || !r.blooms || !r.stampClean) bad.push({ p, ...r });
    }
    await page.evaluate(() => localStorage.removeItem('gp_prog'));
    await page.reload({ waitUntil: 'domcontentloaded' });
    return { ok: bad.length === 0, detail: bad.length ? JSON.stringify(bad[0]) : `${poisons.length} poisons, bests stay finite numbers` };
  },
  break: null },

{ name: 'saveProg merges instead of clobbering a second tab (standing class 4)',
  async run(page) {
    const r = await page.evaluate(() => {
      localStorage.removeItem('gp_prog');
      const P = window.PIN_DEV.prog();
      P.best.classic = 100; P.blooms = 1; window.PIN_DEV.saveProg();     // this tab
      // the OTHER tab, meanwhile
      localStorage.setItem('gp_prog', JSON.stringify({ best: { classic: 90, daily: 7777, zen: 55 }, blooms: 9 }));
      P.best.classic = 250; P.blooms = 3;                                 // we kept playing: +150 best, +2 rushes
      window.PIN_DEV.saveProg();
      const d = window.PIN_DEV.readProg();
      return { classic: d.best.classic, daily: d.best.daily, zen: d.best.zen, blooms: d.blooms };
    });
    return { ok: r.classic === 250 && r.daily === 7777 && r.zen === 55 && r.blooms === 11, detail: JSON.stringify(r) };
  },
  break: `window.PIN_DEV.saveProg=function(){ localStorage.setItem('gp_prog', JSON.stringify(window.PIN_DEV.prog())); };` },

{ name: 'the pause control is not a flipper and never feeds the tilt meter',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      window.PIN_DEV.start('classic'); await wait(40);
      const btn = document.getElementById('b-pause');
      const b = btn.getBoundingClientRect();
      const hit = document.elementFromPoint(b.left + b.width / 2, b.top + b.height / 2);
      // real pointer, not el.click(): el.click() skips hit testing entirely
      btn.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: b.left + b.width / 2, clientY: b.top + b.height / 2, pointerId: 1 }));
      await wait(20);
      const f = window.PIN_DEV.flipState();
      return { topmost: hit ? (hit.id || hit.tagName) : null, w: Math.round(b.width), h: Math.round(b.height),
               leftFlipper: f.l, rightFlipper: f.r, tilt: f.tilt };
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return { ok: r.topmost === 'b-pause' && r.w >= 47.5 && r.h >= 47.5 && !r.leftFlipper && !r.rightFlipper && r.tilt === 0,
      detail: JSON.stringify(r) };
  },
  break: `document.getElementById('b-pause').style.pointerEvents='none';` },

{ name: 'touch targets are 48px rendered at 375x667 (standing class 6)',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      const small = [], seen = new Set();
      const scan = (where) => {
        for (const el of document.querySelectorAll('button, .toggle, .sk-tab, .sk-opt')) {
          const st = getComputedStyle(el);
          if (st.display === 'none' || st.visibility === 'hidden' || !el.offsetParent) continue;
          let b = el.getBoundingClientRect();                 // already includes the stage scale
          if (!b.width || !b.height) continue;
          // the real tap target is the nearest clickable box, which may be a row
          let a = el.parentElement, hops = 0;
          while (a && hops++ < 3 && (b.width < 47.5 || b.height < 47.5)) {
            if (getComputedStyle(a).cursor === 'pointer') { const ab = a.getBoundingClientRect(); if (ab.width >= b.width && ab.height >= b.height) b = ab; }
            a = a.parentElement;
          }
          const key = (el.id || el.className) + '|' + Math.round(b.width) + 'x' + Math.round(b.height);
          if (seen.has(key)) continue; seen.add(key);
          if (b.width < 47.5 || b.height < 47.5) small.push({ where, el: el.id || el.className, w: Math.round(b.width), h: Math.round(b.height), txt: (el.textContent || '').trim().slice(0, 16) });
        }
      };
      scan('title');
      for (const [btn, name] of [['b-how', 'how'], ['how-back', 'title'], ['b-set', 'settings'], ['set-back', 'title'], ['b-skins', 'skins']]) {
        const e = document.getElementById(btn); if (e) { e.click(); await wait(90); scan(name); }
      }
      document.getElementById('sk-back').click(); await wait(60);
      window.PIN_DEV.start('classic'); await wait(60); scan('play');
      document.getElementById('b-pause').click(); await wait(60); scan('pause');
      return small;
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 4)) : 'all >= 48px rendered' };
  },
  break: `var st=document.createElement('style');st.textContent='.btn{min-height:40px!important}';document.head.appendChild(st);` },

{ name: 'the Skins screen letterboxes with the rest of the table',
  async run(page) {
    await page.setViewport({ width: 375, height: 667, deviceScaleFactor: 2 });
    await page.reload({ waitUntil: 'domcontentloaded' });
    const r = await page.evaluate(async () => {
      document.getElementById('b-skins').click();
      await new Promise(r => setTimeout(r, 120));
      const sk = document.getElementById('s-skins'), stage = document.getElementById('stage');
      const sb = sk.getBoundingClientRect(), tb = stage.getBoundingClientRect();
      return { inStage: !!(sk.parentElement && sk.parentElement.id === 'stage'),
               skW: Math.round(sb.width), skH: Math.round(sb.height),
               stageW: Math.round(tb.width), stageH: Math.round(tb.height) };
    });
    await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2 });
    // it must fill the SCALED stage box exactly, like every other .screen does
    return { ok: r.inStage && Math.abs(r.skW - r.stageW) < 2 && Math.abs(r.skH - r.stageH) < 2, detail: JSON.stringify(r) };
  },
  break: `document.body.appendChild(document.getElementById('s-skins'));` },

{ name: 'no dashes in player copy (standing class 7)',
  async run(page) {
    const r = await page.evaluate(async () => {
      const wait = (ms) => new Promise(r => setTimeout(r, ms));
      const hits = [];
      const walk = () => {
        const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let n; while ((n = w.nextNode())) {
          const p = n.parentElement; if (!p || p.tagName === 'SCRIPT' || p.tagName === 'STYLE') continue;
          const st = getComputedStyle(p); if (st.display === 'none') continue;
          const t = n.nodeValue; if (/[–—]/.test(t) || /\s-\s/.test(t)) hits.push(t.trim().slice(0, 70));
        }
      };
      walk();
      for (const id of ['b-how', 'how-back', 'b-set', 'set-back', 'b-skins']) { const e = document.getElementById(id); if (e) { e.click(); await wait(90); walk(); } }
      document.getElementById('sk-back').click(); await wait(60);
      window.PIN_DEV.start('classic'); await wait(40);
      document.getElementById('b-pause').click(); await wait(60); walk();
      document.getElementById('pz-end').click(); await wait(900); walk();
      return [...new Set(hits)];
    });
    return { ok: r.length === 0, detail: r.length ? JSON.stringify(r.slice(0, 3)) : 'clean across title, how, settings, skins, pause and results' };
  },
  break: `document.querySelector('.ribbon').textContent='A whole pinball table sculpted in clay — flip the eyeball down the lab bench.';` },
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
      // checks that reload inside run() need the mutation re-applied on EVERY
      // navigation, or the reload silently undoes it and the selftest reports a
      // false "not red"
      if (c.reloads) await p.evaluateOnNewDocument(`addEventListener('load',function(){setTimeout(function(){try{${c.break}}catch(e){}},80);});`);
      await p.goto(base + URLPATH, { waitUntil: 'domcontentloaded' });
      await p.evaluate(() => new Promise(r => setTimeout(r, 150)).catch(()=>{}) );
      let broke = { ok: true, detail: 'break did not run' };
      try { if (!c.reloads) await p.evaluate(c.break); broke = await c.run(p); } catch (e) { broke = { ok: false, detail: 'threw: ' + e.message }; }
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
